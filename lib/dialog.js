/*  Pixel Sweeper - DialogController
    Control dialogs within the game, as well as define actions and more.
    For use with vanilla HTML5 games powered by JS

    (C) 2021-2022 John Vincent M. Corcega - TenSeventy7
*/

import {
    audioService,
} from './classes.js';

var dialogBgGeneric = document.getElementById('dialog-bg-generic');
var dialogBgPause = document.getElementById('dialog-bg-pause');
var dialogBgEndGame = document.getElementById('dialog-bg-end-game');
var dialogBgSaveData = document.getElementById('dialog-bg-save-data');
var dialogBgFirstPlay = document.getElementById('dialog-bg-first-play');
var dialogContent = document.getElementById('dialog-generic');
var dialogPause = document.getElementById('dialog-pause');
var dialogEndGame = document.getElementById('dialog-end-game');
var dialogFirstPlay = document.getElementById('dialog-first-play');
var dialogSaveData = document.getElementById('dialog-save-data');

var dialogContentTitle = document.getElementById('dialog-title');
var dialogContentText = document.getElementById('dialog-content-text');
var dialogContentSubtitle = document.getElementById('dialog-content-subtitle');

var dialogBtnP = document.getElementById('dialog-btn-positive');
var dialogBtnN = document.getElementById('dialog-btn-negative');
var dialogBtnT = document.getElementById('dialog-btn-neutral');

var dialogBtnResume = document.getElementById('dialog-btn-resume');
var dialogBtnRestart = document.getElementById('dialog-btn-restart');
var dialogBtnExit = document.getElementById('dialog-btn-exit');

var dialogSaveBtnClose = document.getElementById('dialog-btn-save-close');
var dialogSaveBtnDownload = document.getElementById('dialog-btn-download');
var dialogSaveBtnUpload = document.getElementById('dialog-btn-upload');

var dialogEndBtnRestart = document.getElementById('dialog-end-btn-restart')
var dialogEndBtnExit = document.getElementById('dialog-end-btn-exit')

var dialogBtnMusic = document.getElementById('dialog-btn-music');
var dialogBtnSound = document.getElementById('dialog-btn-sound');

var currentPositiveEvent = null;
var currentNeutralEvent = null;
var currentNegativeEvent = null;

var currentResumeEvent = null;
var currentRestartEvent = null;
var currentExitEvent = null;

var currentEndRestartEvent = null;
var currentEndExitEvent = null;

var initClickListener = false;

function assignEvents() {
    dialogBtnP.addEventListener('click', currentPositiveEvent);
    dialogBtnN.addEventListener('click', currentNegativeEvent);
    if (currentNeutralEvent !== null) {
        dialogBtnT.addEventListener('click', currentNeutralEvent);
    }
}

function clearEvents() {
    if (currentPositiveEvent !== null) {
        dialogBtnP.removeEventListener('click', currentPositiveEvent);
    }
    if (currentNegativeEvent !== null) {
        dialogBtnN.removeEventListener('click', currentNegativeEvent);
    }
    if (currentNeutralEvent !== null) {
        dialogBtnT.addEventListener('click', currentNeutralEvent);
    }
}

function assignPauseEvents() {
    dialogBtnResume.addEventListener('click', currentResumeEvent);
    dialogBtnRestart.addEventListener('click', currentRestartEvent);
    dialogBtnExit.addEventListener('click', currentExitEvent);
}

function clearPauseEvents() {
    if (currentResumeEvent !== null) {
        dialogBtnResume.removeEventListener('click', currentResumeEvent);
        dialogBtnRestart.removeEventListener('click', currentRestartEvent);
        dialogBtnExit.removeEventListener('click', currentExitEvent);
    }
}

function assignEndScreenEvents() {
    dialogEndBtnRestart.addEventListener('click', currentEndRestartEvent);
    dialogEndBtnExit.addEventListener('click', currentEndExitEvent);
}

function clearEndScreenEvents() {
    if (currentEndRestartEvent !== null) {
        dialogEndBtnRestart.addEventListener('click', currentEndRestartEvent);
        dialogEndBtnExit.addEventListener('click', currentEndExitEvent);
    }
}

function renderSoundIcons() {
    if (audioService.getBgmState()) {
        dialogBtnMusic.classList.add("title-btn-enabled");
        dialogBtnMusic.innerHTML = '<img src="img/icons/musicOn.png">';
    } else {
        dialogBtnMusic.classList.remove("title-btn-enabled");
        dialogBtnMusic.innerHTML = '<img src="img/icons/musicOff.png">';
    }

    if (audioService.getSfxState()) {
        dialogBtnSound.classList.add("title-btn-enabled");
        dialogBtnSound.innerHTML = '<img src="img/icons/audioOn.png">';
    } else {
        dialogBtnSound.classList.remove("title-btn-enabled");
        dialogBtnSound.innerHTML = '<img src="img/icons/audioOff.png">';
    }
}

function onSoundBtnClick(e) {
    let oldState = audioService.getSfxState();
    if (!oldState) audioService.playSfx("select");
    audioService.setSfxState(!oldState);
    renderSoundIcons();
}

function onMusicBtnClick(e) {
    let oldState = audioService.getBgmState();
    audioService.setBgmState(!oldState);

    if (audioService.getBgmState()) {
        audioService.playBgm(true);
    } else {
        audioService.stopBgm();
    }

    renderSoundIcons();
}

function onFirstPlayClick(e) {
    // dialogController.closeDialog(4);
}

