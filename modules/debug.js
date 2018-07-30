/**
Liam McLeod, 2018.
*/

/**
 * Quick and dirty evaluation as to whether 
 * any debug parameters have been set. Might be useful
 */
function isDebug() {
    if (process.env.NODE_ENV === "development" || process.argv[2] === "--d" || process.argv[2] === "d") {
        return true;
    } else {
        return false;
    }
}

module.exports = isDebug;