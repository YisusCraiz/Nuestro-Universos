// Runs the actual page/controller twice with a simulated transport and clock.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
let now=100000,stored=null,dropped=false;const channels=[],packets=[],wire=[],profiles=[{id:'a',handle:'jesus',name:'Jesús',skin:'casual'},{id:'b',handle:'julisa',name:'Julissa',skin:'casual'}];
let wagerEnabled=false,wagerFixture=null,payments=0;const bank={a:20,b:3};
function wagerRpc(user,a){if(!wagerEnabled)throw Error('UNSUPPORTED');const w=wagerFixture,active=w&&['offered','running'].includes(w.state);const reserved=id=>active&&(id===w.host?w.host_ok:w.guest_ok)?w.amount:0;
 if(a.p_action==='propose'){if(bank[user]-reserved(user)<a.p_amount)throw Error('INSUFFICIENT_COINS');wagerFixture={id:a.p_id,room_id:stored.id,host:stored.host,guest:stored.guest,amount:a.p_amount,rules:a.p_rules,state:'offered',host_ok:true,guest_ok:false};}
 if(a.p_action==='accept'){if(bank[user]-reserved(user)<w.amount)throw Error('INSUFFICIENT_COINS');w.guest_ok=true;}
 if(a.p_action==='cancel'&&active)w.state='refunded';
 if(a.p_action==='start'){if(!w?.host_ok||!w?.guest_ok)throw Error('BOTH_MUST_ACCEPT');w.state='running';}
 if(a.p_action==='result'&&w?.state==='running'){w[user===w.host?'host_result':'guest_result']=a.p_winner;if(w.host_result&&w.guest_result){assert.equal(w.host_result,w.guest_result);w.winner=w.host_result;w.state='paid';bank[w.host]+=w.winner===w.host?w.amount:-w.amount;bank[w.guest]+=w.winner===w.guest?w.amount:-w.amount;payments++;}}
 const n=wagerFixture,held=n&&['offered','running'].includes(n.state)&&(user===n.host?n.host_ok:n.guest_ok)?n.amount:0;return clone({enabled:true,wager:n,coins:bank[user]-held,reserved:held});}
