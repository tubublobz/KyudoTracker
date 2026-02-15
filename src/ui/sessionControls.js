import { showNotification } from './notifications.js';
import * as UI from './components.js';
import DatabaseService from '../services/database.js';



export function initSessionControls(session, onSave) {
    // Éléments du DOM
    const btnMakiwaraPlus = document.getElementById('btn-makiwara-plus');
    const btnMakiwaraMinus = document.getElementById('btn-makiwara-minus');
    const btnHitsPlus = document.getElementById('btn-hits-plus');
    const btnHitsMinus = document.getElementById('btn-hits-minus');
    const btnMissPlus = document.getElementById('btn-miss-plus');
    const btnMissMinus = document.getElementById('btn-miss-minus');
    const btnReset = document.getElementById('btn-reset');
    const sessionDate = document.getElementById('session-date');
    const btnSave = document.getElementById('btn-save');

    // Makiwara
    btnMakiwaraPlus.addEventListener('click', () => {
        session.addMakiwara();
        UI.updateCounters(session);
    });

    btnMakiwaraMinus.addEventListener('click', () => {
        session.removeMakiwara();
        UI.updateCounters(session);
    });

    // Kinteki
    btnHitsPlus.addEventListener('click', () => {
        session.addKinteki(true);
        UI.updateCounters(session);
    });

    btnHitsMinus.addEventListener('click', () => {
        session.removeKinteki(true);
        UI.updateCounters(session);
    });

    btnMissPlus.addEventListener('click', () => {
        session.addKinteki(false);
        UI.updateCounters(session);
    });

    btnMissMinus.addEventListener('click', () => {
        session.removeKinteki(false);
        UI.updateCounters(session);
    });

    // Reset
    btnReset.addEventListener('click', () => {
        console.log('Reset cliqué');
        const confirmed = confirm('Remettre la session à zéro ?');
        if (confirmed) {
            session.reset();
            UI.updateCounters(session);
        }
    });

    // Date — initialiser à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    sessionDate.value = today;

    // Enregistrer
    btnSave.addEventListener('click', async () => {
        try {
            const date = new Date(sessionDate.value);
            await DatabaseService.saveSession(session.toData(), date);
            showNotification('Session enregistrée avec succès', 'success');
            session.reset();
            UI.updateCounters(session);
            await onSave();

        } catch (error) {
            console.error('❌ Erreur:', error);
            showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    });
}