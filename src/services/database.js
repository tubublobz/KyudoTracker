import db, { initDatabase } from '../../db/db.js';

const DatabaseService = {

    // ⭐ Init de la DB
    async init() {
        await initDatabase();
    },

    // ==================== 1 - GESTION DES SESSIONS ====================


    async saveSession(sessionData) {
        // sessionData = { makiwara: 5, kinteki: [{result: true}, {result: false}] }

        // ÉTAPE 1 : Créer la session
        const sessionId = await db.sessions.add({
            date: new Date(),
            location: 'Dojo',
            type: 'entrainement',
            initialBowId: sessionData.initialBowId || null
        });

        // ÉTAPE 2 : Sauvegarder les tirs makiwara
        if (sessionData.makiwaraShots && sessionData.makiwaraShots.length > 0) {
            const makiTirs = sessionData.makiwaraShots.map(shot => ({
                sessionId: sessionId,
                bowId: shot.bowId,  // ⭐ Ajouté
                typeCode: 'maki'
            }));
            await db.shots.bulkAdd(makiTirs);
        }

        // ÉTAPE 3 : Sauvegarder les tirs kinteki
        if (sessionData.kintekiShots && sessionData.kintekiShots.length > 0) {
            const kintekiTirs = sessionData.kintekiShots.map(t => ({
                sessionId: sessionId,
                bowId: t.bowId,
                typeCode: 'kinteki28',
                result: t.result
            }));
            await db.shots.bulkAdd(kintekiTirs);
        }

        return sessionId;
    },

    // Charger l'historique (V2)
    async loadHistory(limit = 10) {
        // Récupérer les sessions récentes
        const sessions = await db.sessions.orderBy('date').reverse().limit(limit).toArray();

        if (sessions.length === 0) return [];

        return Promise.all(
            sessions.map(async (s) => {
                // Récupérer les tirs
                const shots = await db.shots.where('sessionId').equals(s.id).toArray();

                // Filtrer les kinteki
                const kintekiShots = shots.filter(t => t.typeCode === 'kinteki28');

                // Retourner l'objet avec stats
                return {
                    id: s.id,
                    date: s.date,
                    location: s.location,
                    type: s.type,
                    initialBowId: s.initialBowId,
                    stats: {
                        makiwara: shots.filter(t => t.typeCode === 'maki').length,
                        kintekiTotal: kintekiShots.length,
                        kintekiHits: kintekiShots.filter(t => t.result === true).length
                    }
                };
            })
        );
    },

    // ==================== 2 - GESTION DES ARCS ====================

    async createBow(bowData) {
        const bow = new Bow(bowData);
        const { valid, errors } = bow.validate();

        if (!valid) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        const id = await db.bows.add(bow.toJSON());
        return id;
    },

    async getAllBows() {
        const bows = await db.bows.orderBy('createdAt').reverse().toArray();
        return bows;
    },

    async getActiveBows() {
        const bows = await db.bows
            .where('status')
            .anyOf(['new', 'active'])
            .toArray();
        return bows;
    },

    async getBowById(id) {
        const bow = await db.bows.get(id);
        return bow || null;
    },

    async updateBow(id, updates) {
        const bow = new Bow({ id, ...updates });
        const { valid, errors } = bow.validate();

        if (!valid) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        const count = await db.bows.update(id, bow.toJSON());
        return count;
    },

    async setDefaultBow(id) {
        // Retirer le défaut de tous les autres arcs
        await db.bows.where('isDefault').equals(true).modify({ isDefault: false });

        // Définir le nouvel arc par défaut
        await db.bows.update(id, { isDefault: true });
    },
};

export default DatabaseService;