// Service Worker for Soul English v15 PWA
const CACHE_NAME = 'soul-english-v15-1.0.0';
const urlsToCache = [
  '/FKT-ENG1-APP/',
  '/FKT-ENG1-APP/index.html',
  '/FKT-ENG1-APP/manifest.json',
  '/FKT-ENG1-APP/icon-192.png',
  '/FKT-ENG1-APP/icon-512.png'
];

// インストール時の処理
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時の処理（オフライン対応）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあればそれを返す、なければネットワークから取得
        return response || fetch(event.request);
      })
  );
});

// アクティベート時の処理（古いキャッシュを削除）
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
