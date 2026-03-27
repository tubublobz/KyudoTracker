import DatabaseService from '../services/database.js';
import { updateStatsBar } from './components.js';

const SHOTS_PER_ROUND = 4;

function renderRound(round, shots = [], isLast = false) {
    const isNeutral = round.isMakiwara === null;
    const isMaki = round.isMakiwara === true;

    let blockClass = 'passage-block';
    if (isMaki) blockClass += ' is-maki';
    if (isLast && isNeutral) blockClass += ' inactive';
    console.log('round', round.order, 'isLast:', isLast, 'isNeutral:', isNeutral, 'blockClass:', blockClass);

    let content = '';

    if (isMaki) {
        const count = shots.length;
        content = `
            <div class="maki-row">
                <span class="maki-label-txt">🌾 Makiwara</span>
                <div class="maki-stepper">
                    <button class="maki-btn" data-round-id="${round.id}" data-action="maki-minus">−</button>
                    <span class="maki-count">${count}</span>
                </div>
                <button class="maki-plus" data-round-id="${round.id}" data-action="maki-plus">+</button>
            </div>`;
    } else {
        const cases = [];
        for (let i = 0; i < 4; i++) {
            const shot = shots.find(s => s.slot === i);
            if (shot && shot.result === true) {
                cases.push(`<div class="shot-btn hit" data-round-id="${round.id}" data-slot="${i}">◉</div>`);
            } else if (shot && shot.result === false) {
                cases.push(`<div class="shot-btn miss" data-round-id="${round.id}" data-slot="${i}">✕</div>`);
            } else {
                cases.push(`<div class="shot-btn void" data-round-id="${round.id}" data-slot="${i}"></div>`);
            }
        }
        content = `<div class="shots">${cases.join('')}</div>`;

        if (isNeutral) {
            content += `<button class="maki-trigger" data-round-id="${round.id}" data-action="maki-trigger">🌾</button>`;
        }
    }

    const hasBow = round.bowId !== null;
    const hasNotes = round.notes !== null && round.notes !== '';
    const bowPill = hasBow
        ? `<div class="meta-pill filled" data-round-id="${round.id}" data-action="set-bow">🏹 Arc</div>`
        : `<div class="meta-pill" data-round-id="${round.id}" data-action="set-bow">Arc</div>`;
    const notesPill = hasNotes
        ? `<div class="meta-pill filled" data-round-id="${round.id}" data-action="set-notes">📝 Notes</div>`
        : `<div class="meta-pill" data-round-id="${round.id}" data-action="set-notes">Notes</div>`;

    return `
        <div class="${blockClass}" data-round-id="${round.id}">
            <div class="passage-top">
                <span class="passage-num">${round.order}</span>
                ${content}
            </div>
            <div class="passage-meta">
                ${bowPill}
                ${notesPill}
            </div>
        </div>`;
}

function renderGrid(container, roundsWithShots) {
    container.innerHTML = roundsWithShots
        .map(({ round, shots }, index) => renderRound(round, shots, index === roundsWithShots.length - 1))
        .join('');
}

export async function initRoundGrid(session) {
    const oldContainer = document.getElementById('rounds-container');
    const container = oldContainer.cloneNode(false);
    oldContainer.replaceWith(container);

    let rounds = await DatabaseService.getRounds(session.sessionId);
    if (rounds.length === 0) {
        const firstRound = await DatabaseService.createRound(session.sessionId);
        rounds = [firstRound];
    }

    const roundsWithShots = await Promise.all(
        rounds.map(async (round) => {
            const shots = await DatabaseService.getShotsByRound(round.id);
            return { round, shots };
        })
    );

    renderGrid(container, roundsWithShots);
    attachGridListeners(container, session);
    const stats = await DatabaseService.getSessionStats(session.sessionId);
    updateStatsBar(stats);
}

function attachGridListeners(container, session) {
    container.addEventListener('click', async (e) => {
        const target = e.target;
        const roundId = parseInt(target.dataset.roundId);
        const action = target.dataset.action;

        if (!roundId) return;

        // 1. Clic sur une case kinteki (shot-btn)
        if (target.classList.contains('shot-btn')) {
            const slot = parseInt(target.dataset.slot);
            const shots = await DatabaseService.getShotsByRound(roundId);
            const existingShot = shots.find(s => s.slot === slot);

            if (target.classList.contains('void')) {
                await DatabaseService.addShot(session.sessionId, {
                    typeCode: 'kinteki28',
                    shareiId: roundId,
                    slot: slot,
                    result: true
                });
                // Ligne neutre → kinteki
                await DatabaseService.updateRound(roundId, { isMakiwara: false });
            } else if (target.classList.contains('hit')) {
                await DatabaseService.updateShot(existingShot.id, { result: false });
            } else if (target.classList.contains('miss')) {
                await DatabaseService.deleteShotById(existingShot.id);
                // Si plus aucun tir → retour neutre
                const remaining = await DatabaseService.getShotsByRound(roundId);
                if (remaining.length === 0) {
                    await DatabaseService.updateRound(roundId, { isMakiwara: null });
                }
            }
        }

        // 2. Clic sur 🌾 (maki-trigger) — ligne neutre → makiwara
        if (action === 'maki-trigger') {
            await DatabaseService.updateRound(roundId, { isMakiwara: true });
            await DatabaseService.addShot(session.sessionId, {
                typeCode: 'maki',
                shareiId: roundId
            });
        }

        // 3. Clic sur + makiwara
        if (action === 'maki-plus') {
            await DatabaseService.addShot(session.sessionId, {
                typeCode: 'maki',
                shareiId: roundId
            });
        }

        // 4. Clic sur − makiwara
        if (action === 'maki-minus') {
            const shots = await DatabaseService.getShotsByRound(roundId);
            if (shots.length > 0) {
                const lastShot = shots[shots.length - 1];
                await DatabaseService.deleteShotById(lastShot.id);
                // Si count revient à 0 → retour neutre
                if (shots.length === 1) {
                    await DatabaseService.updateRound(roundId, { isMakiwara: null });
                }
            }
        }

        // 5. Après toute interaction → ajouter ligne suivante si nécessaire
        const rounds = await DatabaseService.getRounds(session.sessionId);
        const lastRound = rounds[rounds.length - 1];
        if (lastRound.isMakiwara !== null) {
            await DatabaseService.createRound(session.sessionId);
        }

        // 6. Refresh la grille & stats
        const stats = await DatabaseService.getSessionStats(session.sessionId);
        updateStatsBar(stats);
        await initRoundGrid(session);
    });
}