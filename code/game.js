import Screen from './screen.js';
import TitleScreen from './title.js';
import DialogController from '../lib/dialog.js';

import { initWebGL, destroyWebGL } from './init_webgl.js';
import { drawSnake, loadSnakeTexture } from './snake-map.js';
import { registerKeyListener, unregisterKeyListener } from '../lib/key_listener.js';
import { audioService, storageService, } from '../lib/classes.js';

import { createTileMap, loadGrassTexture, initGrassBuffers, tileMap, 
         placeTrees, placeEnvironmentObjects, placeFoods,
         drawTiles, drawRocks, drawLogs, drawGrasses, drawFoods, drawTrees,
         gridSize, foods 
} from './tilemap.js';


const dialogController = new DialogController();

let isPaused = false;
let isGameOver = false;
let isGameFinished = false;
let isWebGLReady = false;
let endLevelMessage = "";
let glContext = null;
let gameLoopInterval = null;


// Functions for handling skin selection
export const skins = [
    { id: "stars", name: "Stars", img: "img/skins/skin-1.png" },
    { id: "floral", name: "Flowers", img: "img/skins/skin-2.png" },
    { id: "gradient", name: "Neo", img: "img/skins/skin-3.png" },
    { id: "galaxy", name: "Milky Way", img: "img/skins/skin-4.png" },
    { id: "classic", name: "Classic", img: "img/skins/skin-5.png" },
    { id: "scales", name: "Realistic", img: "img/skins/skin-6.jpg" },
    { id: "pines", name: "Pines", img: "img/skins/skin-7.jpg" },
]


export function getCurrentSkin() {
    const skin = storageService.getConfig("snake-skin");
    if (skin == null) {
        return skins[4]; // Default to the classic skin
    } else {
        return skins.find(s => s.id === skin);
    }
}


export function getCurrentSkinIdx() {
    const skin = storageService.getConfig("snake-skin");
    if (skin == null) {
        return 4; // Default to the classic skin
    } else {
        return skins.findIndex(s => s.id === skin);
    }
}


export function setCurrentSkin(skin) {
    const skinId = skin.id;
    storageService.setConfig("snake-skin", skinId);
}


function showPauseMenu() {
    dialogController.showDialog(2);
}


function closePauseMenu() {
    dialogController.closeDialog(2);
}


function onGameOver() {
    audioService.stopBgm();
    setTimeout(() => {
        isGameOver = true;
        audioService.playSfx("lose");
        dialogController.setEndLevelMessage(endLevelMessage, "/img/coin_06.png", true, false);
        dialogController.showDialog(3);
    }, 3000);
}


function onResumeGame() {
    closePauseMenu();

    // Wait a bit before resuming the game
    // This is to prevent the game from resuming immediately
    setTimeout(() => {
        isPaused = false;
        audioService.playBgm(true);
    }, 1000);
}


function onRestartGame() {
    dialogController.closeDialog(2);
    dialogController.closeDialog(3);
    __onExitGame();

    audioService.stopBgm();
    audioService.playSfx("close");
    new GameScreen().loadScreen();
}


function __onExitGame() {
    isGameFinished = true;
    unregisterKeyListener("left");
    unregisterKeyListener("right");
    unregisterKeyListener("escape");

    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }

    if (glContext != null) {
        destroyWebGL(glContext);
        glContext = null;
    }
}


function onExitGame() {
    dialogController.closeDialog(2);
    dialogController.closeDialog(3);
    __onExitGame();
    audioService.stopBgm();
    audioService.playSfx("close");
    new TitleScreen().loadScreen();
}


// Creates a perspective projection matrix based on field of view, 
// aspect ratio, near and far clipping planes
function perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan((fov * Math.PI) / 360);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
    ]);
}


