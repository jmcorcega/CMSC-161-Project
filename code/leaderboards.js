
function goToTitleScreen() {
    showLoadingScreen();
    
    var delay = setInterval(function () {
        loadPage('pages/title-screen.html', function() {
            closeLoadingScreen();
            onShowTitle();
        });
        clearInterval(delay);
    }, 1000);
}

function onShowLeaderboard() {
    onHeaderLoad(goToTitleScreen);
}
