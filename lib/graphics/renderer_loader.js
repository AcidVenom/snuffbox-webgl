/**
 * Used to load different GPU resources, like shaders and textures
 * @constructor
 * @param {WebGLRenderingContext} context The WebGL context to create GPU resources on
 */
export function RendererLoader(context)
{
    /**
     * Wraps a compiled shader that can be typechecked for unloading/linking
     * @param {WebGLShader} shader // The actual loaded/compiled WebGL shader to use
     * @param {number} type // The type of this shader
     * @param {string} name // The name of this shader
     * @param {RendererLoader} loader // The loader used to load this shader
     */
    function CompiledShader(shader, type, name, loader)
    {
        var _shader = shader; // The underlying shader
        var _type = type; // The type of this shader
        var _name = name; // The name of this shader
        var _loader = loader; // The loader used to load this shader

        //--------------------------------------------------------------------------------------------

        /**
         * @return {WebGLShader} The actual underlying shader
         */
        this.getShader = function()
        {
            return _shader;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * @return {number} The type of this shader
         */
        this.getType = function()
        {
            return _type;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * @return {string} The name of this shader
         */
        this.getName = function()
        {
            return _name;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * Checks if this shader is still valid
         * @param {RendererLoader} loader [Optional] Used to check whether the same loader for a shader program was used as for this shader
         * @return {boolean} Is this shader valid?
         */
        this.isValid = function(loader)
        {
            var isSameLoader = true;
            if (loader !== undefined)
            {
                isSameLoader = loader == _loader;
            }

            return  isSameLoader == true &&
                    _loader !== null &&
                    _loader.isValidShader(_name);
        }
        //--------------------------------------------------------------------------------------------
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Wraps a shader program with its respective compiled shaders, that can be validated through
     * the loader.
     * @param {WebGLShaderProgram} program // The underlying shader program
     * @param {CompiledShader[]} shaders // The compiled shaders
     * @param {string} name // The name of this program
     * @param {RendererLoader} loader // The loader used to load this program
     */
    function CompiledProgram(program, shaders, name, loader)
    {
        var _program = program; // The underlying shader program
        var _shaders = shaders; // The compiled shaders belonging to this program
        var _name = name; // The name of this program
        var _loader = loader; // The loader used to load this program

        //--------------------------------------------------------------------------------------------

        /**
         * @return {string} The name of this program
         */
        this.getName = function()
        {
            return _name;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * @return {WebGLShaderProgram} The underlying shader program
         */
        this.getProgram = function()
        {
            return _program;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * Checks if this program is still valid and its shaders were not unloaded
         * @param {RendererLoader} loader The loader that contains the loaded shaders
         * @return {boolean} Is this program and its respective shaders valid?
         */
        this.isValid = function()
        {
            if (_loader === null)
            {
                return false;
            }

            for (var i = 0; i < _shaders.length; ++i)
            {
                if (_shaders[i].isValid(_loader) == false)
                {
                    return false;
                }
            }

            return _loader.isValidProgram(_name);
        }
        //--------------------------------------------------------------------------------------------
    }

    var _ctx = context; // The context to create all GPU resources with
    var _loadedShaders = []; // All currently loaded shaders
    var _loadedShaderPrograms = []; // All currently loaded shader programs

    //--------------------------------------------------------------------------------------------

    /**
     * Used to check if we have a valid WebGL context and shows an error if not
     * @return {boolean} Do we have a valid context?
     */
    var _checkContext = function()
    {
        if (_ctx === null)
        {
            console.error("Cannot do renderer loading without a context")
            return false;
        }

        return true;
    }
    //--------------------------------------------------------------------------------------------
    
    /**
     * Loads a shader from a given source string
     * @param {string} name The name to register the shader under
     * @param {number} type The shader type to load (VERTEX_SHADER or FRAGMENT_SHADER)
     * @param {string} contents The string contents of the shader to load
     * @return {boolean} Was the loading/compiling of the shader a success?
     */
    this.loadShader = function(name, type, contents)
    {
        if (_checkContext() == false)
        {
            return false;
        }

        if (_loadedShaders[name] !== undefined)
        {
            console.warn("Shader with name '" + name + "' was already loaded before, replacing old shader");
            this.unloadShader(name);
        }

        var shader = _ctx.createShader(type);
        _ctx.shaderSource(shader, contents);
        _ctx.compileShader(shader);

        if (!_ctx.getShaderParameter(shader, _ctx.COMPILE_STATUS))
        {
            console.error("Could not load shader: \n\t" + _ctx.getShaderInfoLog(shader));
            _ctx.deleteShader(shader);
            return false;
        }

        _loadedShaders[name] = new CompiledShader(shader, type, name, this);

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Unloads a shader by its name
     * @param {string} name The name of the shader to unload
     * @return {boolean} Was shader unloading a success?
     */
    this.unloadShader = function(name)
    {
        if (_checkContext() == false)
        {
            return false;
        }

        var shader = _loadedShaders[name];

        if (shader === undefined)
        {
            console.warn("Attempted to unload shader '" + name + "', but it was never loaded");
            return false;
        }

        _ctx.deleteShader(shader.getShader());
        _loadedShaders[name] = null;

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Creates a shader program from a vertex shader and pixel shader
     * @param {string} name The identifier name of this shader program
     * @param {CompiledShader[]} shaders The list of shaders to include in this program
     * @return {boolean} Was shader program creation/linking a success?
     */
    this.loadShaderProgram = function(name, shaders)
    {
        if (_checkContext() == false)
        {
            return false;
        }

        var program = _ctx.createProgram();

        for (var i = 0; i < shaders.length; ++i)
        {
            var currentShader = shaders[i];

            if (currentShader.isValid(this) == false)
            {
                console.log("Could not attach shader '" + currentShader.getName() + "' to shader program '" + name + "'");
                continue;
            }

            _ctx.attachShader(program, currentShader.getShader());
        }

        _ctx.linkProgram(program);

        if (!_ctx.getProgramParameter(program, _ctx.LINK_STATUS))
        {
            console.error("Could not create shader program with name '" + name + "', linking failed:\n" + _ctx.getProgramInfoLog(program));
            _ctx.deleteProgram(program);
            return false;
        }

        _loadedShaderPrograms[name] = new CompiledProgram(program, shaders, name, this);

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Unloads a shader program by its registered name
     * @param {string} name The name of the shader program to unload
     * @return {boolean} Was the unload a success?
     */
    this.unloadShaderProgram = function(name)
    {
        if (_checkContext() == false)
        {
            return false;
        }

        var program = _loadedShaderPrograms[name];
        if (program === undefined)
        {
            console.warn("Attempted to unload shader program '" + name + "', but it was never loaded");
            return false;
        }

        _ctx.deleteProgram(program.getProgram());
        _loadedShaderPrograms[name] = undefined;

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Checks if a specified shader is still valid
     * @param {string} name The name of the shader
     * @return {boolean} Is the shader still valid?
     */
    this.isValidShader = function(name)
    {
        return _loadedShaders[name] !== undefined;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Checks if a specified shader program is still valid
     * @param {string} name The name of the shader program
     * @return {boolean} Is the shader program still valid?
     */
    this.isValidProgram = function(name)
    {
        return _loadedShaderPrograms[name] !== undefined;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves a shader from the list of loaded shaders
     * @param {string} name The name of the shader to retrieve
     * @return {CompiledShader} The shader
     */
    this.getShader = function(name)
    {
        return _loadedShaders[name];
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves a shader program from the list of loaded shaders programs
     * @param {string} name The name of the shader program to retrieve
     * @return {CompiledProgram} The shader program
     */
    this.getShaderProgram = function(name)
    {
        return _loadedShaderPrograms[name];
    }
}