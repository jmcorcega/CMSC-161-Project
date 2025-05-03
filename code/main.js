import { createTileMap, loadGrassTexture, drawGrassTiles, tileMap, placeRocks, drawRocks } from './tilemap.js';
import { initWebGL } from './init_webgl.js';  // Import the initWebGL function
import { drawSnake, loadSnakeTexture } from './snake-map.js';

showLoadingScreen();
loadPage('pages/title-screen.html');

var progress = 0;
var interval = setInterval(function () {
    progress += 10;
    setLoadingProgress(progress);
    if (progress >= 100) {
        clearInterval(interval);
        closeLoadingScreen();

        startGame();
    }
}, 100);


async function startGame() {
    const {
        canvas, gl, shaderProgram,
        aPosition, aNormal,
        uModelMatrix, uViewMatrix, uProjMatrix,
        uLightDirection, uColor, uForceLight,
        aTexCoord, uUseTexture, uTexture, 
        uSampler, positionBuffer, normalBuffer, 
        texCoordBuffer, vertices
    } = await initWebGL();

    // Snake with cube segments 
    const snake = [
        { x: 0, y: 0 },    // head
        { x: -1, y: 0 },   
        { x: -2, y: 0 },   
        { x: -3, y: 0 },   
    ];

    let positionTrail = [];  // for movement history
    for (let i = 0; i < snake.length; i++) {
        positionTrail.push({ x: snake[i].x, y: snake[i].y });
    }

    let facingAngle = 0;
    let targetAngle = 0;
    let cameraAngle = 0;

    let isPaused = true;
    let isGameOver = false;
       
    var movement = setInterval(function () {
        if (!isPaused) render();
        if (isGameOver) clearInterval(movement);
    }, 350);

    createTileMap();
    placeRocks();

    loadGrassTexture(gl, () => {
        render(); // or any other function to run after texture is ready
    });

    loadSnakeTexture(gl, () => {
        render(); // or any other function to run after texture is ready
    }, 5);
        
    document.addEventListener('keydown', (e) => {
        if (e.key === 'a') {
            facingAngle -= Math.PI / 2;
            targetAngle -= Math.PI / 2;
        } else if (e.key === 'd') {
            facingAngle += Math.PI / 2;
            targetAngle += Math.PI / 2;
        }        
        isPaused = false;
    });

    function render() { 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shaderProgram);


        // Ensure angle is snapped to 90 deg
        facingAngle = Math.round(facingAngle / (Math.PI / 2)) * (Math.PI / 2);
    
        // Compute new head position
        const dx = Math.round(Math.cos(facingAngle));
        const dy = Math.round(Math.sin(facingAngle));
        const newX = snake[0].x + dx;
        const newY = snake[0].y + dy;
    
        // Add new head position to trail
        positionTrail.unshift({ x: newX, y: newY });
    
        // Trim trail to the number of segments
        while (positionTrail.length > snake.length) {
            positionTrail.pop();
        }
    
        // Smoothly interpolate cameraAngle toward targetAngle
        const turnSpeed = 0.75;
        const angleDiff = targetAngle - cameraAngle;
        cameraAngle += angleDiff * turnSpeed;
    
        // Round the snake's facing angle (used for movement)
        facingAngle = Math.round(targetAngle / (Math.PI / 2)) * (Math.PI / 2);
    
        // Move each segment to the corresponding position in the trail
        for (let i = 0; i < snake.length; i++) {
            snake[i].x = positionTrail[i].x;
            snake[i].y = positionTrail[i].y;    
        }
    
        // Camera follows from above and behind
        const camOffset = 10;
        const camX = snake[0].x - Math.cos(cameraAngle) * camOffset;
        const camY = 8;
        const camZ = snake[0].y - Math.sin(cameraAngle) * camOffset;
    
        const eye = [camX, camY, camZ];
        const center = [snake[0].x, 0, snake[0].y];
        const up = [0, 1, 0];
    
        const projMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100);
        const viewMatrix = lookAt(eye, center, up);

        drawSnake(gl, positionBuffer, normalBuffer, texCoordBuffer, aPosition, aNormal, aTexCoord, uViewMatrix, uProjMatrix, uModelMatrix, uUseTexture, uSampler, uLightDirection, uForceLight, projMatrix, viewMatrix, snake, vertices);
        drawGrassTiles(gl, aPosition, aNormal, aTexCoord, uModelMatrix, uUseTexture, uTexture);
        drawRocks(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);

        gl.uniform1f(uForceLight, 0.0); 
    }

}

