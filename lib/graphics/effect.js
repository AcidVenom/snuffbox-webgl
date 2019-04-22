import { OpenFile } from "../core/common.js"
import { GLSLTypeToSize } from "./definitions.js"

/**
 * An effect to contain multiple rendering techniques and passes that have their own respective shader program
 * @constructor
 * @param {string} name The name of this effect
 * @param {object} data The parsed JSON data for this effect
 * @param {WebGLRenderingContext} context The current rendering context
 * @param {RendererLoader} loader The current loader
 */
export function Effect(name, data, context, loader)
{
    /**
     * Contains definitions to apply a rendering pass in the renderer
     * @param {string} name The name of this pass
     * @param {RendererLoader.CompiledProgram} program The program to render this pass with
     * @param {object} layout An object defining the layout of this pass
     * @param {WebGLRenderingContext} context The current context
     */
    function Pass(name, program, layout, context)
    {
        var _name = name; // The name of this pass
        var _program = program; // The program to render this pass with
        var _layoutLocations = {};

        //--------------------------------------------------------------------------------------------

        /**
         * @return {boolean} Is this pass's program valid?
         */
        this.isValid = function()
        {
            return _program.isValid();
        }
        //--------------------------------------------------------------------------------------------

        /**
         * Unloads this pass's program
         */
        this.unload = function(loader)
        {
            loader.unloadShaderProgram(_program.getName());
        }

        /**
         * Parses the shader layout belonging to this pass, so we can cache all attribute/uniform locations
         * for the program.
         * @param {object} layout The layout definition as a JSON
         * @param {WebGLRenderingContext} context The current context
         */
        var _parseLayout = function(layout, context)
        {
            if (layout === null || _program.isValid() == false)
            {
                return;
            }
            
            var attribs = layout["vertexAttributes"];
            var uniforms = layout["uniforms"];

            if (attribs !== null)
            {
                for (var i = 0; i < attribs.length; ++i)
                {
                    var attr = attribs[i];

                    if (attr.name === undefined || attr.type === undefined)
                    {
                        console.warn("Invalid attribute in shader layout");
                        continue;
                    }

                    _layoutLocations[attr.name] = 
                    {
                        offset: context.getAttribLocation(_program.getProgram(), attr.name),
                        size: GLSLTypeToSize(attr.type)
                    }
                }
            }

            if (uniforms !== null)
            {
                for (var i = 0; i < uniforms.length; ++i)
                {
                    var uniform = uniforms[i];

                    if (uniform.name === undefined || uniform.type === undefined)
                    {
                        console.warn("Invalid uniform in shader layout");
                        continue;
                    }

                    _layoutLocations[uniform.name] =
                    {
                        offset: context.getUniformLocation(_program.getProgram(), uniform.name),
                        size: GLSLTypeToSize(uniform.type)
                    }
                }
            }
        }
        //--------------------------------------------------------------------------------------------

        _parseLayout(layout, context);
    }
    //--------------------------------------------------------------------------------------------

    var _name = name; // The name of this effect
    var _loader = loader; // The loader used to load this effect
    var _techniques = []; // The techniques in this effect

    //--------------------------------------------------------------------------------------------

    /**
     * Adds a technique to this effect
     * @param {string} techniqueName The name of the technique
     * @param {object} passes The passes of this technique (objects containing a "program" field, where their key is the pass name)
     */
    var _addTechnique = function(techniqueName, passes, context)
    {
        var parsedPasses = {};
        for (var passName in passes)
        {
            var currentPass = passes[passName];
            parsedPasses[passName] = new Pass(passName, currentPass.program, currentPass.layout, context);
        }

        _techniques[techniqueName] = parsedPasses;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Parses an effect definition into an actual usable effect
     * @param {object} data The JSON object that defines this effect
     * @param {RendererLoader} loader The loader to use for shader retrieval
     */
    var _init = function(data, loader)
    {
        var techniquesRaw = data["techniques"];

        if (techniquesRaw === undefined)
        {
            console.error("Could not create effect with name '" + name + "' because it doesn't have a 'techniques' field");
            return false;
        }

        for (var techniqueName in techniquesRaw)
        {
            var currentTechnique = techniquesRaw[techniqueName];
            var compiledPasses = {};

            for (var passName in currentTechnique)
            {
                var currentPass = currentTechnique[passName];
                var shaders = currentPass["shaders"];
                var layoutPath = currentPass["layout"];

                if (shaders === undefined || layoutPath === undefined)
                {
                    console.error("Could not parse pass '" + passName + "' for technique '" + techniqueName + "' in effect '" + name + "', it has no 'shaders' and/or 'layout' field");
                    return false;
                }

                var compiledShaders = [];
                for (var i = 0; i < shaders.length; ++i)
                {
                    var shaderName = shaders[i];
                    if (_loader.isValidShader(shaderName) == false)
                    {
                        console.warn("Skipping shader '" + shaderName + "' for pass '" + passName + "' in technique '" + techniqueName + "' for effect '" + name + "', it is invalid");
                        return false;
                    }

                    compiledShaders.push(_loader.getShader(shaderName));
                }

                var programName = name + "_" + techniqueName + "_" + passName;
                if (_loader.loadShaderProgram(programName, compiledShaders) == false)
                {
                    return false;
                }

                var program = _loader.getShaderProgram(programName);
                compiledPasses[passName] =
                {
                    program: program,
                    layout: JSON.parse(OpenFile(layoutPath))
                }
            }

            _addTechnique(techniqueName, compiledPasses, context);
        }
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Unloads all programs from their respective passes
     * @param {RendererLoader} loader The loader the programs were loaded with
     */
    this.unloadPrograms = function(loader)
    {
        for (var techniqueName in _techniques)
        {
            var technique = _techniques[techniqueName];

            for (var passName in technique)
            {
                var pass = technique[passName];
                pass.unload(loader);
            }
        }
    }

    /**
     * Is a given technique valid in the context of this effect?
     * @param {string} techniqueName The technique to check for
     * @return {boolean} Is the given technique valid for this effect?
     */
    this.isValid = function(techniqueName)
    {
        var technique = _techniques[techniqueName];

        if (technique === null)
        {
            return false;
        }
        
        var hasPasses = false;

        for (var passName in technique)
        {
            hasPasses = true;
            if (technique[passName].isValid() == false)
            {
                return false;
            }
        }

        return hasPasses;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Are all techniques in this effect valid?
     */
    this.validateAll = function()
    {
        for (var techniqueName in _techniques)
        {
            if (this.isValid(techniqueName) == false)
            {
                return false;
            }
        }

        return true;
    }
    //--------------------------------------------------------------------------------------------

    _init(data, _loader);
}