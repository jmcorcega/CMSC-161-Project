
function showPauseMenu() {
    showDialog(2);
}

function closePauseMenu() {
    closeDialog(2);
}

function onResumeGame() {
    console.log('onResumeGame');
    closePauseMenu();
    // Add logic to resume the game
}

function onRestartGame() {
    console.log('onRestartGame');
    // Add logic to restart the game
}

function onExitGame() {
    console.log('onExitGame');
    // Add logic to exit the game
}

function onShowGame() {
    var btnPause = document.getElementById('header-btn-pause');

    console.log('onShowGame');

    if (btnPause != null) {
        btnPause.addEventListener('click', function () {
            showPauseMenu();
        });
    } else {
        console.error('Error: btnPause is null');
    }

    setPauseDialogButtons(onResumeGame, onRestartGame, onExitGame);
}
