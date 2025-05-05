precision mediump float;

uniform vec3 uColor;
uniform float uForceLight; // override lighting
uniform bool uUseTexture;      // toggle between texture or color
uniform sampler2D uTexture;

varying float vLight;
varying vec2 vTexCoord;

void main() {
    float light = mix(vLight, 1.0, uForceLight);
    
    vec3 baseColor = uUseTexture 
        ? texture2D(uTexture, vTexCoord).rgb 
        : uColor;

    gl_FragColor = vec4(light * baseColor, 1.0);
}