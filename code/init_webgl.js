import { createSnakeBody, createSnakeHeadWithFeatures } from "./models.js";

async function loadShaderSource(url) {
    const response = await fetch(url);
    return await response.text();
}

function initShaderProgram(gl, vsSource, fsSource) {
    const v = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(v, vsSource);
    gl.compileShader(v);

    const f = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(f, fsSource);
    gl.compileShader(f);

    const program = gl.createProgram();
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    gl.linkProgram(program);
    return program;
}

export async function destroyWebGL(gl) {
    // Delete the shader program
    gl.deleteProgram(gl.shaderProgram);

    // Delete all buffers
    gl.deleteBuffer(gl.positionBuffer);
    gl.deleteBuffer(gl.normalBuffer);
    gl.deleteBuffer(gl.texCoordBuffer);
    
    // Reset WebGL state - reduces memory leaks
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.useProgram(null);
    
    // Don't remove the canvas, just clear it
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        const width = canvas.width;
        const height = canvas.height;
        canvas.width = width;  // This clears the canvas
    }
}

export async function initWebGL() {
    // Initialize WebGL
    const canvas = document.getElementById('game-canvas');
    const gl = canvas.getContext('webgl2');

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
    const uSampler = gl.getUniformLocation(shaderProgram, 'uSampler')

    // Create buffers for the cube and grid
    const {
        vertices: verticesHead,
        normals: normalsHead,
        textures: texturesHead
    } = createSnakeHeadWithFeatures();

    const { vertices, normals, textures } = createSnakeBody(0.3, 1);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);
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
        uSampler,
        positionBuffer,
        normalBuffer,
        texCoordBuffer,
        vertices,
        textures,
        verticesHead, 
        normalsHead, 
        texturesHead
    };
}
