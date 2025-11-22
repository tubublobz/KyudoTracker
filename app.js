import db from './db/db.js';

// ⭐ Configuration de la base de données IndexedDB
// (Gérée maintenant dans db/db.js)

console.log('✅ Base de données chargée depuis le module');

// Configuration GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : '/KyudoTracker';

// Service Worker (inchangé)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${BASE_PATH}/service-worker.js`, { scope: `${BASE_PATH}/` })
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);

        registration.addEventListener('updatefound', () => {
          console.log('🔄 Nouvelle version du Service Worker disponible');
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('✅ Nouveau Service Worker activé');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
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
// Fonctions avec IndexedDB
// ========================================

const form = document.getElementById("sessionForm");

// ⭐ MODIFIÉ : Charger l'historique depuis IndexedDB
async function loadHistory() {
  // Récupérer toutes les sessions, triées par date décroissante
  const sessions = await db.sessions.orderBy('date').reverse().toArray();

  const historyList = document.getElementById("history");
  historyList.innerHTML = "";

  if (sessions.length === 0) {
    historyList.innerHTML = "<li>Aucune session enregistrée</li>";
    return;
  }

  sessions.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.date.toLocaleString('fr-FR')} — Tirs: ${s.shots}, Hits: ${s.hits}`;
    historyList.appendChild(li);
  });

  console.log(`📋 ${sessions.length} session(s) affichée(s)`);
}

// ⭐ MODIFIÉ : Enregistrer dans IndexedDB
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const shots = parseInt(document.getElementById("shots").value);
  const hits = parseInt(document.getElementById("hits").value);

  // Validation
  if (hits > shots) {
    alert("Le nombre de hits ne peut pas dépasser le nombre de tirs !");
    return;
  }

  try {
    // Ajouter dans IndexedDB
    await db.sessions.add({
      date: new Date(),
      shots: shots,
      hits: hits
    });

    console.log('✅ Session ajoutée : Tirs=' + shots + ', Hits=' + hits);

    // Réinitialiser le formulaire
    form.reset();

    // Recharger l'historique
    await loadHistory();

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
    alert('Erreur lors de l\'enregistrement de la session');
  }
});

// ⭐ MODIFIÉ : Charger l'historique au démarrage
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Chargement de l\'application...');
  await loadHistory();
  console.log('✅ Application prête !');
});