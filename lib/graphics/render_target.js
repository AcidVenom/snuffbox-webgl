import { Texture, TextureTypes } from "./texture.js"

/**
 * A render target to render into instead of the backbuffer, useful for e.g. post-processing
 * @constructor
 * @param {WebGLRenderingContext} context The current context 
 * @param {Texture} textures The color attachments
 */
export function RenderTarget(context, width, height, textures, hasDepth)
{
    var _ctx = context; // The current context
    var _width = width; // The width of the render target
    var _height = height; // The height of the render target
    var _textures = textures; // All textures of this render target
    var _frameBuffer = null; // The created framebuffer object
    var _hasDepth = hasDepth; // Does this render target have a depth buffer?

    //--------------------------------------------------------------------------------------------

    var _this = this;

    /**
     * Initializes the render target
     */
    var _init = function()
    {
        _frameBuffer = _ctx.createFramebuffer();
        _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, _frameBuffer);

        var numAttachments = _hasDepth == true ? _textures.length - 1 : _textures.length;

        for (var i = 0; i < numAttachments; ++i)
        {
            var texture = _textures[i];

            _ctx.framebufferTexture2D(
                _ctx.FRAMEBUFFER, 
                _ctx["COLOR_ATTACHMENT" + i], 
                texture.getType() == TextureTypes.Tex2D ? _ctx.TEXTURE_2D : _ctx.TEXTURE_CUBE_MAP, 
                texture.getTexture(),
                0);
        }

        if (_hasDepth == true)
        {
            var depthTexture = textures[textures.length - 1];

            _ctx.framebufferTexture2D(
                _ctx.FRAMEBUFFER,
                _ctx.DEPTH_ATTACHMENT,
                _ctx.TEXTURE_2D,
                depthTexture.getTexture(),
                0);
        }

        if (_ctx.checkFramebufferStatus(_ctx.FRAMEBUFFER) == 0)
        {
            _delete();
        }

        _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, null);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves a color attachment texture
     * @param {number} attachment The attachment to retrieve
     * @return {Texture} The texture, or null if out of bounds
     */
    this.getTexture = function(attachment)
    {
        if (attachment < 0 || attachment >= _textures.length)
        {
            return null;
        }

        return _textures[attachment];
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Texture} The depth texture
     */
    this.getDepthTexture = function()
    {

    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The width of the render target
     */
    this.getWidth = function()
    {
        return _width;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The height of the render target
     */
    this.getHeight = function()
    {
        return _height;
    }
    //--------------------------------------------------------------------------------------------

    this.bind = function()
    {
        if (this.isValid() == false)
        {
            return false;
        }

        _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, _frameBuffer);
        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Clears the framebuffer with a clear color
     * @param {Vector4} clearColor The color to clear with
     */
    this.clear = function(clearColor)
    {
        if (this.bind() == false)
        {
            return;
        }

        _ctx.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        _ctx.clear(_ctx.COLOR_BUFFER_BIT | _ctx.DEPTH_BUFFER_BIT);
        
        _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, null);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Is this render target ready for use?
     */
    this.isValid = function()
    {
        return _ctx !== null && _frameBuffer !== null;
    }
    //--------------------------------------------------------------------------------------------

    var _delete = function()
    {
        for (var i = 0; i < _textures.length; ++i)
        {
            _textures[i].delete();
            _textures[i] = null;
        }

        if (_frameBuffer !== null)
        {
            _ctx.deleteFramebuffer(_frameBuffer);
            _frameBuffer = null;
        }
    }

    /**
     * Deletes this render target
     */
    this.delete = function()
    {
        if (_ctx === null)
        {
            return;
        }

        _delete();
    }
    //--------------------------------------------------------------------------------------------

    _init();
}

/**
 * Creates a context bound render target with its respective textures
 * @param {WebGLRenderingContext} context The current context to bind within
 * @param {number} width The width of the render target
 * @param {number} height The height of the render target
 * @param {TextureTypes} type The type of the render target's textures
 * @param {TextureFormats} format The format of the render target's textures
 * @param {number} numAttachments The number of attachments
 * @param {Texture} depthTexture [Optional] Should this target have a depth texture?
 * @return {RenderTarget} The bound render target
 */
export function CreateBoundRenderTarget(context, width, height, type, format, numAttachments, depthTexture)
{
    var textures = [];
    for (var i = 0; i < numAttachments; ++i)
    {
        var texture = new Texture(context, type, format);
        texture.asRenderTarget(width, height);
        textures.push(texture);
    }

    if (depthTexture !== undefined)
    {
        textures.push(depthTexture);
    }

    return new RenderTarget(context, width, height, textures, depthTexture !== null && depthTexture !== undefined);
}