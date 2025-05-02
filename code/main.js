
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

function startGame() {
    const canvas = document.getElementById('gameCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL not supported');
        return;
    }

    // Enable depth and set clear color (sky will be out of view)
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.6, 0.9, 0.6, 1); // ground green

    const vertexShaderSource = `
        attribute vec4 aPosition;
        attribute vec3 aNormal;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjMatrix;
        uniform vec3 uLightDirection;

        varying float vLight;

        attribute vec2 aTexCoord;
        varying vec2 vTexCoord;

        void main() {
            vec3 normal = mat3(uModelMatrix) * aNormal;

            float ambient = 0.3;
            float diffuse = max(dot(normal, normalize(uLightDirection)), 0.0);
            vLight = ambient + diffuse;

            gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
            vTexCoord = aTexCoord;
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        uniform vec3 uColor;
        uniform float uForceLight; // override lighting
        varying float vLight;
        uniform sampler2D uSampler;
        uniform float uUseTexture; // 1.0 to use texture, 0.0 to use color
        varying vec2 vTexCoord;

        void main() {
            float light = mix(vLight, 1.0, uForceLight);
            vec4 texColor = texture2D(uSampler, vTexCoord);

            vec3 finalColor = mix(uColor, texColor.rgb, uUseTexture);
            float finalAlpha = mix(1.0, texColor.a, uUseTexture);

            gl_FragColor = vec4(finalColor * light, finalAlpha);
        }
    `;

    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
    const aNormal = gl.getAttribLocation(shaderProgram, 'aNormal');
    const aTexCoord = gl.getAttribLocation(shaderProgram, 'aTexCoord');
    const uModelMatrix = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
    const uViewMatrix = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
    const uProjMatrix = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
    const uUseTexture = gl.getUniformLocation(shaderProgram, 'uUseTexture');
    const uLightDirection = gl.getUniformLocation(shaderProgram, 'uLightDirection');
    const uColor = gl.getUniformLocation(shaderProgram, 'uColor');
    const uForceLight = gl.getUniformLocation(shaderProgram, 'uForceLight');

    const { vertices, normals, textures } = createCube();

    // initialize texture
    const texture = gl.createTexture();
    const image = new Image();
    image.src = './img/skins/skin-1.png';
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Upload image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // NPOT-safe settings
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);

    // Create grid buffer
    const gridLines = createGridLines();
    const gridBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, gridLines, gl.STATIC_DRAW);

    // Snake with 4 segments (head + 3 body)
    const snake = [
        { x: 0.5, y: 0.5 },    // head
        { x: -0.5, y: 0.5 },   // body 1
        { x: -1.5, y: 0.5 },   // body 2
        { x: -2.5, y: 0.5 },   // body 3
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
       
    var movement = setInterval(function () {
        if (!isPaused) render();
        if (isGameOver) clearInterval(movement);
    }, 350);

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
    
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aTexCoord);
    
        // Draw snake (with texture)
        gl.uniform3fv(uColor, [1.0, 0.5, 0.2]); // orange for snake
    
        // Bind texture only for the snake
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0);
    
        // Optional: Apply lighting to the snake
        gl.uniform1f(uForceLight, 0.4); 
        gl.uniform1f(uUseTexture, 1.0);
        // Draw each snake segment
        for (let segment of snake) {
            const modelMatrix = translate(segment.x, 0.5, segment.y);
            gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
        }
    
        // Draw grid with white color (ensure lighting and texture are disabled)
        gl.uniform3fv(uColor, [1.0, 1.0, 1.0]); // Set white color for the grid
        gl.uniform1f(uForceLight, 0.0); // Disable lighting for the grid
        gl.uniform1f(uUseTexture, 0.0); // Ensure texture is not applied

        // Apply identity matrix (no transformation) for grid
        gl.uniformMatrix4fv(uModelMatrix, false, identity());

        // Bind the grid buffer and render the grid lines
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Disable normal attribute (no normals for grid)
        gl.disableVertexAttribArray(aNormal);

        // Draw the grid
        gl.drawArrays(gl.LINES, 0, gridLines.length / 3);
    }

    render();
}

