const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('supabase/functions/yuki-chat/index.ts','utf8');
const gate=source.indexOf("Deno.env.get('YUKI_REVIEWED_MEMORY_AI_ENABLED') === 'true'");
const lookup=source.indexOf("db.from('yuki_memory_proposals')");
const saved=source.indexOf("db.from('yuki_chat_turns').insert");
assert.ok(gate>=0,'Reviewed memory integration must be explicitly opt-in');
assert.ok(lookup>gate&&lookup<saved,'Reviewed memory must only be read inside the opt-in block');
const guarded=source.slice(gate,source.indexOf('\n    }',lookup));
for(const check of ["profile.data.handle === 'jesus'","db.from('yuki_memory_proposals')",".eq('owner_id',uid)",".eq('status','approved')",".limit(20)"]){assert.ok(guarded.includes(check),'Missing reviewed-memory guard: '+check)}
assert.ok(!guarded.includes("admin.from('yuki_memory_proposals')"),'Must use RLS-scoped client for private proposals');
assert.ok(source.includes('reviewedMemories,visibleActivities'),'Reviewed memories must be supplied separately to Gemini');
console.log('PASS: Gemini reviewed-memory gate and owner-only approved query');
