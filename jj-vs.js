'use strict';
const VsItems=[['bombitas','💣','Bombitas JJ','Bombitas JJ'],['cards','▣','Última carta JJ · tipo UNO','Last Card JJ · UNO-style'],['playingcards','♠','Baraja inglesa','Playing cards'],['pool','🎱','Billar JJ','Pool JJ'],['golf','⛳','Golf J×J','Golf J×J'],['piano','♬','Piano JJ','Piano JJ'],['tictactoe','✕ ◯','Juego del gato','Tic-tac-toe'],['wands','🪄','Duelo de varitas','Wand duel'],['secretpuzzle','🧩','Puzle secreto','Secret puzzle'],['truth','♠','Verdad o reto','Truth or dare']];
menus.splice(menus.findIndex(m=>m[0]==='games')+1,0,['vs','⚔','Vs']);
menus.push(['casino','♦','Casino'],['pool','🎱','Billar JJ']);
UniverseGroups.games=UniverseGroups.games.filter(id=>!VsItems.some(([key])=>id===key));
const vsItemSection=id=>id==='golf'?'vs':['tictactoe','wands'].includes(id)?'puzzles':id;
const vsAllowed=sectionAllowed;sectionAllowed=function(page){if(page==='vs')return vsAllowed('vs')&&VsItems.some(([id])=>vsAllowed(vsItemSection(id)));return vsAllowed(page);};
const vsVisibility=paintSectionVisibility;paintSectionVisibility=function(){vsVisibility();document.querySelectorAll('[data-nav="pool"]').forEach(b=>b.hidden=true);};
function vsMinecraftCard(){
 const url=new URL('https://mcraft.fun/');
 url.search=new URLSearchParams({
  ip:'127.0.0.1:25565',
  version:'1.21.4',
  proxy:'https://fluffy-enigma-596xwq64776hpp5j-42622.app.github.dev',
  name:'Nuestro Mundo'
 }).toString();
 return `<section class="game-panel" id="universe-minecraft">
  <h2>${bi('Minecraft · Nuestro Mundo','Minecraft · Our World')}</h2>
  <p class="hint">${bi('Prueba en el navegador. En Account Override, elige tu cuenta de Microsoft con Minecraft Java o selecciona Any other MS account.','Browser playtest. Under Account Override, pick your Microsoft account with Minecraft Java or select Any other MS account.')}</p>
  <a class="btn" href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${bi('Entrar al mundo','Join our world')}</a>
 </section>`;
}
window.addEventListener('message',event=>{
 if(event.origin!==window.location.origin)return;
 const frame=$('#universe-golf-frame');
 if(!frame||event.source!==frame.contentWindow||event.data?.type!=='jj-golf-chat-draft')return;
 const code=event.data.code;
 if(typeof code!=='string'||!/^[A-F0-9]{10}$/.test(code))return;
 window.openUniverseChat?.(code);
});
function openUniverseGolf(){
 if(state.page!=='vs'||!sectionAllowed('vs'))return navigate('vs');
 const url=new URL('games/golf-jxj.html',document.baseURI);
 url.searchParams.set('v','16');
 url.searchParams.set('lang',document.documentElement.lang==='en'?'en':'es');
 const href=esc(url.href);
 jjCleanup();
 clearTimers();
 ++state.version;
 $('#main').innerHTML=`<section class="game-panel universe-golf" aria-labelledby="golf-heading">
  <header class="universe-golf-actions">
   <div>
    <h1 id="golf-heading" tabindex="-1">Golf J×J</h1>
    <p class="hint">${bi('Yisus y Julie · 12 hoyos en cuatro mundos','Yisus and Julie · 12 holes across four worlds')}</p>
   </div>
   <div>
    <button class="btn" id="golf-chat" type="button">${bi('Chat de Nuestro Universo','Our Universe chat')}</button>
    <button class="btn" id="golf-back" type="button">${bi('Volver a VS','Back to VS')}</button>
    <a class="btn" href="${href}" target="_blank" rel="noopener">${bi('Abrir en otra pestaña','Open in a new tab')}</a>
   </div>
  </header>
  <iframe id="universe-golf-frame" class="universe-golf-frame" src="${href}" title="Golf J×J"></iframe>
 </section>`;
 $('#golf-chat').onclick=()=>window.openUniverseChat?.();
 $('#golf-back').onclick=()=>navigate('vs');
 window.scrollTo(0,0);
 $('#golf-heading').focus();
}
const vsNavigate=navigate;let vsRequest=0,vsLanding=false;
navigate=async function(page){if(!state.profile)return;if(page==='puzzles')page='games';const req=++vsRequest;if(!vsLanding){vsLanding=true;if(JJRooms.code('pool'))page='pool';}
 if(!['vs','casino','pool'].includes(page)){await vsNavigate(page);if(req===vsRequest&&state.page==='games'){
  const intro=$('#main .page-heading p');if(intro)intro.innerHTML=bi('Juega a tu ritmo y gana unas monedas. Los juegos con sala están en Vs.','Play at your pace and earn a few coins. Room games are in Vs.');
  $('#main').insertAdjacentHTML('afterbegin',`<p class="game-panel">${bi('Minijuegos clásicos: 3 JJ por terminar; +3 JJ al mejorar tu propio récord del período. Hasta 12 partidas premiadas y 45 JJ al día. Las partidas de prueba no dan monedas.','Classic minigames: 3 JJ for finishing; +3 JJ for improving your own best this period. Up to 12 rewarded games and 45 JJ per day. Demo games do not award coins.')}</p>`);
 }return;}
 try{await loadSections();if(req!==vsRequest)return;if(!sectionAllowed(page))return vsNavigate('home');jjCleanup();clearTimers();state.page=page;const v=++state.version;rememberRoute(historyRoute(page));shell();window.scrollTo(0,0);
  if(page==='vs'){$('#main').innerHTML=lifeHeading('Vs','Vs','Una sala para dos. Elige el juego, comparte el código y acepta las reglas.','A room for two. Choose a game, share the code and accept the rules.')+(state.demo?'':vsMinecraftCard())+universeCards(VsItems.filter(([id])=>vsAllowed(vsItemSection(id))));bindUniverseCards();}
  else if(page==='casino')await casinoPage(v);else await poolPage(v);
 }catch(e){if(req===vsRequest){console.error(e);$('#main').innerHTML='<p>'+bi('No se pudo abrir. Comprueba la conexión y las actualizaciones SQL 32 y 33.','Could not open. Check your connection and SQL updates 32 and 33.')+'</p>';}}
};
const rewardedSave=saveScore;saveScore=async function(game,score,attempt=crypto.randomUUID()){const owner=state.profile?.id;await rewardedSave(game,score,attempt);if(state.demo||owner!==state.profile?.id)return;try{const reward=await rpc('jj_arcade_reward',{p_attempt:attempt});if(owner!==state.profile?.id||!reward)return;JJ.lastReward={...reward,owner,attempt};toast(reward.reward?`+${reward.reward} JJ · `+say(reward.record?'¡Nuevo récord!':'Partida completada',reward.record?'New record!':'Game completed'):say('Resultado guardado. Ya alcanzaste el límite de premios de hoy.','Score saved. You reached today’s reward limit.'));JJ.dashboard=null;}catch{/* Score remains saved if the optional receipt request is interrupted. */}};

function arcadeRewardLine(attempt){const r=JJ.lastReward;if(!r||r.owner!==state.profile?.id||r.attempt!==attempt)return '';return `<span class="arcade-receipt">${r.reward?`+${r.reward} JJ · `+bi(r.record?'Nuevo récord y partida completada':'Partida completada',r.record?'New record & game completed':'Game completed'):bi('Límite de premios de hoy alcanzado. Tu resultado sí se guardó.','Today’s reward limit reached. Your score was saved.')}</span>`;}
