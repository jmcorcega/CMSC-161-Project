precision mediump float;

uniform vec3 uColor;
uniform float uForceLight;     // override lighting
uniform bool uUseTexture;      // toggle between texture or color
uniform sampler2D uTexture;

// receive light intensity and texture coordinates from the vertex shader
varying float vLight;
varying vec2 vTexCoord;

void main() {
    // blend between calculated light and full light
    float light = mix(vLight, 1.0, uForceLight);
    
    // use texture color if enabled, otherwise use solid color
    vec3 baseColor = uUseTexture 
        ? texture2D(uTexture, vTexCoord).rgb 
        : uColor;

    // output the final color
    gl_FragColor = vec4(light * baseColor, 1.0);
}