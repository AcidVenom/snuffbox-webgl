
/**
 * The different blend values that can be converted to a WebGL enum
 */
export var BlendValues =
{
    // Blending operations
    Add: 0,
    Subtract: 1,
    ReverseSubtract: 2,
    Min: 3,
    Max: 4,

    // Blending functions
    One: 5,
    Zero: 6,
    SrcAlpha: 7,
    InvSrcAlpha: 8,
    DestAlpha: 9,
    InvDestAlpha: 10,
    SrcColor: 11,
    InvSrcColor: 12,
    DestColor: 13,
    InvDestColor: 14,
    ConstantColor: 15,
    InvConstantColor: 16,
    ConstantAlpha: 17,
    InvConstantAlpha: 18
}

/**
 * The different common blending options that exist
 */
export var CommonBlend =
{
    Additive: 
    {
        Enabled: true,
        Mask: [1, 1, 1, 1],
        BlendOp: BlendValues.Add,
        Src: BlendValues.One,
        Dest: BlendValues.One
    },

    Alpha: 
    {
        Enabled: true,
        Mask: [1, 1, 1, 1],
        BlendOp: BlendValues.Add,
        Src: BlendValues.SrcAlpha,
        Dest: BlendValues.InvSrcAlpha
    },

    Opaque:
    {
        Enabled: false,
        Mask: [1, 1, 1, 1],
        BlendOp: BlendValues.Add,
        Src: BlendValues.One,
        Dest: BlendValues.Zero
    }
};

/**
 * Converts an enumerator BlendValues value, to its WebGL equivalent
 * @param {BlendValues} value The value to convert
 * @param {WebGLRenderingContext} ctx The current context
 * @return {GLenum} The converted value
 */
export function BlendValuesToConstant(value, ctx)
{
    switch (value)
    {
        case BlendValues.Add:
            return ctx.FUNC_ADD;

        case BlendValues.Subtract:
            return ctx.FUNC_SUBRACT;

        case BlendValues.ReverseSubtract:
            return ctx.FUNC_REVERSE_SUBTRACT;

        case BlendValues.Min:
            return ctx.MIN;

        case BlendValues.Max:
            return ctx.MAX;

        case BlendValues.One:
            return ctx.ONE;

        case BlendValues.Zero:
            return ctx.ZERO;

        case BlendValues.SrcAlpha:
            return ctx.SRC_ALPHA;

        case BlendValues.InvSrcAlpha:
            return ctx.ONE_MINUS_SRC_ALPHA;

        case BlendValues.DestAlpha:
            return ctx.DST_ALPHA;

        case BlendValues.InvDestAlpha:
            return ctx.ONE_MINUS_DST_ALPHA;

        case BlendValues.SrcColor:
            return ctx.SRC_COLOR;

        case BlendValues.InvSrcColor:
            return ctx.ONE_MINUS_SRC_COLOR;

        case BlendValues.DestColor:
            return ctx.DST_COLOR;

        case BlendValues.InvDestColor:
            return ctx.ONE_MINUS_DST_COLOR;

        case BlendValues.ConstantColor:
            return ctx.CONSTANT_COLOR;

        case BlendValues.InvConstantColor:
            return ctx.ONE_MINUS_CONSTANT_COLOR;

        case BlendValues.ConstantAlpha:
            return ctx.CONSTANT_ALPHA;

        case BlendValues.InvConstantAlpha:
            return ctx.ONE_MINUS_CONSTANT_COLOR;
    }

    console.warn("Unknown BlendValues: " + value);
    return ctx.ONE;
}
