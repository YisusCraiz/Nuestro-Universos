const {fixture,HOST,GUEST}=require('./cards.cjs'),assert=require('node:assert/strict');
(async()=>{const pg=await fixture();let room,checks=0;const check=x=>{assert.ok(x);checks++;};
const as=async id=>{await pg.exec('reset role');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await pg.exec('set role authenticated');};
const call=async(action='read',data={},rev=room?.revision)=>(await pg.query('select public.jj_cards($1,$2,$3,$4) d',[action,room?.code||'',rev??null,JSON.stringify(data)])).rows[0].d;
await as(HOST);room=await call('create');check(room.rules.uno===true&&room.rules.stack===false);await as(GUEST);room=await call('join');await call('ready');await as(HOST);room=await call();room=await call('start');
async function seed(){await pg.exec('reset role');const s=(await pg.query('select game from public.jj_card_rooms where code=$1',[room.code])).rows[0].game;const hands=[['r2:1','b1:1'],['r3:1','g5:1','y4:1']];const deck=(await pg.query('select public.jj_card_deck() d')).rows[0].d;Object.assign(s,{hands,deck:deck.filter(c=>!hands.flat().includes(c)&&c!=='r5:1'),pile:['r5:1'],color:'r',turn:0,pending:0,pending_kind:'',drawn:null,uno_pending:null,winner:null,finished:false,needs_color:false});await pg.query('update public.jj_card_rooms set game=$1,revision=revision+1 where code=$2',[JSON.stringify(s),room.code]);await as(HOST);room=await call();}
await seed();room=await call('play',{card:'r2:1'});check(room.game.uno_pending===0);const raceRev=room.revision;await as(GUEST);room=await call('catch',{},raceRev);check(room.game.counts[0]===3&&room.game.turn===1);await as(HOST);await assert.rejects(call('uno',{},raceRev),/STALE/);checks++;
await seed();room=await call('play',{card:'r2:1'});room=await call('uno');check(room.game.uno_pending===null&&room.game.counts[0]===1);await as(GUEST);await assert.rejects(call('catch'),/NO_UNO/);checks++;
await seed();room=await call('play',{card:'r2:1',uno:true});check(room.game.uno_pending===null);await as(GUEST);await assert.rejects(call('catch'),/NO_UNO/);checks++;
await seed();room=await call('play',{card:'r2:1'});await as(GUEST);room=await call('play',{card:'r3:1'});await as(HOST);await assert.rejects(call('uno'),/NO_UNO/);checks++;
check(!('hands' in room.game)&&!('deck' in room.game)&&!('w4_hand' in room.game));
console.log(`PASS: ${checks} UNO audit checks: defaults, catch/declaration races, penalty turn, pre-call, expiry and private hands.`);await pg.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
