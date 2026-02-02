const countMakiwara = document.getElementById('count-makiwara');
const countKinteki = document.getElementById('count-kinteki');
const countHits = document.getElementById('count-hits');
const btnSave = document.getElementById('btn-save');
const historyList = document.getElementById('history');

export function updateCounters(sessionData) {
    countMakiwara.textContent = sessionData.makiwara;
    countKinteki.textContent = sessionData.kinteki.length;
    countHits.textContent = sessionData.kinteki.filter(t => t.result).length;

    // Activer le bouton enregistrer s'il y a au moins un tir
    btnSave.disabled = (sessionData.makiwara === 0 && sessionData.kinteki.length === 0);
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
        let text = `${session.date.toLocaleString('fr-FR')}`;

        if (session.stats.makiwara > 0) {
            text += ` — Makiwara: ${session.stats.makiwara}`;
        }

        if (session.stats.kintekiTotal > 0) {
            text += ` — Kinteki: ${session.stats.kintekiHits}/${session.stats.kintekiTotal}`;
        }

        li.textContent = text;
        historyList.appendChild(li);
    }
}

export function triggerBounce(element) {
    element.classList.remove('bouncy');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('bouncy');
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