import DatabaseService from '../services/database.js';
import { showNotification } from './notifications.js';

// Couleurs suggérées pour le color picker
const SUGGESTED_COLORS = [
    '#e74c3c', // Rouge
    '#3498db', // Bleu
    '#2ecc71', // Vert
    '#f39c12', // Orange
    '#9b59b6', // Violet
];

let editingBowId = null; // null = création, sinon = ID de l'arc en édition

// ==================== NAVIGATION ====================

export async function showBowsScreen() {
    // Masquer app-container, afficher bows-screen
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('date-banner').style.display = 'none';
    document.getElementById('bows-screen').style.display = 'block';
    document.querySelector('.history-section').style.display = 'none';

    // Charger et afficher la liste des arcs
    await renderBowsList();
    await initStatsSection();
}

export function hideBowsScreen() {
    // Masquer bows-screen, afficher app-container
    document.getElementById('bows-screen').style.display = 'none';
    document.getElementById('date-banner').style.display = 'flex';
    document.getElementById('app-container').style.display = 'flex';
    document.querySelector('.history-section').style.display = '';
}

// ==================== LISTE DES ARCS ====================

async function renderBowsList() {
    const bows = await DatabaseService.getActiveBows();
    const bowsListElement = document.getElementById('bows-list');

    // Cas 1 : Aucun arc
    if (bows.length === 0) {
        bowsListElement.innerHTML = '<p class="empty-state">Aucun arc enregistré. Commencez par en ajouter un !</p>';
        return;
    }

    // Cas 2 : Afficher les arcs
    bowsListElement.innerHTML = bows.map(bow => createBowCard(bow)).join('');

    // Attacher les event listeners
    attachBowCardListeners();
}

function createBowCard(bow) {
    return `
        <div class="bow-card">
            <div class="bow-color-indicator" style="background-color: ${bow.color}"></div>
            
            <div class="bow-info">
                <h3>
                    ${bow.name}     
                    ${bow.isDefault ? '<span class="default-badge">⭐ Par défaut</span>' : ''}
                </h3>
                <p class="bow-meta">
                    ${bow.strength ? `${bow.strength} kg` : ''}
                    ${bow.size ? ` • ${bow.size}` : ''}
                    ${bow.isBamboo ? ' • 🎋 Bambou' : ''}
                </p>
                ${bow.notes ? `<p class="bow-notes">${bow.notes}</p>` : ''}
            </div>
            
            <div class="bow-actions">
                <button class="kebab-menu-btn" data-bow-id="${bow.id}">
                    <span class="kebab-dot"></span>
                    <span class="kebab-dot"></span>
                    <span class="kebab-dot"></span>
                </button>
                
                <!-- Menu déroulant (caché par défaut) -->
                <div class="kebab-menu hidden" data-bow-id="${bow.id}">
                    <button class="menu-item btn-edit" data-bow-id="${bow.id}">✏️ Éditer</button>
                    <button class="menu-item btn-delete" data-bow-id="${bow.id}">🗑️ Supprimer</button>
                    ${!bow.isDefault && bow.status !== 'inactive'
            ? `<button class="menu-item btn-default" data-bow-id="${bow.id}">⭐ Définir par défaut</button>`
            : ''
        }
                </div>
            </div>
        </div>
    `;
}

function attachBowCardListeners() {

    // Boutons kebab menu
    document.querySelectorAll('.kebab-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche la fermeture immédiate
            const bowId = parseInt(btn.dataset.bowId);
            toggleKebabMenu(bowId);
        });
    });
    // Boutons "Éditer"
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const bowId = parseInt(btn.dataset.bowId);
            openBowForm(bowId);
        });
    });
    // Boutons "Supprimer"
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const bowId = parseInt(btn.dataset.bowId);
            deleteBow(bowId);
        });
    });
    // Boutons "Définir par défaut"
    document.querySelectorAll('.btn-default').forEach(btn => {
        btn.addEventListener('click', () => {
            const bowId = parseInt(btn.dataset.bowId);
            setAsDefault(bowId);
        });
    });

    // Fermer les menus si on clique ailleurs
    document.addEventListener('click', () => {
        document.querySelectorAll('.kebab-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
    });
}

