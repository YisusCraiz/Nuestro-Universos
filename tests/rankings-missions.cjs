const fs=require('node:fs'),assert=require('node:assert/strict');
const {fixture:base,HOST,GUEST,OUT}=require('./vs32.cjs');
async function fixture(){
 const pg=await base();await pg.exec(`
 create table public.activity_events(user_id uuid,week_start date,event text,reference text,created_at timestamptz default now(),unique(user_id,week_start,event,reference));
 create table public.mission_awards(user_id uuid,week_start date,mission text,coins int default 1,primary key(user_id,week_start,mission));
 create table public.daily_awards(user_id uuid,day date,mission text,coins int default 1,primary key(user_id,day,mission));
 create table public.game_rewards(user_id uuid,coins int);
 create table public.jj_pet_inventory(user_id uuid,paid int);
 create table public.crown_results(period_start date,user_id uuid,first_places int,improvements int,awarded_at timestamptz default now(),primary key(period_start,user_id));
 create table public.settled_periods(period_start date primary key);
 create function public.jj_week() returns date language sql stable as $$select date_trunc('week',now() at time zone 'America/Matamoros')::date$$;
 create or replace function public.jj_claim() returns void language plpgsql security definer set search_path='' as $$begin
 insert into public.mission_awards select auth.uid(),public.jj_week(),mission,1 from public.jj_missions() where progress>=target on conflict do nothing;
 insert into public.daily_awards select auth.uid(),(now() at time zone 'America/Matamoros')::date,mission,1 from public.jj_daily() where progress>=target on conflict do nothing;end$$;
 create or replace function public.jj_dashboard_legacy32() returns jsonb language plpgsql security definer set search_path='' as $$begin
 if not public.is_member() then raise exception 'NOT_MEMBER';end if;perform public.jj_claim();
 return jsonb_build_object('coins',(select coalesce(sum(coins),0) from public.mission_awards where user_id=auth.uid())+(select coalesce(sum(coins),0) from public.daily_awards where user_id=auth.uid())+(select coalesce(sum(coins),0) from public.game_rewards where user_id=auth.uid()));end$$;
 create or replace function public.jj_dashboard() returns jsonb language plpgsql security definer set search_path='' as $$declare d jsonb;begin
 d:=public.jj_dashboard_legacy32();return d||jsonb_build_object('coins',(d->>'coins')::bigint+(select coalesce(sum(jj),0) from public.jj_money_log where user_id=auth.uid())-(select coalesce(sum(paid),0) from public.jj_pet_inventory where user_id=auth.uid()));end$$;
 `);
 await pg.exec(fs.readFileSync('tests/fixtures/crown-settlement.sql','utf8'));
 await pg.exec(fs.readFileSync('supabase/migrations/20261024181945_rankings_missions.sql','utf8'));return pg;
}
module.exports={fixture,HOST,GUEST,OUT};
if(require.main===module)(async()=>{
 const pg=await fixture();let checks=0;const check=x=>{assert.ok(x);checks++;};
 const as=async id=>{await pg.exec('reset role');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await pg.exec('set role authenticated');};
 const ranks=async()=>(await pg.query('select public.jj_rankings() d')).rows[0].d;
 await pg.query("insert into public.game_rewards values($1,100),($2,60)",[HOST,GUEST]);
 // Exact available wallet accounting: every purchase type, transfers, active/expired reservations.
 await pg.query("insert into public.jj_pet_inventory values($1,4)",[HOST]);await pg.query("insert into public.universe_title_inventory(user_id,title,paid) values($1,'moon',8)",[HOST]);
 await as(HOST);let d=await ranks();check(d.players.find(p=>p.handle==='jesus').jj===88);check(d.players.find(p=>p.handle==='julisa').jj===60);
 const buy=crypto.randomUUID();await pg.query("select public.jj_casino('buy',$1,'{\"amount\":10}')",[buy]);
 let wallet=(await pg.query('select public.bb_shop() d')).rows[0].d;d=await ranks();check(d.players.find(p=>p.handle==='jesus').jj===wallet.coins);check(d.players.find(p=>p.handle==='jesus').jxj===10);
 // Replay is not an extra stake; poker draw and exchanges are excluded even with stake fields.
 const bet=crypto.randomUUID();await pg.query("select public.jj_casino('slots',$1,'{\"stake\":2}')",[bet]);await pg.query("select public.jj_casino('slots',$1,'{\"stake\":2}')",[bet]);
 await pg.exec('reset role');await pg.query("insert into public.jj_money_log values($1,gen_random_uuid(),'poker_deal','{\"stake\":3}',0,-3,'{}',now()),($1,gen_random_uuid(),'poker_draw','{\"stake\":3}',0,9,'{}',now())",[HOST]);
 await as(HOST);check((await ranks()).players.find(p=>p.handle==='jesus').casino_spent===5);
 await pg.exec('reset role');
 await pg.query("insert into public.bb_wagers(id,room_id,host,guest,host_ok,guest_ok,amount,rules,state,expires) values(gen_random_uuid(),gen_random_uuid(),$1,$2,true,false,3,'{}','offered',now()+interval '1 hour')",[HOST,GUEST]);
 await pg.query("insert into public.bb_coin_transfers(wager_id,user_id,delta) select id,$1,7 from public.bb_wagers limit 1",[HOST]);await as(HOST);check((await ranks()).players.find(p=>p.handle==='jesus').jj===(await pg.query('select public.bb_shop() d')).rows[0].d.coins);
 // 22 weekly and 7 daily, current week/day boundaries and one-time awards.
 check((await pg.query('select * from public.jj_missions()')).rows.length===22);check((await pg.query('select * from public.jj_daily()')).rows.length===7);
 await pg.exec('reset role');await pg.query("insert into public.activity_events select $1,public.jj_week(),'game',g||':1',now() from unnest(array['memory','reaction','maze','pumpkins','pairs']) g",[HOST]);
 await pg.query("insert into public.activity_events values($1,public.jj_week()-7,'game','old:1',now()-interval '7 days'),($1,public.jj_week(),'puzzle','maze:1',now())",[HOST]);
 await as(HOST);let missions=(await pg.query('select * from public.jj_missions()')).rows;check(missions.find(m=>m.mission==='variety5').progress===5);check(missions.find(m=>m.mission==='games10').progress===5);
 const before=(await ranks()).players.find(p=>p.handle==='jesus').jj;check((await ranks()).players.find(p=>p.handle==='jesus').jj===before);
 check((await pg.query("select * from public.jj_daily() where mission='puzzle'")).rows[0].progress===1);
 await as(GUEST);check((await pg.query("select * from public.jj_missions() where mission='games10'")).rows[0].progress===0);
 await as(OUT);await assert.rejects(ranks());checks++;await pg.exec('reset role;set role anon');await assert.rejects(ranks());checks++;
 // Crowns: higher/lower scores, shared first place, empty period and repeated settlement.
 await pg.exec('reset role');await pg.query("insert into public.game_records(user_id,game,period_start,best) values($1,'memory','2026-10-05',100),($2,'memory','2026-10-05',50),($1,'reaction','2026-10-05',500),($2,'reaction','2026-10-05',300)",[HOST,GUEST]);
 await pg.exec('select public.jj_settle();select public.jj_settle()');let crowns=(await pg.query('select * from public.crown_results')).rows;check(crowns.length===2);check(crowns.every(c=>c.first_places===1));
 await pg.query("insert into public.game_records(user_id,game,period_start,best) values($1,'memory','2026-09-21',100),($2,'memory','2026-09-21',100),($1,'reaction','2026-09-21',500),($2,'reaction','2026-09-21',700)",[HOST,GUEST]);
 await pg.exec('select public.jj_settle()');crowns=(await pg.query("select * from public.crown_results where period_start='2026-09-21'")).rows;check(crowns.length===1&&crowns[0].user_id===HOST&&crowns[0].first_places===2);
 check((await pg.query("select * from public.crown_results where period_start='2026-09-07'")).rows.length===0);
 console.log(`PASS: ${checks} wallet, casino stakes, mission, privacy and crown checks.`);await pg.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
