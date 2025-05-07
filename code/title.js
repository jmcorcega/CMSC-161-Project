import { loadPage } from '../lib/page_helper.js';

import Screen from './screen.js';

import AboutScreen from './about.js';
import LeaderboardScreen from './leaderboards.js';
import GameScreen from './game.js';

import {
    audioService,
} from '../lib/classes.js';
const aboutScreen = new AboutScreen();

function renderSoundIcons() {
    const titleBtnMusic = document.getElementById('title-btn-music');
    const titleBtnSound = document.getElementById('title-btn-sound');

    if (titleBtnMusic == null || titleBtnSound == null) {
        return;
    }

    if (audioService.getBgmState()) {
        titleBtnMusic.classList.add("game-button-enabled");
        titleBtnMusic.innerHTML = '<img src="img/icons/musicOn.png">';
    } else {
        titleBtnMusic.classList.remove("game-button-enabled");
        titleBtnMusic.innerHTML = '<img src="img/icons/musicOff.png">';
    }

    if (audioService.getSfxState()) {
        titleBtnSound.classList.add("game-button-enabled");
        titleBtnSound.innerHTML = '<img src="img/icons/audioOn.png">';
    } else {
        titleBtnSound.classList.remove("game-button-enabled");
        titleBtnSound.innerHTML = '<img src="img/icons/audioOff.png">';
    }
}

function showLeaderboardsScreen() {
    showLoadingScreen();

    setTimeout(function () {
        loadPage('pages/leaderboards.html', function() {
            onShowLeaderboard();
        });
    }, 1000);

    var progress = 0;
    var interval = setInterval(function () {
        progress += 10;
        setLoadingProgress(progress);
        if (progress >= 100) {
            clearInterval(interval);
            closeLoadingScreen();
        }
    }, 100);
}

function showAboutScreen() {
    aboutScreen.loadScreen();
}

const onSoundBtnClick = function (e) {
    let oldState = audioService.getSfxState();
    audioService.setSfxState(!oldState);
    audioService.playSfx("select");
    renderSoundIcons();
}

const onMusicBtnClick = function (e) {
    let oldState = audioService.getBgmState();
    audioService.playSfx("select");
    audioService.setBgmState(!oldState);

    if (audioService.getBgmState()) {
        audioService.playBgm(true);
    } else {
        audioService.stopBgm();
    }

    renderSoundIcons();
}

export default class TitleScreen extends Screen {
    constructor() {
        super("pages/title-screen.html");
    }

    onShow() {
        const titleBtnMusic = document.getElementById('title-btn-music');
        const titleBtnSound = document.getElementById('title-btn-sound');
        const titleBtnLeaderboards = document.getElementById('title-btn-leaderboards');
        const titleBtnAbout = document.getElementById('title-btn-about');
        const titleBtnPlay = document.getElementById('title-btn-play');

        renderSoundIcons();

        if (titleBtnMusic != null && titleBtnSound != null) {
            titleBtnMusic.addEventListener("click", onMusicBtnClick);
            titleBtnSound.addEventListener("click", onSoundBtnClick);
        }

        if (titleBtnLeaderboards != null) {
            titleBtnLeaderboards.addEventListener("click", () => new LeaderboardScreen().loadScreen());
        }

        if (titleBtnAbout != null) {
            titleBtnAbout.addEventListener("click", () => aboutScreen.loadScreen());
        }

        if (titleBtnPlay != null) {
            titleBtnPlay.addEventListener("click", () => new GameScreen().loadScreen());
        }
    }
}
