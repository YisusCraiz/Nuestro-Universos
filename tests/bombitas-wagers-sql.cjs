// Optional local PostgreSQL test: install @electric-sql/pglite or set PGLITE_MODULE.
const {PGlite}=require(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002',C='00000000-0000-4000-8000-000000000003';
(async()=>{const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;create schema realtime;
create table auth.users(id uuid primary key);create table public.profiles(id uuid primary key,handle text,display_name text,earned int);
create table realtime.messages(extension text);create function auth.uid() returns uuid language sql as $$select current_setting('app.user',true)::uuid$$;
create function realtime.topic() returns text language sql as $$select 'test'::text$$;
create function public.is_member() returns boolean language sql as $$select exists(select 1 from public.profiles where id=auth.uid())$$;
create function public.is_jesus() returns boolean language sql as $$select auth.uid()='${A}'::uuid$$;
create function public.jj_dashboard() returns jsonb language sql as $$select jsonb_build_object('coins',earned) from public.profiles where id=auth.uid()$$;
insert into auth.users values('${A}'),('${B}'),('${C}');insert into public.profiles values('${A}','jesus','Jesús',10),('${B}','julisa','Julissa',4),('${C}','other','Other',100);`);
 for(const f of ['25-bombitas.sql','26-bombitas-apuestas.sql','26-bombitas-apuestas.sql'])await db.exec(fs.readFileSync(path.join(__dirname,'../supabase',f),'utf8'));
 const as=async id=>db.query("select set_config('app.user',$1,false)",[id]);
 const rpc=async(action,code='',id=null,amount=0,rules={seconds:60,wins:3},winner=null)=>(await db.query('select public.bb_wager($1,$2,$3,$4,$5,$6) as d',[action,code,id,amount,JSON.stringify(rules),winner])).rows[0].d;
 const wallet=async()=> (await db.query('select public.bb_shop() as d')).rows[0].d;
 const buy=async skin=>db.query("select public.bb_shop('buy',$1)",[skin]);
 const reject=async(p,code)=>{await assert.rejects(p,e=>e.message.includes(code));};
 await as(A);let room=(await db.query("select public.bb_room('create') as d")).rows[0].d;await as(B);await db.query("select public.bb_room('join',$1)",[room.code]);
 await as(A);let id=crypto.randomUUID(),w=await rpc('propose',room.code,id,5);assert.equal(w.coins,5);assert.equal((await rpc('propose',room.code,id,5)).coins,5);await reject(rpc('propose',room.code,id,6),'REQUEST_MISMATCH');await reject(rpc('start','',id),'BOTH_MUST_ACCEPT');
 await as(B);await reject(rpc('accept','',id),'INSUFFICIENT_COINS');assert.equal((await wallet()).coins,4);
 await as(A);id=crypto.randomUUID();await rpc('propose',room.code,id,3);assert.equal((await wallet()).coins,7);
 await as(B);await buy('catshirt');assert.equal((await wallet()).coins,1);await reject(rpc('accept','',id),'INSUFFICIENT_COINS');await db.query('update public.profiles set earned=10 where id=$1',[B]);await rpc('accept','',id);assert.equal((await wallet()).coins,4);await reject(rpc('start','',id),'HOST_ONLY');
 await as(A);await reject(buy('yukata'),'INSUFFICIENT_COINS');await buy('cat');assert.equal((await wallet()).coins,1);await reject(rpc('start','',id,0,{seconds:90,wins:3}),'RULES_CHANGED');await rpc('start','',id);await rpc('start','',id);assert.equal((await wallet()).coins,1);
 await as(C);await reject(rpc('read','',id),'NOT_IN_WAGER');await as(A);await rpc('result','',id,0,{},A);assert.equal((await wallet()).coins,1);await rpc('cancel','',id);assert.equal((await wallet()).reserved,3);
 await as(B);w=await rpc('result','',id,0,{},A);assert.equal(w.wager.state,'paid');assert.equal((await wallet()).coins,4);await rpc('result','',id,0,{},A);await as(A);assert.equal((await wallet()).coins,7);assert.equal((await db.query('select count(*)::int as n from public.bb_coin_transfers')).rows[0].n,2);
 // Refund cancellation, conflicting reports, expiry, and zero stake.
 id=crypto.randomUUID();await rpc('propose',room.code,id,1);assert.equal((await wallet()).reserved,1);await rpc('cancel','',id);assert.equal((await wallet()).reserved,0);
 id=crypto.randomUUID();await rpc('propose',room.code,id,1);await as(B);await rpc('accept','',id);await as(A);await rpc('start','',id);await rpc('result','',id,0,{},A);await as(B);w=await rpc('result','',id,0,{},B);assert.equal(w.wager.state,'refunded');assert.equal((await wallet()).reserved,0);
 await as(A);id=crypto.randomUUID();await rpc('propose',room.code,id,1);await db.query("update public.bb_wagers set expires=now()-interval '1 second' where id=$1",[id]);assert.equal((await wallet()).reserved,0);assert.equal((await rpc('read','',id)).wager.state,'refunded');
 id=crypto.randomUUID();await rpc('propose',room.code,id,0);await as(B);await rpc('accept','',id);await as(A);await rpc('start','',id);assert.equal((await wallet()).reserved,0);await rpc('cancel','',id);
 await reject(rpc('propose',room.code,crypto.randomUUID(),-1),'BAD_AMOUNT');
 // Transfer income can buy a skin even when original mission income is lower.
 await db.exec('truncate public.bb_coin_transfers,public.bb_wagers,public.bb_inventory;update public.profiles set earned=4;');
 id=crypto.randomUUID();await rpc('propose',room.code,id,4);assert.equal((await wallet()).coins,0);await as(B);await rpc('accept','',id);await as(A);await rpc('start','',id);await rpc('result','',id,0,{},A);await as(B);await rpc('result','',id,0,{},A);assert.equal((await wallet()).coins,0);await as(A);assert.equal((await wallet()).coins,8);await buy('yukata');assert.equal((await wallet()).coins,0);await buy('yukata');assert.equal((await wallet()).coins,0);
 // Exercise the shipped client against the real SQL, including recovery after a lost reply.
 const W=require('../bombitas-wagers');await db.exec('truncate public.bb_coin_transfers,public.bb_wagers,public.bb_inventory;update public.profiles set earned=20;');
 const storage=new Map(),store={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};let calls=0,lostReply=false;
 const controller=id=>W.create({user:id,room:()=>room,storage:store,rpc:async(name,args)=>{calls++;return db.transaction(async tx=>{await tx.query("select set_config('app.user',$1,true)",[id]);const result=(await tx.query('select public.bb_wager($1,$2,$3,$4,$5,$6) as d',[args.p_action,args.p_code||'',args.p_id||null,args.p_amount||0,JSON.stringify(args.p_rules||{}),args.p_winner||null])).rows[0].d;return result;}).then(r=>{if(lostReply&&args.p_action==='result'){lostReply=false;throw Error('reply lost');}return r;});}});
 const ca=controller(A),cb=controller(B),rules={seconds:60,wins:3};assert.equal(await ca.start(0,rules),null);assert.equal(calls,0);await ca.propose(3,rules);const firstId=ca.state.wager.id;await reject(ca.start(3,rules),'BOTH_MUST_ACCEPT');await cb.refresh();await cb.accept();await ca.refresh();assert(W.ready(ca.state.wager,3,{wins:3,seconds:60}));const match=await ca.start(3,rules);assert.equal(match,firstId);
 lostReply=true;await reject(ca.settle(match,A),'reply lost');assert(storage.get('bb-pending-wager:'+A));const recovered=controller(A);await recovered.recover();await cb.settle(match,A);await recovered.recover();assert.equal(storage.get('bb-pending-wager:'+A),undefined);await ca.refresh();await ca.propose(3,rules);assert.notEqual(ca.state.wager.id,firstId);const cancelledId=ca.state.wager.id;await ca.cancel();await ca.propose(3,rules);assert.notEqual(ca.state.wager.id,cancelledId);
 await ca.cancel();
 // Authenticated clients cannot write ledger rows directly.
 await db.exec('set role authenticated');await reject(db.query('select * from public.bb_coin_transfers'),'permission denied');await db.exec('reset role');await db.close();
 console.log('PostgreSQL wagers: migration retry, insufficient funds, full balance, purchase/escrow exclusion, consent, rule binding, roles, result agreement, idempotent payout, refund, expiry, zero stake and spending winnings passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
