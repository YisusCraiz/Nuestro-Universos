export function mountPong(body, dialog, current, onResult) {
 const width=640, height=360, paddleHeight=78, radius=8, goal=5;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const info=document.createElement('p');
 info.textContent=say('Desliza en la cancha o usa ↑ y ↓. Gana quien llegue a 5 puntos.','Drag on the court or use ↑ and ↓. First to 5 wins.');
 const canvas=document.createElement('canvas');
 canvas.className='yr-pong';
 canvas.width=width;
 canvas.height=height;
 canvas.tabIndex=0;
 canvas.setAttribute('aria-label',say('Cancha de Ping Pong','Ping Pong court'));
 const ctx=canvas.getContext('2d');
 if(!ctx){body.append(say('Este dispositivo no puede dibujar la cancha.','This device cannot draw the court.'));return;}
 const score=document.createElement('p');
 score.className='yr-pong-score';
 score.setAttribute('role','status');
 const start=document.createElement('button');
 start.type='button';
 body.append(info,score,canvas,start);
 let player, opponent, ball, points, target, running=false, frame=0, last=0;
 const keys=new Set();
 function serve(direction){
  ball={x:width/2,y:height/2,vx:direction*280,vy:(Math.random()>.5?1:-1)*115};
 }
 function draw(){
  ctx.fillStyle='#16353c';
  ctx.fillRect(0,0,width,height);
  ctx.strokeStyle='#9ce7cd88';
  ctx.strokeRect(10,10,width-20,height-20);
  ctx.setLineDash([7,9]);
  ctx.beginPath();ctx.moveTo(width/2,10);ctx.lineTo(width/2,height-10);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#ffadc8';ctx.fillRect(22,player,12,paddleHeight);
  ctx.fillStyle='#bca5ff';ctx.fillRect(width-34,opponent,12,paddleHeight);
  ctx.fillStyle='#fff4c1';ctx.beginPath();ctx.arc(ball.x,ball.y,radius,0,Math.PI*2);ctx.fill();
 }
 function announce(extra=''){
  score.textContent=say('Tú','You')+' '+points[0]+' · '+points[1]+' Yuki'+extra;
 }
 function reset(){
  points=[0,0];player=opponent=(height-paddleHeight)/2;target=player;
  serve(Math.random()>.5?1:-1);announce();draw();
 }
 function stop(){
  running=false;cancelAnimationFrame(frame);keys.clear();
 }
 function hit(paddle,direction){
  ball.vx=direction*Math.min(585,Math.abs(ball.vx)+27);
  ball.vy=((ball.y-paddle)/paddleHeight-.5)*420;
 }
 function tick(now){
  if(!running || !dialog.open || !current())return;
  const dt=Math.min((now-last)/1000,.025);last=now;
  const step=(Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp')))*440*dt;
  target=clamp(target+step,0,height-paddleHeight);
  player=target;
  const tracking=ball.vx>0?ball.y-paddleHeight/2+Math.sin(now/560)*35:(height-paddleHeight)/2;
  opponent=clamp(opponent+clamp(tracking-opponent,-230*dt,230*dt),0,height-paddleHeight);
  const oldX=ball.x;
  ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
  if(ball.y<radius || ball.y>height-radius){
   ball.y=clamp(ball.y,radius,height-radius);ball.vy*=-1;
  }
  const touches=paddle=>ball.y+radius>=paddle && ball.y-radius<=paddle+paddleHeight;
  if(ball.vx<0 && oldX>=34+radius && ball.x<34+radius && touches(player)){ball.x=34+radius;hit(player,1);}
  if(ball.vx>0 && oldX<=width-34-radius && ball.x>width-34-radius && touches(opponent)){ball.x=width-34-radius;hit(opponent,-1);}
  if(ball.x < -radius || ball.x > width+radius){
   const winner=ball.x>width?0:1;
   points[winner]++;
   if(points[winner]===goal){
    stop();
    onResult(winner===0);
    announce(winner===0?say(' · ¡Ganaste!',' · You win!'):say(' · Yuki gana',' · Yuki wins'));
    start.textContent=say('Revancha','Rematch');
   }else announce();
   serve(winner===0?-1:1);
  }
  draw();
  if(running)frame=requestAnimationFrame(tick);
 }
 function aim(event){
  const box=canvas.getBoundingClientRect();
  target=clamp((event.clientY-box.top)*height/box.height-paddleHeight/2,0,height-paddleHeight);
 }
 canvas.onpointerdown=event=>{canvas.setPointerCapture(event.pointerId);canvas.focus();aim(event);};
 canvas.onpointermove=event=>{if(event.pointerType==='mouse' || canvas.hasPointerCapture(event.pointerId))aim(event);};
 canvas.onkeydown=event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();keys.add(event.key);}};
 canvas.onkeyup=event=>keys.delete(event.key);
 canvas.onblur=()=>keys.clear();
 start.textContent=say('Jugar','Play');
 start.onclick=()=>{
  if(running){stop();start.textContent=say('Continuar','Resume');return;}
  if(points.includes(goal))reset();
  running=true;last=performance.now();
  start.textContent=say('Pausa','Pause');
  canvas.focus();frame=requestAnimationFrame(tick);
 };
 dialog.addEventListener('close',stop,{once:true});
 reset();
}
