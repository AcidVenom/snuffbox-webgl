import * as Snuff from "./lib/snuff-webgl.js"
import { DemoScene } from "./demo/demo_scene.js"

window.onload = function()
{
    var app = new Snuff.Application("glCanvas");
    var scene;

    var onInit = function()
    {
        var renderer = app.getRenderer();
        scene = new DemoScene(renderer);
    }

    var onUpdate = function(dt)
    {
        scene.update(dt);
    }

    var onDraw = function(renderer, dt)
    {
        document.querySelector("#fps").innerHTML = "<span>FPS: " + app.getFPS() + "</span>";
        scene.draw(dt);
    }

    var errCode = app.exec(onInit, onUpdate, onDraw);
}