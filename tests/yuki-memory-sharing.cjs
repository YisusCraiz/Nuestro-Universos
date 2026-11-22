const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const sql=fs.readFileSync('supabase/yuki-memory-sharing.sql','utf8');
const html=fs.readFileSync('yuki-memory-sharing.html','utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
assert.equal(scripts.length,1,'The sharing panel has one inline script');
new vm.Script(scripts[0],{filename:'yuki-memory-sharing-inline.js'});
for(const text of [
 'alter table public.yuki_memory_grants enable row level security',
 'owner_id',
 'recipient_id',
 'allow_ai boolean not null default false',
 "m.status='approved'",
 "m.visibility <> 'surprise'",
 'yuki_memory_revoke_grants_on_change',
 'delete from public.yuki_memory_grants where memory_id=old.id',
 'g.recipient_id=(select auth.uid())',
 '(not p_for_ai or g.allow_ai=true)',
 'security definer',
 'yuki_partner_for_sharing'
])assert.ok(sql.includes(text),'Missing SQL sharing security rule: '+text);
assert.ok(!sql.includes('create policy recipient_reads_proposals'),'The original memory table must not expose raw records across users');
for(const text of [
 "db.auth.getUser()",
 "db.rpc('yuki_partner_for_sharing')",
 "db.rpc('yuki_shared_memories_for_me',{p_for_ai:false})",
 "db.from('yuki_memory_grants').insert",
 "db.from('yuki_memory_grants').update({allow_ai})",
 "db.from('yuki_memory_grants').delete()",
 "['jesus','julisa'].includes",
 "if(!grant)",
 "if(allow_ai&&!confirmAction(",
 "if(!confirmAction('¿Revocar"
])assert.ok(html.includes(text),'Sharing panel missing explicit owner/recipient protection: '+text);
assert.ok(!html.includes('innerHTML='),'Do not render untrusted memory HTML');
console.log('PASS: sharing panel script, explicit grants, per-recipient RPC and automatic revocation rules');
