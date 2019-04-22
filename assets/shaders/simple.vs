
void main()
{
    mat4 PVM = Projection * View * Model;
    gl_Position = PVM * vec4(inPosition, 1.0);

    outTexCoord = inTexCoord;
    outNormal = (PVM * vec4(inNormal, 0.0)).xyz;
    outColor = inColor;
}
