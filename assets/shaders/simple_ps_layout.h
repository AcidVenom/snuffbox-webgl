precision highp float;

uniform mat4 Projection;
uniform mat4 View;
uniform vec3 EyePosition;
uniform float Time;

varying vec2 outTexCoord;
varying vec3 outNormal;
varying vec3 outTangent;
varying vec4 outColor;
varying vec3 outWorld;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;