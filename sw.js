'use strict';
const BASE = new URL('./', self.location.href);
// Scope-derived cache names prevent collisions with other projects on the same GitHub host.
const PREFIX = `jj-offline-${BASE.pathname}-`;
const CACHE = `${PREFIX}v17`;
const OFFLINE = new URL('offline.html', BASE).href;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>fetch(OFFLINE,{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('Offline page unavailable');return cache.put(OFFLINE,response);})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url = new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  // Fetch public application code freshly. Do not intercept Supabase or uploaded media.
  if(/\.(js|css)$/.test(url.pathname)||url.pathname===new URL('release.json',BASE).pathname){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
  if(event.request.mode!=='navigate')return;
  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(async()=>{
    const fallback = await caches.match(OFFLINE,{cacheName:CACHE});
    return fallback || new Response('Sin conexión / Offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
const PUSH_PAGES=new Set(['home','music','memories','messages','playlists','calendar','goals','games','affection','videos']);
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{};}catch{}
 const page=PUSH_PAGES.has(data.page)?data.page:'home';
 event.waitUntil(self.registration.showNotification('J & J · Nuestro universo',{
  body:typeof data.body==='string'?data.body.slice(0,240):'Hay algo nuevo en nuestro universo ♡ / Something new in our universe ♡',
  icon:new URL('assets/icon-180.png',BASE).href,tag:typeof data.tag==='string'?data.tag.slice(0,180):'jj-update',
  data:{page},renotify:false
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const page=PUSH_PAGES.has(event.notification.data?.page)?event.notification.data.page:'home';
 event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){const url=new URL(client.url);if(url.origin===BASE.origin&&url.pathname.startsWith(BASE.pathname)){await client.focus();client.postMessage({type:'jj-push-open',page});return;}}const url=new URL('./',BASE);url.searchParams.set('jj-open',page);await self.clients.openWindow(url.href);})());
});
