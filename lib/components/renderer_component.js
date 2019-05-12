import { Component } from "./component.js";

/**
 * Used to render meshes with different effects into the scene
 * @constructor
 */
export function RendererComponent(mesh, material)
{
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

    for (var k in _customUniforms)
    {
        var firstToUpper = k[0].toUpperCase() + k.substr(1, k.length - 1);
        this["setUniform" + firstToUpper] = function(name, value)
        {
            _customUniforms[k][name] = value;
        }
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

RendererComponent.prototype = new Component();