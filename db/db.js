import { seedDatabase } from './seed-data.js';

const db = new Dexie('KyudoTrackerDB');

// Définition du schéma V5
db.version(5).stores({
    sessions: '++id, date, location, type, initialBowId',
    shots: '++id, sessionId, shareiId, bowId, typeCode, result',
    sharei: '++id, sessionId',
    bows: '++id, name, strength, status, isDefault',
    shotTypes: '++id, code'
});

// Fonction d'initialisation
export async function initDatabase() {
    try {
        await db.open();
        await seedDatabase(db);
        console.log('✅ Database ready');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}
export default db;
