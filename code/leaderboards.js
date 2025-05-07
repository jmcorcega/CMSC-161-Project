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

export default class LeaderboardScreen extends Screen {
    constructor() {
        super("pages/leaderboards.html");
    }

    onShow() {
        this.onHeaderLoad(goToTitleScreen);
    }
}