// Creates a view matrix that positions the camera in the scene
function lookAt(eye, center, up) {
    const [ex, ey, ez] = eye;       // Camera position
    const [cx, cy, cz] = center;    // Target point the camera is looking at
    const [ux, uy, uz] = up;        // Up direction

    // Compute forward (z) vector
    let zx = ex - cx,
        zy = ey - cy,
        zz = ez - cz;
    const zl = Math.hypot(zx, zy, zz);
    zx /= zl; zy /= zl; zz /= zl;

    // Compute right (x) vector
    let xx = uy * zz - uz * zy,
        xy = uz * zx - ux * zz,
        xz = ux * zy - uy * zx;
    const xl = Math.hypot(xx, xy, xz);
    xx /= xl; xy /= xl; xz /= xl;

    // Compute true up (y) vector
    let yx = zy * xz - zz * xy,
        yy = zz * xx - zx * xz,
        yz = zx * xy - zy * xx;

    // Return combined rotation and translation
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


async function startGame() {
    const {
        canvas, gl, shaderProgram,
        aPosition, aNormal,
        uModelMatrix, uViewMatrix, uProjMatrix,
        uLightDirection, uColor, uForceLight,
        aTexCoord, uUseTexture, uTexture, 
        uSampler, positionBuffer, normalBuffer, 
        texCoordBuffer, vertices, normals, textures,
        verticesHead, normalsHead, texturesHead, textureLengthsHead
    } = await initWebGL();

    glContext = gl;
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

    // New variables to control movement speed
    let movementSpeed = 150; // Snake moves every 150ms
    let movementProgress = 0; // Tracks progress of movement (0 to 1)
    let lastMoveTime = 0;   // Track the last time snake moved

    // Because we want 60 FPS, we need to set the interval to 16.67ms
    // so that we can have 1000ms / 60 FPS = 16.67ms
    let frameRate = 16.67;  // Initial speed

    // Clear any existing interval first
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }
    
    gameLoopInterval = setInterval(function () {
        if (!isPaused) render();
        if (isGameOver) {
            isGameFinished = true;
            onGameOver();
        }
        if (isGameFinished) {
            clearInterval(gameLoopInterval);
        }
    }, frameRate);

    createTileMap();
    placeFoods(5);  // place 5 initial foods in the map
    placeTrees();
    placeEnvironmentObjects();
    
    // Collecting all rocks from the tileMap
    const rocks = Object.values(tileMap).filter(tile => tile.object === "rock");
    const logs = Object.values(tileMap).filter(tile => tile.object === "log");

    loadGrassTexture(gl, () => {
        render(); // or any other function to run after texture is ready
    });

    loadSnakeTexture(gl, () => {
        render(); // or any other function to run after texture is ready
    }, getCurrentSkin().img);

    // left turn - rotate the character 90 degrees to the left
    function onPressLeft(e) {
        if (isPaused) return;
        if (isGameFinished) return;
        if (isGameOver) return;

        audioService.playSfx("turn");
        facingAngle -= Math.PI / 2;
        targetAngle -= Math.PI / 2;
    }
    
    // right turn - rotate the character 90 degrees to the right
    function onPressRight(e) {
        if (isPaused) return;
        if (isGameFinished) return;
        if (isGameOver) return;

        audioService.playSfx("turn");
        facingAngle += Math.PI / 2;
        targetAngle += Math.PI / 2;
    }

    // pause the game and show the pause menu
    function onPressEscape(e) {
        if (isPaused) return;
        if (isGameFinished) return;
        if (isGameOver) return;

        isPaused = true;
        audioService.pauseBgm();
        showPauseMenu();
    }

    registerKeyListener('left', 'A', 'keydown', onPressLeft);
    registerKeyListener('right', 'D', 'keydown', onPressRight);
    registerKeyListener('escape', 'Escape', 'keydown', onPressEscape);

    initGrassBuffers(gl);

    function render() { 
        const currentTime = Date.now();
        const deltaTime = currentTime - lastMoveTime;
        lastMoveTime = currentTime; 

        // Update movement progress
        movementProgress += deltaTime / movementSpeed;
    
        // Should we move the snake?
        // Check if enough time has passed to move the snake
        if (movementProgress >= 1) {
            // Complete the movement and reset progress
            movementProgress = 0;
            // lastMoveTime = currentTime;
    
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
    
        // Define camera position, the point to look at, and the up direction
        const eye = [camX, camY, camZ];
        const center = [interpolatedSnake[0].x, 0, interpolatedSnake[0].y];
        const up = [0, 1, 0];
    
        const projMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100);
        const viewMatrix = lookAt(eye, center, up);
    
        // Draw the snake using interpolated positions
        drawSnake(gl, positionBuffer, normalBuffer, texCoordBuffer,
            aPosition, aNormal, aTexCoord,
            uViewMatrix, uProjMatrix, uModelMatrix,
            uColor, uUseTexture, uSampler, uLightDirection, uForceLight,
            projMatrix, viewMatrix,
            interpolatedSnake, // <-- Pass interpolated positions for smooth movement
            vertices, normals, textures,
            verticesHead, normalsHead, texturesHead, textureLengthsHead, 
            facingAngle  // <- Pass the facingAngle to drawSnake
        );

        // Draw the environment elements
        drawTiles(gl, aPosition, aNormal, aTexCoord, uModelMatrix, uUseTexture, uTexture);
        drawTrees(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
        drawRocks(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
        drawLogs(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
        drawGrasses(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
        drawFoods(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection);
    
        // ============================= COLLISION DETECTION ============================= //

        // Check for collisions with the snake itself
        for (let i = 1; i < snake.length; i++) {
            if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
                isGameOver = true;
                audioService.playSfx("collision");
                endLevelMessage = "You hit yourself!";
                return;
            }
        }
        
        // Check for collisions with logs
        for (let i = 0; i < logs.length; i++) {
            if (snake[0].x == logs[i].x && snake[0].y == logs[i].z) {
                isGameOver = true;
                audioService.playSfx("collision");
                endLevelMessage = "You hit a log!";
                return;
            }
        }

        // Check for collisions with rocks
        for (let i = 0; i < rocks.length; i++) {
            if (snake[0].x == rocks[i].x && snake[0].y == rocks[i].z) {
                isGameOver = true;
                audioService.playSfx("collision");
                endLevelMessage = "You hit a rock!";
                return;
            }
        }

        // Check for collisions with the restricted area
        if (snake[0].x < -gridSize || snake[0].x > gridSize ||
            snake[0].y < -gridSize || snake[0].y > gridSize) {
            isGameOver = true;
            audioService.playSfx("collision");
            endLevelMessage = "You hit the wall!";
            return;
        }

        // Check for food collisions and update game state
        for (let i = 0; i < foods.length; i++) {
            const f = foods[i];
        
            if (snake[0].x === f.x && snake[0].y === f.z) {
                // Play sound effect
                audioService.playSfx("food");
        
                // Remove eaten food
                foods.splice(i, 1); // Remove from array
        
                // Add a new segment to the snake
                const last = snake[snake.length - 1];
                snake.push({ x: last.x, y: last.y });
        
                placeFoods(1); // push a new item into `foods`
        
                // Update eaten count
                let newEaten = parseInt(eaten.innerHTML) + 1;
                eaten.innerHTML = newEaten;
        
                // Update score
                let newScore = parseInt(score.innerHTML) + (newEaten * 10);
                score.innerHTML = newScore;
        
                // Speed up game (min 33ms delay)
                movementSpeed = Math.max(33, movementSpeed - 5);
            }
        }
        
        // Reset lighting override
        gl.uniform1f(uForceLight, 0.0); 
    }

    // Render ONCE.
    render();
}

export default class GameScreen extends Screen {
    constructor() {
        super("pages/snake-game.html");
    }

    reset() {
        if (gameLoopInterval) {
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
        
        isPaused = false;
        isGameOver = false;
        isGameFinished = false;
        isWebGLReady = false;
        endLevelMessage = "";
        
        if (glContext != null) {
            destroyWebGL(glContext);
            glContext = null;
        }
    }

    onLoading() {
        audioService.preloadBgm("bgm/game.mp3");
    }

    onShow() {
        // Reset first to clean up any previous game state
        this.reset();

        var btnPause = document.getElementById('header-btn-pause');
        btnPause.addEventListener('click', function () {
            isPaused = true;
            audioService.pauseBgm();
            showPauseMenu();
        });
    
        dialogController.setPauseDialogButtons(onResumeGame, onRestartGame, onExitGame);
        dialogController.setEndLevelDialogButtons(onRestartGame, onExitGame);

        startGame();
        isPaused = true;
        isGameFinished = false;
    }

    onAfterShow() {
        isPaused = false;
        audioService.playBgm(true);
    }
}


