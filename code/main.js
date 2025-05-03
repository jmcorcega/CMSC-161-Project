import { createTileMap, loadGrassTexture, drawGrassTiles, tileMap, placeRocks, drawRocks } from './tilemap.js';
import { initWebGL } from './init_webgl.js';  // Import the initWebGL function

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
        positionBuffer, normalBuffer, vertices
    } = await initWebGL();

    // Snake with cube segments 
    const snake = [
        { x: 0.5, y: 0.5 },    // head
        { x: -0.5, y: 0.5 },   // body 
        { x: -1.5, y: 0.5 },   
        { x: -2.5, y: 0.5 },   
        { x: -3.5, y: 0.5 },   
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

        gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
        gl.uniformMatrix4fv(uProjMatrix, false, projMatrix);
        gl.uniform3fv(uLightDirection, [0.5, 1.0, 0.5]);

        // Bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormal);

        // For untextured snake
        gl.uniform1i(uUseTexture, false);
        gl.uniform3fv(uColor, [1.0, 0.5, 0.2]);


        // Draw snake
        gl.uniform3fv(uColor, [1.0, 0.5, 0.2]); // orange for snake
        for (let segment of snake) {
            const modelMatrix = translate(segment.x, 0.5, segment.y);
            gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
        }

        drawGrassTiles(gl, aPosition, aNormal, aTexCoord, uModelMatrix, uUseTexture, uTexture);
        drawRocks(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture);

        // // Draw grid
        // gl.uniform3fv(uColor, [1.0, 1.0, 1.0]);
        // gl.uniform1f(uForceLight, 0.9); 
        // gl.uniformMatrix4fv(uModelMatrix, false, identity());
        // gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
        // gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(aPosition);
        // gl.disableVertexAttribArray(aNormal); // grid has no normals
        // gl.drawArrays(gl.LINES, 0, gridLines.length / 3);

        gl.uniform1f(uForceLight, 0.0); 
    }

}