function onUpload(e) {
    audioService.playSfx("dialog");
    // gameStorageService.uploadGameData();
}

function onDownload(e) {
    audioService.playSfx("select");
    // gameStorageService.downloadGameData();
}

function onSaveDataClose(e) {
    audioService.playSfx("menu");
    // dialogController.closeDialog(5);
}

if (!initClickListener) {
    dialogBtnSound.addEventListener('click', e => onSoundBtnClick(e));
    dialogBtnMusic.addEventListener('click', e => onMusicBtnClick(e));
    // dialogBgFirstPlay.addEventListener('click', e => onFirstPlayClick(e));
    // dialogSaveBtnClose.addEventListener('click', e => onSaveDataClose(e));
    // dialogSaveBtnUpload.addEventListener('click', e => onUpload(e));
    // dialogSaveBtnDownload.addEventListener('click', e => onDownload(e));
    initClickListener = true;
}

export default class DialogController {
    // Set dialog message. For type 1 only!
    setDialogMessage(title, content, subtitle) {
        dialogContentSubtitle.style.display = 'inherit';
        dialogContentTitle.innerHTML = title;
        dialogContentText.innerHTML = content;
        if (typeof subtitle !== 'undefined') {
            dialogContentSubtitle.innerHTML = subtitle;
        } else {
            dialogContentSubtitle.style.display = 'none';
        }
    }

    // Set text for the dialog buttons. For type 1 only!
    setDialogButtonText(positive, negative, neutral) {
        dialogBtnP.innerHTML = positive;
        dialogBtnN.innerHTML = negative;
        if (typeof neutral !== 'undefined') {
            dialogBtnT.innerHTML = neutral;
        }
    }

    // Set onClick functions for the dialog buttons. For type 1 only!
    setDialogButtons(positiveEvent, negativeEvent, neutralEvent) {
        dialogBtnT.style.display = 'initial';
        clearEvents();

        currentPositiveEvent = positiveEvent;
        currentNegativeEvent = negativeEvent;

        if (typeof neutralEvent !== 'undefined') {
            currentNeutralEvent = neutralEvent;
        } else {
            dialogBtnT.style.display = 'none';
        }

        assignEvents();
    }

    // Set onClick functions for the dialog buttons. For type 2 only!
    setPauseDialogButtons(resume, restart, exit) {
        clearPauseEvents();

        currentResumeEvent = resume;
        currentRestartEvent = restart;
        currentExitEvent = exit;

        assignPauseEvents();
    }

    setEndLevelDialogButtons(restart, exit) {
        clearEndScreenEvents();

        currentEndRestartEvent = restart;
        currentEndExitEvent = exit;

        assignEndScreenEvents();
    }

    setEndLevelMessage(message, img, isRestart, isNewRecord) {
        document.getElementById('dialog-end-game-title').innerHTML = message;
        document.getElementById('dialog-end-game-image').src = img;
        document.getElementById('dialog-end-btn-restart').style.display = (isRestart) ? 'initial' : 'none';
        document.getElementById('dialog-end-game-new').style.visibility = (isNewRecord) ? 'visible' : 'hidden';
    }

    // Show the dialog container
    // MAKE SURE functions are assigned before showing dialogs!
    showDialog(type) {
        var playSfx = true;
        var dialogId;
        var dialogBg;

        switch (type) {
            case 2:
                // Pause dialog - during ingame
                dialogId = dialogPause;
                dialogBg = dialogBgPause;
                renderSoundIcons();
                break;
            case 3:
                // End game dialog - after a game level
                playSfx = false; // Don't play SFX on end game dialog
                dialogId = dialogEndGame;
                dialogBg = dialogBgEndGame;
                break;
            case 4:
                // First play dialog - shown once when user first played the game
                playSfx = false; // Don't play SFX on first play dialog
                dialogId = dialogFirstPlay;
                dialogBg = dialogBgFirstPlay;
                break;
            case 5:
                // Save Data dialog - to download/upload data
                dialogId = dialogSaveData;
                dialogBg = dialogBgSaveData;
                break;
            default:
                // If nothing is defined, it's most likely the generic one
                dialogId = dialogContent;
                dialogBg = dialogBgGeneric;
        }

        if (playSfx) audioService.playSfx("dialog");
        dialogBg.classList.remove("dialog-gone");
        dialogId.classList.remove("animate__bounceOut");
        setTimeout(function () {
            dialogId.classList.remove("dialog-gone");
            dialogBg.classList.add("dialog-bg");
            dialogId.classList.add("animate__bounceIn");
        }, 200);
    }

    // Hide the dialog container
    closeDialog(type) {
        var dialogId;
        var dialogBg;

        switch (type) {
            case 2:
                dialogId = dialogPause;
                dialogBg = dialogBgPause;
                break;
            case 3:
                dialogId = dialogEndGame;
                dialogBg = dialogBgEndGame;
                break;
            case 4:
                dialogId = dialogFirstPlay;
                dialogBg = dialogBgFirstPlay;
                break;
            case 5:
                dialogId = dialogSaveData;
                dialogBg = dialogBgSaveData;
                break;
            default:
                dialogId = dialogContent;
                dialogBg = dialogBgGeneric;
        }

        dialogId.classList.remove("animate__bounceIn");
        dialogId.classList.add("animate__bounceOut");
        setTimeout(function () {
            dialogBg.classList.remove("dialog-bg");
            dialogId.classList.add("dialog-gone");
            setTimeout(function () {
                dialogBg.classList.add("dialog-gone");
            }, 500);
        }, 500);
    }
}