import { RendererLoader } from "./renderer_loader.js"
import { Effect } from "./effect.js"
import { OpenFile } from "../core/common.js"
import { Mesh, IndexTypes, PrimitiveTopology } from "./mesh.js"
import { Transform } from "../entities/transform.js"
import { Camera } from "../entities/camera.js"
import * as glm from "../gl-matrix/math.js"
import { Texture, TextureFormats, TextureTypes } from "./texture.js"
import { RenderTarget, CreateBoundRenderTarget } from "./render_target.js";

/**
 * The different shader types that can be loaded, not context bound
 */
export var ShaderTypes =
{
    Vertex: 0, // A vertex shader
    Pixel: 1 // A pixel shader
};

/**
 * A renderer for WebGL to handle all GPU memory creation and rendering
 * @constructor
 * @param {canvas} canvas A HTML5 canvas element to create the WebGL context in
 */
export function Renderer(canvas)
{

    var _canvas = canvas; // The canvas to use for rendering
    var _ctx = null; // The context to render all WebGL with
    var _numFrames = 0; // The number of frames that have been rendered since application startup
    var _currentTime = 0; // The time elapsed since application start
    var _loader = null; // The renderer loader
    var _loadedEffects = {}; // The currently loaded effects
    var _fullScreenTriangle = null; // A full screen tirangle to do full screen passes with

    //--------------------------------------------------------------------------------------------

    /**
     * Used to check if we have a valid WebGL context and shows an error if not
     * @return {boolean} Do we have a valid context?
     */
    var _checkContext = function()
    {
        if (_ctx === null)
        {
            console.error("Cannot do rendering operations without a context")
            return false;
        }

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Initializes the renderer
     * @return {boolean} Was the renderer succesfully initialized?
     */
    this.init = function()
    {
        _ctx = _canvas.getContext("webgl2", { alpha: false });

        if (_ctx === null)
        {
            console.error("Could not create WebGL 2 context for canvas");
            return false;
        }

        _loader = new RendererLoader(_ctx);

        _fullScreenTriangle = new Mesh(_ctx);
        
        var triangleVertices = [
            -1.0, 3.0,
            -1.0, -1.0,
            3.0, -1.0
        ];

        var triangleIndices = [0, 1, 2];

        _fullScreenTriangle.setVertexAttribute("inPosition", new Float32Array(triangleVertices), 2);
        _fullScreenTriangle.setIndices(triangleIndices, IndexTypes.UInt16);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Clears the current backbuffer with a color
     * @param {Vector4} clearColor The color to clear the backbuffer with
     */
    this.clear = function(clearColor)
    {
        if (_checkContext() == false)
        {
            return
        }

        if (clearColor === null)
        {
            clearColor = glm.Vector4.fromValues(0.0, 0.0, 0.0, 0.0);
        }

        _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, null);
        _ctx.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        _ctx.clear(_ctx.COLOR_BUFFER_BIT | _ctx.DEPTH_BUFFER_BIT);

        _ctx.enable(_ctx.DEPTH_TEST);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Presents the screen to the user and increments the frame count
     */
    this.render = function(dt)
    {
        if (_checkContext() == false)
        {
            return
        }

        ++_numFrames;
        _currentTime += dt;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The number of frames that have elapsed since application startup
     */
    this.getFrameCount = function()
    {
        return _numFrames;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Mesh} A Mesh bound to a context for use
     */
    this.createMesh = function()
    {
        return new Mesh(_ctx);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Creates a texture that can be used to load raw data or data from an image
     * @param {TextureTypes} type The texture type of the render target
     * @param {TextureFormats} format The texture format of the render target
     * @return {Texture} A Texture bound to a context for use
     */
    this.createTexture = function(type, format)
    {
        return new Texture(_ctx, type, format);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Creates a depth texture to use with render targets
     * @param {number} width The width of the depth texture
     * @param {number} height The height of the depth texture
     * @return {Texture} The created depth texture
     */
    this.createDepthTexture = function(width, height)
    {
        var texture = new Texture(_ctx);
        texture.asDepth(width, height);

        return texture;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Creates a render target that contains a texture
     * @param {number} width The width of the target
     * @param {number} height The height of the target
     * @param {TextureTypes} type The texture type of the render target
     * @param {TextureFormats} format The texture format of the render target
     * @param {number} numAttachments The number of color attachments, default = 1
     * @param {boolean} depthTexture Should a depth buffer stencil be attached to the render target?
     * @return {RenderTarget} A render target bound to a context for use, with a respective texture
     */
    this.createRenderTarget = function(width, height, type, format, numAttachments, depthTexture)
    {
        numAttachments = numAttachments === undefined ? 1 : numAttachments;

        return CreateBoundRenderTarget(_ctx, width, height, type, format, numAttachments, depthTexture);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Loads a shader from a path
     * @param {string} path The path to load the shader from
     * @param {ShaderTypes} type The type of shader to load
     * @param {object} options An object containing an "include" field for extra shader dependencies and "name" to override the path as name for the shader
     */
    this.loadShaderFromPath = function(path, type, options)
    {
        if (options === undefined)
        {
            options = {};
        }

        if (options.include === undefined)
        {
            options.include = [];
        }

        if (options.name === undefined)
        {
            options.name = path;
        }

        var includeString = "";

        for (var i = 0; i < options.include.length; ++i)
        {
            var includeText = OpenFile(options.include[i]);
            if (includeText !== null)
            {
                includeString += includeText + "\n";
            }
        }

        var parseShader = function(data, done)
        {
            if (done == false)
            {
                return;
            }

            var rawText = data;

            if (rawText === null)
            {
                console.error("Could not find shader file '" + path + "'");
                return false;
            }

            rawText = includeString + rawText;

            console.log("[Renderer] Loading shader: " + path);
            var shaderType = type == ShaderTypes.Vertex ? _ctx.VERTEX_SHADER : _ctx.FRAGMENT_SHADER;
            var success = _loader.loadShader(options.name, shaderType, rawText);

            if (success == true)
            {
                console.log("[Renderer] Loaded shader: " + path);
            }

            if (options.async !== undefined)
            {
                options.async();
            }

            return success;
        }

        var data = OpenFile(path, options.async === undefined ? undefined : parseShader);

        return options.async !== undefined ? true : parseShader(data, true); 
    }
    //--------------------------------------------------------------------------------------------
    
    /**
     * Creates an effect from an effect definition in JSON
     * @param {string} name The name of the effect to create
     * @param {string} json The JSON string contents
     * @param {function} async A callback for asynchronous loading
     */
    this.loadEffect = function(name, jsonPath, async)
    {
        if (_checkContext() == false)
        {
            return false;
        }

        if (_loader === null)
        {
            console.error("Attempted to create effect '" + name + "' without a valid RendererLoader");
            return false;
        }

        var parseEffect = function(data, done)
        {
            if (done == false)
            {
                return false;
            }

            var jsonText = data;

            console.log("[Renderer] Loading effect: " + jsonPath);
            
            var effectRaw = JSON.parse(data);
            var effect = new Effect(name, effectRaw, _ctx, _loader);

            var success = effect.validateAll();
            if (success == false)
            {
                console.error("[Renderer] Could not load effect '" + name + "'");
            }
            else
            {
                _loadedEffects[name] = effect;
                console.log("[Renderer] Loaded effect: " + jsonPath);
            }

            if (async !== undefined)
            {
                async();
            }

            return success;
        }

        var data = OpenFile(jsonPath, async === undefined ? undefined : parseEffect);
        return async !== undefined ? true : parseEffect(data, true);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves an effect by name
     * @param {string} name The name of the effect to retrieve
     * @return {Effect} The effect, or null if it doesn't exist
     */
    this.getEffect = function(name)
    {
        var effect = _loadedEffects[name];

        if (effect === null)
        {
            console.error("Could not find effect '" + name + "'");
        }

        return effect;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Unloads an effect by name
     * @param {string} name The name of the effect to unload
     * @return {boolean} Was unloading a success?
     */
    this.unloadEffect = function(name)
    {
        var effect = _loadedEffects[name];
        if (effect === null)
        {
            console.warn("Attempted to unload effect with name '" + name + "', but it was never loaded")
            return false;
        }

        effect.unloadPrograms(_loader);
        _loadedEffects[name] = null;

        return true;
    }
    //--------------------------------------------------------------------------------------------

    this.setPerFrameUniforms = function(camera, effect, techniqueName, passName)
    {
        var getLayoutLocation = function(name)
        {
            return effect.getLayoutLocation(techniqueName, passName, name);
        }

        var projectionMatrix = camera.getProjectionMatrix(_ctx.canvas.clientWidth, _ctx.canvas.clientHeight);
        var viewMatrix = camera.getViewMatrix();

        var matrixLocation = getLayoutLocation("Projection");

        if (matrixLocation !== null)
        {
            _ctx.uniformMatrix4fv(matrixLocation.offset, false, projectionMatrix);
        }

        matrixLocation = getLayoutLocation("View");

        if (matrixLocation !== null)
        {
            _ctx.uniformMatrix4fv(matrixLocation.offset, false, viewMatrix);
        }

        var eyeLocation = getLayoutLocation("EyePosition");

        if (eyeLocation !== null)
        {
            _ctx.uniform3fv(eyeLocation.offset, camera.getWorldTranslation());
        }

        var timeLocation = getLayoutLocation("Time");

        if (timeLocation !== null)
        {
            _ctx.uniform1f(timeLocation.offset, _currentTime);
        }
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Render a mesh in a single draw-call
     * @param {Mesh} mesh The mesh to render
     */
    var _drawElements = function(mesh)
    {
        mesh.apply(_ctx);

        var internalTopology = _ctx.TRIANGLES;

        switch (mesh.getTopology())
        {
            case PrimitiveTopology.Triangles:
                internalTopology = _ctx.TRIANGLES;
            break;

            case PrimitiveTopology.Lines:
                internalTopology = _ctx.LINES;
            break;

            case PrimitiveTopology.TriangleStrip:
                internalTopology = _ctx.TRIANGLE_STRIP;
            break;

            case PrimitiveTopology.LineStrip:
                internalTopology = _ctx.LINE_STRIP;
            break;

            case PrimitiveTopology.Points:
                internalTopology = _ctx.POINTS;
            break;

            case PrimitiveTopology.Fan:
                internalTopology = _ctx.TRIANGLE_FAN;
            break;

            case PrimitiveTopology.Loop:
                internalTopology = _ctx.LOOP;
            break;
        }

        _ctx.drawElements(
            internalTopology, 
            mesh.getIndexCount(), 
            mesh.getIndexType() == IndexTypes.UInt16 ? _ctx.UNSIGNED_SHORT : _ctx.UNSIGNED_INT, 
            0);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Draws a specific mesh with a transform and effect to the current render target
     * @param {RenderTarget[]} target The render targets to render into, or null for the backbuffer
     * @param {Camera} camera The camera to render with
     * @param {Transform} transform The transform to apply
     * @param {Mesh} mesh The mesh to render
     * @param {Texture[]} textures The textures to render with
     * @param {Effect} effect The effect to use, or the name of an effect to use
     * @param {string} techniqueName The technique to apply in the effect, default = "Default"
     * @param {string} passName The pass to apply in the effect, default = "Default"
     */
    this.draw = function(target, camera, transform, mesh, textures, effect, techniqueName, passName)
    {
        if (target === null)
        {
            _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, null);
        }
        else
        {
            if (target.bind() == false)
            {
                return;
            }
        }

        if (camera == undefined)
        {
            camera = new Camera();
        }

        if (transform == undefined)
        {
            transform = new Transform();
        }

        if (typeof effect == "string")
        {
            effect = this.getEffect(effect);
        }

        if (effect == undefined || mesh == undefined)
        {
            console.warn("Invalid draw call, either the effect or mesh are invalid, skipping:\n\tEffect -> " + effect + "\n\tMesh -> " + mesh);
            return;
        }

        if (techniqueName == undefined)
        {
            techniqueName = "Default";
        }

        if (passName == undefined)
        {
            passName = "Default";
        }

        var vertexAttributes = mesh.getVertexAttributeBuffers();

        var getLayoutLocation = function(name)
        {
            return effect.getLayoutLocation(techniqueName, passName, name);
        }

        effect.apply(_ctx, vertexAttributes, textures, techniqueName, passName);
        
        this.setPerFrameUniforms(camera, effect, techniqueName, passName);

        var matrixLocation = getLayoutLocation("Model");

        var localToWorld = transform.getLocalToWorld();
        if (matrixLocation !== null)
        {
            _ctx.uniformMatrix4fv(matrixLocation.offset, false, localToWorld);
        }

        matrixLocation = getLayoutLocation("InvTransposedModel");

        if (matrixLocation !== null)
        {
            var invTransposedModel = glm.Matrix4x4.create();
            invTransposedModel = glm.Matrix4x4.invert(invTransposedModel, localToWorld);
            invTransposedModel = glm.Matrix4x4.transpose(invTransposedModel, invTransposedModel);

            var invTransposedModel3 = glm.Matrix3x3.create();
            invTransposedModel3 = glm.Matrix3x3.fromMat4(invTransposedModel3, invTransposedModel);

            _ctx.uniformMatrix3fv(matrixLocation.offset, false, invTransposedModel3);
        }
        
        _drawElements(mesh);
    }
    //--------------------------------------------------------------------------------------------

    this.fullScreenPass = function(target, camera, textures, effect, techniqueName, passName)
    {
        _ctx.disable(_ctx.DEPTH_TEST);

        if (target === null)
        {
            _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, null);
        }
        else
        {
            if (target.bind() == false)
            {
                return;
            }
        }
        
        if (typeof effect == "string")
        {
            effect = this.getEffect(effect);
        }

        if (effect == undefined)
        {
            console.warn("Invalid full-screen pass, the effect is invalid");
            return;
        }

        if (techniqueName == undefined)
        {
            techniqueName = "Default";
        }

        if (passName == undefined)
        {
            passName = "Default";
        }

        var vertexAttributes = _fullScreenTriangle.getVertexAttributeBuffers();
        effect.apply(_ctx, vertexAttributes, textures, techniqueName, passName);

        this.setPerFrameUniforms(camera, effect, techniqueName, passName);

        _drawElements(_fullScreenTriangle);
    }
}