'use strict';
function competitionDemo(){const rows=JJ.dashboard?.scores||[];return {catalog:Object.keys(JJ.games).map(game=>({game})),history:[],leaders:Object.entries(names).map(([handle,name])=>{const games=Object.keys(JJ.games).filter(game=>{const scores=rows.filter(r=>r.game===game);const mine=scores.find(r=>r.profiles.handle===handle);return mine&&scores.every(r=>JJ.games[game].lower?mine.best<=r.best:mine.best>=r.best);});return {handle,name,games,firsts:games.length};})};}
function competitionHTML(d){const sorted=[...d.leaders].sort((a,b)=>b.firsts-a.firsts);return `<section class="game-panel competition-board"><div class="eyebrow">${bi('La carrera por la corona','The race for the crown')}</div><h2>${bi('¿Cuántos juegos lideramos?','How many games do we lead?')}</h2><p>${bi('Cuenta cada juego donde tienes el mejor récord de este período, no el número de partidas. Si empatan en un juego, cuenta para ambos.','Counts each game where you hold this period’s best record, not the number of rounds. A tied game counts for both.')}</p><div class="profile-pair">${sorted.map((p,i)=>`<article><h3>${p.firsts===sorted[0].firsts&&p.firsts>0?'👑 ':''}${esc(p.name)}</h3><strong class="ranking-number">${p.firsts} / ${d.catalog.length}</strong><p>${bi('juegos en primer lugar','games in first place')}</p><details><summary>${bi('Ver juegos','See games')}</summary><ul>${p.games.map(g=>`<li>${bi(JJ.games[g]?.es||g,JJ.games[g]?.en||g)}</li>`).join('')||`<li>${bi('Todavía ninguno','None yet')}</li>`}</ul></details></article>`).join('')}</div><p class="hint">${bi('Al cierre de los 14 días gana quien lidere más juegos. Si empatan, ambos reciben corona; sin juegos registrados, no hay corona.','At the end of 14 days, the player leading the most games wins. Tied leaders both receive crowns; no recorded games means no crown.')}</p><details><summary>${bi('Historial de coronas','Crown history')}</summary>${d.history.length?`<ul>${d.history.map(h=>`<li>${jjDate(h.period_start)} · ${esc(h.display_name)} · ${h.first_places} ${bi('primeros lugares','first places')} 👑</li>`).join('')}</ul>`:`<p>${bi('El primer período todavía no tiene coronas.','No crowns have been awarded yet.')}</p>`}<p class="hint">${bi('Se conservan las coronas anteriores a esta actualización.','Crowns awarded before this update are preserved.')}</p></details></section>`;}
function economyDemo(){return {players:Object.entries(names).map(([handle,name])=>({handle,name,jj:0,jxj:0,casino_spent:0}))};}
function economyHTML(data){
 const boards=[['jj','✦','Más monedas JJ','Most JJ coins','JJ'],['jxj','◈','Más monedas JXJ','Most JXJ coins','JXJ'],['casino_spent','🎰','Total apostado en casino','Total wagered in the casino','JXJ']];
 return `<section class="economy-board game-panel"><div class="eyebrow">${bi('Nuestros rankings','Our rankings')}</div><h2>${bi('Las monedas de nuestro universo','Our universe’s coins')}</h2><div class="economy-grid">${boards.map(([key,icon,es,en,unit])=>{
 const rows=[...data.players].sort((a,b)=>Number(b[key])-Number(a[key])||a.handle.localeCompare(b.handle));
 return `<article class="economy-ranking" data-ranking="${key}"><h3>${icon} ${bi(es,en)}</h3><ol>${rows.map((p,i)=>{const tied=rows.filter(r=>Number(r[key])===Number(p[key])).length>1;const place=1+rows.filter(r=>Number(r[key])>Number(p[key])).length;return `<li><span class="economy-place">${place}${tied?' =':''}</span><strong translate="no">${esc(p.name)}</strong><span translate="no">${Number(p[key]).toLocaleString(UniverseI18n.locale())} ${unit}</span></li>`;}).join('')}</ol></article>`;
 }).join('')}</div><p class="hint">${bi('JJ: saldo disponible después de compras y apuestas reservadas. JXJ: saldo actual. Casino: suma histórica de las apuestas, ganadas o perdidas; incluye el póker una sola vez. Los cambios de moneda no cuentan como apuestas.','JJ: available balance after purchases and reserved bets. JXJ: current balance. Casino: lifetime total of stakes, won or lost; poker counts once. Currency exchanges do not count as bets.')}</p><p id="ranking-state" class="hint" role="status"></p>${jjButton('refresh-rankings','Actualizar rankings','Refresh rankings','btn secondary')}</section>`;
}
const competitionNavigate=navigate;
navigate=async function(page){
 await competitionNavigate(page);
 const v=state.version,user=state.profile?.id;
 if(state.page!==page||!['home','games','puzzles'].includes(page)||!user)return;
 $('#competition-slot')?.remove();
 const slot=document.createElement('div');slot.id='competition-slot';$('#main').append(slot);
 const current=()=>v===state.version&&state.profile?.id===user&&slot.isConnected;
 let busy=false;
 async function refresh(){
  if(busy||!current())return;busy=true;
  const button=$('#refresh-rankings');if(button)button.disabled=true;
  try{
   const [crowns,economy]=await Promise.all([state.demo?competitionDemo():rpc('jj_competition'),page==='home'?(state.demo?economyDemo():rpc('jj_rankings')):null]);
   if(!current())return;
   slot.innerHTML=(economy?economyHTML(economy):'')+competitionHTML(crowns);
   if(economy){$('#refresh-rankings').onclick=refresh;$('#ranking-state').textContent=say('Actualizado: ','Updated: ')+new Date().toLocaleTimeString(UniverseI18n.locale(),{hour:'2-digit',minute:'2-digit'});}
  }catch(e){
   if(!current())return;
   if(!slot.querySelector('.economy-board'))slot.innerHTML=`<p class="hint" role="status">${bi('No se pudieron cargar los rankings. Comprueba tu conexión.','Could not load the rankings. Check your connection.')}</p>${jjButton('refresh-rankings','Reintentar','Retry','btn secondary')}`;
   else $('#ranking-state').textContent=say('No se pudo actualizar; se muestran los últimos datos.','Could not refresh; showing the last loaded data.');
   $('#refresh-rankings').onclick=refresh;console.warn('Rankings unavailable',e);
  }finally{busy=false;if(current()&&$('#refresh-rankings'))$('#refresh-rankings').disabled=false;}
 }
 await refresh();if(!current())return;
 if(page==='home'){
  const timer=setInterval(()=>{if(!document.hidden&&!$('#modal')?.open)refresh();},60000);
  const focus=()=>{if(!document.hidden)refresh();};document.addEventListener('visibilitychange',focus);
  JJ.cleanups.push(()=>{clearInterval(timer);document.removeEventListener('visibilitychange',focus);});
 }
};
