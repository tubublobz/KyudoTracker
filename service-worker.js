const CACHE_NAME = "kyudo-cache-v1.1";

// Installation simple
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...', CACHE_NAME);
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message pour forcer l'activation
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Stratégie: Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Réseau OK : on clone et on met en cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Réseau KO : on cherche dans le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Réponse depuis le cache:', event.request.url);
            return cachedResponse;
          }
          
          // Rien en cache : page d'erreur si c'est une navigation
          if (event.request.mode === 'navigate') {
            return new Response('Mode hors-ligne - contenu non disponible', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
              })
            });
          }
        });
      })
  );
});