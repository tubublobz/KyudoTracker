class Bow {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.strength = data.strength || null; // en kg
    this.notes = data.notes || '';
    this.isActive = data.isActive ?? true; // pour archiver sans supprimer
    this.createdAt = data.createdAt || new Date().toISOString();
  }

validate() {
  const errors = [];
  
  // Vérif nom
  if (!this.name || this.name.trim() === '') {
    errors.push("missingBowName");
  }
  
  // Vérif puissance
  if (this.strength !== null && this.strength !== '') {
    const strengthNum = Number(this.strength);
    
    if (isNaN(strengthNum) || strengthNum <= 0) {
      errors.push("invalidStrength");
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

  toJSON() {
        return {
            id: this.id,
            name: this.name,
            strength: this.strength,
            notes: this.notes,
            isActive: this.isActive,
            createdAt: this.createdAt
        }  }
}