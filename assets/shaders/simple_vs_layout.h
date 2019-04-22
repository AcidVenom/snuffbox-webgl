uniform mat4 Projection;
uniform mat4 View;
uniform float Time;

uniform mat4 Model;

attribute vec3 inPosition;
attribute vec2 inTexCoord;
attribute vec3 inNormal;
attribute vec4 inColor;

varying vec2 outTexCoord;
varying vec3 outNormal;
varying vec4 outColor;