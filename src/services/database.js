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
  }
  
};

export default DatabaseService;