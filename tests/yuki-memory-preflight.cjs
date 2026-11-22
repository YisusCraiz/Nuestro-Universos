const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('supabase/functions/yuki-memory-preflight/index.ts','utf8');
assert.ok(source.includes("request.method!=='POST'"),'Preflight must reject non-POST requests');
for(const required of [
 "request.headers.get('Authorization')",
 "db.auth.getUser(match[1])",
 "!['jesus','julisa'].includes(profile?.handle)",
 ".eq('owner_id',uid)",
 ".eq('status','approved')",
 ".in('visibility',['private','shared'])",
 ".eq('visibility','surprise')",
 "head:true",
 "'Cache-Control':'no-store'",
 "geminiUsed:false",
 "memoryTextReturned:false"
])assert.ok(source.includes(required),'Preflight missing privacy guard: '+required);
assert.ok(!source.includes('GEMINI_API_KEY'),'Preflight must not have Gemini credentials');
assert.ok(!source.includes('SUPABASE_SERVICE_ROLE_KEY'),'Preflight must not bypass RLS');
assert.ok(!source.includes('memory_text'),'Preflight must not query memory content');
assert.ok(source.includes('return respond({code:\'forbidden\'},403)'),'Preflight must deny unsupported profiles');
console.log('PASS: preflight is JWT-gated, owner-only, RLS-scoped, count-only and no Gemini');
