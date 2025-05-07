import { createTileMap, loadGrassTexture, tileMap, placeRocksAndGrass, placeLogs, 
    drawTiles, drawRocks, drawLogs, drawGrasses, drawFood, placeFood, food } from './tilemap.js';
import { initWebGL } from './init_webgl.js';  // Import the initWebGL function
import { drawSnake, loadSnakeTexture } from './snake-map.js';
import { registerKeyListener } from '../lib/key_listener.js';

import Screen from './screen.js';

import DialogController from '../lib/dialog.js';
const dialogController = new DialogController();

let isPaused = false;
let isGameOver = false;

function showPauseMenu() {
    dialogController.showDialog(2);
}

function closePauseMenu() {
    dialogController.closeDialog(2);
}

function onResumeGame() {
    console.log('onResumeGame');
    closePauseMenu();

    // Wait a bit before resuming the game
    // This is to prevent the game from resuming immediately
    setTimeout(() => {
        isPaused = false;
    }, 1000);
}

function onRestartGame() {
    console.log('onRestartGame');
    // Add logic to restart the game
}

function onExitGame() {
    console.log('onExitGame');
    // Add logic to exit the game
}

function translate(x, y, z) {
    return new Float32Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        x,y,z,1
    ]);
}

function perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan((fov * Math.PI) / 360);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
    ]);
}

    function lookAt(eye, center, up) {
    const [ex, ey, ez] = eye;
    const [cx, cy, cz] = center;
    const [ux, uy, uz] = up;

    let zx = ex - cx,
        zy = ey - cy,
        zz = ez - cz;
    const zl = Math.hypot(zx, zy, zz);
    zx /= zl; zy /= zl; zz /= zl;

    let xx = uy * zz - uz * zy,
        xy = uz * zx - ux * zz,
        xz = ux * zy - uy * zx;
    const xl = Math.hypot(xx, xy, xz);
    xx /= xl; xy /= xl; xz /= xl;

    let yx = zy * xz - zz * xy,
        yy = zz * xx - zx * xz,
        yz = zx * xy - zy * xx;

    return new Float32Array([
        xx, yx, zx, 0,
        xy, yy, zy, 0,
        xz, yz, zz, 0,
        -(xx * ex + xy * ey + xz * ez),
        -(yx * ex + yy * ey + yz * ez),
        -(zx * ex + zy * ey + zz * ez),
        1
    ]);
}

function createGridLines(size = 20, step = 1) {
    const lines = [];
    for (let i = -size; i <= size; i += step) {
        // Lines parallel to X-axis
        lines.push(-size, 0, i, size, 0, i);
        // Lines parallel to Z-axis
        lines.push(i, 0, -size, i, 0, size);
    }
    return new Float32Array(lines);
}

function identity() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

