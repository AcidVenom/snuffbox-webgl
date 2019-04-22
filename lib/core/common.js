/**
 * Opens a file by XHR, avoiding caching
 * @param {string} path The path to the file
 * @param {function} async [Optional] For async access, add a callback function
 */
export function OpenFile(path, async)
{
    var ms = Date.now();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path + "?dummy=" + ms, async !== undefined);

    if (async !== undefined)
    {
        xhr.onload = function()
        {
            if (xhr.readyState === 4) 
            {
                if (xhr.status === 200) 
                {
                    async(xhr.responseText, true);
                } 
                else 
                {
                    async(xhr.statusText, false);
                }
            }
        }
    }

    xhr.send();

    if (async === undefined && xhr.status == 200)
    {
        return xhr.response;
    }

    return null;
}