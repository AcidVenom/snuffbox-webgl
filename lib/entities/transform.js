import * as glm from "../gl-matrix/math.js"

/**
 * A transform class to define transforms through a parent tree and translation, scale and rotation
 */
export function Transform()
{
    var _localTranslation = null; // The local translation of this transformation
    var _localScale = null; // The local scale of this transformation
    var _rotation = null; // The local rotation of this transformation

    var _parent = null; // The current parent of this transformation
    var _children = []; // All children of this transform

    var _localToWorld = null; // The local-to-world matrix
    var _worldToLocal = null; // The world-to-local matrix (inverse of local-to-world)

    var _dirty = true; // Is this transformation dirty?

    //--------------------------------------------------------------------------------------------

    /**
     * Sets the default values of this transformation
     */
    var _init = function()
    {
        _localTranslation = glm.Vector3.create();
        _localTranslation = glm.Vector3.zero(_localTranslation);

        _localScale = glm.Vector3.fromValues(1.0, 1.0, 1.0);

        _rotation = glm.Quaternion.create();
        _rotation = glm.Quaternion.identity(_rotation);

        _parent = null;
        _children = [];

        _localToWorld = glm.Matrix4x4.create();
        _localToWorld = glm.Matrix4x4.identity(_localToWorld);

        _worldToLocal = glm.Matrix4x4.create();
        _worldToLocal = glm.Matrix4x4.invert(_worldToLocal, _localToWorld);

        _dirty = true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Marks this transformation as dirty, so that it should be updated
     */
    var _markDirty = function()
    {
        _dirty = true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Marks that this transformation was updated
     */
    var _clean = function()
    {
        _dirty = false;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Is this transformation dirty and should it be updated?
     */
    this.isDirty = function()
    {
        return _dirty;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the local translations of this transformation through individual values
     * @param {number} x The X-axis translation to set
     * @param {number} y The Y-axis translation to set
     * @param {number} z The Z-axis translation to set
     */
    this.setLocalTranslation = function(x, y, z)
    {
        if (x !== undefined && y === undefined && z === undefined)
        {
            var vec = x;
            x = vec[0];
            y = vec[1];
            z = vec[2];
        }

        _localTranslation = glm.Vector3.fromValues(x, y, z);
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the local scale of this transformation through individual values
     * @param {number} x The X-axis scale to set
     * @param {number} y The Y-axis scale to set
     * @param {number} z The Z-axis scale to set
     */
    this.setLocalScale = function(x, y, z)
    {
        if (x !== undefined && y === undefined && z === undefined)
        {
            var vec = x;
            x = vec[0];
            y = vec[1];
            z = vec[2];
        }

        _localScale = glm.Vector3.fromValues(x, y, z);
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the rotation of this transform from a quaternion, by copying its values
     * @param {Quaternion} quat The quaternion to copy the values from
     */
    this.setRotation = function(quat)
    {
        _rotation = glm.Quaternion.copy(_rotation, quat);
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the rotation of this transform by euler angles in degrees
     * @param {number} x The X-axis rotation (yaw)
     * @param {number} y The Y-axis rotation (pitch)
     * @param {number} z The Z-axis rotation (roll)
     */
    this.setRotationEuler = function(x, y, z)
    {
        var rot = glm.Quaternion.create();
        rot = glm.Quaternion.fromEuler(rot, x, y, z);

        this.setRotation(rot)
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Adds a child to the list of children of this transformation
     * @param {Transform} child The child to add to the list of children to update
     */
    var _addChild = function(child)
    {
        _children.push(child);

        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Removes a child from the list of children of this transformation
     * @param {Transform} child The child to remove
     */
    var _removeChild = function(child)
    {
        var index = _children.indexOf(child);
        _children.splice(index, 1);

        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the parent of this transform, attaching it as a child to the parent
     */
    this.attach = function(parent)
    {
        if (_parent !== null)
        {
            this.detach();
        }
        
        _parent = parent;
        _addChild.call(parent, this);

        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Detaches this transformation from its parent if it has one
     */
    this.detach = function()
    {
        if (parent_ === null)
        {
            console.warn("Detaching a child transform that doesn't have a parent");
            return;
        }

        _removeChild.call(parent_, this);
        parent_ = null;

        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Transform} The current parent transform, or null if this transformation doesn't have one
     */
    this.getParent = function()
    {
        return _parent;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Retrieves a child of this transformation from a given child index
     * @param {number} childIndex The child index to retrieve
     * @return {Transform} The found child, or null if out of bounds
     */
    this.getChild = function(childIndex)
    {
        if (childIndex < 0 || childIndex >= _children.length)
        {
            console.warn("Attempted to retrieve a child out of bounds for a transformation");
            return null;
        }

        return _children[childIndex];
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The total number of children attached to this transform
     */
    this.getChildCount = function()
    {
        return _children.length;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Executes a function for each child in the hierarchy, deep search
     * @param {function} func The function to execute for each child
     */
    var _forEachChild = function(func)
    {
        if (func === null)
        {
            return;
        }

        var recurse = function(transform)
        {
            for (var i = 0; i < transform.getChildCount(); ++i)
            {
                var child = transform.getChild(i);
                func(child);
                recurse(child);
            }
        }
    }

    /**
     * @see Transform._forEachChild
     */
    this.forEachChild = function(func)
    {
        _forEachChild(func);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Finds the top-level transform in the current parent hierarchy
     * @return {Transform} The found transformation, or null if already at the top
     */
    var _topLevelTransform = function()
    {
        var currentParent = _parent;
        var lastParent = currentParent;

        while (currentParent !== null)
        {
            lastParent = currentParent;
            currentParent = currentParent.getParent();
        }

        return lastParent;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Updates the entire hierarchy whenever a transform is dirty in the hierarchy
     */
    var _update = function()
    {
        if (_dirty == false)
        {
            return;
        }

        _clean();

        var top = _topLevelTransform();
        
        if (top === null)
        {
            _localToWorld = glm.Matrix4x4.create();
            _localToWorld = glm.Matrix4x4.fromRotationTranslationScale(_localToWorld, _rotation, _localTranslation, _localScale);

            _worldToLocal = glm.Matrix4x4.create();
            _worldToLocal = glm.Matrix4x4.invert(_worldToLocal, _localToWorld);

            _forEachChild(function(child)
            {
                _markDirty.call(child);
                _update.call(child);
            });

            return;
        }

        _localToWorld = glm.Matrix4x4.create();
        _localToWorld = glm.Matrix4x4.identity(_localToWorld);
        
        var currentParent = _parent;
        var foundMatrices = [];

        while (currentParent !== null)
        {
            foundMatrices.push(currentParent.getLocalToWorld());
            currentParent = currentParent.getParent();
        }

        for (var i = foundMatrices.length - 1; i >= 0; --i)
        {
            _localToWorld = glm.Matrix4x4.mul(_localToWorld, _localToWorld, foundMatrices[i]);
        }

        var myLocalToWorld = glm.Matrix4x4.create();
        myLocalToWorld = glm.Matrix4x4.fromRotationTranslationScale(myLocalToWorld, _rotation, _localTranslation, _localScale);

        _localToWorld = glm.Matrix4x4.mul(_localToWorld, _localToWorld, myLocalToWorld);

        _worldToLocal = glm.Matrix4x4.create();
        _worldToLocal = glm.Matrix4x4.invert(_worldToLocal, _localToWorld);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * This updates the current hierarchy and removes dirty flags
     * @return {Matrix4x4} A copy of the current local-to-world matrix
     */
    this.getLocalToWorld = function()
    {
        _update();

        var mat = glm.Matrix4x4.create();
        mat = glm.Matrix4x4.copy(mat, _localToWorld);

        return mat;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * This updates the current hierarchy and removes dirty flags
     * @return {Matrix4x4} A copy of the current world-to-local matrix
     */
    this.getWorldToLocal = function()
    {
        _update();

        var mat = glm.Matrix4x4.create();
        mat = glm.Matrix4x4.copy(mat, _worldToLocal);

        return _worldToLocal;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Tranforms a point using this transform's local-to-world matrix using individual values or a vector
     * @param {number} x The X-coordinate of the point
     * @param {nubmer} y The Y-coordinate of the point
     * @param {number} z The Z-coordinate of the point
     * @return {Vector3} The transformed point
     */
    this.transformPoint = function(x, y, z)
    {
        if (x !== undefined && y === undefined && z === undefined)
        {
            var vec = x;
            x = vec[0];
            y = vec[1];
            z = vec[2];
        }

        var toTransform = glm.Vector4.fromValues(x, y, z, 1.0);
        var mat = this.getLocalToWorld();

        toTransform = glm.Vector4.transformMat4(toTransform, toTransform, mat);

        return glm.Vector3.fromValues(toTransform[0], toTransform[1], toTransform[2]);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Tranforms a direction (no translation) using this transform's local-to-world matrix using individual values or a vector
     * @param {number} x The X-direction
     * @param {nubmer} y The Y-direction
     * @param {number} z The Z-direction
     * @return {Vector3} The transformed direction
     */
    this.transformDirection = function(x, y, z)
    {
        if (x !== undefined && y === undefined && z === undefined)
        {
            var vec = x;
            x = vec[0];
            y = vec[1];
            z = vec[2];
        }

        var toTransform = glm.Vector4.fromValues(x, y, z, 0.0);
        var mat = this.getLocalToWorld();

        toTransform = glm.Vector4.transformMat4(toTransform, toTransform, mat);
        toTransform = glm.Vector4.normalize(toTransform, toTransform);

        return glm.Vector3.fromValues(toTransform[0], toTransform[1], toTransform[2]);
    }
    //--------------------------------------------------------------------------------------------
    
    /**
     * @return {Vector3} The right vector of this transformation
     */
    this.getRight = function()
    {
        return this.transformDirection(1.0, 0.0, 0.0);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Vector3} The up vector of this transformation
     */
    this.getUp = function()
    {
        return this.transformDirection(0.0, 1.0, 0.0);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Vector3} The forward vector of this transformation
     */
    this.getForward = function()
    {
        return this.transformDirection(0.0, 0.0, 1.0);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Vector3} A copy of the current local translation
     */
    this.getLocalTranslation = function()
    {
        var out = glm.Vector3.create();
        glm.Vector3.copy(out, _localTranslation);
        return out;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Vector3} The current world translation, after all transformations
     */
    this.getWorldTranslation = function()
    {
        return this.transformPoint(glm.Vector3.fromValues(0.0, 0.0, 0.0));
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Translates the current transform relative to its direction vectors, from individual values or a vector
     * @param {number} x The translation over the right vector
     * @param {number} y The translation over the up vector
     * @param {number} z The translation over the forward vector
     */
    this.translate = function(x, y, z)
    {
        if (x !== undefined && y === undefined && z === undefined)
        {
            var vec = x;
            x = vec[0];
            y = vec[1];
            z = vec[2];
        }

        var dirX = this.getRight();
        dirX = glm.Vector3.scale(dirX, dirX, x);
        
        var dirY = this.getUp();
        dirY = glm.Vector3.scale(dirY, dirY, y);

        var dirZ = this.getForward();
        dirZ = glm.Vector3.scale(dirZ, dirZ, z);

        var total = glm.Vector3.create();
        total = glm.Vector3.zero(total);
        total = glm.Vector3.add(total, total, dirX);
        total = glm.Vector3.add(total, total, dirY);
        total = glm.Vector3.add(total, total, dirZ);

        _localTranslation = glm.Vector3.add(_localTranslation, _localTranslation, total);
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Quaternion} A copy of the current rotation values as a quaternion
     */
    this.getRotation = function()
    {
        var rotation = glm.Quaternion.create();
        rotation = glm.Quaternion.copy(rotation, _rotation);
        return rotation;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {Vector3} A copy of the current local scale as a vector
     */
    this.getLocalScale = function()
    {
        var scale = glm.Vector3.create();
        scale = glm.Vector3.copy(scale, _localScale);
        return scale;
    }
    //--------------------------------------------------------------------------------------------

    _init();
}