const clone=x=>JSON.parse(JSON.stringify(x));
function client(id){
 const nodes=[],byId=new Map(),intervals=[],frames=new Map();let raf=0;
 const context2d=new Proxy({},{get:()=>()=>{},set:()=>true});
 function element(tag='DIV',attrs={}){const classes=new Set((attrs.class||'').split(/\s+/));const n={tagName:tag.toUpperCase(),dataset:{},value:attrs.value||'',disabled:'disabled' in attrs,hidden:'hidden' in attrs,textContent:'',width:780,height:660,open:false,classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,b){if(b)classes.add(c);else classes.delete(c);}},getContext:()=>context2d,setAttribute(k,v){this[k]=v;},focus(){doc.activeElement=this;},scrollIntoView(){},setPointerCapture(){}};
  for(const [k,v] of Object.entries(attrs))if(k.startsWith('data-'))n.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;
  Object.defineProperty(n,'innerHTML',{get(){return this.html||'';},set(s){this.html=s;parse(s);}});n.id=attrs.id;n.classes=classes;nodes.push(n);if(n.id)byId.set(n.id,n);return n;
 }
 function parse(html){for(const [,tag,raw] of html.matchAll(/<(\w+)\b([^>]*)>/g)){const attrs={};for(const [,key,value] of raw.matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[key]=value??'';if(attrs.id||attrs.class||Object.keys(attrs).some(k=>k.startsWith('data-')))element(tag,attrs);}}
 const query=s=>s.startsWith('#')?byId.get(s.slice(1)):s.startsWith('.')?nodes.findLast(n=>n.classes.has(s.slice(1))):null;
 const all=s=>{const m=s.match(/^\[data-([\w-]+)\]$/);if(m){const k=m[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return nodes.filter(n=>k in n.dataset);}return [];};
 const doc={querySelector:query,querySelectorAll:all,hidden:false,activeElement:null,body:element(),addEventListener(){},removeEventListener(){},fullscreenElement:null};element('main',{id:'main'});element('dialog',{id:'modal'});
 const timers={setInterval(fn,delay){const t={fn,delay,next:now+delay};intervals.push(t);return t;},clearInterval(t){t.next=Infinity;}};
 const db={removeChannel:async c=>{c.active=false;},channel(topic){const c={topic,owner:id,active:true,listeners:{},on(type,{event},fn){this.listeners[event]=fn;return this;},subscribe(cb){cb('SUBSCRIBED');return this;},async send({event,payload}){const p={sender:c,event,payload:clone(payload)};wire.push(p);if(event==='input'&&payload.bomb&&!dropped){dropped=true;return 'ok';}packets.push(p);return 'ok';}};channels.push(c);return c;}};
 async function rpc(name,args={}){if(name==='bb_shop')return {coins:wagerEnabled?bank[id]:20,owned:['casual'],equipped:'casual',catalog:{casual:0}};if(name==='bb_wager')return wagerRpc(id,args);assert.equal(name,'bb_room');if(args.p_action==='create')stored={id:'room',code:'ABCD1234',host:id,guest:null};if(!stored)throw Error('ROOM_NOT_FOUND');if(args.p_action==='join')stored.guest=id;if(args.p_action==='leave'){if(stored.host===id)stored=null;else stored.guest=null;return {};}return clone({...stored,players:profiles.filter(p=>p.id===stored.host||p.id===stored.guest)});}
 class Clock extends Date{static now(){return now;}}
 const sandbox={console,Date:Clock,Math,crypto,performance:{now:()=>now},document:doc,window:{addEventListener(){},removeEventListener(){}},navigator:{},screen:{},state:{profile:{id,handle:profiles.find(p=>p.id===id).handle,display_name:id==='a'?'Jesús':'Julissa'},version:1,demo:false},JJ:{cleanups:[]},BBSkins:[['casual','Casual','Casual',0]],bbCharacter(){},$:query,bi:es=>es,say:es=>es,esc:s=>String(s),rpc,db,...timers,requestAnimationFrame(fn){frames.set(++raf,fn);return raf;},cancelAnimationFrame(n){frames.delete(n);}};
 vm.createContext(sandbox);for(const file of ['bombitas-engine.js','bombitas-session.js','bombitas-wagers.js','bombitas-play.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',file),'utf8'),sandbox,{filename:file});
 return {id,sandbox,query,async boot(){await sandbox.bbPage(1);},tick(){for(const t of intervals)if(now>=t.next){t.next=now+t.delay;t.fn();}const batch=[...frames.values()];frames.clear();for(const fn of batch)fn(now);}};
}
async function run(){const a=client('a'),b=client('b');await a.boot();await b.boot();const clients=[a,b];
 async function advance(ms){for(let t=0;t<ms;t+=16){now+=16;for(const c of clients)c.tick();while(packets.length){const p=packets.shift();for(const c of channels)if(c!==p.sender&&c.active&&c.topic===p.sender.topic)c.listeners[p.event]?.({payload:clone(p.payload)});}await Promise.resolve();}}
 await a.query('#bb-create').onclick();b.query('#bb-code').value='ABCD1234';await b.query('#bb-join').onclick();await advance(3000);
 assert(a.query('#bb-connection').textContent.includes('Ambos conectados'));assert(b.query('#bb-room').innerHTML.includes('Ya estás en la sala'));assert(!a.query('#bb-start').disabled);assert(b.query('#bb-start').disabled);
 a.query('#bb-seconds').value='60';a.query('#bb-wins').value='3';a.query('#bb-start').onclick();await advance(3000);assert(a.query('#bb-start').disabled);assert(b.query('#bb-rules-summary').textContent.includes('60 segundos'));assert(b.query('#bb-rules-summary').textContent.includes('3 victorias'));
 let latest=()=>wire.filter(p=>p.event==='state').at(-1).payload;const original=clone(latest());
 // A second start call is ignored, even if triggered outside the disabled DOM button.
 a.query('#bb-start').onclick();await advance(100);assert.equal(latest().matchKey,original.matchKey);assert.equal(latest().round,1);
 // Guest taps between sends. First packet is lost; retries still place one bomb.
 b.query('#bb-drop').onpointerdown({preventDefault(){}});await advance(650);assert(dropped);const state=latest();assert.equal(state.model.bombs.filter(x=>x.owner===1).length,1);assert.equal(state.ack.result,'placed');assert(b.query('#bb-bomb-feedback').textContent.includes('Bomba colocada'));
 // A stale packet cannot rewind the guest's countdown or match score.
 const receiver=channels.find(c=>c.owner==='b');receiver.listeners.state({payload:original});assert(b.query('#bb-rules-summary').textContent.includes('3 victorias'));
 // A brief disconnection pauses and resumes; it does not replace the match.
 b.sandbox.document.hidden=true;await advance(1000);const paused=latest().model.time;await advance(1000);assert.equal(latest().model.time,paused);b.sandbox.document.hidden=false;await advance(1000);assert.equal(latest().matchKey,original.matchKey);assert(latest().model.time>paused);
 // Wager UI: an unaffordable offer cannot start; lower offer, accept, play and settle.
 await a.query('#bb-leave').onclick();await b.query('#bb-leave').onclick();wagerEnabled=true;await a.query('#bb-create').onclick();b.query('#bb-code').value='ABCD1234';await b.query('#bb-join').onclick();await advance(3000);
 a.query('#bb-seconds').value='60';a.query('#bb-wins').value='1';a.query('#bb-stake').value='5';a.query('#bb-stake').onchange();await a.query('#bb-wager-propose').onclick();await advance(2500);assert(a.query('#bb-start').disabled);assert(b.query('#bb-wager-accept').disabled);assert(b.query('#bb-wager-panel').innerHTML.includes('No tienes monedas suficientes'));
 await a.query('#bb-wager-cancel').onclick();a.query('#bb-stake').value='3';a.query('#bb-stake').onchange();await a.query('#bb-wager-propose').onclick();await advance(2500);assert(!b.query('#bb-wager-accept').disabled);await b.query('#bb-wager-accept').onclick();await advance(2500);assert(!a.query('#bb-start').disabled);await a.query('#bb-start').onclick();await advance(3000);
 b.query('#bb-drop').onpointerdown({preventDefault(){}});await advance(7000);assert.equal(wagerFixture.state,'paid');assert.equal(payments,1);assert.equal(bank.a,23);assert.equal(bank.b,0);assert(a.query('#bb-wager-panel').innerHTML.includes('bote entregado'));await advance(2500);assert.equal(payments,1);
 a.query('#bb-stake').value='2';a.query('#bb-stake').onchange();await a.query('#bb-wager-propose').onclick();await advance(3000);assert.equal(wagerFixture.state,'offered');assert(a.query('#bb-wager-panel').innerHTML.includes('Tu apuesta está reservada'));assert(a.query('#bb-start').disabled);assert.equal(payments,1);
 console.log('Two real Bombitas controllers: room/rule sync, reliable bombs, restart/pause guards and wager UI (insufficient funds, consent, full balance, automatic single payout) passed.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
