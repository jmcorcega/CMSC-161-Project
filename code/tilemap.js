import { createApple, createRockGeometry, createGrassGeometry, createLogGeometry, createPlantGeometry, createTreeGeometry } from './models.js';

export const tileSize = 1;
export const gridSize = 30;
export const tileMap = {};

export let grassTexture = null;

export function resetTileMap() {
    for (let key in tileMap) {
        tileMap[key].occupied = false;
        tileMap[key].object = null;
    }
}

// Called in main.js after GL is initialized
export function createTileMap() {
    resetTileMap();  // Clear previous map data
    for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
            const key = `${x},${z}`;

            // initialize values of a tile
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
        // Bind the texture and upload the image data to the GPU
        gl.bindTexture(gl.TEXTURE_2D, grassTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grassImage);

        // Set texture params 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        callback(); // Proceed with rendering once loaded
    };
}


export function drawTiles(gl, aPosition, aNormal, aTexCoord, uModelMatrix, uUseTexture, uTexture) {
    // Enable texture rendering
    gl.uniform1i(uUseTexture, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    gl.uniform1i(uTexture, 0);

    // Define a single tile as a flat square made of two triangles
    const quadVertices = [
        0, 0, 0,
        tileSize, 0, 0,
        tileSize, 0, tileSize,
        0, 0, 0,
        tileSize, 0, tileSize,
        0, 0, tileSize,
    ];

    // Normals pointing straight up
    const quadNormals = new Array(18).fill(0).map((_, i) => (i % 3 === 1 ? 1 : 0)); // Y-up normals

    // Maps the image over the tile
    const quadTexCoords = [
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,
    ];

    // Create and bind vertex buffer
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // Create and bind normal buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    // Create and bind texture coordinate buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadTexCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    for (let key in tileMap) {
        const tile = tileMap[key];
        const modelMatrix = translate(tile.x, 0, tile.z);   // Position the tile
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);  
        gl.drawArrays(gl.TRIANGLES, 0, 6);  // Draw
    }
}

// Helper - simple translation matrix
export function translate(x, y, z) {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ]);
}

// Initialize variables
let trees = [];
let rocks = [];
let logs = [];
let grasses = [];
let bounderyGrasses = []

let grassGeometry = null;
let plantGeometry = null;

export let foods = [];

export function placeTrees() {
    trees = [];    // Ensure trees is initially empty

    const keys = Object.keys(tileMap);
    const offset = 3;   // How far outside the grid edges to place the trees

    // Determine the bounds of the tile map
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const key of keys) {
        const tile = tileMap[key];
        if (tile.x < minX) minX = tile.x;
        if (tile.x > maxX) maxX = tile.x;
        if (tile.z < minZ) minZ = tile.z;
        if (tile.z > maxZ) maxZ = tile.z;
    }

    for (const key in tileMap) {
        const tile = tileMap[key];
        
        const spacing = 2;  // Controls how spaced out the trees are
        const shouldSkip = (tile.x + tile.z) % spacing !== 0;
        if (shouldSkip) continue;

        // Check if the current tile is on the edge of the map
        const isLeft = tile.x === minX;
        const isRight = tile.x === maxX;
        const isTop = tile.z === minZ;
        const isBottom = tile.z === maxZ;

        let place = false;
        let x = tile.x;
        let z = tile.z;

        // Offset tree position outward from the edge
        if (isLeft) { x -= offset; place = true; } 
        else if (isRight) { x += offset; place = true; }

        if (isTop) { z -= offset; place = true; } 
        else if (isBottom) { z += offset; place = true; }

        if (!place) continue;   // Only place trees outside the edges

        // Create the tree
        const { vertices, normals, trunkVertexCount } = createTreeGeometry();

        tile.occupied = true;
        tile.object = "tree";

        trees.push({
            x,
            z,
            y: 0,
            vertices,
            normals,
            trunkVertexCount,
            scale: 8
        });
    }
}

