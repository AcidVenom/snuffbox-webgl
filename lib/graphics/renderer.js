import { RendererLoader } from "./renderer_loader.js"
import { Effect } from "./effect.js"
import { OpenFile } from "../core/common.js"
import { Mesh, IndexTypes } from "./mesh.js"
import { Transform } from "../entities/transform.js"
import { Camera } from "../entities/camera.js"
import * as glm from "../gl-matrix/math.js"
import { Texture, TextureFormats, TextureTypes } from "./texture.js"

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
    var _loader = null; // The renderer loader
    var _loadedEffects = {}; // The currently loaded effects

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
        _ctx = _canvas.getContext("webgl")

        if (_ctx === null)
        {
            console.error("Could not create WebGL context for canvas");
            return false;
        }

        _loader = new RendererLoader(_ctx);
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

        _ctx.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        _ctx.clear(_ctx.COLOR_BUFFER_BIT | _ctx.DEPTH_BUFFER_BIT);

        _ctx.enable(_ctx.DEPTH_TEST);
        _ctx.enable(_ctx.CULL_FACE);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Presents the screen to the user and increments the frame count
     */
    this.render = function()
    {
        if (_checkContext() == false)
        {
            return
        }

        ++_numFrames;
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

    /**
     * @return {Texture} A Texture bound to a context for use
     */
    this.createTexture = function(type, format)
    {
        return new Texture(_ctx, type, format);
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


    /**
     * Draws a specific mesh with a transform and effect to the current render target
     * @param {Camera} camera The camera to render with
     * @param {Transform} transform The transform to apply
     * @param {Mesh} mesh The mesh to render
     * @param {Texture[]} textures The textures to render with
     * @param {Effect} effect The effect to use, or the name of an effect to use
     * @param {string} techniqueName The technique to apply in the effect, default = "Default"
     * @param {string} passName The pass to apply in the effect, default = "Default"
     */
    this.draw = function(camera, transform, mesh, textures, effect, techniqueName, passName)
    {
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

        var projectionMatrix = camera.getProjectionMatrix(_ctx.canvas.clientWidth, _ctx.canvas.clientHeight);
        var viewMatrix = camera.getViewMatrix();

        var vertexAttributes = mesh.getVertexAttributeBuffers();

        var getLayoutLocation = function(name)
        {
            return effect.getLayoutLocation(techniqueName, passName, name);
        }

        var offset = 0;
        for (var attrName in vertexAttributes)
        {
            var vertexAttribute = vertexAttributes[attrName];
            var location = getLayoutLocation(attrName);

            if (location === null)
            {
                continue;
            }

            location = location.offset;

            _ctx.bindBuffer(_ctx.ARRAY_BUFFER, vertexAttribute.buffer);
            _ctx.vertexAttribPointer(
                location,
                vertexAttribute.components,
                _ctx.FLOAT,
                false,
                0,
                offset);

            offset += location.size;

            _ctx.enableVertexAttribArray(location);
        }

        effect.apply(_ctx, techniqueName, passName);

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

        matrixLocation = getLayoutLocation("Model");

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

        var eyeLocation = getLayoutLocation("EyePosition");

        if (eyeLocation !== null)
        {
            _ctx.uniform3fv(eyeLocation.offset, camera.getWorldTranslation());
        }

        for (var i = 0; i < textures.length; ++i)
        {
            var texLocation = getLayoutLocation("tex" + i);
            var texture = textures[i];

            if (texLocation !== null)
            {
                texture.apply(_ctx, i);
                _ctx.uniform1i(texLocation.offset, i);
            }
        }
        
        mesh.apply(_ctx);

        _ctx.drawElements(
            _ctx.TRIANGLES, 
            mesh.getIndexCount(), 
            mesh.getIndexType() == IndexTypes.UInt16 ? _ctx.UNSIGNED_SHORT : _ctx.UNSIGNED_INT, 
            0);
    }
}