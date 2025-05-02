async function loadShaderSource(url) {
    const response = await fetch(url);
    return await response.text();
}

export async function initWebGL() {
    // Initialize WebGL
    const canvas = document.getElementById('gameCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL not supported');
        return;
    }

    // Enable depth and set clear color (sky will be out of view)
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.6, 0.9, 0.6, 1); // ground green

    // Load shader sources
    const vertexShaderSource = await loadShaderSource('../shaders/vertex-shader.glsl');
    const fragmentShaderSource = await loadShaderSource('../shaders/fragment-shader.glsl');

    // Initialize shader program
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

    // Get attribute and uniform locations
    const aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
    const aNormal = gl.getAttribLocation(shaderProgram, 'aNormal');
    const uModelMatrix = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
    const uViewMatrix = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
    const uProjMatrix = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
    const uLightDirection = gl.getUniformLocation(shaderProgram, 'uLightDirection');
    const uColor = gl.getUniformLocation(shaderProgram, 'uColor');
    const uForceLight = gl.getUniformLocation(shaderProgram, 'uForceLight');
    const aTexCoord = gl.getAttribLocation(shaderProgram, 'aTexCoord');
    const uUseTexture = gl.getUniformLocation(shaderProgram, 'uUseTexture');
    const uTexture = gl.getUniformLocation(shaderProgram, 'uTexture');

    // Create buffers for the cube and grid
    const { vertices, normals } = createCube();
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // Return all necessary WebGL objects
    return {
        canvas,
        gl,
        shaderProgram,
        aPosition,
        aNormal,
        uModelMatrix,
        uViewMatrix,
        uProjMatrix,
        uLightDirection,
        uColor,
        uForceLight,
        aTexCoord,
        uUseTexture,
        uTexture,
        positionBuffer,
        normalBuffer,
        vertices
    };
}
