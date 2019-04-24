/**
 * The different texture types that exist
 */
export var TextureTypes = 
{
    Tex2D: 0, // A simple two-dimensional texture
    Tex3D: 1 // A 3D cube-map texture
};

/**
 * The different texture formats that exist
 */
export var TextureFormats =
{
    R5G5B5A1: 0,

    R8: 1,
    R8G8: 2,
    R8G8B8: 3,
    R8G8B8A8: 4,

    R32F: 5,
    R32G32F: 6,
    R32G32B32F: 7,
    R32G32B32A32F: 8
};

/**
 * Creates a texture from a specified type and format within a WebGL context
 * @constructor
 * @param {WebGLRenderingContext} context // The current context
 * @param {TextureTypes} types The type to use
 * @param {TextureFormats} format The format to use
 */
export function Texture(context, type, format)
{
    var _ctx = context; // The context this texture is to be created in
    var _type = type; // The type of the texture
    var _format = format; // The format of the texture
    var _texture = null; // The underlying GPU resource

    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Is this texture valid for use?
     */
    this.isValid = function()
    {
        return _texture !== null;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Applies this texture on a given sampler slot
     * @param {WebGLRenderingContext} context The current context
     * @param {number} slot The slot to bind to
     */
    this.apply = function(context, slot)
    {
        if (this.isValid() == false)
        {
            return;
        }
        
        context.activeTexture(context["TEXTURE" + slot]);
        context.bindTexture(context.TEXTURE_2D, _texture);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves the pixel type information for this texture and its format
     * @return {object} An object containing information about the pixel typing
     */
    var _formatToPixelType = function()
    {
        switch (_format)
        {
            case TextureFormats.R5G5B5A1:
                return { format: _ctx.RGBA, components: 4 };

            case TextureFormats.R8:
                return { format: _ctx.R8, components: 1 };

            case TextureFormats.R8G8:
                return { format: _ctx.RG8, components: 2 };

            case TextureFormats.R8G8B8:
                return { format: _ctx.RGB8, components: 3 };

            case TextureFormats.R8G8B8A8:
                return { format: _ctx.RGBA8, components: 4 };

            case TextureFormats.R32F:
                return { format: _ctx.R32F, components: 1 };

            case TextureFormats.R32G32F:
                return { format: _ctx.RG32F, components: 2 };

            case TextureFormats.R32G32B32F:
                return { format: _ctx.RGB32F, components: 3 };

            case TextureFormats.R32G32B32A32F:
                return { format: _ctx.RGBA32F, components: 4 };
        }

        return { format: _ctx.RGBA, components: 4 };
    }

    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves the per-component type of this texture, based on format
     */
    var _getComponentType = function()
    {
        if (
            _format == TextureFormats.R5G5B5A1 ||
            _format == TextureFormats.R8 ||
            _format == TextureFormats.R8G8 ||
            _format == TextureFormats.R8G8B8 ||
            _format == TextureFormats.R8G8B8A8)
        {
            return _ctx.UNSIGNED_BYTE;
        }

        return _ctx.FLOAT;
    }

    //--------------------------------------------------------------------------------------------

    /**
     * Creates a new texture resource to bind and edit values of
     * @return {WebGLTexture} The created texture, or false if creation failed
     */
    var _createBaseResource = function(width, height, initialData)
    {
        width = width === undefined ? 1 : width;
        height = height === undefined ? 1 : height;

        var newTexture = _ctx.createTexture();
        var internalType = _type == TextureTypes.Tex2D ? _ctx.TEXTURE_2D : _ctx.TEXTURE_CUBE_MAP;

        _ctx.bindTexture(internalType, newTexture);

        var pixelType = _formatToPixelType();
        var internalFormat = pixelType.format;

        var componentType = _getComponentType();
        var typedArray = componentType == _ctx.FLOAT ? Float32Array : Uint8Array;

        initialData = initialData === undefined ? [] : initialData;
        
        for (var i = 0; i < pixelType.components * width * height; ++i)
        {
            initialData.push(componentType == _ctx.FLOAT ? 1.0 : 255);
        }

        _ctx.texImage2D(
            internalType,
            0,
            internalFormat,
            width,
            height,
            0,
            internalFormat,
            componentType,
            new typedArray(initialData));

        _ctx.bindTexture(internalType, null);

        return newTexture;
    }

    //--------------------------------------------------------------------------------------------

    /**
     * Deletes any previously created textures
     */
    var _deleteOld = function()
    {
        if (_texture !== null)
        {
            _ctx.deleteTexture(_texture);
            _texture = null;
        }
    }

    //--------------------------------------------------------------------------------------------

    /**
     * Checks if a given width and height are power-of-two
     * @param {number} width The width
     * @param {number} height The height
     */
    var _isPowerOf2 = function(width, height)
    {
        var test = function(value)
        {
            return (value & (value - 1)) == 0;
        }

        return test(width) == true && test(height) == true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Loads a texture from a provided image source (usually .png)
     * @param {string} path The path to the image 
     * @return {boolean} Was loading a success?
     */
    this.loadFromImage = function(path)
    {
        _deleteOld();
        _texture = _createBaseResource();

        var imgSrc = new Image();
        imgSrc.onload = function() 
        {
            var internalType = _type == TextureTypes.Tex2D ? _ctx.TEXTURE_2D : _ctx.TEXTURE_CUBE_MAP;
            var pixelType = _formatToPixelType();
            var internalFormat = pixelType.format;
            var componentType = _getComponentType();

            _ctx.bindTexture(internalType, _texture);
            _ctx.texImage2D(
                internalType, 
                0, 
                internalFormat,
                internalFormat, 
                componentType, 
                imgSrc);

            if (_isPowerOf2(imgSrc.width, imgSrc.height) == true)
            {
                _ctx.generateMipmap(_ctx.TEXTURE_2D);
            } 
            else 
            {
                _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_S, _ctx.CLAMP_TO_EDGE);
                _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_T, _ctx.CLAMP_TO_EDGE);
                _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.LINEAR);
            }
        };

        imgSrc.src = path;

        return _texture !== null;
    }

    //--------------------------------------------------------------------------------------------

    /**
     * Loads a texture from binary data
     * @param {TypedArray} data The data to load into a texture
     */
    this.loadFromData = function(data)
    {
        _deleteOld();
        _texture = _createBaseResource();
    }
}