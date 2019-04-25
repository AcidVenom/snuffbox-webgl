
void main()
{
    gl_Position = vec4(inPosition, 0.0, 1.0);
    outTexCoord = vec2((inPosition.x + 1.0) * 0.5, (inPosition.y + 1.0) * 0.5);
}
