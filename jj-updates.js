'use strict';
(() => {
 const loaded=document.querySelector('meta[name="jj-release"]')?.content||'sin versión';
 const bar=document.createElement('aside');bar.className='jj-update-bar';bar.setAttribute('aria-label','Actualización / Update');
 bar.innerHTML='<span class="jj-version"></span><button type="button">Actualizar página / Refresh app</button><span class="jj-update-status" role="status"></span>';
 document.body.append(bar);bar.querySelector('.jj-version').textContent='Versión / Version: '+loaded;
 const status=bar.querySelector('.jj-update-status'),button=bar.querySelector('button');let busy=false,last=0;
 async function check(refresh=false){if(busy)return;busy=true;button.disabled=true;last=Date.now();
 try{const url=new URL('release.json',location.href);url.searchParams.set('check',Date.now());const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('HTTP');const release=await response.json();if(typeof release.version!=='string')throw Error('VERSION');
 const fresh=release.version===loaded;status.textContent=fresh?'Tienes esta versión publicada / You have the published version':'Nueva versión disponible / A new version is available';bar.classList.toggle('jj-update-new',!fresh);
 if(refresh){const form=document.querySelector('#modal[open] form');if(form){status.textContent='Guarda o cierra el formulario antes de actualizar / Save or close your form before refreshing';return;}
 if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.getRegistration('./');if(registration)try{await registration.update();}catch{}}
 const next=new URL(location.href);next.searchParams.set('jj-update',Date.now());location.replace(next.href);
 }
 }catch{status.textContent='No se pudo comprobar. Reintenta con conexión / Could not check. Try again online';}
 finally{busy=false;button.disabled=false;}}
 button.onclick=()=>check(true);addEventListener('online',()=>check());addEventListener('focus',()=>{if(Date.now()-last>30000)check();});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-last>30000)check();});setInterval(()=>{if(!document.hidden)check();},120000);check();
})();
