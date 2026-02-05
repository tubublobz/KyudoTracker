const CACHE_NAME = "kyudo-cache-v16";  // A incrémenter à chaque release

const FILES_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  
  // Database
  './db/db.js',
  './db/seed-data.js',
  
  // Source files
  './src/models/Session.js',
  './src/services/database.js',
  './src/ui/components.js',
  './src/ui/notifications.js',
  './src/utils/serviceWorker.js',
  
  // Icons (ajoute toutes celles que tu utilises)
  './icons/makiwara.png',
  './icons/yosh.png',
  './icons/batsu.png',
  './icons/512_max.png',
  
  // External dependencies
  'https://unpkg.com/dexie@3.2.4/dist/dexie.js'
];

// Installation : mise en cache de tous les fichiers
self.addEventListener("install", (evt) => {
  console.log('[Service Worker] Installation en cours... ' + CACHE_NAME);
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des fichiers (Forced Reload)');
      // On force le téléchargement depuis le réseau pour éviter le cache HTTP du navigateur
      return Promise.all(
        FILES_TO_CACHE.map((url) => {
          return fetch(url, { cache: 'reload' }).then((response) => {
            if (!response.ok) {
              throw new Error(`Erreur chargement ${url}: ${response.statusText}`);
            }
            return cache.put(url, response);
          });
        })
      );
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