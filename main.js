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


const path = require('path');
const fs = require('fs');

const crypto = require('./modules/crypto');

var accountsStore = [];
var userId = '';

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
//TODO separate crypto functions and base it off of below
//* https://stackoverflow.com/questions/5089841/two-way-encryption-i-need-to-store-passwords-that-can-be-retrieved
//TODO modularise

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
    if (process.env.NODE_ENV === "development" || process.argv[2] === "--d") {
        console.log(log);
    }
}

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
        title: "Steam Switcher"
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
    // log(process.env.NODE_ENV || process.argv[2]);
    log("Debug: True");
    //* Create folder if necessary
    crypto.checkFirstRun();
    //* Retrieve data
    updateStore();
    //* Get Id
    userId = crypto.getId();
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
        //* Delete index
        account.splice(i, 1);
        //* Write changes
        storeAccount(account, true);
    }
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
                //* Show Window
                mainWindow.show();
                //* Remove Tray Icon
                tray.destroy();
            }
        },
        {
            label: 'Quit',
            click: function() {
                //* Quit
                app.quit();
            }
        },
    ];
    //* Generate additional menu items
    if (accountsStore) {
        accountsStore.forEach(function(item) {
            menuItems.unshift({
                label: 'Launch ' + item.name,
                click: function() {
                    //* Launch Steam Account with ID
                    launchSteam(item.id);
                }
            });
        });
    }

    //* Create Menu
    var contextMenu = Menu.buildFromTemplate(menuItems);
    tray.setContextMenu(contextMenu);

    //* Add Listeners
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
        //*Begin with Steam
        steamExists(id, function(id, steamExists) {
            if (steamExists) {
                closeSteam(function(id) {
                    openSteam(id);
                });
            }
            openSteam(id);
        });
    }
}

/**
 * @param  user  String  username of account
 * @param  pass  String  password of account
 * 
 * Opens Steam passes username and password as launch parameters
 * as specified in the link below
 * https://support.steampowered.com/kb_article.php?ref=5623-QOSV-5250
 */
function openSteam(id) {
    createNotification();
    var child = require("child_process").spawn;

    //!Decrypt here

    var account = getAccountById(id);
    var key = crypto.createKey(account.key);
    var pass = crypto.decryptPass(key, account.password);
    var user = account.username;

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

/**
 * @param  user  String     username of account
 * @param  pass  String     password of account
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
 * @param  user  String     username of account
 * @param  pass  String     password of account
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
 * Simple Notification from Electron Docs
 */
function createNotification() {
    if (Notification.isSupported()) {
        var notification = new Notification('Launching Steam...', {
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

/**
 * Populate storage array
 * using getAccount
 */
function updateStore() {
    if (hasAccounts()) {
        accountsStore = getAccount();
    }
}



//* Event Listeners & Inter-Proc Comms
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
            proc.post.id = crypto.generateId(2, 'hex');

            //* Generate & Store Key
            proc.post.key = crypto.generateId(20);
            //* Hash Key 
            var key = crypto.createKey(proc.post.key);

            //* Encrypt
            proc.post.password = crypto.encryptPass(key, proc.post.password);

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
//* main process, for example app/main.js