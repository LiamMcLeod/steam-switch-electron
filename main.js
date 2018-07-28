/**
Liam McLeod, 2018.
*/
//* Modules to control application life and create native browser window
const {
    app,
    BrowserWindow,
    Menu,
    Tray,
    Notification,
    globalShortcut
} = require('electron');

const {
    machineIdSync
} = require('node-machine-id');

const path = require('path');
const fs = require('fs');
const url = require('url');
const crypto = require("crypto");
const uuid = require("uuid");
const sha256 = require('sha256');
const aes256 = require('aes256');
const base64 = require('base-64');
const utf8 = require('utf8');

var id = '';
var accountsStore = [];

//TODO REMEMBER PASSWORD BOX REFER TO BELOW

//todo look into below reg to remember based upon the 
//todo value of index.remember
//reg add "HKCU\Software\Valve\Steam" / v AutoLoginUser / t REG_SZ / d % username % /f
//reg add "HKCU\Software\Valve\Steam" / v RememberPassword / t REG_DWORD / d 1 / f
//todo resolve int json problem whenever any input data is int
//todo improve the storage code it's messy and I've forgotten my logic behind it
//TODO logic for communicating between main proc and render

// TODO MAKE BETTER CRYPTO function
//? Maybe Concat ID, might be overkill
// TODO CHECK said ID is UNIQUE
//? Maybe obfuscate result
//TODO Maybe bcrypt the key
//https://github.com/mongodb-js/objfuscate
//TODO separate crypo functions and base it off of below
//* https://stackoverflow.com/questions/5089841/two-way-encryption-i-need-to-store-passwords-that-can-be-retrieved

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
    if (process.env.NODE_ENV === "development") {
        console.log(log);
    }
}

//* Get HW Id
let hardwareId = machineIdSync();

/** 
 * Keep a global reference of the window object, if you don't, the window will
 * be closed automatically when the JavaScript object is garbage collected.
 */
let mainWindow;

function createWindow() {
    //* Create the browser window.
    mainWindow = new BrowserWindow({
        width: 480,
        height: 380,
        resizable: false, //!Uncomment when complete
        fullscreenable: false,
        icon: __dirname + "/icon.png",
        title: "Steam Switcher v1"
    });

    //* and load the index.html of the app.
    mainWindow.loadFile('index.html');

    //* Misc Window  things
    mainWindow.setMenu(null);

    //* Open the DevTools.
    //! But must be off when debugging with VS Code
    //mainWindow.webContents.openDevTools(); 


    //* Main Window Event Listeners
    mainWindow.on('minimize', (e) => {
        e.preventDefault();
        //* Create tray icon,
        createTray(e);
        //* Hide Window
        mainWindow.hide();
    });

    //* Emitted when the window is closed.
    mainWindow.on('closed', () => {
        /** 
         * Dereference the window object, usually you would store windows
         * in an array if your app supports multi windows,  is the time
         * when you should delete the corresponding element.
         */
        mainWindow = null;
    });
}

/**
 * Method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after  event occurs.
 */
app.on('ready', () => {
    log(process.env.NODE_ENV + ": true");
    //* Create folder if necessary
    checkFirstRun();
    //* Retrieve data
    updateStore();
    //* Create key
    id = createKey(id);
    //* Create window
    createWindow();

    /** 
     * Needed to refresh during dev
     * so that event listeners are 
     * applied to the renderer
     */
    var reload = () => {
        mainWindow.reload();
    };

    globalShortcut.register('F5', reload);
    globalShortcut.register('CommandOrControl+R', reload);

});

//* Quit when all windows are closed.
app.on('window-all-closed', () => {
    /** 
     * On OS X it is common for applications and their menu bar
     * to stay active until the user quits explicitly with Cmd + Q
     */
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    /**
     * On OS X it's common to re-create a window in the app when the
     * dock icon is clicked and there are no other windows open.
     */
    if (mainWindow === null) {
        createWindow();
    }
});

/** 
 *  In file you can include the rest of your app's specific main process
 *  code. You can also put them in separate files and require them here.
 */
function checkFirstRun() {
    var homePath = process.env.Home;
    var filePath = homePath + "\\Documents\\SteamSwitcher\\";
    // log(filePath);
    if (fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + "\\.id")) {
            id = fs.readFileSync(filePath + "\\.id", 'utf8');
            return true;
        } else {
            makeFile(filePath);
            checkFirstRun();
        }
    } else {
        makeDir(filePath);
        makeFile(filePath);
        checkFirstRun();
    }
}

/**
 * @returns    Boolean  Accounts exist?
 * 
 * Check if accounts exist
 */
