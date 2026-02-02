import DatabaseService from './src/services/database.js';
import * as UI from './src/ui/components.js';

// ⭐ Configuration de la base de données IndexedDB
// (Gérée maintenant dans db/db.js)

console.log('✅ Base de données chargée depuis le module');

// Configuration GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : '/KyudoTracker';

// Service Worker (inchangé)
// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${BASE_PATH}/service-worker.js`, { scope: `${BASE_PATH}/` })
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);

        // Vérifier s'il y a déjà un worker en attente
        if (registration.waiting) {
          UI.showUpdateNotification(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          console.log('🔄 Nouvelle version du Service Worker disponible');
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouveau worker installé et en attente
              console.log('⏳ Nouveau Service Worker en attente d\'activation');
              UI.showUpdateNotification(newWorker);
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
      });

    // Recharger la page quand le nouveau SW prend le contrôle
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
// ========================================
// Fonctions avec IndexedDB (V2)
// ========================================

// État de la session en cours
let currentSession = {
  makiwara: 0,
  kinteki: [] // Tableau d'objets { result: boolean }
};

// Éléments du DOM
const btnMakiwara = document.getElementById('btn-makiwara');
const btnYosh = document.getElementById('btn-yosh');
const btnBatsu = document.getElementById('btn-batsu');
const btnSave = document.getElementById('btn-save');


// Gestionnaires d'événements
btnMakiwara.addEventListener('click', () => {
  UI.triggerBounce(btnMakiwara);
  currentSession.makiwara++;
  UI.updateCounters(currentSession);
});

btnYosh.addEventListener('click', () => {
  UI.triggerBounce(btnYosh);
  currentSession.kinteki.push({ result: true });
  UI.updateCounters(currentSession);
});

btnBatsu.addEventListener('click', () => {
  UI.triggerBounce(btnBatsu);
  currentSession.kinteki.push({ result: false });
  UI.updateCounters(currentSession);
});

// Enregistrer la session 
btnSave.addEventListener('click', async () => {
  try {
    // Appel au service
    await DatabaseService.saveSession(currentSession);
    console.log('✅ Session enregistrée');

    // Réinitialiser la session
    currentSession = { makiwara: 0, kinteki: [] };
    UI.updateCounters(currentSession);
    await loadHistory();

  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur lors de l\'enregistrement');
  }
});

// Charger l'historique (V3)
async function loadHistory() {
  const sessions = await DatabaseService.loadHistory();
  UI.displayHistory(sessions);
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Chargement de l\'application...');
  UI.updateCounters(currentSession);
  await loadHistory();
  console.log('✅ Application prête !');
});