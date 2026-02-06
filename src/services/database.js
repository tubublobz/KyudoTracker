import db from '../../db/db.js';

const DatabaseService = {

    // ⭐ Init de la DB
    async init() {
        await initDatabase();
    },

    async saveSession(sessionData) {
        // sessionData = { makiwara: 5, kinteki: [{result: true}, {result: false}] }

        // ÉTAPE 1 : Créer la session
        const sessionId = await db.sessions.add({
            date: new Date(),
            location: 'Dojo',
            type: 'entrainement',
            bowId: sessionData.bowId || null
        });

        // ÉTAPE 2 : Sauvegarder les tirs makiwara
        if (sessionData.makiwara > 0) {
            const makiTirs = Array(sessionData.makiwara).fill({
                sessionId: sessionId,
                typeCode: 'maki'
            });
            await db.shots.bulkAdd(makiTirs);
        }

        // ÉTAPE 3 : Sauvegarder les tirs kinteki
        if (sessionData.kinteki.length > 0) {
            const kintekiTirs = sessionData.kinteki.map(t => ({
                sessionId: sessionId,
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
                    stats: {
                        makiwara: shots.filter(t => t.typeCode === 'maki').length,
                        kintekiTotal: kintekiShots.length,
                        kintekiHits: kintekiShots.filter(t => t.result === true).length
                    }
                };
            })
        );
    }
};

export default DatabaseService;