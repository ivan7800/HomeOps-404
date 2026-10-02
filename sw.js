/* HomeOps 404: cache only this app's public shell, never records or documents. */
const PREFIX = `homeops404:${self.registration.scope}:`;
const CACHE = `${PREFIX}1.1.2`;
const FILES = ['./','./index.html','./styles.css','./app.js','./core.mjs','./backup.mjs','./db.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./assets/home.jpg'];
const PATHS = new Set(FILES.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(FILES.map(async path=>{
      const url=new URL(path,self.registration.scope).href;
      const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));
      if(!response.ok||response.redirected)throw Error('Incomplete app shell');
      await cache.put(url,response);
    }));
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||!['http:','https:'].includes(url.protocol)||url.origin!==self.location.origin||!PATHS.has(url.href))return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request,{cacheName:CACHE});
    if(cached)return cached;
    return fetch(event.request);
  })());
});
