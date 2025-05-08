/*  WitzLibs - Audio
    Audio APIs ported from my TypeScript projects to JavaScript
    For use with vanilla HTML5 games powered by JS

    (C) 2021-2022 John Vincent M. Corcega - TenSeventy7
*/

// Import StorageService - for setting and retrieving audio states
import { storageService } from "./classes.js";

let sounds = [];
const bgmPlayer = new Audio();
var bgmStopped = true;
var currentBgm;
var fadeOutInterval;

export default class AudioService {
    // Preload SFX to memory
    preloadSfx(key, asset) {
        let audio = new Audio();
        audio.src = asset;
        sounds.push({
            key: key,
            audio: audio,
            asset: asset,
        });
    }

    // Preload BGM to memory - to save memory, ONLY preload one BGM at a time
    preloadBgm(asset) {
        currentBgm = asset;
        bgmPlayer.src = asset;
        bgmPlayer.loop = true;
        bgmPlayer.volume = 0.4;
    }

    // Stop BGM and unload from memory
    unloadBgm() {
        bgmPlayer.src = null;
        bgmPlayer.volume = 0.4;
        bgmPlayer.loop = true;
    }

    // Play or pause the BGM player
    playBgm(bool) {
        if (this.getBgmState() && bool) {
            if (fadeOutInterval) {
                clearInterval(fadeOutInterval);
                bgmPlayer.volume = 0.4;
            }

            if (bgmStopped) {   
                bgmPlayer.currentTime = 0;
            }

            bgmPlayer.volume = 0.4;
            bgmPlayer.play();
            bgmStopped = false;
        } else {
            this.pauseBgm();
        }
    }

    // Stop the BGM player
    stopBgm(instant = false) {
        if (fadeOutInterval) {
            clearInterval(fadeOutInterval);
        }

        // Fade out the BGM
        if (!instant) {
            fadeOutInterval = setInterval(() => {
                if (bgmPlayer.volume > 0.1) {
                    bgmPlayer.volume -= 0.1;
                } else {
                    clearInterval(fadeOutInterval);
                    bgmPlayer.pause();
                    bgmStopped = true;
                }
            }, 400);
        } else {
            bgmPlayer.pause();
            bgmStopped = true;
        }
    }

    pauseBgm() {
        if (fadeOutInterval) {
            clearInterval(fadeOutInterval);
        }
        
        // Fade out the BGM
        fadeOutInterval = setInterval(() => {
            if (bgmPlayer.volume > 0.1) {
                bgmPlayer.volume -= 0.1;
            } else {
                clearInterval(fadeOutInterval);
                bgmPlayer.pause();
                bgmStopped = false;
            }
        }, 300);
    }

    // Set volume of the BGM
    setBgmVolume(volume) {
        bgmPlayer.volume = volume;
    }

    // Play an SFX
    playSfx(key) {
        let sfxAudio = sounds.find((sfxAudio) => {
            return sfxAudio.key === key;
        });

        if (sfxAudio == null) return;

        if (this.getSfxState()) sfxAudio.audio.play();
    }

    // Set state of BGM on/off
    setBgmState(state) {
        storageService.setConfig("audio/game_music", state);
    }

    // Set state of SFX on/off
    setSfxState(state) {
        storageService.setConfig("audio/game_audio", state);
    }

    // Get on/off state of BGM
    getBgmState() {
        let data = storageService.getConfig("audio/game_music");
        return (data == null) ? true : data;
    }

    // Get on/off state of SFX
    getSfxState() {
        let data = storageService.getConfig("audio/game_audio");
        return (data == null) ? true : data;
    }

    // Ask the browser if it supports HTML Audio
    isAudioSupported() {
        // https://stackoverflow.com/questions/30151794/how-to-check-if-new-audio-is-supported-by-browser
        return (typeof window.Audio !== "undefined");
    }
}