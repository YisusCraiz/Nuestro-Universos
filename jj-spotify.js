'use strict';
const JJSpotify={pendingKey:'jj-spotify-pkce',tokenPrefix:'jj-spotify-token:',refreshes:new Map()};
function spotifyTrackId(value){if(/^spotify:track:[A-Za-z0-9]{22}$/.test(value))return value.split(':')[2];try{const u=new URL(value);const m=u.pathname.match(/^\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})\/?$/);return u.protocol==='https:'&&u.hostname==='open.spotify.com'&&!u.username&&!u.password&&m?m[1]:null;}catch{return null;}}
function spotifyEmbed(id){return /^[A-Za-z0-9]{22}$/.test(id||'')?`<iframe class="spotify-embed" title="Spotify" src="https://open.spotify.com/embed/track/${id}" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><a href="https://open.spotify.com/track/${id}" target="_blank" rel="noopener noreferrer">${bi('Abrir en Spotify','Open in Spotify')}</a><p class="hint">${bi('Si el reproductor no carga, abre la canción en Spotify.','If the player does not load, open the song in Spotify.')}</p>`:'';}
function spotifyStored(owner=state.profile?.id){try{const t=JSON.parse(sessionStorage.getItem(JJSpotify.tokenPrefix+owner));return t?.clientId===window.JJ_SPOTIFY_CONFIG?.clientId?t:null;}catch{return null;}}
async function spotifyConnect(){if(!ensureLive())return;const clientId=window.JJ_SPOTIFY_CONFIG?.clientId;if(!/^[a-f0-9]{32}$/i.test(clientId||'')){toast(say('Primero configura Spotify siguiendo la guía de esta actualización.','Set up Spotify using this update’s guide first.'));return;}const bytes=crypto.getRandomValues(new Uint8Array(48));const verifier=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));const challenge=btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const redirect=new URL('spotify-callback.html',location.href).href;const nonce=crypto.randomUUID();sessionStorage.setItem(JJSpotify.pendingKey,JSON.stringify({owner:state.profile.id,clientId,verifier,redirect,state:nonce,created:Date.now()}));const u=new URL('https://accounts.spotify.com/authorize');Object.entries({client_id:clientId,response_type:'code',redirect_uri:redirect,scope:'user-read-private',state:nonce,code_challenge_method:'S256',code_challenge:challenge,show_dialog:'true'}).forEach(([k,v])=>u.searchParams.set(k,v));location.assign(u.href);}
async function spotifyToken(owner){const t=spotifyStored(owner);if(!t)throw Error(say('Conecta tu Spotify en Perfiles.','Connect your Spotify in Profiles.'));if(t.expires>Date.now()+30000)return t.access_token;if(JJSpotify.refreshes.has(owner))return JJSpotify.refreshes.get(owner);const pending=(async()=>{const res=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:t.refresh_token,client_id:t.clientId}),signal:AbortSignal.timeout(12000)});if(!res.ok){if(res.status===400||res.status===401)sessionStorage.removeItem(JJSpotify.tokenPrefix+owner);throw Error(say('Vuelve a conectar Spotify desde Perfiles.','Reconnect Spotify in Profiles.'));}const data=await res.json();if(state.profile?.id!==owner||spotifyStored(owner)?.refresh_token!==t.refresh_token)throw Error('Session changed');const updated={...t,...data,expires:Date.now()+data.expires_in*1000};sessionStorage.setItem(JJSpotify.tokenPrefix+owner,JSON.stringify(updated));return updated.access_token;})();JJSpotify.refreshes.set(owner,pending);try{return await pending;}finally{JJSpotify.refreshes.delete(owner);}}
async function spotifyRequest(path){const owner=state.profile?.id;const token=await spotifyToken(owner);const res=await fetch('https://api.spotify.com/v1/'+path,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(12000)});if(state.profile?.id!==owner)throw Error('Session changed');if(res.status===429)throw Error(say('Spotify pide esperar. Intenta de nuevo en unos minutos.','Spotify asks us to wait. Try again in a few minutes.'));if(!res.ok)throw Error(say('Spotify no permitió la consulta. Revisa Premium y que tu cuenta esté autorizada en la aplicación.','Spotify did not allow this request. Check Premium and that your account is allowed in the app.'));return res.json();}
const spotifyProfilePage=profilePage;
profilePage=async function(v){await spotifyProfilePage(v);if(v!==state.version)return;const connected=!!spotifyStored();$('#main').insertAdjacentHTML('beforeend',`<section class="game-panel spotify-profile"><h2>Spotify</h2><p>${bi('Conecta tu propia cuenta para buscar canciones y añadirlas a recuerdos y playlists. Tu conexión se guarda solo en esta pestaña y se elimina al cerrar sesión en nuestro universo.','Connect your own account to find songs and add them to memories and playlists. Your connection stays in this tab and is removed when you sign out of our universe.')}</p><p id="spotify-account">${bi(connected?'Spotify conectado en este perfil':'Sin conectar',connected?'Spotify connected for this profile':'Not connected')}</p>${jjButton('spotify-connect',connected?'Cambiar cuenta de Spotify':'Conectar mi Spotify',connected?'Change Spotify account':'Connect my Spotify')}${connected?jjButton('spotify-disconnect','Desconectar','Disconnect','btn secondary'):''}<p class="hint">${bi('La reproducción depende del reproductor oficial de Spotify y puede requerir iniciar sesión allí también.','Playback depends on Spotify’s official player and may also require signing in there.')}</p></section>`);$('#spotify-connect').onclick=()=>spotifyConnect().catch(()=>toast(say('No se pudo abrir Spotify. Inténtalo de nuevo.','Could not open Spotify. Try again.')));if(connected){$('#spotify-disconnect').onclick=()=>{sessionStorage.removeItem(JJSpotify.tokenPrefix+state.profile.id);navigate('profile');};try{const me=await spotifyRequest('me');if(v===state.version)$('#spotify-account').textContent=say('Conectado: ','Connected: ')+(me.display_name||me.id);}catch(e){if(v===state.version)$('#spotify-account').textContent=e.message;}}};
const spotifyLogout=logout;logout=async function(){const owner=state.profile?.id;sessionStorage.removeItem(JJSpotify.tokenPrefix+owner);sessionStorage.removeItem(JJSpotify.pendingKey);return spotifyLogout();};
$('#modal').addEventListener('close',()=>document.querySelectorAll('#modal .spotify-embed').forEach(el=>el.remove()));
// This picker lives inside the publication/playlist form, so selecting music never discards the draft.
async function mountMusicPicker(root,onSelect,{songs,onConnect,initial='local'}={}){
  root.classList.add('music-picker');
  root.innerHTML=`
    <div class="music-sources" role="group" aria-label="${say('Origen de las canciones','Song source')}">
      <button type="button" data-music-source="local">${bi('♫ Nuestra música','♫ Our music')}</button>
      <button type="button" data-music-source="spotify">Spotify</button>
    </div>
    <section data-music-panel="local">
      <label>${bi('Buscar en Nuestra música','Search Our music')}<input class="local-search" type="search" maxlength="120"></label>
      <div class="local-results"></div>
    </section>
    <section data-music-panel="spotify">
      <div class="spotify-account-action"></div>
      <div class="spotify-search-area">
        <label>${bi('Canción o artista','Song or artist')}<input class="spotify-search" type="search" maxlength="120"></label>
        <button type="button" class="btn secondary spotify-find">${bi('Buscar en Spotify','Search Spotify')}</button>
        <div class="spotify-results"></div>
      </div>
      <label>${bi('Enlace de una canción de Spotify','Spotify song link')}<input class="spotify-link" type="text" inputmode="url" placeholder="https://open.spotify.com/track/…"></label>
      <button type="button" class="text-button spotify-add-link">${bi('+ Añadir enlace','+ Add link')}</button>
      <p class="spotify-error" role="status"></p>
    </section>`;
  const find=selector=>$(selector,root);
  const status=find('.spotify-error');
  function showSource(source){
    for(const panel of root.querySelectorAll('[data-music-panel]'))panel.hidden=panel.dataset.musicPanel!==source;
    for(const button of root.querySelectorAll('[data-music-source]'))button.setAttribute('aria-pressed',String(button.dataset.musicSource===source));
  }
  for(const button of root.querySelectorAll('[data-music-source]'))button.onclick=()=>showSource(button.dataset.musicSource);
  showSource(initial);

  function showConnection(){
    const connected=!!spotifyStored();
    find('.spotify-search-area').hidden=!connected;
    const action=find('.spotify-account-action');
    action.innerHTML=connected?`<p class="hint">${bi('Spotify conectado','Spotify connected')}</p>`:onConnect?
      `<button type="button" class="btn spotify-connect-picker">${bi('Conectar a Spotify','Connect to Spotify')}</button>`:
      `<p class="hint">${bi('Conecta Spotify en Perfiles para buscar canciones.','Connect Spotify in Profiles to search for songs.')}</p>`;
    const connect=find('.spotify-connect-picker');
    if(connect)connect.onclick=async()=>{
      connect.disabled=true;
      try{await onConnect();}
      catch{status.textContent=say('No se pudo abrir Spotify. Inténtalo de nuevo.','Could not open Spotify. Try again.');}
      finally{connect.disabled=false;}
    };
  }
  showConnection();

  const search=find('.spotify-search');
  let request=0;
  find('.spotify-find').onclick=async()=>{
    const q=search.value.trim();
    if(!q)return;
    const run=++request;
    find('.spotify-results').replaceChildren();
    status.textContent=say('Buscando…','Searching…');
    try{
      const data=await spotifyRequest('search?type=track&limit=10&q='+encodeURIComponent(q));
      if(!root.isConnected||run!==request)return;
      const tracks=(data.tracks?.items||[]).filter(t=>t&&/^[A-Za-z0-9]{22}$/.test(t.id));
      find('.spotify-results').innerHTML=tracks.map((t,i)=>`<button type="button" class="music-choice" data-spotify-index="${i}"><span translate="no">${esc(t.name)} · ${esc((t.artists||[]).map(a=>a.name).join(', '))}</span><span aria-hidden="true">＋</span></button>`).join('');
      status.textContent=tracks.length?'':say('Sin resultados. Prueba otro nombre.','No results. Try another name.');
      for(const button of root.querySelectorAll('[data-spotify-index]'))button.onclick=()=>{
        const t=tracks[+button.dataset.spotifyIndex];
        const artist=(t.artists||[]).map(a=>a.name).join(', ');
        onSelect({source:'spotify',id:t.id,title:(artist?t.name+' · '+artist:t.name).slice(0,300)});
      };
    }catch(e){if(root.isConnected&&run===request){showConnection();status.textContent=e.message;}}
  };
  search.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();find('.spotify-find').click();}};
  const link=find('.spotify-link');
  find('.spotify-add-link').onclick=()=>{
    const id=spotifyTrackId(link.value.trim());
    if(!id){status.textContent=say('Pega un enlace de canción de Spotify.','Paste a Spotify track link.');return;}
    onSelect({source:'spotify',id,title:'Spotify · '+id});
    status.textContent='';
    link.value='';
  };
  link.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();find('.spotify-add-link').click();}};

  try{songs??=await allSongs();}
  catch{find('.local-results').textContent=say('No se pudo cargar Nuestra música. Cierra y vuelve a abrir.','Could not load Our music. Close and reopen.');return;}
  if(!root.isConnected)return;
  const local=find('.local-search');
  function renderLocal(){
    const q=local.value.trim().toLocaleLowerCase();
    const rows=songs.filter(s=>s.title.toLocaleLowerCase().includes(q));
    find('.local-results').innerHTML=rows.map((s,i)=>`<button type="button" class="music-choice" data-local-index="${i}"><span translate="no">${esc(s.title)}</span><span aria-hidden="true">＋</span></button>`).join('')||`<p>${bi('No hay canciones que coincidan.','No matching songs.')}</p>`;
    for(const button of root.querySelectorAll('[data-local-index]'))button.onclick=()=>{
      const s=rows[+button.dataset.localIndex];
      onSelect({source:'local',id:s.id,title:s.title});
    };
  }
  local.oninput=renderLocal;
  local.onkeydown=e=>{if(e.key==='Enter')e.preventDefault();};
  renderLocal();
}
