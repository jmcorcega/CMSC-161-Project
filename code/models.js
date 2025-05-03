export function createRockGeometry() {
    const vertices = [];
    const normals = [];

    const getRandom = (min, max) => Math.random() * (max - min) + min;
    const subdivisions = 8;

    const topRing = [];
    const bottomRing = [];

    for (let i = 0; i < subdivisions; i++) {
        const angle = (Math.PI * 2 * i) / subdivisions;
        const baseRadius = getRandom(0.4, 0.5);

        const x = Math.cos(angle) * baseRadius;
        const z = Math.sin(angle) * baseRadius;

        topRing.push([x, getRandom(0.2, 0.3), z]);
        bottomRing.push([x, -getRandom(0.0, 0.1), z]);
    }

    const topCenter = [0, getRandom(0.3, 0.4), 0];
    const bottomCenter = [0, -0.1, 0];

    for (let i = 0; i < subdivisions; i++) {
        const next = (i + 1) % subdivisions;

        const t1 = topRing[i];
        const t2 = topRing[next];
        const b1 = bottomRing[i];
        const b2 = bottomRing[next];

        if (t1 == undefined || t2 == undefined || b1 == undefined || b2 == undefined) {
            return { vertices, normals }; 
        }

        // Top cap triangle
        vertices.push(...topCenter, ...t1, ...t2);
        const n1 = computeNormal(topCenter, t1, t2);
        normals.push(...n1, ...n1, ...n1);

        // Side walls (two triangles per segment)
        vertices.push(...t1, ...b1, ...b2);
        const n2 = computeNormal(t1, b1, b2);
        normals.push(...n2, ...n2, ...n2);

        vertices.push(...t1, ...b2, ...t2);
        const n3 = computeNormal(t1, b2, t2);
        normals.push(...n3, ...n3, ...n3);

        // Bottom cap triangle
        vertices.push(...bottomCenter, ...b2, ...b1);
        const n4 = computeNormal(bottomCenter, b2, b1);
        normals.push(...n4, ...n4, ...n4);
    }

    return { vertices, normals };
}

function computeNormal(p1, p2, p3) {
    const u = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    const nx = u[1] * v[2] - u[2] * v[1];
    const ny = u[2] * v[0] - u[0] * v[2];
    const nz = u[0] * v[1] - u[1] * v[0];
    const len = Math.hypot(nx, ny, nz);
    return [nx / len, ny / len, nz / len];
}


export function createSnakeBody(height) {
    const v = [
        -0.5, -height,  0.5,  // front face
         0.5, -height,  0.5,
         0.5,  height,  0.5,
        -0.5,  height,  0.5,
    
        -0.5, -height, -0.5,  // back face
        -0.5,  height, -0.5,
         0.5,  height, -0.5,
         0.5, -height, -0.5,
    
        -0.5,  height, -0.5,  // top
        -0.5,  height,  0.5,
         0.5,  height,  0.5,
         0.5,  height, -0.5,
    
        -0.5, -height, -0.5,  // bottom
         0.5, -height, -0.5,
         0.5, -height,  0.5,
        -0.5, -height,  0.5,
    
         0.5, -height, -0.5,  // right
         0.5,  height, -0.5,
         0.5,  height,  0.5,
         0.5, -height,  0.5,
    
        -0.5, -height, -0.5,  // left
        -0.5, -height,  0.5,
        -0.5,  height,  0.5,
        -0.5,  height, -0.5,
    ];
    
  
    const n = [
        // normals for each face
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
       -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ];
  
    const t = [
      // Front face
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    
      // Back face
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    
      // Top face
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    
      // Bottom face
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    
      // Right face
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    
      // Left face
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ];
  
    // Indices to triangles (optional — using drawArrays with ordered vertices)
    const orderedVerts = [
        0, 1, 2, 0, 2, 3,       // front
        4, 5, 6, 4, 6, 7,       // back
        8, 9,10, 8,10,11,       // top
       12,13,14,12,14,15,       // bottom
       16,17,18,16,18,19,       // right
       20,21,22,20,22,23        // left
    ];
  
    const finalVerts = [];
    const finalNormals = [];
    const finalTexCoords = [];
    for (let i = 0; i < orderedVerts.length; i++) {
        let vi = orderedVerts[i];
        finalVerts.push(v[vi * 3], v[vi * 3 + 1], v[vi * 3 + 2]);
        finalNormals.push(n[vi * 3], n[vi * 3 + 1], n[vi * 3 + 2]);
        finalTexCoords.push(t[vi * 2], t[vi * 2 + 1]);
    }
  
    return { vertices: finalVerts, normals: finalNormals, textures: finalTexCoords };
}

