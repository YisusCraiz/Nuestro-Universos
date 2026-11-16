'use strict';

function paintGolfCourse(ctx, course, world, bounds) {
 const width=ctx.canvas.width,height=ctx.canvas.height;
 const [sky,foliage,green,edge]=world.palette;
 const {left,right,top,bottom}=bounds;
 function box(x,y,w,h,r,fill){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
 }
 function disk(x,y,r,fill){
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
 }
 function path(points,fill){
  ctx.beginPath();for(const [i,[x,y]] of points.entries())i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  ctx.fillStyle=fill;ctx.fill();
 }
 function text(symbol,x,y,color,size){
  ctx.font='bold '+size+'px Georgia';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(symbol,x,y);
 }
 const gradient=ctx.createLinearGradient(0,0,width,height);
 gradient.addColorStop(0,sky);gradient.addColorStop(.52,foliage);gradient.addColorStop(1,sky);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
 for(let i=0;i<210;i++){
  const x=(i*149+37)%width,y=(i*101+22)%height;
  if(x>left-20&&x<right+20&&y>top-23&&y<bottom+22)continue;
  disk(x,y,i%4+1,i%2?edge:'#f8e9d988');
 }
 for(let i=0;i<9;i++){
  const x=87+i*118, y=i%2?632:49;
  if(world.id==='S'){
   box(x-4,y-4,8,38,3,'#653e46');
   for(let j=0;j<5;j++){const t=j*2*Math.PI/5;disk(x+19*Math.cos(t),y+15*Math.sin(t),13,j%2?'#ef93b9':'#f9c1d4');}
   disk(x,y,13,'#f7a8c8');
  }else if(world.id==='N'){
   for(let j=0;j<3;j++)path([[x,y-30+j*11],[x-20-j*4,y+j*10],[x+20+j*4,y+j*10]],j===0?'#e6ffff':'#477d72');
   disk(x,y-31,3,'#fff0b6');
  }else if(world.id==='H'){
   disk(x,y,22,'#2b1d2bcc');
   for(const dx of [-9,9,0])disk(x+dx,y,14,'#d97742');
   box(x-3,y-20,6,9,2,'#8b9c62');
   path([[x-10,y-5],[x-3,y-5],[x-7,y+2]],'#382733');
   path([[x+3,y-5],[x+10,y-5],[x+7,y+2]],'#382733');
  }else{
   disk(x,y,21,'#b3caff20');disk(x,y,13,i%2?'#e29cba':'#a2bdf6');
   if(i%2)disk(x+6,y-4,11,sky);
  }
 }
 const stage=catalog.indexOf(course)%3;
 const center=width/2;
 function line(points,color,size){
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.strokeStyle=color;ctx.lineWidth=size;ctx.lineJoin='round';ctx.stroke();
 }
 function lantern(x,y){
  box(x-2,y-17,4,17,2,'#e5c39b');disk(x,y+5,15,'#ffc67e28');box(x-6,y-4,12,14,3,'#ffcd89');
  line([[x-8,y-5],[x+8,y-5]],'#674756',3);
 }
 function woodenGate(x,y){
  for(const sign of [-1,1])box(x+sign*23-4,y+9,8,43,2,'#c44757');
  line([[x-43,y],[x-24,y+7],[x+24,y+7],[x+43,y]],'#572c46',7);
  line([[x-34,y+14],[x+34,y+14]],'#e17475',5);
  line([[x-33,y+26],[x+33,y+26]],'#b74354',5);
 }
 function house(x,y,body,roof,windows=2){
  box(x-39,y+10,78,34,3,body);
  path([[x-48,y+16],[x-25,y-2],[x+25,y-2],[x+48,y+16]],roof);
  for(let i=0;i<windows;i++){
   const px=x+(i-(windows-1)/2)*20;
   disk(px,y+26,11,'#ffd57a20');box(px-5,y+20,10,12,2,'#ffe3a1');
  }
 }
 function present(x,y,fill){
  box(x-13,y-13,26,21,3,fill);box(x-2,y-15,4,24,1,'#ffe5a0');box(x-14,y-9,28,3,1,'#ffe5a0');
  line([[x-9,y-17],[x-5,y-22],[x,y-15],[x+5,y-22],[x+9,y-17]],'#ffd98c',2);
 }
 line([[44,629],[149,641],[272,617],[384,648],[513,636],[623,614],[765,648],[917,620],[1077,638]],edge+'37',14);
 line([[44,629],[149,641],[272,617],[384,648],[513,636],[623,614],[765,648],[917,620],[1077,638]],edge+'64',2);
 if(world.id==='S'){
  if(stage===0){house(center,18,'#654b5f','#a2637f',3);lantern(center-66,54);lantern(center+66,54);}
  if(stage===1){woodenGate(center-86,15);woodenGate(center,15);woodenGate(center+86,15);}
  if(stage===2){
   box(center-79,28,158,44,19,'#3f637d');
   for(let i=0;i<3;i++)line([[center-64,42+i*7],[center-25,44+i*7],[center+65,42+i*7]],'#aac9ce90',2);
   line([[center-55,57],[center-31,37],[center+31,37],[center+55,57]],'#e4a486',7);
  }
 }else if(world.id==='N'){
  if(stage===0)for(const x of [center-95,center,center+95])house(x,16,'#377267','#d4f4fb',2);
  if(stage===1){house(center,17,'#934d54','#dcf5fb',3);for(let i=0;i<4;i++)present(center+(i%2?-1:1)*(62+i*14),56,i%2?'#bb676c':'#57978c');}
  if(stage===2){
   for(let i=0;i<5;i++){
    ctx.beginPath();ctx.moveTo(center-240,64+i*3);ctx.bezierCurveTo(center-102,-29+i*5,center+92,83-i*6,center+225,18+i*5);
    ctx.strokeStyle=['#8df4d03c','#c0dcfa60','#a6a3f960','#8ce1cf65','#e6fff150'][i];ctx.lineWidth=8;ctx.stroke();
   }
  }
 }else if(world.id==='H'){
  if(stage===0)for(const x of [center-50,center,center+50]){disk(x,46,24,'#ffc27133');box(x-3,17,6,13,2,'#9d9872');for(const dx of [-10,10,0])disk(x+dx,46,14,'#ed843e');line([[x-8,51],[x,55],[x+8,51]],'#482d39',3);}
  if(stage===1){
   house(center,15,'#443047','#2a2439',3);
   for(const x of [center-54,center+54]){box(x-10,27,20,40,2,'#3d2d42');path([[x-14,31],[x,11],[x+14,31]],'#302639');box(x-3,39,6,13,2,'#ffc578');}
  }
  if(stage===2){
   for(let i=0;i<8;i++)disk(center-118+i*31,51+(i%2)*6,21,'#92b9ae47');
   for(const x of [center-94,center+94])line([[x-7,69],[x,39],[x+8,61]],'#99a791',3);
   lantern(center,43);
  }
 }else{
  if(stage===0){disk(center,43,32,'#c9d4ff22');disk(center,43,23,'#dce2ff');disk(center+11,34,21,sky);}
  if(stage===1){
   for(let i=0;i<4;i++){
    const x=center-105+i*67,y=31+i*5;
    path([[x-12,y-8],[x+1,y-15],[x+13,y-5],[x+9,y+10],[x-7,y+11]],i%2?'#b3bcdf':'#878cb9');
    line([[x-35,y+20],[x-14,y+7]],'#dde5ff50',3);
   }
  }
  if(stage===2){
   const stars=[[center-101,58],[center-64,25],[center-20,43],[center+18,20],[center+45,45],[center+93,28]];
   line(stars,'#d4b5ffae',2);for(const [x,y] of stars){disk(x,y,8,'#d3bcff35');disk(x,y,3,'#fff1cb');}
  }
 }
 box(left-15,top-12,right-left+30,bottom-top+31,19,'#0a192759');
 box(left-10,top-10,right-left+20,bottom-top+20,14,edge);
 const turf=ctx.createLinearGradient(left,top,right,bottom);
 turf.addColorStop(0,green);turf.addColorStop(.7,green);turf.addColorStop(1,foliage);
 box(left,top,right-left,bottom-top,7,turf);
 ctx.save();ctx.beginPath();ctx.roundRect(left,top,right-left,bottom-top,7);ctx.clip();
 for(let x=left;x<right;x+=96)box(x,top,48,bottom-top,0,'#ffffff12');
 for(let i=0;i<1650;i++){
  const x=left+(i*137+7)%(right-left),y=top+(i*83+11)%(bottom-top);
  disk(x,y,.7,i%2?'#ffffff2b':'#112e382a');
 }
 ctx.restore();
 function surface(zone,fill,line,background){
  const [x,y,w,h]=zone;
  box(x-3,y-3,w+6,h+6,12,background);
  box(x,y,w,h,9,fill);
  for(let i=0;i<27;i++){
   const px=x+10+(i*31)%(w-22),py=y+10+(i*17)%(h-20);
   box(px,py,i%3===0?11:3,1.5,1,line);
  }
 }
 for(const zone of course.sand)surface(zone,'#e4be80','#b58459','#916c49');
 for(const zone of course.ice)surface(zone,'#a1d8e7','#e8fbff','#578baf');
 for(const zone of course.water){
  surface(zone,world.id==='H'?'#364e51':'#366388','#7cbfd0','#1b3d55');
  if(world.id==='S'){
   const [x,y,w,h]=zone;
   for(let i=0;i<4;i++){
    const px=x+21+(i*43)%(w-42),py=y+17+(i*29)%(h-34);
    ctx.save();ctx.translate(px,py);ctx.rotate(-.28+i*.38);
    path([[-9,0],[-15,-4],[-15,4]],'#ffc88c');
    ctx.beginPath();ctx.ellipse(0,0,10,4,0,0,Math.PI*2);ctx.fillStyle=i%2?'#fbaf7d':'#f8e0b0';ctx.fill();
    disk(3,0,2.5,'#e47540');ctx.restore();
   }
  }
 }
 for(const [x,y,w,h] of course.walls){
  box(x+5,y+8,w,h,6,'#1a27336f');
  box(x,y,w,h,6,edge);
  box(x+4,y+4,w-8,h-8,4,foliage);
  if(h>w)for(let row=y+15;row<y+h-9;row+=26)box(x+5,row,w-10,2,1,edge+'88');
  else for(let col=x+15;col<x+w-9;col+=26)box(col,y+5,2,h-10,1,edge+'88');
 }
 for(const [x,y,r] of course.bumpers){
  disk(x+5,y+7,r,'#1220326c');disk(x,y,r,edge);disk(x,y,r-5,foliage);
  disk(x-5,y-6,r*.42,'#ffffff21');text(world.icon,x,y+8,edge,24);
 }
 const [sx,sy]=course.start,[hx,hy]=course.cup;
 disk(sx,sy,30,'#fff6bd3d');disk(sx,sy,23,'#fff6bd34');
 disk(hx,hy,27,'#fcf2c656');disk(hx,hy,17,'#203340');disk(hx,hy,13,'#0e1522');
 box(hx-1,hy-67,3,61,1,'#fff6df');
 path([[hx,hy-68],[hx+39,hy-56],[hx,hy-44]],'#ffdfa3');
 text('J×J',width/2,height-30,edge,27);
}
