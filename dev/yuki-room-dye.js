export function dyeControls(data, mutate, busy, skin) {
 const section=document.createElement('section');
 section.className='yr-dye';
 const heading=document.createElement('h3');
 heading.textContent=say('Taller de color','Color studio');
 const outfit=data.outfit;
 const unlocked=data.owned.includes('dye:'+outfit);
 const note=document.createElement('p');
 note.textContent=outfit==='uniform'
  ?say('Equipa un conjunto en el Vestidor para probar colores.','Equip an outfit in the Wardrobe to try colors.')
  :say('Prueba una combinación y mira cómo queda en Yuki antes de guardar.','Try a combination and see it on Yuki before saving.');
 section.append(heading,note);
 if(outfit==='uniform')return section;

 const studio=document.createElement('div');
 studio.className='yr-dye-studio';
 const preview=document.createElement('div');
 preview.className='yr-dye-preview';
 preview.setAttribute('role','img');
 preview.setAttribute('aria-label',say('Vista previa del conjunto de Yuki','Preview of Yuki’s outfit'));
 const sprite=document.createElement('div');
 sprite.className='yr-dye-sprite';
 preview.append(sprite);
 const controls=document.createElement('div');
 controls.className='yr-dye-controls';
 studio.append(preview,controls);
 section.append(studio);

 const saved=data.decor?.['dye:'+outfit];
 const fields=(saved||'a986c6:e3a4b6').split(':').map((color,index)=>{
  const label=document.createElement('label');
  label.textContent=index?say('Secundario','Secondary'):say('Principal','Primary');
  const input=document.createElement('input');
  input.type='color';
  input.value='#'+color;
  input.disabled=busy;
  const hex=document.createElement('span');
  hex.className='yr-dye-hex';
  label.append(input,hex);
  controls.append(label);
  return {input,hex};
 });
 const presets=document.createElement('div');
 presets.className='yr-dye-presets';
 const price=document.createElement('p');
 price.textContent=unlocked?say('Incluye todos los cambios de este conjunto.','All changes for this outfit are included.')
  :say('120 JJ una sola vez por conjunto.','120 JJ once per outfit.');
 const save=document.createElement('button');
 save.type='button';
 save.className='yr-action yr-dye-save';
 save.disabled=busy||(!unlocked&&data.coins<120);
 save.textContent=unlocked?say('Guardar mezcla','Save colors'):say('Desbloquear y guardar · 120 JJ','Unlock and save · 120 JJ');
 if(!unlocked&&data.coins<120)price.textContent+=say(' Te faltan ',' You need ')+(120-data.coins)+' JJ.';
 const palette=()=>fields.map(({input})=>input.value.slice(1)).join(':');
 let timer;
 let revision=0;
 function update(paintPalette){
  fields.forEach(({input,hex})=>{hex.textContent=input.value.toUpperCase();});
  const generation=++revision;
  clearTimeout(timer);
  timer=setTimeout(()=>{
   if(!section.isConnected)return;
   skin(outfit,paintPalette).then(url=>{
    if(generation===revision&&section.isConnected)sprite.style.backgroundImage='url("'+url+'")';
   }).catch(()=>{});
  },70);
 }
 fields.forEach(({input})=>{input.oninput=()=>update(palette());});
 for(const [es,en,primary,secondary] of [
  ['Lavanda','Lavender','a986c6','e3a4b6'],['Aurora','Aurora','83c7ad','76a8d4'],
  ['Frambuesa','Raspberry','a63c74','f2a4a4'],['Medianoche','Midnight','353467','777bca']
 ]){
  const button=document.createElement('button');
  button.type='button';
  button.disabled=busy;
  button.textContent=say(es,en);
  button.style.setProperty('--swatch','linear-gradient(135deg,#'+primary+' 50%,#'+secondary+' 50%)');
  button.onclick=()=>{
   fields[0].input.value='#'+primary;
   fields[1].input.value='#'+secondary;
   update(palette());
  };
  presets.append(button);
 }
 save.onclick=()=>mutate('dye',outfit+':'+palette());
 controls.append(presets,price,save);
 update(saved);
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
