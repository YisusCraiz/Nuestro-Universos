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
 box(left-15,top-12,right-left+30,bottom-top+31,19,'#0a192759');
 box(left-10,top-10,right-left+20,bottom-top+20,14,edge);
 box(left,top,right-left,bottom-top,7,green);
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
 for(const zone of course.water)surface(zone,world.id==='H'?'#364e51':'#366388','#7cbfd0','#1b3d55');
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
