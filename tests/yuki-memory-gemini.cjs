const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('supabase/functions/yuki-chat/index.ts','utf8');
const gate=source.indexOf("db.from('yuki_memory_ai_consent')");
const lookup=source.indexOf("db.from('yuki_memory_proposals')");
const saved=source.indexOf("db.from('yuki_chat_turns').insert");
assert.ok(gate>=0&&lookup>gate&&lookup<saved,'Consent must be checked before memory retrieval and chat persistence');
const guarded=source.slice(gate,saved);
for(const check of [".eq('owner_id',uid)","memoryConsent?.enabled===true","['jesus','julisa'].includes(profile.data.handle)","db.from('yuki_memory_proposals')",".eq('status','approved')",".in('visibility',['private','shared'])",".limit(20)"]){assert.ok(guarded.includes(check),'Missing Gemini memory privacy requirement: '+check)}
assert.ok(guarded.includes('if(memoryConsentError)return json'),'Consent query failures must fail closed');
assert.ok(guarded.includes("typeof value==='string' && value.trim().length>0"),'Blank memories filtered');
assert.ok(guarded.includes('value.slice(0,4000)'),'Bound text size');
assert.ok(!guarded.includes("admin.from('yuki_memory_proposals')"),'RLS-scoped client required');
assert.ok(source.includes('reviewedMemories,visibleActivities'),'Only reviewed context included separately');
console.log('PASS: Gemini uses only independently consented approved memories from current profile');
