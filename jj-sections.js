'use strict';
const giftsMenuPage='regalos-jxj';
const cards3DPage='cartas-3d-jj';
menus.push([giftsMenuPage,'◇','Regalos JXJ'],[cards3DPage,'▤','Cartas3DJJ']);
const JJSections={user:null,values:null,request:0,loading:null};
function sectionAllowed(page){if([giftsMenuPage,cards3DPage].includes(page))return !state.demo&&['jesus','julisa'].includes(state.profile?.handle);return state.profile?.handle==='jesus'||['home','profile'].includes(page)||(page!=='novios'&&JJSections.user===state.profile?.id&&JJSections.values?.[page]===true);}
async function loadSections(){const id=state.profile?.id;if(!id)return;if(JJSections.loading?.id===id)return JJSections.loading.promise;const request=++JJSections.request;const promise=(async()=>{const values=state.demo?Object.fromEntries(menus.map(([key])=>[key,!['gifts','novios'].includes(key)])):await rpc('jj_sections');if(state.profile?.id===id&&request===JJSections.request){JJSections.user=id;JJSections.values=values;}})();JJSections.loading={id,promise};try{await promise;}finally{if(JJSections.loading?.promise===promise)JJSections.loading=null;}}
function syncMenuYuki(){window.YukiHub?.sync();}
function paintSectionVisibility(){syncMenuYuki();if(!state.profile)return;document.querySelectorAll('[data-nav],[data-go]').forEach(el=>{const page=el.dataset.nav||el.dataset.go;el.hidden=!sectionAllowed(page);});for(const [id,page] of [['our-memories','memories'],['haunted-play','games']]){const el=document.getElementById(id);if(el)el.hidden=!sectionAllowed(page);}}
const sectionsShell=shell;
shell=function(){
  sectionsShell();
  paintSectionVisibility();
  const giftsButton=document.querySelector('[data-nav="regalos-jxj"]');
  if(giftsButton)giftsButton.onclick=()=>{
    if(!sectionAllowed(giftsMenuPage))return;
    const query=new URLSearchParams({view:'scan',lang:say('es','en'),from:state.page});
    window.location.assign('./regalos-jxj.html#'+query);
  };
};
const sectionsProfile=profilePage;profilePage=async function(v){await sectionsProfile(v);if(v!==state.version||!state.profile)return;
  if(state.profile.handle!=='jesus')return;
  const box=document.createElement('section');box.className='game-panel section-controls';box.id='section-controls';$('#main').append(box);try{await loadSections();if(v!==state.version)return;box.innerHTML=`<h2>${bi('Apartados que puede ver Julissa','Sections Julissa can see')}</h2><p>${bi('Activa un apartado cuando esté listo. Tú siempre puedes abrirlo para prepararlo. Ocultarlo no borra su contenido.','Enable a section when it is ready. You can always open it to prepare it. Hiding it does not delete its contents.')}</p><p class="hint">${bi('Inicio y Perfiles siempre están disponibles. Novios ahora es un título en los perfiles. Los apartados nuevos comienzan ocultos.','Home and Profiles are always available. Sweethearts is now a profile title. New sections start hidden.')}</p><div class="section-switches">${menus.filter(([id])=>!['home','profile','novios',giftsMenuPage,cards3DPage].includes(id)).map(([id,icon,label])=>`<label class="row"><input type="checkbox" data-section-toggle="${id}" ${JJSections.values?.[id]?'checked':''}><span aria-hidden="true">${icon}</span><span>${esc(label)}</span></label>`).join('')}</div><p id="section-save-status" role="status"></p>`;box.querySelectorAll('[data-section-toggle]').forEach(input=>input.onchange=async()=>{const visible=input.checked;input.disabled=true;const user=state.profile.id;try{if(!ensureLive())throw Error('DEMO');const values=await rpc('jj_sections',{p_section:input.dataset.sectionToggle,p_visible:visible});if(user!==state.profile?.id)return;JJSections.values=values;$('#section-save-status').textContent=say('Guardado. El cambio llegará a Julissa en unos segundos.','Saved. Julissa will receive the change in a few seconds.');}catch{input.checked=!visible;if(input.isConnected)$('#section-save-status').textContent=say('No se guardó. Reintenta y comprueba el SQL 18.','Not saved. Retry and check SQL 18.');}finally{input.disabled=false;}});}catch{box.innerHTML=`<p>${bi('No se pudo cargar la visibilidad. Ejecuta SQL 18 y vuelve a abrir Perfiles.','Could not load section visibility. Apply SQL 18 and reopen Profiles.')}</p>`;}};
