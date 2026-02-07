class Bow {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.strength = data.strength || null; // en kg
    this.notes = data.notes || '';
    this.size = data.size || null; // namisun, nisun, yonsun, rokusun, autre
    this.color = data.color || '#3498db';
    this.status = data.status || 'new'; // new, active, inactive, deleted
    this.isDefault = data.isDefault || false;
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
    // Vérif couleur (hex valide : #RRGGBB)
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(this.color)) {
      errors.push("invalidColor");
    }
    // Vérif status
    const validStatuses = ['new', 'active', 'inactive', 'deleted'];
    if (!validStatuses.includes(this.status)) {
      errors.push("invalidStatus");
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
      status: this.status,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      size: this.size,
      color: this.color
    }
  }
}