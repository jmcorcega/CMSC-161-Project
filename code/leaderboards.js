import { loadPage } from '../lib/page_helper.js';
import Screen from './screen.js';

import {
    audioService,
} from '../lib/classes.js';

import TitleScreen from './title.js';
function goToTitleScreen() {
    const titleScreen = new TitleScreen();
    audioService.playSfx("minimize");
    titleScreen.loadScreen();
}

import { getSkin } from './game.js';
import leaderboardService from './leaderboards_service.js';
const service = leaderboardService;

function generateLeaderboardEntry(pos, board) {
    // Returns an HTML div with the name, score, and skin image
    let skin = getSkin(board.skinId)
    return `
        <div class="leaderboard-entry">
            <span class="player-position font-mini">${pos}</span>
            <img src="${skin.img}" alt="${board.name}'s skin" class="player-skin">
            <div class="player-info">
                <span class="player-name font-mini">${board.name}</span>
                <span class="player-score font-rocket">${board.score}</span>
            </div>
        </div>
    `;
}

function generateLeaderboard() {
    let leaderboard = service.getLeaderboards();
    
    // Sort the leaderboard by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Get the top 10 entries (or all if less than 10)
    const topEntries = leaderboard.slice(0, 10);
    
    // Generate HTML for each entry
    let pos = 0;
    const leaderboardHTML = topEntries.map(entry => {
        pos += 1;
        return generateLeaderboardEntry(pos, entry);
    }).join('');
    
    // Insert into the container
    document.getElementById('leaderboards-container').innerHTML = leaderboardHTML;
}

export default class LeaderboardScreen extends Screen {
    constructor() {
        super("pages/leaderboards.html");
    }

    onShow() {
        this.onHeaderLoad(goToTitleScreen);

        // Generate the leaderboard after the screen is shown
        generateLeaderboard();
    }
}
