const fs=require('node:fs'),assert=require('node:assert/strict');
const {fixture:base,HOST,GUEST,SONG}=require('./piano34.cjs');
const migration='supabase/migrations/20261024205059_uno_rewards_balance.sql';
async function fixture(){const pg=await base();await pg.exec(fs.readFileSync(migration,'utf8'));return pg;}
module.exports={fixture};
if(require.main===module)(async()=>{const pg=await fixture();let checks=0;const check=x=>{assert.ok(x);checks++;};
const as=async id=>{await pg.exec('reset role');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await pg.exec('set role authenticated');};
const score=async(n,id=crypto.randomUUID())=>pg.query("select public.record_game_once('memory',$1,$2)",[n,id]);
const reward=async id=>(await pg.query('select public.jj_arcade_reward($1) d',[id])).rows[0].d;
await as(GUEST);await score(1000);await as(HOST);let id=crypto.randomUUID();await score(100,id);check((await reward(id)).reward===3);id=crypto.randomUUID();await score(110,id);check((await reward(id)).reward===6);check((await reward(id)).record===true);await score(110,id);check((await reward(id)).reward===6);
for(let n=120;n<=200;n+=10)await score(n);
await pg.exec('reset role');check(+(await pg.query("select sum(jj) n from public.jj_money_log where user_id=$1 and kind='arcade'",[HOST])).rows[0].n===45);
await as(HOST);id=crypto.randomUUID();await score(210,id);check((await reward(id)).reward===0);
await as(GUEST);for(let i=0;i<11;i++)await score(1000);id=crypto.randomUUID();await score(1100,id);check((await reward(id)).reward===0);
// A new local day restores rewards; failed piano performances earn zero.
await pg.exec('reset role');await pg.exec("update public.jj_money_log set created_at=((now() at time zone 'America/Matamoros')::date::timestamp at time zone 'America/Matamoros')-interval '1 second'");await as(HOST);
const piano=async(a,id,data={})=>(await pg.query('select public.jj_piano($1,$2,$3) d',[a,id,JSON.stringify(data)])).rows[0].d;
async function finish(ratio){const id=crypto.randomUUID(),run=await piano('start',id,{song:SONG,difficulty:1,duration:20,times:Array.from({length:30},(_,i)=>1200+i*600)});await pg.exec('reset role');await pg.query("update public.jj_piano_runs set started=clock_timestamp()-interval '25 seconds' where id=$1",[id]);await as(HOST);const events=run.notes.slice(0,Math.floor(30*ratio)).map(n=>[n.t,n.l]);const d=await piano('finish',id,{events});check((await piano('finish',id,{events})).reward===d.reward);return d;}
check((await finish(0)).reward===0);check((await finish(.8)).reward===5);const perfect=await finish(1);check(perfect.reward===8&&perfect.improved);
// Casino: bonus is bounded, net/payout/balance agree, retries do not mint a second bonus.
await pg.exec('reset role');await pg.query("insert into public.jj_money_log values($1,gen_random_uuid(),'test','{}',1000,0,'{}',now())",[HOST]);await as(HOST);
const casino=async(a='read',data={},id=crypto.randomUUID())=>(await pg.query('select public.jj_casino($1,$2,$3) d',[a,id,JSON.stringify(data)])).rows[0].d;
await casino('buy',{amount:100});
const hand=await casino('poker_deal',{stake:1});check(!hand.casino_bonus);await pg.exec('reset role');await pg.query("update public.jj_money_log set result=jsonb_set(result,'{cards}','[0,1,2,3,4]'::jsonb) where user_id=$1 and request=$2",[HOST,hand.deal]);await as(HOST);
const drawId=crypto.randomUUID(),draw=await casino('poker_draw',{deal:hand.deal,hold:[0,1,2,3,4]},drawId);check(draw.casino_bonus===1&&draw.payout===51&&draw.net===50);check((await casino('poker_draw',{deal:hand.deal,hold:[0,1,2,3,4]},drawId)).jxj===draw.jxj);
await pg.exec('select setseed(0.42)');let bonus=0;for(let i=0;i<30;i++){const before=await casino(),id=crypto.randomUUID(),d=await casino('roulette',{stake:1,bet:'red'},id);bonus+=d.casino_bonus||0;check(d.jxj===before.jxj+d.net);check(d.payout===d.multiplier+(d.casino_bonus||0));const replay=await casino('roulette',{stake:1,bet:'red'},id);check(replay.jxj===d.jxj&&replay.casino_bonus===d.casino_bonus);}
check(bonus===2);await pg.exec('reset role');check(+(await pg.query("select sum((result->>'casino_bonus')::int) n from public.jj_money_log where user_id=$1",[HOST])).rows[0].n===3);
console.log(`PASS: ${checks} reward checks: own records, 45 JJ/12 games, next local day, piano grades/replay and casino bonus cap/accounting.`);await pg.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