// Places rocks, logs, and grasses randomly across the tile map
export function placeEnvironmentObjects(rockCount = 25, grassCount = Object.keys(tileMap).length / 2, logGroupCount = 3) {
    const keys = Object.keys(tileMap);

    // Clear all previous environment objects
    rocks = [];
    logs = [];
    grasses = [];
    bounderyGrasses = [];

    // Compute map boundaries
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const key of keys) {
        const tile = tileMap[key];
        if (tile.x < minX) minX = tile.x;
        if (tile.x > maxX) maxX = tile.x;
        if (tile.z < minZ) minZ = tile.z;
        if (tile.z > maxZ) maxZ = tile.z;
    }

    // Shuffle tile keys to randomize objects placement
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    // Create grass and plant geometries once to reuse for performance
    if (!grassGeometry) grassGeometry = createGrassGeometry(0.2);
    if (!plantGeometry) plantGeometry = createPlantGeometry();

    // Tracks the count of the placed objects
    let rockPlaced = 0;
    let grassPlaced = 0;
    let logGroupsPlaced = 0;

    const directions = [
        [1, 0],  // +x
        [-1, 0], // -x
        [0, 1],  // +z
        [0, -1], // -z
    ];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const tile = tileMap[key];

        // Skip tiles that are on the edge or already occupied
        if (
            tile.x === minX || tile.x === maxX + 1 ||
            tile.z === minZ || tile.z === maxZ + 1 ||
            tile.occupied
        ) continue;

        // Try to place logs first
        if (logGroupsPlaced < logGroupCount) {
            const length = Math.floor(Math.random() * 3) + 3; // 3 to 5 logs
            const [dx, dz] = directions[Math.floor(Math.random() * directions.length)];
            const group = [];

            let valid = true;
            for (let j = 0; j < length; j++) {
                const tx = tile.x + j * dx;
                const tz = tile.z + j * dz;
                const groupKey = `${tx},${tz}`;
                const groupTile = tileMap[groupKey];
                if (!groupTile || groupTile.occupied) {
                    valid = false;
                    break;
                }
                group.push(groupTile);
            }

            // If all tiles in the group are valid, place a log object on each
            if (valid) {
                const logGeometry = createLogGeometry();
                for (const groupTile of group) {
                    const { vertices, normals, colors } = logGeometry;
                    logs.push({
                        x: groupTile.x,
                        z: groupTile.z,
                        y: 0,
                        vertices,
                        normals,
                        colors,
                    });
                    groupTile.occupied = true;
                    groupTile.object = 'log';
                }
                logGroupsPlaced++;
                continue;   // Skip to next tile after placing a log group
            }
        }

        // Place a rock
        if (rockPlaced < rockCount) {
            const { vertices, normals } = createRockGeometry(Math.random() * 1.5 + 0.5);
            const scale = [0.6, 1.0, 1.2][Math.floor(Math.random() * 3)];   // Vary rock size

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
            continue;
        }

        // Place grass
        if (grassPlaced < grassCount) {
            const isPlant = grassPlaced % 7 === 0;  // Every 7th grass is a plant
            const numBlades = isPlant ? 1 : Math.floor(Math.random() * 3) + 8;

            for (let j = 0; j < numBlades; j++) {
                const geometry = isPlant ? plantGeometry : grassGeometry;

                // Randomize offset for a natural scattered look
                const offsetX = isPlant ? 0 : (Math.random() - 0.5) * 1.0;
                const offsetZ = isPlant ? 0 : (Math.random() - 0.5) * 1.0;

                // Random rotation around the Y-axis
                const rotation = Math.random() * Math.PI * 2;

                grasses.push({
                    vertices: geometry.vertices,
                    normals: geometry.normals,
                    position: [tile.x + offsetX, 0, tile.z + offsetZ],
                    rotation,
                });

                if (isPlant) break;
            }

            grassPlaced++;
        }
    }

    // Place grass on the outer edges
    placeBoundaryGrasses();
}


function placeBoundaryGrasses() {    
    const keys = Object.keys(tileMap);

    // Taller version of grass for border decoration
    const tallGrassGeometry = createGrassGeometry(0.65);
    const boundaryGrassLimit = keys.length / 8;
    let boundaryGrassPlaced = 0;
    
    // Determine bounds of the tile map
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const key of keys) {
        const tile = tileMap[key];
        minX = Math.min(minX, tile.x);
        maxX = Math.max(maxX, tile.x);
        minZ = Math.min(minZ, tile.z);
        maxZ = Math.max(maxZ, tile.z);
    }
    
    // Loop to place grass in margin layers
    for (const key of keys) {
        if (boundaryGrassPlaced >= boundaryGrassLimit) break;
    
        const tile = tileMap[key];
    
        // Check if the tile is at the edge of the grid
        const isLeft = tile.x === minX;
        const isRight = tile.x === maxX;
        const isTop = tile.z === minZ;
        const isBottom = tile.z === maxZ;

        let place = false;
        let x = tile.x;
        let z = tile.z;

        let offset = Math.floor(Math.random() * 3) + 1; // Grass position outside the edges

        // Adjust the coordinates to position the grass outside the grid
        if (isLeft) { x -= (offset+0.3); place = true; } 
        else if (isRight) { x += (offset+1); place = true; }

        if (isTop) { z -= (offset+0.2); place = true; } 
        else if (isBottom) { z += (offset+1); place = true; }

        if (!place) continue;   // Skip tiles that are not on the boundary

        // Every 7th placement is a plant, others are grasses
        const isPlant = boundaryGrassPlaced % 7 === 0;
        const numBlades = isPlant ? 1 : Math.floor(Math.random() * 3) + 5;
    
        // Add either a single plant or tall grass
        for (let j = 0; j < numBlades; j++) {
            const geometry = isPlant ? plantGeometry : tallGrassGeometry;
            
            // Add slight random offsets 
            const offsetX = isPlant ? 0 : (Math.random() - 0.5) * 0.8;
            const offsetZ = isPlant ? 0 : (Math.random() - 0.5) * 0.8;

            // Random rotation
            const rotation = Math.random() * Math.PI * 2;
    
            bounderyGrasses.push({
                vertices: geometry.vertices,
                normals: geometry.normals,
                position: [x + offsetX, 0, z + offsetZ],
                rotation,
            });
    
            if (isPlant) break;
        }
    
        boundaryGrassPlaced++;
    }
}


