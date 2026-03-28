const historyList = document.getElementById('history');

export function displayHistory(sessions, currentSessionId, onSessionSelect) {
    historyList.innerHTML = "";

    if (sessions.length === 0) {
        historyList.innerHTML = "<li>Aucune session enregistrée</li>";
        return;
    }

    // Afficher chaque session
    for (const session of sessions) {
        const li = document.createElement("li");

        // rendre cliquable chaque séance pour naviguer vers elle
        if (session.id === currentSessionId) {
            li.classList.add('session-active');
        } else {
            li.addEventListener('click', () => onSessionSelect(session.id, li.dataset.sessionDate));
            li.style.cursor = 'pointer';
        }

        // Convertir la date
        const d = new Date(session.date);
        li.dataset.sessionDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 

        let text = `${d.toLocaleDateString('fr-FR')}`;

        // Afficher l'arc si présent
        if (session.bowName) {
            text += ` — 🏹 ${session.bowName}`;

            // Ajouter "(+ X autres arcs)" si plusieurs arcs utilisés
            if (session.otherBowsCount > 0) {
                text += ` (+ ${session.otherBowsCount} autre${session.otherBowsCount > 1 ? 's' : ''} arc${session.otherBowsCount > 1 ? 's' : ''})`;
            }
        }
        text += '<br>';  // Saut de ligne avant les stats.
        // Stats
        if (session.stats.makiwara > 0) {
            text += `Makiwara: ${session.stats.makiwara}`;
        }

        if (session.stats.kintekiTotal > 0) {
            text += ` — Kinteki: ${session.stats.kintekiHits}/${session.stats.kintekiTotal}`;
        }

        li.innerHTML = text;
        historyList.appendChild(li);
    }
}

export function showUpdateNotification(worker) {
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

export function updateStatsBar(stats) {
    const container = document.getElementById('round-stats');
    container.innerHTML = `
        <div class="stat">
            <span class="stat-value green">${stats.kintekiHits}</span>
            <span class="stat-label">touchés</span>
        </div>
        <div class="stat">
            <span class="stat-value red">${stats.kintekiTotal - stats.kintekiHits}</span>
            <span class="stat-label">ratés</span>
        </div>
        <div class="stat">
            <span class="stat-value">${stats.percent}%</span>
            <span class="stat-label">réussite</span>
        </div>
        <div class="stat">
            <span class="stat-value teal">${stats.makiwara}</span>
            <span class="stat-label">makiwara</span>
        </div>
    `;
}