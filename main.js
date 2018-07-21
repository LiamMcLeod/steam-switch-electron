// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu,
  Tray
} = require('electron')

const path = require('path')
const fs = require('fs');
const url = require('url')
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
function createTray(event) {
  var tray = new Tray(path.join(__dirname, "favicon.ico"));

  var contextMenu = Menu.buildFromTemplate([{
      // TODO Dynamically generate this with accounts in
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
    }
  ])
  tray.setContextMenu(contextMenu);
}

//! When complete use electron-winstaller to build exes
//? https://github.com/electron/windows-installer