export function drawTrees(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    gl.uniform1i(uUseTexture, false);
    gl.uniform1f(uForceLight, 0.55);
    gl.uniform3fv(uLightDirection, [0.7, -1.0, 0.3]);

    for (const tree of trees) {
        const { vertices, normals, x, y, z, scale, trunkVertexCount } = tree;

        // Create buffers
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        const normBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormal);

        // Set model matrix
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [x + 0.5, y, z + 0.5]);
        mat4.scale(modelMatrix, modelMatrix, [scale, scale, scale]);
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

        // Draw trunk (brown) 
        gl.uniform3fv(uColor, [0.4, 0.26, 0.13]); // brown
        gl.drawArrays(gl.TRIANGLES, 0, trunkVertexCount);

        // Draw leaves (green) 
        gl.uniform3fv(uColor, [0.2, 0.8, 0.3]); // green
        const totalVertexCount = vertices.length / 3;
        gl.drawArrays(gl.TRIANGLES, trunkVertexCount, totalVertexCount - trunkVertexCount);

        // Clean up
        gl.deleteBuffer(posBuffer);
        gl.deleteBuffer(normBuffer);
    }
}


export function drawRocks(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    gl.uniform1f(uForceLight, 0.35);            // Use actual lighting, don't force full brightness
    gl.uniform1i(uUseTexture, false);           // Rocks do not use textures
    gl.uniform3fv(uColor, [0.70, 0.70, 0.70]);  // Gray rock color
    gl.uniform3fv(uLightDirection, [0.8, -1.0, 0.0]);

    for (let rock of rocks) {
        // Buffer for rock positions
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Buffer for rock normals
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


let posBuffer, normalBuffer;
let tposBuffer, tnormalBuffer; // for tall grass


// Call this function once during initialization
export function initGrassBuffers(gl) {
    // Flatten the grass blade data and put it into the buffers
    const allVertices = [];
    const allNormals = [];
    
    for (let blade of grasses) {
        allVertices.push(...blade.vertices);
        allNormals.push(...blade.normals);
    }

    // Create the position and normal buffers only once
    posBuffer = gl.createBuffer();
    normalBuffer = gl.createBuffer();

    // Fill the position buffer with all grass vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVertices), gl.STATIC_DRAW);

    // Fill the normal buffer with all grass normals
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allNormals), gl.STATIC_DRAW);

    const tallVertices = [];
    const tallNormals = [];

    for (let tblade of bounderyGrasses) {
        tallVertices.push(...tblade.vertices);
        tallNormals.push(...tblade.normals);
    }

    tposBuffer = gl.createBuffer();     // Buffer for tall grass positions
    gl.bindBuffer(gl.ARRAY_BUFFER, tposBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tallVertices), gl.STATIC_DRAW);

    tnormalBuffer = gl.createBuffer();  // Buffer for tall grass normals
    gl.bindBuffer(gl.ARRAY_BUFFER, tnormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tallNormals), gl.STATIC_DRAW);
}


