const {fixture,HOST,GUEST}=require('./cards.cjs'),assert=require('node:assert/strict');
(async()=>{const pg=await fixture();const ids=[HOST,GUEST];let current=HOST,room;
async function as(id){current=id;await pg.exec('reset role');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await pg.exec('set role authenticated');}
async function call(action='read',data={}){return(await pg.query('select public.jj_cards($1,$2,$3,$4) as v',[action,room?.code||'',room?.revision??null,JSON.stringify(data)])).rows[0].v;}
await as(HOST);room=await call('create');await as(GUEST);room=await call('join');let moves=0;
for(let match=0;match<8;match++){
 await as(HOST);room=await call();if(room.game)room=await call('reset');room=await call('rules',{hand:match%2?7:3,target:0,stack:!!(match%2),until:!!(match%3),uno:true,challenge:true});await as(GUEST);room=await call();room=await call('ready');await as(HOST);room=await call();room=await call('start');
 let turns=0;
 while(room.game.winner===null&&turns++<1000){const who=room.game.turn;if(ids[who]!==current){await as(ids[who]);room=await call();}const g=room.game;let action,data={};
  if(g.needs_color){action='color';data={color:'r'};}
  else if(g.pending_kind==='4'){action=turns%3?'draw':'challenge';}
  else{const eligible=g.hand.filter(c=>(!g.drawn||g.drawn===c)&&(g.pending?(room.rules.stack&&c[1]==='d'):(c[0]==='w'||c[0]===g.color||(g.top[0]!=='w'&&c[1]===g.top[1]))));const card=eligible.find(c=>c[0]!=='w')||eligible[0];if(card){action='play';const color=['r','y','g','b'].sort((a,b)=>g.hand.filter(c=>c[0]===b).length-g.hand.filter(c=>c[0]===a).length)[0];data={card,color,uno:true};}else action=g.drawn?'pass':'draw';}
  room=await call(action,data);moves++;
  if(turns%20===0||room.game.winner!==null){await pg.exec('reset role');const s=(await pg.query('select game from public.jj_card_rooms where code=$1',[room.code])).rows[0].game;const all=[...s.deck,...s.pile,...s.hands.flat()];assert.equal(all.length,108);assert.equal(new Set(all).size,108);await as(ids[who]);}
 }
 assert.ok(turns<1000,'match must finish');assert.ok(room.game.finished);assert.equal(room.game.counts[room.game.winner],0);
}console.log(`PASS: 8 full matches, ${moves} server-validated moves; classic/house rules finish and conserve all 108 unique cards.`);await pg.close();})().catch(e=>{console.error(e);process.exitCode=1;});
