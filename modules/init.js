/**
Liam McLeod, 2018.
*/

const fs = require('fs');

const {
    randomBytes
} = require('crypto');
const account = require('./account');

const settings = require('./settings');
const filePath = settings.filePath;

const {
    log
} = require('./log');

/**
 * Checks if this is the first time the user has run the app
 * so that the necessary keys and directories can be made.
 * ? Maybe switch to graceful-fs??
 */
function checkFirstRun() {
    if (fs.existsSync(filePath)) {
        if (!fs.existsSync(filePath + ".id")) {
            makeId();
            checkFirstRun();
        }
        if (!fs.existsSync(filePath + ".account")) {
            makeStorage();
            checkFirstRun();
        }
        if (!fs.existsSync(filePath + "settings.ini")) {
            makeSettings();
            checkFirstRun();
        }
    } else {
        makeDir();
        makeId();
        makeStorage();
        makeSettings();
        checkFirstRun();
    }
}

/**
 * @param  filePath  String  path to make file in
 * 
 * Makes id file to be used in key generation
 */
function makeId() {
    fs.writeFile(filePath + ".id", randomBytes(20).toString('hex'), function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

/**
 * @param  filePath  String  path to make file in
 * 
 * Makes id file to be used in key generation
 */
function makeStorage() {
    fs.writeFile(filePath + ".account", "[]", function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

/**
 * @param  filePath  String  path to make file in
 * 
 * Makes id file to be used in key generation
 */
function makeSettings() {
    // todo hardcode settings for first run
    var settings = {};
    fs.writeFile(filePath + "settings.ini", settings, function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

/**
 * @param  filePath  String  path to make dir in
 * 
 * Makes dir in filePath
 */
function makeDir() {
    fs.mkdirSync(filePath);
}

module.exports = {
    checkFirstRun: checkFirstRun,
    makeDir: makeDir,
    makeId: makeId,
    makeStorage: makeStorage,
};