async function startGame() {
    const {
        canvas, gl, shaderProgram,
        aPosition, aNormal,
        uModelMatrix, uViewMatrix, uProjMatrix,
        uLightDirection, uColor, uForceLight,
        aTexCoord, uUseTexture, uTexture, 
        uSampler, positionBuffer, normalBuffer, 
        texCoordBuffer, vertices, verticesHead, 
        normalsHead, texturesHead
    } = await initWebGL();
    const score = document.getElementById('score');
    const eaten = document.getElementById('eaten');

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

    // Set initial movement speed (interval in milliseconds)
    // let movementSpeed = 350;  // Initial speed

    // New variables to control movement speed
    let movementSpeed = 150; // Snake moves every 150ms
    let movementProgress = 0; // Tracks progress of movement (0 to 1)
    let lastMoveTime = 0;   // Track the last time snake moved

    // Because we want 60 FPS, we need to set the interval to 16.67ms
    // so that we can have 1000ms / 60 FPS = 16.67ms
    let frameRate = 16.67;  // Initial speed

    var movement = setInterval(function () {
        if (!isPaused) render();
    }, frameRate);

    createTileMap();
    placeRocksAndGrass();
    placeLogs();
    placeFood();
    
    // Collecting all rocks from the tileMap
    const rocks = Object.values(tileMap).filter(tile => tile.object === "rock");
    const logs = Object.values(tileMap).filter(tile => tile.object === "log");

    loadGrassTexture(gl, () => {
        render(); // or any other function to run after texture is ready
    });

    loadSnakeTexture(gl, () => {
        render(); // or any other function to run after texture is ready
    }, 5);

    function onPressLeft(e) {
        if (isPaused) return;

        audioService.playSfx("turn");
        facingAngle -= Math.PI / 2;
        targetAngle -= Math.PI / 2;
        isPaused = false;
    }
    
    function onPressRight(e) {
        if (isPaused) return;

        audioService.playSfx("turn");
        facingAngle += Math.PI / 2;
        targetAngle += Math.PI / 2;
        isPaused = false;
    }

    registerKeyListener('left', 'A', 'keydown', onPressLeft);
    registerKeyListener('right', 'D', 'keydown', onPressRight);

    function render() { 
        const currentTime = Date.now();
        const deltaTime = currentTime - lastMoveTime;
    
        // Update movement progress
        movementProgress += deltaTime / movementSpeed;
    
        // Should we move the snake?
        // Check if enough time has passed to move the snake
        if (movementProgress >= 1) {
            // Complete the movement and reset progress
            movementProgress = 0;
            lastMoveTime = currentTime;
    
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
    
            // Move each segment to the corresponding position in the trail
            for (let i = 0; i < snake.length; i++) {
                snake[i].x = positionTrail[i].x;
                snake[i].y = positionTrail[i].y;    
            }
        }

        // Interpolate positions for smooth movement - no need to actually
        // move where our snake is, this is for smooth movement without
        // collision checks messing us up
        const interpolatedSnake = snake.map((segment, index) => {
            if (index === 0) {
                // Interpolate the head position
                const dx = Math.round(Math.cos(facingAngle));
                const dy = Math.round(Math.sin(facingAngle));
                return {
                    x: segment.x + dx * movementProgress,
                    y: segment.y + dy * movementProgress,
                };
            } else {
                // Interpolate based on the trail
                const prev = positionTrail[index - 1];
                const curr = positionTrail[index];
                return {
                    x: curr.x + (prev.x - curr.x) * movementProgress,
                    y: curr.y + (prev.y - curr.y) * movementProgress,
                };
            }
        });
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shaderProgram);
    
        // Smoothly interpolate cameraAngle toward targetAngle
        const turnSpeed = 0.05;
        const angleDiff = targetAngle - cameraAngle;
        cameraAngle += angleDiff * turnSpeed;
    
        // Camera follows from above and behind
        const camOffset = 10;
        const camX = interpolatedSnake[0].x - Math.cos(cameraAngle) * camOffset;
        const camY = 8;
        const camZ = interpolatedSnake[0].y - Math.sin(cameraAngle) * camOffset;
    
        const eye = [camX, camY, camZ];
        const center = [interpolatedSnake[0].x, 0, interpolatedSnake[0].y];
        const up = [0, 1, 0];
    
        const projMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100);
        const viewMatrix = lookAt(eye, center, up);
    
        drawSnake(gl, positionBuffer, normalBuffer, texCoordBuffer,
            aPosition, aNormal, aTexCoord,
            uViewMatrix, uProjMatrix, uModelMatrix,
            uUseTexture, uSampler, uLightDirection, uForceLight,
            projMatrix, viewMatrix,
            interpolatedSnake, // <-- Pass interpolated positions for smooth movement
            vertices, verticesHead, normalsHead, texturesHead,
            facingAngle  // <- Pass the facingAngle to drawSnake
        );
    
        drawTiles(gl, aPosition, aNormal, aTexCoord, uModelMatrix, uUseTexture, uTexture);
        drawRocks(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
        drawLogs(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
        drawGrasses(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
        drawFood(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
    
        // Check for collisions with the snake itself
        for (let i = 1; i < snake.length; i++) {
            if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
                isGameOver = true;
                clearInterval(movement);
                alert("Game Over! You hit yourself.");
                audioService.playSfx("collision");
                return;
            }
        }
        
        // ============================= COLLISION DETECTION ============================= //

        // Check for collisions with logs
        for (let i = 0; i < logs.length; i++) {
            if (snake[0].x == logs[i].x && snake[0].y == logs[i].z) {
                isGameOver = true;
                clearInterval(movement);
                alert("Game Over! You hit a log.");
                audioService.playSfx("collision");
                return;
            }
        }

        // Check for collisions with rocks
        for (let i = 0; i < rocks.length; i++) {
            if (snake[0].x == rocks[i].x && snake[0].y == rocks[i].z) {
                isGameOver = true;
                clearInterval(movement);
                alert("Game Over! You hit a rock.");
                audioService.playSfx("collision");
                return;
            }
        }

        // Check for collisions with the restricted area
        if (snake[0].x < -gridSize || snake[0].x > gridSize ||
            snake[0].y < -gridSize || snake[0].y > gridSize) {
            isGameOver = true;
            clearInterval(movement);
            alert("Game Over! You hit the wall.");
            audioService.playSfx("collision");
            return;
        }

        if (snake[0].x == food.x && snake[0].y == food.z) {
            // Play sound effect
            audioService.playSfx("food");

            // Remove food from the map
            food.x = -1; // Set to an invalid position
            food.z = -1; // Set to an invalid position

            // Add a new segment to the snake
            const newSegment = { x: snake[snake.length - 1].x, y: snake[snake.length - 1].y };
            snake.push(newSegment);

            // Place new food on the map
            placeFood();

            // Update eaten count
            let newEaten = parseInt(eaten.innerHTML) + 1;
            eaten.innerHTML = newEaten;

            // Compute for score - this is kinda unfair, where the more you eat, the less score you get
            let newScore = parseInt(score.innerHTML) + (100 - (newEaten * 10));
            score.innerHTML = newScore;

            // Speed up the game (decrease the movement speed)
            movementSpeed = Math.max(33, movementSpeed - 10);  // Don't go below 33ms
        }

        gl.uniform1f(uForceLight, 0.0); 
    }

}

export default class GameScreen extends Screen {
    constructor() {
        super("pages/snake-game.html");
    }

    onShow() {
        var btnPause = document.getElementById('header-btn-pause');
    
        console.log('onShowGame');
    
        if (btnPause != null) {
            btnPause.addEventListener('click', function () {
                isPaused = true;
                showPauseMenu();
            });
        } else {
            console.error('Error: btnPause is null');
        }
    
        dialogController.setPauseDialogButtons(onResumeGame, onRestartGame, onExitGame);
        startGame();
    }
}


