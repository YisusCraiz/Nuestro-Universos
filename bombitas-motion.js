'use strict';
// Visual positions only: collisions, bombs and winners remain host-authoritative.
const BombitasMotion=(()=>{
 function create(){let shown=[],last=0;return {reset(){shown=[];last=0;},sample(model,now,local,dir,predict=false){
  const dt=Math.min(60,Math.max(0,now-last));last=now;
  return model.players.map((p,i)=>{let x=p.x,y=p.y;const old=shown[i];
   if(predict&&i===local&&p.alive&&Number.isInteger(dir)){const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][dir],nx=p.x+dx,ny=p.y+dy;
    if(!model.cells[ny*13+nx]&&!model.bombs.some(b=>b.x===nx&&b.y===ny)){x+=dx*.3;y+=dy*.3;}}
   const snap=!old||!p.alive||Math.abs(old.x-x)+Math.abs(old.y-y)>2;
   const alpha=1-Math.exp(-dt/38);shown[i]=snap?{x,y}:{x:old.x+(x-old.x)*alpha,y:old.y+(y-old.y)*alpha};return shown[i];
  });
 }};}
 return {create};
})();
if(typeof module!=='undefined')module.exports=BombitasMotion;
