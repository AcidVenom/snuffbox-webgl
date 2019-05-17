import { Transform } from "./transform.js"
import * as glm from "../gl-matrix/math.js"

/**
 * The different camera types that exist
 */
export var CameraTypes =
{
    Perspective: 0, // A perspective camera
    Orthographic: 0 // An orthographic camera
};

/**
 * A camera class that has the same functionality as a transform, but has a perspective matrix as well
 */
export function Camera(type, fov)
{
    Transform.call(this);

    var _type = type === undefined ? CameraTypes.Perspective : type; // The type of the camera

    var _fov = fov === undefined ? 90.0 : fov; // The field of view of the camera, only applicable for perspective cameras
    var _nearPlane = 0.1; // The near plane of the camera
    var _farPlane = 100.0; // The far plane of the camera
    var _orthopgraphicSize = 5.0; // The orthographic size of the camera

    var _projectionMatrix = glm.Matrix4x4.create(); // The projection matrix of this camera
    var _viewMatrix = glm.Matrix4x4.create(); // The view matrix of this camera

    var _isDirty = true; // Is the camera dirty and should it be updated?

    //--------------------------------------------------------------------------------------------

    /**
     * Marks that this camera should be updated
     */
    var _markDirty = function()
    {
        _isDirty = true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Marks that this camera was already updated this frame and has not been changed since
     */
    var _clean = function()
    {
        _isDirty = false;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Is the camera dirty and should it be updated?
     */
    this.cameraIsDirty = function()
    {
        return _isDirty;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the type of the camera
     * @param {CameraTypes} type The type to set
     */
    this.setType = function(type)
    {
        _type = type;
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the field of view of this camera
     * @param {number} fov The new field of view in degrees
     */
    this.setFov = function(fov)
    {
        _fov = fov;
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the near plane of this camera
     * @param {number} nearPlane The near plane to set
     */
    this.setNearPlane = function(nearPlane)
    {
        _nearPlane = nearPlane;
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the far plane of this camera
     * @param {number} farPlane The far plane to set
     */
    this.setFarPlane = function(farPlane)
    {
        _farPlane = farPlane;
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the orthographic size of this camera
     * @param {number} size The size to set
     */
    this.setOrthographicSize = function(size)
    {
        _orthopgraphicSize = size;
        _markDirty();
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {CameraTypes} The type of this camera
     */
    this.getType = function()
    {
        return _type;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The field of view of this camera, in degrees
     */
    this.getFov = function()
    {
        return _fov;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The near plane of this camera
     */
    this.getNearPlane = function()
    {
        return _nearPlane;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The far plane of this camera
     */
    this.getFarPlane = function()
    {
        return _farPlane;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The orthographic size of this camera
     */
    this.getOrthographicSize = function()
    {
        return _orthopgraphicSize;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Creates a projection matrix for a specified width and height, usually the render target's dimensions
     * @param {number} width The width of the target
     * @param {number} height The height of the target
     * @return {Matrix4x4} A copy of the projection matrix of this camera
     */
    this.getProjectionMatrix = function(width, height)
    {
        var toReturn = glm.Matrix4x4.create();

        if (_isDirty == true)
        {
            _clean();

            _projectionMatrix = glm.Matrix4x4.create();

            if (_type == CameraTypes.Perspective)
            {
                var fovRad = _fov * Math.PI / 180.0;
                var aspect = width / height;
        
                _projectionMatrix = glm.Matrix4x4.perspective(_projectionMatrix, fovRad, aspect, _nearPlane, _farPlane);
            }
            else
            {
                var oneOverOrthographic = 1.0 / _orthopgraphicSize;
                var halfWidth = width * oneOverOrthographic * 0.5;
                var halfHeight = height * oneOverOrthographic * 0.5;
                
                _projectionMatrix = glm.Matrix4x4.ortho(_projectionMatrix, -halfWidth, halfWidth, -halfHeight, halfHeight, _nearPlane, _farPlane);
            }
        }

        toReturn = glm.Matrix4x4.copy(toReturn, _projectionMatrix);
        return toReturn;
    }
    //--------------------------------------------------------------------------------------------

    this.onUpdate = function()
    {
        _viewMatrix = glm.Matrix4x4.invert(_viewMatrix, this.getLocalToWorld());
    }
    //--------------------------------------------------------------------------------------------

    /**
     * An aliased function, but is simply the Transform's inverse local-to-world matrix
     * @return {Matrix4x4} A copy of the view matrix of this camera
     */
    this.getViewMatrix = function()
    {
        if (this.isDirty() == true)
        {
            this.onUpdate();
        }
        
        var toReturn = glm.Matrix4x4.create();
        toReturn = glm.Matrix4x4.copy(toReturn, _viewMatrix);
        
        return toReturn;
    }
    //--------------------------------------------------------------------------------------------
}

Camera.prototype = Object.create(Transform);
Camera.prototype.constructor = Camera;