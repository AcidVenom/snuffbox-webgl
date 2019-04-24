precision highp float;

uniform mat4 Projection;
uniform mat4 View;
uniform float Time;

varying vec2 outTexCoord;
varying vec3 outNormal;
varying vec4 outColor;

uniform sampler2D tex0;