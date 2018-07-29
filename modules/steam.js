/**
Liam McLeod, 2018.
*/
const fs = require('fs');

const account = require('./account');
const crypto = require('./crypto');
const log = require('./log');

/**
 * @param  id	 String     id of account
 * @param  cb    Function   callback to closeSteam
 * 
 * Checks is Steam is open
 */
function steamExists(id, cb) {
    var exec = require('child_process').exec;
    exec('tasklist', function(err, stdout, stderr) {
        var steamExists = false;
        if (err) {
            log(err);
        }
        if (stdout) {
            // log(stdout);
            if (stdout.match("Steam.exe")) {
                steamExists = true;
            }
        }
        if (stderr) {
            log(stderr);
        }
        cb(id, steamExists);
    });
}

/**
 * @param  id 	 String     id of account
 * @param  cb    Function   callback to openSteam
 * 
 * Closes Steam if it is found to be open
 */
function closeSteam(id, cb) {
    var exec = require('child_process').exec;
    exec('taskkill /F /IM Steam.exe', function(err, stdout, stderr) {
        if (err) {
            log(err);
        }
        if (stdout) {
            log(stdout);
        }
        if (stderr) {
            log(stderr);
        }
        cb(id);
    });
}


/**
 * @param  id  String  id of account
 * 
 * Opens Steam passes username and password as launch parameters
 * as specified in the link below
 * https://support.steampowered.com/kb_article.php?ref=5623-QOSV-5250
 */
function openSteam(id) {
    // createNotification();
    var child = require("child_process").spawn;

    //!Decrypt here

    var acc = account.getAccountById(id);
    var key = crypto.createKey(acc.key);
    var pass = crypto.decryptPass(key, acc.password);
    var user = acc.username;

    //* Exe Location + Launch Params 
    var executablePath =
        'C:\\Program Files (x86)\\Steam\\Steam.exe';
    var parameters = ["-login", user, pass];

    /**
     * Spawn and unref were chosen so that users can 
     * close the app without closing child process
     */

    var steam = child(executablePath, parameters, {
            detached: true,
            stdio: 'ignore'
        }, () => {
            log(steam);
        })
        .on('close', (code) => {
            mainWindow.setOverlayIcon(path.join(__dirname, "redoverlay.png"), 'Steam Switcher');
        }).unref();
    mainWindow.setOverlayIcon(path.join(__dirname, "greenoverlay.png"), 'Steam Switcher');
}

module.exports = {
    closeSteam: closeSteam,
    openSteam: openSteam,
    steamExists: steamExists
};