function hasAccounts() {
    var homePath = process.env.Home;
    var filePath = homePath + "\\Documents\\SteamSwitcher\\";
    if (fs.existsSync(filePath + "\\.account")) {
        var accounts = fs.readFileSync(filePath + "\\.account", 'utf8');
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
 * @returns Object account sought by user
 * 
 * Gets account for misc purposes
 */
function readAccount() {
    var account = null;
    var homePath = process.env.Home;
    var filePath = homePath + "\\Documents\\SteamSwitcher\\";
    if (fs.existsSync(filePath + "\\.account")) {
        account = fs.readFileSync(filePath + "\\.account", 'utf8');

        if (typeof(account) === "string" && account != "") {
            account = JSON.parse(account);
            return account;
        } else {
            return account;
        }
    } else {
        return {};
    }
}

/*
 ? Initially meant to return the object rather than 
 ? string but I just moved it to the main readAccount
 */
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
 * @param  id  string  id of account to get
 * 
 * @returns Object account sought by user
 * 
 * Gets account by id
 */
function getAccountById(id) {
    var account = readAccount();
    account = account;
    //* Returns index
    var i = account.findIndex(function(index) {
        if (index.id == id) {
            return index;
        }
    });
    return account[i];
}

/**
 * @param  id  string  id of account to delete
 * 
 * Deletes account by id, calls to 
 * storeAccount to write the changes
 */
function deleteAccount(id) {
    var account = readAccount();

    var i = account.findIndex(function(index) {
        //* Returns index
        if (index.id == id) {
            return index;
        }
    });
    if (i && account[i]) {
        account.splice(i, 1);
        storeAccount(account, true);
    }
}

/**
 * @param  key  String to concat to HWId
 //! id defunct was for when half of the key was stored
 * @returns String sha256 hash to be used as key
 * 
 * Uses sha256 to create a hash of hwid and psuedo
 * random key to be used as a key for encryption
 */
function createKey(key = id) {
    return sha256(hardwareId.concat(key)).toString('hex');
}

/**
 * @param  filePath  String  path to make dir in
 * 
 * Makes dir in filePath
 */
function makeDir(filePath) {
    fs.mkdirSync(filePath);
}

/**
 * @param  filePath  String  path to make file in
 * 
 * Makes id file to be used in key generation
 */
function makeFile(filePath) {
    fs.writeFile(filePath + "\\.id", generateId(20), function(err) {
        if (err) {
            return log(err);
        }
    });
}

/**
 * @param  e  Object  Event
 * 
 * Create tray icon complete with  
 * menu items + accounts if exists
 */
function createTray(e) {
    var tray = new Tray(path.join(__dirname, "favicon.ico"));
    //* Default Context Menu
    var menuItems = [{
            label: 'Show',
            click: function() {
                // Show Window
                mainWindow.show();
                // Remove Tray Icon
                tray.destroy();
            }
        },
        {
            label: 'Quit',
            click: function() {
                // Quit
                app.quit();
            }
        },
    ];
    //* If they have accounts generate additional menu items
    if (accountsStore) {
        accountsStore.forEach(function(item) {
            menuItems.unshift({
                label: 'Launch ' + item.name,
                click: function() {
                    launchSteam(item.id);
                }
            });
        });
    }
    var contextMenu = Menu.buildFromTemplate(menuItems);
    tray.setContextMenu(contextMenu);
    tray.on('right-click', (e) => {
        tray.popUpContextMenu(contextMenu);
    });
    tray.on('double-click', (e) => {
        mainWindow.show();
        tray.destroy();
    });
}

/**
 * @param  id  String  ID of account
 * 
 * Launches Steam logging into account with ID
 */
function launchSteam(id) {
    if (!id) {
        return;
    } else {
        var account = getAccountById(id);
        var user = account.username;
        var pass = account.password;

        //* Decrypt Key move later
        var decryptKey = createKey(account.key);
        pass = aes256.decrypt(decryptKey, pass);
        pass = base64.decode(pass);


        steamExists(user, pass, function(steamExists, user, pass) {
            if (steamExists) {
                closeSteam(user, pass, function(user, pass) {
                    openSteam(user, pass);
                });
            }
            openSteam(user, pass);
        });
    }
}

/**
 * @param  user  String  username of account
 * @param  pass  String  password of account
 * 
 * Opens Steam passes username and password as launch parameters
 * as set down in the link below
 * https://support.steampowered.com/kb_article.php?ref=5623-QOSV-5250
 */
function openSteam(user, pass) {
    createNotification();
    mainWindow.setOverlayIcon(path.join(__dirname, "greenoverlay.png"), 'Steam Switcher');
    var child = require("child_process").spawn;
    var executablePath =
        'C:\\Program Files (x86)\\Steam\\Steam.exe';
    var parameters = ["-login", user, pass];

    /**
     * Spawn and unref were chosen so that users can 
     * close the app without closing child process
     */
    child = child(executablePath, parameters, {
        detached: true,
        stdio: 'ignore'
    }).unref();

    //TODO todo event to pick up on steam close
    // child.on('close', () => {
    //     mainWindow.setOverlayIcon(path.join(__dirname, "redoverlay.png"), 'Steam Switcher');
    // });
}

/**
 * @param  user  String     username of account
 * @param  pass  String     password of account
 * @param  cb    Function   callback to closeSteam
 * 
 * Checks is Steam is open
 */
function steamExists(user, pass, cb) {
    var exec = require('child_process').exec;
    exec('tasklist', function(err, stdout, stderr) {
        var steamExists = false;
        if (err) {
            log(err);
        }
        if (stdout) {
            // log(stdout);
            if (stdout.match("Steam.exe")) {
                // log("Steam Found");
                steamExists = true;
            }
        }
        if (stderr) {
            log(stderr);
        }
        cb(steamExists, user, pass);
    });
}

/**
 * @param  user  String     username of account
 * @param  pass  String     password of account
 * @param  cb    Function   callback to openSteam
 * 
 * Closes Steam if it is found to be open
 */
function closeSteam(user, pass, cb) {
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

        mainWindow.setOverlayIcon(path.join(__dirname, "redoverlay.png"), 'Steam Switcher');
        cb(user, pass);
    });
}

