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
 const db={
  auth:{getUser:async()=>({data:{user:handle===null?null:user},error:null}),onAuthStateChange:callback=>{authListener=callback;return {data:{subscription:{unsubscribe(){}}}}}},
  from(table){
   if(table==='profiles')return {select:()=>({eq:()=>({single:async()=>({data:{handle},error:null})})})};
   if(table==='yuki_memory_proposals'){
    proposalsQueried++;
    return {select:()=>({eq:()=>({order:()=>({limit:async()=>({data:[],error:null})})})})};
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
  window.document.getElementById('memory').value='PRIVATE DRAFT';
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
