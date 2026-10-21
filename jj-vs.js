'use strict';
const VsItems=[['bombitas','💣','Bombitas JJ','Bombitas JJ'],['cards','▣','Última carta JJ · tipo UNO','Last Card JJ · UNO-style'],['playingcards','♠','Baraja inglesa','Playing cards'],['pool','🎱','Billar JJ','Pool JJ'],['tictactoe','✕ ◯','Juego del gato','Tic-tac-toe'],['wands','🪄','Duelo de varitas','Wand duel'],['secretpuzzle','🧩','Puzle secreto','Secret puzzle'],['truth','♠','Verdad o reto','Truth or dare']];
menus.splice(menus.findIndex(m=>m[0]==='games')+1,0,['vs','⚔','Vs']);
menus.push(['casino','♦','Casino'],['pool','🎱','Billar JJ']);
UniverseGroups.games=UniverseGroups.games.filter(id=>!VsItems.some(([key])=>id===key));
const vsAllowed=sectionAllowed;sectionAllowed=function(page){if(page==='vs')return vsAllowed('vs')&&VsItems.some(([id])=>vsAllowed(['tictactoe','wands'].includes(id)?'puzzles':id));return vsAllowed(page);};
const vsVisibility=paintSectionVisibility;paintSectionVisibility=function(){vsVisibility();document.querySelectorAll('[data-nav="pool"]').forEach(b=>b.hidden=true);};
const vsNavigate=navigate;let vsRequest=0,vsLanding=false;
navigate=async function(page){if(!state.profile)return;const req=++vsRequest;if(!vsLanding){vsLanding=true;if(JJRooms.code('pool'))page='pool';}
 if(!['vs','casino','pool','puzzles'].includes(page)){await vsNavigate(page);if(req===vsRequest&&state.page==='games'){
  document.querySelectorAll('[data-universe-route]').forEach(b=>{if(VsItems.some(([id])=>id===b.dataset.universeRoute))b.remove();});
  const intro=$('#main .page-heading p');if(intro)intro.innerHTML=bi('Juega a tu ritmo y gana unas monedas. Los juegos con sala están en Vs.','Play at your pace and earn a few coins. Room games are in Vs.');
  $('#main').insertAdjacentHTML('afterbegin',`<p class="game-panel">${bi('Minijuegos clásicos: 1 JJ por terminar; +2 JJ al superar el récord actual de ambos. Piano tiene su propia tabla de premios y comparte los límites. Hasta 10 partidas premiadas y 20 JJ al día. Las partidas de prueba no dan monedas.','Classic minigames: 1 JJ for finishing; +2 JJ for beating the current record across both players. Piano has its own pay table and shares the limits. Up to 10 rewarded games and 20 JJ per day. Demo games do not award coins.')}</p>`);
 }return;}
 try{await loadSections();if(req!==vsRequest)return;if(!sectionAllowed(page))return vsNavigate('home');jjCleanup();clearTimers();state.page=page;const v=++state.version;rememberRoute(historyRoute(page));shell();window.scrollTo(0,0);
  if(page==='vs'){$('#main').innerHTML=lifeHeading('Vs','Vs','Una sala para dos. Elige el juego, comparte el código y acepta las reglas.','A room for two. Choose a game, share the code and accept the rules.')+universeCards(VsItems.filter(([id])=>sectionAllowed(['tictactoe','wands'].includes(id)?'puzzles':id)));bindUniverseCards();}
  else if(page==='puzzles'){$('#main').innerHTML=lifeHeading('Sopas y laberintos','Word searches & mazes','Un reto a tu ritmo.','A challenge at your pace.')+universeCards([['wordsearch','🔎','Sopa de letras','Word search'],['maze','🌀','Laberinto','Maze']]);bindUniverseCards();}
  else if(page==='casino')await casinoPage(v);else await poolPage(v);
 }catch(e){if(req===vsRequest){console.error(e);$('#main').innerHTML='<p>'+bi('No se pudo abrir. Comprueba la conexión y las actualizaciones SQL 32 y 33.','Could not open. Check your connection and SQL updates 32 and 33.')+'</p>';}}
};
const rewardedSave=saveScore;saveScore=async function(game,score,attempt=crypto.randomUUID()){const owner=state.profile?.id;await rewardedSave(game,score,attempt);if(state.demo||owner!==state.profile?.id)return;try{const reward=await rpc('jj_arcade_reward',{p_attempt:attempt});if(owner!==state.profile?.id||!reward)return;JJ.lastReward={...reward,owner,attempt};toast(reward.reward?`+${reward.reward} JJ · `+say(reward.record?'¡Nuevo récord!':'Partida completada',reward.record?'New record!':'Game completed'):say('Resultado guardado. Ya alcanzaste el límite de premios de hoy.','Score saved. You reached today’s reward limit.'));JJ.dashboard=null;}catch{/* Score remains saved if the optional receipt request is interrupted. */}};

function arcadeRewardLine(attempt){const r=JJ.lastReward;if(!r||r.owner!==state.profile?.id||r.attempt!==attempt)return '';return `<span class="arcade-receipt">${r.reward?`+${r.reward} JJ · `+bi(r.record?'Nuevo récord y partida completada':'Partida completada',r.record?'New record & game completed':'Game completed'):bi('Límite de premios de hoy alcanzado. Tu resultado sí se guardó.','Today’s reward limit reached. Your score was saved.')}</span>`;}
