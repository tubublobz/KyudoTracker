import db from '../../db/db.js';

const DatabaseService = {

    async saveSession(sessionData) {
        // sessionData = { makiwara: 5, kinteki: [{result: true}, {result: false}] }

        // ÉTAPE 1 : Créer la session
        const sessionId = await db.session.add({
            date: new Date(),
            lieu: 'Dojo',
            type: 'entrainement'
        });

        // ÉTAPE 2 : Sauvegarder les tirs makiwara
        if (sessionData.makiwara > 0) {
            const makiTirs = Array(sessionData.makiwara).fill({
                session_id: sessionId,
                typeCode: 'maki'
            });
            await db.tir.bulkAdd(makiTirs);
        }

        // ÉTAPE 3 : Sauvegarder les tirs kinteki
        if (sessionData.kinteki.length > 0) {
            const kintekiTirs = sessionData.kinteki.map(t => ({
                session_id: sessionId,
                typeCode: 'kinteki28',
                result: t.result
            }));
            await db.tir.bulkAdd(kintekiTirs);
        }

        return sessionId;
    },

    // Charger l'historique (V2)
    async loadHistory(limit = 10) {
        // Récupérer les sessions récentes
        const sessions = await db.session.orderBy('date').reverse().limit(limit).toArray();

        if (sessions.length === 0) return [];

        return Promise.all(
            sessions.map(async (s) => {
                // Récupérer les tirs
                const tirs = await db.tir.where('session_id').equals(s.id).toArray();

                // Filtrer les kinteki
                const kintekiTirs = tirs.filter(t => t.typeCode === 'kinteki28');

                // Retourner l'objet avec stats
                return {
                    id: s.id,
                    date: s.date,
                    lieu: s.lieu,
                    type: s.type,
                    stats: {
                        makiwara: tirs.filter(t => t.typeCode === 'maki').length,
                        kintekiTotal: kintekiTirs.length,
                        kintekiHits: kintekiTirs.filter(t => t.result === true).length
                    }
                };
            })
        );
    }
};

export default DatabaseService;