import * as Snuff from "./lib/snuff-webgl.js"
import { DemoScene } from "./demo/demo_scene.js"

window.onload = function()
{
    var app = new Snuff.Application("glCanvas");
    window.Application = app;

    var onInit = function()
    {
        var renderer = this.getRenderer();
        this.currentScene = new DemoScene(renderer);
    }

    var onUpdate = function(dt)
    {
        this.currentScene.update(dt);
    }

    var onDraw = function(renderer, dt)
    {
        document.querySelector("#fps").innerHTML = "<span>FPS: " + this.getFPS() + "</span>";
        this.currentScene.draw(dt);
    }

    var errCode = app.exec(onInit, onUpdate, onDraw);
}