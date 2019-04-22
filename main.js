import * as Snuff from "./lib/snuff-webgl.js"

window.onload = function()
{
    var app = new Snuff.Application("glCanvas");
    var mesh, meshTransform;

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

        meshTransform = new Snuff.Transform();

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

    var onUpdate = function(dt)
    {

    }

    var errCode = app.exec(onInit, onUpdate);
}