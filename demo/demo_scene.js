import { Scene } from "../lib/entities/scene.js"

export function DemoScene(renderer)
{
    Scene.call(this, renderer);

    this.update = function(dt)
    {
        
    }

    this.draw = function(dt)
    {
        
    }
}

DemoScene.prototype = Object.create(Scene.prototype);
DemoScene.prototype.constructor = DemoScene;