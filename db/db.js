import { seedDatabase } from './seed-data.js';

const db = new Dexie('KyudoTrackerDB');

// Définition du schéma V2 (basé sur schemaV1.dbml)
db.version(2).stores({
    session: '++id, date, lieu, type',
    tir: '++id, session_id, sharei_id, arc_id, typeCode',
    sharei: '++id, session_id',
    arc: '++id, nom',
    type_tir: '++id, code'
});

// Hook pour peupler la base de données si nécessaire
db.on('ready', async () => {
    try {
        await seedDatabase(db);
    } catch (error) {
        console.error('❌ Erreur lors du seeding :', error);
    }
});

export default db;
