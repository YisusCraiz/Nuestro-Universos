'use strict';
menus.push(['piano','♬','Piano JJ']);
const pianoVisibility=paintSectionVisibility;paintSectionVisibility=function(){pianoVisibility();document.querySelectorAll('[data-nav="piano"]').forEach(b=>b.hidden=true);};
const pianoNavigate=navigate;
navigate=async function(page){if(page!=='piano')return pianoNavigate(page);
 if(!state.profile)return;await loadSections();if(!sectionAllowed('piano'))return pianoNavigate('home');jjCleanup();clearTimers();state.page='piano';const v=++state.version;rememberRoute(historyRoute('piano'));shell();await pianoPage(v);};

const PianoHighway={
 lead:[2400,1800,1250],
 y:600,
 colors:['#71f1f5','#a99cff','#ff92ca','#ffd486'],
 edge(lane,depth){return 320+(lane-2)*160*(.25+.75*depth);},
 note(lane,remaining,lead){
  const depth=Math.max(0,Math.min(1,1-remaining/lead));
  const left=this.edge(lane+.085,depth),right=this.edge(lane+.915,depth);
  return {left,width:right-left,y:54+(this.y-54)*depth,height:8+20*depth};
 },
 draw(c,game,time,lead){
  const background=c.createLinearGradient(0,0,0,720);
  background.addColorStop(0,'#352752');
  background.addColorStop(.37,'#191732');
  background.addColorStop(1,'#080d1d');
  c.fillStyle=background;c.fillRect(0,0,640,720);
  for(let lane=0;lane<4;lane++){
   c.beginPath();
   c.moveTo(this.edge(lane,0),54);
   c.lineTo(this.edge(lane+1,0),54);
   c.lineTo(this.edge(lane+1,1),this.y);
   c.lineTo(this.edge(lane,1),this.y);
   c.closePath();
   c.fillStyle=lane%2?'#211d3b':'#14172f';c.fill();
   c.strokeStyle='#988ace65';c.lineWidth=2;c.stroke();
   c.fillStyle=this.colors[lane];
   c.fillRect(this.edge(lane,1)+4,this.y-2,152,4);
   c.fillStyle='#d9d3ff';
   c.font='bold 24px sans-serif';c.textAlign='center';
   c.fillText('DFJK'[lane],this.edge(lane+.5,1),653);
  }
  for(let i=game.notes.length-1;i>=0;i--){
   const note=game.notes[i],remaining=note.t-time;
   if(game.states[i]||remaining>lead||remaining<-200)continue;
   const shape=this.note(note.l,remaining,lead);
   c.fillStyle=this.colors[note.l];
   c.fillRect(shape.left,shape.y-shape.height/2,shape.width,shape.height);
   c.fillStyle='#ffffffac';
   c.fillRect(shape.left,shape.y-shape.height/2,shape.width,Math.max(2,shape.height*.18));
  }
  if(time<0){
   c.fillStyle='#fff';c.font='bold 58px sans-serif';c.textAlign='center';
   c.fillText(String(Math.ceil(-time/1000)),320,310);
  }
 }
};

function pianoConcert(owner){
 const band=[['jesus','Yisus','drums','#74e8f2'],['julisa','Julie','keys','#91aaff'],['sani','Sani','voice','#ec98df'],['tobey','Tobey','guitar','#ffc67d']];
 const instruments=[['drums','Batería','Drums'],['keys','Teclado','Keyboard'],['voice','Micrófono','Microphone'],['guitar','Guitarra','Guitar']];
 const key='jj-piano-concert-'+owner;
 let saved={}, wardrobe;
 try{saved=JSON.parse(localStorage.getItem(key))||{};}catch{}
 const lineup=Object.fromEntries(band.map(([id,,instrument])=>[id,instruments.some(([value])=>value===saved.lineup?.[id])?saved.lineup[id]:instrument]));
 let skin=typeof saved.skin==='string'?saved.skin:'';
 const root=$('#piano-dressing-room'), live=$('#piano-live-band');
 const choices=instruments.map(([value,es,en])=>`<option value="${value}">${esc(say(es,en))}</option>`).join('');
 const card=([id,name,,color],controls)=>`<div class="piano-band-member" style="--performer:${color}"><div class="piano-band-art"><canvas width="128" height="146" data-piano-performer="${id}" aria-hidden="true"></canvas><canvas width="112" height="72" data-piano-instrument-art="${id}" aria-hidden="true"></canvas></div>${controls?`<label>${name}<select data-piano-instrument="${id}">${choices}</select></label>`:`<strong>${name}</strong>`}</div>`;
 root.innerHTML=`<summary>${bi('Camerino de Nuestro Escenario','Our Stage dressing room')}</summary><div class="piano-band-grid">${band.map(member=>card(member,true)).join('')}</div><label>${bi('Tu skin para este concierto','Your outfit for this concert')}<select id="piano-concert-skin"><option value="">${say('Usar mi skin equipada','Use my equipped outfit')}</option></select></label><p id="piano-concert-status" role="status"></p>`;
 live.innerHTML=band.map(member=>card(member,false)).join('');
 const skinInput=$('#piano-concert-skin');
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify({skin,lineup}));}catch{}};
 function draw(){
  const handle=state.profile?.handle;
  for(const [id] of band){
   for(const panel of [root,live]){
    const canvas=panel.querySelector(`[data-piano-performer="${id}"]`);
    if(id==='jesus'||id==='julisa'){
     const look=id===handle?(wardrobe?.owned.includes(skin)?skin:wardrobe?.equipped):null;
     JJWardrobe.draw(canvas,id,look||'casual');
    }else pianoGuestPortrait(canvas,id);
    pianoInstrumentSprite(panel.querySelector(`[data-piano-instrument-art="${id}"]`),lineup[id]);
   }
  }
 }
 for(const input of root.querySelectorAll('[data-piano-instrument]')){
  const id=input.dataset.pianoInstrument;
  input.value=lineup[id];
  input.onchange=()=>{lineup[id]=input.value;persist();draw();};
 }
 skinInput.onchange=()=>{skin=skinInput.value;persist();draw();};
 async function loadWardrobe(){
  try{
   const data=await JJWardrobe.read();
   if(!root.isConnected)return;
   wardrobe=data;
   skinInput.length=1;
   for(const [id,es,en] of BBSkins)if(data.owned.includes(id))skinInput.add(new Option(say(es,en),id));
   skinInput.value=data.owned.includes(skin)?skin:'';
   $('#piano-concert-status').textContent='';
   draw();
  }catch{
   if(root.isConnected)$('#piano-concert-status').textContent=say('El armario no pudo cargar. Vuelve a abrir Piano JJ para reintentar.','The wardrobe could not load. Reopen Piano JJ to retry.');
  }
 }
 draw();
 loadWardrobe();
 window.addEventListener('bb-art-ready',draw);
 window.addEventListener('jj-wardrobe-changed',loadWardrobe);
 JJ.cleanups.push(()=>{window.removeEventListener('bb-art-ready',draw);window.removeEventListener('jj-wardrobe-changed',loadWardrobe);});
}

