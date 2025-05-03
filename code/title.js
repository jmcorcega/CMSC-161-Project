
function renderSoundIcons() {
    const titleBtnMusic = document.getElementById('title-btn-music');
    const titleBtnSound = document.getElementById('title-btn-sound');

    if (titleBtnMusic == null || titleBtnSound == null) {
        return;
    }

    if (getBgmState()) {
        titleBtnMusic.classList.add("game-button-enabled");
        titleBtnMusic.innerHTML = '<img src="img/icons/musicOn.png">';
    } else {
        titleBtnMusic.classList.remove("game-button-enabled");
        titleBtnMusic.innerHTML = '<img src="img/icons/musicOff.png">';
    }

    if (getSfxState()) {
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
    showLoadingScreen();

    setTimeout(function () {
        loadPage('pages/about-screen.html', function() {
            onShowAbout();
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

const onSoundBtnClick = function (e) {
    let oldState = getSfxState();
    setSfxState(!oldState);
    playSfx("select");
    renderSoundIcons();
}

const onMusicBtnClick = function (e) {
    let oldState = getBgmState();
    playSfx("select");
    setBgmState(!oldState);

    if (getBgmState()) {
        playBgm(true);
    } else {
        stopBgm();
    }

    renderSoundIcons();
}

function onShowTitle() {
    const titleBtnMusic = document.getElementById('title-btn-music');
    const titleBtnSound = document.getElementById('title-btn-sound');
    const titleBtnLeaderboards = document.getElementById('title-btn-leaderboards');
    const titleBtnAbout = document.getElementById('title-btn-about');

    renderSoundIcons();

    if (titleBtnMusic != null && titleBtnSound != null) {
        titleBtnMusic.addEventListener("click", onMusicBtnClick);
        titleBtnSound.addEventListener("click", onSoundBtnClick);
    }

    if (titleBtnLeaderboards != null) {
        titleBtnLeaderboards.addEventListener("click", showLeaderboardsScreen);
    }

    if (titleBtnAbout != null) {
        titleBtnAbout.addEventListener("click", showAboutScreen);
    }
}

