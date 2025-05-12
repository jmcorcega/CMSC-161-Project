const getRandom = (min, max) => Math.random() * (max - min) + min;

export function createRockGeometry() {
    const vertices = [];
    const normals = [];

    const subdivisions = 8;  // Number of segments for rock geometry

    const topRing = [];
    const bottomRing = [];

    // Generate top and bottom rings of the rock with random heights
    for (let i = 0; i < subdivisions; i++) {
        const angle = (Math.PI * 2 * i) / subdivisions;
        const baseRadius = getRandom(0.4, 0.5); // Random radius 

        const x = Math.cos(angle) * baseRadius;
        const z = Math.sin(angle) * baseRadius;

        topRing.push([x, getRandom(0.2, 0.3), z]);
        bottomRing.push([x, -getRandom(0.0, 0.1), z]);
    }

    const topCenter = [0, getRandom(0.3, 0.4), 0];
    const bottomCenter = [0, -0.1, 0];

    // Loop for creating triangles for each face
    for (let i = 0; i < subdivisions; i++) {
        const next = (i + 1) % subdivisions;    // Wrap around to form a loop

        const t1 = topRing[i];
        const t2 = topRing[next];
        const b1 = bottomRing[i];
        const b2 = bottomRing[next];

        if (t1 == undefined || t2 == undefined || b1 == undefined || b2 == undefined) {
            return { vertices, normals };       // Prevent undefined vertices
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
    // Calculate two vectors from the points
    const u = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

    // Compute the cross product of the two vectors
    const nx = u[1] * v[2] - u[2] * v[1];
    const ny = u[2] * v[0] - u[0] * v[2];
    const nz = u[0] * v[1] - u[1] * v[0];

    // Normalize the normal vector
    const len = Math.hypot(nx, ny, nz);
    return [nx / len, ny / len, nz / len];
}

export function createLogGeometry(height = 1.5) {
    // Log dimensions
    const width = 1;
    const depth = 1;
    const x = width / 2;
    const y = height / 2;
    const z = depth / 2;

    // Colors: ends (lighter), body (darker)
    const endColor = [0.6, 0.4, 0.2];   // Lighter ends
    const bodyColor = [0.3, 0.2, 0.1];  // Darker sides

    const faces = [
        // Front face (z+)
        { normal: [0, 0, 1], color: bodyColor, verts: [-x, -y, z,  x, -y, z,  x, y, z,  -x, y, z] },
        // Back face (z-)
        { normal: [0, 0, -1], color: bodyColor, verts: [x, -y, -z, -x, -y, -z, -x, y, -z, x, y, -z] },
        // Top face (y+)
        { normal: [0, 1, 0], color: bodyColor, verts: [-x, y, z,  x, y, z,  x, y, -z, -x, y, -z] },
        // Bottom face (y-)
        { normal: [0, -1, 0], color: bodyColor, verts: [-x, -y, -z,  x, -y, -z,  x, -y, z, -x, -y, z] },
        // Right face (x+)
        { normal: [1, 0, 0], color: endColor, verts: [x, -y, z, x, -y, -z, x, y, -z, x, y, z] },
        // Left face (x-)
        { normal: [-1, 0, 0], color: endColor, verts: [-x, -y, -z, -x, -y, z, -x, y, z, -x, y, -z] },
    ];

    const vertices = [];
    const normals = [];
    const colors = [];

    for (const face of faces) {
        for (let i = 0; i < 6; i++) {
            const vi = [0, 1, 2, 0, 2, 3][i]; // triangle indices
            const offset = vi * 3;
            vertices.push(...face.verts.slice(offset, offset + 3));  // Add vertices
            normals.push(...face.normal);                            // Add normals for each triangle
            colors.push(face.color);                                 // Add color
        }
    }

    return { vertices, normals, colors };
}


export function createGrassGeometry(basisHeight) {
    const bladeCount = Math.floor(Math.random() * 4) + 8;   // 8 to 12 random number of grass blades 
    const clusterVertices = [];
    const clusterNormals = [];

    for (let i = 0; i < bladeCount; i++) {
        const height = Math.random() * 0.4 + basisHeight;   // Random height for each grass blade with basis height
        const width = 0.06;
        const curveAmount = 0.1;
        const segments = 3;

        // Slight random offset per blade
        const offsetX = (Math.random() - 0.5) * 0.98;
        const offsetZ = (Math.random() - 0.5) * 0.98;

        // Slight random rotation per blade
        const angle = Math.random() * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Loop through segments of each grass blade
        for (let j = 0; j < segments; j++) {
            // Y position for the first and second vertex
            const y1 = (j / segments) * height;                                 
            const y2 = ((j + 1) / segments) * height;

            // Curve effect on z
            const z1 = Math.sin((j / segments) * Math.PI) * curveAmount;
            const z2 = Math.sin(((j + 1) / segments) * Math.PI) * curveAmount;

            // Left and right side of the blade
            const leftX1 = -width / 2;
            const rightX1 = width / 2;

            const leftX2 = -width / 2;
            const rightX2 = width / 2;

            // Apply rotation and offset to each vertex
            const verts = [
                [leftX1, y1, z1],
                [rightX1, y1, z1],
                [leftX2, y2, z2],
                [rightX1, y1, z1],
                [rightX2, y2, z2],
                [leftX2, y2, z2],
            ];

            // Apply rotation to each vertex of the blade
            for (let [x, y, z] of verts) {
                const rx = x * cosA - z * sinA + offsetX;
                const rz = x * sinA + z * cosA + offsetZ;
                clusterVertices.push(rx, y, rz);
            }

            // Normals for the grass blade
            for (let k = 0; k < 6; k++) {
                clusterNormals.push(0, 0.7, 0.7); // gently upwards
            }
        }
    }

    return {
        vertices: clusterVertices,
        normals: clusterNormals
    };
}


export function createPlantGeometry() {
    const stemHeight = 0.8;
    const stemWidth = 0.04;

    const stemVertices = [];
    const stemNormals = [];

    // Simple vertical stem (as a thin quad)
    // Two triangles to form the rectangular stem
    stemVertices.push(
        -stemWidth / 2, 0, 0,           // Bottom-left
         stemWidth / 2, 0, 0,           // Bottom-right
        -stemWidth / 2, stemHeight, 0,  // Top-left

         stemWidth / 2, 0, 0,           // Bottom-right
         stemWidth / 2, stemHeight, 0,  // Top-right
        -stemWidth / 2, stemHeight, 0   // Top-left
    );

    // Normals for the stem 
    for (let i = 0; i < 6; i++) {
        stemNormals.push(0, 0, 1);
    }

    const leaves = [];
    const leafNormals = [];

    const leafCount = Math.random() * 3 + 2;   // 2 to 5 random number of leaves
    const leafWidth = 0.25;
    const leafHeight = 0.15;

    // Generate each leaf
    for (let i = 1; i <= leafCount; i++) {
        const yPos = (i / (leafCount + 1)) * stemHeight;
        const angle = (i % 2 === 0) ? Math.PI / 4 : -Math.PI / 4;

        // Simple leaf quad, positioned out from the stem
        // First triangle for the leaf
        leaves.push(
            0, yPos, 0,
            leafWidth * Math.cos(angle), yPos + leafHeight / 2, leafWidth * Math.sin(angle),
            leafWidth * Math.cos(angle), yPos - leafHeight / 2, leafWidth * Math.sin(angle)
        );

        // Second triangle for the leaf (mirror of the first one)
        leaves.push(
            0, yPos, 0,
            leafWidth * Math.cos(angle), yPos - leafHeight / 2, leafWidth * Math.sin(angle),
            0, yPos, 0
        );

        // Normals for the leaves
        for (let j = 0; j < 6; j++) {
            leafNormals.push(0, 0.5, 0.5);
        }
    }

    // Combine the stem and leaves
    const vertices = [...stemVertices, ...leaves];
    const normals = [...stemNormals, ...leafNormals];

    return { vertices, normals };
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
        let vi = orderedVerts[i];   // Get the vertex index from orderedVerts

        // Add values to the corresponding array
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
    const h = height;

    // Define key profile points for front and back
    const front = [
        [-0.6, -h,  0.5], // 0
        [   0, -h,  0.5], // 1
        [0.6, -h * 0.4, 0.5], // 2
        [0.6,  h * 0.4, 0.5], // 3
        [   0,  h,  0.5], // 4
        [-0.6,  h,  0.5], // 5
    ];
    const back = front.map(([x, y, _z]) => [x, y, -0.5]);

    const vertices = [];
    const normals = [];
    const textures = [];

    const faceNormal = (a, b, c) => {
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const n = [
            u[1]*v[2] - u[2]*v[1],
            u[2]*v[0] - u[0]*v[2],
            u[0]*v[1] - u[1]*v[0],
        ];
        const len = Math.hypot(...n);
        return n.map(x => x / len);
    };

    const addQuad = (a, b, c, d) => {
        const normal = faceNormal(a, b, c);
        [a, b, c, a, c, d].forEach(v => {
            vertices.push(...v);
            normals.push(...normal);
            textures.push(0, 0); // placeholder
        });
    };

    // 1. Side faces (connecting front to back)
    for (let i = 0; i < front.length - 1; i++) {
        addQuad(front[i], front[i + 1], back[i + 1], back[i]);
    }

    // 2. Front face (cap)
    for (let i = 1; i < front.length - 1; i++) {
        const tri = [front[0], front[i], front[i + 1]];
        const normal = [0, 0, 1];
        tri.forEach(v => {
            vertices.push(...v);
            normals.push(...normal);
            textures.push(0, 0);
        });
    }

    // 3. Back face (cap)
    for (let i = 1; i < back.length - 1; i++) {
        const tri = [back[0], back[i + 1], back[i]]; // reversed winding
        const normal = [0, 0, -1];
        tri.forEach(v => {
            vertices.push(...v);
            normals.push(...normal);
            textures.push(0, 0);
        });
    }

    // 4. Top face
    addQuad(front[4], front[5], back[5], back[4]);

    // 5. Bottom face
    addQuad(front[0], front[1], back[1], back[0]);

    return { vertices, normals, textures };
}



export function createTreeGeometry() {
    // Randomize values
    const trunkHeight = 0.6 + (Math.random() * 0.4 - 0.1); 
    const trunkRadius = 0.1 + (Math.random() * 0.03 - 0.02); 
    const leafHeight = 0.8 + (Math.random() * 0.2 - 0.1); 
    const leafRadius = 0.4 + (Math.random() * 0.1 - 0.05); 
    const radialSegments = 12;

    // Random offset for varying tree positions
    const offsetX = (Math.random() - 0.6) * 0.3;  // Random offset 
    const offsetZ = (Math.random() - 0.6) * 0.3;

    const vertices = [];
    const normals = [];

    // Trunk - cylinder 
    for (let i = 0; i < radialSegments; i++) {
        // Compute angles for the circular base
        const theta1 = (i / radialSegments) * 2 * Math.PI;
        const theta2 = ((i + 1) / radialSegments) * 2 * Math.PI;

        // Coordinats for the first point on the circle
        const x1 = Math.cos(theta1) * trunkRadius + offsetX;
        const z1 = Math.sin(theta1) * trunkRadius + offsetZ;

        // Second point
        const x2 = Math.cos(theta2) * trunkRadius + offsetX;
        const z2 = Math.sin(theta2) * trunkRadius + offsetZ;

        // Coordinates for the base and the top of the trunk
        const yBottom = 0;
        const yTop = trunkHeight;

        // Triangle 1
        vertices.push(x1, yBottom, z1, x1, yTop, z1, x2, yTop, z2);
        // Triangle 2
        vertices.push(x1, yBottom, z1, x2, yTop, z2, x2, yBottom, z2);

        // Normals for the cylinder faces
        for (let j = 0; j < 6; j++) {
            normals.push(Math.cos(theta1), 0, Math.sin(theta1));
        }
    }

    const trunkVertexCount = vertices.length / 3;

    // Leaves - cone 
    for (let i = 0; i < radialSegments; i++) {
        // Compute angle for the circular base of the cone
        const theta1 = (i / radialSegments) * 2 * Math.PI;
        const theta2 = ((i + 1) / radialSegments) * 2 * Math.PI;

        // Calculate for the two base points of the cone triangle
        const x1 = Math.cos(theta1) * leafRadius + offsetX;
        const z1 = Math.sin(theta1) * leafRadius + offsetZ;
        const x2 = Math.cos(theta2) * leafRadius + offsetX;
        const z2 = Math.sin(theta2) * leafRadius + offsetZ;

        // Define the vertical positions
        const yBase = trunkHeight;
        const yApex = trunkHeight + leafHeight;

        // Cone surface
        vertices.push(x1, yBase, z1, x2, yBase, z2, offsetX, yApex, offsetZ);

        // Compute and normalize the normal vector 
        const nx = (x1 + x2) / 2 - offsetX;
        const nz = (z1 + z2) / 2 - offsetZ;
        const length = Math.hypot(nx, leafHeight, nz);
        for (let j = 0; j < 3; j++) {
            normals.push(nx / length, leafHeight / length, nz / length);
        }
    }

    return {
        vertices,
        normals,
        trunkVertexCount
    };
}


export function createSnakeHeadWithFeatures() {
    const head = createTruckHead(0.5);  // Replace with truck head

    // Create black eyes (slightly larger)
    const leftEye = createEye(0.2, 6, 6, 0.3, [0.1, 0.6, -0.3]);
    const rightEye = createEye(0.2, 6, 6, 0.3, [0.1, 0.6, 0.3]);

    // Create sclera (smaller, offset slightly to prevent overlap)
    const leftEye1 = createEye(0.14, 6, 6, 0.15, [0.22, 0.5, -0.3]);  // Pupil
    const rightEye1 = createEye(0.14, 6, 6, 0.15, [0.22, 0.5, 0.3]);   // Pupil

    return {
        vertices: [
            ...head.vertices,
            ...leftEye.vertices,
            ...rightEye.vertices,
            ...leftEye1.vertices,
            ...rightEye1.vertices
        ],
        normals: [
            ...head.normals,
            ...leftEye.normals,
            ...rightEye.normals,
            ...leftEye1.normals,
            ...rightEye1.normals
        ],
        textures: [
            ...head.textures,
            ...leftEye.textures,
            ...rightEye.textures,
            ...leftEye1.textures,
            ...rightEye1.textures
        ],
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

