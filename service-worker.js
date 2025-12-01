const CACHE_NAME = "kyudo-cache-v9";

const REPO_NAME = ''; // Nom du repo (vide pour local ou racine)

const FILES_TO_CACHE = [
  `./`,
  `./index.html`,
  `./styles.css`,
  `./app.js`,
  `./db/db.js`,
  `./db/seed-data.js`,
  `./manifest.json`,
  `./service-worker.js`
];

// Installation : mise en cache de tous les fichiers
self.addEventListener("install", (evt) => {
  console.log('[Service Worker] Installation en cours...');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des fichiers');
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => {
      console.log('[Service Worker] Installation réussie');
      // return self.skipWaiting(); // Suppression de l'activation automatique
    })
  );
});

// Écouter le message pour forcer l'activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (evt) => {
  console.log('[Service Worker] Activation en cours... ' + CACHE_NAME);
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Suppression ancien cache:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('[Service Worker] Activation réussie');
      return self.clients.claim(); // Prend le contrôle immédiatement
    })
  );
});

// Stratégie "Cache First, puis Network"
self.addEventListener("fetch", (evt) => {
  // Ignorer les requêtes non-GET (POST, etc.)
  if (evt.request.method !== 'GET') {
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Réponse depuis le cache:', evt.request.url);
        return cachedResponse;
      }

      console.log('[Service Worker] Récupération depuis le réseau:', evt.request.url);
      return fetch(evt.request).catch((error) => {
        console.error('[Service Worker] Erreur réseau:', error);
        // Retourner une page d'erreur basique si nécessaire
        return new Response('Mode hors-ligne - contenu non disponible', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});