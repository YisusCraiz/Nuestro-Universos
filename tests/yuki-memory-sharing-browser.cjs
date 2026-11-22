const fs=require('node:fs');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('yuki-memory-sharing.html','utf8');
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean).join('\n');

async function scenario(handle){
 const errors=[],virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(html,{url:'https://example.test/yuki-memory-sharing.html',runScripts:'outside-only',virtualConsole});
 const {window}=dom;
 const id='logged-in-owner',partnerId='other-profile';
 window.UNIVERSE_CONFIG={supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'public-test-key'};
 window.confirm=()=>true;
 const grants=[];
 let writeCount=0,identityChecks=0,listener,sharedReads=0;
 const valid=['jesus','julisa'].includes(handle);
 const mkQuery=()=>{
  const query={
   eq(){return query;},
   in(){return query;},
   order(){return query;},
   limit:async()=>({data:[{id:'private-memory',memory_text:'Private test memory',status:'approved',visibility:'private'}],error:null})
  };return query;
 };
 const ownerGrantQuery=()=>{
  const query={eq(){return query;},then(resolve,reject){return Promise.resolve({data:grants.map(g=>({memory_id:g.memory_id,allow_ai:g.allow_ai})),error:null}).then(resolve,reject);}};return query;
 };
 const mutation=(kind,changes)=>{
  const q={eq(){return q;},select:async()=>{
   writeCount++;
   const current=grants[0];
   if(kind==='update'&&current){Object.assign(current,changes);return {data:[{memory_id:current.memory_id}],error:null};}
   if(kind==='delete'&&current){grants.splice(0);return {data:[{memory_id:current.memory_id}],error:null};}
   return {data:[],error:null};
  }};return q;
 };
 const db={
  auth:{getUser:async()=>{identityChecks++;return {data:{user:{id}},error:null};},onAuthStateChange:cb=>{listener=cb;return {data:{subscription:{unsubscribe(){}}}}}},
  rpc:async(name,options)=>{
   if(name==='yuki_partner_for_sharing')return {data:partnerId,error:null};
   assert.equal(name,'yuki_shared_memories_for_me');
   assert.equal(options.p_for_ai,false);
   sharedReads++;
   return {data:[{memory_id:'received-1',owner_id:partnerId,memory_text:'Partner approved memory',allow_ai:false}],error:null};
  },
  from(table){
   if(table==='profiles')return {select:()=>({eq:()=>({single:async()=>({data:{handle},error:null})})})};
   if(table==='yuki_memory_proposals')return {select:()=>mkQuery()};
   if(table==='yuki_memory_grants')return {
    select:()=>ownerGrantQuery(),
    insert:async row=>{writeCount++;grants.push(row);return {error:null};},
    update:row=>mutation('update',row),
    delete:()=>mutation('delete',{})
   };
   throw Error('Unexpected table '+table);
  }
 };
 window.supabase={createClient:()=>db};
 window.eval(inline);
 await new Promise(resolve=>setTimeout(resolve,45));
 if(valid){
  assert.ok(window.document.getElementById('notice').textContent.includes('Accesos actualizados'),'personal shared memory screen loaded');
  assert.ok(window.document.getElementById('received').textContent.includes('Partner approved memory'),'recipient can view explicitly granted memory');
  assert.ok(window.document.getElementById('owned').textContent.includes('Private test memory'),'owner can share individual private memory');
  const buttons=()=>[...window.document.querySelectorAll('#owned button')];
  buttons().find(x=>x.textContent.includes('Compartir')).click();
  await new Promise(resolve=>setTimeout(resolve,40));
  assert.equal(writeCount,1,'explicit share created one grant');
  assert.equal(grants[0].allow_ai,false,'sharing alone never grants Gemini access');
  assert.equal(grants[0].recipient_id,partnerId,'recipient resolved from server');
  buttons().find(x=>x.textContent.includes('Permitir a Yuki')).click();
  await new Promise(resolve=>setTimeout(resolve,40));
  assert.equal(grants[0].allow_ai,true,'Gemini sharing is a separate explicit action');
  buttons().find(x=>x.textContent.includes('Revocar')).click();
  await new Promise(resolve=>setTimeout(resolve,40));
  assert.equal(grants.length,0,'revocation removes the grant');
  assert.ok(identityChecks>=4,'every mutation and reload rechecks authentication');
  assert.ok(sharedReads>=4,'recipient list refreshes after permission changes');
  listener('SIGNED_OUT',null);
  assert.equal(window.document.getElementById('owned').children.length,0,'signout clears private owner memories');
  assert.equal(window.document.getElementById('received').children.length,0,'signout clears recipient memories');
  assert.equal(window.document.getElementById('refresh').disabled,true,'signout disables access');
 }else{
  assert.equal(writeCount,0,'unsupported profiles cannot share');
  assert.ok(window.document.getElementById('notice').textContent.includes('Solo Yisus o Julie'),'unsupported profiles denied');
 }
 assert.deepEqual(errors.map(e=>e.message),[],'DOM errors');
 window.close();
 console.log('PASS sharing panel '+handle);
}
(async()=>{for(const handle of ['jesus','julisa','outsider'])await scenario(handle);})().catch(e=>{console.error(e);process.exitCode=1});
