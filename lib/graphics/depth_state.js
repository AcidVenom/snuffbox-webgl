/**
 * An enumeration of the different values to represent a depth state
 */
export var DepthValues =
{
    Never: 0,
    Equal: 1,
    NotEqual: 2,
    Less: 3,
    LessEqual: 4,
    Greater: 5,
    GreaterEqual: 6,
    Always: 7
};

/**
 * A list of common depth test settings
 */
export var CommonDepth =
{
    Default:
    {
        Enabled: true,
        DepthTest: DepthValues.Less
    },

    None:
    {
        Enabled: false,
        DepthTest: DepthValues.Always
    }
}

/**
 * Converts a depth value enum to its context constant
 * @param {DepthValues} value 
 * @param {WebGLRenderingContext} context
 * @return {GLenum} The converted value
 */
export function DepthValuesToConstant(value, context)
{
    switch (value)
    {
        case DepthValues.Never:
            return context.NEVER;

        case DepthValues.Equal:
            return context.EQUAL;

        case DepthValues.NotEqual:
            return context.NOTEQUAL;
        
        case DepthValues.Less:
            return context.LESS;

        case DepthValues.LessEqual:
            return context.LEQUAL;

        case DepthValues.Greater:
            return context.GREATER;

        case DepthValues.GreaterEqual:
            return context.GEQUAL;

        case DepthValues.Always:
            return context.ALWAYS;
    }
    
    console.warn("Unknown DepthValues: " + value);
    return context.ALWAYS;
}