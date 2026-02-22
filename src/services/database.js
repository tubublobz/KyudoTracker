import db, { initDatabase } from '../../db/db.js';
import Bow from '../models/Bow.js';

const DatabaseService = {

    // ⭐ Init de la DB
    async init() {
        await initDatabase();
    },

    // ==================== 1 - GESTION DES SESSIONS ====================


    async saveSession(sessionData, date) {
        // sessionData = { makiwara: 5, kinteki: [{result: true}, {result: false}] }
        const existingSession = await this.getSessionByDate(date);
        if (existingSession) {
            // Nouveau code
        }
        else {
            // ÉTAPE 1 : Créer la session
            const sessionId = await db.sessions.add({
                date: date || new Date(),
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
        }
    },

    // Charger l'historique (V3 avec les arcs utilisés)
    async loadHistory(limit = 10) {
        const sessions = await db.sessions.orderBy('date').reverse().limit(limit).toArray();

        if (sessions.length === 0) return [];

        return Promise.all(
            sessions.map(async (s) => {
                    // Récupérer les tirs
                    const shots = await db.shots.where('sessionId').equals(s.id).toArray();

                    // Filtrer par type de tir
                    const makiwaraShots = shots.filter(t => t.typeCode === 'maki');
                    const kintekiShots = shots.filter(t => t.typeCode === 'kinteki28');
                    const kintekiHits = kintekiShots.filter(t => t.result === true)

                    // Récupérer le nom de l'arc initial
                    let bowName = null;
                    if (s.initialBowId) {
                        const bow = await db.bows.get(s.initialBowId);
                        bowName = bow ? bow.name : null;
                    }

                    // Compter les arcs différents utilisés (autres que l'initial)
                    const uniqueBowIds = [...new Set(shots.map(shot => shot.bowId))];
                    const otherBowsCount = uniqueBowIds.filter(id => id !== s.initialBowId && id !== null).length;
                    return {
                        id: s.id,
                        date: s.date,
                        location: s.location,
                        type: s.type,
                        initialBowId: s.initialBowId,
                        bowName: bowName,
                        otherBowsCount: otherBowsCount,
                        stats: {
                            makiwara: makiwaraShots.length,
                            kintekiTotal: kintekiShots.length,
                            kintekiHits: kintekiHits.length
                        }
                    };
                })
        );
    },

    async getSessionByDate(date) {
        // Normaliser la date (00:00:00 du jour)
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // Chercher la session
        const session = await db.sessions
            .where('date')
            .equals(targetDate)
            .first();

        if (!session) {
            return null;  // Pas de session ce jour-là
        }

        // Charger les tirs de cette session
        const shots = await db.shots
            .where('sessionId')
            .equals(session.id)
            .toArray();

        // Retourner session + tirs
        return {
            sessionId: session.id,
            date: session.date,
            initialBowId: session.initialBowId,
            shots: shots
        };
    },
    async createOrGetSessionByDate(date) {
        // 1. Chercher si une session existe déjà
        const existing = await this.getSessionByDate(date);

        // 2. Si elle existe → on retourne juste son id
        if (existing) {
            return existing.sessionId;
        }

        // 3. Sinon → on crée une session vide
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const sessionId = await db.sessions.add({
            date: targetDate,
            initialBowId: null
        });

        return sessionId;
    },

    async getSessionStats(sessionId) {
        const shots = await db.shots
            .where('sessionId')
            .equals(sessionId)
            .toArray();

        const makiwara = shots.filter(s => s.typeCode == 'maki').length;
        const kintekiShots = shots.filter(s => s.typeCode == 'kinteki28');
        const kintekiHits = kintekiShots.filter(s => s.result == true).length;
        const kintekiTotal = kintekiShots.length;
        const percent = kintekiTotal > 0 ? Math.round((kintekiHits / kintekiTotal) * 100) : 0;

        return { makiwara, kintekiHits, kintekiTotal, percent };
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
        const bows = await db.bows.orderBy('id').toArray();
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
        // 1. Charger l'arc existant
        const existingBow = await db.bows.get(id);
        if (!existingBow) {
            throw new Error('Arc introuvable');
        }

        // 2. Fusionner avec les updates (la magie ✨)
        const bow = new Bow({ ...existingBow, ...updates });

        // 3. Valider
        const { valid, errors } = bow.validate();
        if (!valid) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        // 4. Sauvegarder
        const count = await db.bows.update(id, bow.toJSON());
        return count;
    },

    async setDefaultBow(id) {
        // 1. Récupérer TOUS les arcs
        const allBows = await db.bows.toArray();

        // 2. Retirer isDefault de tous les arcs qui l'ont
        for (const bow of allBows) {
            if (bow.isDefault === true) {
                await db.bows.update(bow.id, { isDefault: false });
            }
        }

        // 3. Définir le nouvel arc par défaut
        await db.bows.update(id, { isDefault: true });
    },

    async updateSessionBow(sessionId, bowId) {
        await db.sessions.update(sessionId, { initialBowId: bowId });
    },

    // =================== 3 - GESTION DES TIRS ================
    async addShot(sessionId, shotData) {
        const shotId = await db.shots.add({
            sessionId: sessionId,
            bowId: shotData.bowId,
            typeCode: shotData.typeCode,
            result: shotData.result // undefined si pas fourni, c'est OK
        });
        return shotId;
    },
    async removeLastShot(sessionId, typeCode, result) {
        const shots = await db.shots
            .where('sessionId')
            .equals(sessionId)
            .and(shot => (shot.typeCode == typeCode && shot.result == result))  // filtrer par typeCode
            .toArray();

        if (shots.length === 0) return null;

        const lastShot = shots[shots.length - 1];
        await db.shots.delete(lastShot.id);
        return true;
    },
    async deleteAllShots(sessionId) {
        await db.shots
            .where('sessionId')
            .equals(sessionId)
            .delete();
    },
};

export default DatabaseService;