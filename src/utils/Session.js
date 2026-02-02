class Session {
    constructor() {
        this.makiwara = 0;
        this.kinteki = [];
    }

    addMakiwara() {
        this.makiwara++;
    }

    removeMakiwara() {
        if (this.makiwara > 0)
            this.makiwara--;
    }

    addKinteki(isHit) {
        this.kinteki.push({ result: isHit });
    }

    getHits() {
        return this.kinteki.filter(t => t.result === true).length
    }

    isEmpty() {
        if (this.makiwara === 0 && this.kinteki.length === 0)
            return true;
        else
            return false
    }

    reset() {
        this.makiwara = 0;
        this.kinteki = [];
    }

    toData() {
        return {
            makiwara: this.makiwara,
            kinteki: this.kinteki
        }
    }
}

export default Session;