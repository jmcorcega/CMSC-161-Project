import { onShowGame } from "./game.js";
import { playBgm, preloadBgm, preloadSfx } from "../lib/audio_service.js";

function preloadBgMusic() {
    preloadBgm('bgm/title.mp3');
}

function preloadSoundEffects() {
    let sfx = [
        { key: 'select', asset: 'sfx/select.ogg' },
    ]

    sfx.forEach((sfx) => {
        preloadSfx(sfx.key, sfx.asset);
    });
}

function onHeaderLoad(fn) {
    const backBtn = document.getElementById('header-btn-back');
    if (backBtn != null && fn != null) {
        backBtn.addEventListener('click', fn);
    }
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
            onShowTitle();
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
            playBgm(true);
            // onShowGame();
        }
    }, 200);
}

document.getElementById('game').style.display = 'none';
document.getElementById('start-game').style.display = 'flex';
document.getElementById('start-game').addEventListener('click', onStartGame);
