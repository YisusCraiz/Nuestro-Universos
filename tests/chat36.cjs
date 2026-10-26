const fs=require('fs'),assert=require('node:assert/strict');
const {fixture,HOST,GUEST,OUT}=require('./vs32.cjs');
(async()=>{const pg=await fixture();try{
await pg.exec(fs.readFileSync('supabase/61-mini-chat-premios.sql','utf8'));
await pg.exec('grant select on storage.objects to authenticated;create policy chat_test_storage on storage.objects for select to authenticated using(public.is_member());');
const as=async id=>{await pg.exec('reset role');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await pg.exec('set role authenticated');};
await as(HOST);const id=crypto.randomUUID();await pg.query('insert into public.jj_chat_messages(id,sender,body,kind) values($1,$2,$3,$4)',[id,HOST,'Sala ABC123 https://example.com','text']);
await as(GUEST);assert.equal((await pg.query('select * from public.jj_chat_messages')).rows.length,1);
await assert.rejects(pg.query("insert into public.jj_chat_messages(id,sender,body,kind) values(gen_random_uuid(),$1,'spoof','text')",[HOST]));
await assert.rejects(pg.query("insert into public.jj_chat_messages(id,sender,body,kind) values(gen_random_uuid(),$1,'','text')",[GUEST]));
await assert.rejects(pg.query("insert into public.jj_chat_messages(id,sender,kind,path) values(gen_random_uuid(),$1,'image','missing.png')",[GUEST]));
await assert.rejects(pg.query("delete from public.jj_chat_messages"));
await pg.query("insert into public.jj_chat_messages(id,sender,kind,builtin) values(gen_random_uuid(),$1,'sticker',0)",[GUEST]);
await pg.exec('reset role');await pg.query("insert into storage.objects values('universe','test.png'),('universe','test.webm')");await as(HOST);
for(const [kind,path] of [['image','test.png'],['sticker','test.png'],['audio','test.webm']])await pg.query('insert into public.jj_chat_messages(id,sender,kind,path) values(gen_random_uuid(),$1,$2,$3)',[HOST,kind,path]);
await as(OUT);assert.equal((await pg.query('select * from public.jj_chat_messages')).rows.length,0);await assert.rejects(pg.query("insert into public.jj_chat_messages(id,sender,body,kind) values(gen_random_uuid(),$1,'intruder','text')",[OUT]));
await pg.exec('reset role');await pg.query("insert into public.jj_money_log values($1,gen_random_uuid(),'test','{}',0,10000,'{}',now())",[HOST]);await as(HOST);
const casino=async(a,d={},r=crypto.randomUUID())=>(await pg.query('select public.jj_casino($1,$2,$3) d',[a,r,JSON.stringify(d)])).rows[0].d;
let wins=0;for(let i=0;i<60;i++){const request=crypto.randomUUID(),before=await casino('read'),r=await casino('roulette',{stake:1,bet:'red'},request);assert.equal(r.payout-(r.casino_bonus||0),r.color==='red'?3:0);assert.equal(r.jxj,before.jxj+r.payout-1);const replay=await casino('roulette',{stake:1,bet:'red'},request);assert.equal(replay.jxj,r.jxj);if(r.payout)wins++;}assert(wins>0);
for(const [a,d] of [['slots',{}],['horse',{horse:2}]])for(let i=0;i<30;i++){const r=await casino(a,{stake:3,...d});assert.equal(r.payout-(r.casino_bonus||0),Math.ceil(3*r.multiplier*1.25));}
const original=fs.readFileSync('supabase/32-vs-economia.sql','utf8').split('\n').filter(l=>l.includes('random()')).map(l=>l.split('mult:=')[0]);const updated=fs.readFileSync('supabase/61-mini-chat-premios.sql','utf8').split('\n').filter(l=>l.includes('random()')).map(l=>l.split('mult:=')[0]);assert.deepEqual(updated,original);
console.log('PASS: private chat, text, links, uploaded stickers/photos/audio, forged sender rejection, outsider isolation, immutable history, +25% payouts, unchanged random draws, idempotent casino receipts.');
}finally{await pg.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
