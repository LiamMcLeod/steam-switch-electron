/**
Liam McLeod, 2018.
*/

/**
 * @param  log  any
 * 
 * Really basic log function to speed up 
 * my own typing of log, and to ensure it 
 * only happens during dev
 * 
 * console.log should deal with the type itself
 */
function log(log) {
    if (isDebug()) {
        console.log(log);
    }
}

function stdOut(log) {
    process.stdout.write(log + "\n");
}

/**
 * @returns  boolean  flag based on debug args
 * 
 * Quick and dirty evaluation as to whether 
 * any debug parameters have been set. Might be useful
 */
function isDebug() {
    if (process.env.NODE_ENV === "development" || process.argv[2] === "--d" || process.argv[2] === "d") {
        process.env.NODE_ENV = "development";
        return true;
    } else {
        return false;
    }
}

module.exports = {
    log,
    isDebug,
    stdOut
};