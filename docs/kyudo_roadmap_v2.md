# Kyudo Tracker - Roadmap v2

## 📍 État actuel (v0.5)

**Ce qui existe :**
- ✅ Compteur Makiwara simple
- ✅ Tracker Kinteki basique (tirs/hits globaux)
- ✅ Bouton "Enregistrer la session"
- ✅ Historique simple
- ✅ PWA avec IndexedDB

**Problème majeur identifié :**
- ❌ Perte de données à chaque réinstallation de l'app
- ❌ Pas de notion de sharei
- ❌ UX trop basique pour un usage réel

---

## 🎯 Version 1.0 - Fondations solides

### Phase 1.1 - Refonte structure : Introduction des Sharei
**Objectif :** Passer d'un compteur global à un tracking par sharei.

- [ ] **Nouvelle structure de données**
  ```
  Séance (date)
    ├─ Makiwara: nombre (compteur simple)
    └─ Sharei[]
        ├─ id
        ├─ type
        ├─ participants (nombre)
        ├─ position (1-5 ou kaizoe 1-2)
        ├─ distance (28m/60m)
        ├─ cible (type)
        ├─ nb_fleches (2/4/autre)
        ├─ resultats[] (O/X pour chaque flèche)
        ├─ zasha_risha
        ├─ kimono_keikogi
        └─ notes (texte libre)
  ```

- [ ] **Affichage par sharei**
  - Chaque sharei = une ligne "X立ち目"
  - Emplacements de flèches : [+][+][+][+]
  - Compteur global mis à jour automatiquement

- [ ] **Système de tap pour saisie**
  - 1 tap = ⭕ (hit)
  - 2 taps = ❌ (miss)
  - 3 taps = reset (revient à [+])

- [ ] **Bouton "Ajouter un Sharei"**
  - Bouton [+ Cible] en bas de la liste
  - Ajoute une nouvelle ligne vide avec 4 emplacements par défaut

**Critère de succès :** L'utilisateur peut saisir plusieurs sharei dans une séance avec le système de tap.

---

### Phase 1.2 - Détails du Sharei
**Objectif :** Enrichir chaque sharei avec ses caractéristiques.

- [ ] **Formulaire de détails (📝)**
  - Icône 📝 à côté de chaque sharei
  - Ouvre un formulaire modal/overlay

- [ ] **Types de sharei**
  - Liste déroulante avec :
    - Rythme shinsa
    - Rythme tournoi
    - Tir libre
    - Hitotsu mato
    - Mochimato sharei
    - Yawatashi - Itte
    - Yawatashi - Kaizoe
    - Tachi sharei
    - Autre

- [ ] **Champs conditionnels intelligents**
  - **Si "Tir libre"** : pas de champ participants/position
  - **Si "Yawatashi - Itte"** : position fixée à 1, 2 flèches
  - **Si "Yawatashi - Kaizoe"** : position [1][2], 0 flèches
  - **Autres types** : 
    - Nombre de participants [1][2][3][4][5]
    - Position [1-X] (limité selon participants)

