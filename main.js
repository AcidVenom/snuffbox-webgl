import * as Snuff from "./lib/snuff-webgl.js"
import { DemoScene } from "./demo/demo_scene.js"

window.onload = function()
{
    var app = new Snuff.Application("glCanvas");
    var scene;

    var avgDt = [];
    var maxAvg = 100;

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
        avgDt.push(dt);
        if (avgDt.length > maxAvg)
        {
            avgDt.splice(0, 1);
        }

        var avgFPS = 0;
        for (var i = 0; i < avgDt.length; ++i)
        {
            avgFPS += avgDt[i];
        }

        avgFPS /= avgDt.length;
        avgFPS = Math.floor(1.0 / avgFPS + 0.5);

        document.querySelector("#fps").innerHTML = "<span>FPS: " + avgFPS + "</span>";
        scene.draw(dt);
    }

    var errCode = app.exec(onInit, onUpdate, onDraw);
}