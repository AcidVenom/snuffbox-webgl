import { Component } from "./component.js"
import { Transform } from "../entities/transform.js"

/**
 * Basically just wraps Transform into its own component
 * @constructor
 */
export function TransformComponent()
{
    Component.call(this);
    Transform.call(this);

    this.__componentType__ = TransformComponent;
}

TransformComponent.prototype = Object.create(Component);
TransformComponent.prototype.constructor = TransformComponent;