- [ ] **Champs standards**
  - Distance : [28m][60m]
  - Type de cible : [Kasumi mato | Petite mato | Mato d'or | Kasumi avec score | Grande mato enteki avec score]
  - Nombre de flèches : [2][4][Autre]
  - Position de tir : [Zasha][Risha]
  - Tenue : [Kimono][Keikogi]
  - Notes : champ texte libre

- [ ] **Valeurs par défaut**
  - Distance : 28m
  - Cible : Kasumi mato
  - Flèches : 2
  - Position tir : Risha
  - Tenue : Keikogi

**Critère de succès :** Chaque sharei peut être caractérisé précisément selon son type.

---

### Phase 1.3 - Compteur Makiwara amélioré
**Objectif :** Pouvoir corriger les erreurs de saisie.

- [ ] **Boutons +/-**
  - Bouton [+] pour incrémenter
  - Bouton [-] pour décrémenter
  - Empêcher de descendre en dessous de 0

- [ ] **Affichage clair**
  - Valeur bien visible au centre
  - Boutons de part et d'autre

**Critère de succès :** L'utilisateur peut corriger une erreur de comptage makiwara.

---

### Phase 1.4 - Navigation entre séances et gestion des dates
**Objectif :** Pouvoir naviguer, modifier des séances passées, et saisir à une date choisie.

- [ ] **Affichage de la date de séance**
  - Date bien visible en haut : format YYYY/MM/DD
  - Session ID visible (ex: "Session #7")

- [ ] **Bouton Edit pour changer la date**
  - Icône ou texte "Edit" à côté de la date
  - Ouvre un sélecteur de date
  - Permet de saisir une séance à une date passée (ou future)

- [ ] **Navigation entre séances**
  - Flèches ← → en bas de l'écran
  - Passer de séance en séance chronologiquement
  - Landing page = séance du jour (en cours ou vide)

- [ ] **Liste/Historique des séances**
  - Accessible depuis le menu ☰
  - Liste chronologique des séances
  - Clic sur une séance → ouvre cette séance en mode édition

- [ ] **Modification de séances passées**
  - Toute séance peut être rouverte et modifiée
  - Ajout/suppression de sharei
  - Modification des compteurs
  - Bouton "Sauvegarder les modifications"

- [ ] **Suppression de séance**
  - Bouton poubelle sur chaque séance (dans l'historique)
  - Confirmation avant suppression définitive

**Critère de succès :** L'utilisateur peut naviguer dans son historique, corriger une séance passée, ou saisir une séance oubliée à n'importe quelle date.

---

### Phase 1.5 - Export/Import (PRIORITÉ une fois la structure stable)
**Objectif :** Ne plus perdre ses données !
- Alternative : mettre à jour la PWA (voir fichier PWAUpdate.md)
 
- [ ] **Export JSON**
  - Bouton "Exporter mes données" dans le menu ☰
  - Télécharge un fichier JSON avec toutes les séances
  - Nom du fichier : `kyudo-tracker-YYYYMMDD.json`
  - Format : structure complète avec sharei

- [ ] **Import JSON**
  - Bouton "Importer des données" dans le menu ☰
  - Remplace toutes les données actuelles (avec confirmation)
  - Message clair : "Ceci écrasera toutes vos données actuelles"
  - Validation du format JSON avant import

- [ ] **UX d'export/import**
  - Messages de confirmation clairs
  - Gestion d'erreurs (fichier corrompu, mauvais format)
  - Feedback : "Données exportées avec succès", "X séances importées"

**Critère de succès :** L'utilisateur peut sauvegarder et restaurer ses données sans perte. Fin du problème de réinstallation !

---

## 🚀 Version 1.5 - Améliorations UX

### Yadokoro (Positionnement des impacts)
- [ ] **Icône 🎯 par sharei**
  - Cliquable, ouvre une interface de cible
  
- [ ] **Cible interactive**
  - Afficher une cible (kasumi mato de base)
  - Permettre de placer chaque flèche (⭕ et ❌)
  - Différencier visuellement hits et misses
  - Enregistrer les positions (x, y)

- [ ] **Visualisation**
  - Afficher les impacts sur la cible
  - Couleurs : vert pour ⭕, rouge pour ❌

### Reset et suppressions
- [ ] **Reset individuel de sharei**
  - Bouton reset sur chaque sharei
  - Efface tous les résultats du sharei
  - Avec confirmation

- [ ] **Suppression de sharei**
  - Bouton poubelle sur chaque sharei
  - Supprime complètement le sharei de la séance
  - Avec confirmation

### Navigation et UX polish
- [ ] **Messages de feedback**
  - "Séance enregistrée !"
  - "Sharei ajouté"
  - Toasts discrets et temporaires

- [ ] **Animations améliorées**
  - Feedback visuel lors de la saisie des tirs
  - Transitions fluides entre séances

---

## 📊 Version 2.0 - Statistiques et analyse

### Statistiques de base
- [ ] **Vue globale**
  - Nombre total de tirs
  - Nombre total de hits
  - Pourcentage de réussite global
  - Nombre de séances
  - Nombre de makiwara total

- [ ] **Statistiques par type de sharei**
  - Taux de réussite en "Rythme shinsa" vs "Tir libre"
  - Nombre de yawatashi effectués (itte / kaizoe 1 / kaizoe 2)

- [ ] **Statistiques par position**
  - Taux de réussite en position 1 (omae)
  - Taux de réussite en position 5 (ochi)
  - Nombre de fois dans chaque position

- [ ] **Filtres temporels**
  - Stats sur les 7 derniers jours
  - Stats sur les 30 derniers jours
  - Stats sur l'année

### Graphiques de progression
- [ ] **Courbe de progression**
  - Évolution du taux de réussite dans le temps
  - Utiliser Recharts

- [ ] **Calendrier d'activité**
  - Vue mensuelle avec jours d'entraînement
  - Heatmap selon nombre de tirs

### Analyse Yadokoro
- [ ] **Cartographie des impacts**
  - Afficher tous les impacts sur une cible
  - Identifier les tendances (tire trop à gauche, etc.)

---

## 🎨 Version 2.5 - Confort et polish

### UX/UI
- [ ] **Mode sombre**
  - Toggle dark/light mode
  - Préférence sauvegardée

- [ ] **Animations améliorées**
  - Feedback visuel lors de la saisie
  - Animations de transition

- [ ] **Messages de feedback**
  - "Séance enregistrée !"
  - "Données exportées avec succès"
  - Toasts discrets

### Fonctionnalités avancées
- [ ] **Objectifs personnels**
  - Définir un objectif (ex: "70% de réussite")
  - Suivi de progression vers l'objectif

- [ ] **Notes par séance**
  - En plus des notes par sharei
  - Note globale sur la séance
  - Ex: "Bonne séance, bon équilibre"

- [ ] **Sauvegarde des préférences**
  - Se souvenir de la distance préférée
  - Se souvenir du type de cible habituel
  - Se souvenir de la tenue par défaut

---

## 🌟 Version 3.0 - Features avancées

### Calendrier complet
- [ ] **Vue calendrier mensuelle**
  - Grille de jours
  - Jours avec séances mis en évidence
  - Clic sur un jour → ouvre la séance

- [ ] **Création de séance à date antérieure**
  - Saisir une séance oubliée
  - Choisir la date dans le calendrier

### Multi-sessions par jour
- [ ] **Plusieurs séances le même jour**
  - Différencier par heure (matin/après-midi/soir)
  - ou par ID unique

### Import/Export avancé
- [ ] **Export CSV**
  - Pour analyse dans Excel/Google Sheets
  - Format tabulaire

- [ ] **Fusion de données**
  - Import qui fusionne avec données existantes
  - Gestion de conflits intelligente

### Partage
- [ ] **Partage de séance**
  - Générer un lien vers une séance spécifique
  - Partage sur réseaux sociaux (optionnel)

---

## 💡 Backlog / Idées futures

- [ ] Timer intégré pour sessions chronométrées
- [ ] Multi-utilisateurs (plusieurs profils dans l'app)
- [ ] Synchronisation cloud (optionnelle)
- [ ] Export PDF de rapport mensuel
- [ ] Comparaison avec d'autres archers (anonymisé)
- [ ] Suivi de matériel (arc, flèches utilisées)
- [ ] Photos/vidéos attachées aux séances
- [ ] Reconnaissance vocale pour saisie mains libres

---

## 🐛 Bugs / Problèmes techniques à résoudre

_(À remplir au fur et à mesure du développement)_

---

## 📝 Notes techniques

### Stack actuel
- HTML/CSS/JavaScript vanilla
- PWA avec Service Worker
- IndexedDB pour le stockage local
- Pas de framework (pour l'instant)

### Principes de développement
- **Approche incrémentale** : déployer des versions fonctionnelles rapidement
- **Mobile-first** : optimiser pour le téléphone avant tout
- **Performance** : l'app doit rester rapide même avec beaucoup de données
- **Simplicité** : privilégier la clarté plutôt que la complexité

### Migration possible
- Si le projet grandit : migration vers React envisageable
- Ajout d'un backend pour sync cloud (à très long terme)