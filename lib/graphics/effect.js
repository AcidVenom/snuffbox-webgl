import { OpenFile } from "../core/common.js"
import { GLSLTypeToSize } from "./definitions.js"
import { BlendValues, CommonBlend, BlendValuesToConstant } from "./blend_state.js"
import { CommonDepth, DepthValuesToConstant, DepthValues } from "./depth_state.js"

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
     * @param {object} passDefinition The definition of this pass
     * @param {WebGLRenderingContext} context The current context
     */
    function Pass(name, passDefinition, context)
    {
        var _name = name; // The name of this pass
        var _program = passDefinition.program; // The program to render this pass with
        var _blendState = null; // The blend state of this pass
        var _depthState = null; // The depth state of this pass
        var _cullFace = null; // The culling mode for faces
        var _layoutLocations = {}; // The uniform locations within this pass

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

        /**
         * Parses a cull face mode by string
         * @param {string} cullFace 
         */
        var _parseCullFace = function(cullFace)
        {
            var toConstant =
            {
                Front: context.FRONT,
                Back: context.BACK,
                Both: context.FRONT_AND_BACK,
                None: false
            };

            var constantValue = toConstant[cullFace]
            _cullFace = constantValue === undefined ? context.BACK : constantValue;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * Parses a blend state by its JSON definition
         * @param {object} blendState 
         */
        var _parseBlendState = function(blendState)
        {
            if (typeof blendState == "string")
            {
                _blendState = CommonBlend[blendState];
                return;
            }

            if (blendState === undefined)
            {
                _blendState = CommonBlend.Opaque;
                return;
            }

            for (var k in blendState)
            {
                if (k == "Enabled" || k == "Mask")
                {
                    continue;
                }

                var current = blendState[k];
                blendState[k] = BlendValues[current];
            }

            _blendState = blendState;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * Parses a depth state by its JSON definition
         * @param {object} depthState 
         */
        var _parseDepthState = function(depthState)
        {
            if (typeof depthState == "string")
            {
                _depthState = CommonDepth[depthState];
                return;
            }

            if (depthState === undefined)
            {
                _depthState = CommonDepth.Default;
                return;
            }

            depthState.DepthTest = DepthValues[depthState.DepthTest];
            _depthState = depthState;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * @return {object} The layout offset location with its size
         */
        this.getLayoutLocation = function(name)
        {
            return _layoutLocations[name];
        }
        //--------------------------------------------------------------------------------------------

        /**
         * @return Is this pass's blend state valid?
         */
        var _validateBlendState = function()
        {
            if (_blendState === null)
            {
                return false;
            }

            var checkFor =
            [
                "Enabled",
                "Mask",
                "BlendOp",
                "Src",
                "Dest"
            ];

            var valid = true;
            for (var i = 0; i < checkFor; ++i)
            {
                var key = checkFor[i];

                if (_blendState[key] === undefined || _blendState[key] === null)
                {
                    console.warn("Invalid blend state for a shader pass, missing: " + key);
                    valid = false;
                }
            }

            return valid;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * @return Is this pass's depth state valid?
         */
        var _validateDepthState = function()
        {
            if (_depthState === null)
            {
                return false;
            }

            var checkFor =
            [
                "Enabled",
                "DepthTest",
                "WriteEnabled"
            ];

            var valid = true;
            for (var i = 0; i < checkFor; ++i)
            {
                var key = checkFor[i];

                if (_depthState[key] === undefined || _depthState[key] === null)
                {
                    console.warn("Invalid depth state for a shader pass, missing: " + key);
                    valid = false;
                }
            }

            return valid;
        }
        //--------------------------------------------------------------------------------------------

        /**
         * Applies this pass's program to the current context
         * @param {WebGLRenderingContext} context The context to apply the program on
         */
        this.apply = function(context)
        {
            if (this.isValid() == false)
            {
                return;
            }

            context.useProgram(_program.getProgram());

            if (_validateDepthState() == true)
            {
                if (_depthState.Enabled == true)
                {
                    context.enable(context.DEPTH_TEST);
                }
                else
                {
                    context.disable(context.DEPTH_TEST);
                }

                context.depthMask(_depthState.WriteEnabled);
                context.depthFunc(DepthValuesToConstant(_depthState.DepthTest, context));
            }
            else
            {
                context.disable(context.DEPTH_TEST);
            }

            if (_cullFace === false)
            {
                context.disable(context.CULL_FACE);
            }
            else
            {
                context.enable(context.CULL_FACE);
                context.cullFace(_cullFace);
            }

            if (_validateBlendState() == false || _blendState.Enabled == false)
            {
                context.disable(context.BLEND);
                return;
            }

            var toConstant = function(value)
            {
                return BlendValuesToConstant(value, context);
            }

            context.enable(context.BLEND);
            context.blendFunc(toConstant(_blendState.Src), toConstant(_blendState.Dest));
            context.blendEquation(toConstant(_blendState.BlendOp));
            context.colorMask(_blendState.Mask[0] == 1, _blendState.Mask[1] == 1, _blendState.Mask[2] == 1, _blendState.Mask[3] == 1);
        }
        //--------------------------------------------------------------------------------------------

        _parseLayout(passDefinition.layout, context);
        _parseBlendState(passDefinition.blendState);
        _parseDepthState(passDefinition.depthState);
        _parseCullFace(passDefinition.cullFace);
    }
    //--------------------------------------------------------------------------------------------

    var _name = name; // The name of this effect
    var _loader = loader; // The loader used to load this effect
    var _techniques = {}; // The techniques in this effect

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
            parsedPasses[passName] = new Pass(passName, currentPass, context);
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
                    layout: JSON.parse(OpenFile(layoutPath)),
                    blendState: currentPass.blendState,
                    depthState: currentPass.depthState,
                    cullFace: currentPass.cullFace
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

        if (technique === undefined)
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

    /**
     * Retrieves a named layout location for a provided technique and its respective pass
     * @param {string} techniqueName The name of the technique in this effect
     * @param {string} passName The name of the pass in the technique
     * @param {string} layoutName The name of the layout location in the shader
     */
    this.getLayoutLocation = function(techniqueName, passName, layoutName)
    {
        var technique = _techniques[techniqueName];

        if (technique === undefined)
        {
            return null;
        }

        var pass = technique[passName];

        if (pass === undefined)
        {
            return null;
        }

        return pass.getLayoutLocation(layoutName);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves the possible passes within a technique of this effect
     * @param {string} techniqueName The technique to retrieve the passes from
     * @return {string[]} The possible passes for the provided technique
     */
    this.getPossiblePasses = function(techniqueName)
    {
        var possible = [];
        var technique = _techniques[techniqueName];

        if (technique === null || technique === undefined)
        {
            return possible;
        }

        for (var k in technique)
        {
            possible.push(k);
        }

        return possible;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Applies a specific pass of a specific technique in this effect
     * @param {WebGLRenderingContext} context The context to apply the effect in
     * @param {object[]} vertexAttributes The vertex attributes to enable
     * @param {Texture[]} textures The texture samplers to enable
     * @param {string} techniqueName The name of the technique to apply
     * @param {string} passName The name of the pass to apply in the technique
     */
    this.apply = function(context, vertexAttributes, textures, techniqueName, passName)
    {
        var technique = _techniques[techniqueName];

        if (technique === undefined)
        {
            console.warn("Attempted to render using an invalid technique (" + techniqueName + ", " + passName + ")");
            return;
        }

        var pass = technique[passName];

        if (pass === undefined)
        {
            console.warn("Attempted to render using an invalid pass (" + techniqueName + ", " + passName + ")");
            return;
        }

        pass.apply(context);
        
        var offset = 0;
        for (var attrName in vertexAttributes)
        {
            var vertexAttribute = vertexAttributes[attrName];
            var location = this.getLayoutLocation(techniqueName, passName, attrName);

            if (location === null)
            {
                continue;
            }

            location = location.offset;

            context.bindBuffer(context.ARRAY_BUFFER, vertexAttribute.buffer);
            context.vertexAttribPointer(
                location,
                vertexAttribute.components,
                context.FLOAT,
                false,
                0,
                offset);

            offset += location.size;

            context.enableVertexAttribArray(location);
        }

        for (var i = 0; i < textures.length; ++i)
        {
            var texLocation = this.getLayoutLocation(techniqueName, passName, "tex" + i);
            var texture = textures[i];

            if (texLocation !== null && texture !== null)
            {
                texture.apply(context, i);
                context.uniform1i(texLocation.offset, i);
            }
        }
    }
    //--------------------------------------------------------------------------------------------

    _init(data, _loader);
}