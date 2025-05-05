attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform vec3 uLightDirection;

varying float vLight;
varying vec2 vTexCoord;

void main() {
    vec3 normal = mat3(uModelMatrix) * aNormal;
    vLight = max(dot(normalize(normal), normalize(uLightDirection)), 0.3);
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * aPosition;
    vTexCoord = aTexCoord;
}