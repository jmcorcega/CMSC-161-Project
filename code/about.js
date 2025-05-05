import { loadPage } from '../lib/page_helper.js';
import Screen from './screen.js';

import TitleScreen from './title.js';
function goToTitleScreen() {
    const titleScreen = new TitleScreen();
    titleScreen.loadScreen();
}

export default class AboutScreen extends Screen {
    constructor() {
        super("pages/about-screen.html");
    }

    onShow() {
        this.onHeaderLoad(goToTitleScreen);
    }
}
