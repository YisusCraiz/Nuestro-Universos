const fs=require('node:fs'),assert=require('node:assert/strict');
const {fixture:base,HOST,GUEST,OUT}=require('./cards.cjs');
async function fixture(){const pg=await base();await pg.exec(`
create table public.game_catalog(game text primary key,lower_wins boolean,min_score int,max_score int);
insert into public.game_catalog values('memory',false,0,1200),('reaction',true,100,10000),('maze',true,1000,999999),('tictactoe',false,0,10);
create table public.game_records(user_id uuid,game text,period_start date,best int,updated_at timestamptz default now(),primary key(user_id,game,period_start));
create table public.game_submissions(attempt uuid primary key,user_id uuid,game text,score int,result int,created_at timestamptz default now());
create function public.jj_period() returns date language sql as $$select date '2026-10-19'$$;
create function public.jj_settle() returns void language sql as $$select$$;
create function public.jj_event(uuid,text,text) returns void language sql as $$select$$;
create function public.jj_claim() returns void language sql as $$select$$;
create function public.record_game(g text,s int) returns int language plpgsql security definer as $$declare result int;lower_w boolean;begin
 select lower_wins into lower_w from public.game_catalog where game=g and s between min_score and max_score;
 if lower_w is null or g='tictactoe' then raise exception 'BAD_SCORE';end if;
 insert into public.game_records values(auth.uid(),g,public.jj_period(),s,now()) on conflict(user_id,game,period_start) do update set best=case when lower_w then least(game_records.best,excluded.best) else greatest(game_records.best,excluded.best) end returning best into result;return result;end$$;
create function public.record_game_once(p_game text,p_score int,p_attempt uuid) returns int language plpgsql security definer as $$declare old public.game_submissions;n int;begin
 select * into old from public.game_submissions where attempt=p_attempt;
 if found then if old.user_id<>auth.uid() or old.game<>p_game or old.score<>p_score then raise exception 'ATTEMPT_MISMATCH';end if;return old.result;end if;
 n:=public.record_game(p_game,p_score);insert into public.game_submissions values(p_attempt,auth.uid(),p_game,p_score,n,now());return n;end$$;
`);for(const f of ['32-vs-economia.sql','33-billar.sql'])await pg.exec(fs.readFileSync('supabase/'+f,'utf8'));return pg;}
module.exports={fixture,HOST,GUEST,OUT};
if(require.main===module)(async()=>{const pg=await fixture();let checks=0;const check=x=>{assert.ok(x);checks++;};
const as=async id=>{await pg.exec('reset role');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await pg.exec('set role authenticated');};
const casino=async(action='read',data={},id=crypto.randomUUID())=>(await pg.query('select public.jj_casino($1,$2,$3) d',[action,id,JSON.stringify(data)])).rows[0].d;
const wallet=async()=>(await pg.query('select public.bb_shop() d')).rows[0].d;
await as(HOST);check((await casino()).jj===20);const request=crypto.randomUUID();let d=await casino('buy',{amount:5},request);check(d.jj===10&&d.jxj===5);d=await casino('buy',{amount:5},request);check(d.replayed&&d.jj===10&&d.jxj===5);await assert.rejects(casino('buy',{amount:6},request));checks++;
await assert.rejects(casino('buy',{amount:100}));await assert.rejects(casino('sell',{amount:6}));await assert.rejects(casino('slots',{stake:-1}));await assert.rejects(casino('slots',{stake:6}));checks+=4;
d=await casino('sell',{amount:1});check(d.jj>=12&&d.jxj===4);check((await wallet()).coins===d.jj);
const score=async(game,n,id=crypto.randomUUID())=>(await pg.query('select public.record_game_once($1,$2,$3) best',[game,n,id])).rows[0].best;
const sid=crypto.randomUUID();await score('memory',300,sid);check((await wallet()).coins===d.jj+1);await score('memory',300,sid);check((await wallet()).coins===d.jj+1);await score('memory',325);check((await wallet()).coins===d.jj+4);
await assert.rejects(score('memory',10000));await assert.rejects(score('tictactoe',1));checks+=2;
for(let i=0;i<14;i++)await score('memory',350+i*25);await pg.exec('reset role');const reward=(await pg.query("select sum(jj) n,count(*) filter(where jj>0) c from public.jj_money_log where kind='arcade'")).rows[0];check(+reward.n<=20&&+reward.c<=10);await as(GUEST);const id=crypto.randomUUID();await score('reaction',1000,id);await score('reaction',900);check((await wallet()).coins===24);await as(HOST);await assert.rejects(score('reaction',1000,id));checks++;
// Poker reload, held cards, no duplicate draw or discarded original cards.
let hand=await casino('poker_deal',{stake:1});check(hand.cards.length===5&&new Set(hand.cards).size===5);check((await casino()).pending.deal===hand.deal);await assert.rejects(casino('poker_deal',{stake:1}));checks++;
const drawId=crypto.randomUUID();let draw=await casino('poker_draw',{deal:hand.deal,hold:[0,2]},drawId);check(draw.cards[0]===hand.cards[0]&&draw.cards[2]===hand.cards[2]);check(draw.cards.filter((c,i)=>i!==0&&i!==2).every(c=>!hand.cards.includes(c)));check(new Set(draw.cards).size===5);check(!(await casino()).pending);check((await casino('poker_draw',{deal:hand.deal,hold:[0,2]},drawId)).replayed);await assert.rejects(casino('poker_draw',{deal:hand.deal,hold:[]}));checks++;
// Casino results are generated on server, preserve accounting and respect stake limits.
for(const [action,data] of [['slots',{}],['roulette',{bet:'red'}],['roulette',{bet:'number',number:0}],['horse',{horse:2}]]){
 const b=await casino();if(b.jxj<1)await casino('buy',{amount:1});const before=await casino(),r=await casino(action,{stake:1,...data});check(r.jxj===before.jxj+r.net);check(r.payout>=0);}
await as(GUEST);await assert.rejects(pg.query('select * from public.jj_money_log'));checks++;await as(OUT);await assert.rejects(casino());checks++;
// Rack, physics, legal targeting, turns, full room / money lifecycle.
await pg.exec('reset role');const rack=(await pg.query("select public.jj_pool_rack('[0,0]',1) g")).rows[0].g;check(rack.balls.length===16&&rack.balls.every(b=>b[2]));
const simulate=async(s,angle,power=.65,called=-1,call8=false)=>(await pg.query('select public.jj_pool_shot($1,$2,$3,$4,$5) g',[JSON.stringify(s),angle,power,called,call8])).rows[0].g;
const time=Date.now();let shot=await simulate(rack,0);console.log('Rack break computation ms:',Date.now()-time,'frames:',shot.frames.length);check(shot.shots===1&&shot.frames.length>0);check(shot.balls.some((b,i)=>b[0]!==rack.balls[i][0]||b[1]!==rack.balls[i][1]));
function scene(cue,objects,extra={}){return {...rack,shots:1,balls:rack.balls.map((b,i)=>i===0?[...cue,true]:objects[i]?[...objects[i],true]:[b[0],b[1],false]),...extra};}
shot=await simulate(scene([500,250],{1:[600,250]}),Math.PI,.05);check(shot.inhand&&shot.turn===1&&shot.notice==='foul');
shot=await simulate(scene([500,250],{9:[600,250]},{groups:[1,2]}),0,.3);check(shot.inhand&&shot.turn===1);
shot=await simulate(scene([500,100],{1:[500,40]}),-Math.PI/2,.2);check(shot.pots.includes(1)&&shot.groups[0]===1&&shot.turn===0&&!shot.inhand);
shot=await simulate(scene([500,100],{8:[500,40],1:[700,250]},{groups:[1,2]}),-Math.PI/2,.2);check(shot.round_done&&shot.winner===1);
shot=await simulate(scene([500,100],{8:[500,40]},{groups:[1,2]}),-Math.PI/2,.2,1,true);check(shot.round_done&&shot.winner===0);
shot=await simulate(scene([500,100],{8:[500,40]},{groups:[1,2]}),-Math.PI/2,.2,2,true);check(shot.winner===1);
let room;const pool=async(action='read',data={},rev=room?.revision,code=room?.code||'')=>(await pg.query('select public.jj_pool($1,$2,$3,$4) d',[action,code,rev,JSON.stringify(data)])).rows[0].d;
await as(HOST);room=await pool('create');check(room.code.length===8);room=await pool('rules',{wins:1,stake:2,call8:false});await as(GUEST);room=await pool('join');await assert.rejects(pool('start'));checks++;await as(HOST);room=await pool('bet');await pg.exec('reset role');const wid=(await pg.query('select id from public.bb_wagers where rules->>\'game\'=\'pool\' and state=\'offered\'')).rows[0].id;await as(HOST);await assert.rejects(pg.query("select public.bb_wager('cancel','',$1)",[wid]));await assert.rejects(pg.query('select public.jj_cards_pay($1,$2)',[wid,HOST]));checks+=2;
await as(GUEST);room=await pool('read');room=await pool('ready');await as(HOST);room=await pool('read');room=await pool('start');check(room.game.balls.length===16&&room.bet.state==='running');await assert.rejects(pool('shot',{angle:0,power:1},0));checks++;await as(GUEST);await assert.rejects(pool('shot',{angle:0,power:1}));checks++;
await pg.exec('reset role');await pg.query('update public.jj_pool_rooms set game=$1 where code=$2',[JSON.stringify(scene([500,100],{8:[500,40]},{groups:[1,2]})),room.code]);await as(HOST);room=await pool('shot',{angle:-Math.PI/2,power:.2});check(room.game.finished&&room.game.wins[0]===1&&room.bet.state==='paid');let paid=(await wallet()).coins;await pool();check((await wallet()).coins===paid);room=await pool('reset');check(!room.game&&!room.ready);await as(GUEST);await assert.rejects(pg.query('select * from public.jj_pool_rooms'));await assert.rejects(pg.query("select public.jj_pool_shot('{}',0,1,-1,false)"));checks+=2;
// Explicit abandonment settles once; navigation/read does not forfeit.
await as(HOST);room=await pool('read');room=await pool('bet');await as(GUEST);room=await pool('read');room=await pool('ready');await as(HOST);room=await pool('read');room=await pool('start');const beforeLeave=(await wallet()).coins;await as(GUEST);await pool('leave');await as(HOST);room=await pool('read');check(room.bet.state==='paid'&&!room.guest);check((await wallet()).coins===beforeLeave+4);paid=(await wallet()).coins;
// Seeded bonus trials prove at most one +1 JJ daily, while base conversions remain reversible.
await pg.exec('select setseed(0.42)');let bonuses=0;for(let i=0;i<80;i++){const b=await casino();if(b.jxj<1)await casino('buy',{amount:1});const r=await casino('sell',{amount:1});bonuses+=r.bonus;await casino('buy',{amount:1});}check(bonuses<=1);await pg.exec('reset role');check(+(await pg.query("select coalesce(sum((result->>'bonus')::int),0) n from public.jj_money_log where kind='sell' and user_id=$1",[HOST])).rows[0].n===1);await as(HOST);paid=(await wallet()).coins;
// Re-applying these migrations keeps balances and existing rooms.
await pg.exec('reset role');for(const f of ['32-vs-economia.sql','33-billar.sql'])await pg.exec(fs.readFileSync('supabase/'+f,'utf8'));await as(HOST);check((await wallet()).coins===paid);
console.log(`PASS: ${checks} economy/casino/pool checks.`);await pg.close();})().catch(e=>{console.error(e);process.exitCode=1;});
