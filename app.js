import DatabaseService from './src/services/database.js';
import db from './db/db.js';

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
          showUpdateNotification(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          console.log('🔄 Nouvelle version du Service Worker disponible');
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouveau worker installé et en attente
              console.log('⏳ Nouveau Service Worker en attente d\'activation');
              showUpdateNotification(newWorker);
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

function showUpdateNotification(worker) {
  const notification = document.getElementById('update-notification');
  const updateBtn = document.getElementById('update-btn');
  const closeBtn = document.getElementById('close-notification-btn');

  notification.classList.remove('hidden');

  updateBtn.addEventListener('click', () => {
    worker.postMessage({ type: 'SKIP_WAITING' });
    notification.classList.add('hidden');
  });

  closeBtn.addEventListener('click', () => {
    notification.classList.add('hidden');
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
const countMakiwara = document.getElementById('count-makiwara');
const btnYosh = document.getElementById('btn-yosh');
const btnBatsu = document.getElementById('btn-batsu');
const countKinteki = document.getElementById('count-kinteki');
const countHits = document.getElementById('count-hits');
const btnSave = document.getElementById('btn-save');
const historyList = document.getElementById('history');

// Mise à jour de l'affichage
function updateUI() {
  countMakiwara.textContent = currentSession.makiwara;
  countKinteki.textContent = currentSession.kinteki.length;

  const hits = currentSession.kinteki.filter(t => t.result).length;
  countHits.textContent = hits;

  // Activer le bouton enregistrer s'il y a au moins un tir
  btnSave.disabled = (currentSession.makiwara === 0 && currentSession.kinteki.length === 0);
}

// Helper pour l'animation bouncy
function triggerBounce(element) {
  element.classList.remove('bouncy');
  void element.offsetWidth; // Trigger reflow
  element.classList.add('bouncy');
}

// Gestionnaires d'événements
btnMakiwara.addEventListener('click', () => {
  triggerBounce(btnMakiwara);
  currentSession.makiwara++;
  updateUI();
});

btnYosh.addEventListener('click', () => {
  triggerBounce(btnYosh);
  currentSession.kinteki.push({ result: true });
  updateUI();
});

btnBatsu.addEventListener('click', () => {
  triggerBounce(btnBatsu);
  currentSession.kinteki.push({ result: false });
  updateUI();
});

// Enregistrer la session
btnSave.addEventListener('click', async () => {
  try {
    // Appel au service
    await DatabaseService.saveSession(currentSession);
    console.log('✅ Session enregistrée');
    
    // Réinitialiser la session
    currentSession = { makiwara: 0, kinteki: [] };
    updateUI();
    await loadHistory();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur lors de l\'enregistrement');
  }
});

// Charger l'historique (V2)
async function loadHistory() {
  historyList.innerHTML = "";

  // Récupérer les sessions récentes
  const sessions = await db.session.orderBy('date').reverse().limit(10).toArray();

  if (sessions.length === 0) {
    historyList.innerHTML = "<li>Aucune session enregistrée</li>";
    return;
  }

  for (const s of sessions) {
    // Compter les tirs associés
    const tirs = await db.tir.where('session_id').equals(s.id).toArray();

    const makiCount = tirs.filter(t => t.typeCode === 'maki').length;
    const kintekiTirs = tirs.filter(t => t.typeCode === 'kinteki28');
    const kintekiCount = kintekiTirs.length;
    const hits = kintekiTirs.filter(t => t.result === true).length;

    const li = document.createElement("li");
    let text = `${s.date.toLocaleString('fr-FR')}`;
    if (makiCount > 0) text += ` — Makiwara: ${makiCount}`;
    if (kintekiCount > 0) text += ` — Kinteki: ${hits}/${kintekiCount}`;

    li.textContent = text;
    historyList.appendChild(li);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Chargement de l\'application...');
  updateUI();
  await loadHistory();
  console.log('✅ Application prête !');
});