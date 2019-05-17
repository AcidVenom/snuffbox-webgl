import { Component } from "./component.js";

/**
 * Used to render meshes with different effects into the scene
 * @constructor
 */
export function RendererComponent(mesh, material)
{
    Component.call(this);
    this.__componentType__ = RendererComponent;

    var _mesh = mesh; // The mesh to render with
    var _material = material; // The material to render with

    var _customUniforms = // All custom uniforms currently set
    {
        float: {},
        float2: {},
        float3: {},
        float4: {},
        mat3: {},
        mat4: {}
    };
    //--------------------------------------------------------------------------------------------

    this.setUniformFloat = function(name, value)
    {
        _customUniforms.float[name] = value;
    }
    //--------------------------------------------------------------------------------------------

    this.setUniformFloat2 = function(name, value)
    {
        _customUniforms.float2[name] = value;
    }
    //--------------------------------------------------------------------------------------------

    this.setUniformFloat3 = function(name, value)
    {
        _customUniforms.float3[name] = value;
    }
    //--------------------------------------------------------------------------------------------

    this.setUniformFloat4 = function(name, value)
    {
        _customUniforms.float4[name] = value;
    }
    //--------------------------------------------------------------------------------------------

    this.setUniformMat3 = function(name, value)
    {
        _customUniforms.mat3[name] = value;
    }
    //--------------------------------------------------------------------------------------------

    this.setUniformMat4 = function(name, value)
    {
        _customUniforms.mat4[name] = value;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Adds a queued render command to the renderer, that can later be rendered with Renderer.renderPass
     * @param {number} dt The current delta time of the application
     */
    this.update = function(dt)
    {
        var entity = this.getEntity();
        var scene = entity.getScene();
        var renderer = scene.getRenderer();

        renderer.queue( 
            entity.transform(), 
            _mesh,
            _material,
            _customUniforms);
    }
    //--------------------------------------------------------------------------------------------
}

RendererComponent.prototype = Object.create(Component);
RendererComponent.prototype.constructor = RendererComponent;