function pianoInstrumentSprite(canvas,instrument){
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,112,72);
 const box=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
 const oval=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 ctx.save();
 if(instrument==='keys'){
  box(8,23,96,32,'#2b2348');box(8,19,96,8,'#9a82f4');
  for(let i=0;i<12;i++){box(11+i*7.5,28,6.5,21,'#f2edff');if([0,1,3,4,5,7,8,10].includes(i))box(16+i*7.5,28,4,13,'#30264e');}
 }else if(instrument==='drums'){
  box(19,24,3,40,'#d9cceb');box(89,20,3,42,'#d9cceb');
  oval(21,23,15,4,'#fac46c');oval(90,19,15,4,'#fac46c');
  oval(56,53,24,17,'#51418b');oval(56,51,20,15,'#cdbdff');
  oval(42,33,12,7,'#f399cf');oval(72,33,12,7,'#f399cf');
 }else if(instrument==='voice'){
  ctx.translate(56,36);ctx.rotate(.55);
  box(-5,-8,10,36,'#7667a0');box(-5,-5,10,5,'#dba0ff');oval(0,-12,9,11,'#eee6ff');box(-7,-15,14,2,'#af9ecb');box(-7,-10,14,2,'#af9ecb');
 }else{
  ctx.translate(56,38);ctx.rotate(-.54);
  oval(-20,0,19,14,'#f1a06e');oval(-6,0,13,10,'#f1a06e');oval(-15,0,6,6,'#51305a');
  box(-8,-4,43,8,'#6b456e');box(30,-6,12,12,'#ffcc92');box(-24,-1,58,2,'#fff1ce');
 }
 ctx.restore();
}

function pianoGuestPortrait(canvas,id){
 const ctx=canvas.getContext('2d'), sani=id==='sani';
 const oval=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
 ctx.clearRect(0,0,128,146);
 const hair=sani?'#694033':'#29202a';
 oval(64,72,sani?36:31,sani?48:38,hair);
 if(sani){oval(37,90,16,38,hair);oval(91,92,16,39,hair);}
 oval(64,114,36,29,sani?'#a34ed1':'#b87541');
 oval(64,68,29,31,'#efb38c');
 oval(62,43,30,12,hair);
 for(const x of [53,75]){
  oval(x,67,5,7,'#382132');
  oval(x-1,65,1.8,2,'#fff');
 }
 oval(47,78,5,2,'#e48385');
 oval(81,78,5,2,'#e48385');
 if(!sani){oval(64,88,17,9,hair);oval(64,81,10,4,hair);}
 oval(64,87,5,2,sani?'#a55160':'#ffdbc0');
}

