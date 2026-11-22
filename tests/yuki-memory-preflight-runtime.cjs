const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const source=fs.readFileSync('supabase/functions/yuki-memory-preflight/index.ts','utf8');
const executable=source.replace(/^import .*;\s*/m,'').replace('payload:object','payload');
assert.ok(!executable.includes('createClient } from'),'Supabase import was not isolated');

async function scenario({method='POST',token='good-token',handle='jesus',authError=false,profileError=false,queryError=false,missingCount=false,missingConfig=false}={}){
 let handler;
 let reads=0,authCalls=0,requests=[];
 const makeQuery=(table)=>{
  const query={conditions:[],head:false,
   select(fields,options={}){this.head=options.head===true;assert.equal(fields,table==='profiles'?'handle':'id');return this;},
   eq(column,value){this.conditions.push([column,value]);return this;},
   in(column,values){this.conditions.push([column,values]);return this;},
   async single(){assert.equal(table,'profiles');return {data:profileError?null:{handle},error:profileError?{message:'down'}:null};},
   then(resolve,reject){return Promise.resolve(queryError?{count:null,error:{message:'down'}}:{count:missingCount?null:table==='yuki_memory_proposals'?this.conditions.some(([col,v])=>col==='visibility'&&v==='surprise')?2:5:0,error:null}).then(resolve,reject);}
  };
  return query;
 };
 const db={
  auth:{getUser:async given=>{authCalls++;assert.equal(given,token);return {data:{user:authError?null:{id:'owner-1'}},error:authError?{message:'invalid'}:null};}},
  from(table){requests.push(table);if(table==='yuki_memory_proposals')reads++;assert.ok(['profiles','yuki_memory_proposals'].includes(table));return makeQuery(table);}
 };
 const sandbox={
  Deno:{env:{get(name){if(missingConfig)return undefined;if(name==='SUPABASE_URL')return 'https://example.test';if(name==='SUPABASE_ANON_KEY')return 'public-mock-key';throw Error('Unexpected env: '+name);}},serve:cb=>handler=cb},
  createClient:(url,key,settings)=>{assert.equal(settings.global.headers.Authorization,'Bearer '+token);assert.equal(settings.auth.persistSession,false);return db;},
  Response,console
 };
 vm.runInNewContext(executable,sandbox,{filename:'preflight-staging.js'});
 assert.equal(typeof handler,'function');
 const req=new Request('https://example.test/functions/v1/yuki-memory-preflight',{method,headers:token?{Authorization:'Bearer '+token}:{}});
 const response=await handler(req);
 const body=await response.json();
 return {status:response.status,body,reads,authCalls,requests,cache:response.headers.get('Cache-Control')};
}
(async()=>{
 const ok=await scenario();
 assert.equal(ok.status,200);
 assert.deepEqual(JSON.parse(JSON.stringify(ok.body)),{ok:true,approvedVisibleCount:5,excludedSurpriseCount:2,geminiUsed:false,memoryTextReturned:false});
 assert.equal(ok.reads,2);
 assert.equal(ok.cache,'no-store');
 const anon=await scenario({token:null});
 assert.equal(anon.status,401);assert.equal(anon.reads,0);assert.equal(anon.authCalls,0);
 const invalid=await scenario({authError:true});
 assert.equal(invalid.status,401);assert.equal(invalid.reads,0);
 const julie=await scenario({handle:'julisa'});
 assert.equal(julie.status,403);assert.equal(julie.reads,0);
 const failedProfile=await scenario({profileError:true});
 assert.equal(failedProfile.status,403);assert.equal(failedProfile.reads,0);
 const failedDB=await scenario({queryError:true});
 assert.equal(failedDB.status,503);assert.equal(failedDB.body.code,'query_unavailable');
 const missingCounts=await scenario({missingCount:true});
 assert.equal(missingCounts.status,503,'Missing database count must fail closed');
 assert.equal(missingCounts.body.code,'query_unavailable');
 const noSettings=await scenario({missingConfig:true});
 assert.equal(noSettings.status,503);assert.equal(noSettings.reads,0);
 const method=await scenario({method:'GET'});
 assert.equal(method.status,405);assert.equal(method.authCalls,0);
 console.log('PASS: preflight runtime owner counts, no token, invalid token, Julie denied, DB failure, missing config and non-POST');
})().catch(error=>{console.error(error);process.exitCode=1;});
