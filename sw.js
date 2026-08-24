// sw.js - Service Worker لتطبيق "مواقيت الصلاة - أذان"
// يخزّن الملفات محلياً بصح يخدم بلا إنترنت (PWA).
const CACHE = 'prayer-app-v1';
const ASSETS = [
  './',
  './index.html',
  './prayer.js',
  './cities.js',
  './adhan.js',
  './app.js',
  './manifest.json',
  './icon.png',
  './icon512.png',
  './assets/audio/adhan_aqib_azeez.mp3',
  './LICENSE_AUDIO.md'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  // نتعامل غير مع الأصول المحلية (نفس الأصل) — مانخزّنوش ردود خارجية (مانعا MITM cache poisoning)
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        // نخزّن غير الردود الناجحة من نفس الأصل
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var cp = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
        }
        return resp;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});

// إشعار محلي عند وقت الصلاة (يعمل حتى مغلق التطبيق إذا دعم المتصفح)
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./'));
});
