// vertex attributes
attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

// transformation matrices and light direction
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform vec3 uLightDirection;

// pass light intensity and texture coordinates
varying float vLight;
varying vec2 vTexCoord;

void main() {
    vec3 normal = mat3(uModelMatrix) * aNormal;                               // transform the normal vector 
    vLight = max(dot(normalize(normal), normalize(uLightDirection)), 0.3);    // and compute directional lighting
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;       // calculate final vertex position 
    vTexCoord = aTexCoord;                                                    // pass texture coords
}