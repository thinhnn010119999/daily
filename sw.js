const CACHE_NAME = 'cardgame-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{ if(k!==CACHE_NAME) return caches.delete(k); })))));
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(res=>res || fetch(e.request))
  );
});
