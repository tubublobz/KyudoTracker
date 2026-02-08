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

export function showBowsScreen() {
    // Masquer app-container, afficher bows-screen
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('bows-screen').style.display = 'block';
    
    // Charger et afficher la liste des arcs
    renderBowsList();  
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
    // TODO: Ouvrir l'overlay
    // TODO: Si bowId fourni, charger les données de l'arc
    // TODO: Sinon, formulaire vide
}

export function closeBowForm() {
    // TODO: Fermer l'overlay, reset le formulaire
}

async function loadBowData(bowId) {
    // TODO: Charger un arc depuis la DB
    // TODO: Remplir les champs du formulaire
}

function renderColorSuggestions(selectedColor = '#3498db') {
    // TODO: Générer les 8 pastilles colorées
    // TODO: Attacher les event listeners
}

function selectColor(color) {
    // TODO: Mettre à jour le color picker + l'affichage hex
}

async function saveBow(formData) {
    // TODO: Créer ou modifier l'arc
    // TODO: Gérer les erreurs
    // TODO: Fermer le formulaire et rafraîchir la liste
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
    // TODO: Attacher tous les event listeners globaux
    // - Bouton "+ Ajouter un arc"
    // - Bouton "← Retour"
    // - Soumission du formulaire
    // - Bouton "Annuler" du formulaire
    // - Color picker change
}