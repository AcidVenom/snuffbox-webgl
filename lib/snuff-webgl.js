import * as glm from "./gl-matrix/math.js"

import { Renderer, ShaderTypes } from "./graphics/renderer.js"
import { Mesh, IndexTypes } from "./graphics/mesh.js"
import { Transform } from "./entities/transform.js"
import { Camera } from "./entities/camera.js"

export { ShaderTypes, Mesh, IndexTypes, Transform, Camera };

/**
 * A list of error codes that can be returned from Application.exec
 */
export var ErrorCodes =
{
    Success: 0, // Succesfully initialized the application
    WebGLInitFailed: -1, // WebGL initialization failed
}

/**
 * An application that works as a framework and iniitalizes all components
 * @constructor
 * @param {string} canvasId The canvas ID in the HTML element
 */
export function Application(canvasId)
{
    var _canvas = document.querySelector("#" + canvasId); // The canvas to attach the renderer to
    var _renderer = null; // The current renderer
    var _shouldExit = false; // Should we exit yet?

    //--------------------------------------------------------------------------------------------

    /**
     * Initializes the application
     * @return {boolean} Was the initialization succesful?
     */
    var _init = function()
    {
        if (_canvas === null)
        {
            console.error("Invalid _canvas supplied to Snuff.Application.init");
            return false;
        }

        _renderer = new Renderer(_canvas);

        if (_renderer.init() == false)
        {
            return false;
        }

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Runs the application, calling a callback every update loop
     * @param {function} onInit The callback to execute before running the first frame
     * @param {function} onUpdate The callback to execute every frame
     * @param {function} onDraw The callback to execute every render
     * @return {ErrorCodes} Was there an error during execution? Returns ErrorCodes.Success (0) if everything ran correctly
     */
    this.exec = function(onInit, onUpdate, onDraw)
    {
        if (_init() == false)
        {
            return ErrorCodes.WebGLInitFailed;
        }

        if (onInit !== undefined)
        {
            onInit();
        }

        var clearColor = glm.Vector4.fromValues(0.0, 0.5, 1.0, 1.0);

        var lastTime = Date.now();

        var loop = function()
        {
            var now = Date.now();
            var dt = (now - lastTime) * 1e-3;

            lastTime = now;

            if (onUpdate !== undefined)
            {
                onUpdate(dt);
            }

            _renderer.clear(clearColor);

            if (onDraw !== undefined)
            {
                onDraw(_renderer, dt);
            }
            
            _renderer.render();

            if (_shouldExit == false)
            {
                requestAnimationFrame(loop);
            }
        }

        requestAnimationFrame(loop);

        return ErrorCodes.Success;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Shuts down the application, stopping the update loop
     */
    this.shutdown = function()
    {
        _shouldExit = true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Renderer} The current renderer
     */
    this.getRenderer = function()
    {
        return _renderer;
    }
}