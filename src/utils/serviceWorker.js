export function initServiceWorker(basePath, onUpdate) {
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Workers non supportés');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${basePath}/service-worker.js`, { scope: `${basePath}/` })
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);

        if (registration.waiting) {
          onUpdate(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          console.log('🔄 Nouvelle version du Service Worker disponible');
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('⏳ Nouveau Service Worker en attente d\'activation');
              onUpdate(newWorker); 
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
      });

    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      window.location.reload();
      refreshing = true;
    });

    window.addEventListener('online', () => {
      console.log('📶 Connexion rétablie');
    });

    window.addEventListener('offline', () => {
      console.log('📵 Mode hors-ligne');
    });
  });
}