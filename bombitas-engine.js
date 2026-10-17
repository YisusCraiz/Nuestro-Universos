'use strict';
// One simulation owns both players; renderers never decide collisions or winners.
const BombitasEngine = (() => {
 const W=13,H=11,DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
 function create(random=Math.random){
  const cells=Array.from({length:W*H},(_,i)=>{const x=i%W,y=Math.floor(i/W);return !x||!y||x===W-1||y===H-1||x%2===0&&y%2===0?1:random()<.67?2:0;});
  for(const [x,y] of [[1,1],[2,1],[1,2],[11,9],[10,9],[11,8]])cells[y*W+x]=0;
  return {cells,players:[{x:1,y:1,alive:true,next:0,range:2,max:1,speed:160},{x:11,y:9,alive:true,next:0,range:2,max:1,speed:160}],bombs:[],flames:[],items:{},time:0,over:false,winner:null,seal:0};
 }
 function input(s,id,dir,drop){
  const p=s.players[id];if(s.over||!p?.alive)return;
  if(Number.isInteger(dir)&&dir>=0&&dir<4&&s.time>=p.next){const [dx,dy]=DIRS[dir],x=p.x+dx,y=p.y+dy;
   if(!s.cells[y*W+x]&&!s.bombs.some(b=>b.x===x&&b.y===y)){p.x=x;p.y=y;p.next=s.time+p.speed;const item=s.items[y*W+x];if(item==='range')p.range=Math.min(6,p.range+1);if(item==='bomb')p.max=Math.min(4,p.max+1);if(item==='speed')p.speed=Math.max(100,p.speed-20);delete s.items[y*W+x];}
  }
  if(drop&&!s.bombs.some(b=>b.x===p.x&&b.y===p.y)&&s.bombs.filter(b=>b.owner===id).length<p.max)s.bombs.push({x:p.x,y:p.y,owner:id,range:p.range,at:s.time+2200});
 }
 function tick(s,dt,random=Math.random){
  if(s.over)return;s.time+=Math.min(100,Math.max(0,dt));s.flames=s.flames.filter(f=>f.until>s.time);
  const explode=b=>{s.bombs.splice(s.bombs.indexOf(b),1);const hit=(x,y)=>{const index=y*W+x;s.flames.push({x,y,until:s.time+450});delete s.items[index];for(const other of s.bombs)if(other.x===x&&other.y===y)other.at=s.time;
   if(s.cells[index]===2){s.cells[index]=0;if(random()<.35)s.items[index]=['range','bomb','speed'][Math.floor(random()*3)];return true;}return false;};
   hit(b.x,b.y);for(const [dx,dy] of DIRS)for(let n=1;n<=b.range;n++){const x=b.x+dx*n,y=b.y+dy*n;if(x<0||y<0||x>=W||y>=H||s.cells[y*W+x]===1)break;if(hit(x,y))break;}
  };
  let due;while((due=s.bombs.find(b=>b.at<=s.time)))explode(due);
  // After 90 seconds, concentric walls close every eight seconds.
  const seal=s.time<90000?0:Math.min(5,1+Math.floor((s.time-90000)/8000));
  if(seal>s.seal){s.seal=seal;for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(Math.min(x,y,W-1-x,H-1-y)<=seal)s.cells[y*W+x]=1;}
  for(const p of s.players)if(s.cells[p.y*W+p.x]===1||s.flames.some(f=>f.x===p.x&&f.y===p.y))p.alive=false;
  const alive=s.players.map((p,i)=>p.alive?i:-1).filter(i=>i>=0);if(alive.length<2){s.over=true;s.winner=alive[0]??null;}
 }
 return {W,H,create,input,tick};
})();
if(typeof module!=='undefined')module.exports=BombitasEngine;
