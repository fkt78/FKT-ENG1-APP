// Service Worker for Soul English v15 PWA
const CACHE_NAME = 'soul-english-v15-1.0.2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// インストール時の処理
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // アイコンは存在しない可能性があるので、エラーを無視
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Some files failed to cache:', error);
          // アイコン以外はキャッシュできた場合でも続行
          return Promise.resolve();
        });
      })
  );
  // すぐにアクティベート
  self.skipWaiting();
});

// フェッチ時の処理（オフライン対応）
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 外部CDNリソースはキャッシュしない（Tailwind CSS、Google Fontsなど）
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !url.href.includes('cdn.tailwindcss.com') &&
      !url.href.includes('fonts.googleapis.com') &&
      !url.href.includes('cdnjs.cloudflare.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }
        
        // ネットワークから取得してキャッシュに保存
        return fetch(event.request)
          .then((response) => {
            // レスポンスが有効な場合のみキャッシュ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // オフライン時はキャッシュから返す
            return caches.match(event.request);
          });
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // すべてのクライアントを制御下に置く
      return self.clients.claim();
    })
  );
});
