import { showNotification } from './notifications.js';
import * as UI from './components.js';
import DatabaseService from '../services/database.js';

let sessionDate;
let onDateChangeCb; // Callback injecté par app.js via initSessionControls


// Pour gérer l'affichage à chaque clic
async function refreshCounters(session) {
    const stats = await session.getStats();
    // UI.updateCounters(stats);
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

async function loadHistory(session) {
    const sessions = await DatabaseService.loadHistory();
    UI.displayHistory(sessions, session.sessionId, (sessionId, date) =>
        loadSessionById(sessionId, date, session)
    );
}

async function loadSessionById(sessionId, date, session) {
    session.sessionId = sessionId;
    sessionDate.value = date;
    await refreshCounters(session);
    await loadHistory(session);
    await onDateChangeCb(session); // ← ajouter cette ligne
}

// Pour initier tout le DOM
export async function initSessionControls(session, onDateChange) {
    // Éléments du DOM
    sessionDate = document.getElementById('session-date');
    onDateChangeCb = onDateChange;

    // 1. Initialiser la date à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    sessionDate.value = today;

    // 2. Créer ou charger la session du jour
    session.sessionId = await DatabaseService.createOrGetSessionByDate(today);

    // 3. Afficher les stats initiales
    await refreshCounters(session);

    // 4. Charger l'historique
    await loadHistory(session);

    // 5. Écouter le changement de date
    sessionDate.addEventListener('change', async (e) => {
        const newDate = e.target.value;
        session.sessionId = await DatabaseService.createOrGetSessionByDate(newDate);
        if (session.initialBowId) {
            await DatabaseService.updateSessionBow(session.sessionId, session.initialBowId);
        }
        await refreshCounters(session);
        await loadHistory(session);
        await onDateChange(session);
    });
}