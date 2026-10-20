const assert=require('node:assert/strict'),E=require('../bombitas-engine'),M=require('../bombitas-motion');
const slow=E.create(()=>1),fast=E.create(()=>1);for(let i=0;i<5;i++)E.advance(slow,200,()=>E.input(slow,0,1,false));for(let i=0;i<60;i++)E.advance(fast,1000/60,()=>E.input(fast,0,1,false));
assert.ok(Math.abs(slow.time-1000)<1);assert.ok(Math.abs(fast.time-1000)<1);assert.ok(Math.abs(slow.players[0].x-fast.players[0].x)<=1);
const motion=M.create(),s=E.create(()=>1);motion.sample(s,0,0,null);const original=JSON.stringify(s);const predicted=motion.sample(s,16,0,1,true);assert.ok(predicted[0].x>1&&predicted[0].x<1.31);assert.equal(JSON.stringify(s),original);
s.cells[1*13+2]=1;const wall=M.create().sample(s,16,0,1,true);assert.equal(wall[0].x,1);
s.cells[15]=0;motion.reset();motion.sample(s,0,0,null);s.players[1].x=10;const blended=motion.sample(s,16,0,null);assert.ok(blended[1].x>10&&blended[1].x<11);assert.equal(s.players[1].x,10);
console.log('PASS: 5-FPS and 60-FPS simulation advance equally; interpolation smooths snapshots; local visual feedback respects walls and never changes authoritative state.');
const predictor=M.predictor(E),board=E.create(()=>1);predictor.receive(board,-1,1000);const pristine=JSON.stringify(board);predictor.input(board,1,0,1,1016);assert.equal(predictor.sample(board,0,1016).players[0].x,2);assert.equal(JSON.stringify(board),pristine);
// Accepted moves disappear from replay; a newer wall/bomb immediately corrects prediction.
const accepted=structuredClone(board);accepted.players[0].x=2;accepted.players[0].next=160;accepted.time=32;predictor.receive(accepted,1,1032);assert.equal(predictor.sample(accepted,0,1032).players[0].x,2);
accepted.cells[16]=1;accepted.time=180;predictor.receive(accepted,1,1180);predictor.input(accepted,2,0,1,1196);assert.equal(predictor.sample(accepted,0,1196).players[0].x,2);
predictor.reset();assert.equal(predictor.sample(board,0,1200),board);console.log('PASS: full-tile local movement before a network round trip, acknowledged-input reconciliation, authoritative wall correction and reset without mutating game state.');
