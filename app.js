import DatabaseService from './src/services/database.js';
import * as UI from './src/ui/components.js';
import Session from './src/models/Session.js';
import { initSessionControls } from './src/ui/sessionControls.js';
import { initServiceWorker } from './src/utils/serviceWorker.js';
import { initBowSelector, initBowManager, showBowsScreen } from './src/ui/bowManager.js'; 

console.log('✅ Base de données chargée depuis le module');

const BASE_PATH = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : '/KyudoTracker';

initServiceWorker(BASE_PATH, (worker) => {
  UI.showUpdateNotification(worker);
});

let currentSession = new Session();

document.getElementById('nav-bows-btn').addEventListener('click', () => {
  showBowsScreen();
});

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Chargement de l\'application...');
  await DatabaseService.init();
  initBowManager();
  await initSessionControls(currentSession);
  await initBowSelector(currentSession);
});