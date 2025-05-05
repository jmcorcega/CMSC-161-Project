/*  WitzLibs - AudioHelper
    Audio APIs ported from my TypeScript projects to JavaScript
    For use with vanilla HTML5 games powered by JS

    (C) 2021-2022 John Vincent M. Corcega - TenSeventy7
*/

let sounds = [];
const bgmPlayer = new Audio();
var currentBgm;

// Preload SFX to memory
function preloadSfx(key, asset) {
    let audio = new Audio();
    audio.src = asset;
    sounds.push({
        key: key,
        audio: audio,
        asset: asset,
    });
}

// Preload BGM to memory - to save memory, ONLY preload one BGM at a time
function preloadBgm(asset) {
    currentBgm = asset;
    bgmPlayer.src = asset;
    bgmPlayer.loop = true;
    bgmPlayer.volume = 1.0;
}

// Stop BGM and unload from memory
function unloadBgm() {
    bgmPlayer.src = null;
    bgmPlayer.volume = 1.0;
    bgmPlayer.loop = true;
}

// Play or pause the BGM player
function playBgm(bool) {
    if (getBgmState() && bool) {
        bgmPlayer.play();
    } else {
        bgmPlayer.pause();
    }
}

// Stop the BGM player
function stopBgm() {
    bgmPlayer.src = currentBgm;
    bgmPlayer.volume = 1.0;
    bgmPlayer.loop = true;
}

// Set volume of the BGM
function setBgmVolume(volume) {
    bgmPlayer.volume = volume;
}

// Play an SFX
function playSfx(key) {
    if (!isAudioSupported()) return;
    if (sounds.length === 0) return;

    let sfxAudio = sounds.find((sfxAudio) => {
        return sfxAudio.key === key;
    });

    if (sfxAudio == null) return;

    if (this.getSfxState()) sfxAudio.audio.play();
}

// Set state of BGM on/off
function setBgmState(state) {
    setConfig("audio/game_music", state);
}

// Set state of SFX on/off
function setSfxState(state) {
    setConfig("audio/game_audio", state);
}

// Get on/off state of BGM
function getBgmState() {
    let data = getConfig("audio/game_music");
    return (data == null) ? true : data;
}

// Get on/off state of SFX
function getSfxState() {
    let data = getConfig("audio/game_audio");
    return (data == null) ? true : data;
}

// Ask the browser if it supports HTML Audio
function isAudioSupported() {
    // https://stackoverflow.com/questions/30151794/how-to-check-if-new-audio-is-supported-by-browser
    return (typeof window.Audio !== "undefined");
}

export {
    preloadSfx,
    preloadBgm,
    unloadBgm,
    playBgm,
    stopBgm,
    setBgmVolume,
    playSfx,
    setBgmState,
    setSfxState,
    getBgmState,
    getSfxState,
    isAudioSupported,
}
