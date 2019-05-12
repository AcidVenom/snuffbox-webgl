/**
 * Contains material data to render with, including custom uniforms
 * @constructor
 * @param {Effect} effect The effect of this material
 * @param {string} technique The technique of this material
 * @param {Texture[]} textures The textures of this material
 */
export function Material(effect, technique, textures)
{
    var _effect = effect; // The effect to render this material with
    var _technique = technique; // The technique to render this material with
    var _textures = textures; // The textures of this material

    //--------------------------------------------------------------------------------------------

    /**
     * @return {Effect} The effect to render this material with
     */
    this.getEffect = function()
    {
        return _effect;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {string} The technique to render this material with
     */
    this.getTechnique = function()
    {
        return _technique;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Texture[]} The textures of this material
     */
    this.getTextures = function()
    {
        return _textures;
    }
    //--------------------------------------------------------------------------------------------
}