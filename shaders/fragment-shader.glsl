precision mediump float;
uniform vec3 uColor;
uniform float uForceLight;
varying float vLight;

void main() {
    float light = mix(vLight, 1.0, uForceLight);
    gl_FragColor = vec4(light * uColor, 1.0);
}
