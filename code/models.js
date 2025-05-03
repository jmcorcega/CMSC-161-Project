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

export function createSnakeHeadWithFeatures() {
    const head = createSnakeBody(0.5);

    const eyeRadius = 0.07;
    const eyeDepth = 0.51; // just outside front face
    const eyeY = 0.2;
    const eyeXOffset = 0.2;

    // Eyes: two small quads (could be replaced by textured spheres for realism)
    const eyes = [
        // Left eye
        -eyeXOffset - eyeRadius, eyeY - eyeRadius, eyeDepth,
        -eyeXOffset + eyeRadius, eyeY - eyeRadius, eyeDepth,
        -eyeXOffset + eyeRadius, eyeY + eyeRadius, eyeDepth,
        -eyeXOffset - eyeRadius, eyeY + eyeRadius, eyeDepth,

        // Right eye
         eyeXOffset - eyeRadius, eyeY - eyeRadius, eyeDepth,
         eyeXOffset + eyeRadius, eyeY - eyeRadius, eyeDepth,
         eyeXOffset + eyeRadius, eyeY + eyeRadius, eyeDepth,
         eyeXOffset - eyeRadius, eyeY + eyeRadius, eyeDepth,
    ];

    const eyeNormals = new Array(6 * 3).fill(0).map((_, i) => (i % 3 === 2 ? 1 : 0)); // z normal
    
    // Modify UVs to make eyes white (no texture)
    const eyeUVs = [
        0, 0, 1, 0, 1, 1, 0, 1, // Left eye
        0, 0, 1, 0, 1, 1, 0, 1, // Right eye
    ];

    const eyeIndices = [
        0, 1, 2, 0, 2, 3,  // left eye
        4, 5, 6, 4, 6, 7   // right eye
    ];

    const finalEyes = [], finalEyeNormals = [], finalEyeUVs = [];
    for (let i = 0; i < eyeIndices.length; i++) {
        let vi = eyeIndices[i];
        finalEyes.push(eyes[vi * 3], eyes[vi * 3 + 1], eyes[vi * 3 + 2]);
        finalEyeNormals.push(0, 0, 1);
        finalEyeUVs.push(eyeUVs[vi * 2], eyeUVs[vi * 2 + 1]);
    }

    // Combine all except for tongue
    return {
        vertices: [...head.vertices, ...finalEyes],
        normals: [...head.normals, ...finalEyeNormals],
        textures: [...head.textures, ...finalEyeUVs],  // Assuming default white texture for eyes
    };
}
