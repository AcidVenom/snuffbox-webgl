export function GLSLTypeToSize(type)
{
    if (type == "bool")
    {
        return 1;
    }
    else if (type == "char")
    {
        return 1;
    }
    else if (type == "int")
    {
        return 4;
    }
    else if (type == "uint")
    {
        return 4;
    }
    else if (type == "float")
    {
        return 4;
    }
    else if (type == "double")
    {
        return 8;
    }
    else if (type == "mat2")
    {
        return 16;
    }
    else if (type == "mat3")
    {
        return 36;
    }
    else if (type == "mat4")
    {
        return 64;
    }

    var isVec = type.includes("vec");

    if (isVec == false)
    {
        return 0;
    }

    var typeSpecifier = type[0];
    var countSpecifier = type[type.length - 1];

    if (isNaN(countSpecifier) == true)
    {
        return 0;
    }

    var nElements = parseInt(countSpecifier);

    if (typeSpecifier == "v")
    {
        return countSpecifier * GLSLTypeToSize("float");
    }
    else if (typeSpecifier == "b")
    {
        return countSpecifier * GLSLTypeToSize("bool");
    }
    else if (typeSpecifier == "i")
    {
        return countSpecifier * GLSLTypeToSize("int");
    }
    else if (typeSpecifier == "u")
    {
        return countSpecifier * GLSLTypeToSize("uint");
    }
    else if (typeSpecifier == "d")
    {
        return countSpecifier * GLSLTypeToSize("double");
    }
}