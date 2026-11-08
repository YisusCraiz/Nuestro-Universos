export const recordDeck = 'jj-turntable';
const prefix = 'vinyl:';
export const isRecord = item => item.startsWith(prefix);

export function mountRecords(root, current) {
 const box = document.createElement('section');
 box.className = 'yr-records';
 box.hidden = true;
 box.innerHTML = `<label></label><select></select><p role="status"></p><div class="yr-record-player" hidden>
  <img alt="" hidden><div><strong translate="no"></strong><small>J &amp; J · Nuestro Universo</small>
  <input class="yr-record-seek" type="range" min="0" max="1" step="0.1" value="0" disabled>
  <div class="yr-record-controls"><button type="button" data-prev>◀◀</button><button type="button" data-play>▶</button><button type="button" data-next>▶▶</button><button type="button" data-repeat aria-pressed="false">↻</button><input type="range" data-volume min="0" max="0.35" step="0.01" value="0.15"></div>
  <div class="yr-wave" aria-hidden="true"></div>
  <audio preload="none" data-yuki-room-audio playsinline></audio></div></div>`;
 root.querySelector('.yr-stage').before(box);
 const picker = box.querySelector('select');
 const status = box.querySelector('p');
 const player = box.querySelector('.yr-record-player');
 const audio = box.querySelector('audio');
 const cover = player.querySelector('img');
 let tracks = [], owned = [], opened = false, request = 0, equipped = false;
 let loading;
 box.querySelector('label').textContent = say('Elige un vinilo','Choose a record');
 picker.setAttribute('aria-label',say('Tus vinilos','Your records'));
 const seek = box.querySelector('.yr-record-seek');
 const play = box.querySelector('[data-play]');
 const volume = box.querySelector('[data-volume]');
 const repeat = box.querySelector('[data-repeat]');
 const previous = box.querySelector('[data-prev]');
 const next = box.querySelector('[data-next]');
 for(const [element,es,en] of [[seek,'Progreso','Progress'],[play,'Reproducir o pausar','Play or pause'],[volume,'Volumen','Volume'],[repeat,'Repetir','Repeat'],[previous,'Disco anterior','Previous record'],[next,'Siguiente disco','Next record']]){
  element.setAttribute('aria-label',say(es,en));
 }
 const wave = box.querySelector('.yr-wave');
 for(const height of [4,8,13,6,16,9,5,12,17,7,11,15,6,12,8,16,9,5,14,8,11,6,16,9]){
  const bar=document.createElement('i');
  bar.style.height=height+'px';
  wave.append(bar);
 }
 audio.volume = Number(volume.value);
 volume.oninput=()=>{audio.volume=Number(volume.value);};
 repeat.onclick=()=>{audio.loop=!audio.loop;repeat.setAttribute('aria-pressed',String(audio.loop));};
 play.onclick=()=>{
  if(!audio.paused){audio.pause();return;}
  if(audio.hasAttribute('src'))audio.play().catch(()=>{status.textContent=say('No se pudo iniciar la reproducción.','Playback could not start.');});
 };
 seek.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value);};
 audio.onloadedmetadata=()=>{seek.disabled=!Number.isFinite(audio.duration);if(!seek.disabled)seek.max=audio.duration;};
 audio.ontimeupdate=()=>{seek.value=audio.currentTime;};
 const renderPlay=()=>{play.textContent=audio.paused?'▶':'❚❚';wave.classList.toggle('playing',!audio.paused);};
 for(const event of ['play','pause','ended'])audio.addEventListener(event,renderPlay);
 function skip(direction){
  const ids=[...picker.options].slice(1).map(option=>option.value);
  if(!ids.length)return;
  const index=ids.indexOf(picker.value);
  picker.value=ids[(index+direction+ids.length)%ids.length];
  picker.onchange();
 }
 previous.onclick=()=>skip(-1);
 next.onclick=()=>skip(1);
 audio.addEventListener('play', () => { if(typeof stopJJPlayer==='function')stopJJPlayer(); });
 audio.addEventListener('error', () => { if(audio.getAttribute('src'))status.textContent=say('No se pudo reproducir este disco.','Could not play this record.'); });

 function sync(data) {
  owned = data.owned;
  equipped = data.decor?.player === recordDeck;
  box.hidden = !opened || !equipped;
  if(!equipped){
   opened = false;
   stop();
  }
  if(!opened)return;
  const selected = picker.value;
  const choices = tracks.filter(track=>owned.includes(prefix+track.id));
  picker.replaceChildren(new Option(say('Seleccionar disco','Select a record'),''), ...choices.map(track=>new Option(track.title,track.id)));
  picker.value = choices.some(track=>track.id===selected)?selected:'';
  picker.disabled = !choices.length;
  if(!choices.length)status.textContent=say('Tus discos comprados aparecerán aquí.','Your purchased records will appear here.');
 }
 function stop(){
  request++;
  audio.pause();
  if(audio.hasAttribute('src')){audio.removeAttribute('src');audio.load();}
  player.hidden = true;
  seek.disabled = true;
  seek.value = 0;
  renderPlay();
 }
 picker.onchange = async () => {
  const track = tracks.find(item=>item.id===picker.value && owned.includes(prefix+item.id));
  stop();
  if(!track || !equipped)return;
  const token = request;
  status.textContent = '';
  player.hidden = false;
  cover.hidden = true;
  cover.removeAttribute('src');
  player.querySelector('strong').textContent = track.title;
  if(track.image_path)mediaUrl(track.image_path).then(url=>{
   if(current() && request===token && url){cover.src=url;cover.hidden=false;}
  }).catch(()=>{});
  try{
   const url = await mediaUrl(track.audio_path);
   if(!current() || request!==token || !equipped)return;
   if(!url)throw Error('Missing audio');
   audio.src = url;
   audio.volume = Number(volume.value);
   try{await audio.play();}
   catch{if(current() && request===token)status.textContent=say('Pulsa reproducir para escuchar el disco.','Press play to listen.');}
  }catch{if(current() && request===token)status.textContent=say('No se pudo cargar este disco.','Could not load this record.');}
 };
 return {
  sync,
  stop,
  async load(){
   if(!loading)loading=allSongs().then(songs=>{tracks=songs.filter(song=>song.audio_path);});
   try{await loading;}catch{loading=null;throw Error('Records unavailable');}
  },
  catalog(){return tracks.map(track=>({id:prefix+track.id,kind:'record',slot:'vinyl',es:track.title,en:track.title,price:90}));},
  open(data){opened=true;status.textContent='';sync(data);picker.focus();}
 };
}
