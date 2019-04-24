
void main()
{
    mat4 PVM = Projection * View * Model;
    gl_Position = PVM * vec4(inPosition, 1.0);

    outTexCoord = inTexCoord;
    outNormal = InvTransposedModel * vec3(inNormal);
    outTangent = InvTransposedModel * vec3(inTangent);
    outColor = inColor;
    outWorld = (Model * vec4(inPosition, 1.0)).xyz;
}
