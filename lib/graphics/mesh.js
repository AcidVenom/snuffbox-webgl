/**
 * The two supported types for indices
 */
export var IndexTypes = 
{
    UInt16: 2, // Unsigned shorts, of 2 bytes
    UInt32: 4 // Unsigned integers, of 4 bytes
};

/**
 * Used to set the primitive topology of a mesh
 */
export var PrimitiveTopology =
{
    Triangles: 0,
    Lines: 1,
    TriangleStrip: 2,
    LineStrip: 3,
    Points: 4,
    Fan: 5,
    Loop: 6
};

/**
 * Used to wrap vertex and index buffer data into one class, to render it to the screen
 * @param {WebGLRenderingContext} context The current context
 */
export function Mesh(context)
{
    var _vertexAttributeBuffers = {} // The vertex attribute buffers
    var _indexBuffer = null; // The index buffer of this mesh
    var _indexType = IndexTypes.UInt16; // The index type
    var _indexCount = 0; // The number of indices
    var _vertexCount = null; // The number of vertices
    var _topology = PrimitiveTopology.Triangles; // The topology of the mesh
    var _ctx = context; // The current context

    //--------------------------------------------------------------------------------------------

    /**
     * Used to check whether the current context is valid and logs an error if not
     * @return {boolean} Do we have a valid context?
     */
    var _checkContext = function()
    {
        if (_ctx === null)
        {
            console.error("Attempted to do Mesh operations without a valid context");
            return false;
        }

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets this mesh's primitive topology
     * @param {PrimitiveTopology} topology The topology to set
     */
    this.setTopology = function(topology)
    {
        _topology = topology;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {PrimitiveTopology} The topology of this mesh
     */
    this.getTopology = function()
    {
        return _topology;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets a specific attribute's buffer data
     * @param {string} name The name of the attribute as per the shader layout
     * @param {array} bufferData A typed array with the buffer data
     * @param {number} components The number of components for this attribute
     */
    this.setVertexAttribute = function(name, bufferData, components)
    {
        if (_checkContext() == false)
        {
            return false;
        }

        var elementCount = bufferData.length / components;
        
        if (_vertexCount === null)
        {
            _vertexCount = elementCount;
        }
        else if (elementCount != _vertexCount)
        {
            console.error("Could not set vertex data because of a size mismatch");
            return false;
        }

        var oldBuffer = _vertexAttributeBuffers[name];

        if (oldBuffer !== null)
        {
            _ctx.deleteBuffer(oldBuffer);
            _vertexAttributeBuffers[name] = null;
        }

        var buffer = _ctx.createBuffer();
        _ctx.bindBuffer(_ctx.ARRAY_BUFFER, buffer);

        _ctx.bufferData(_ctx.ARRAY_BUFFER, bufferData, _ctx.STATIC_DRAW);

        _ctx.bindBuffer(_ctx.ARRAY_BUFFER, null);

        _vertexAttributeBuffers[name] = {
            buffer: buffer,
            components: components
        }

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Sets the indices of this mesh in either UInt16 or UInt32
     * @param {array} indices The new indices to set
     * @param {IndexTypes} indexType The index type to set (valid are IndexTypes.UInt16 and IndexTypes.UInt32)
     */
    this.setIndices = function(indices, indexType)
    {
        if (_checkContext() == false)
        {
            return false;
        }

        if (indexType === undefined)
        {
            _indexType = IndexTypes.UInt16;
        }
        else if (indexType !== IndexTypes.UInt16 && indexType !== IndexTypes.UInt32)
        {
            console.warn("No valid index type specified for index buffer of Mesh, valid are IndexType.UInt16 and IndexType.UInt32, defaulting to IndexType.UInt16");
            _indexType = IndexTypes.UInt16;
        }
        else
        {
            _indexType = indexType;
        }

        if (_indexBuffer !== null)
        {
            _ctx.deleteBuffer(_indexBuffer);
            _indexBuffer = null;
        }

        var buffer = _ctx.createBuffer();
        _ctx.bindBuffer(_ctx.ELEMENT_ARRAY_BUFFER, buffer);

        var typedArray = Uint16Array;

        if (_indexType == IndexTypes.UInt32)
        {
            typedArray = Uint32Array;
        }

        _ctx.bufferData(_ctx.ELEMENT_ARRAY_BUFFER, new typedArray(indices), _ctx.STATIC_DRAW);

        _ctx.bindBuffer(_ctx.ELEMENT_ARRAY_BUFFER, null);

        _indexBuffer = buffer;
        _indexCount = indices.length;

        return true;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {boolean} Is this Mesh valid to use?
     */
    this.isValid = function()
    {
        var hasAttributes = false;
        for (var attr in _vertexAttributeBuffers)
        {
            hasAttributes = true;
            if (_vertexAttributeBuffers[attr].buffer === null)
            {
                return false;
            }
        }

        return hasAttributes == true && _indexBuffer !== null && (_indexType == IndexTypes.UInt16 || _indexType == IndexTypes.UInt32);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The amount of vertices in this Mesh
     */
    this.getVertexCount = function()
    {
        return _vertexCount === undefined ? 0 : _vertexCount;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {number} The amount of indices in this Mesh
     */
    this.getIndexCount = function()
    {
        return _indexCount;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {IndexTypes} The index type of this mesh
     */
    this.getIndexType = function()
    {
        return _indexType;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * @return {object} All vertex attribute buffers in this mesh
     */
    this.getVertexAttributeBuffers = function()
    {
        return _vertexAttributeBuffers;
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Applies the index buffer of this mesh as the current element buffer
     * @param {WebGLRenderingContext} context The context to set the index buffer for
     */
    this.apply = function(context)
    {
        if (this.isValid() == false)
        {
            return;
        }
        
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, _indexBuffer);
    }
    //--------------------------------------------------------------------------------------------

    /**
     * Delete this Mesh, deleting all its created buffers
     */
    this.delete = function()
    {
        for (var attrName in _vertexAttributeBuffers)
        {
            var attr =_vertexAttributeBuffers[attrName];

            if (attr.buffer !== null)
            {
                _ctx.deleteBuffer(attr.buffer);
                attr.buffer = null;
            }
        }

        if (_indexBuffer !== null)
        {
            _ctx.deleteBuffer(_indexBuffer);
            _indexBuffer = null;
        }

        _vertexAttributeBuffers = {};
    }
    //--------------------------------------------------------------------------------------------
}

Mesh.createCube = function(renderer)
{
    var mesh = renderer.createMesh();
    mesh.setTopology(PrimitiveTopology.Triangles);
    
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

    var tangents = [
        // Front face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Right face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        
        // Back face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        
        // Left face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        
        // Top face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Bottom face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0
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
    mesh.setVertexAttribute("inTangent", new Float32Array(tangents), 3);
    mesh.setVertexAttribute("inColor", new Float32Array(colors), 4);

    mesh.setIndices(indices, IndexTypes.UInt16);

    return mesh;
}