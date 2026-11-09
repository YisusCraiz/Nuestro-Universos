export function dyeControls(data, mutate, busy) {
 const section=document.createElement('section');
 section.className='yr-dye';
 const heading=document.createElement('h3');
 heading.textContent=say('Taller de color','Color studio');
 const note=document.createElement('p');
 const outfit=data.outfit;
 const unlocked=data.owned.includes('dye:'+outfit);
 note.textContent=outfit==='uniform'
  ?say('Ponte ropa, un vestido o un pijama para personalizarlo.','Put on an outfit, dress or pajamas to customize it.')
  :unlocked?say('Este conjunto ya tiene el taller desbloqueado.','The studio is unlocked for this outfit.')
   :say('Desbloquea el color de este conjunto por 120 JJ. Después puedes cambiar la mezcla cuantas veces quieras.','Unlock colors for this outfit for 120 JJ. Then change the mix whenever you like.');
 section.append(heading,note);
 if(outfit==='uniform')return section;
 const saved=data.decor?.['dye:'+outfit]||'a986c6:e3a4b6';
 const fields=saved.split(':').map((color,index)=>{
  const label=document.createElement('label');
  label.textContent=index?say('Color secundario','Secondary color'):say('Color principal','Primary color');
  const input=document.createElement('input');
  input.type='color';
  input.value='#'+color;
  input.disabled=busy;
  label.append(input);
  section.append(label);
  return input;
 });
 const save=document.createElement('button');
 save.className='yr-action';
 save.disabled=busy||(!unlocked&&data.coins<120);
 save.textContent=unlocked?say('Guardar mezcla','Save colors'):say('Desbloquear por 120 JJ','Unlock for 120 JJ');
 save.onclick=()=>mutate('dye',[outfit,...fields.map(input=>input.value.slice(1))].join(':'));
 section.append(save);
 return section;
}

const recolors=new Map();
export async function recolor(url,palette){
 if(!/^[0-9a-f]{6}:[0-9a-f]{6}$/.test(palette||''))return url;
 const key=url.slice(-75)+palette;
 if(recolors.has(key))return recolors.get(key);
 const image=new Image();
 image.src=url;
 await image.decode();
 const canvas=document.createElement('canvas');
 canvas.width=image.naturalWidth;
 canvas.height=image.naturalHeight;
 const ctx=canvas.getContext('2d');
 ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
 const colors=palette.split(':').map(hex=>[0,2,4].map(offset=>parseInt(hex.slice(offset,offset+2),16)));
 const cellHeight=canvas.height/3;
 const mint=url.includes('pajamas-mint');
 const blue=url.includes('pajamas-blue');
 const rose=url.includes('pajamas-rose');
 for(let i=0;i<pixels.data.length;i+=4){
  const [r,g,b,a]=pixels.data.subarray(i,i+4);
  const y=(Math.floor(i/4/canvas.width)%cellHeight)/cellHeight;
  if(!a||y<.38||Math.max(r,g,b)<118)continue;
  const fabric=mint?g-r>8&&b-r>3:blue?b-r>8&&g-r>3:rose?b-g>7&&r-g>7:b-g>8&&r-g>2&&b-r>1;
  if(!fabric)continue;
  const blend=Math.min(1,Math.max(0,(y-.61)*5));
  const light=(r+g+b)/3/173;
  for(let channel=0;channel<3;channel++){
   const tint=colors[0][channel]*(1-blend)+colors[1][channel]*blend;
   pixels.data[i+channel]=tint*light;
  }
 }
 ctx.putImageData(pixels,0,0);
 const result=canvas.toDataURL('image/webp',.88);
 if(recolors.size>=5)recolors.delete(recolors.keys().next().value);
 recolors.set(key,result);
 return result;
}
