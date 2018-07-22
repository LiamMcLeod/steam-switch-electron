// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu,
  Tray
} = require('electron')

const path = require('path');
const fs = require('fs');
const url = require('url');
var crypto = require("crypto");
var uuid = require("uuid");
// const Store = require('store.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 380,
    resizable: false, //!Uncomment when complete
    fullscreenable: false,
    icon: __dirname + "/icon.png",
    title: "Steam Switcher v1"
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Misc Window  things
  mainWindow.setMenu(null);

  //! Apply the below when steam is open
  // mainWindow.setOverlayIcon(path.join(__dirname, "favicon.ico"), 'Steam Account Switcher');


  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    // Create tray icon,
    createTray(e)
    // Hide Window
    mainWindow.hide();
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows,  is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

//  method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after  event occurs.
app.on('ready', () => {
  checkFirstRun()
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In  file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//? Maybe generate random encryption key for user through https://api.random.org/api-keys/beta
function checkFirstRun() {
  var homePath = process.env.Home;
  var path = homePath + "\\Documents\\SteamSwitcher";
  if (fs.existsSync(path)) {
    console.log('true')
    //todo get user data
  } else {
    //todo make one
    console.log(false);
    console.log(generateId());
  }
}

function createTray(event) {
  var tray = new Tray(path.join(__dirname, "favicon.ico"));
  // TODO Dynamically generate this with accounts in
  var contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: function () {
        // Show Window
        mainWindow.show();
        // Remove Tray Icon
        tray.destroy();
      }
    },
    {
      label: 'Quit',
      click: function () {
        // Quit
        app.quit()
      }
    },
    {
      label: 'Launch Steam',
      click: function () {
        // Test Menu
        launchSteam();
      },
    }
  ])
  tray.setContextMenu(contextMenu);
  tray.on('right-click', (e) => {
    tray.popUpContextMenu(contextMenu);
  });
  tray.on('double-click', (e) => {
    mainWindow.show();
    tray.destroy();
  });
}

function launchSteam(user, pass) {
  user,
  pass = ""; // TODO Define these 
  var child = require("child_process").execFile;
  var executablePath =
    "C:\\Program Files (x86)\\Steam\\steam.exe";
  var parameters = ["--login" + user + " " + pass];

  child(executablePath, parameters, function (err, data) {
    if (err)
      console.log(err);
    if (data)
      console.log(data.toString());
  });
}

function generateId() {
  return crypto.randomBytes(20).toString('hex');
}

//! When complete use electron-winstaller to build exes
//? https://github.com/electron/windows-installer