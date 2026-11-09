export const extraArt = {
 'bed-lavender':'bed-lavender','bed-rose':'bed-rose',
 'shelf-walnut':'shelf-walnut','shelf-cloud':'shelf-cloud',
 'cabinet-rose':'cabinet-rose','cabinet-lilac':'cabinet-lilac',
 'sofa-velvet':'sofa-velvet','sofa-cream':'sofa-cream','room-tv':'room-tv',
 'guitar-electric':'guitar-electric','guitar-acoustic':'guitar-acoustic',
 'room-piano-rose':'room-piano-rose','room-katanas':'room-katanas',
 'winter-plush-jj-reno':'winter-plush-jj-reno','winter-plush-st-reno':'winter-plush-st-reno',
 'winter-plush-jj-knit':'winter-plush-jj-knit','winter-plush-st-knit':'winter-plush-st-knit'
};

export function roomDevices(records, current) {
 let dialog;
 function show(title) {
  close();
  dialog=document.createElement('dialog');
  dialog.className='yr-device';
  const header=document.createElement('header');
  const heading=document.createElement('h2');
  heading.textContent=title;
  const button=document.createElement('button');
  button.type='button';
  button.textContent=say('Cerrar','Close');
  const opened=dialog;
  button.onclick=()=>opened.close();
  opened.addEventListener('close',()=>opened.remove(),{once:true});
  header.append(heading,button);
  const body=document.createElement('div');
  opened.append(header,body);
  document.body.append(opened);
  opened.showModal();
  return body;
 }
 function close(){
  if(dialog?.open)dialog.close();
  dialog=null;
 }
 async function tv(){
  records.stop();
  const body=show(say('Videoclips en la tele','Music videos on TV'));
  body.textContent=say('Cargando videoclips…','Loading music videos…');
  try{
   const clips=await videoRows();
   if(!current()||!body.isConnected)return;
   body.textContent=clips.length?'':say('Aún no hay videoclips.','There are no music videos yet.');
   const video=document.createElement('video');
   video.controls=true;
   video.playsInline=true;
   video.preload='metadata';
   video.hidden=true;
   const select=document.createElement('select');
   select.setAttribute('aria-label',say('Videoclip','Music video'));
   select.append(new Option(say('Elige un videoclip','Choose a music video'),''),...clips.map(clip=>new Option(clip.title,clip.id)));
   const message=document.createElement('p');
   message.setAttribute('role','status');
   let request=0;
   const screen=dialog;
   screen.addEventListener('close',()=>{request++;video.pause();video.removeAttribute('src');video.load();},{once:true});
   select.onchange=async()=>{
    const token=++request;
    video.pause();video.removeAttribute('src');video.load();video.hidden=true;
    message.textContent='';
    const clip=clips.find(item=>item.id===select.value);
    if(!clip)return;
    try{
     const {data,error}=await db.storage.from('videoclips').createSignedUrl(clip.path,3600);
     if(error)throw error;
     if(token!==request||!current()||!screen.open)return;
     video.src=data.signedUrl;
     video.hidden=false;
     await video.play().catch(()=>{});
    }catch{if(token===request&&screen.open)message.textContent=say('No se pudo abrir el videoclip.','Could not open this video.');}
   };
   if(clips.length)body.append(select,video,message);
  }catch{if(body.isConnected)body.textContent=say('No se pudieron cargar los videoclips.','Could not load music videos.');}
 }
 function arcade(){
  const body=show('Mini arcade J&J');
  const intro=document.createElement('p');
  intro.textContent=say('Apaga las nueve luces. Cada toque cambia esa luz y las de al lado.','Turn off all nine lights. Each tap flips that light and its neighbors.');
  const grid=document.createElement('div');
  grid.className='yr-arcade-grid';
  const result=document.createElement('p');
  result.setAttribute('aria-live','polite');
  const reset=document.createElement('button');
  reset.textContent=say('Otra partida','New game');
  let board, moves;
  const buttons=Array.from({length:9},(_,i)=>{
   const button=document.createElement('button');
   button.type='button';
   button.setAttribute('aria-label',say('Luz ','Light ')+(i+1));
   button.onclick=()=>{toggleLights(board,i);moves++;paint();};
   return button;
  });
  function paint(){
   const won=!board.some(Boolean);
   buttons.forEach((button,i)=>{
    button.setAttribute('aria-pressed',String(board[i]));
    button.textContent=board[i]?'✦':'·';
    button.disabled=won;
   });
   result.textContent=won?say('¡Yatta! Lo resolviste en ','Solved in ')+moves+say(' movimientos.',' moves.'):say('Movimientos: ','Moves: ')+moves;
  }
  reset.onclick=()=>{
   do{
    board=Array(9).fill(false);
    for(let i=0;i<5;i++)toggleLights(board,Math.floor(Math.random()*9));
   }while(!board.some(Boolean));
   moves=0;
   paint();
  };
  grid.append(...buttons);
  body.append(intro,grid,result,reset);
  reset.onclick();
 }
 return {tv,arcade,close};
}

export function mountPosterPhotos(root,current) {
 const photos=new Map();
 let loading;
 function fill(){
  root.querySelectorAll('img[data-private-poster]').forEach(img=>{
   const source=photos.get(img.dataset.privatePoster);
   if(source&&!img.getAttribute('src'))img.src=source;
  });
 }
 return {
  fill,
  async load(){
   if(loading)return loading;
   loading=(async()=>{
    const {data,error}=await db.rpc('yuki_poster_images');
    if(error)throw error;
    if(!current())return;
    for(const item of data||[])photos.set(item.id,'data:image/webp;base64,'+item.image);
    fill();
   })();
   try{await loading;}catch{loading=null;}
  }
 };
}
