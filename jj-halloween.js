'use strict';
const HalloweenSkins=[['ghost','Fantasma','Ghost',6,'#f5eefc'],['pumpkin','Calabaza','Pumpkin',6,'#f79732'],['vampire','Vampiro','Vampire',8,'#a32b46'],['skeleton','Esqueleto','Skeleton',7,'#d8d8e4'],['frankenstein','Frankenstein','Frankenstein',8,'#a6c87d'],['kitsune','Kitsune','Kitsune',10,'#ea8155'],['witch','Brujería lunar','Moon witch',8,'#9566c7'],['devil','Diablillo','Little devil',8,'#d64a53'],['zombie','Zombi','Zombie',7,'#8cad99']];
BBSkins.push(...HalloweenSkins);
const HalloweenArt=new Image();let HalloweenRequested=false;HalloweenArt.onload=()=>window.dispatchEvent(new Event('bb-art-ready'));
const everydayCharacter=bbCharacter;
bbCharacter=function(ctx,x,y,size,handle,skin='casual',time=0){const outfit=HalloweenSkins.findIndex(s=>s[0]===skin);if(outfit<0)return everydayCharacter(ctx,x,y,size,handle,skin,time);
 if(!HalloweenRequested){HalloweenRequested=true;HalloweenArt.src='assets/bombitas/halloween-characters-v1.png';}
 if(!HalloweenArt.complete||!HalloweenArt.naturalWidth)return everydayCharacter(ctx,x,y,size,handle,'casual',time);
 const index=outfit*2+(handle==='julisa'?1:0),cw=HalloweenArt.naturalWidth/6,ch=HalloweenArt.naturalHeight/3,bob=time?Math.sin(time/110)*size*.025:0;
 const height=size*1.24,width=height*cw/ch;ctx.save();ctx.translate(x,y+bob);ctx.drawImage(HalloweenArt,index%6*cw,Math.floor(index/6)*ch,cw,ch,-width/2,-size*.94,width,height);ctx.restore();
};
