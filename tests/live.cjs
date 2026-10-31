const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const nodes=new Map();const node=()=>({innerHTML:'',textContent:'',disabled:false,elements:{view:{value:''},room:{value:''}},querySelector(){return node()},replaceChildren(){},append(){},remove(){}});const get=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)};
let result={revision:1,enabled:true,live:false,stream_id:'JJtest',password:'abcdefgh'},calls=[],fail=false;
const ctx={URL,URLSearchParams,crypto:require('crypto').webcrypto,menus:[],state:{profile:{id:'u',handle:'jesus'},page:'live',version:1},JJ:{cleanups:[]},$:get,bi:s=>s,say:s=>s,esc:s=>s,jjButton:(id,s)=>`<button id="${id}">${s}</button>`,rpc:async(n,a)=>{calls.push(a);if(fail)throw Error('offline');return {...result}},ensureLive:()=>true,toast(){},navigate:async()=>{},logout(){},window:{addEventListener(){},removeEventListener(){},dispatchEvent(){},scrollTo(){}},Event:class{},setInterval(){},setTimeout,clearTimeout,document:{hidden:false,createElement:node},stopJJPlayer(){}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('jj-live.js','utf8')+';globalThis.live=JJLive;',ctx);
(async()=>{
assert.equal(ctx.liveUrls({guest_url:'https://vdo.ninja/?room=hello'}).view,'https://vdo.ninja/?room=hello');
assert.equal(ctx.liveUrls({guest_url:'https://evil.example/?view=test'}).view,undefined);
assert.equal(ctx.liveUrls({guest_url:'https://vdo.ninja/?director=test'}).view,undefined);
await ctx.livePage(1);assert.equal(get('#live-start').disabled,false);
await get('#live-prepare').onclick();assert.equal(calls.at(-1).p_action,'save');assert.match(calls.at(-1).p_data.stream_id,/^JJ/);
await get('#live-start').onclick();assert.equal(calls.at(-1).p_action,'start');
fail=true;await ctx.readLive();assert(ctx.live.error);assert(ctx.live.data);fail=false;await ctx.readLive();assert.equal(ctx.live.error,null);
result={revision:2,enabled:true,live:true,guest_url:'https://vdo.ninja/?room=hello'};await ctx.livePage(1);assert.equal(get('#live-start').disabled,false);assert.match(get('#live-view').innerHTML,/room=hello/);
await get('#live-watch').onclick();assert.equal(get('#live-watch').disabled,false);
const timer=ctx.setTimeout;ctx.setTimeout=fn=>timer(fn,0);ctx.rpc=()=>new Promise(()=>{});await assert.rejects(ctx.liveRequest(),/LIVE_TIMEOUT/);await ctx.readLive();assert.equal(ctx.live.busy,false);
console.log('Live: external links, safe URLs, setup/save/start, error recovery, viewer retry and timeout pass.');
})().catch(e=>{console.error(e);process.exitCode=1});

