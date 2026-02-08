import DatabaseService from '../services/database.js';
import { showNotification } from './notifications.js';

// Couleurs suggérées pour le color picker
const SUGGESTED_COLORS = [
    '#e74c3c', // Rouge
    '#3498db', // Bleu
    '#2ecc71', // Vert
    '#f39c12', // Orange
    '#9b59b6', // Violet
    '#1abc9c', // Turquoise
    '#34495e', // Gris foncé
    '#e67e22', // Orange foncé
];

let editingBowId = null; // null = création, sinon = ID de l'arc en édition

// ==================== NAVIGATION ====================

export async function showBowsScreen() {
    // Masquer app-container, afficher bows-screen
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('bows-screen').style.display = 'block';

    // Charger et afficher la liste des arcs
    await renderBowsList();
}

export function hideBowsScreen() {
    // Masquer bows-screen, afficher app-container
    document.getElementById('bows-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
}

// ==================== LISTE DES ARCS ====================

async function renderBowsList() {
    const bows = await DatabaseService.getAllBows();
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
    // TODO: Retourner le HTML d'une carte d'arc
}

function attachBowCardListeners() {
    // TODO: Attacher les listeners sur les boutons des cartes
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
    // TODO: Charger un arc depuis la DB
    // TODO: Remplir les champs du formulaire
}

function renderColorSuggestions(selectedColor = '#3498db') {
    console.log('🔥 DEBUT renderColorSuggestions');  // ⭐
    console.log('SUGGESTED_COLORS:', SUGGESTED_COLORS);  // ⭐
    console.log('selectedColor:', selectedColor);  // ⭐
    
    const container = document.getElementById('bow-color-suggestions');
    console.log('container:', container);  // ⭐
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
        // Créer l'arc via le service (qui valide automatiquement)
        await DatabaseService.createBow(formData);

        // Afficher notification succès
        showNotification(`Arc "${formData.name}" créé avec succès`, 'success');

        //  Fermer le formulaire
        closeBowForm();

        // Rafraîchir la liste
        renderBowsList();

    } catch (error) {
        console.error('Erreur sauvegarde arc:', error);
        // TODO: Afficher notification erreur
    }
}

// ==================== ACTIONS ====================

async function deleteBow(bowId) {
    // TODO: Confirmation + suppression (status = 'deleted')
}

async function toggleBowStatus(bowId) {
    // TODO: Basculer entre active/inactive
}

async function setAsDefault(bowId) {
    // TODO: Appeler DatabaseService.setDefaultBow()
}

// ==================== INITIALISATION ====================


export function initBowManager() {
    // Bouton "← Retour"
    document.getElementById('back-from-bows-btn').addEventListener('click', hideBowsScreen);

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
            isBamboo: document.getElementById('bow-bamboo').checked,
            color: document.getElementById('bow-color').value,
            notes: document.getElementById('bow-notes').value
        };
        saveBow(formData);
    });

    document.getElementById('cancel-bow-form').addEventListener('click', closeBowForm);

}