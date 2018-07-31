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

//* Misc Imports
const path = require('path');
const fs = require('fs');

//* My Modules
const crypto = require('./modules/crypto');
const steam = require('./modules/steam');
const account = require('./modules/account');
const init = require('./modules/init');

//* Stores
var accountsStore = [];
var userId = '';

//* TODOS
//todo look into below reg to remember based upon the 
//todo value of index.remember
//? https://github.com/CatalystCode/windows-registry-node
//reg add "HKCU\Software\Valve\Steam" / v AutoLoginUser / t REG_SZ / d % username % /f
//reg add "HKCU\Software\Valve\Steam" / v RememberPassword / t REG_DWORD / d 1 / f

//todo improve the storage code it's messy and I've forgotten my logic behind it

// TODO CHECK said ID is UNIQUE

//? Maybe obfuscate JSON Storage ??
//https://github.com/mongodb-js/objfuscate

//TODO Maybe bcrypt the key

//TODO separate crypto functions and base it off of below
//* https://stackoverflow.com/questions/5089841/two-way-encryption-i-need-to-store-passwords-that-can-be-retrieved

//todo move IPC stuff to controller maybe?

//todo settings file

/** 
 * Import my own log system, just to ensure 
 * no or data make it out of the application
 */
const {
    log,
    isDebug
} = require('./modules/log');

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
        resizable: false,
        fullscreenable: false,
        icon: __dirname + "/icon.png",
        title: "Steam Switcher",
        backgroundColor: '#303030',
        webPreferences: {
            darkTheme: true,
            fullscreenable: false,
            devTools: isDebug(),
            nodeIntegration: true,

        }
    });

    //* and load the index.html of the app.
    mainWindow.loadFile('index.html');

    //* Misc Window  things
    mainWindow.setMenu(null);

    //* Open the DevTools.
    //! But must be off when debugging with VS Code
    // mainWindow.webContents.openDevTools();


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
    log("Debug: " + isDebug());
    //* Create folder if necessary
    init.checkFirstRun();
    //* Retrieve data
    accountsStore = account.updateStore();
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

app.once('ready-to-show', () => {
    // mainWindow.show();
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
    //! account. here might have to go
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
        //! ERROR MSG HERE
        return;
    } else {
        //*Begin with Steam
        steam.steamExists(id, function(id, steamExists) {
            if (steamExists) {
                steam.closeSteam(id, function(id) {
                    steam.openSteam(id);
                });
            }
            steam.openSteam(id);
        });
    }
}

//* Steam Events
const steamOpen = require('./modules/steam').openEvent;
const steamClose = require('./modules/steam').closeEvent;
steamOpen.on('steamOpen', (e) => {
    mainWindow.setOverlayIcon(path.join(__dirname, "greenoverlay.png"), 'Steam Switcher');
});

steamClose.on('steamClose', (e) => {
    mainWindow.setOverlayIcon(path.join(__dirname, "greenoverlay.png"), 'Steam Switcher');
});

//* Event Listeners & Inter-Proc Comms
const {
    ipcMain
} = require('electron');

//* Listener on the mainProcess to recieve renderProcess data
ipcMain.on('request-mainprocess-action', (event, proc) => {
    //* Basic controller for 
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
            accountsStore = account.updateStore();
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
            //? Maybe move to a CB for deleteAccount
            accountsStore = account.updateStore();
            //* Refresh
            mainWindow.reload();
        }
    }
});

//* DOM ready, Get accounts to display
ipcMain.on('dom-ready', () => {
    var accounts = account.getAccount();
    /** 
     * Flag for rendering engine to know where templates are stored based 
     * as this differs between production and dev due to compiling
     */
    accounts.unshift(process.env.NODE_ENV);
    mainWindow.webContents.send('ping', accounts);
});

//* Request to refresh
ipcMain.on('refresh', () => {
    mainWindow.reload();
});

//! When complete use electron-winstaller to build exes
//? https://github.com/electron/windows-installer
//* main process, for example app/main.js
// var electronInstaller = require('electron-winstaller');
// resultPromise = electronInstaller.createWindowsInstaller({
//     appDirectory: './dist/SteamSwitch-win32-x64',
//     outputDirectory: './dist/installer64',
//     authors: 'Liam McLeod',
//     exe: 'SteamSwitch.exe',
//     setupMsi: 'SteamSwitch_installer.msi',
//     setupExe: 'SteamSwitch_installer.exe'
// });

// resultPromise.then(() => console.log("Success!"), (e) => console.log(`Failed: ${e.message}`));