'use strict';
const winterOutfits = [
  ['christmas-santa','Santa de terciopelo','Velvet Santa',8,'#a92342'],
  ['christmas-reindeer','Reno cascabel','Jingle reindeer',8,'#aa6738']
];
BBSkins.push(...winterOutfits);
const winterSprites = new Map();
const drawOtherOutfits = bbCharacter;
bbCharacter = function(ctx,x,y,size,handle,skin,time=0) {
  const row = winterOutfits.findIndex(item=>item[0]===skin);
  if(row<0) return drawOtherOutfits(ctx,x,y,size,handle,skin,time);
  const path = 'assets/christmas/sprite-'+row+'-'+(handle==='julisa'?1:0)+'.webp';
  if(!winterSprites.has(path)) {
    const image = new Image();
    image.onload = ()=>window.dispatchEvent(new Event('bb-art-ready'));
    winterSprites.set(path,image);
    image.src = path;
  }
  const image = winterSprites.get(path);
  if(!image.naturalWidth) return drawOtherOutfits(ctx,x,y,size,handle,'casual',time);
  ctx.drawImage(image,x-size*.62,y-size*.94+Math.sin(time/110)*size*.025,size*1.24,size*1.24);
};
function seasonalSale(id,now=new Date()) {
  const day = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Matamoros',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const stamp = day.find(p=>p.type==='month').value+day.find(p=>p.type==='day').value;
  if(id.startsWith('christmas-')) return JJ.season==='christmas' && stamp >= '1101' && stamp <= '1231';
  if(id.startsWith('halloween-') || HalloweenSkins.some(s=>s[0]===id)) return stamp>='0926' && stamp<='1031';
  return true;
}
async function christmasArrival() {
  try { await loadSeason(); } catch { return; }
  if(JJ.season!=='christmas') return;
  const screen = document.createElement('div');
  screen.className='winter-arrival';
  screen.setAttribute('role','status');
  const caption=document.createElement('strong');
  caption.textContent=say('Bienvenidos a nuestra Navidad','Welcome to our Christmas');
  screen.append(caption);
  document.body.append(screen);
  await new Promise(resolve=>setTimeout(resolve,2000));
  screen.remove();
}
