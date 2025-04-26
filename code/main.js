
showLoadingScreen();
loadPage('pages/title-screen.html');

var progress = 0;
var interval = setInterval(function () {
    progress += 10;
    setLoadingProgress(progress);
    if (progress >= 100) {
        clearInterval(interval);
        closeLoadingScreen();
    }
}, 200);

