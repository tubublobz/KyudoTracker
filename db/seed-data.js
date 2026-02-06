export async function seedDatabase(db) {
  const typeCount = await db.shotTypes.count();
  
  if (typeCount === 0) {
    console.log('🌱 Seeding database with initial data...');
    
    // MatoSize est le diamètre en cm.
    await db.shotTypes.bulkAdd([
      { code: 'maki', distance: 2, matoSize: 0, scoring: false, makiwara: true },
      { code: 'kinteki28', distance: 28, matoSize: 36, scoring: true, makiwara: false },
      { code: 'enteki60', distance: 60, matoSize: 100, scoring: true, makiwara: false }
    ]);
    
    console.log('✅ Database seeded!');
  }
}
