'use strict';
// Reserved keys cannot collide with owner/path image keys. Legacy transcripts stay intact.
function comicLanguage(row){const code=row?.page_text?.__comic_language?.code;return ['es','en'].includes(code)?code:'unassigned';}
let comicLanguageFilter=say('es','en');
function comicTitle(row){return comicLanguage(row)==='en'?(row.title_en?.trim()||row.title):row.title;}
function comicCover(row){return row?.page_text?.__comic_cover?.path||row?.pages?.[0];}
async function comicImage(path,img,current){
 const {data,error}=await db.storage.from('universe-comics').createSignedUrl(path,3600);
 if(!current())return;if(error)throw error;img.src=data.signedUrl;
}
universeReadComic=async function(row){
 modal(`<div class="comic-reader-heading"><h2 translate="no">${esc(comicTitle(row))}</h2><p>${bi('Desliza para leer el cómic completo.','Scroll to read the complete comic.')}</p></div><div class="comic-reader comic-reader-continuous" id="universe-reader" translate="no"></div>`);
 const root=$('#universe-reader'),generation=modalVersion,current=()=>root.isConnected&&modalVersion===generation;
 await Promise.all(row.pages.map(async(path,i)=>{
  const article=document.createElement('article'),img=document.createElement('img');img.alt=say('Página ','Page ')+(i+1);img.loading=i?'lazy':'eager';img.decoding='async';article.append(img);root.append(article);
  const failed=()=>{if(!current()||article.querySelector('button'))return;const retry=document.createElement('button');retry.className='comic-page-retry';retry.textContent=say('Reintentar página ','Retry page ')+(i+1);retry.onclick=async()=>{retry.disabled=true;try{await comicImage(path,img,current);if(current())retry.remove();}catch{retry.disabled=false;}};article.append(retry);};
  img.onerror=failed;try{await comicImage(path,img,current);}catch{failed();}
 }));
};
universeComicForm=function(row){
 const owner=state.profile.id,handle=state.profile.handle;let pages=[...(row?.pages||[])],cover=row?.page_text?.__comic_cover?.path||'',coverFile=null;
 const files=new Map();
 modal(`<h2>${bi('Preparar cómic','Prepare comic')}</h2><form id="universe-comic-form" class="stack">
 <label>${bi('Título del cómic','Comic title')}<input name="title" required maxlength="120" value="${esc(row?comicTitle(row):'')}"></label>
 <label>${bi('Idioma de las imágenes','Image language')}<select name="comic_language" required><option value="">${bi('Elige un idioma','Choose a language')}</option><option value="es" ${comicLanguage(row)==='es'||!row&&comicLanguageFilter==='es'?'selected':''}>Español</option><option value="en" ${comicLanguage(row)==='en'||!row&&comicLanguageFilter==='en'?'selected':''}>English</option></select></label>
 <label>${bi('Portada · JPG, PNG o WebP · hasta 50 MB','Cover · JPG, PNG or WebP · up to 50 MB')}<input name="cover" type="file" accept="image/jpeg,image/png,image/webp"></label>
 <img id="comic-cover-preview" class="comic-cover-preview" alt="${say('Vista previa de portada','Cover preview')}" hidden><p class="hint">${bi('La portada se muestra en la colección. Si no añades una, se usará la primera página.','The cover appears in the collection. Without a separate cover, the first page is used.')}</p>
 <button type="button" id="comic-cover-reset" class="text-button">${bi('Usar primera página como portada','Use first page as cover')}</button>
 <label>${bi('Orden del cómic','Comic order')}<input name="position" type="number" min="1" max="9999" required value="${row?.position||1}"></label>
 <div id="comic-page-order"></div><label>${bi('Añadir páginas · JPG, PNG, WebP · 50 MB por imagen','Add pages · JPG, PNG, WebP · 50 MB per image')}<input name="pages" type="file" multiple accept="image/jpeg,image/png,image/webp"></label>
 <p id="comic-form-status" role="status"></p><button type="submit" class="btn">${bi('Guardar cómic','Save comic')}</button></form>`);
 const form=$('#universe-comic-form'),generation=modalVersion,current=()=>form.isConnected&&generation===modalVersion&&state.profile?.id===owner;
 let objectUrl='',previewVersion=0;
 const preview=async()=>{const version=++previewVersion,img=$('#comic-cover-preview');if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl='';}img.hidden=true;img.removeAttribute('src');const path=cover||pages[0],file=coverFile||files.get(path);if(file){objectUrl=URL.createObjectURL(file);img.src=objectUrl;img.hidden=false;}else if(path){try{await comicImage(path,img,()=>current()&&version===previewVersion);if(current()&&version===previewVersion)img.hidden=false;}catch{}}};
 $('#modal').addEventListener('close',()=>{if(objectUrl)URL.revokeObjectURL(objectUrl);},{once:true});
 const valid=file=>['image/jpeg','image/png','image/webp'].includes(file.type)&&file.size>0&&file.size<=50*1024*1024;
 const status=message=>{if(current())$('#comic-form-status').textContent=message;};
 const paint=()=>{
  $('#comic-page-order').innerHTML=pages.map((path,i)=>`<fieldset class="comic-edit-page"><legend>${bi('Página','Page')} ${i+1}</legend><p translate="no">${esc(files.get(path)?.name||path.split('/').pop())}</p><div class="row"><button type="button" data-move-page="${i}" data-delta="-1" ${i===0?'disabled':''}>↑</button><button type="button" data-move-page="${i}" data-delta="1" ${i===pages.length-1?'disabled':''}>↓</button><button type="button" data-remove-page="${i}">${bi('Quitar','Remove')}</button></div></fieldset>`).join('');
  form.querySelectorAll('[data-move-page]').forEach(b=>b.onclick=()=>{const i=+b.dataset.movePage,j=i+(+b.dataset.delta);[pages[i],pages[j]]=[pages[j],pages[i]];paint();});
  form.querySelectorAll('[data-remove-page]').forEach(b=>b.onclick=()=>{pages.splice(+b.dataset.removePage,1);paint();});preview();
 };
 form.elements.cover.onchange=()=>{const file=form.elements.cover.files[0];if(!file)return;if(!valid(file)){status(say('Usa JPG, PNG o WebP de hasta 50 MB.','Use JPG, PNG or WebP up to 50 MB.'));form.elements.cover.value='';return;}coverFile=file;cover=owner+'/'+crypto.randomUUID();preview();};
 $('#comic-cover-reset').onclick=()=>{cover='';coverFile=null;form.elements.cover.value='';preview();};
 form.elements.pages.onchange=()=>{const selected=[...form.elements.pages.files];if(selected.some(f=>!valid(f))||pages.length+selected.length>100){status(say('Máximo 100 páginas, JPG/PNG/WebP de hasta 50 MB.','Up to 100 JPG/PNG/WebP pages, up to 50 MB each.'));form.elements.pages.value='';return;}for(const file of selected){const path=owner+'/'+crypto.randomUUID();pages.push(path);files.set(path,file);}form.elements.pages.value='';paint();};paint();
 form.onsubmit=async e=>{
  e.preventDefault();if(!ensureLive()||!form.reportValidity())return;if(!pages.length){status(say('Añade al menos una página.','Add at least one page.'));return;}
  busyModal(true);form.querySelectorAll('button,input,select').forEach(b=>b.disabled=true);
  try{
   const upload=async(path,file)=>{const {error}=await db.storage.from('universe-comics').upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;};
   for(const path of pages){if(files.has(path)){await upload(path,files.get(path));files.delete(path);}}
   if(coverFile){await upload(cover,coverFile);coverFile=null;}if(!current())throw Error('SESSION_CHANGED');
   const title=form.elements.title.value.trim(),language=form.elements.comic_language.value;
   const page_text={...row?.page_text,__comic_language:{code:language},__comic_cover:{path:cover}};
   const payload={title,title_en:language==='en'?title:'',position:+form.elements.position.value,pages,page_text};
   const query=row?db.from('universe_comics').update({...payload,revision:row.revision+1}).eq('id',row.id).eq('revision',row.revision):db.from('universe_comics').insert({...payload,owner_id:owner,owner_handle:handle});
   const {data,error}=await query.select('id');if(error)throw error;if(!data.length)throw Error(say('El cómic cambió. Cierra y vuelve a abrir.','Comic changed. Close and reopen.'));if(!current())return;comicLanguageFilter=language;$('#modal').close();await navigate('comics');
  }catch(error){status(error.message||say('No se guardó. Reintenta.','Not saved. Retry.'));}finally{busyModal(false);form.querySelectorAll('button,input,select').forEach(b=>b.disabled=false);if(current())paint();}
 };
};
universeComics=async function(v){
 const rows=state.demo?[]:await lifeRows('universe_comics');if(v!==state.version)return;
 const options=[['es','Español','Español'],['en','English','English'],['unassigned','Sin clasificar','Unassigned']];
 const paint=()=>{
  if(v!==state.version)return;
  const selected=rows.filter(r=>comicLanguage(r)===comicLanguageFilter).sort((a,b)=>a.position-b.position||String(a.created_at||'').localeCompare(String(b.created_at||'')));
  $('#main').innerHTML=lifeHeading('Cómics','Comics','Nuestras historias, una portada a la vez.','Our stories, one cover at a time.')+
   `<div class="comic-toolbar"><label>${bi('Idioma del cómic','Comic language')}<select id="comic-language-filter">${options.map(([code,es,en])=>`<option value="${code}" ${comicLanguageFilter===code?'selected':''}>${say(es,en)} (${rows.filter(r=>comicLanguage(r)===code).length})</option>`).join('')}</select></label>${jjButton('add-comic','+ Añadir cómic','+ Add comic')}</div>`+
   `<div class="comic-library">${selected.map(r=>`<article class="comic-card"><button class="comic-card-open" data-read-comic="${esc(r.id)}"><span class="comic-card-cover"><img data-comic-cover="${esc(r.id)}" alt="${esc(comicTitle(r))}" loading="lazy" hidden><span class="comic-cover-placeholder">${bi('Cómic','Comic')}</span></span><h2 translate="no">${esc(comicTitle(r))}</h2></button>${r.owner_id===state.profile.id?`<button class="text-button" data-edit-comic="${esc(r.id)}">${bi('Editar cómic','Edit comic')}</button>`:''}</article>`).join('')}</div>${selected.length?'':`<p class="comic-empty">${bi('Todavía no hay cómics en este idioma.','No comics in this language yet.')}</p>`}`;
  const filter=$('#comic-language-filter');filter.onchange=e=>{comicLanguageFilter=e.target.value;paint();};$('#add-comic').onclick=()=>universeComicForm();
  document.querySelectorAll('[data-edit-comic]').forEach(b=>b.onclick=()=>universeComicForm(rows.find(r=>r.id===b.dataset.editComic)));
  document.querySelectorAll('[data-read-comic]').forEach(b=>b.onclick=()=>universeReadComic(rows.find(r=>r.id===b.dataset.readComic)));
  document.querySelectorAll('[data-comic-cover]').forEach(img=>{const row=rows.find(r=>r.id===img.dataset.comicCover),path=comicCover(row);if(!path)return;img.onload=()=>{img.hidden=false;img.nextElementSibling.hidden=true;};comicImage(path,img,()=>v===state.version&&img.isConnected).catch(()=>{});});
 };paint();
};
