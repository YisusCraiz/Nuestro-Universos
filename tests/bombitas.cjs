const assert=require('node:assert/strict'),E=require('../bombitas-engine.js');
const empty=()=>{const s=E.create(()=>1);s.players[1]={...s.players[1],x:11,y:9};return s;};
const advance=(s,ms)=>{for(let t=0;t<ms;t+=50)E.tick(s,Math.min(50,ms-t),()=>1);};
// Spawn escape routes always exist, including maximum crate density.
let s=E.create(()=>0);for(const [x,y] of [[1,1],[2,1],[1,2],[11,9],[10,9],[11,8]])assert.equal(s.cells[y*13+x],0);
s=empty();E.input(s,0,0,false);assert.equal(s.players[0].y,1);E.input(s,0,1,false);assert.equal(s.players[0].x,2);E.input(s,0,1,false);assert.equal(s.players[0].x,2);advance(s,160);E.input(s,0,1,false);assert.equal(s.players[0].x,3);
s=empty();E.input(s,0,null,true);E.input(s,0,null,true);assert.equal(s.bombs.length,1);advance(s,2150);assert.equal(s.bombs.length,1);advance(s,50);assert.equal(s.bombs.length,0);assert.equal(s.players[0].alive,false);assert.equal(s.winner,1);
// Solid walls stop blasts; crates stop the ray and disappear.
s=empty();s.players[0].x=9;s.players[0].y=1;s.cells[1*13+3]=2;s.bombs=[{x:1,y:1,range:5,owner:0,at:0}];E.tick(s,1,()=>1);assert.equal(s.cells[16],0);assert(!s.flames.some(f=>f.x===4&&f.y===1));assert(!s.flames.some(f=>f.x===0));
// Chain reactions share a tick, and simultaneous deaths are a draw.
s=empty();s.players[0].x=1;s.players[1].x=3;s.players[1].y=1;s.bombs=[{x:1,y:1,range:2,owner:0,at:1},{x:3,y:1,range:2,owner:1,at:9999}];E.tick(s,1);assert.equal(s.bombs.length,0);assert.equal(s.over,true);assert.equal(s.winner,null);
// Bomb collision, bounded power-ups, and last-man-standing sudden death.
s=empty();s.bombs=[{x:2,y:1,range:1,owner:1,at:9999}];E.input(s,0,1,false);assert.equal(s.players[0].x,1);s.bombs=[];s.items[15]='range';E.input(s,0,1,false);assert.equal(s.players[0].range,3);assert.equal(s.items[15],undefined);
s=empty();s.time=89990;E.tick(s,10);assert.equal(s.seal,1);assert.equal(s.over,true);assert.equal(s.winner,null);
console.log('Bombitas: spawn, movement, cooldown, collision, fuse, blast blockers, chain reactions, draw, power-ups and sudden death passed.');
