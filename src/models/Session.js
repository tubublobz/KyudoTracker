class Session {
    constructor(data = {}) {
        this.makiwaraShots = data.makiwaraShots || [];
        this.kintekiShots = data.kintekiShots || [];
        this.initialBowId = data.initialBowId || null;
        this.currentBowId = data.currentBowId || data.initialBowId || null;
    }
    /**  -------- 1 - Gestion des arcs ----------- */

    setBow(bowId) {
        this.currentBowId = bowId;
    }

    // Vérifie si la session a démarré sans arc
    hasNoInitialBow() {
        return this.initialBowId === null;
    }
    hasShots() {
        return !this.isEmpty();
    }

    // Applique un arc à tous les tirs existants (après confirmation popup)
    applyBowToAllShots(bowId) {
        this.initialBowId = bowId;
        this.currentBowId = bowId;

        // Met à jour tous les tirs
        this.makiwaraShots.forEach(shot => shot.bowId = bowId);
        this.kintekiShots.forEach(shot => shot.bowId = bowId);
    }

    /**  -------- 2 - Gestion des makiwara ----------- */

    // Ajoute un shoot de makiwara avec l'arc actuel
    addMakiwara() {
        this.makiwaraShots.push({ bowId: this.currentBowId });
    }
    // Retire le dernier shoot de makiwara
    removeMakiwara() {
        if (this.makiwaraShots.length > 0) {
            this.makiwaraShots.pop();  // Retire le dernier
        }
    }

    // Renvoie la liste des tirs de makiwara, filtrée par arc si bowId fourni
    // Si bowId fourni → filtre par arc
    // Si bowId = null/undefined → retourne tout
    getMakiwaraShots(bowId = null) {
        if (bowId === null) {
            return this.makiwaraShots;
        }
        return this.makiwaraShots.filter(shot => shot.bowId === bowId);
    }
    // Le total des tirs de makiwara, filtré par arc si bowId fourni sinon tout.
    getMakiwaraCount(bowId = null) {
        return this.getMakiwaraShots(bowId).length;
    }

    /**  -------- 3 - Gestion des kinteki ----------- */

    addKinteki(isHit) {
        this.kintekiShots.push({
            result: isHit,
            bowId: this.currentBowId
        });
    }

    // Retire le dernier tir kinteki du type choisi
    removeKinteki(isHit) {
        let index = this.kintekiShots.findLastIndex(shot => shot.result === isHit)       
        if (index !== -1 ) {
            this.kintekiShots.splice(index, 1);  // Retire le isHit trouvé
        }
    }

    getKintekiShots(bowId = null) {
        if (bowId === null) {
            return this.kintekiShots;
        }
        return this.kintekiShots.filter(shot => shot.bowId === bowId);
    }

    getKintekiCount(bowId = null) {
        return this.getKintekiShots(bowId).length;
    }
    getHits(bowId = null) {
        return this.getKintekiShots(bowId).filter(t => t.result === true).length;
    }

    isEmpty() {
        return this.makiwaraShots.length === 0 && this.kintekiShots.length === 0;
    }

    reset() {
        this.makiwaraShots = [];
        this.kintekiShots = [];
    }

    toData() {
        return {
            initialBowId: this.initialBowId,
            currentBowId: this.currentBowId,
            makiwaraShots: this.makiwaraShots,
            kintekiShots: this.kintekiShots
        }
    }
}

export default Session;