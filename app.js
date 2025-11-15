// ⚠️ IMPORTANT : Changez selon le nom de votre repo GitHub
const BASE_PATH = '/KyudoTracker';

// Enregistrement du Service Worker avec gestion d'erreurs
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Nouvelle version du Service Worker disponible');
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('✅ Nouveau Service Worker activé');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
      });
    
    // Vérifier si on est en ligne ou hors-ligne
    window.addEventListener('online', () => {
      console.log('📶 Connexion rétablie');
    });
    
    window.addEventListener('offline', () => {
      console.log('📵 Mode hors-ligne');
    });
  });
}

const form = document.getElementById("sessionForm");
const historyList = document.getElementById("history");

function loadHistory() {
  const sessions = JSON.parse(localStorage.getItem("kyudoSessions") || "[]");
  historyList.innerHTML = "";
  
  if (sessions.length === 0) {
    historyList.innerHTML = "<li>Aucune session enregistrée</li>";
    return;
  }
  
  sessions.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.date} — Tirs: ${s.shots}, Hits: ${s.hits}`;
    historyList.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const shots = parseInt(document.getElementById("shots").value);
  const hits = parseInt(document.getElementById("hits").value);
  
  // Validation
  if (hits > shots) {
    alert("Le nombre de hits ne peut pas dépasser le nombre de tirs !");
    return;
  }
  
  const sessions = JSON.parse(localStorage.getItem("kyudoSessions") || "[]");
  sessions.push({
    date: new Date().toLocaleString('fr-FR'),
    shots,
    hits
  });
  
  localStorage.setItem("kyudoSessions", JSON.stringify(sessions));
  
  // Réinitialiser le formulaire
  form.reset();
  
  loadHistory();
});

// Charger l'historique au démarrage
loadHistory();