/**
 * The base class of every component
 * @constructor
 */
export function Component()
{
    var _entity = null; // The entity this component is currently attached to
    var _isActive = true; // Should this component be updated?

    //--------------------------------------------------------------------------------------------

    /**
     * Sets the entity of this component
     * @param {Entity} entity The entity to attach to
     */
    this.setEntity = function(entity)
    {
        _entity = entity;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Entity} The entity this component is currently attached to
     */
    this.getEntity = function()
    {
        return _entity;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets if this component is active and should be updated
     * @param {boolean} active Is this component active?
     */
    this.setActive = function(active)
    {
        _isActive = active;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Is this component active and should it be updated?
     */
    this.isActive = function()
    {
        return _isActive;
    }
    //--------------------------------------------------------------------------------------------
}