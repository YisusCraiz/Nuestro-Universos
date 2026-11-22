'use strict';

const PianoInstruments = (() => {
 function draw(canvas,instrument,energy=0,phase=0,lane=0){
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.scale(canvas.width/112,canvas.height/72);
  const fill=(color)=>{ctx.fillStyle=color;ctx.fill();};
  const gradient=(x,y,x2,y2,...colors)=>{
   const paint=ctx.createLinearGradient(x,y,x2,y2);
   colors.forEach((color,i)=>paint.addColorStop(i/(colors.length-1),color));
   return paint;
  };
  const box=(x,y,w,h,r,color)=>{
   ctx.beginPath();ctx.roundRect(x,y,w,h,r);fill(color);
  };
  const ellipse=(x,y,rx,ry,color,outline)=>{
   ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);fill(color);
   if(outline){ctx.strokeStyle=outline;ctx.lineWidth=1;ctx.stroke();}
  };
  const line=(x,y,x2,y2,color,width=1)=>{
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  };
  ctx.lineCap='round';
  if(instrument==='keys'){
   box(5,19,102,38,6,'#15172f');
   box(5,16,102,38,5,gradient(0,16,0,54,'#9d8be1','#555187','#212344'));
   box(10,19,92,10,3,'#282840');
   box(48,20,18,7,2,'#245b6a');box(51,22,12,2,1,'#9af4de');
   for(const x of [16,22,78,84,90])ellipse(x,23,1.8,1.8,x===16?'#ffd18e':'#988ad3');
   box(10,29,92,22,2,'#11162b');
   for(let i=0;i<12;i++){
    const lit=energy>.1&&Math.abs(i-(2+lane*2))<=1;
    const x=11+i*7.5,y=lit?32:30;
    box(x,y,7,50-y,1,gradient(x,y,x,50,lit?'#b6ffff':'#fff9fa',lit?'#47bbdf':'#c5c3db'));
    if([0,1,3,4,5,7,8,10].includes(i)){
     box(x+5,29,4.5,13,1,gradient(x,29,x,42,'#585371','#131528'));
    }
   }
  }else if(instrument==='drums'){
   const gold=gradient(0,10,0,29,'#fff1ad','#b36d2d','#f4c467');
   const shell=gradient(26,0,87,0,'#201747','#8876ef','#542a72','#231631');
   for(const [x,top] of [[18,19],[94,15]]){
    line(x,top,x,64,'#9ca8cf',2);line(x,53,x-8,65,'#a9b4d4',2);line(x,53,x+8,65,'#a9b4d4',2);
   }
   for(const [x,y,sign] of [[18,19,1],[94,15,-1]]){
    const bounce=Math.sin(phase*35)*energy*4*sign;
    ellipse(x,y+bounce,16,4,gold,'#ae7439');ellipse(x,y+bounce-1,4,1.8,'#fff1b4');
   }
   for(const [x,y] of [[41,28],[70,27]]){
    box(x-13,y,26,16,4,shell);ellipse(x,y+1,13,5,'#dcdcf8','#aaa0d7');
    line(x-10,y+7,x-10,y+14,'#dedaee');line(x+10,y+7,x+10,y+14,'#dedaee');
   }
   ellipse(56,52,23,18,shell,'#b4a8e0');ellipse(56,52,18,14,gradient(40,39,73,62,'#e8ddff','#706bb2'),'#bcb4e5');
   ellipse(63,55,6,5,'#41395f');line(53,65,50,69,'#b6bfd9',2);
   if(energy>.02){
    line(25,10-energy*4,43,28-energy*4,'#ffe2a4',2.5);
    line(85,8-energy*4,68,27-energy*4,'#ffe2a4',2.5);
   }
  }else if(instrument==='voice'){
   ctx.translate(57,37-energy*5);ctx.rotate(.62-energy*.26);
   box(-6,-8,12,36,5,gradient(-6,0,6,0,'#282344','#a29cbc','#50456f'));
   box(-6,-9,12,5,1,'#d69fe5');
   ellipse(0,-14,10.5,12,gradient(-9,-21,8,-9,'#fcf0ff','#8a7dae'),'#e6daeb');
   ctx.save();ctx.beginPath();ctx.ellipse(0,-14,9.5,11,0,0,Math.PI*2);ctx.clip();
   for(let x=-9;x<=9;x+=3)line(x,-26,x,-3,'#706489',.6);
   for(let y=-23;y<=-5;y+=3)line(-11,y,11,y,'#706489',.6);
   ctx.restore();
   box(-2,5,4,8,2,'#28233b');ellipse(0,17,1.4,1.4,'#97f5f0');
   if(energy>.02){
    ctx.globalAlpha=energy;ctx.strokeStyle='#f3c1ff';ctx.lineWidth=2;
    for(const r of [15,20,25]){ctx.beginPath();ctx.arc(0,-14,r,-2.42,-.72);ctx.stroke();}
   }
  }else{
   ctx.translate(53,42);ctx.rotate(-.60-energy*.12);
   ctx.beginPath();
   ctx.moveTo(-2,-7);ctx.bezierCurveTo(-12,-7,-10,-18,-24,-15);
   ctx.bezierCurveTo(-47,-16,-48,16,-24,16);ctx.bezierCurveTo(-12,17,-12,8,-2,7);ctx.closePath();
   fill(gradient(-45,0,-4,0,'#5b2a4b','#ee975f','#fab880','#8b464e'));ctx.strokeStyle='#ffe0a2';ctx.lineWidth=1;ctx.stroke();
   box(-15,-4,51,8,2,gradient(0,-4,0,4,'#a87b88','#4a3248'));
   box(33,-6,12,12,3,'#af745e');
   for(const x of [34,38,42]){ellipse(x,-7,1.5,1.5,'#eddfdc');ellipse(x,7,1.5,1.5,'#eddfdc');}
   for(const x of [-7,0,7,13,18,23,27,31])line(x,-3.5,x,3.5,'#c1a5a1',.7);
   box(-31,-5,4,10,1,'#e8c1a7');box(-23,-5,4,10,1,'#35253c');
   for(const y of [-2.2,-.7,.7,2.2])line(-30,y,42,y,energy>.24?'#fff3cc':'#e0c2ad',.65);
   for(const x of [-32,-26])ellipse(x,8,2,2,'#6e4249');
   if(energy>.02){
    ctx.globalAlpha=energy;
    line(-15,-13+phase*19,-23,3+phase*13,'#fff0bd',2);
    line(-9,-12+phase*18,-16,3+phase*14,'#ffe0a4',1.5);
   }
  }
  ctx.restore();
 }


 const gestures={
  drums:{x:1,y:5,tilt:5,stretch:-.12,duration:310},
  keys:{x:4,y:3,tilt:-5,stretch:-.08,duration:310},
  voice:{x:4,y:-6,tilt:7,stretch:.09,duration:430},
  guitar:{x:-5,y:-3,tilt:-11,stretch:.07,duration:380}
 };
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 function attach(canvas,portrait){
  canvas.width=224;
  canvas.height=144;
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
   const rebound=Math.sin(2*Math.PI*phase)*(1-phase);
   const turn=instrument==='keys'&&lane>1?-1:1;
   const x=turn*move.x*energy;
   const y=move.y*energy-2*rebound;
   const tilt=turn*(move.tilt*energy+2*rebound);
   const stretch=1+move.stretch*energy;
   portrait.style.transform=`translate(${x}px,${y}px) rotate(${tilt}deg) scale(${2-stretch},${stretch})`;
   frame=requestAnimationFrame(paint);
  }
  return {
   set(next){
    if(Object.hasOwn(gestures,next))instrument=next;
    canvas.dataset.instrument=instrument;
    portrait.dataset.pianoPerformance=instrument;
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
