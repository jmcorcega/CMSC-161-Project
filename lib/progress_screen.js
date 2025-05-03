/*
 * Progress Screen library for showing loading screens
 * (C) 2025 John Vincent Corcega <jmcorcega@up.edu.ph>
 * 
 * Looking for help with this code?
 * Email me at up@tenseventyseven.xyz
 */

var ldContainer = document.getElementById('loading-screen');
var ldProgress = document.getElementById('loading-progress');

function min(a, b) {
    return (a < b) ? a : b;
}

function max(a, b) {
    return (a > b) ? a : b;
}

// Set the progress bar value
function setLoadingProgress(value) {
    const randomTiming = Math.floor((Math.random() * 2) + 2);
    ldProgress.style.transitionDuration = `${randomTiming}s`;
    ldProgress.style.width = max(value, 20) + "%";
}

// Show the loading screen
function showLoadingScreen() {
    setLoadingProgress(0);
    ldContainer.classList.remove("dialog-gone");
    ldContainer.classList.remove("animate__fadeOut");
    ldContainer.classList.add("animate__fadeIn");
}

// Close the loading screen
function closeLoadingScreen() {
    ldContainer.classList.remove("animate__fadeIn");
    ldContainer.classList.add("animate__fadeOut");
    setTimeout(function () {
        ldContainer.classList.add("dialog-gone");
    }, 800);
}
