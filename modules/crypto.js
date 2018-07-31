/**
Liam McLeod, 2018.
*/

const crypto = require("crypto");
const sha256 = require('sha256');
const aes256 = require('aes256');
const base64 = require('base-64');
const utf8 = require('utf8');
const fs = require('fs');

const {
    machineIdSync
} = require('node-machine-id');

const {
    log
} = require('./log');

const init = require('./init');

//* Get HW Id
let hardwareId = machineIdSync();

//* Get Id
var id = getId();

//Import filePath
var filePath = init.filePath;

/**
 * @param  length  int  length of id
 * @param  pass    int  encoding of id
 * 
 * Closes Steam if it is found to be open
 */
function generateId(length, enc = 'hex') {
    return crypto.randomBytes(length).toString(enc);
}

function encryptPass(key, pass) {
    var encKey = key;
    pass = utf8.encode(pass);
    pass = base64.encode(pass);
    pass = aes256.encrypt(encKey, pass);
    return pass;
}

function decryptPass(key, pass) {
    var decKey = key;
    pass = aes256.decrypt(decKey, pass);
    pass = utf8.encode(pass);
    pass = base64.decode(pass);
    return pass;
}

/**
 * @param  key  String to concat to HWId
 * 
 * @returns String sha256 hash to be used as key
 * 
 * Uses sha256 to create a hash of hwid and psuedo
 * random key to be used as a key for encryption
 */
function createKey(key) {
    return sha256(hardwareId.concat(key.concat(id))).toString('hex');
}

function getId() {
    if (fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + "\\.id")) {
            id = fs.readFileSync(filePath + "\\.id", 'utf8');
            return id;
        }
    }
}

module.exports = {
    createKey: createKey,
    decryptPass: decryptPass,
    encryptPass: encryptPass,
    generateId: generateId,
    getId: getId
};