function createEye(radius, latBands, longBands, height, center) {
    const vertices = [];
    const normals = [];
    const uvs = [];

    // Iterate over the latitude and longitude bands to create vertices
    for (let lat = 0; lat <= latBands; ++lat) {
        const theta = lat * Math.PI / latBands; // latitude angle
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longBands; ++lon) {
            const phi = lon * 2 * Math.PI / longBands; // longitude angle
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            // Apply radius for the spherical part, and stretch along the Y axis
            const x = radius * cosPhi * sinTheta;
            const y = height * (cosTheta - 0.5); // Elongate along Y-axis, shift to center
            const z = radius * sinPhi * sinTheta;

            // Add vertex with adjustment for center
            vertices.push(center[0] + x, center[1] + y, center[2] + z);
            normals.push(x, y, z); // Normal for lighting
            uvs.push(lon / longBands, lat / latBands); // UV mapping for texture
        }
    }

    // Create indices for triangles that form the surface of the capsule
    const indices = [];
    for (let lat = 0; lat < latBands; ++lat) {
        for (let lon = 0; lon < longBands; ++lon) {
            const first = (lat * (longBands + 1)) + lon;
            const second = first + longBands + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    // Organize final vertices, normals, and UVs using the indices
    const finalVertices = [], finalNormals = [], finalUVs = [];
    for (let i = 0; i < indices.length; i++) {
        const vi = indices[i];
        finalVertices.push(vertices[vi * 3], vertices[vi * 3 + 1], vertices[vi * 3 + 2]);
        finalNormals.push(normals[vi * 3], normals[vi * 3 + 1], normals[vi * 3 + 2]);
        finalUVs.push(uvs[vi * 2], uvs[vi * 2 + 1]);
    }

    return {
        vertices: finalVertices,
        normals: finalNormals,
        textures: finalUVs
    };
}


export function createTruckHead(height) {
    // Define the vertices for a trapezoidal head shape (like a truck front)
    const v = [
        // Side face
        -0.6, -height,  0.5,  // front left
         1, -height,  0.5,  // front right
         0,  height,  0.5,  // front top right
        -0.6,  height,  0.5,  // front top left

        // Side face 
        -0.6, -height, -0.5,  // back left
         1, -height, -0.5,  // back right
         0,  height, -0.5,  // back top right
        -0.6,  height, -0.5,  // back top left

        // Top face
        -0.6,  height,  0.5,  // front top left
         0,  height,  0.5,  // front top right
         0,  height, -0.5,  // back top right
        -0.6,  height, -0.5,  // back top left

        // Bottom face
        -0.6, -height,  0.5,  // front left
         1, -height,  0.5,  // front right
         1, -height, -0.5,  // back right
        -0.6, -height, -0.5,  // back left

        // front face
         1, -height,  0.5,  // front right
         1, -height, -0.5,  // back right
         0,  height, -0.5,  // back top right
         0,  height,  0.5,  // front top right

        // Back face
        -0.6, -height,  0.5,  // front left
        -0.6, -height, -0.5,  // back left
        -0.6,  height, -0.5,  // back top left
        -0.6,  height,  0.5,  // front top left
    ];

    // Define the normals for each face
    const n = [
        // Front face
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        // Back face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // Top face
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        // Bottom face
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        // Right face
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
        // Left face
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ];

    // Texture coordinates (using the same texture for simplicity)
    const t = [
        // Front face
        0, 0, 1, 0, 1, 1, 0, 1,
        // Back face
        0, 0, 1, 0, 1, 1, 0, 1,
        // Top face
        0, 0, 1, 0, 1, 1, 0, 1,
        // Bottom face
        0, 0, 1, 0, 1, 1, 0, 1,
        // Right face
        0, 0, 1, 0, 1, 1, 0, 1,
        // Left face
        0, 0, 1, 0, 1, 1, 0, 1,
    ];

    // Indices to triangles (optional — using drawArrays with ordered vertices)
    const orderedVerts = [
        0, 1, 2, 0, 2, 3,       // front
        4, 5, 6, 4, 6, 7,       // back
        8, 9,10, 8,10,11,       // top
       12,13,14,12,14,15,       // bottom
       16,17,18,16,18,19,       // right
       20,21,22,20,22,23        // left
    ];

    // Final arrays to hold the vertices, normals, and texture coordinates
    const finalVerts = [];
    const finalNormals = [];
    const finalTexCoords = [];
    for (let i = 0; i < orderedVerts.length; i++) {
        let vi = orderedVerts[i];
        finalVerts.push(v[vi * 3], v[vi * 3 + 1], v[vi * 3 + 2]);
        finalNormals.push(n[vi * 3], n[vi * 3 + 1], n[vi * 3 + 2]);
        finalTexCoords.push(t[vi * 2], t[vi * 2 + 1]);
    }

    return { vertices: finalVerts, normals: finalNormals, textures: finalTexCoords };
}

export function createSnakeHeadWithFeatures() {
    const head = createTruckHead(0.5);  // Replace with truck head

    // Create eyes as spheres above the head
    const leftEye = createEye(0.2, 6, 6, 0.3, [0.1, 0.6, -0.3]);
    const rightEye = createEye(0.2, 6, 6, 0.3, [0.1, 0.6, 0.3]);

    return {
        vertices: [...head.vertices, ...leftEye.vertices, ...rightEye.vertices],
        normals: [...head.normals, ...leftEye.normals, ...rightEye.normals],
        textures: [...head.textures, ...leftEye.textures, ...rightEye.textures],
    };
}

export function createApple(segments = 12, rings = 12) {
    const vertices = [];
    const normals = [];
    const indices = [];

    for (let y = 0; y <= rings; y++) {
        const v = y / rings;
        const theta = v * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let x = 0; x <= segments; x++) {
            const u = x / segments;
            const phi = u * 2 * Math.PI;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            // Base radius
            let r = sinTheta;

            // Apple-like deformation
            r *= 1.0 + 0.2 * Math.pow(sinTheta, 2) * cosPhi; // bulge sides
            const yOffset = cosTheta * (1.0 + 0.1 * sinTheta * sinPhi); // slightly flattened top and bottom

            const px = r * cosPhi;
            const py = yOffset;
            const pz = r * sinPhi;

            vertices.push(px, py, pz);
            normals.push(px, py, pz); // approximate normal (normalize later if needed)
        }
    }

    // Indices
    for (let y = 0; y < rings; y++) {
        for (let x = 0; x < segments; x++) {
            const i1 = y * (segments + 1) + x;
            const i2 = i1 + segments + 1;

            indices.push(i1, i2, i1 + 1);
            indices.push(i1 + 1, i2, i2 + 1);
        }
    }

    return { vertices, normals, indices };
}

