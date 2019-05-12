import * as math from "./lib/gl-matrix/math.js"

import { Renderer, ShaderTypes } from "./lib/graphics/renderer.js"
import { Mesh, IndexTypes } from "./lib/graphics/mesh.js"
import { Texture, TextureTypes, TextureFormats } from "./lib/graphics/texture.js"
import { BlendValues, CommonBlend } from "./lib/graphics/blend_state.js"
import { DepthValues, CommonDepth } from "./lib/graphics/depth_satate.js"
import { Effect } from "./lib/graphics/effect.js"
import { Material } from "./lib/graphics/material.js"
import { RenderTarget } from "./lib/graphics/render_target.js"
import { Transform } from "./lib/entities/transform.js"
import { Camera } from "./lib/entities/camera.js"
import { Scene } from "./lib/entities/scene.js"
import { Entity } from "./lib/entities/entity.js"
import { Component } from "./lib/components/component.js"
import { RendererComponent } from "./lib/components/renderer_component.js"
import { TransformComponent } from "./lib/components/transform_component.js"
import { OpenFile } from "./lib/core/common.js"

export { 
    Renderer, ShaderTypes, 
    Mesh, IndexTypes, 
    Texture, TextureTypes, TextureFormats, 
    Transform, 
    Camera,
    Scene,
    Entity,
    math,
    BlendValues, CommonBlend,
    DepthValues, CommonDepth,
    Effect,
    Material,
    RenderTarget,
    Component,
    RendererComponent,
    TransformComponent,
    OpenFile
};

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

    var _avgDt = []; // The average delta-times of previous frames
    var _maxAvgDt = 100; // The maximum average delta times
    var _currentDt = 0; // The current delta-time value we're updating

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

        for (var i = 0; i < _maxAvgDt; ++i)
        {
            _avgDt.push(0.0);
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
            onInit.call(this);
        }

        var clearColor = math.Vector4.fromValues(0.0, 0.5, 1.0, 1.0);

        var lastTime = Date.now();

        var self = this;
        var loop = function()
        {
            var now = Date.now();
            var dt = (now - lastTime) * 1e-3;

            lastTime = now;

            _avgDt[_currentDt] = dt;

            ++_currentDt;

            if (_currentDt >= _maxAvgDt)
            {
                _currentDt = 0;
            }

            if (onUpdate !== undefined)
            {
                onUpdate.call(self, dt);
            }

            _renderer.clear(clearColor);

            if (onDraw !== undefined)
            {
                onDraw.call(self, _renderer, dt);
            }
            
            _renderer.render(dt);

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
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The current FPS
     */
    this.getFPS = function()
    {
        var avgFPS = 0;
        for (var i = 0; i < _avgDt.length; ++i)
        {
            avgFPS += _avgDt[i];
        }

        avgFPS /= _avgDt.length;

        return Math.floor(1.0 / avgFPS + 0.5);
    }
    //--------------------------------------------------------------------------------------------
}