function toggleKebabMenu(bowId) {
    const menu = document.querySelector(`.kebab-menu[data-bow-id="${bowId}"]`);

    // Si ce menu est déjà ouvert, le fermer
    if (!menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        return;
    }

    // Sinon, fermer tous les autres et ouvrir celui-ci
    document.querySelectorAll('.kebab-menu').forEach(m => {
        m.classList.add('hidden');
    });

    menu.classList.remove('hidden');
}

// ==================== FORMULAIRE ====================

export function openBowForm(bowId = null) {
    editingBowId = bowId;  // Stocker l'ID (null = création)

    const overlay = document.getElementById('bow-form-overlay');
    const title = document.getElementById('bow-form-title');
    const form = document.getElementById('bow-form');

    // Réinitialiser le formulaire
    form.reset();
    console.log("bow Id = ", bowId);
    if (bowId == null) {
        // Mode création
        title.textContent = 'Nouvel arc';
        renderColorSuggestions('#3498db');  // Couleur par défaut
    } else {
        // Mode édition
        title.textContent = 'Modifier l\'arc';
        loadBowData(bowId);  // On codera ça juste après
    }

    // Afficher l'overlay
    overlay.style.display = 'flex';
}

export function closeBowForm() {
    document.getElementById('bow-form-overlay').style.display = 'none';
    editingBowId = null;
}

async function loadBowData(bowId) {
    // 1. Charger l'arc depuis la DB
    const bow = await DatabaseService.getBowById(bowId);

    if (!bow) {
        showNotification('Arc introuvable', 'error');
        closeBowForm();
        return;
    }

    // 2. Remplir les champs du formulaire
    document.getElementById('bow-name').value = bow.name;
    document.getElementById('bow-strength').value = bow.strength || '';
    document.getElementById('bow-size').value = bow.size || '';
    //document.getElementById('bow-bamboo').checked = bow.isBamboo || false;
    document.getElementById('bow-color').value = bow.color;
    document.getElementById('bow-notes').value = bow.notes || '';

    // 3. Mettre à jour l'affichage de la couleur
    document.getElementById('bow-color-value').textContent = bow.color;
    renderColorSuggestions(bow.color);
}

function renderColorSuggestions(selectedColor = '#3498db') {
    const container = document.getElementById('bow-color-suggestions');
    // Générer les pastilles
    container.innerHTML = SUGGESTED_COLORS.map(color => `
        <div class="color-chip ${color === selectedColor ? 'selected' : ''}" 
             data-color="${color}" 
             style="background-color: ${color}">
        </div>
    `).join('');

    // Attacher les event listeners
    container.querySelectorAll('.color-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche l'action par défaut
            e.stopPropagation(); // Empêche la propagation

            const color = e.target.dataset.color;
            selectColor(color);
        });
    });
}

function selectColor(color) {
    // Mettre à jour le color picker natif
    document.getElementById('bow-color').value = color;

    // Mettre à jour l'affichage du code couleur
    document.getElementById('bow-color-value').textContent = color;

    // Mettre à jour la sélection visuelle des pastilles
    document.querySelectorAll('.color-chip').forEach(chip => {
        chip.classList.toggle('selected', chip.dataset.color === color);
    });
}


async function saveBow(formData) {
    try {
        if (editingBowId == null) {
            await DatabaseService.createBow(formData);
            showNotification(`Arc "${formData.name}" créé avec succès`, 'success');
        }
        // Créer l'arc via le service (qui valide automatiquement)
        else {
            await DatabaseService.updateBow(editingBowId, formData);
            showNotification(`Arc "${formData.name}" mis à jour avec succès`, 'success');
        }

        //  Fermer le formulaire et refraîchir la list
        closeBowForm();
        renderBowsList();

    } catch (error) {
        console.error('Erreur sauvegarde arc:', error);
        showNotification(`Erreur lors de la sauvegarde de l'arc`, 'error');
    }
}

// ==================== ACTIONS ====================

async function deleteBow(bowId) {
    // 1. Charger l'arc pour afficher son nom
    const bow = await DatabaseService.getBowById(bowId);

    if (!bow) {
        showNotification('Arc introuvable', 'error');
        return;
    }

    // 2. Demander confirmation
    const confirmed = confirm(`Supprimer l'arc "${bow.name}" ?\n\nCette action est définitive.`);

    if (!confirmed) {
        return; // L'utilisateur a annulé
    }

    // 3. Supprimer l'arc (changer son status à 'deleted')
    await DatabaseService.updateBow(bowId, { status: 'deleted' });

    // 4. Notification + rafraîchir la liste
    showNotification(`Arc "${bow.name}" supprimé`, 'success');
    await renderBowsList();
}

