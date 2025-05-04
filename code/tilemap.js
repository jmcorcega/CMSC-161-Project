import { createApple, createRockGeometry, createGrassGeometry, createLogGeometry, createPlantGeometry } from './models.js';

export const tileSize = 1;
export const gridSize = 20;
export const tileMap = {};

export let grassTexture = null;

// Called in main.js after GL is initialized
export function createTileMap() {
    for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
            const key = `${x},${z}`;
            tileMap[key] = {
                x,
                z,
                occupied: false,
                object: null,
            };
        }
    }
}

export function loadGrassTexture(gl, callback) {
    grassTexture = gl.createTexture();
    const grassImage = new Image();
    grassImage.src = '../img/grass-1.png';

    grassImage.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, grassTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grassImage);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        callback(); // Proceed with rendering once loaded
    };
}

export function drawTiles(gl, aPosition, aNormal, aTexCoord, uModelMatrix, uUseTexture, uTexture) {
    gl.uniform1i(uUseTexture, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    gl.uniform1i(uTexture, 0);

    const quadVertices = [
        0, 0, 0,
        tileSize, 0, 0,
        tileSize, 0, tileSize,
        0, 0, 0,
        tileSize, 0, tileSize,
        0, 0, tileSize,
    ];

    const quadNormals = new Array(18).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)); // Y-up normals

    const quadTexCoords = [
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,
    ];

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadTexCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    for (let key in tileMap) {
        const tile = tileMap[key];
        const modelMatrix = translate(tile.x, 0, tile.z);
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

// Helper: simple translation matrix
export function translate(x, y, z) {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ]);
}


const rocks = [];
const logs = [];
const grasses = [];

let grassGeometry = null;
let plantGeometry = null;

export let food = null;

export function placeRocksAndGrass(rockCount = 20, grassCount = Object.keys(tileMap).length / 8) {
    const keys = Object.keys(tileMap);

    // Compute map boundaries
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const key of keys) {
        const tile = tileMap[key];
        if (tile.x < minX) minX = tile.x;
        if (tile.x > maxX) maxX = tile.x;
        if (tile.z < minZ) minZ = tile.z;
        if (tile.z > maxZ) maxZ = tile.z;
    }

    let rockPlaced = 0;
    let grassPlaced = 0;

    // Shuffle tile keys
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    // Initialize shared geometry
    if (!grassGeometry) grassGeometry = createGrassGeometry();
    if (!plantGeometry) plantGeometry = createPlantGeometry();

    for (let i = 0; i < keys.length; i++) {
        const tile = tileMap[keys[i]];
        // if (tile.occupied) continue;
        
        // avoid spawning at the edges/borders
        if (
            tile.x === minX || tile.x === maxX+1 ||
            tile.z === minZ || tile.z === maxZ+1 ||
            tile.occupied
        ) continue;

        if (rockPlaced < rockCount) {
            const { vertices, normals } = createRockGeometry(Math.random() * 1.5 + 0.5);
            const scale = [0.6, 1.0, 1.2][Math.floor(Math.random() * 3)];

            rocks.push({
                x: tile.x,
                z: tile.z,
                vertices,
                normals,
                scale,
            });

            tile.occupied = true;
            tile.object = 'rock';
            rockPlaced++;
        } else if (grassPlaced < grassCount) {
            const isPlant = grassPlaced % 7 === 0;
            const numBlades = isPlant ? 1 : Math.floor(Math.random() * 3) + 8;

            for (let j = 0; j < numBlades; j++) {
                const geometry = isPlant ? plantGeometry : grassGeometry;

                const offsetX = isPlant ? 0 : (Math.random() - 0.5) * 1.0;
                const offsetZ = isPlant ? 0 : (Math.random() - 0.5) * 1.0;
                const rotation = Math.random() * Math.PI * 2;

                grasses.push({
                    vertices: geometry.vertices,
                    normals: geometry.normals,
                    position: [tile.x + offsetX, 0, tile.z + offsetZ],
                    rotation,
                });

                if (isPlant) break; // only one plant per tile
            }

            grassPlaced++;
        }
    }
}


export function placeLogs(logGroupCount = 2) {
    const keys = Object.keys(tileMap);
    
    // Shuffle tiles
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    let placed = 0;
    const directions = [
        [1, 0],  // +x
        [-1, 0], // -x
        [0, 1],  // +z
        [0, -1], // -z
    ];

    for (let i = 0; i < keys.length && placed < logGroupCount; i++) {
        const startTile = tileMap[keys[i]];
        if (startTile.occupied) continue;

        const length = Math.floor(Math.random() * 3) + 3; // 3–6 logs
        const [dx, dz] = directions[Math.floor(Math.random() * directions.length)];

        const group = [];

        let valid = true;
        for (let j = 0; j < length; j++) {
            const tx = startTile.x + j * dx;
            const tz = startTile.z + j * dz;
            const key = `${tx},${tz}`;
            const tile = tileMap[key];
            if (!tile || tile.occupied) {
                valid = false;
                break;
            }
            group.push(tile);
        }

        if (!valid) continue;

        let logGeometry = createLogGeometry();

        for (const tile of group) {
            const { vertices, normals, colors } = logGeometry;
            logs.push({
                x: tile.x,
                z: tile.z,
                y: 0,
                vertices,
                normals,
                colors,
            });
            tile.occupied = true;
            tile.object = 'log';
        }

        placed++;
    }
}


