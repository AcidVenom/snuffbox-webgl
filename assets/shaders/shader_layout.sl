{
    "vertexAttributes" :
    [
        { "name" : "inPosition", "type" : "vec3" },
        { "name" : "inTexCoord", "type" : "vec2" },
        { "name" : "inNormal", "type" : "vec3" },
        { "name" : "inTangent", "type" : "vec3" },
        { "name" : "inColor", "type" : "vec4" }
    ],
    
    "uniforms" :
    [
        { "name" : "Projection", "type" : "mat4" },
        { "name" : "View", "type" : "mat4" },
        { "name" : "EyePosition", "type" : "vec3" },
        { "name" : "Time", "type" : "float" },
        { "name" : "Model", "type" : "mat4" },
        { "name" : "InvTransposedModel", "type" : "mat3" },
        { "name" : "tex0", "type" : "sampler2D" },
        { "name" : "tex1", "type" : "sampler2D" },
        { "name" : "tex2", "type" : "sampler2D" }
    ]
}