async function toggleBowStatus(bowId) {
    // TODO: Basculer entre active/inactive
}

async function setAsDefault(bowId) {
    try {
        // 1. Appeler le service (qui gère tout)
        await DatabaseService.setDefaultBow(bowId);

        // 2. Notification
        showNotification('Arc défini par défaut', 'success');

        // 3. Rafraîchir la liste
        await renderBowsList();

    } catch (error) {
        console.error('Erreur setAsDefault:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// ==================== INITIALISATION ====================


export function initBowManager(onReturn) {



    // Bouton "+ Ajouter un arc" 
    document.getElementById('add-bow-btn').addEventListener('click', () => openBowForm(null));

    // Formulaire
    document.getElementById('bow-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Créer l'objet formData
        const formData = {
            name: document.getElementById('bow-name').value,
            strength: document.getElementById('bow-strength').value || null,
            size: document.getElementById('bow-size').value || null,
            // isBamboo: document.getElementById('bow-bamboo').checked,
            color: document.getElementById('bow-color').value,
            notes: document.getElementById('bow-notes').value
        };
        saveBow(formData);
    });

    // Color picker natif - déselectionner les pastilles si on choisit une couleur custom
    document.getElementById('bow-color').addEventListener('input', (e) => {
        const customColor = e.target.value;

        // Mettre à jour l'affichage
        document.getElementById('bow-color-value').textContent = customColor;

        // Déselectionner toutes les pastilles
        document.querySelectorAll('.color-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
    });
    document.getElementById('cancel-bow-form').addEventListener('click', closeBowForm);

    document.getElementById('btn-export').addEventListener('click', async () => {
        await DatabaseService.exportData();
        setTimeout(() => showNotification('Export réussi !', 'success'), 500);
    });

    document.getElementById('btn-import').addEventListener('click', () => {
        document.getElementById('import-file-input').click();
    });

    document.getElementById('import-file-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const confirmed = confirm('⚠️ Importer ce fichier va remplacer toutes tes données actuelles. Continuer ?');
        if (!confirmed) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text);
            await DatabaseService.importData(json);
            showNotification('Import réussi !', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Erreur lors de l\'import', 'error');
        } finally {
            // Réinitialiser l'input pour permettre de reimporter le même fichier
            e.target.value = '';
        }
    });
}


// =============== STATS =============
async function refreshStats(days, bowId) {
    const stats = await DatabaseService.getGlobalStats({ days, bowId });
    document.getElementById('stat-sessions').textContent = stats.sessions;
    document.getElementById('stat-percent').textContent = stats.kintekiTotal > 0 ? stats.percent + '%' : '—';
    document.getElementById('stat-kinteki').textContent = stats.kintekiTotal;
    document.getElementById('stat-makiwara').textContent = stats.makiwara;
}

async function initStatsSection() {
    // 1. Peupler le dropdown avec les arcs actifs
    const bows = await DatabaseService.getActiveBows();
    const select = document.getElementById('stats-bow-filter');
    select.innerHTML = '<option value="0">Tous les arcs</option>';

    bows.forEach(bow => {
        const option = document.createElement('option');
        option.value = bow.id;
        option.textContent = bow.name;
        select.appendChild(option);
    });

    // 2. Afficher les stats par défaut (7j, tous les arcs)
    await refreshStats(7, 0);

    // 3. Écouter les pills
    document.getElementById('stats-pills').addEventListener('click', async (e) => {
        const pill = e.target.closest('.stats-pill');
        if (!pill) return;
        document.querySelectorAll('.stats-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const days = parseInt(pill.dataset.period);
        const bowId = parseInt(select.value);
        await refreshStats(days, bowId);
    });

    // 4. Écouter le dropdown
    select.addEventListener('change', async () => {
        const activePill = document.querySelector('.stats-pill.active');
        const days = parseInt(activePill.dataset.period);
        const bowId = parseInt(select.value);
        await refreshStats(days, bowId);
    });
}