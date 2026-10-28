'use strict';
// Page text is keyed by Storage path, so reordering never separates a translation from its image.
function comicTitle(row){return say(row.title,row.title_en?.trim()||row.title);}
universeReadComic=async function(row){
 modal(`<h2>${bi(esc(row.title),esc(row.title_en?.trim()||row.title))}</h2><p>${bi('Los diálogos traducidos aparecen debajo de cada página.','Translated dialogue appears below each page.')}</p><div class="comic-reader" id="universe-reader"></div>`);
 const root=$('#universe-reader'),generation=modalVersion;const current=()=>root.isConnected&&modalVersion===generation;
 for(const [i,path] of row.pages.entries()){
  if(!current())return;
  const article=document.createElement('article');article.innerHTML=`<h3>${bi('Página','Page')} ${i+1} / ${row.pages.length}</h3>`;root.append(article);
  try{const {data,error}=await db.storage.from('universe-comics').createSignedUrl(path,3600);if(!current())return;if(error)throw error;
   const link=document.createElement('a');link.href=data.signedUrl;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label',say('Ampliar página ','Enlarge page ')+(i+1));
   const img=document.createElement('img');img.src=data.signedUrl;img.alt=say('Página del cómic ','Comic page ')+(i+1);img.loading='lazy';link.append(img);article.append(link);
  }catch{if(!current())return;const p=document.createElement('p');p.innerHTML=bi('No se pudo cargar la imagen. Cierra y vuelve a abrir para reintentar.','Image could not load. Close and reopen to retry.');article.append(p);}
  if(!current())return;
  const text=row.page_text?.[path]||{},box=document.createElement('section');box.className='comic-dialogue';
  const es=text.es?.trim(),en=text.en?.trim();
  box.innerHTML=`<h4>${bi('Diálogos · en orden de lectura','Dialogue · in reading order')}</h4><div class="comic-transcript">${bi(esc(es||'Transcripción en español pendiente.'),esc(en||'English translation is not available for this page yet.'))}</div>`;article.append(box);
 }
};
universeComicForm=function(row){
 const owner=state.profile.id,handle=state.profile.handle;let pages=[...(row?.pages||[])],texts=structuredClone(row?.page_text||{});
 modal(`<h2>${bi('Preparar capítulo bilingüe','Prepare bilingual chapter')}</h2><form id="universe-comic-form" class="stack">
 <label>${bi('Título en español','Spanish title')}<input name="title" required maxlength="120" value="${esc(row?.title||'')}"></label>
 <label>${bi('Título en inglés','English title')}<input name="title_en" maxlength="120" value="${esc(row?.title_en||'')}"></label>
 <label>${bi('Orden del capítulo','Chapter order')}<input name="position" type="number" min="1" max="9999" required value="${row?.position||1}"></label>
 <p>${bi('Escribe los diálogos por viñeta, en orden de lectura. La imagen conserva sus globos originales. Puedes guardar una traducción en inglés para Julissa.','Enter dialogue by panel in reading order. Original speech bubbles stay in the image. You can save an English translation for Julissa.')}</p>
 <div id="comic-page-order"></div><label>${bi('Añadir páginas · JPG, PNG, WebP · 50 MB por imagen','Add pages · JPG, PNG, WebP · 50 MB per image')}<input name="pages" type="file" multiple accept="image/jpeg,image/png,image/webp"></label>
 <p class="hint">${bi('La traducción automática usa un servicio externo: solo se envía el texto de la página al pulsar Traducir; no la imagen. Revisa el resultado antes de guardar. No extrae texto de imágenes.','Automatic translation uses an external service: only page text is sent when you press Translate; images are not sent. Review before saving. It does not extract image text.')}</p>
 <p id="comic-form-status" role="status"></p><button type="submit" class="btn">${bi('Guardar capítulo','Save chapter')}</button></form>`);
 const form=$('#universe-comic-form'),generation=modalVersion,current=()=>form.isConnected&&generation===modalVersion&&state.profile?.id===owner;
 let translating=false;
 const capture=()=>{for(const input of form.querySelectorAll('[data-comic-text]')){const path=pages[+input.dataset.page];if(path){texts[path]||={};texts[path][input.dataset.comicText]=input.value;}}};
 const paint=()=>{
  $('#comic-page-order').innerHTML=pages.map((path,i)=>`<fieldset class="comic-edit-page"><legend>${bi('Página','Page')} ${i+1}</legend><div class="row"><button type="button" data-move-page="${i}" data-delta="-1" ${i===0?'disabled':''}>↑</button><button type="button" data-move-page="${i}" data-delta="1" ${i===pages.length-1?'disabled':''}>↓</button><button type="button" data-remove-page="${i}">${bi('Quitar','Remove')}</button></div><label>${bi('Diálogos en español','Spanish dialogue')}<textarea data-comic-text="es" data-page="${i}" maxlength="10000" rows="5">${esc(texts[path]?.es||'')}</textarea></label><label>${bi('Diálogos en inglés','English dialogue')}<textarea data-comic-text="en" data-page="${i}" maxlength="10000" rows="5">${esc(texts[path]?.en||'')}</textarea></label><button type="button" data-translate-page="${i}">${bi('Traducir texto ES → EN','Translate text ES → EN')}</button></fieldset>`).join('');
  form.querySelectorAll('[data-move-page]').forEach(b=>b.onclick=()=>{capture();const i=+b.dataset.movePage,j=i+(+b.dataset.delta);[pages[i],pages[j]]=[pages[j],pages[i]];paint();});
  form.querySelectorAll('[data-remove-page]').forEach(b=>b.onclick=()=>{capture();pages.splice(+b.dataset.removePage,1);paint();});
  form.querySelectorAll('[data-translate-page]').forEach(b=>b.onclick=async()=>{if(translating)return;capture();const path=pages[+b.dataset.translatePage],source=texts[path]?.es?.trim(),target=form.querySelector(`[data-comic-text="en"][data-page="${b.dataset.translatePage}"]`);if(!source){$('#comic-form-status').textContent=say('Primero escribe los diálogos en español.','Enter the Spanish dialogue first.');return;}if(target.value.trim()){ $('#comic-form-status').textContent=say('Borra la traducción inglesa si quieres reemplazarla automáticamente.','Clear the English translation if you want to replace it automatically.');return;}
   translating=true;b.disabled=true;try{const en=await freeTranslate(source,'es','en');if(!current())return;const index=pages.indexOf(path),field=form.querySelector(`[data-comic-text="en"][data-page="${index}"]`);if(index>=0&&field&&!field.value.trim()&&form.querySelector(`[data-comic-text="es"][data-page="${index}"]`)?.value.trim()===source){texts[path].en=en;field.value=en;}$('#comic-form-status').textContent=say('Traducción preparada. Revisa los diálogos y guarda el capítulo.','Translation prepared. Review the dialogue and save the chapter.');}catch{if(current())$('#comic-form-status').textContent=say('No se pudo traducir. Puedes pegar tu traducción o reintentar más tarde.','Could not translate. Paste your translation or try again later.');}finally{translating=false;if(b.isConnected)b.disabled=false;}});
 };
 paint();
 // Stage files immediately, allowing text editing before the first save.
 const files=new Map();form.elements.pages.onchange=()=>{capture();const selected=[...form.elements.pages.files];if(selected.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||!f.size||f.size>50*1024*1024)||pages.length+selected.length>100){$('#comic-form-status').textContent=say('Máximo 100 páginas, JPG/PNG/WebP de hasta 50 MB.','Up to 100 JPG/PNG/WebP pages, up to 50 MB each.');form.elements.pages.value='';return;}for(const file of selected){const path=owner+'/'+crypto.randomUUID();pages.push(path);files.set(path,file);}form.elements.pages.value='';paint();};
 form.onsubmit=async e=>{e.preventDefault();if(!ensureLive()||translating)return;capture();if(!pages.length){$('#comic-form-status').textContent=say('Añade al menos una página.','Add at least one page.');return;}busyModal(true);form.querySelectorAll('button,input,textarea').forEach(b=>b.disabled=true);
  try{for(const path of pages){const file=files.get(path);if(!file)continue;const {error}=await db.storage.from('universe-comics').upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;files.delete(path);}
   if(!current())throw Error('SESSION_CHANGED');
   const payload={title:form.elements.title.value.trim(),title_en:form.elements.title_en.value.trim(),position:+form.elements.position.value,pages,page_text:Object.fromEntries(pages.map(p=>[p,texts[p]||{es:'',en:''}]))};
   const query=row?db.from('universe_comics').update({...payload,revision:row.revision+1}).eq('id',row.id).eq('revision',row.revision):db.from('universe_comics').insert({...payload,owner_id:owner,owner_handle:handle});
   const {data,error}=await query.select('id');if(error)throw error;if(!data.length)throw Error(say('El capítulo cambió. Cierra y vuelve a abrir.','Chapter changed. Close and reopen.'));if(!current())return;$('#modal').close();await navigate('comics');
  }catch(error){if(current())$('#comic-form-status').textContent=error.message||say('No se guardó. Reintenta.','Not saved. Retry.');}finally{busyModal(false);form.querySelectorAll('button,input,textarea').forEach(b=>b.disabled=false);if(current())paint();}
 };
};
