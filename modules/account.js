/**
Liam McLeod, 2018.
*/

const fs = require('fs');

const {
    log
} = require('./log');

const settings = require('./settings');
const filePath = settings.filePath;

/**
 * @param  account  Object   account to be stored/overwritten
 * @param  del      Boolean  overwrite/delete account 
 * 
 * Writes accounts to file. If del is flagged
 * it will overwrite entire file without object
 * which was requested for deletion
 */
function storeAccount(account, del = false) {
    //todo problem with deleting first account
    var accounts = [];
    if (account !== null && account !== "") {
        if (!del) {
            if (fs.existsSync(filePath + ".account")) {
                var existingAccounts = readAccount();
                if (!existingAccounts.length && existingAccounts.length != 0) {
                    accounts.push(existingAccounts);
                    accounts.push(account);
                } else {
                    for (let i = 0; i < existingAccounts.length; i++) {
                        accounts.push(existingAccounts[i]);
                    }
                    accounts.push(account);
                }
                fs.writeFile(filePath + ".account", JSON.stringify(accounts), function(err) {
                    if (err) {
                        return log(err);
                    }
                });
            } else {
                accounts = JSON.stringify(account);
                fs.writeFile(filePath + ".account", JSON.stringify(accounts), function(err) {
                    if (err) {
                        return log(err);
                    }
                });
            }
        } else {
            fs.writeFile(filePath + ".account", JSON.stringify(account), function(err) {
                if (err) {
                    return log(err);
                }
            });
        }
    }
}

/**
 * @param  id  string  id of account to delete
 * 
 * Deletes account by id, calls to 
 * storeAccount to write the changes
 */
function deleteAccount(id, cb) {
    var account = readAccount();

    var i = account.findIndex(function(index) {
        //* Returns index
        if (index.id == id) {
            return index;
        }
    });
    if (i >= 0 && account[i]) {
        //* Delete index
        account.splice(i, 1);
        //* Write changes
        storeAccount(account, true);
    }
    if (cb) {
        cb();
    }
}

/**
 * @param  id  String    id of account to get
 * @param  cb  Function  callback
 * 
 * @returns Object account sought by user
 * 
 * Gets account by id
 */
function getAccountById(id, cb = null) {
    var account = readAccount();
    account = account;
    //* Returns index
    var i = account.findIndex(function(index) {
        if (index.id == id) {
            return index;
        }
    });
    if (cb) {
        cb(account[i]);
    }
    if (account[i]) {
        return account[i];
    } else {
        return null;
    }
}

/**
 * @returns Object account sought by user
 * 
 * Gets account for misc purposes 
 * Because habit 
 */
function getAccount() {
    var accounts = readAccount();
    return accounts;
}

/**
 * @returns Object account sought by user
 * 
 * Gets account for misc purposes
 */
function readAccount() {
    var account = null;
    if (fs.existsSync(filePath + ".account")) {
        account = fs.readFileSync(filePath + ".account", 'utf8');
        if (typeof(account) === "string" && account != "") {
            account = JSON.parse(account);
            return account;
        } else {
            return account;
        }
    } else {
        //! USE EVENT TO PARSE ERROR MSG HERE 
    }
}

/**
 * @returns    Boolean  Accounts exist?
 * 
 * Check if accounts exist
 */
function hasAccounts() {
    if (fs.existsSync(filePath + ".account")) {
        var accounts = fs.readFileSync(filePath + ".account", 'utf8');
        if (accounts.length) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Populate storage array
 * using getAccount
 */
function updateStore() {
    if (hasAccounts()) {
        return getAccount();
    }
}

function checkUnique(id) {
    if (getAccountById(id) === null) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    checkUnique: checkUnique,
    deleteAccount: deleteAccount,
    hasAccounts: hasAccounts,
    getAccount: getAccount,
    getAccountById: getAccountById,
    readAccount: readAccount,
    storeAccount: storeAccount,
    updateStore: updateStore
};