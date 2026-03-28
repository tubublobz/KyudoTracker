import { showNotification } from './notifications.js';
import * as UI from './components.js';
import DatabaseService from '../services/database.js';

let sessionDate;
let onDateChangeCb; // Callback injecté par app.js via initSessionControls

async function loadHistory(session) {
    const sessions = await DatabaseService.loadHistory();
    UI.displayHistory(sessions, session.sessionId, (sessionId, date) =>
        loadSessionById(sessionId, date, session)
    );
}

async function loadSessionById(sessionId, date, session) {
    session.sessionId = sessionId;
    sessionDate.value = date;
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

    // 4. Charger l'historique
    await loadHistory(session);

    // 5. Écouter le changement de date
    sessionDate.addEventListener('change', async (e) => {
        const newDate = e.target.value;
        session.sessionId = await DatabaseService.createOrGetSessionByDate(newDate);
        if (session.initialBowId) {
            await DatabaseService.updateSessionBow(session.sessionId, session.initialBowId);
        }
        await loadHistory(session);
        await onDateChange(session);
    });
}