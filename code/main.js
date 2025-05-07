import AudioService from "../lib/audio_service.js";
import TitleScreen from "./title.js";
import { loadPage } from '../lib/page_helper.js';

const audioService = new AudioService();
const titleScreen = new TitleScreen();

function preloadBgMusic() {
    audioService.preloadBgm('bgm/title.mp3');
}

function preloadSoundEffects() {
    let sfx = [
        { key: 'select', asset: 'sfx/select.ogg' },
        { key: 'dialog', asset: 'sfx/dialog.ogg' },
        { key: 'lose', asset: 'sfx/levelLose.ogg' },
        { key: 'close', asset: 'sfx/close.ogg' },
        { key: 'confirm', asset: 'sfx/confirm.ogg' },
        { key: 'dialogConfirm', asset: 'sfx/dialogConfirm.ogg' },
        { key: 'error', asset: 'sfx/error.ogg' },
        { key: 'maximize', asset: 'sfx/maximize.ogg' },
        { key: 'minimize', asset: 'sfx/minimize.ogg' },
        { key: 'turn', asset: 'sfx/turn.ogg' },
        { key: 'food', asset: 'sfx/food.ogg' },
        { key: 'collision', asset: 'sfx/collision.ogg' },
    ]

    sfx.forEach((sfx) => {
        audioService.preloadSfx(sfx.key, sfx.asset);
    });
}

// Preload images and icons in memory.
function preloadImg(url) {
    var img = new Image();
    img.src = url;
}

function onStartGame() {
    document.getElementById('start-game').style.display = 'none';
    document.getElementById('game').style.display = 'initial';
    showLoadingScreen();
    
    var delay = setInterval(function () {
        loadPage('pages/title-screen.html', function() {
            titleScreen.onShow();
        });
        // loadPage('pages/snake-game.html', function() {
        // });
        clearInterval(delay);
    }, 1000);

    preloadBgMusic();
    preloadSoundEffects();
    preloadImg('img/icons/musicOn.png');
    preloadImg('img/icons/musicOff.png');
    preloadImg('img/icons/audioOn.png');
    preloadImg('img/icons/audioOff.png');
    preloadImg('img/backgrounds/backgroundColorGrass.png');

    var progress = 0;
    var interval = setInterval(function () {
        progress += 10;
        setLoadingProgress(progress);
        if (progress >= 100) {
            clearInterval(interval);
            closeLoadingScreen();
            audioService.playBgm(true);
            // onShowGame();
        }
    }, 200);
}

document.getElementById('game').style.display = 'none';
document.getElementById('start-game').style.display = 'flex';
document.getElementById('start-game').addEventListener('click', onStartGame);
