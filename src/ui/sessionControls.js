import { showNotification } from './notifications.js';
import * as UI from './components.js';
import DatabaseService from '../services/database.js';

// Pour gérer l'affichage à chaque clic
async function refreshCounters(session) {
    const stats = await session.getStats();
    UI.updateCounters(stats);
}

// Pour gérer les try catch lor de l'ajout de tirs
async function handleShotAction(action, session) {
    try {
        await action();
        await refreshCounters(session);
    } catch (error) {
        console.error('❌ Erreur:', error);
        showNotification('Erreur', 'error');
    }
}

// Pour initier tout le DOM
export async function initSessionControls(session) {
    // Éléments du DOM
    const btnMakiwaraPlus = document.getElementById('btn-makiwara-plus');
    const btnMakiwaraMinus = document.getElementById('btn-makiwara-minus');
    const btnHitsPlus = document.getElementById('btn-hits-plus');
    const btnHitsMinus = document.getElementById('btn-hits-minus');
    const btnMissPlus = document.getElementById('btn-miss-plus');
    const btnMissMinus = document.getElementById('btn-miss-minus');
    const sessionDate = document.getElementById('session-date');

    // 1. Initialiser la date à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    sessionDate.value = today;

    // 2. Créer ou charger la session du jour
    session.sessionId = await DatabaseService.createOrGetSessionByDate(today);

    // 3. Afficher les stats initiales
    await refreshCounters(session);

    // Makiwara
    btnMakiwaraPlus.addEventListener('click', () =>
        handleShotAction(() => session.addMakiwara(), session)
    );
    btnMakiwaraMinus.addEventListener('click', () =>
        handleShotAction(() => session.removeMakiwara(), session)
    );

    // Kinteki
    btnHitsPlus.addEventListener('click', () =>
        handleShotAction(() => session.addKinteki(true), session)
    );
    btnHitsMinus.addEventListener('click', () =>
        handleShotAction(() => session.removeKinteki(true), session)
    );
    btnMissPlus.addEventListener('click', () =>
        handleShotAction(() => session.addKinteki(false), session)
    );
    btnMissMinus.addEventListener('click', () =>
        handleShotAction(() => session.removeKinteki(false), session)
    );
}