module.exports = class MarginLauncher {
    constructor() {
        this.scoketIO;
        this.isDone = false;
    }
    static getInstance() {
        if (!this.MarginLauncher) this.MarginLauncher = new MarginLauncher();
        return this.MarginLauncher;
    }
}