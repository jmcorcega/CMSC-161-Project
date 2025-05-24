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

export default class AboutScreen extends Screen {
    constructor() {
        super("pages/about-screen.html");
        this.title = "About";
    }

    onShow() {
        this.onHeaderLoad(goToTitleScreen);
    }
}