async function pianoPage(v){
 const owner=state.profile.id,current=()=>state.version===v&&state.profile?.id===owner;
 let songs=[],buffer=null,ctx=null,source=null,game=null,run=null,raf=0,startedAt=0,wallStart=0,paused=false,active=false,loading=false,disposed=false,abort=null,difficulty=1,duration=0,notes=[],lastHUD='',retry=null;
 let mode='solo',duo=null,duoBusy=false,duoPolling=false,duoScheduled=false,duoEpoch=0,preparedRevision=null,dirty=false;
 const speedKey='jj-piano-speed-'+owner;
 let speed=1;
 try{const value=localStorage.getItem(speedKey);if(value!==null&&PianoHighway.lead[Number(value)])speed=Number(value);}catch{}
 const duoKey='jj-piano-room-'+owner,pendingKey='jj-piano-pending-'+owner;
 try{retry=JSON.parse(localStorage.getItem(pendingKey)||'null');}catch{}
 $('#main').innerHTML=lifeHeading('Piano JJ','Piano JJ','Tu música, tu ritmo. Elige cómo quieres jugar.','Your music, your rhythm. Choose how to play.')+`
 <div class="piano-modes" role="group" aria-label="${say('Modo de juego','Game mode')}">
 <button id="piano-mode-solo" class="game-panel"><strong>♬ ${bi('Jugar solo','Play solo')}</strong><span>${bi('Elige canción, dificultad y empieza.','Choose a song, difficulty and start.')}</span></button>
 <button id="piano-mode-duo" class="game-panel"><strong>♡ ${bi('Jugar dos','Play together')}</strong><span>${bi('Crea o únete a una sala. Apuesta si ambos quieren.','Create or join a room. Wager if you both want to.')}</span></button></div>
 <section class="game-panel" id="piano-room-panel" hidden><div id="piano-duo"></div><p id="piano-room-feedback" role="status" aria-live="polite"></p></section>
 <section class="game-panel" id="piano-setup"><h2>1 · ${bi('Elige tu música','Choose your music')}</h2><p id="piano-selection-hint"></p>
 <div class="piano-select-grid"><label>${bi('Nuestra música','Our music')}<select id="piano-song"><option value="">${say('Cargando canciones…','Loading songs…')}</option></select></label>
 <label>${bi('Dificultad','Difficulty')}<select id="piano-level"><option value="1">${say('Fácil','Easy')}</option><option value="2">${say('Normal','Normal')}</option><option value="3">${say('Difícil','Hard')}</option></select></label>
 <label>${bi('Duración','Length')}<select id="piano-length"><option value="60">${say('Un minuto','One minute')}</option><option value="120">${say('Dos minutos','Two minutes')}</option><option value="600">${say('Canción completa · hasta 10 min','Full song · up to 10 min')}</option></select></label></div>
 <p class="hint">${bi('Usamos las canciones con audio de Nuestra música. Los enlaces de Spotify no se pueden reproducir en el juego.','Uses audio tracks from Our music. Spotify links cannot play inside this game.')}</p>
 <button class="btn" id="piano-prepare"></button><p id="piano-load" role="status" aria-live="polite"></p></section>
 <label class="piano-scroll-setting">${bi('Velocidad visual de notas','Note scroll speed')}<select id="piano-scroll-speed"><option value="0">${say('Lenta','Slow')}</option><option value="1">Normal</option><option value="2">${say('Rápida','Fast')}</option></select></label>
 <details id="piano-dressing-room" class="game-panel"></details>
 <section id="piano-bets" class="game-panel" hidden></section><section id="piano-room-actions" class="game-panel" hidden></section>
 <section id="piano-stage" hidden><p id="piano-hud" aria-live="off"></p><p id="piano-live-song" translate="no"></p><div id="piano-live-band" class="piano-band-grid" aria-hidden="true"></div><div class="piano-board-wrap"><canvas id="piano-board" width="640" height="720" aria-label="${say('Notas de piano','Piano notes')}"></canvas><div id="piano-glows" aria-hidden="true"></div></div>
 <div class="piano-keys">${['D','F','J','K'].map((k,i)=>`<button data-piano-lane="${i}" aria-label="${say('Tecla','Key')} ${k}">${k}</button>`).join('')}</div><div class="row">${jjButton('piano-pause','Pausar','Pause','btn secondary')}${jjButton('piano-stop','Terminar partida','Stop game','text-button')}</div><p id="piano-feedback" role="status"></p></section>
 <section id="piano-result" class="game-panel" hidden></section><div id="piano-pending"></div>
 <details class="game-panel piano-guide"><summary>${bi('Cómo jugar y ganar JJ','How to play and earn JJ')}</summary><p>${bi('Toca D F J K o las cuatro teclas al llegar las notas a la línea. Perfecto: 100; Bien: 70; fallo: −10. C requiere 60 %, B 75 %, A 90 % y S 97 %.','Press D F J K or the four keys as notes reach the line. Perfect: 100; Good: 70; wrong: −10. C needs 60%, B 75%, A 90%, S 97%.')}</p><table class="leaderboard"><thead><tr><th>${bi('Nivel','Level')}</th><th>C / B / A / S · JJ</th></tr></thead><tbody><tr><td>${bi('Fácil','Easy')}</td><td>2 / 3 / 5 / 6</td></tr><tr><td>Normal</td><td>3 / 5 / 8 / 11</td></tr><tr><td>${bi('Difícil','Hard')}</td><td>5 / 8 / 12 / 15</td></tr></tbody></table><p>${bi('+2 JJ por mejorar tu marca. Comparte el máximo de 45 JJ y 12 partidas premiadas diarias con minijuegos. Las apuestas son aparte de esos premios.','+2 JJ for a personal best. Shares the daily cap of 45 JJ and 12 rewarded games with minigames. Wagers are separate from rewards.')}</p></details>`;

 pianoConcert(owner);
 const speedInput=$('#piano-scroll-speed');
 speedInput.value=String(speed);
 speedInput.onchange=()=>{
  const selected=Number(speedInput.value);
  if(!PianoHighway.lead[selected])return;
  speed=selected;
  try{localStorage.setItem(speedKey,String(speed));}catch{}
 };

 function message(es,en){if(!current())return;for(const id of ['piano-load','piano-room-feedback'])$('#'+id).textContent=say(es,en);}
 function settings(){return {song:$('#piano-song').value,difficulty,duration,times:notes.map(n=>n.t)};}
 function time(){return duo?performance.now()-wallStart:ctx?(ctx.currentTime-startedAt)*1000:0;}
 function stopAudio(){try{source?.stop();}catch{}source=null;document.body.classList.remove('jj-rhythm-active');}
 async function unlockAudio(){ctx??=new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();}
 function setRemoteSettings(s){if(!s?.song)return;$('#piano-song').value=s.song;$('#piano-level').value=s.difficulty;const sel=$('#piano-length');if(![...sel.options].some(o=>o.value===String(s.duration)))sel.add(new Option(s.duration+' s',String(s.duration)));sel.value=String(s.duration);difficulty=s.difficulty;duration=s.duration;}
 function resetPrepared(){buffer=null;preparedRevision=null;dirty=!!duo;}
 function drawPeople(){if(!current())return;document.querySelectorAll('[data-piano-avatar]').forEach(c=>{const p=duo?.players?.[+c.dataset.pianoAvatar];if(p)JJWardrobe.draw(c,p.handle,p.skin);});}
 function paintDuo(){paint();}
 function paint(){
  if(!current())return;const host=duo?.host===owner,busy=active||loading||duoBusy||!!retry,editable=!busy&&(!duo||host&&!duo.starts_at);
  $('#piano-mode-solo').setAttribute('aria-pressed',String(mode==='solo'));$('#piano-mode-duo').setAttribute('aria-pressed',String(mode==='duo'));
  $('#piano-mode-solo').disabled=busy;$('#piano-mode-duo').disabled=busy;
  $('#piano-room-panel').hidden=mode!=='duo';$('#piano-bets').hidden=!duo;$('#piano-room-actions').hidden=!duo;
  for(const id of ['piano-song','piano-level','piano-length'])$('#'+id).disabled=!editable||!songs.length;
  $('#piano-selection-hint').innerHTML=retry?bi('Guarda el resultado pendiente de tu partida anterior para continuar.','Save your previous pending result to continue.'):mode==='duo'&&!duo?bi('Crea una sala o entra con un código; después el anfitrión elige la música.','Create a room or join with a code, then the host chooses music.'):duo&&!host?bi('El anfitrión elige la canción y dificultad. Tú preparas ese mismo audio y confirmas aquí.','The host chooses the song and difficulty. Prepare that same audio and confirm here.'):duo?bi('Puedes cambiar canción y dificultad antes de empezar. Después pulsa Preparar selección.','Change song and difficulty before starting, then press Prepare selection.'):bi('Sin sala ni espera: elige tus ajustes y pulsa Jugar ahora.','No room or waiting: choose settings and press Play now.');
  const main=$('#piano-prepare');main.disabled=busy||!songs.length||(mode==='duo'&&!duo)||!!duo?.starts_at||(!host&&!!duo&&!duo.settings?.song);
  main.innerHTML=loading?bi('Preparando audio…','Preparing audio…'):mode==='solo'?bi('▶ Jugar ahora','▶ Play now'):host?bi('2 · Preparar selección','2 · Prepare selection'):duo?.bet?.state==='offered'&&!duo.bet.guest_ok?bi(`2 · Preparar y aceptar ${duo.bet.amount} JJ`,`2 · Prepare & accept ${duo.bet.amount} JJ`):bi('2 · Preparar y confirmar','2 · Prepare & confirm');
  if(mode!=='duo')return;
  const root=$('#piano-duo');
  if(!duo){if(!root.querySelector('#piano-create')){root.innerHTML=`<h2>${bi('Tu sala para dos','Your room for two')}</h2><p>${bi('Crea la sala primero; después elige música y dificultad. O entra con el código de tu pareja.','Create the room first, then choose music and difficulty. Or join using your partner’s code.')}</p>${JJRooms.entry('piano')}${jjButton('piano-recover','Recuperar mi sala','Recover my room','text-button')}`;$('#piano-recover').onclick=()=>sendRoom('recover');$('#piano-create').onclick=()=>sendRoom('create');$('#piano-join-form').onsubmit=e=>{e.preventDefault();sendRoom('join',{},$('#piano-code').value);};}$('#piano-create').disabled=busy;$('#piano-join').disabled=busy;$('#piano-recover').disabled=busy;return;}
  const people=(duo.players||[]).map((p,i)=>`<article class="piano-person ${p.online?'online':''}"><canvas width="120" height="150" data-piano-avatar="${i}" aria-label="${esc(p.name)}"></canvas><strong translate="no">${esc(p.name)}</strong><span>${p.online?bi('● Conectado','● Connected'):bi('○ Sin conexión','○ Offline')}</span><small>${p.prepared?bi('Audio listo ✓','Audio ready ✓'):bi('Preparando…','Preparing…')}</small></article>`).join('');
  const html=`<div class="room-invite"><span>${bi('Sala','Room')}</span><strong translate="no">${esc(duo.code)}</strong>${jjButton('piano-copy','Compartir código','Share code','btn secondary')}${jjButton('piano-leave','Salir de la sala','Leave room','text-button')}</div><div class="piano-people">${people}${!duo.guest?`<article class="piano-person waiting"><span>♡</span><h3>${bi('Esperando a tu pareja','Waiting for your partner')}</h3><p>${bi('Comparte el código de arriba.','Share the code above.')}</p></article>`:''}</div>`;
  if(root.dataset.view!==html){root.innerHTML=html;root.dataset.view=html;$('#piano-copy').onclick=()=>JJRooms.copy(duo.code,'piano',$('#piano-room-feedback'));$('#piano-leave').onclick=leaveRoom;drawPeople();}
  const bet=$('#piano-bets');const betState=JSON.stringify([duo.bet,host,!!duo.guest,!!duo.host_ready,!!duo.starts_at,duo.coins]);
  if(bet.dataset.view!==betState){bet.dataset.view=betState;bet.innerHTML=`<h2>${bi('Apuesta opcional · JJ','Optional wager · JJ')}</h2><p>${bi('Saldo disponible','Available balance')}: <strong>${duo.coins} JJ</strong></p><p>${bi('Ambos ponen la misma cantidad; quien obtiene más puntos gana el bote. Empate: devolución. Solo monedas virtuales.','Both stake the same amount; the higher score wins the pot. Ties refund both stakes. Virtual coins only.')}</p>${host&&!duo.starts_at?`<form id="piano-bet-form" class="row"><label>${bi('JJ por persona · 0 = sin apuesta','JJ per player · 0 = no wager')}<input id="piano-stake" type="number" min="0" max="1000" step="1" value="${duo.bet?.state==='offered'?duo.bet.amount:0}" required></label><button class="btn secondary" id="piano-bet-save">${bi('Guardar apuesta','Save wager')}</button></form>`:''}<p id="piano-bet-state">${betText()}</p><p class="hint">${bi('Cambiar la canción devuelve la reserva y requiere una nueva aceptación. Si sales con la apuesta en juego, gana tu pareja. Si falta un resultado 60 s después del final, gana quien sí terminó; si ninguno terminó, se devuelve.','Changing the song refunds the reservation and requires new acceptance. Leaving a running wager forfeits to your partner. If a result is missing 60 s after the end, the player who finished wins; if neither finished, both are refunded.')}</p>`;
   if($('#piano-bet-form'))$('#piano-bet-form').onsubmit=e=>{e.preventDefault();sendRoom('bet',{amount:Number($('#piano-stake').value)});};}
  if($('#piano-bet-save'))$('#piano-bet-save').disabled=busy||!duo.guest||!duo.host_ready||dirty;
  const results=duo.results||[],done=results.every(Boolean)&&results.length===2;
  $('#piano-room-actions').innerHTML=`<h2>3 · ${bi('A tocar juntos','Play together')}</h2><p id="piano-room-status" role="status">${duo.starts_at?(done?bi('Partida terminada','Game finished'):bi('Partida iniciada; no hay pausa en dúo.','Game started; duo has no pause.')):dirty&&host?bi('Prepara los ajustes elegidos para aplicarlos.','Prepare your selected settings to apply them.'):duo.ready?bi('Ambos preparados. ¡Pueden comenzar!','Both ready. You can start!'):bi('Ambos deben preparar y confirmar el audio.','Both players must prepare and confirm audio.')}</p>${host&&!duo.starts_at?jjButton('piano-room-start','▶ Comenzar juntos','▶ Start together'):''}<div class="piano-scores">${results.map((r,i)=>r?`<p><strong>${esc(duo.players?.[i]?.name||'')}</strong> · ${r.score} pts · ${r.grade}</p>`:'').join('')}</div>${done?`<strong>${results[0].score===results[1].score?bi('Empate','Tie'):bi('Gana ','Winner: ')+esc(duo.players[results[0].score>results[1].score?0:1].name)}</strong>`:''}${host&&duo.can_rematch?jjButton('piano-rematch','Revancha · elegir otra canción','Rematch · choose another song','btn secondary'):''}`;
  if($('#piano-room-start')){$('#piano-room-start').disabled=busy||!duo.ready||!buffer||dirty||!duo.players?.every(p=>p.online);$('#piano-room-start').onclick=()=>sendRoom('start');}
  if($('#piano-rematch')){$('#piano-rematch').disabled=busy;$('#piano-rematch').onclick=()=>sendRoom('rematch');}
 }
 function betText(){const b=duo?.bet;if(!b)return bi('Sin apuesta: solo juegan por puntos y recompensas.','No wager: play for points and rewards.');if(b.state==='paid')return bi('Bote ganado por ','Pot won by ')+esc(duo.players.find(p=>p.id===b.winner)?.name||'')+` · ${b.amount*2} JJ`;if(b.state==='refunded')return bi('Apuesta devuelta a ambos.','Wager refunded to both.');return `${b.amount} JJ ${bi('por persona','per player')} · ${b.state==='running'?bi('En juego','Running'):b.guest_ok?bi('Aceptada por ambos','Both accepted'):bi('Esperando aceptación de tu pareja','Waiting for your partner’s acceptance')}`;}
 async function leaveRoom(){if(duo?.bet?.state==='running'&&!confirm(say('Salir pierde la apuesta. ¿Salir?','Leaving forfeits the wager. Leave?')))return false;return sendRoom('leave');}
 async function setMode(next){if(next===mode||loading||active||retry)return;if(duo){if(!await leaveRoom())return;}mode=next;buffer=null;$('#piano-result').hidden=true;paint();}
 async function acceptRoom(next,action){if(!current())return;const previous=duo;
  if(next.closed){active=false;cancelAnimationFrame(raf);stopAudio();$('#piano-stage').hidden=true;duo=null;duoScheduled=false;preparedRevision=null;buffer=null;dirty=false;$('#piano-duo').dataset.view='';$('#piano-bets').dataset.view='';localStorage.removeItem(duoKey);paint();return;}
  mode='duo';duo=next;localStorage.setItem(duoKey,next.code);
  const changed=previous&&previous.revision!==next.revision;
  if(action==='configure'){preparedRevision=next.revision;dirty=false;}
  else if(action==='rematch'||changed||!previous){buffer=null;preparedRevision=null;dirty=false;duoScheduled=false;if(action==='rematch'){$('#piano-result').hidden=true;run=null;}setRemoteSettings(next.settings);}
  if(next.starts_at&&!duoScheduled){duoScheduled=true;next._delay=Date.parse(next.starts_at)-Date.parse(next.server_now)-(next._rtt||0)/2;next._startLocal=performance.now()+next._delay;
   if(!buffer||next._delay<300){message('No estás listo para este inicio. Sal o espera la revancha.','You are not ready for this start. Leave or wait for a rematch.');}
   else await start();
  }
  paint();
 }
 function roomError(e){const code=e.message||'';const map={INSUFFICIENT_COINS:['No tienes suficientes JJ para esa apuesta.','Not enough JJ for that wager.'],NOT_READY:['Falta preparar o confirmar el audio de ambos.','Both players must prepare and confirm audio.'],SETTINGS_CHANGED:['La canción cambió. Prepara el audio otra vez.','The song changed. Prepare the audio again.'],BET_NOT_READY:['Primero prepara la canción e invita a tu pareja.','Prepare the song and invite your partner first.'],BET_CHANGED:['La apuesta cambió. Revisa la cantidad y acepta de nuevo.','The wager changed. Review the amount and accept again.'],ACCEPT_BET_REQUIRED:['Debes aceptar expresamente la apuesta.','Explicit acceptance of the wager is required.'],ROOM_NOT_FOUND:['La sala caducó. Crea o entra a otra.','Room expired. Create or join another.']};const t=Object.entries(map).find(([k])=>code.includes(k))?.[1];message(t?.[0]||'No se confirmó la acción. Reintenta: '+code,t?.[1]||'Action unconfirmed. Retry: '+code);}
 async function sendRoom(action,data={},code=duo?.code||''){
  if(duoBusy||!current()||!ensureLive())return false;duoBusy=true;++duoEpoch;paint();
  try{const sent=performance.now(),next=await rpc('jj_piano_lobby',{p_action:action,p_code:code,p_data:data});next._rtt=performance.now()-sent;if(!current())return false;await acceptRoom(next,action);return true;}
  catch(e){roomError(e);return false;}finally{duoBusy=false;paint();}
 }
 async function refreshDuo(){if(!duo||duoBusy||duoPolling||!current())return;duoPolling=true;const epoch=duoEpoch,code=duo.code;try{const sent=performance.now(),next=await rpc('jj_piano_lobby',{p_code:code});next._rtt=performance.now()-sent;if(epoch===duoEpoch&&duo?.code===code&&!duoBusy)await acceptRoom(next,'read');}catch(e){roomError(e);}finally{duoPolling=false;}}
 function lock(){paint();}
 function draw(){
  if(!current()||!active||paused)return;
  const t=time(),canvas=$('#piano-board');
  game.tick(t);
  PianoHighway.draw(canvas.getContext('2d'),game,t,PianoHighway.lead[speed]);
  const r=game.result(),hud=`${Math.max(0,Math.floor(t/1000))} / ${duration}s · ${r.score} pts · ${say('Rango','Rank')} ${r.grade} · ${game.combo} combo`;if(hud!==lastHUD){lastHUD=hud;$('#piano-hud').textContent=hud;}
  if(t>=duration*1000){finish();return;}raf=requestAnimationFrame(draw);
 }
 function press(lane){const t=time();if(!active||paused||t<0||t>duration*1000)return;const result=game.press(t,lane);$('#piano-feedback').textContent='';if(result!=='perfect'&&result!=='good')return;
  $('#piano-feedback').textContent=result==='perfect'?say('¡Perfecto!','Perfect!'):say('¡Bien!','Good!');
  const hit=game.lastHit,glow=document.createElement('span');
  const shape=PianoHighway.note(lane,hit.t-t,PianoHighway.lead[speed]);
  glow.className='piano-note-glow';
  glow.dataset.judgement=result;
  glow.style.left=(shape.left/640*100)+'%';
  glow.style.width=(shape.width/640*100)+'%';
  glow.style.top=(shape.y/720*100)+'%';
  glow.style.height=(shape.height/720*100)+'%';
  $('#piano-glows').append(glow);
  glow.addEventListener('animationend',()=>glow.remove(),{once:true});
  setTimeout(()=>glow.remove(),500);
  const b=document.querySelector(`[data-piano-lane="${lane}"]`);b.classList.remove('piano-hit');void b.offsetWidth;b.classList.add('piano-hit');b.onanimationend=()=>b.classList.remove('piano-hit');const stamp=String(Number(b.dataset.pianoFlash||0)+1);b.dataset.pianoFlash=stamp;setTimeout(()=>{if(b.dataset.pianoFlash===stamp)b.classList.remove('piano-hit');},320);
 }
 async function pause(){if(!active)return;if(duo){message('En dúo no hay pausa individual. Termina la partida para salir.','Duo games cannot pause individually. Stop the game to leave.');return;}try{if(paused){await ctx.resume();if(!current())return;paused=false;$('#piano-pause').innerHTML=bi('Pausar','Pause');raf=requestAnimationFrame(draw);}else{paused=true;cancelAnimationFrame(raf);await ctx.suspend();if(current())$('#piano-pause').innerHTML=bi('Continuar','Resume');}}catch{message('No se pudo continuar el audio. Vuelve a preparar la canción.','Audio could not resume. Prepare the song again.');}}
 function persistPending(){try{if(retry)localStorage.setItem(pendingKey,JSON.stringify(retry));else localStorage.removeItem(pendingKey);}catch{}}
 function pending(){const root=$('#piano-pending');root.innerHTML=retry?`<p>${bi('Resultado pendiente. Puedes reintentar sin duplicar el premio.','Result pending. Retry without duplicating the reward.')}</p>${jjButton('piano-retry','Guardar resultado pendiente','Save pending result')}`:'';if($('#piano-retry'))$('#piano-retry').onclick=settle;paint();}
 async function settle(){if(!retry||!current())return;const row=retry;if($('#piano-retry'))$('#piano-retry').disabled=true;try{const result=await rpc('jj_piano',{p_action:'finish',p_id:row.id,p_data:{events:row.events}});if(!current())return;retry=null;persistPending();showResult(result);await refreshDuo();JJ.dashboard=null;pending();}catch(e){if(current()&&/RUN_EXPIRED|RUN_NOT_FOUND|NOT_YOUR_RUN/.test(e.message||'')){retry=null;persistPending();pending();message('Esta partida venció. Puedes preparar otra canción.','This game expired. You can prepare another song.');return;}if(current()){$('#piano-pending').insertAdjacentHTML('afterbegin','<p>'+bi('No se confirmó. Comprueba la conexión y reintenta.','Unconfirmed. Check connection and retry.')+'</p>');if($('#piano-retry'))$('#piano-retry').disabled=false;}}}
 function showResult(r){const root=$('#piano-result');root.hidden=false;root.innerHTML=`<h2>${bi('Tu interpretación','Your performance')} · ${r.grade}</h2><p>${(r.accuracy/100).toFixed(2)} % · ${r.score} pts</p><p>${bi('Perfectos / Bien / Fallos','Perfect / Good / Misses')}: ${r.perfect} / ${r.good} / ${r.miss} · ${bi('Combo máximo','Best combo')}: ${r.combo}</p><p class="arcade-receipt">+${r.reward||0} JJ${r.improved?' · '+bi('¡Mejor marca!','New best!'):''}</p><p>${r.grade==='D'?bi('Necesitas al menos C (60 %) y terminar para ganar monedas.','Finish with at least C (60%) to earn coins.'):r.reward?bi('Premio guardado en tu saldo JJ.','Reward saved to your JJ wallet.'):bi('Alcanzaste el límite diario de premios. Tu marca se guardó.','Daily reward limit reached. Your best was saved.')}</p>`;root.scrollIntoView({block:'start'});}
 async function finish(){if(!active)return;active=false;cancelAnimationFrame(raf);stopAudio();$('#piano-stage').hidden=true;const r=game.result();if(state.demo){showResult({...r,reward:0});paint();return;}retry={id:run.id,events:game.events};persistPending();pending();await settle();}
 async function prepare(){
  if(active||loading||retry)return false;const song=songs.find(s=>s.id===$('#piano-song').value);if(!song?.audio_path){message('Elige una canción con audio.','Choose a song with audio.');return false;}
  loading=true;buffer=null;paint();message('Preparando tu canción…','Preparing your song…');
  try{await unlockAudio();if(!current())return false;stopJJPlayer();difficulty=Number($('#piano-level').value);abort=new AbortController();const response=await fetch(await mediaUrl(song.audio_path),{signal:abort.signal});if(!response.ok)throw Error('AUDIO');const bytes=await response.arrayBuffer();if(bytes.byteLength>30*1024*1024)throw Error('AUDIO_TOO_LARGE');if(!current())return false;
   const decoded=await ctx.decodeAudioData(bytes);if(!current())return false;duration=Math.floor(Math.min(decoded.duration,Number($('#piano-length').value)));if(duration<20)throw Error('TOO_SHORT');
   if(duo&&duo.host!==owner&&duration!==duo.settings.duration)throw Error('AUDIO_DURATION_MISMATCH');
   let samples=decoded.getChannelData(0),energy=-1;for(let i=0;i<decoded.numberOfChannels;i++){const data=decoded.getChannelData(i);let n=0;for(let j=0;j<Math.min(data.length,duration*decoded.sampleRate);j+=512)n+=data[j]*data[j];if(n>energy){energy=n;samples=data;}}
   notes=PianoEngine.chart(samples,decoded.sampleRate,duration,difficulty);if(notes.length<20)throw Error('TOO_FEW_NOTES');buffer=decoded;
   return true;
  }catch(e){buffer=null;if(current()&&e.name!=='AbortError')message('No se pudo preparar el audio. Usa una canción disponible de al menos 20 segundos.','Could not prepare audio. Use an available song of at least 20 seconds.');return false;}
  finally{loading=false;paint();}
 }
 async function mainAction(){if(active||loading||duoBusy||retry)return;
  if(mode==='solo'){if(await prepare())await start();return;}
  if(!duo)return;
  if(duo.host===owner){if(await prepare()){if(await sendRoom('configure',settings()))message('Tu audio está listo. Espera la confirmación de tu pareja y pulsa Comenzar juntos.','Your audio is ready. Wait for your partner and press Start together.');}return;}
  const revision=duo.revision,betId=duo.bet?.id;
  if(!buffer||preparedRevision!==revision){if(!await prepare())return;preparedRevision=revision;}
  if(duo.revision!==revision||duo.bet?.id!==betId){buffer=null;message('La configuración cambió. Confirma de nuevo.','Settings changed. Confirm again.');return;}
  if(await sendRoom('ready',{revision,bet_id:duo.bet?.id||null,accept_bet:!!duo.bet&&duo.bet.state==='offered'}))message('Listo. Espera a que el anfitrión comience.','Ready. Wait for the host to start.');
 }
 async function start(){if(loading||active||!buffer||duo&&!duo.starts_at)return;loading=true;lock(true);try{await ctx.resume();if(!current())return;const id=crypto.randomUUID();run=duo?{id:duo.run,notes:duo.notes}:state.demo?{id,notes}:await rpc('jj_piano',{p_action:'start',p_id:id,p_data:{song:$('#piano-song').value,difficulty,duration,times:notes.map(n=>n.t)}});if(!current())return;
   game=PianoEngine.game(run.notes,difficulty);$('#piano-glows').replaceChildren();$('#piano-feedback').textContent='';document.querySelectorAll('[data-piano-lane]').forEach(b=>b.classList.remove('piano-hit'));source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);const delay=duo?duo._startLocal-performance.now():3000;if(duo&&delay<300)throw Error('LATE_START');startedAt=ctx.currentTime+delay/1000;wallStart=duo?duo._startLocal:performance.now()+delay;source.start(startedAt,0,duration);active=true;paused=false;lastHUD='';$('#piano-live-song').textContent=songs.find(song=>song.id===$('#piano-song').value)?.title||'';$('#piano-stage').hidden=false;$('#piano-result').hidden=true;$('#piano-pause').innerHTML=bi('Pausar','Pause');$('#piano-pause').hidden=!!duo;document.body.classList.add('jj-rhythm-active');$('#piano-stage').scrollIntoView({block:'start'});raf=requestAnimationFrame(draw);
  }catch{message('No se pudo iniciar. Comprueba la conexión y SQL 34.','Could not start. Check connection and SQL 34.');}finally{loading=false;if(current())paint();}}
 $('#piano-prepare').onclick=mainAction;
 $('#piano-mode-solo').onclick=()=>setMode('solo');$('#piano-mode-duo').onclick=()=>setMode('duo');
 for(const id of ['piano-song','piano-level','piano-length'])$('#'+id).onchange=()=>{if(duo&&duo.host!==owner)return;resetPrepared();paint();};
 const key=e=>{if(!active||paused||e.repeat||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||$('#modal').open)return;const lane={d:0,f:1,j:2,k:3}[e.key.toLowerCase()];if(lane!==undefined){e.preventDefault();press(lane);}};
 const visibility=()=>{if(document.hidden&&active&&!paused&&!duo)pause();};
 document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
 document.querySelectorAll('[data-piano-lane]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();press(Number(b.dataset.pianoLane));};b.onclick=e=>{if(e.detail===0)press(Number(b.dataset.pianoLane));};});
 $('#piano-pause').onclick=pause;$('#piano-stop').onclick=async()=>{if(duo){await leaveRoom();return;}active=false;cancelAnimationFrame(raf);stopAudio();if(run&&!state.demo)rpc('jj_piano',{p_action:'cancel',p_id:run.id}).catch(()=>{});$('#piano-stage').hidden=true;paint();};
 const timer=setInterval(()=>{if(!document.hidden)refreshDuo();},1500);window.addEventListener('bb-art-ready',drawPeople);
 JJ.cleanups.push(()=>{disposed=true;active=false;abort?.abort();clearInterval(timer);cancelAnimationFrame(raf);stopAudio();ctx?.close().catch(()=>{});document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('bb-art-ready',drawPeople);if(duo&&!duo.closed)rpc('jj_piano_lobby',{p_action:'leave',p_code:duo.code}).catch(()=>{});if(run&&!retry&&!state.demo&&!duo)rpc('jj_piano',{p_action:'cancel',p_id:run.id}).catch(()=>{});});
 paint();try{songs=(await allSongs()).filter(s=>s.audio_path);if(!current()||disposed)return;$('#piano-song').innerHTML=songs.length?songs.map(s=>`<option value="${esc(s.id)}" translate="no">${esc(s.title)}</option>`).join(''):`<option value="">${say('No hay canciones con audio','No audio tracks available')}</option>`;if(!songs.length)message('Sube una canción a Nuestra música para empezar.','Upload a song to Our music to get started.');}catch(e){message('No se pudieron cargar tus canciones. Vuelve a abrir Piano JJ.','Songs could not load. Reopen Piano JJ.');}
 pending();paint();let saved;try{saved=localStorage.getItem(duoKey);}catch{}if(saved&&!state.demo){mode='duo';paint();await sendRoom('read',{},saved);}
}
