const countMakiwara = document.getElementById('count-makiwara');
const countKinteki = document.getElementById('count-kinteki');
const countHits = document.getElementById('count-hits');
const countMiss = document.getElementById('count-miss');
const countPercent = document.getElementById('count-percent');
const historyList = document.getElementById('history');

export function updateCounters(stats) {
    // stats = { makiwara, kintekiHits, kintekiTotal, percent }
    const miss = stats.kintekiTotal - stats.kintekiHits;

    countMakiwara.textContent = stats.makiwara;
    countKinteki.textContent = stats.kintekiTotal;
    countHits.textContent = stats.kintekiHits;
    countMiss.textContent = miss;
    countPercent.textContent = stats.percent;
}

export function displayHistory(sessions) {
    historyList.innerHTML = "";

    if (sessions.length === 0) {
        historyList.innerHTML = "<li>Aucune session enregistrée</li>";
        return;
    }

    // Afficher chaque session
    for (const session of sessions) {
        const li = document.createElement("li");

        // Convertir la date
        const date = new Date(session.date);
        let text = `${date.toLocaleDateString('fr-FR')}`;

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