/**
 * Simple Notification from Electron Docs
 */
function createNotification() {
    if (Notification.isSupported()) {
        var notification = new Notification('Launching Steam', {
            icon: __dirname + '/icon.png',
            body: 'Steam is launching, this shouldn\'t take long...'
        });
        notification.show();

        notification.onclick = () => {
            notification.hide();
        };
    }
}

/**
 * @param  length  int  length of id
 * @param  pass    int  encoding of id
 * 
 * Closes Steam if it is found to be open
 */
function generateId(length, enc = 'hex') {
    return crypto.randomBytes(length).toString(enc);
}

/**
 * @param  account  Object   account to be stored/overwritten
 * @param  del      Boolean  overwrite/delete account 
 * 
 * Writes accounts to file. If del is flagged
 * it will overwrite entire file without object
 * which was requested for deletion
 */
function storeAccount(account, del = false) {
    var homePath = process.env.Home;
    var filePath = homePath + "\\Documents\\SteamSwitcher\\";
    var accounts = [];
    if (account != null && account != "") {
        if (!del) {
            if (fs.existsSync(filePath + "\\.account")) {
                var existingAccounts = readAccount();
                if (!existingAccounts.length) {
                    accounts.push(existingAccounts);
                    accounts.push(account);
                } else {
                    for (let i = 0; i < existingAccounts.length; i++) {
                        accounts.push(existingAccounts[i]);
                    }
                    accounts.push(account);
                }
                fs.writeFile(filePath + "\\.account", JSON.stringify(accounts), function(err) {
                    if (err) {
                        return log(err);
                    }
                });
            } else {
                accounts = JSON.stringify(account);
                fs.writeFile(filePath + "\\.account", JSON.stringify(accounts), function(err) {
                    if (err) {
                        return log(err);
                    }
                });
            }
        } else {
            fs.writeFile(filePath + "\\.account", JSON.stringify(account), function(err) {
                if (err) {
                    return log(err);
                }
            });
        }
    }
}

//* main process, for example app/main.js
//* Event Listeners
const {
    ipcMain
} = require('electron');

//* Listener on the mainProcess to recieve renderProcess data
ipcMain.on('request-mainprocess-action', (event, proc) => {

    if (proc) {
        if (proc.id) {
            launchSteam(proc.id);
        }
        if (proc.post) {
            //* Generate Id
            proc.post.id = generateId(2, 'hex');

            //* Generate Key 
            var key = generateId(20);

            //* Store Key 
            proc.post.key = key;

            //* Hash Key 
            var encKey = createKey(proc.post.key);

            //* Encrypt PW with an extra layer of difficulty
            var encrypted = utf8.encode(proc.post.password);
            encrypted = base64.encode(encrypted);
            encrypted = aes256.encrypt(encKey, encrypted);
            proc.post.password = encrypted;

            storeAccount(proc.post);
            updateStore();
            //* Refresh
            mainWindow.reload();
        }
        if (proc.get) {
            log(proc.get);
        }
        if (proc.put) {
            log(proc.put);
        }
        if (proc.delete) {
            deleteAccount(proc.delete);
            updateStore();
            //* Refresh
            mainWindow.reload();
        }
    }
});

/**
 * Populate storage array
 * using getAccount
 */
function updateStore() {
    if (hasAccounts()) {
        accountsStore = getAccount();
    }
}

ipcMain.on('dom-ready', () => {
    var account = getAccount();
    // account = readAccount();
    mainWindow.webContents.send('ping', account);
});

ipcMain.on('refresh', () => {
    mainWindow.reload();
});

//! When complete use electron-winstaller to build exes
//? https://github.com/electron/windows-installer