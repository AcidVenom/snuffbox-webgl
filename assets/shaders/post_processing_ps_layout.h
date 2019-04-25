precision highp float;

uniform mat4 Projection;
uniform mat4 View;
uniform vec3 EyePosition;
uniform float Time;

varying vec2 outTexCoord;

uniform sampler2D tex0;