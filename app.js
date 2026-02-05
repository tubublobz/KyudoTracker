import DatabaseService from './src/services/database.js';
import * as UI from './src/ui/components.js';
import Session from './src/models/Session.js';
import { initServiceWorker } from './src/utils/serviceWorker.js';

// ⭐ Configuration de la base de données IndexedDB
// (Gérée maintenant dans db/db.js)

console.log('✅ Base de données chargée depuis le module');

// Configuration GitHub Pages
const BASE_PATH = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : '/KyudoTracker';

// Service Worker
initServiceWorker(BASE_PATH, (worker) => {
  UI.showUpdateNotification(worker);
});

// ========================================
// Fonctions avec IndexedDB (V2)
// ========================================

// État de la session en cours
let currentSession = new Session();

// Éléments du DOM
const btnMakiwara = document.getElementById('btn-makiwara');
const btnYosh = document.getElementById('btn-yosh');
const btnBatsu = document.getElementById('btn-batsu');
const btnSave = document.getElementById('btn-save');


// Gestionnaires d'événements
btnMakiwara.addEventListener('click', () => {
  UI.triggerBounce(btnMakiwara);
  currentSession.addMakiwara();
  UI.updateCounters(currentSession);
});

btnYosh.addEventListener('click', () => {
  UI.triggerBounce(btnYosh);
  currentSession.addKinteki(true);
  UI.updateCounters(currentSession);
});

btnBatsu.addEventListener('click', () => {
  UI.triggerBounce(btnBatsu);
  currentSession.addKinteki(false);
  UI.updateCounters(currentSession);
});

// Enregistrer la session 
btnSave.addEventListener('click', async () => {
  try {
    // Appel au service
    await DatabaseService.saveSession(currentSession.toData());
    console.log('✅ Session enregistrée');

    // Réinitialiser la session
    currentSession.reset();
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