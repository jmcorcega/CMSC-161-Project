/*
 * Pages Helper for showing HTML pages in a single page application
 * without needing an SPA framework.
 * (C) 2025 John Vincent Corcega <jmcorcega@up.edu.ph>
 * 
 * Looking for help with this code?
 * Email me at up@tenseventyseven.xyz
 */

// Load a template HTML from given URL
const loadPage = function(template) {
  let loader = async function() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState !== XMLHttpRequest.DONE) {
        return
      }

      var newDocument = httpRequest.responseXML;
      if (newDocument === null)
        return;

      var newContent = httpRequest.responseXML.getElementById('page-container');
      if (newContent === null)
        return;

      var contentElement = document.getElementById('page-container');
      contentElement.replaceWith(newContent);
    }

    httpRequest.responseType = "document";
    httpRequest.open("GET", template);
    httpRequest.send();
  };

  loader();
}


function createCube() {
  const v = [
      -0.5, -0.5,  0.5,  // front face
       0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,
      -0.5,  0.5,  0.5,

      -0.5, -0.5, -0.5,  // back face
      -0.5,  0.5, -0.5,
       0.5,  0.5, -0.5,
       0.5, -0.5, -0.5,

      -0.5,  0.5, -0.5,  // top
      -0.5,  0.5,  0.5,
       0.5,  0.5,  0.5,
       0.5,  0.5, -0.5,

      -0.5, -0.5, -0.5,  // bottom
       0.5, -0.5, -0.5,
       0.5, -0.5,  0.5,
      -0.5, -0.5,  0.5,

       0.5, -0.5, -0.5,  // right
       0.5,  0.5, -0.5,
       0.5,  0.5,  0.5,
       0.5, -0.5,  0.5,

      -0.5, -0.5, -0.5,  // left
      -0.5, -0.5,  0.5,
      -0.5,  0.5,  0.5,
      -0.5,  0.5, -0.5,
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

function translate(x, y, z) {
  return new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      x,y,z,1
  ]);
}

function perspective(fov, aspect, near, far) {
  const f = 1.0 / Math.tan((fov * Math.PI) / 360);
  return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0
  ]);
}

function lookAt(eye, center, up) {
  const [ex, ey, ez] = eye;
  const [cx, cy, cz] = center;
  const [ux, uy, uz] = up;

  let zx = ex - cx,
      zy = ey - cy,
      zz = ez - cz;
  const zl = Math.hypot(zx, zy, zz);
  zx /= zl; zy /= zl; zz /= zl;

  let xx = uy * zz - uz * zy,
      xy = uz * zx - ux * zz,
      xz = ux * zy - uy * zx;
  const xl = Math.hypot(xx, xy, xz);
  xx /= xl; xy /= xl; xz /= xl;

  let yx = zy * xz - zz * xy,
      yy = zz * xx - zx * xz,
      yz = zx * xy - zy * xx;

  return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * ex + xy * ey + xz * ez),
      -(yx * ex + yy * ey + yz * ez),
      -(zx * ex + zy * ey + zz * ez),
      1
  ]);
}

function createGridLines(size = 20, step = 1) {
  const lines = [];
  for (let i = -size; i <= size; i += step) {
      // Lines parallel to X-axis
      lines.push(-size, 0, i, size, 0, i);
      // Lines parallel to Z-axis
      lines.push(i, 0, -size, i, 0, size);
  }
  return new Float32Array(lines);
}

function identity() {
  return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
  ]);
}