const sectionsNavigate=navigate;let sectionNavigation=0;
navigate=async function(page){if(!state.profile)return;const request=++sectionNavigation,user=state.profile.id;try{await loadSections();}catch{if(state.profile?.handle!=='jesus'&&!['home','profile'].includes(page)){toast(say('No se pudo abrir. Comprueba la conexión.','Could not open. Check your connection.'));page='home';}}if(request!==sectionNavigation||state.profile?.id!==user)return;if(!sectionAllowed(page))page='home';await sectionsNavigate(page);if(request===sectionNavigation)paintSectionVisibility();};
// New controls inserted by the existing page modules also inherit the visibility rule.
new MutationObserver(()=>paintSectionVisibility()).observe(document.body,{childList:true,subtree:true});
setInterval(async()=>{if(!state.profile||state.demo||document.hidden||state.profile.handle==='jesus')return;const user=state.profile.id;try{await loadSections();if(state.profile?.id!==user)return;paintSectionVisibility();if(!sectionAllowed(state.page)){if($('#modal').open&&!modalBusy)$('#modal').close();if(typeof stopJJPlayer==='function')stopJJPlayer();await navigate('home');}}catch{/* Keep the last confirmed menu during brief disconnections. */}},4000);
const sectionsLogout=logout;logout=async function(){JJSections.request++;JJSections.user=null;JJSections.values=null;return sectionsLogout();};

