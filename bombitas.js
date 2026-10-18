'use strict';
const BBSkins=[['casual','De diario','Everyday',0,'#faf7ec'],['catshirt','Camiseta gatuna','Cat tee',3,'#e6b4cf'],['sharkshirt','Camiseta tiburón','Shark tee',3,'#80bfd1'],['cat','Disfraz de gato','Cat costume',6,'#b4a2cf'],['shark','Disfraz tiburón','Shark costume',6,'#69a7c1'],['pajamas','Pijama de gatitos','Kitten pajamas',4,'#a8d6c1'],['ninja','Ninja nocturno','Night ninja',7,'#494e7c'],['yukata','Yukata lunar','Moon yukata',8,'#d99bac']];
const BBArt=new Image();BBArt.onload=()=>window.dispatchEvent(new Event('bb-art-ready'));BBArt.src='assets/bombitas/characters-v2.png';
function bbCharacter(ctx,x,y,size,handle,skin='casual',time=0){
 if(BBArt.complete&&BBArt.naturalWidth){const outfit=Math.max(0,BBSkins.findIndex(s=>s[0]===skin)),index=outfit*2+(handle==='julisa'?1:0),cw=BBArt.naturalWidth/4,ch=BBArt.naturalHeight/4,bob=time?Math.sin(time/110)*size*.025:0;ctx.save();ctx.translate(x,y+bob);ctx.drawImage(BBArt,index%4*cw,Math.floor(index/4)*ch,cw,ch,-size*.62,-size*.94,size*1.24,size*1.24);ctx.restore();return;}
 const outfit=BBSkins.find(s=>s[0]===skin)||BBSkins[0],girl=handle==='julisa';ctx.save();ctx.translate(x,y);ctx.scale(size/64,size/64);ctx.lineWidth=2;ctx.lineJoin='round';
 const ellipse=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
 ellipse(0,27,21,6,'#0005');if(girl)ellipse(0,-4,22,30,'#59362d');
 const bob=Math.sin(time/120)*1.5;ctx.translate(0,bob);
 rect(-13,11,10,15,skin==='pajamas'?outfit[4]:'#303647');rect(3,11,10,15,skin==='pajamas'?outfit[4]:'#303647');rect(-15,24,13,5,'#ede7df');rect(2,24,13,5,'#ede7df');
 rect(-17,-3,34,20,skin==='casual'&&girl?'#272a34':outfit[4]);ellipse(-19,7,4,7,'#efb897');ellipse(19,7,4,7,'#efb897');
 if(skin==='yukata'){ctx.strokeStyle='#fff0dd';ctx.beginPath();ctx.moveTo(-12,-2);ctx.lineTo(9,14);ctx.moveTo(12,-2);ctx.lineTo(-3,9);ctx.stroke();rect(-17,10,34,5,'#6d456c');ctx.save();ctx.rotate(-.5);rect(18,-5,4,38,'#ddd7e0');rect(14,-1,12,3,'#f1ca77');ctx.restore();}
 if(skin==='pajamas'){ctx.fillStyle='#fff9';for(let j=0;j<3;j++)for(let i=0;i<3;i++)ellipse(-10+i*10,2+j*5,1.3,1.3,'#fff9');}
 if(['catshirt','sharkshirt','pajamas'].includes(skin)){ctx.font='15px sans-serif';ctx.textAlign='center';ctx.fillText(skin==='sharkshirt'?'🦈':'🐱',0,12);}
 if(skin==='cat'){ctx.strokeStyle=outfit[4];ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(14,14);ctx.quadraticCurveTo(37,24,30,0);ctx.stroke();ellipse(0,-19,25,24,outfit[4]);ctx.fillStyle=outfit[4];for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(d*20,-27);ctx.lineTo(d*17,-48);ctx.lineTo(d*4,-33);ctx.fill();}}
 if(skin==='shark'){ellipse(0,-19,25,26,outfit[4]);ctx.fillStyle=outfit[4];ctx.beginPath();ctx.moveTo(-6,-39);ctx.lineTo(1,-55);ctx.lineTo(10,-38);ctx.fill();ellipse(0,-17,21,19,'#faf6e7');ellipse(-19,-31,2,2,'#1c3248');ellipse(19,-31,2,2,'#1c3248');}
 ellipse(0,-19,19,18,'#f0bf9e');ctx.fillStyle='#51342d';ctx.beginPath();ctx.arc(0,-26,20,Math.PI,Math.PI*2);ctx.fill();
 if(!girl){for(let i=0;i<7;i++)ellipse(-17+i*5,-33-Math.sin(i*2)*3,6,6,'#3e2b29');}else{ellipse(-17,-20,4,16,'#59362d');ellipse(17,-20,4,16,'#59362d');}
 if(skin==='ninja'){rect(-20,-33,40,8,'#31334e');rect(-20,-12,40,10,'#31334e');rect(-20,-27,40,3,'#ff9db7');}
 if(skin==='shark'){ctx.fillStyle='#fff';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-16+i*7,-35);ctx.lineTo(-12+i*7,-28);ctx.lineTo(-9+i*7,-35);ctx.fill();}}
 ctx.strokeStyle=girl?'#ecdfd2':'#292830';ctx.lineWidth=2.4;for(const d of [-1,1]){ctx.strokeRect(d<0?-16:2,-24,14,11);ellipse(d*9,-18,2,3,'#56382e');}ctx.beginPath();ctx.moveTo(-2,-20);ctx.lineTo(2,-20);ctx.stroke();if(skin!=='ninja'){ctx.strokeStyle='#b66c63';ctx.beginPath();ctx.arc(0,-12,4,0,Math.PI);ctx.stroke();}ctx.restore();
}
menus.push(['bombitas','💣','Bombitas JJ']);
const bbPreviousNavigate=navigate;
let bbNavigationRequest=0;
navigate=async function(page){const request=++bbNavigationRequest;if(page!=='bombitas')return bbPreviousNavigate(page);if(!state.profile)return;if(state.page==='bombitas'&&$('.bombitas'))return;const user=state.profile.id;try{await loadSections();}catch{}if(request!==bbNavigationRequest||state.profile?.id!==user)return;if(typeof sectionAllowed==='function'&&!sectionAllowed(page))return bbPreviousNavigate('home');jjCleanup();clearTimers();state.page=page;const v=++state.version;shell();window.scrollTo(0,0);await bbPage(v);};
// Existing awards stay untouched; every place that displays the wallet sees net coins.
const bbDashboard=getDashboard;
getDashboard=async function(){const data=await bbDashboard();if(!state.demo)try{const wallet=await rpc('bb_shop');data.coins=wallet.coins;}catch{/* Keeps the site usable before SQL 25 is installed. */}return data;};
// The original section function may whitelist older menus; keep its contract intact.
const bbRpc=rpc;
const bbVisibilityCache={user:null,value:false};
rpc=async function(name,args={}){if(name!=='jj_sections')return bbRpc(name,args);const user=state.profile?.id;let result;if(args.p_section==='bombitas'){const value=await bbRpc('bb_visibility',{p_visible:args.p_visible});bbVisibilityCache.user=user;bbVisibilityCache.value=value;result=await bbRpc(name);}else result=await bbRpc(name,args);try{const value=await bbRpc('bb_visibility');if(state.profile?.id===user){bbVisibilityCache.user=user;bbVisibilityCache.value=value;}result.bombitas=value;}catch{result.bombitas=bbVisibilityCache.user===user?bbVisibilityCache.value:false;}return result;};
