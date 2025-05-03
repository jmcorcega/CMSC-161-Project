import { createRockGeometry } from './models.js';

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
    grassImage.src = '../img/grass.png';

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

export function drawGrassTiles(gl, aPosition, aNormal, aTexCoord, uModelMatrix, uUseTexture, uTexture) {
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

export const rocks = [];

export function placeRocks(count = 20) {
    const keys = Object.keys(tileMap);
    let placed = 0;

    while (placed < count && keys.length > 0) {
        const index = Math.floor(Math.random() * keys.length);
        const key = keys.splice(index, 1)[0];
        const tile = tileMap[key];

        if (!tile.occupied) {
            const { vertices, normals } = createRockGeometry(Math.random() * 1.5 + 0.5);

            const sizes = [0.6, 1.0, 1.2]; // Small, Medium, Large
            const scale = sizes[Math.floor(Math.random() * sizes.length)];

            tile.occupied = true;
            tile.object = 'rock';

            rocks.push({
                x: tile.x,
                z: tile.z,
                vertices,
                normals,
                scale,
            });

            placed++;
        }
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
