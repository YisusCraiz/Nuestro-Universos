export function anniversaryComic() {
 const gift=document.createElement('section');
 gift.className='yuki-comic-gift';
 const open=document.createElement('button');
 open.className='btn';
 open.textContent=say('Abrir regalo · Just One More Thing','Open your gift · Just One More Thing');
 const dialog=document.createElement('dialog');
 dialog.className='yuki-comic-reader';
 dialog.setAttribute('aria-label','Just One More Thing');
 const controls=document.createElement('nav');
 const label=document.createElement('p');
 label.setAttribute('aria-live','polite');
 const image=document.createElement('img');
 const notice=document.createElement('p');
 notice.setAttribute('role','status');
 let page=0, request=0;
 const cache=new Map();
 const button=(es,en,run)=>{
  const element=document.createElement('button');
  element.type='button';
  element.className='btn secondary';
  element.textContent=say(es,en);
  element.onclick=run;
  return element;
 };
 const previous=button('Anterior','Previous',()=>load(page===-1?0:page-1));
 const next=button('Siguiente','Next',()=>load(page+1));
 const illustration=button('Ilustración','Anniversary art',()=>load(-1));
 const cover=button('Portada','Cover',()=>load(0));
 const close=button('Cerrar','Close',()=>dialog.close());
 controls.append(previous,next,cover,illustration,close);
 dialog.append(controls,label,notice,image);
 gift.append(open,dialog);

 async function load(index){
  page=index;
  const token=++request;
  previous.disabled=index===0;
  next.disabled=index<0||index===10;
  cover.disabled=index===0;
  illustration.disabled=index===-1;
  label.textContent=index<0?say('Ilustración del aniversario','Anniversary illustration'):index===0?say('Portada','Cover'):say('Página ','Page ')+index+' / 10';
  image.alt=label.textContent+' · Just One More Thing';
  image.hidden=true;
  notice.textContent=say('Abriendo…','Opening…');
  dialog.scrollTop=0;
  try{
   let source=cache.get(index);
   if(!source){
    const data=await rpc('yuki_anniversary_page',{p_page:index});
    if(!data)throw Error('Page unavailable');
    source='data:image/webp;base64,'+data.replace(/\s/g,'');
    cache.set(index,source);
   }
   if(token!==request||!dialog.open)return;
   image.src=source;
   image.hidden=false;
   notice.textContent='';
  }catch{
   if(token!==request||!dialog.open)return;
   notice.textContent='';
   notice.append(button('Reintentar página','Retry page',()=>load(index)));
  }
 }
 open.onclick=()=>{dialog.showModal();load(0);};
 dialog.addEventListener('close',()=>{request++;});
 return gift;
}
