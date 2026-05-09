import DatabaseService from './src/services/database.js';
import * as UI from './src/ui/components.js';
import Session from './src/models/Session.js';
import { initSessionControls } from './src/ui/sessionControls.js';
import { initServiceWorker } from './src/utils/serviceWorker.js';
import { initBowManager, hideBowsScreen, showBowsScreen } from './src/ui/bowManager.js';
import { initRoundGrid } from './src/ui/roundGrid.js';

console.log('✅ Base de données chargée depuis le module');

const BASE_PATH = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : '/KyudoTracker';

initServiceWorker(BASE_PATH, (worker) => {
  UI.showUpdateNotification(worker);
});

let currentSession = new Session();

function initNavToggle() {
  document.querySelector('.nav-toggle').addEventListener('click', () => {
    const isCurrentlyOnSession = document.getElementById('nav-session-btn').classList.contains('active');
    
    document.querySelectorAll('.nav-toggle-btn').forEach(b => b.classList.remove('active'));
    
    if (isCurrentlyOnSession) {
      document.getElementById('nav-bows-btn').classList.add('active');
      showBowsScreen();
    } else {
      document.getElementById('nav-session-btn').classList.add('active');
      hideBowsScreen();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Chargement de l\'application...');
  initNavToggle();
  await DatabaseService.init();
  initBowManager(async () => await initRoundGrid(currentSession));
  await initSessionControls(currentSession, initRoundGrid);
  await initRoundGrid(currentSession);
});