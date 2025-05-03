export function createRockGeometry(detail = 1) {
    const vertices = [];
    const normals = [];

    const getRandom = (min, max) => Math.random() * (max - min) + min;

    const subdivisions = detail * 6; // controls "rockiness"

    for (let i = 0; i < subdivisions; i++) {
        const angle1 = (Math.PI * 2 * i) / subdivisions;
        const angle2 = (Math.PI * 2 * (i + 1)) / subdivisions;

        const r1 = getRandom(0.3, 0.5);
        const r2 = getRandom(0.3, 0.5);

        const y1 = getRandom(0, 0.2);
        const y2 = getRandom(0, 0.2);

        const x1 = Math.cos(angle1) * r1;
        const z1 = Math.sin(angle1) * r1;
        const x2 = Math.cos(angle2) * r2;
        const z2 = Math.sin(angle2) * r2;

        // Triangle: center top, outer ring1, outer ring2
        vertices.push(0, 0.4 + getRandom(0, 0.1), 0);  // top center
        vertices.push(x1, y1, z1);
        vertices.push(x2, y2, z2);

        // Normals (simple upward facing)
        normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
    }

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
