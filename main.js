import * as Snuff from "./lib/snuff-webgl.js"

window.onload = function()
{
    var app = new Snuff.Application("glCanvas");
    var mesh, meshTransformA, meshTransformB, effect, camera, texture;
    var ready = false;

    var heldKeys = [];

    var KEY_W = 87;
    var KEY_A = 65;
    var KEY_S = 83;
    var KEY_D = 68;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;

    document.addEventListener('keydown', function(e) 
    {
        heldKeys[e.keyCode] = true;
    });

    document.addEventListener("keyup", function(e)
    {
        heldKeys[e.keyCode] = false;
    })

    var onInit = function()
    {
        var renderer = app.getRenderer();

        camera = new Snuff.Camera();

        mesh = renderer.createMesh();
        
        var positions = [
            // Front face
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,

            // Right face
            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,

            // Back face
            0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5,

            // Left face
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,

            // Top face
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,

            // Bottom face
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5
        ];

        var texCoords = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,

            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,

            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,

            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,

            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ]

        var normals = [
            // Front face
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            // Right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            
            // Back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            
            // Left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            
            // Top face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            // Bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0
        ]

        var colors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ]

        var indices = [
            0, 1, 2, 2, 1, 3,

            4, 5, 6, 6, 5, 7,

            8, 9, 10, 10, 9, 11,

            12, 13, 14, 14, 13, 15,

            16, 17, 18, 18, 17, 19,

            20, 21, 22, 22, 21, 23
        ]

        mesh.setVertexAttribute("inPosition", new Float32Array(positions), 3);
        mesh.setVertexAttribute("inTexCoord", new Float32Array(texCoords), 2);
        mesh.setVertexAttribute("inNormal", new Float32Array(normals), 3);
        mesh.setVertexAttribute("inColor", new Float32Array(colors), 4);

        mesh.setIndices(indices, Snuff.IndexTypes.UInt16);

        meshTransformA = new Snuff.Transform();

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

        texture = renderer.createTexture(Snuff.TextureTypes.Tex2D, Snuff.TextureFormats.R5G5B5A1);
        texture.loadFromImage("./assets/textures/test.png");
    }

    var angle = 0.0;
    var time = 0.0;
    var mx, mz;
    var pitch = 0.0;
    var yaw = 0.0;

    var onUpdate = function(dt)
    {
        time += dt;
        angle += dt * 100.0;

        while (angle > 360.0)
        {
            angle -= 360.0;
        }

        meshTransformA.setRotationEuler(0.0, angle, 0.0);

        mx = 0.0;
        mz = 0.0;

        if (heldKeys[KEY_W] === true)
        {
            mz = -1.0;
        }
        else if (heldKeys[KEY_S] === true)
        {
            mz = 1.0;
        }

        if (heldKeys[KEY_D] === true)
        {
            mx = 1.0;
        }
        else if (heldKeys[KEY_A] === true)
        {
            mx = -1.0;
        }

        var rotSpeed = 90.0;

        if (heldKeys[KEY_LEFT] === true)
        {
            pitch += dt * rotSpeed;
        }
        else if (heldKeys[KEY_RIGHT] === true)
        {
            pitch -= dt * rotSpeed;
        }

        if (heldKeys[KEY_UP] === true)
        {
            yaw += dt * rotSpeed;
        }
        else if (heldKeys[KEY_DOWN] === true)
        {
            yaw -= dt * rotSpeed;
        }

        var moveSpeed = 0.1;

        camera.translate(mx * moveSpeed, 0.0, mz * moveSpeed);
        camera.setRotationEuler(yaw, pitch, 0.0);
    }

    var onDraw = function(renderer, dt)
    {
        if (ready == false)
        {
            return;
        }

        renderer.draw(camera, meshTransformA, mesh, [texture], effect, "Default", "Default");
    }

    var errCode = app.exec(onInit, onUpdate, onDraw);
}