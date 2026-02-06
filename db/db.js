import { seedDatabase } from './seed-data.js';

const db = new Dexie('KyudoTrackerDB');

// Définition du schéma V4 (renommage en anglais et rajout du champ bow)
db.version(4).stores({
    sessions: '++id, date, location, type, bowId',
    shots: '++id, sessionId, shareiId, bowId, typeCode, result',
    sharei: '++id, sessionId',
    bows: '++id, name, strength, isActive',
    shotTypes: '++id, code'
});

try {
    await db.open();
    await seedDatabase(db);
} catch (error) {
    console.error('❌ Database initialization failed:', error);
}

export default db;