export function drawRocks(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    gl.uniform1f(uForceLight, 0.35); // Use actual lighting, don't force full brightness
    gl.uniform1i(uUseTexture, false); 
    gl.uniform3fv(uColor, [0.70, 0.70, 0.70]); // Gray rock base color
    gl.uniform3fv(uLightDirection, [0.8, -1.0, 0.0]);

    for (let rock of rocks) {
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock.normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormal);

        // Apply scaling and translation
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [rock.x, 0, rock.z]);
        mat4.scale(modelMatrix, modelMatrix, [rock.scale, rock.scale, rock.scale]);

        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, rock.vertices.length / 3);
    }
}

export function drawLogs(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    gl.uniform1f(uForceLight, 0.6);
    gl.uniform1i(uUseTexture, false);
    gl.uniform3fv(uLightDirection, [0.0, -1.0, 0.0]);

    for (const log of logs) {
        const { vertices, normals, colors, x, y = 0, z } = log;

        // Color is handled via per-vertex color, so set dummy uniform
        gl.uniform3fv(uColor, [0.4, 0.25, 0.1]);

        // Create and bind position buffer
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Create and bind normal buffer
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormal);

        // Set uniforms
        gl.uniform1i(uUseTexture, 0); // no texture
        gl.uniform1i(uForceLight, 0); // use lighting
        gl.uniform3fv(uLightDirection, [0.5, 1, 0.5]); // arbitrary light direction

        // Model transform
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [x, y, z]);
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

        // Cleanup
        gl.deleteBuffer(posBuffer);
        gl.deleteBuffer(normalBuffer);
    }
}


export function drawGrasses(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    gl.uniform1f(uForceLight, 1.0);
    gl.uniform1i(uUseTexture, false);
    gl.uniform3fv(uColor, [0.30, 0.81, 0.24]);
    // gl.uniform3fv(uColor, [0.34, 0.77, 0.28]);

    gl.uniform3fv(uLightDirection, [0.0, -1.0, 0.0]);

    for (let blade of grasses) {
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blade.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blade.normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormal);

        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, blade.position);
        mat4.rotateY(modelMatrix, modelMatrix, blade.rotation);

        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, blade.vertices.length / 3);
    }
}


export function placeFood(count = 1) {
    const keys = Object.keys(tileMap);
    let placed = 0;

    while (placed < count && keys.length > 0) {
        const index = Math.floor(Math.random() * keys.length);
        const key = keys.splice(index, 1)[0];
        const tile = tileMap[key];

        if (!tile.occupied) {
            const { vertices, normals, indices } = createApple();

            const sizes = [0.6, 1.0, 1.2]; // Small, Medium, Large
            const scale = 0.3;

            tile.occupied = true;
            tile.object = 'food';

            food = {
                x: tile.x,
                z: tile.z,
                vertices,
                normals,
                indices,
                scale,
            };

            placed++;
        }
    }
}


export function drawFood(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    if (!food) return;

    // Create buffers
    const positionBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    // === Draw Apple ===
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(food.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(food.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(food.indices), gl.STATIC_DRAW);

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [food.x, 0.6, food.z]);
    mat4.scale(modelMatrix, modelMatrix, [food.scale, food.scale, food.scale]);
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

    const colors = [[0.8, 0, 0], [1, 1, 0.247], [0.788, 0.800, 0.247]];
    const colorIndex = Math.floor(Math.random() * colors.length);
    gl.uniform1f(uForceLight, 0.4);
    gl.uniform1i(uUseTexture, false);
    gl.uniform3fv(uColor, colors[colorIndex]);
    gl.uniform3fv(uLightDirection, [0.5, 1.0, 0.0]);

    gl.drawElements(gl.TRIANGLES, food.indices.length, gl.UNSIGNED_SHORT, 0);

    // === Draw Green Trunk ===
    const trunkHeight = 0.5;
    const trunkRadius = 0.1;
    const trunkSegments = 8;

    const trunkVertices = [];
    const trunkNormals = [];
    const trunkIndices = [];

    // Top of apple is y = 1 after scaling
    for (let i = 0; i <= trunkSegments; i++) {
        const angle = (i / trunkSegments) * 2 * Math.PI;
        const x = Math.cos(angle) * trunkRadius;
        const z = Math.sin(angle) * trunkRadius;

        trunkVertices.push(x, 1.0, z);                  // base (attached to apple top)
        trunkVertices.push(x, 1.0 + trunkHeight, z);    // top

        trunkNormals.push(0, 1, 0);
        trunkNormals.push(0, 1, 0);
    }

    for (let i = 0; i < trunkSegments; i++) {
        const base = i * 2;
        trunkIndices.push(base, base + 1, base + 2);
        trunkIndices.push(base + 1, base + 3, base + 2);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trunkVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trunkNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(trunkIndices), gl.STATIC_DRAW);

    // Apply same transformation
    gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
    gl.uniform3fv(uColor, [0.5, 0, 0.0]); // green trunk

    gl.drawElements(gl.TRIANGLES, trunkIndices.length, gl.UNSIGNED_SHORT, 0);
}

