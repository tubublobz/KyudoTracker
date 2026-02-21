import DatabaseService from "../services/database.js";

class Session {
    constructor(data = {}) {
        this.sessionId = data.sessionId || null;
        this.initialBowId = data.initialBowId || null;
        this.currentBowId = data.currentBowId || data.initialBowId || null;
    };
    /**  -------- 1 - Gestion des arcs ----------- */

    setBow(bowId) {
        this.currentBowId = bowId;
    }
    setInitialBow(bowId) {
        this.initialBowId = bowId;
        this.currentBowId = bowId;
    }

    // Vérifie si la session a démarré sans arc
    hasNoInitialBow() {
        return this.initialBowId === null;
    }

    /**  -------- 2 - Gestion des makiwara ----------- */

    // Ajoute un shoot de makiwara avec l'arc actuel
    async addMakiwara() {
        await DatabaseService.addShot(this.sessionId, {
            bowId: this.currentBowId,
            typeCode: 'maki'
        });
    }
    // Retire le dernier shoot de makiwara
    async removeMakiwara() {
        await DatabaseService.removeLastShot(this.sessionId, 'maki')
    };

    /**  -------- 3 - Gestion des kinteki ----------- */

    async addKinteki(isHit) {
        await DatabaseService.addShot(this.sessionId, {
            bowId : this.currentBowId,
            result : isHit,
            typeCode : 'kinteki28'
        })
    };

    // Retire le dernier tir kinteki du type choisi
    async removeKinteki(isHit) {
        await DatabaseService.removeLastShot(this.sessionId, 'kinteki28', isHit)
    };
    /**  -------- 4 - Stats & reset ----------- */

    async reset() {
        await DatabaseService.deleteAllShots(this.sessionId);
    }

    async getStats(){
        return await DatabaseService.getSessionStats(this.sessionId);
    }
}

export default Session;