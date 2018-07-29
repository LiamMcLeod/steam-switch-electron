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
const steam = require('./modules/steam');
const account = require('./modules/account');

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

const log = require('./modules/log');

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
    if (account.accountsStore) {
        account.accountsStore.forEach(function(item) {
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
 * @param  id  String  ID of account
 * 
 * Launches Steam logging into account with ID
 */
function launchSteam(id) {
    if (!id) {
        return;
    } else {
        //*Begin with Steam
        steam.steamExists(id, function(id, steamExists) {
            if (steamExists) {
                steam.closeSteam(function(id) {
                    steam.openSteam(id);
                });
            }
            steam.openSteam(id);
        });
    }
}

/**
 * Populate storage array
 * using getAccount
 */
function updateStore() {
    if (account.hasAccounts()) {
        accountsStore = account.getAccount();
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

            account.storeAccount(proc.post);
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
            account.deleteAccount(proc.delete);
            updateStore();
            //* Refresh
            mainWindow.reload();
        }
    }
});

ipcMain.on('dom-ready', () => {
    var accounts = account.getAccount();
    mainWindow.webContents.send('ping', accounts);
});

ipcMain.on('refresh', () => {
    mainWindow.reload();
});

//! When complete use electron-winstaller to build exes
//? https://github.com/electron/windows-installer
//* main process, for example app/main.js