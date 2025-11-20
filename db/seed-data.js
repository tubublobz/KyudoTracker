export async function seedDatabase(db) {
  const typeCount = await db.type_tir.count();
  
  if (typeCount === 0) {
    console.log('🌱 Seeding database with initial data...');
    
    await db.type_tir.bulkAdd([
      { code: 'maki', distance: 2, diametre_cible: 0, scoring: false, makiwara: true },
      { code: 'kinteki28', distance: 28, diametre_cible: 36, scoring: true, makiwara: false },
      { code: 'enteki60', distance: 60, diametre_cible: 100, scoring: true, makiwara: false }
    ]);
    
    console.log('✅ Database seeded!');
  }
}
