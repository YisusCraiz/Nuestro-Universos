'use strict';

const $ = id => document.getElementById(id);
const config = window.UNIVERSE_CONFIG;
const params = new URLSearchParams(location.search);
const host = params.get('host') === '1';
const group = params.get('group') === '1';
const rpcName = group ? 'jj_piano_guest_group' : 'jj_tobey_duel';
const say = (es, en) => host ? es : en;
document.documentElement.lang = host ? 'es' : 'en';
if(group) {
  $('duel-title').textContent = say('Concierto para cuatro','Four-player concert');
  $('duel-cast').replaceChildren(...['jesus','julisa','sani','tobey'].map((id,index)=>{
    const image = document.createElement('img');
    image.src = 'assets/piano-band/'+id+'.webp';
    image.alt = ['Yisus','Julie','Sani','Tobey'][index];
    return image;
  }));
}
$('exit').textContent = say('Cerrar duelo','Leave duel');
$('back').hidden = !host;
const client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey,
  host ? {} : {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'piano-tobey-guest'}});
const secret = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2,'0')).join('');
const status = message => { $('status').textContent = message; };
const keys = [...document.querySelectorAll('[data-lane]')];
const ctx2d = $('lanes').getContext('2d');
const theme = ['#c5a6ff','#9deaf1','#ffa2c8','#ffd793'];
const validToken = /^[0-9a-f]{64}$/;
const validRoom = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let roomId, inviteToken, guestKey, audio, buffer, source, currentRoom, game, startAt;
let ended = false, frame = 0, polling = 0, pollBusy = false, active = false, finished = false, pendingEvents;

function readSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}
function renderEnd(message) {
  ended = true;
  clearInterval(polling);
  cancelAnimationFrame(frame);
  if(source) { try { source.stop(); } catch {} }
  for(const id of ['claim','invitation','group-invites','group-status','action','track','exit']) $(id).hidden = true;
  status(message);
}
async function request(action, payload = {}, credential = guestKey) {
  const sent = performance.now();
  const {data,error} = await client.rpc(rpcName,{
    p_action:action,p_room:roomId??null,p_secret:credential??null,p_data:payload
  });
  if(error) throw error;
  return {...data,rtt:performance.now()-sent};
}
async function audioReady(url) {
  audio ??= new AudioContext();
  await audio.resume();
  if(buffer) return;
  const response = await fetch(url,{referrerPolicy:'no-referrer',cache:'no-store'});
  if(!response.ok) throw Error('audio');
  buffer = await audio.decodeAudioData(await response.arrayBuffer());
}
function errorText() {
  return say('No se pudo completar la acción. Intenta de nuevo.','Could not complete that action. Try again.');
}
function action(text, handler) {
  const button = $('action');
  button.hidden = false;
  button.textContent = text;
  button.onclick = async () => {
    button.disabled = true;
    try { await handler(); } catch { if(!ended) status(errorText()); }
    finally { button.disabled = false; }
  };
}
function update(room) {
  if(ended) return;
  if(room.denied) {
    renderEnd(say('La invitación se cerró o caducó.','This invitation is closed or expired.'));
    return;
  }
  currentRoom = room;
  if(group) {
    updateGroup(room);
    return;
  }
  if(room.starts_at) {
    $('action').hidden = true;
    $('invitation').hidden = true;
    if(!active && !finished && buffer) start(room);
    if(room.host_score !== null && room.guest_score !== null) {
      const winner = room.host_score === room.guest_score ? null : room.host_score > room.guest_score ? 'Yisus' : 'Tobey';
      $('result-title').textContent = winner ? say('Gana '+winner,winner+' wins') : say('Empate','Tie');
      $('result-scores').textContent = 'Yisus '+room.host_score+' · Tobey '+room.guest_score;
      $('results').hidden = false;
      status(room.title);
    }
    return;
  }
  if(host) {
    status(room.ready ? 'Tobey está listo.' : room.guest_joined ? 'Tobey se conectó. Esperando que prepare la canción.' : 'Comparte el enlace y el PIN con Tobey.');
    $('action').hidden = !room.ready;
  }
}
function updateGroup(room) {
  const seats = room.seats;
  $('group-status').hidden = false;
  $('group-status').textContent = seats.map(seat => seat.name+' · '+(
    seat.left ? say('salió','left') : seat.score !== null ? seat.score+' pts' :
    seat.ready ? say('listo','ready') : seat.joined ? say('en sala','joined') : say('por entrar','waiting')
  )).join('  |  ');
  if(!room.starts_at) {
    if(host) {
      const ready = seats.every(seat=>seat.ready&&!seat.left);
      $('action').hidden = !ready;
      status(seats.some(seat=>seat.left)
        ? 'Alguien salió antes del inicio. Cierra esta sala y crea enlaces nuevos.'
        : ready ? 'Los cuatro están listos.' : 'Comparte cada enlace y su PIN con la persona correspondiente.');
    }
    return;
  }
  $('action').hidden = true;
  $('group-invites').hidden = true;
  if(!active && !finished && buffer) start(room);
  if(room.host_score !== null && seats.every(seat=>seat.score!==null||seat.left)) {
    const scores = [{name:'Yisus',score:room.host_score},...seats.filter(seat=>seat.score!==null)];
    const best = Math.max(...scores.map(player=>player.score));
    const winners = scores.filter(player=>player.score===best).map(player=>player.name);
    $('result-title').textContent = winners.length===1 ? say('Gana '+winners[0],winners[0]+' wins') : say('Empate','Tie');
    $('result-scores').textContent = scores.map(player=>player.name+' '+player.score).join(' · ');
    $('results').hidden = false;
    status(room.title);
  }
}
function copyInvite(input) {
  return navigator.clipboard?.writeText(input.value).catch(()=>input.select()) ?? input.select();
}
function showGroupInvites(invites) {
  $('group-invites').hidden = false;
  for(const [name,{token,pin}] of Object.entries(invites)) {
    const row = document.createElement('section');
    const title = document.createElement('strong');
    title.textContent = name+' · PIN '+pin;
    const controls = document.createElement('div');
    controls.className = 'copy-row';
    const field = document.createElement('input');
    field.readOnly = true;
    field.setAttribute('aria-label','Enlace para '+name);
    const link = new URL(location.pathname,location.origin);
    link.searchParams.set('group','1');
    link.hash = roomId+'.'+token;
    field.value = link.href;
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'Copiar';
    copy.onclick = () => copyInvite(field);
    controls.append(field,copy);
    row.append(title,controls);
    $('group-invites').append(row);
  }
}
function loop() {
  polling = setInterval(async () => {
    if(pollBusy || ended) return;
    pollBusy = true;
    try {
      if(pendingEvents !== undefined) {
        const room = await request('finish',{events:pendingEvents});
        pendingEvents = undefined;
        update(room);
      } else update(await request('read'));
    } catch { if(!ended && !active) status(errorText()); }
    finally { pollBusy = false; }
  },1400);
}
function start(room) {
  const delay = Date.parse(room.starts_at)-Date.parse(room.server_now)-room.rtt/2;
  if(delay < 300) {
    finished = true;
    status(say('El inicio ya pasó. Cierra el duelo y crea otro.','The round already started. Ask for a fresh invitation.'));
    return;
  }
  game = PianoEngine.game(room.chart,room.difficulty);
  startAt = audio.currentTime + delay/1000;
  source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.start(startAt,0,room.duration);
  status(room.title);
  active = true;
  $('track').hidden = false;
  $('track').scrollIntoView({block:'nearest'});
  frame = requestAnimationFrame(draw);
}
function draw() {
  if(!active || ended) return;
  const now = (audio.currentTime-startAt)*1000;
  game.tick(now);
  ctx2d.fillStyle = '#171730';
  ctx2d.fillRect(0,0,640,500);
  for(let lane=0;lane<4;lane++) {
    ctx2d.fillStyle = lane%2 ? '#2b2248' : '#211b37';
    ctx2d.fillRect(lane*160+1,0,158,500);
    ctx2d.fillStyle = theme[lane];
    ctx2d.fillRect(lane*160,449,160,3);
  }
  for(let index=0;index<game.notes.length;index++) {
    const note = game.notes[index], delta = note.t-now;
    if(game.states[index] || delta>1700 || delta< -180) continue;
    ctx2d.fillStyle = theme[note.l];
    ctx2d.fillRect(note.l*160+12,443-delta*450/1700,136,14);
  }
  if(now<0) {
    ctx2d.fillStyle = '#fff';
    ctx2d.font = 'bold 54px sans-serif';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(Math.ceil(-now/1000),320,230);
  }
  const points = game.result().score;
  $('score').textContent = points+' pts · '+game.combo+' combo';
  if(now>=currentRoom.duration*1000) {
    finished = true;
    active = false;
    pendingEvents = game.events;
    status(say('Partida terminada. Esperando los resultados.','Round complete. Waiting for results.'));
    return;
  }
  frame = requestAnimationFrame(draw);
}
function hit(lane) {
  if(!active) return;
  const t = (audio.currentTime-startAt)*1000;
  if(t < 0 || t > currentRoom.duration*1000 || game.events.length>=1500) return;
  const result = game.press(t,lane);
  if(result === 'perfect' || result === 'good') {
    keys[lane].dataset.hit = '';
    setTimeout(() => delete keys[lane].dataset.hit,100);
  }
}
for(const key of keys) {
  key.onpointerdown = event => { if(event.button===0){ event.preventDefault();hit(Number(key.dataset.lane)); } };
  key.onclick = event => { if(event.detail===0) hit(Number(key.dataset.lane)); };
}
document.addEventListener('keydown', event => {
  const lane = 'dfjk'.indexOf(event.key.toLowerCase());
  if(active && !event.repeat && event.key.length===1 && lane>=0) { event.preventDefault();hit(lane); }
});
$('exit').onclick = async () => {
  try {
    await request('leave');
    renderEnd(say('Duelo cerrado.','You left. Your invitation is now closed.'));
  } catch {
    closeOnExit();
    renderEnd(say('Saliste del duelo.','You left the duel.'));
  }
};
function closeOnExit() {
  if(ended || host || !roomId || !guestKey) return;
  fetch(config.supabaseUrl+'/rest/v1/rpc/'+rpcName,{
    method:'POST',keepalive:true,
    headers:{apikey:config.supabasePublishableKey,'Content-Type':'application/json'},
    body:JSON.stringify({p_action:'leave',p_room:roomId,p_secret:guestKey})
  }).catch(()=>{});
}
window.addEventListener('pagehide',closeOnExit);
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText($('invite-url').value);status('Enlace copiado. Envía el PIN por separado.'); }
  catch { $('invite-url').select(); }
};

