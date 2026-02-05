export function showNotification(message, type = 'info') {
    // 1. Récupérer le container
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Container de notifications introuvable');
        return;
    }

    // 2. Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // 3. Ajouter les classes
    toast.classList.add('toast-visible');

    // 4. Ajouter au DOM
    container.appendChild(toast);

    // 5. Retirer après 3s
    setTimeout(() => {
        toast.remove();
    }, 3000);

    // 6. Permettre de fermer au clic
    toast.addEventListener('click', () => {
        toast.remove();
    });
}