const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const source=fs.readFileSync('supabase/functions/yuki-chat/index.ts','utf8');
const start=source.indexOf('    let reviewedMemories: string[] = [];');
const stop=source.indexOf('    const saved = await db.from(',start);
assert.ok(start>=0&&stop>start,'Reviewed memory server block exists');
const block=source.slice(start,stop)
 .replace('let reviewedMemories: string[] = [];','let reviewedMemories = [];')
 .replace('let sharedReviewedMemories: string[] = [];','let sharedReviewedMemories = [];')
 .replace('(row:{memory_text?:unknown})=>','(row)=>')
 .replace('(value):value is string=>','(value)=>');
const probe=new vm.Script('(async()=>{'+block+';return {own:reviewedMemories,shared:sharedReviewedMemories};})()');
const rows=[
 {owner_id:'user-1',status:'approved',visibility:'private',memory_text:'PRIVATE APPROVED'},
 {owner_id:'user-1',status:'approved',visibility:'shared',memory_text:'SHARED APPROVED'},
 {owner_id:'user-1',status:'approved',visibility:'surprise',memory_text:'SECRET SURPRISE'},
 {owner_id:'user-1',status:'pending',visibility:'private',memory_text:'UNAPPROVED'},
 {owner_id:'user-2',status:'approved',visibility:'private',memory_text:'JULIE PRIVATE APPROVED'}
];
async function run({consent=true,handle='jesus',owner='user-1',error=false,consentError=false,sharedError=false,shareAi=true}={}){
 let memoryReads=0,consentReads=0,sharedReads=0;
 const db={rpc:async(name,args)=>{assert.equal(name,'yuki_shared_memories_for_me');assert.equal(args.p_for_ai,true);sharedReads++;return sharedError?{data:null,error:{message:'mock RPC error'}}:{data:shareAi?[{memory_text:'PARTNER EXPLICITLY SHARED'}]:[],error:null};},from(name){
  if(name==='yuki_memory_ai_consent'){
   consentReads++;
   return {select(fields){assert.equal(fields,'enabled');return {eq(field,value){assert.equal(field,'owner_id');assert.equal(value,owner);return {maybeSingle:async()=>consentError?{data:null,error:{message:'mock consent error'}}:{data:consent?{enabled:true}:null,error:null}};}};}};
  }
  assert.equal(name,'yuki_memory_proposals');memoryReads++;
  const query={clauses:[],
   eq(field,value){this.clauses.push([field,value]);return this;},
   in(field,values){this.clauses.push([field,values]);return this;},
   order(field,options){assert.equal(field,'approved_at');assert.equal(options.ascending,false);return this;},
   async limit(n){
    assert.equal(n,20);
    if(error)return {data:null,error:{message:'mock data failure'}};
    return {data:rows.filter(row=>this.clauses.every(([field,wanted])=>Array.isArray(wanted)?wanted.includes(row[field]):row[field]===wanted)),error:null};
   }
  };
  return {select(fields){assert.equal(fields,'memory_text');return query;}};
 }};
 const sandbox={db,uid:owner,profile:{data:{handle}},json:(payload,status)=>({payload,status})};
 const result=await probe.runInNewContext(sandbox);
 return {result:result&&result.own?{own:Array.from(result.own),shared:Array.from(result.shared)}:result,memoryReads,consentReads,sharedReads};
}
(async()=>{
 let out=await run();
 assert.deepEqual(out.result.own,['PRIVATE APPROVED','SHARED APPROVED'],'Only approved non-surprise owner memories reach Gemini');
 assert.equal(out.memoryReads,1);
 assert.deepEqual(out.result.shared,['PARTNER EXPLICITLY SHARED'],'Gemini sees only RPC-authorized partner memories');
 out=await run({consent:false});
 assert.deepEqual(out.result.own,[],'No owner consent means no memories');
 assert.equal(out.memoryReads,0,'No consent blocks private memory queries');
 assert.equal(out.sharedReads,0,'No consent also blocks all shared Gemini queries');
 out=await run({handle:'julisa',owner:'user-2'});
 assert.deepEqual(out.result.own,['JULIE PRIVATE APPROVED'],'Julie reads only her own independently approved memories');
 out=await run({handle:'julisa'});
 assert.deepEqual(out.result.own,['PRIVATE APPROVED','SHARED APPROVED'],'Mock owner id drives isolation, not hardcoded profile');
 out=await run({handle:'outsider'});
 assert.deepEqual(out.result.own,[],'Unsupported profiles cannot receive memories');
 out=await run({shareAi:false});
 assert.deepEqual(out.result.shared,[],'Partner grant without AI permission is never included');
 rows[0].status='pending';
 out=await run();
 assert.deepEqual(out.result.own,['SHARED APPROVED'],'Revocation removes memories from next turn');
 rows[0].status='approved';
 out=await run({error:true});
 assert.equal(out.result.status,503);
 assert.equal(out.result.payload.code,'reviewed_memory_unavailable');
 out=await run({sharedError:true});
 assert.equal(out.result.status,503,'Shared RPC failures block generation');
 assert.equal(out.result.payload.code,'shared_memory_unavailable');
 out=await run({consentError:true});
 assert.equal(out.result.status,503);
 assert.equal(out.result.payload.code,'memory_consent_unavailable');
 assert.equal(out.memoryReads,0,'Failed consent lookup stops memory retrieval');
 console.log('PASS: each profile opt-in, owner isolation, approval, revocation, surprises, and failures fail closed');
})().catch(e=>{console.error(e);process.exitCode=1});