const cards3DPreviousContent=contentPage;
contentPage=async function(kind, version) {
  if(kind!==cards3DPage) return cards3DPreviousContent(kind, version);
  const root=document.getElementById('main');
  const user=state.profile.id;
  const current=()=>state.version===version&&state.profile?.id===user;
  root.innerHTML='<div class="page-heading"><h1>Cartas3DJJ</h1><p>'+say('Tus cartas creadas por Yuki','Your cards from Yuki')+'</p></div><div id="cards-3d-gallery"></div>';
  const gallery=root.querySelector('#cards-3d-gallery');

  if(state.profile.handle==='jesus') {
    const panel=document.createElement('details');
    panel.className='game-panel';
    panel.innerHTML='<summary>'+say('Subir carta 3D','Upload 3D card')+'</summary><form class="stack" id="cards-3d-upload"><label>'+say('Destinatario','Recipient')+'<select name="recipient"><option value="jesus">'+say('Para mí','For me')+'</option><option value="julisa">'+say('Para Julie','For Julie')+'</option></select></label><p class="hint">'+say('Solo la cuenta seleccionada podrá ver la carta y su QR.','Only the selected account can see the card and its QR code.')+'</p><label>'+say('Título','Title')+'<input name="title" value="A Little Something" maxlength="120" required></label><label>'+say('Ilustración del frente','Front artwork')+'<input name="front" type="file" accept="image/png,image/jpeg,image/webp" required></label><label>'+say('QR original del reverso','Original QR for the back')+'<input name="qr" type="file" accept="image/png,image/jpeg,image/webp" required></label><button type="submit" class="btn">'+say('Guardar carta','Save card')+'</button><p role="status"></p></form>';
    gallery.before(panel);
    const form=panel.querySelector('form');
    const submit=form.querySelector('button');
    const status=form.querySelector('[role="status"]');
    form.onsubmit=async event=>{
      event.preventDefault();
      if(submit.disabled||!current()) return;
      const {title,front,qr,recipient}=form.elements;
      const forJulie=recipient.value==='julisa';
      const cardTitle=title.value.trim();
      const frontFile=front.files[0];
      const qrFile=qr.files[0];
      const types=['image/png','image/jpeg','image/webp'];
      if(!cardTitle||![frontFile,qrFile].every(file=>file?.size>0&&types.includes(file.type))) {
        status.textContent=say('Escribe un título y elige dos imágenes PNG, JPG o WebP.','Enter a title and choose two PNG, JPG, or WebP images.');
        return;
      }
      submit.disabled=true;
      status.textContent=say('Guardando tu carta…','Saving your card…');
      const id=crypto.randomUUID();
      const uploadedPaths=[];
      const storage=db.storage.from('jj-cards-3d');
      try {
        let recipientId=user;
        if(forJulie) {
          const profile=await db.from('profiles').select('id').eq('handle','julisa').single();
          if(profile.error) throw profile.error;
          recipientId=profile.data.id;
        }
        if(!current()) return;
        const prefix=recipientId+'/'+id;
        const frontPath=prefix+'/front';
        const qrPath=prefix+'/qr';
        for(const [path,file] of [[frontPath,frontFile],[qrPath,qrFile]]) {
          uploadedPaths.push(path);
          const upload=await storage.upload(path,file,{contentType:file.type,upsert:false});
          if(upload.error) throw upload.error;
        }
        const result=await db.from('jj_cards_3d').insert({id,recipient_id:recipientId,title:cardTitle,front_path:frontPath,qr_path:qrPath});
        if(result.error) throw result.error;
      } catch(error) {
        try { if(uploadedPaths.length) await storage.remove(uploadedPaths); } catch { /* Keep the original upload error. */ }
        console.error(error);
        if(current()) status.textContent=say('No pudimos guardar la carta. Inténtalo otra vez.','Could not save your card. Please try again.');
        return;
      } finally {
        submit.disabled=false;
      }
      if(!current()) return;
      if(forJulie) {
        form.reset();
        status.textContent=say('Carta guardada. Julie la verá al entrar con su cuenta.','Card saved. Julie will see it when she signs in.');
      } else {
        await navigate(cards3DPage);
      }
    };
  }
  const {data,error}=await db.from('jj_cards_3d').select('id,title,front_path,qr_path').eq('recipient_id',user).order('created_at',{ascending:false});
  if(!current()) return;
  if(error) throw error;
  if(!data.length) {
    gallery.innerHTML='<p class="empty">'+say('Yuki todavía no te ha dejado una carta aquí.','Yuki hasn’t left a card for you here yet.')+'</p>';
    return;
  }
  gallery.innerHTML='<style>#cards-3d-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:24px}.cards-3d-entry{text-align:center;perspective:1000px}.cards-3d-entry button{position:relative;width:min(100%,340px);aspect-ratio:4/5;display:block;margin:auto;border:0;padding:0;background:transparent;color:#f7dfab;border-radius:14px;cursor:pointer;transform-style:preserve-3d;transition:transform .6s}.cards-3d-entry button[aria-pressed=true]{transform:rotateY(180deg)}.cards-3d-face{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:10px;overflow:hidden;border:2px solid #d9b66d;border-radius:14px;background:#111c37;backface-visibility:hidden;-webkit-backface-visibility:hidden}.cards-3d-front{display:block}.cards-3d-front img{width:100%;height:100%;object-fit:contain}.cards-3d-back{transform:rotateY(180deg);padding:16px;grid-template-columns:minmax(0,1fr)}.cards-3d-back img{width:min(100%,240px);aspect-ratio:1;object-fit:contain;background:white;padding:8px}@media(prefers-reduced-motion:reduce){.cards-3d-entry button{transition:none}}</style>';
  const bucket=db.storage.from('jj-cards-3d');
  async function imageData(path) {
    const {data:blob,error}=await bucket.download(path);
    if(error) throw error;
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  await Promise.all(data.map(async card=>{
    const entry=document.createElement('article');
    entry.className='cards-3d-entry';
    const title=document.createElement('h2');
    title.textContent=card.title;
    const hint=document.createElement('p');
    hint.textContent=say('Cargando carta…','Loading card…');
    hint.setAttribute('role','status');
    entry.append(title,hint);
    gallery.append(entry);
    try {
      const [frontSrc,qrSrc]=await Promise.all([imageData(card.front_path),imageData(card.qr_path)]);
      if(!current()) return;
      const flip=document.createElement('button');
      flip.type='button';
      flip.setAttribute('aria-pressed','false');
      flip.setAttribute('aria-label',say('Voltear carta','Flip card'));
      flip.innerHTML='<span class="cards-3d-face cards-3d-front"><img></span><span class="cards-3d-face cards-3d-back" aria-hidden="true"><strong>JxJ</strong><img><small>'+say('Escanea para abrir tu regalo','Scan to open your gift')+'</small></span>';
      const [front,back]=flip.children;
      front.querySelector('img').src=frontSrc;
      front.querySelector('img').alt=card.title;
      back.querySelector('img').src=qrSrc;
      back.querySelector('img').alt=say('QR del regalo','Gift QR code');
      flip.onclick=()=>{
        const flipped=flip.getAttribute('aria-pressed')==='false';
        flip.setAttribute('aria-pressed',String(flipped));
        front.setAttribute('aria-hidden',String(flipped));
        back.setAttribute('aria-hidden',String(!flipped));
        hint.textContent=flipped?say('Escanea el QR desde otro dispositivo.','Scan the QR from another device.'):say('Toca la carta para voltearla.','Tap the card to flip it.');
      };
      entry.insertBefore(flip,hint);
      hint.textContent=say('Toca la carta para voltearla.','Tap the card to flip it.');
    } catch {
      if(current()) hint.textContent=say('No pudimos cargar esta carta. Vuelve a abrir el apartado.','Could not load this card. Reopen this section to try again.');
    }
  }));
};
