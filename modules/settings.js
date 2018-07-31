//TODO more settings and read from settings file

var homePath = getUserHome();
var filePath = homePath + "\\Documents\\SteamSwitcher\\";

/** 
 * @returns  String  User home directory
 * 
 */
function getUserHome() {
    return process.env.HOME || process.env.USERPROFILE;
}

module.exports = {
    homePath: homePath,
    filePath: filePath
};