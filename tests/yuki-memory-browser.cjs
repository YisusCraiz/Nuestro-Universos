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
 const db={
  auth:{getUser:async()=>({data:{user:handle===null?null:user},error:null}),onAuthStateChange:callback=>{authListener=callback;return {data:{subscription:{unsubscribe(){}}}}}},
  from(table){
   if(table==='profiles')return {select:()=>({eq:()=>({single:async()=>({data:{handle},error:null})})})};
   if(table==='yuki_memory_proposals'){
    proposalsQueried++;
    return {
     select:()=>({eq:()=>({order:()=>({limit:async()=>({data:inserted.map((x,i)=>({...x,id:'proposal-'+i,created_at:new Date().toISOString(),approved_at:null})),error:null})})})}),
     insert:async row=>{inserted.push(row);return {error:null};},
     update:row=>({eq:()=>({eq:async()=>{mutations.push({type:'update',row});return {error:null};}})}),
     delete:()=>({eq:()=>({eq:async()=>{mutations.push({type:'delete'});return {error:null};}})})
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
  assert.equal(draft.value,'','draft cleared after successful submission');
  window.confirm=()=>false;
  let buttons=[...window.document.querySelectorAll('#items article button')];
  assert.equal(buttons.length,4,'four review actions available');
  buttons.find(x=>x.textContent==='Aprobar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,0,'cancelled approval must not mutate');
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Eliminar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.length,0,'cancelled deletion must not mutate');
  window.confirm=()=>true;
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Aprobar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.at(-1)?.row?.status,'approved','approval requires explicit action');
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Rechazar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.at(-1)?.row?.status,'rejected','rejection updates proposal status');
  buttons=[...window.document.querySelectorAll('#items article button')];
  buttons.find(x=>x.textContent==='Eliminar').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(mutations.at(-1)?.type,'delete','delete action requires confirmation');
  draft.value='PRIVATE DRAFT';
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
