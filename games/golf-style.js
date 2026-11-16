'use strict';

const golfHandles=['jesus','julisa'];
const outfitSets=[
 {ids:['casual','catshirt','sharkshirt','cat','shark','pajamas','ninja','yukata'],file:'characters-v2.png',cols:4,rows:4},
 {ids:['ghost','pumpkin','vampire','skeleton','frankenstein','kitsune','witch','devil','zombie'],file:'halloween-characters-v1.png',cols:6,rows:3}
];
const winterGolfOutfits=['christmas-santa','christmas-reindeer'];
const golfImages=new Map();
const stillGolf=matchMedia('(prefers-reduced-motion: reduce)');
let golfPeople=null, presenceBusy=false, presenceRefresh=false, presenceLabel='';
const presenceId=crypto.randomUUID();

async function syncGolfPeople(){
 if(presenceBusy){presenceRefresh=true;return;}
 if(!golfClient)return;
 presenceBusy=true;
 try{
  const {data:{session}}=await golfClient.auth.getSession();
  if(!session){golfPeople=null;return;}
  const active=!$('game').hidden&&!done&&!document.hidden;
  const {data,error}=await golfClient.rpc('jj_golf_presence',{p_session:presenceId,p_action:active?'ping':'leave'});
  golfPeople=error?null:data;
 }catch{golfPeople=null;}
 finally{
  presenceBusy=false;renderGolfPeople();
  if(presenceRefresh){presenceRefresh=false;syncGolfPeople();}
 }
}
function renderGolfPeople(){
 const label=JSON.stringify([english,...golfHandles.map(handle=>golfPeople?.[handle]?.online)]);
 if(label===presenceLabel)return;
 presenceLabel=label;
 $('golfPeople').replaceChildren(...golfHandles.map((handle,i)=>{
  const p=golfPeople?.[handle];
  const row=document.createElement('span'), dot=document.createElement('i');
  dot.className=p?.online?'golf-online':'';
  dot.setAttribute('aria-hidden','true');
  row.append(dot,names[i]+' · '+(p?p.online?tr('Conectado al golf','Online in golf'):tr('Sin conexión al golf','Offline in golf'):tr('Estado no disponible','Status unavailable')));
  return row;
 }));
}
function golfImage(file){
 if(!golfImages.has(file)){
  const image=new Image();
  image.src='../assets/'+file;golfImages.set(file,image);
 }
 return golfImages.get(file);
}
let originalGolfChibis;
function drawGolfPlayer(ctx,ball,player,time){
 const outfit=golfPeople?.[golfHandles[player]]?.outfit??'casual';
 const x=Math.max(62,Math.min(canvas.width-62,ball.x+(player===0?-43:43)));
 const floor=ball.y<145?ball.y+80:ball.y+9;
 const y=floor+(stillGolf.matches?0:Math.sin(time/430+player)*1.5);
 ctx.save();
 ctx.fillStyle='#13223870';ctx.beginPath();ctx.ellipse(x,y+1,24,7,0,0,Math.PI*2);ctx.fill();
 let painted=false;
 if(outfit==='five-more-minutes'){
  const image=golfImage('bombitas/matching-pajamas-v2-'+golfHandles[player]+'.webp');
  if(image.naturalWidth){const w=75*image.naturalWidth/image.naturalHeight;ctx.drawImage(image,x-w/2,y-75,w,75);painted=true;}
 }else if(winterGolfOutfits.includes(outfit)){
  const image=golfImage('christmas/sprite-'+winterGolfOutfits.indexOf(outfit)+'-'+player+'.webp');
  if(image.naturalWidth){ctx.drawImage(image,x-38,y-76,76,76);painted=true;}
 }else if(outfit!=='casual'){
  const set=outfitSets.find(set=>set.ids.includes(outfit));
  if(set){
   const image=golfImage('bombitas/'+set.file), index=set.ids.indexOf(outfit)*2+player;
   if(image.naturalWidth){
    const w=image.naturalWidth/set.cols,h=image.naturalHeight/set.rows,dw=76*w/h;
    ctx.drawImage(image,index%set.cols*w,Math.floor(index/set.cols)*h,w,h,x-dw/2,y-76,dw,76);painted=true;
   }
  }
 }
 if(!painted){
  if(!originalGolfChibis){
   originalGolfChibis=new Image();
   originalGolfChibis.src=getComputedStyle(document.documentElement).getPropertyValue('--chibi-art').match(/url\(["']?(data:[^"')]+)/)?.[1]??'';
  }
  if(originalGolfChibis.naturalWidth)ctx.drawImage(originalGolfChibis,player===0?16:310,0,240,321,x-28,y-75,56,75);
 }
 ctx.restore();
}

const golfEffects=[
 ['Pétalos','Petals','✿'],['Destellos de hielo','Ice sparkles','❄'],['Chispas fantasma','Ghost sparks','✧'],['Polvo estelar','Stardust','✦']
];
function drawStyledBall(ctx,x,y,r,skin,color,mark,time,velocity){
 const shades=skin?.colors??['#ffffff',color,'#4b577e'];
 const t=stillGolf.matches?0:time/1000;
 ctx.save();
 if(skin?.colors){
  const motif=golfEffects[skin.world][2];
  ctx.fillStyle=shades[0];ctx.textAlign='center';
  for(let i=0;i<4+skin.rarity;i++){
   const angle=t*(.8+skin.rarity*.25)+i*Math.PI*2/(4+skin.rarity);
   const spread=r*(1.5+.25*Math.sin(t*4+i));
   const trail=velocity?(i+1)*.016:0;
   ctx.globalAlpha=.4+.42*(.5+.5*Math.sin(t*4+i));
   ctx.font=Math.round(r*(i%2?.39:.54))+'px Georgia';
   ctx.fillText(motif,x+Math.cos(angle)*spread-(velocity?.vx??0)*trail,y+Math.sin(angle)*spread-(velocity?.vy??0)*trail);
  }
  ctx.globalAlpha=1;
 }
 const g=ctx.createRadialGradient(x-r*.32,y-r*.38,r*.06,x,y,r);
 shades.forEach((shade,i)=>g.addColorStop([0,.58,1][i],shade));
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
 ctx.save();ctx.clip();
 for(let i=0;i<17;i++){
  const angle=i*2.39996, dist=r*.94*Math.sqrt((i+1)/17);
  ctx.beginPath();ctx.arc(x+Math.cos(angle)*dist,y+Math.sin(angle)*dist,r*.095,0,Math.PI*2);
  ctx.fillStyle=i%2?'#ffffff68':'#10183032';ctx.fill();
 }
 ctx.lineWidth=r*.09;ctx.strokeStyle=shades[0]+'b0';
 ctx.beginPath();ctx.ellipse(x,y,r*.86,r*.48,-.66,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle=shades[2];ctx.beginPath();ctx.arc(x,y,r*.42,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff7e7';ctx.font='bold '+Math.round(r*.66)+'px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(skin?.mark??mark,x,y+r*.03);
 ctx.restore();ctx.restore();
}
function paintGolfSamples(time){
 if(!$('shop').open)return;
 $('skinGrid').querySelectorAll('canvas').forEach(sample=>{
  const ctx=sample.getContext('2d'),skin=ballSkins.find(item=>item.id===sample.dataset.skin);
  ctx.clearRect(0,0,88,82);
  drawStyledBall(ctx,44,41,22,skin,'#a1cdff','✦',time);
 });
}
