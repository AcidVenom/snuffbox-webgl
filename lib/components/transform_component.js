import { Component } from "./component.js"
import { Transform } from "../entities/transform.js"

/**
 * Basically just wraps Transform into its own component
 * @constructor
 */
export function TransformComponent()
{
    Transform.call(this);
    this.__componentType__ = TransformComponent;
}

TransformComponent.prototype = new Component();
{
    var transform = new Transform();
    for (var k in transform)
    {
        TransformComponent.prototype[k] = transform[k];
    }
}
