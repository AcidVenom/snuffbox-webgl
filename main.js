import * as Snuff from "./lib/snuff-webgl.js"

window.onload = function()
{
    var app = new Snuff.Application("glCanvas");
    var scene;

    var onInit = function()
    {
        var renderer = app.getRenderer();
        scene = new Snuff.Scene(renderer);
    }

    var onUpdate = function(dt)
    {
        scene.update(dt);
    }

    var onDraw = function(renderer, dt)
    {
        scene.draw(dt);
    }

    var errCode = app.exec(onInit, onUpdate, onDraw);
}