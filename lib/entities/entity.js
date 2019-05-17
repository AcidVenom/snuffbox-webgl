import { TransformComponent } from "../components/transform_component.js"

/**
 * A class to contain multiple components of the framework
 * @constructor
 */
export function Entity(scene)
{
    var _name = "Entity"; // The name of this entity
    var _tag = null; // The tag for this entity
    var _components = []; // All components of this entity
    var _isActive = true; // Is this entity active and ready for updates?
    var _destroyed = false; // Has this entity been destroyed?
    var _scene = scene; // A reference to the scene this entity was spawned in

    //--------------------------------------------------------------------------------------------

    /**
     * Sets the name of this entity
     * @param {string} name The new name
     */
    this.setName = function(name)
    {
        _name = name;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {string} The name of this entity
     */
    this.getName = function()
    {
        return _name;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the tag of this entity
     * @param {number} tag The tag to set
     */
    this.setTag = function(tag)
    {
        _tag = tag;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The tag of this entity
     */
    this.getTag = function()
    {
        return _tag;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets whether this entity is active and should be updated
     * @param {boolean} active Is this entity active?
     */
    this.setActive = function(active)
    {
        _isActive = active;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Is this entity and its parent tree active?
     */
    this.isActive = function()
    {
        var parent = this.transform().getParent();
        var isTreeActive = true;

        while (parent !== null)
        {
            if (parent.isActive() === false)
            {
                isTreeActive = false;
                break;
            }

            parent = parent.transform().getParent();
        }

        return _isActive && isTreeActive;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {TransformComponent} The transform of this entity
     */
    this.transform = function()
    {
        return this.getComponent(TransformComponent);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Destroys this entity, removing it from the scene, including its children. This is however delayed until the next frame
     */
    this.destroy = function()
    {
        _destroyed = true;

        var t = this.transform();

        for (var i = 0; i < t.getChildCount(); ++i)
        {
            t.getChild(i).getEntity().destroy();
        }

        if (this.onDestroy !== undefined)
        {
            this.onDestroy();
        }
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Was this entity destroyed this frame?
     */
    this.wasDestroyed = function()
    {
        return _destroyed;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Adds a component to this entity, it is checked whether there is no duplicate entry
     * @param {Component} component The component to add
     */
    this.addComponent = function(component)
    {
        if (component === TransformComponent)
        {
            if (this.hasComponent(TransformComponent) == true)
            {
                console.warn("Cannot add duplicate transform components to entity with name '" + _name + "'");
                return;
            }
        }

        for (var i = 0; i < _components.length; ++i)
        {
            if (_components[i] === component)
            {
                console.warn("Attempted to add a duplicate component to entity with name '" + _name + "'");
                return;
            }
        }

        component.setEntity(this);
        _components.push(component);

        return component;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Removes a component of this entity by reference
     * @param {Component} component The component to remove
     */
    this.removeComponent = function(component)
    {
        var i = _components.indexOf(component);

        if (i == -1)
        {
            console.warn("Attempted to remove a component by reference from entity with name '" + _name + "', but it was never added");
            return;
        }

        _components.splice(i, 1);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Checks if the entity has a component by component type
     * @param {Component} componentType The component type to check for
     * @return {boolean} Was the component type found?
     */
    this.hasComponent = function(componentType)
    {
        for (var i = 0; i < _components.length; ++i)
        {
            var component = _components[i];

            if (component.__componentType__ === componentType)
            {
                return true;
            }
        }

        return false;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves the first component of this entity by component type
     * @param {Component} componentType The component type to retrieve
     * @return {Component} The component, or null if not found
     */
    this.getComponent = function(componentType)
    {
        for (var i = 0; i < _components.length; ++i)
        {
            var component = _components[i];

            if (component.__componentType__ === componentType)
            {
                return component;
            }
        }

        return null;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @see Entity.getComponent
     * Does the same as getComponent, but returns all components instead
     */
    this.getComponents = function(componentType)
    {
        var result = [];

        for (var i = 0; i < _components.length; ++i)
        {
            var component = _components[i];

            if (component.__componentType__ === componentType)
            {
                result.push(component);
            }
        }

        return result;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Scene} The scene this entity was spawned in
     */
    this.getScene = function()
    {
        return _scene;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Updates the entity with all its components
     * @param {number} dt The current delta time of the application
     */
    this.update = function(dt)
    {
        if (this.isActive() == false || this.wasDestroyed() == true)
        {
            return;
        }

        for (var i = 0; i < _components.length; ++i)
        {
            var component = _components[i];

            if (component.isActive() == true)
            {
                component.update(dt);
            }
        }

        if (this.onUpdate !== undefined)
        {
            this.onUpdate(dt);
        }

        var t = this.transform();
        for (var i = 0; i < t.getChildCount(); ++i)
        {
            t.getChild(i).getEntity().update(dt);
        }
    }
    //--------------------------------------------------------------------------------------------

    this.addComponent(new TransformComponent());
    _scene.addEntity(this);

    if (this.onInit !== undefined)
    {
        this.onInit(_scene);
    }
}