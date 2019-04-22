import * as Snuff from "./lib/snuff-webgl.js"

window.onload = function()
{
    var app = new Snuff.Application("glCanvas");
    var mesh, meshTransformA, meshTransformB, effect;
    var ready = false;

    var onInit = function()
    {
        var renderer = app.getRenderer();

        mesh = renderer.createMesh();
        
        var positions = [
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            -0.5, 0.5, 0.0,
            0.5, 0.5, 0.0
        ];

        var texCoords = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ]

        var normals = [
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0
        ]

        var colors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ]

        var indices = [
            0, 1, 2, 2, 1, 3
        ]

        mesh.setVertexAttribute("inPosition", new Float32Array(positions), 3);
        mesh.setVertexAttribute("inTexCoord", new Float32Array(texCoords), 2);
        mesh.setVertexAttribute("inNormal", new Float32Array(normals), 3);
        mesh.setVertexAttribute("inColor", new Float32Array(colors), 4);

        mesh.setIndices(indices, Snuff.IndexTypes.UInt16);

        meshTransformA = new Snuff.Transform();
        meshTransformB = new Snuff.Transform();

        meshTransformB.attach(meshTransformA);

        var loaded = 0;
        var toLoad = 2;

        var shadersReady = function()
        {
            ++loaded;

            if (loaded == toLoad)
            {
                renderer.loadEffect("Simple", "./assets/effects/simple.effect", function()
                {
                    console.log("All done..");
                    effect = renderer.getEffect("Simple");
                    ready = true;
                });
            }
        }

        renderer.loadShaderFromPath("./assets/shaders/simple.vs", Snuff.ShaderTypes.Vertex, {
            include: ["./assets/shaders/simple_vs_layout.h"],
            name: "SimpleVS",
            async: shadersReady
        });

        renderer.loadShaderFromPath("./assets/shaders/simple.ps", Snuff.ShaderTypes.Pixel, {
            include: ["./assets/shaders/simple_ps_layout.h"],
            name: "SimplePS",
            async: shadersReady
        });
    }

    var angle = 0.0;
    var time = 0.0;
    var onUpdate = function(dt)
    {
        time += dt;
        angle += dt * 100.0;

        while (angle > 360.0)
        {
            angle -= 360.0;
        }

        meshTransformA.setRotationEuler(0.0, angle, angle);
        meshTransformA.setLocalTranslation(Math.sin(time) * 0.5, 0.0, -1.0);

        meshTransformB.setRotationEuler(angle * 2.0, 0.0, 0.0);
        var s = 0.5 + Math.abs(Math.sin(time) * 0.5);
        meshTransformA.setLocalScale(s, s, s);
    }

    var onDraw = function(renderer, dt)
    {
        if (ready == false)
        {
            return;
        }

        renderer.draw(meshTransformA, mesh, "Simple", "Default", "Default");
        renderer.draw(meshTransformB, mesh, "Simple", "Default", "Default");
    }

    var errCode = app.exec(onInit, onUpdate, onDraw);
}