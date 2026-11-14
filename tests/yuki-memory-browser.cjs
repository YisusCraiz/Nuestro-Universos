const fs=require('node:fs');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('yuki-memory.html','utf8');
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean).join('\n');
async function scenario(name,handle,expected){
 const errors=[];
 const virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(html,{url:'https://example.test/yuki-memory.html',runScripts:'outside-only',virtualConsole});
 const {window}=dom;
 window.UNIVERSE_CONFIG={supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'public-test-key'};
 const user={id:'user-1'};
 let proposalsQueried=0;
 let authListener=null;
 const inserted=[];
 const mutations=[];
 let mutationRows=true;
 let failAuth=false;
 let failMemoryLoad=false;
 let switchedUser=false;
 const db={
  auth:{getUser:async()=>{if(failAuth)throw Error('Network unavailable');return {data:{user:handle===null?null:(switchedUser?{id:'different-account'}:user)},error:null};},onAuthStateChange:callback=>{authListener=callback;return {data:{subscription:{unsubscribe(){}}}}}},
  from(table){
   if(table==='profiles')return {select:()=>({eq:()=>({single:async()=>({data:{handle},error:null})})})};
   if(table==='yuki_memory_proposals'){
    proposalsQueried++;
    return {
     select:()=>({eq:()=>({order:()=>({limit:async()=>failMemoryLoad?{data:null,error:{message:'Mock network error'}}:{data:inserted.map((x,i)=>({...x,id:'proposal-'+i,created_at:new Date().toISOString(),approved_at:null})),error:null}})})}),
     insert:async row=>{inserted.push(row);return {error:null};},
     update:row=>{const conditions=[];const query={eq:(field,value)=>{conditions.push([field,value]);return query;},select:async()=>{mutations.push({type:'update',row});const matches=mutationRows&&inserted[0]&&conditions.every(([field,value])=>field==='id'?value==='proposal-0':field==='owner_id'?value===user.id:inserted[0][field]===value);if(matches)Object.assign(inserted[0],row);return {data:matches?[{id:'proposal-0'}]:[],error:null};}};return query;},
     delete:()=>{const conditions=[];const query={eq:(field,value)=>{conditions.push([field,value]);return query;},select:async()=>{mutations.push({type:'delete'});const matches=mutationRows&&inserted[0]&&conditions.every(([field,value])=>field==='id'?value==='proposal-0':field==='owner_id'?value===user.id:inserted[0][field]===value);return {data:matches?[{id:'proposal-0'}]:[],error:null};}};return query;}
    };
   }
   throw Error('Unexpected table '+table);
  }
 };
 window.supabase={createClient:()=>db};
 window.eval(inline);
 await new Promise(resolve=>setTimeout(resolve,30));
 const notice=window.document.getElementById('notice').textContent;
 assert.ok(notice.includes(expected),name+': unexpected notice '+notice);
 assert.equal(proposalsQueried,handle==='jesus'?1:0,name+': unauthorized memory query');
 assert.equal(window.document.getElementById('propose').disabled,handle!=='jesus',name+': proposal access');
 if(handle==='jesus'){
  assert.equal(typeof authListener,'function','auth listener registered');
  const draft=window.document.getElementById('memory');
  draft.value='A memory awaiting individual approval';
  window.document.getElementById('propose').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(inserted.length,1,'one proposal inserted');
  assert.equal(inserted[0].status,'pending','new memories are pending, never approved');
  assert.equal(inserted[0].owner_id,user.id,'new proposal belongs to logged-in user');
  assert.equal(inserted[0].visibility,'private','default memory is private');
  assert.ok(window.document.getElementById('load-info').textContent.includes('1 recuerdos cargados'),'loaded count is explicitly shown');
  failMemoryLoad=true;
  window.document.getElementById('refresh').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(window.document.getElementById('notice').textContent.includes('No se pudo cargar'),'failed refresh must not claim success');
  assert.equal(window.document.getElementById('load-info').textContent,'','failed refresh clears stale loaded-memory count');
  failMemoryLoad=false;
  window.document.getElementById('refresh').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(window.document.getElementById('notice').textContent.includes('actualizados'),'successful refresh confirms completion');
  const cancelledEdit=window.document.querySelector('#items article textarea');
  cancelledEdit.value='Unsaved content must survive cancelled approval';
  const priorCancelledQueries=proposalsQueried;
  window.confirm=()=>false;
  const cancelledReject=[...window.document.querySelectorAll('#items article button')].find(x=>x.textContent==='Rechazar');
  cancelledReject.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(cancelledEdit.value,'Unsaved content must survive cancelled approval','cancelled rejection leaves local edits intact');
  assert.equal(proposalsQueried,priorCancelledQueries,'cancelled action does not reload memories');
  window.confirm=()=>true;
  const refresh=window.document.getElementById('refresh');
  const refreshEdit=window.document.querySelector('#items article textarea');
  refreshEdit.value='Unsubmitted edit stays here';
  const beforeRefreshQueries=proposalsQueried;
  window.confirm=()=>false;
  refresh.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(proposalsQueried,beforeRefreshQueries,'cancelled refresh must not query memories');
  assert.equal(refreshEdit.value,'Unsubmitted edit stays here','cancelled refresh preserves draft');
  window.confirm=()=>true;
  inserted[0].memory_text='A memory updated on another device';
  refresh.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(proposalsQueried>beforeRefreshQueries,'confirmed refresh fetches latest memories');
  assert.equal(window.document.querySelector('#items article textarea').value,'A memory updated on another device','confirmed refresh shows latest text');
  inserted[0].memory_text='A memory awaiting individual approval';
  refresh.click();
  await new Promise(resolve=>setTimeout(resolve,30));

  const staleEdit=window.document.querySelector('#items article textarea');
  staleEdit.value='An older local edit';
  inserted[0].memory_text='A newer edit from another device';
  const beforeStaleSave=mutations.length;
  const staleSave=[...window.document.querySelectorAll('#items article button')].find(x=>x.textContent==='Guardar cambios');
  staleSave.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,beforeStaleSave+1,'stale save attempted a guarded update');
  assert.equal(inserted[0].memory_text,'A newer edit from another device','stale save preserves concurrent text');
  assert.ok(window.document.getElementById('notice').textContent.includes('Se cargó su versión actual'),'stale save reports conflict');
  inserted[0].memory_text='A memory awaiting individual approval';

  refresh.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(draft.value,'','draft cleared after successful submission');
  const editable=window.document.querySelector('#items article textarea');
  editable.value='Unsaved modification';
  window.confirm=()=>true;
  let buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Aprobar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,1,'unsaved edits must block approval');
  assert.ok(window.document.getElementById('notice').textContent.includes('Primero guarda los cambios'),'unsaved edit warning shown');
  editable.value='A memory awaiting individual approval';
  window.confirm=()=>false;
  buttons=[...window.document.querySelectorAll('#items article button')];
  assert.equal(buttons.length,4,'four review actions available for pending proposals');
  buttons.find(x=>x.textContent==='Aprobar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,1,'cancelled approval must not mutate');
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Eliminar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,1,'cancelled deletion must not mutate');
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Rechazar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,1,'cancelled rejection must not mutate');
  window.confirm=()=>true;
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Aprobar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.at(-1)?.row?.status,'approved','approval requires explicit action');
  buttons=[...window.document.querySelectorAll('#items article button')];
  assert.ok(buttons.some(x=>x.textContent==='Revocar aprobación'),'approved memory exposes revoke action');
  window.confirm=()=>false;
  const beforeRevoke=mutations.length;
  buttons.find(x=>x.textContent==='Revocar aprobación').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,beforeRevoke,'cancelled revocation does not mutate');
  window.confirm=()=>true;
  buttons=[...window.document.querySelectorAll('#items article button')];
  const unsavedText=window.document.querySelector('#items article textarea');
  unsavedText.value='DO NOT SAVE THIS UNSAVED EDIT';
  buttons.find(x=>x.textContent==='Revocar aprobación').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.at(-1)?.row?.status,'pending','revocation returns memory to pending');
  assert.deepEqual(Object.keys(mutations.at(-1).row),['status'],'revocation must not overwrite memory text or visibility');
  assert.equal(inserted[0].memory_text,'A memory awaiting individual approval','unsaved text is not persisted during revocation');
  assert.equal(inserted[0].status,'pending','revocation persisted pending status');
  // A stale card must not delete a memory whose privacy changed elsewhere.
  const staleDelete=[...window.document.querySelectorAll('#items article button')].find(x=>x.textContent==='Eliminar');
  assert.ok(staleDelete,'pending card exposes delete action');
  inserted[0].visibility='shared';
  const beforeDeleteConflict=mutations.length;
  staleDelete.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,beforeDeleteConflict+1,'stale delete attempted a guarded operation');
  assert.equal(inserted[0].visibility,'shared','concurrent privacy edit survives stale delete');
  assert.ok(window.document.getElementById('notice').textContent.includes('Se cargó su versión actual'),'stale delete reports conflict');
  inserted[0].visibility='private';

  // A stale pending card must not approve text changed on another device.
  const staleApprove=[...window.document.querySelectorAll('#items article button')].find(x=>x.textContent==='Aprobar');
  assert.ok(staleApprove,'pending card offers approval');
  inserted[0].memory_text='Updated from another device';
  const beforeStaleApprove=mutations.length;
  staleApprove.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,beforeStaleApprove+1,'stale approval attempted one guarded update');
  assert.equal(inserted[0].status,'pending','stale approval cannot approve changed text');
  assert.equal(inserted[0].memory_text,'Updated from another device','concurrent text remains intact');
  assert.ok(window.document.getElementById('notice').textContent.includes('Se cargó su versión actual'),'stale approval reports conflict');
  // The conflict refresh now displays the newer text, so approve that version.

  // A stale approved card must not undo a concurrent status change.
  const reloadButton=[...window.document.querySelectorAll('#items article button')].find(x=>x.textContent==='Aprobar');
  assert.ok(reloadButton,'pending card shows approve action after revocation');
  reloadButton.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(inserted[0].status,'approved','re-approval persisted');
  const staleRevoke=[...window.document.querySelectorAll('#items article button')].find(x=>x.textContent==='Revocar aprobación');
  assert.ok(staleRevoke,'approved card offers revocation');
  inserted[0].visibility='shared'; // Concurrent privacy edit.
  const beforePrivacyConflict=mutations.length;
  staleRevoke.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,beforePrivacyConflict+1,'stale revocation attempts guarded update');
  assert.equal(inserted[0].status,'approved','stale revocation cannot overwrite changed visibility');
  assert.equal(inserted[0].visibility,'shared','concurrent visibility change remains intact');
  assert.ok(window.document.getElementById('notice').textContent.includes('Se cargó su versión actual'),'visibility conflict is reported');
  inserted[0].visibility='private';
  // The stale card is reloaded after the failed update.
  const currentRevoke=[...window.document.querySelectorAll('#items article button')].find(x=>x.textContent==='Revocar aprobación');
  assert.ok(currentRevoke,'reloaded approved card still has revoke action');

  inserted[0].status='rejected'; // Concurrent edit after card render.
  const beforeStale=mutations.length;
  currentRevoke.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,beforeStale+1,'stale revoke attempted exactly one guarded update');
  assert.equal(inserted[0].status,'rejected','stale revocation did not overwrite concurrent rejection');
  assert.ok(window.document.getElementById('notice').textContent.includes('Se cargó su versión actual'),'stale revoke reports conflict');
  // The stale update refreshes the panel to the rejected state.
  let rejectedButtons=[...window.document.querySelectorAll('#items article button')];
  assert.ok(!rejectedButtons.some(x=>x.textContent==='Aprobar'),'rejected memory cannot be approved directly');
  assert.ok(!rejectedButtons.some(x=>x.textContent==='Rechazar'),'rejected memory cannot be redundantly rejected');
  const restore=rejectedButtons.find(x=>x.textContent==='Volver a pendiente');
  assert.ok(restore,'rejected memory offers a return to review');
  restore.click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(inserted[0].status,'pending','restoring rejected memory does not approve it');
  assert.deepEqual(Object.keys(mutations.at(-1).row),['status'],'restoring only changes status');
  assert.ok([...window.document.querySelectorAll('#items article button')].some(x=>x.textContent==='Aprobar'),'restored pending memory can be reviewed');

  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Rechazar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.at(-1)?.row?.status,'rejected','rejection updates proposal status');
  assert.deepEqual(Object.keys(mutations.at(-1).row),['status'],'rejection must not save unsaved memory edits');
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Eliminar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.at(-1)?.type,'delete','delete action requires confirmation');
  mutationRows=false;
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Volver a pendiente').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(window.document.getElementById('notice').textContent.includes('Se cargó su versión actual'),'zero-row update reports error');
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Eliminar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(window.document.getElementById('notice').textContent.includes('Se cargó su versión actual'),'zero-row delete refreshes the current version');
  const conflictingEdit=window.document.querySelector('#items article textarea');
  conflictingEdit.value='Keep this local edit during a conflict';
  const queriesBeforeConflictCancel=proposalsQueried;
  let conflictConfirmationCount=0;
  window.confirm=()=>++conflictConfirmationCount===1;
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Volver a pendiente').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(conflictConfirmationCount,2,'restore confirmation and conflict reload confirmation both shown');
  assert.equal(proposalsQueried,queriesBeforeConflictCancel+1,'declined conflict reload only performs the attempted update, without another list fetch');
  assert.equal(conflictingEdit.value,'Keep this local edit during a conflict','declined conflict reload preserves local edits');
  assert.ok(window.document.getElementById('notice').textContent.includes('Conservamos tu borrador local'),'conflict explains local draft is preserved');
  window.confirm=()=>true;
  draft.value='PRIVATE DRAFT';
  switchedUser=true;
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Volver a pendiente').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(window.document.getElementById('items').children.length,0,'account switch hides private memories');
  assert.equal(draft.value,'','account switch clears draft');
  assert.equal(window.document.getElementById('load-info').textContent,'','account switch clears loaded-memory metadata');
  assert.equal(window.document.getElementById('propose').disabled,true,'account switch locks proposal creation');
  switchedUser=false;

  authListener('SIGNED_OUT',null);
  assert.equal(window.document.getElementById('memory').value,'','draft cleared on sign-out');
  assert.equal(window.document.getElementById('propose').disabled,true,'submission disabled on sign-out');
  assert.equal(window.document.getElementById('items').children.length,0,'items cleared on sign-out');
 }
 assert.deepEqual(errors.map(e=>e.message),[],name+': browser script errors');
 window.close();
 console.log('PASS',name);
}
(async()=>{
 await scenario('Unauthenticated',null,'Inicia sesión');
 await scenario('Julie cannot access Yisus panel','julisa','reservado para Yisus');
 await scenario('Yisus can load empty memory panel','jesus','Tus recuerdos');
})().catch(e=>{console.error(e);process.exitCode=1;});
