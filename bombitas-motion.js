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
 // Replay only unacknowledged movement. No predicted bomb, collision result or winner
 // is sent to the host; its next snapshot always supplies the real board.
 function predictor(engine=BombitasEngine){let view=null,pending=[],received=0,base=0;
  const clone=s=>({...s,players:s.players.map(p=>({...p})),items:{...s.items}});
  return {reset(){view=null;pending=[];},receive(s,ack,now){
   received=now;base=s.time;view=clone(s);pending=pending.filter(c=>c.seq>ack&&now-c.at<500);
   for(const cmd of pending){view.time=Math.max(view.time,cmd.time);engine.input(view,cmd.local,cmd.dir,false);}
  },input(s,seq,local,dir,now){if(!view)this.receive(s,-1,now);const time=base+Math.min(250,Math.max(0,now-received));pending.push({seq,local,dir,time,at:now});if(pending.length>24)pending.shift();
   view.time=Math.max(view.time,time);engine.input(view,local,dir,false);
  },sample(s,local,now){if(!view)return s;return {...s,players:s.players.map((p,i)=>i===local&&p.alive?{...p,x:view.players[i].x,y:view.players[i].y}:p)};}};
 }
 return {create,predictor};
})();
if(typeof module!=='undefined')module.exports=BombitasMotion;
