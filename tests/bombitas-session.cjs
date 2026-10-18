const assert=require('node:assert/strict'),S=require('../bombitas-session'),E=require('../bombitas-engine');
assert.deepEqual(S.settings(),{seconds:120,wins:5});assert.deepEqual(S.settings({seconds:6000,wins:-9}),{seconds:600,wins:1});assert.deepEqual(S.settings({seconds:90,wins:3}),{seconds:90,wins:3});
// A 16ms tap can happen between 65ms sends. It must remain queued across frames.
const out=S.outbox();out.tap();for(let frame=0;frame<4;frame++)assert.equal(out.peek(),1);const wire=out.peek();assert.equal(wire,1);
// Drop the first transmission, then repeat until ack. Process exactly once.
const receiver=S.inbox();let placed=0;let ack=receiver.consume(out.peek(),()=>{placed++;return 'placed';});assert.equal(placed,1);assert.equal(receiver.consume(out.peek(),()=>placed++),null);out.ack(ack.id);assert.equal(out.peek(),0);assert.equal(placed,1);
// Multiple taps are separate operations; rejected bombs still acknowledge once.
out.tap();out.tap();assert.equal(out.size(),2);ack=receiver.consume(out.peek(),()=> 'capacity');out.ack(ack.id);assert.equal(out.size(),1);assert.equal(out.peek(),3);out.clear();assert.equal(out.peek(),0);assert.equal(out.tap(),4);
// Late/duplicate snapshots must never roll back the round or scoreboard.
const gate=S.snapshots();assert(gate.accept({revision:8}));assert(!gate.accept({revision:7}));assert(!gate.accept({revision:8}));assert(gate.accept({revision:9}));assert(!gate.accept({revision:NaN}));
assert(S.canStart(null,false));assert(!S.canStart({over:false},false));assert(!S.canStart({over:true},false));assert(S.canStart({over:true},true));
// Configured short rounds do not kill the starting players immediately.
let game=E.create(()=>1,{seconds:30});E.tick(game,16);assert.equal(game.over,false);assert.equal(game.limit,30000);assert.equal(game.seal,0);
game=E.create(()=>1,{seconds:180});game.time=90000;E.tick(game,16);assert.equal(game.seal,0);assert.equal(game.limit,180000);
assert.equal(E.input(game,0,null,true),'placed');assert.equal(E.input(game,0,null,true),'occupied');game.players[0].x=2;assert.equal(E.input(game,0,null,true),'capacity');
console.log('Bombitas sessions: short taps, dropped packets, retries, deduplication, rejected-bomb ACK, stale snapshots, restart guard and custom rules passed.');