if(host) {
  const outfit = readSession('jj-tobey-selected-track');
  if(!outfit?.path) renderEnd('Elige la canción en VS → Piano JJ antes de crear el duelo.');
  else action(group?'Crear invitaciones':'Crear invitación para Tobey', async () => {
    audio ??= new AudioContext();
    await audio.resume();
    const {data,error} = await client.storage.from('universe').createSignedUrl(outfit.path,1200);
    if(error) throw error;
    await audioReady(data.signedUrl);
    const duration = Math.min(60,Math.floor(buffer.duration));
    if(duration < 20) { status('Elige una canción de al menos 20 segundos.');return; }
    const chart = PianoEngine.chart(buffer.getChannelData(0),buffer.sampleRate,duration,outfit.difficulty);
    if(chart.length < 20) { status('No se pudieron generar suficientes notas para esa canción.');return; }
    const token = secret();
    const pin = String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0');
    const invites = group ? Object.fromEntries(['Julie','Sani','Tobey'].map(name=>[name,{token:secret(),pin:String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0')}])) : undefined;
    const created = await request('create',{pin,url:data.signedUrl,title:outfit.title.slice(0,160),duration,difficulty:outfit.difficulty,chart,invites},token);
    roomId = created.id;
    const link = new URL(location.pathname,location.origin);
    link.hash = roomId+'.'+token;
    $('invite-url').value = link.href;
    $('invite-pin').textContent = pin;
    if(group) showGroupInvites(invites);
    else $('invitation').hidden = false;
    $('exit').hidden = false;
    action(group?'Comenzar concierto':'Comenzar duelo',async()=>{await audio.resume();update(await request('start'));});
    $('action').hidden = true;
    update(await request('read'));
    loop();
  });
} else {
  [roomId,inviteToken] = location.hash.slice(1).split('.');
  if(!validRoom.test(roomId??'') || !validToken.test(inviteToken??'')) renderEnd('Ask Yisus for a Piano JJ invitation.');
  else {
    $('claim').hidden = false;
    status('Enter the PIN Yisus shared with you.');
    $('claim').onsubmit = async event => {
      event.preventDefault();
      const button = $('claim').querySelector('button');
      button.disabled = true;
      const proposedKey = secret();
      try {
        audio ??= new AudioContext();
        await audio.resume();
        const room = await request('claim',{pin:$('pin').value,browser_key:proposedKey},inviteToken);
        if(room.denied) { status('That PIN or invitation could not be used.');return; }
        guestKey = proposedKey;
        history.replaceState(null,'',location.pathname+location.search);
        $('claim').hidden = true;
        $('exit').hidden = false;
        status(room.title);
        loop();
        action('Get ready', async () => {
          await audioReady(room.url);
          update(await request('ready'));
          $('action').hidden = true;
          if(!ended) status('Ready. Waiting for Yisus to start.');
        });
      } catch { status(errorText()); }
      finally { button.disabled = false; }
    };
  }
}