export function drawGrasses(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    gl.uniform1f(uForceLight, 1.0);
    gl.uniform1i(uUseTexture, false);
    gl.uniform3fv(uColor, [0.30, 0.81, 0.24]);
    gl.uniform3fv(uLightDirection, [0.0, -1.0, 0.0]);

    // Bind the position and normal buffers that were created once
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    // Draw each grass blade with different model transformations
    for (let blade of grasses) {
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, blade.position);
        mat4.rotateY(modelMatrix, modelMatrix, blade.rotation);

        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, blade.vertices.length / 3);
    }

    // Bind again for the tall grasses (boundaries)
    gl.bindBuffer(gl.ARRAY_BUFFER, tposBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, tnormalBuffer);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    gl.uniform3fv(uColor, [46/255, 118/255, 35/255]);

    for (let bgrass of bounderyGrasses) {
        // Initialize the model matrix
        const modelMatrix = mat4.create();

        // Apply translates and rotations 
        mat4.translate(modelMatrix, modelMatrix, bgrass.position);
        mat4.rotateY(modelMatrix, modelMatrix, bgrass.rotation);

        // Pass the model matrix to the shader program
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        
        // Render the bgrass
        gl.drawArrays(gl.TRIANGLES, 0, bgrass.vertices.length / 3);
    }
}


export function placeFoods(count) {
    // Ensure that no more than 5 food items are placed
    if (foods.length >= 5) return;

    const keys = Object.keys(tileMap);
    let placed = 0;

    // Define possible food colors
    const colors = [
        [0.8, 0, 0],
        [1, 1, 0.247],
        [0.788, 0.800, 0.247]
    ];

    // Place food items on available tiles
    while (placed < count && keys.length > 0) {
        const index = Math.floor(Math.random() * keys.length);  // Randomly pick a tile key
        const key = keys.splice(index, 1)[0];
        const tile = tileMap[key];

        if (!tile.occupied) {
            const { vertices, normals, indices } = createApple();

            // Define possible sizes
            const sizes = [0.6, 1.0, 1.2]; // Small, Medium, Large
            const scale = 0.3;

            tile.occupied = true;
            tile.object = 'food';

            foods.push({
                color: colors[Math.floor(Math.random() * 3)], // Ensures the index is always within the range 0–2
                x: tile.x,
                z: tile.z,
                vertices,
                normals,
                indices,
                scale,
            });

            placed++;
        }
    }
}


export function drawFoods(gl, aPosition, aNormal, uModelMatrix, uColor, uUseTexture, uForceLight, uLightDirection) {
    // If there are no foods, exit early
    if (!foods || foods.length === 0) return;

    // Create buffers 
    const positionBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    // Apple geometry (assumed shared across all apples) 
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(foods[0].vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(foods[0].normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(foods[0].indices), gl.STATIC_DRAW);

    // Set shared uniform states for light and texture
    gl.uniform1i(uUseTexture, false);
    gl.uniform3fv(uLightDirection, [0.5, 1.0, 0.0]);

    // Render food items
    for (const f of foods) {
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [f.x, 0.6, f.z]);          // Position the food
        mat4.scale(modelMatrix, modelMatrix, [f.scale, f.scale, f.scale]);  // Scale the food

        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        gl.uniform3fv(uColor, f.color);
        gl.uniform1f(uForceLight, 0.4);

        gl.drawElements(gl.TRIANGLES, f.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    // Draw shared trunk geometry 
    const trunkHeight = 0.5;
    const trunkRadius = 0.1;
    const trunkSegments = 8;

    const trunkVertices = [];
    const trunkNormals = [];
    const trunkIndices = [];

    // Generate vertices, normals, and indices for the trunk
    for (let i = 0; i <= trunkSegments; i++) {
        const angle = (i / trunkSegments) * 2 * Math.PI;
        const x = Math.cos(angle) * trunkRadius;
        const z = Math.sin(angle) * trunkRadius;

        trunkVertices.push(x, 1.0, z);
        trunkVertices.push(x, 1.0 + trunkHeight, z);

        trunkNormals.push(0, 1, 0);
        trunkNormals.push(0, 1, 0);
    }

    for (let i = 0; i < trunkSegments; i++) {
        // Generate the indices 
        const base = i * 2;
        trunkIndices.push(base, base + 1, base + 2);
        trunkIndices.push(base + 1, base + 3, base + 2);
    }

    // Bind the trunk buffers and draw the trunk
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trunkVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trunkNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(trunkIndices), gl.STATIC_DRAW);

    gl.uniform3fv(uColor, [0.5, 0, 0.0]); // Trunk color

    // Draw the trunk for each food
    for (const f of foods) {
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [f.x, 0.6, f.z]);
        mat4.scale(modelMatrix, modelMatrix, [f.scale, f.scale, f.scale]);

        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        gl.drawElements(gl.TRIANGLES, trunkIndices.length, gl.UNSIGNED_SHORT, 0);
    }
}

