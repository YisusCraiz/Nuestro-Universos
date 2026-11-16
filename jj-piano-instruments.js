'use strict';

const PianoInstruments = (() => {
function draw(canvas,instrument,energy=0,phase=0,lane=0){
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,112,72);
 const box=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
 const oval=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 ctx.save();
 if(instrument==='keys'){
  box(8,23,96,32,'#2b2348');box(8,19,96,8,'#9a82f4');
  for(let i=0;i<12;i++){const lit=energy>.12&&Math.abs(i-(2+lane*2))<=1;box(11+i*7.5,28,6.5,lit?18:21,lit?'#9cf4fa':'#f2edff');if([0,1,3,4,5,7,8,10].includes(i))box(16+i*7.5,28,4,13,'#30264e');}
 }else if(instrument==='drums'){
  box(19,24,3,40,'#d9cceb');box(89,20,3,42,'#d9cceb');
  oval(21,23+Math.sin(phase*32)*energy*4,15,4,energy>.3?'#fff9bc':'#fac46c');oval(90,19-Math.sin(phase*32)*energy*4,15,4,'#fac46c');
  if(energy>.02){ctx.strokeStyle='#fff0ac';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(24,12-energy*7);ctx.lineTo(44,32-energy*6);ctx.moveTo(86,9-energy*7);ctx.lineTo(69,31-energy*6);ctx.stroke();}
  oval(56,53,24,17,'#51418b');oval(56,51,20,15,'#cdbdff');
  oval(42,33,12,7,'#f399cf');oval(72,33,12,7,'#f399cf');
 }else if(instrument==='voice'){
  ctx.translate(56,36-energy*6);ctx.rotate(.55-energy*.26);
  box(-5,-8,10,36,'#7667a0');box(-5,-5,10,5,'#dba0ff');oval(0,-12,9,11,'#eee6ff');box(-7,-15,14,2,'#af9ecb');box(-7,-10,14,2,'#af9ecb');
  if(energy>.02){ctx.globalAlpha=energy;ctx.strokeStyle='#f5baff';ctx.lineWidth=2;for(const r of [13,18,23]){ctx.beginPath();ctx.arc(0,-13,r,-2.5,-.6);ctx.stroke();}}
 }else{
  ctx.translate(56,38);ctx.rotate(-.54-energy*.13);
  oval(-20,0,19,14,'#f1a06e');oval(-6,0,13,10,'#f1a06e');oval(-15,0,6,6,'#51305a');
  box(-8,-4,43,8,'#6b456e');box(30,-6,12,12,'#ffcc92');box(-24,-1,58,2,'#fff1ce');
  if(energy>.02){ctx.strokeStyle='#ffd7aa';ctx.globalAlpha=energy;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,-12);ctx.lineTo(-20,9);ctx.moveTo(-6,-10);ctx.lineTo(-12,9);ctx.stroke();}
 }
 ctx.restore();
}


 const gestures={
  drums:{x:0,y:3,tilt:2,duration:240},
  keys:{x:0,y:2,tilt:-2,duration:260},
  voice:{x:2,y:-3,tilt:3,duration:360},
  guitar:{x:-2,y:-2,tilt:-6,duration:290}
 };
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 function attach(canvas,portrait){
  let instrument='drums',started=0,lane=0,frame=null;
  function stop(){
   if(frame!==null)cancelAnimationFrame(frame);
   frame=null;
   portrait.style.transform='';
   draw(canvas,instrument);
  }
  function paint(now){
   const move=gestures[instrument],phase=Math.max(0,(now-started)/move.duration);
   if(phase>=1||reduced.matches){stop();return;}
   const energy=Math.sin(Math.PI*phase)*(1-phase*.35);
   draw(canvas,instrument,energy,phase,lane);
   portrait.style.transform=`translate(${move.x*energy}px,${move.y*energy}px) rotate(${move.tilt*energy}deg)`;
   frame=requestAnimationFrame(paint);
  }
  return {
   set(next){
    if(Object.hasOwn(gestures,next))instrument=next;
    canvas.dataset.instrument=instrument;
    stop();
   },
   play(hitLane=0){
    if(reduced.matches)return;
    lane=hitLane;
    started=performance.now();
    if(frame===null)frame=requestAnimationFrame(paint);
   },
   stop
  };
 }
 return {attach};
})();
