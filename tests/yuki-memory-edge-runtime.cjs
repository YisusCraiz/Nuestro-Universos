const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const source=fs.readFileSync('supabase/functions/yuki-chat/index.ts','utf8');
const start=source.indexOf('    let reviewedMemories: string[] = [];');
const stop=source.indexOf('    const saved = await db.from(',start);
assert.ok(start>=0&&stop>start,'Reviewed memory server block exists');
const block=source.slice(start,stop)
 .replace('let reviewedMemories: string[] = [];','let reviewedMemories = [];')
 .replace('(value):value is string=>','(value)=>');
const probe=new vm.Script('(async()=>{'+block+';return reviewedMemories;})()');
const rows=[
 {owner_id:'user-1',status:'approved',visibility:'private',memory_text:'PRIVATE APPROVED'},
 {owner_id:'user-1',status:'approved',visibility:'shared',memory_text:'SHARED APPROVED'},
 {owner_id:'user-1',status:'approved',visibility:'surprise',memory_text:'SECRET SURPRISE'},
 {owner_id:'user-1',status:'pending',visibility:'private',memory_text:'UNAPPROVED'},
 {owner_id:'user-2',status:'approved',visibility:'private',memory_text:'OTHER OWNER'}
];
async function run({enabled=true,consent=true,handle='jesus',owner='user-1',error=false}={}){
 const query={clauses:[],eq(field,value){this.clauses.push([field,value]);return this;},in(field,values){this.clauses.push([field,values]);return this;},order(field,options){assert.equal(field,'approved_at');assert.equal(options.ascending,false);return this;},async limit(n){
 assert.equal(n,20,'Only 20 approved memories maximum');
 if(error)return {data:null,error:{message:'mock database unavailable'}};
 const matching=rows.filter(row=>this.clauses.every(([field,wanted])=>Array.isArray(wanted)?wanted.includes(row[field]):row[field]===wanted));
 return {data:matching,error:null};
 }};
 let reads=0;
 const db={from(name){assert.equal(name,'yuki_memory_proposals');reads++;return {select(fields){assert.equal(fields,'memory_text');return query;}}}};
 const sandbox={Deno:{env:{get(name){if(name==='YUKI_REVIEWED_MEMORY_AI_ENABLED')return enabled?'true':undefined;if(name==='YUKI_REVIEWED_MEMORY_OWNER_CONSENT')return consent?'true':undefined;throw Error('Unexpected environment flag: '+name);}}},profile:{data:{handle}},db,uid:owner,json:(payload,status)=>({payload,status})};
 const result=await probe.runInNewContext(sandbox);
 return {result:Array.isArray(result)?Array.from(result):result,reads};
}
(async()=>{
 let out=await run();
 assert.deepEqual(out.result,['PRIVATE APPROVED','SHARED APPROVED'],'Only owner-approved non-surprises reach the model');
 assert.equal(out.reads,1);
 out=await run({consent:false});
 assert.deepEqual(out.result,[],'Missing owner consent prevents Gemini context');
 assert.equal(out.reads,0,'Missing owner consent prevents private memory reads');
 out=await run({enabled:false});
 assert.deepEqual(out.result,[],'Feature disabled means no reviewed memory context');
 assert.equal(out.reads,0,'Feature disabled means no private table read');
 out=await run({handle:'julisa'});
 assert.deepEqual(out.result,[],'Julie never inherits the owner reviewed memories');
 assert.equal(out.reads,0);
 out=await run({owner:'user-2'});
 assert.deepEqual(out.result,['OTHER OWNER'],'Owner filter isolates other users');
 rows[0].status='pending';
 out=await run();
 assert.deepEqual(out.result,['SHARED APPROVED'],'Revoked approval is not in next retrieval');
 rows[0].status='approved';
 out=await run({error:true});
 assert.equal(out.result.status,503,'Database error prevents generation with stale context');
 assert.equal(out.result.payload.code,'reviewed_memory_unavailable');
 console.log('PASS: runtime memory gate, owner isolation, approval, revocation, surprises, and unavailable data fail-closed');
})().catch(e=>{console.error(e);process.exitCode=1});
