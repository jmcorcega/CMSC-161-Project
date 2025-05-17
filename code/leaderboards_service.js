import { storageService, } from '../lib/classes.js';

const MAX_LEADERBOARDS = 10;
const DEFAULT_LEADERBOARD = {
    name: "Anonymous",
    score: 0,
    skinId: 'classic', // default
};

class LeaderboardsService {
    constructor() {
        if (LeaderboardsService.instance) {
            return LeaderboardsService.instance;
        }
        
        LeaderboardsService.instance = this;
        
        this.storage = storageService;
        this.leaderboards = [];
        this.loadLeaderboards();
    }

    loadLeaderboards() {
        const saved = this.storage.getItem('leaderboards');
        if (saved) {
            this.leaderboards = saved.leaderboards;
        } else {
            this.leaderboards = [];
        }
        this.fillMissingLeaderboards();
    }

    fillMissingLeaderboards() {
        for (let i = this.leaderboards.length; i < MAX_LEADERBOARDS; i++) {
            this.leaderboards.push(DEFAULT_LEADERBOARD);
        }
    }

    saveLeaderboards() {
        const data = {leaderboards: this.leaderboards};
        this.storage.setItem('leaderboards', data);
    }

    getLeaderboards() {
        return this.leaderboards;
    }

    addUser(name, score, skin) {
        if (!this.isScoreForLeaderboard(score)) {
            return;
        }

        if (!score || !name || !skin) {
            console.error("Invalid parameters for addUser");
            return;
        }

        let idx = this.findLeaderboardIndex(score);

        // Move existing entries down
        for (let i = this.leaderboards.length - 1; i > idx; i--) {
            this.leaderboards[i] = this.leaderboards[i - 1];
        }

        // Add new entry
        this.leaderboards[idx] = {name: name, score: score, skinId: skin.id};
        this.saveLeaderboards();
    }

    isScoreForLeaderboard(score) {
        return this.leaderboards.some(leaderboard => {
            return leaderboard.score < score;
        });
    }

    findLeaderboardIndex(score) {
        return this.leaderboards.findIndex(leaderboard => {
            return leaderboard.score < score;
        });
    }
}

// Export a singleton instance instead of the class
export default new LeaderboardsService();