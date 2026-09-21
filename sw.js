'use strict';
const BASE = new URL('./', self.location.href);
// Scope-derived cache names prevent collisions with other projects on the same GitHub host.
const PREFIX = `jj-offline-${BASE.pathname}-`;
const CACHE = `${PREFIX}v1`;
const OFFLINE = new URL('offline.html', BASE).href;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.add(OFFLINE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url = new URL(event.request.url);
  if(event.request.method!=='GET'||event.request.mode!=='navigate'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  event.respondWith(fetch(event.request).catch(async()=>{
    const fallback = await caches.match(OFFLINE,{cacheName:CACHE});
    return fallback || new Response('Sin conexión / Offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
