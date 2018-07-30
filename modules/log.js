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
    if (process.env.NODE_ENV === "development" || process.argv[2] === "--d" || process.argv[2] === "d") {
        console.log(log);
    }
}


module.exports = log;