/**
 * A scene to contain multiple entities and update them top-to-bottom
 * @constructor
 */
export function Scene(renderer)
{
    var _entities = []; // All entities in the scene
    var _renderer = renderer; // The renderer of the scene
    var _mainCamera = null; // The current main camera
    var _didFirstUpdate = false; // Did we do our first update yet?

    //--------------------------------------------------------------------------------------------

    /**
     * Executes a callback for all entities that don't have a parent
     * @param {function} func The function to execute as callback, where the first parameter is the entity
     */
    var _doForTopLevel = function(func)
    {
        for (var i = 0; i < _entities.length; ++i)
        {
            var ent = _entities[i];

            if (ent.transform().getParent() === null)
            {
                func(ent);
            }
        }
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Cleans up all destroyed entities after an update
     */
    var _clean = function()
    {
        for (var i = _entities.length - 1; i >= 0; --i)
        {
            if (_entities[i].wasDestroyed() == true)
            {
                _entities.splice(i, 1);
            }
        }
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Checks if an entity exists in this scene
     * @param {Entity} entity The entity to check for
     * @return {boolean} Does the provided entity exist in this scene?
     */
    var _hasEntity = function(entity)
    {
        return _entities.indexOf(entity) >= 0;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Adds an entity to the scene, calling its onStart if we already did our initial update
     * @param {Entity} entity The entity to add to the scene
     */
    this.addEntity = function(entity)
    {
        if (_hasEntity(entity) == true)
        {
            console.warn("Attempted to add entity with name '" + entity.getName() + "' to the scene twice");
            return;
        }

        if (_didFirstUpdate == true)
        {
            entity.onStart(this);
        }

        _entities.push(entity);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Renderer} The current renderer of this scene
     */
    this.getRenderer = function()
    {
        return _renderer;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the main camera to render with
     * @param {Camera} camera The camera to set
     */
    this.setMainCamera = function(camera)
    {
        _mainCamera = camera;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Updates all top-level entities and cleans up destroyed ones
     * This also calls onStart during the first frame on all entities that already exist in the scene
     * @param {number} dt The current delta time of the application
     */
    this.updateEntities = function(dt)
    {
        if (_didFirstUpdate == false)
        {
            for (var i = 0; i < _entities.length; ++i)
            {
                _entities[i].onStart(this);
            }

            _didFirstUpdate = true;
        }

        _doForTopLevel(function(entity)
        {
            entity.update(dt);
        });

        _clean();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Used to do extra updating aside from updating components
     * @param {number} dt The current delta time of the application
     */
    this.update = function(dt)
    {
        this.updateEntities(dt);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Used to do extra rendering aside from rendering components
     * @param {number} dt The current delta time of the application
     */
    this.draw = function(dt)
    {
        
    }
    //--------------------------------------------------------------------------------------------
}