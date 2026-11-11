'use strict';
// This surface is outside #app and #modal: section changes never destroy playback.
const JJPlayer={queue:[],index:0,request:0,audio:null,owner:null};
const playerDock=document.createElement('section');playerDock.id='jj-player';playerDock.hidden=true;
playerDock.innerHTML=`<div class="player-heading"><span class="player-cover" id="jj-player-cover" aria-hidden="true">♫</span><strong id="jj-player-title" translate="no"></strong><button id="jj-player-stop" class="text-button">${bi('Detener y cerrar','Stop and close')} ×</button></div><div id="jj-player-media"></div><div id="jj-player-queue" class="row"></div><p id="jj-player-status" class="hint" role="status"></p>`;
document.body.append(playerDock);
function stopJJPlayer(){JJPlayer.request++;JJPlayer.audio?.pause();JJPlayer.audio=null;JJPlayer.queue=[];JJPlayer.owner=null;$('#jj-player-media').replaceChildren();playerDock.hidden=true;document.body.classList.remove('has-jj-player');if('mediaSession' in navigator)navigator.mediaSession.metadata=null;}
$('#jj-player-stop').onclick=stopJJPlayer;
function showJJPlayer(title,cover){const artwork=$('#jj-player-cover');artwork.textContent='♫';if(cover){const img=new Image();img.alt='';artwork.replaceChildren(img);mediaUrl(cover).then(url=>{img.src=url;}).catch(()=>{if(img.parentElement===artwork)artwork.textContent='♫';});}playerDock.hidden=false;document.body.classList.add('has-jj-player');JJPlayer.owner=state.profile?.id;$('#jj-player-title').textContent=title;$('#jj-player-status').textContent='';$('#jj-player-queue').innerHTML=JJPlayer.queue.length>1?`${jjButton('jj-player-prev','Anterior','Previous','text-button')}<span>${JJPlayer.index+1} / ${JJPlayer.queue.length}</span>${jjButton('jj-player-next','Siguiente','Next','text-button')}`:'';if($('#jj-player-prev'))$('#jj-player-prev').onclick=()=>playJJTrack(JJPlayer.index-1);if($('#jj-player-next'))$('#jj-player-next').onclick=()=>playJJTrack(JJPlayer.index+1);}
function attachJJAudio(audio,title){
  JJPlayer.audio?.pause();
  const media=$('#jj-player-media');
  media.innerHTML=`<div class="retro-controls">
    <button type="button" class="retro-toggle" aria-label="${say('Reproducir','Play')}">▶</button>
    <input class="retro-progress" type="range" min="0" max="1" step="0.1" value="0" disabled aria-label="${say('Posición de reproducción','Playback position')}">
    <span class="retro-time">0:00</span>
  </div>`;
  media.append(audio);
  JJPlayer.audio=audio;
  audio.controls=false;
  const toggle=$('.retro-toggle',media),progress=$('.retro-progress',media),time=$('.retro-time',media);
  const timeLabel=value=>Number.isFinite(value)?Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0'):'–:––';
  function sync(){
    const seekable=Number.isFinite(audio.duration)&&audio.duration>0;
    progress.disabled=!seekable;
    progress.max=seekable?audio.duration:1;
    progress.value=audio.currentTime;
    time.textContent=timeLabel(audio.currentTime)+' / '+timeLabel(audio.duration);
    toggle.textContent=audio.paused?'▶':'❚❚';
    toggle.setAttribute('aria-label',audio.paused?say('Reproducir','Play'):say('Pausar','Pause'));
  }
  for(const event of ['play','pause','timeupdate','durationchange','ended'])audio.addEventListener(event,sync);
  toggle.onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause();};
  progress.oninput=()=>{audio.currentTime=Number(progress.value);};
  sync();
  if('mediaSession' in navigator){
    navigator.mediaSession.metadata=new MediaMetadata({title,artist:'Julissa & Jesús',album:'Nuestro universo'});
    navigator.mediaSession.setActionHandler('play',()=>audio.play().catch(()=>{}));
    navigator.mediaSession.setActionHandler('pause',()=>audio.pause());
  }
}
// Adopt the actual playing element, preserving its time, buffer and gesture permission.
document.addEventListener('play',e=>{const audio=e.target;if(!(audio instanceof HTMLAudioElement)||audio.hasAttribute('data-yuki-room-audio')||playerDock.contains(audio)||!state.profile)return;const title=audio.getAttribute('aria-label')||audio.closest('article, #modal-body, .memory-player')?.querySelector('h2,h3,p')?.textContent||say('Nuestra música','Our music');JJPlayer.request++;JJPlayer.queue=[];const path=audio.dataset.media;const url=audio.currentSrc||audio.src;const placeholder=document.createElement('button');placeholder.className='text-button';placeholder.innerHTML=bi('♫ Escuchar en el reproductor','♫ Listen in the player');audio.replaceWith(placeholder);placeholder.onclick=()=>{if(JJPlayer.audio===audio){audio.play().catch(()=>{});playerDock.scrollIntoView({block:'nearest'});}else startJJQueue([{source:'local',title,audio_path:path,url}]);};showJJPlayer(title);attachJJAudio(audio,title);audio.play().catch(()=>{});},true);
async function startJJQueue(queue,index=0){JJPlayer.queue=queue;await playJJTrack(index);}
async function playJJTrack(index){if(!state.profile||!JJPlayer.queue.length)return;const queue=JJPlayer.queue;JJPlayer.index=(index+queue.length)%queue.length;const song=queue[JJPlayer.index],request=++JJPlayer.request,owner=state.profile.id;JJPlayer.audio?.pause();JJPlayer.audio=null;$('#jj-player-media').replaceChildren();showJJPlayer(song.title,song.image_path);if(song.source==='spotify'){$('#jj-player-media').innerHTML=spotifyEmbed(song.id);return;}try{const url=song.audio_path?await mediaUrl(song.audio_path):song.url;if(request!==JJPlayer.request||state.profile?.id!==owner)return;const audio=new Audio(url);audio.preload='metadata';attachJJAudio(audio,song.title);audio.onended=()=>{if(JJPlayer.index+1<JJPlayer.queue.length)playJJTrack(JJPlayer.index+1);};audio.onerror=()=>{$('#jj-player-status').textContent=say('No se pudo reproducir. Vuelve a elegir la canción.','Could not play. Select the song again.');};await audio.play().catch(()=>{$('#jj-player-status').textContent=say('Pulsa ▶ para escuchar.','Press ▶ to listen.');});}catch{if(request===JJPlayer.request)$('#jj-player-status').textContent=say('No se pudo cargar. Revisa tu conexión y vuelve a elegir la canción.','Could not load. Check your connection and select the song again.');}}
listenPlaylist=async function(playlist){const owner=state.profile?.id;try{const songs=await allSongs();if(owner!==state.profile?.id)return;const tracks=mixedPlaylistTracks(playlist,songs);modal(`<h2 translate="no">${esc(playlist.title)}</h2><div class="playlist-queue music-queue">${tracks.map((s,i)=>`<button data-persistent-track="${i}" translate="no"><span aria-hidden="true">▶</span> <span>${esc(s.title)}</span><small>${s.source==='spotify'?'Spotify':bi('Nuestra música','Our music')}</small></button>`).join('')||bi('No quedan canciones disponibles.','No songs are available.')}</div>`);document.querySelectorAll('[data-persistent-track]').forEach(b=>b.onclick=()=>{startJJQueue(tracks,+b.dataset.persistentTrack);$('#modal').close();});}catch(e){lifeError(e);}};
const playerLogout=logout;logout=async function(){stopJJPlayer();return playerLogout();};
const playerShell=shell;shell=function(){if(JJPlayer.owner&&JJPlayer.owner!==state.profile?.id)stopJJPlayer();playerShell();};
