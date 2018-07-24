// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  webContents
} = require('electron');

const {
  machineId,
  machineIdSync
} = require('node-machine-id');

const path = require('path');
const fs = require('fs');
const url = require('url');
const crypto = require("crypto");
const uuid = require("uuid");
const sha256 = require('sha256');
const aes256 = require('aes256');
var id = '';
//!remove when done
process.env.NODE_ENV = "development";

//TODO REMEMBER PASSWORD BOX REFER TO BELOW
//*https://github.com/W3D3/SteamAccountSwitcher2/issues/4

function log(log) {
  if (process.env.NODE_ENV == "development")
    console.log(log);
}
// const Store = require('store.js');

let hardwareId = machineIdSync()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 480,
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


  //* Main Window Event Listeners
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
  checkFirstRun();
  id = createKey(id);
  console.log(process.env.NODE_ENV);
  createWindow();
  // account = getAccount();
  // //! https://electronjs.org/docs/api/web-contents
  // mainWindow.webContents.send('ping', account);
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
  var filePath = homePath + "\\Documents\\SteamSwitcher\\";
  if (fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + "\\.id")) {
      id = fs.readFileSync(filePath + "\\.id", 'utf8');
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

// Get All Accounts
function readAccount() {
  var homePath = process.env.Home;
  var filePath = homePath + "\\Documents\\SteamSwitcher\\";
  if (fs.existsSync(filePath + "\\.account")) {
    account = fs.readFileSync(filePath + "\\.account", 'utf8');
    return account;
  } else {
    return {}
  }
}

// Get All Accounts and divide into array 
function getAccount() {
  var account = readAccount();
  var accounts = []
  if (account.length) {
    account = account.split(account.indexOf('}'));
    //account= JSON.parse(account));
    // console.log(account[0]);
  }
  // todo finish
  // accounts.push(JSON.parse(account));
  return account;
}

function getAccountById(id) {
  var account = readAccount();
  account = JSON.parse(account);
  //* Returns index
  var i = account.findIndex(function (index) {
    if (index.id == id) {
      //log(item);
      //log("match")
      return index;
    }
    //todo look into below reg to remember based upon the 
    //todo value of index.remember
    //reg add "HKCU\Software\Valve\Steam" / v AutoLoginUser / t REG_SZ / d % username % /f
    //reg add "HKCU\Software\Valve\Steam" / v RememberPassword / t REG_DWORD / d 1 / f

  });
  // log(account[i]);
  return account[i];
}

function createKey(key = id) {
  // console.log(sha256(hardwareId.concat(key)).toString('hex'));
  return sha256(hardwareId.concat(key)).toString('hex');
}

function makeDir(filePath) {
  fs.mkdirSync(filePath);
}

function makeFile(filePath) {
  fs.writeFile(filePath + "\\.id", generateId(20), function (err) {
    if (err) {
      return console.log(err);
    }
  })
}

function createTray(event) {
  var tray = new Tray(path.join(__dirname, "favicon.ico"));
  // TODO Dynamically generate this with accounts in
  var contextMenu = Menu.buildFromTemplate([{
      label: 'Launch Steam',
      click: function () {
        // Test Menu
        launchSteam();
      },
    }, {
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

function launchSteam(id) {
  if (!id) {
    return
  } else {
    var account = getAccountById(id);
    var user = account.username;
    var pass = account.password;

    decryptKey = createKey(account.key);
    pass = aes256.decrypt(decryptKey, pass);

    log(user);
    // log(pass);
    steamExists(user, pass, function (steamExists, user, pass) {
      log(steamExists);
      if (steamExists) {
        closeSteam(user, pass, function (user, pass) {
          openSteam(user, pass);
        });
      }
      openSteam(user, pass);
    });
  }
}

function openSteam(user, pass) {
  var child = require("child_process").execFile;
  var executablePath =
    'C:\\Program Files (x86)\\Steam\\Steam.exe';
  var parameters = ["-login", user, pass];
  // var parameters = ["-login " + user + " " + pass];

  child = child(executablePath, parameters, {
    killSignal: null
  }, function (err, data) {
    //!COMMENT WHEN DONE
    log(parameters)
    if (err)
      log(err);
    //!COMMENT WHEN DONE
    if (data) {
      log(data.toString());
      //!COMMENT WHEN DONE
    }
  });
  // createNotification();
}

function steamExists(user, pass, cb) {
  var exec = require('child_process').exec;
  exec('tasklist', function (err, stdout, stderr) {
    var steamExists = false;
    if (err)
      log(err);
    if (stdout) {
      // log(stdout);
      if (stdout.match("Steam.exe")) {
        log("Steam Found");
        steamExists = true;
      }
    }
    if (stderr)
      log(stderr);

    cb(steamExists, user, pass)
  });
}

function closeSteam(user, pass, cb) {
  var exec = require('child_process').exec;
  exec('taskkill /F /IM Steam.exe', function (err, stdout, stderr) {
    if (err)
      log(err);
    if (stdout)
      log(stdout);
    if (stderr)
      log(stderr);

    cb(user, pass)
  });
}

function createNotification() {
  var myNotification = new Notification('The Title!', {
    icon: __dirname + '/icon.png',
    body: 'Your notification body'
  });
  myNotification.show();
}

function generateId(length, enc = 'hex') {
  return crypto.randomBytes(length).toString(enc);
}

function storeAccount(account) {
  // TODO CHECK IF EXISTS AND APPEND
  var homePath = process.env.Home;
  var filePath = homePath + "\\Documents\\SteamSwitcher\\";
  var accounts = []
  if (fs.existsSync(filePath + "\\.account")) {
    // console.log("append")
    var existingAccounts = JSON.parse(readAccount());
    if (!existingAccounts.length) {
      accounts.push(existingAccounts);
      accounts.push(account)
    } else {
      for (let i = 0; i < existingAccounts.length; i++) {
        accounts.push(existingAccounts[i]);
      }
      accounts.push(account);
    }
    fs.writeFile(filePath + "\\.account", JSON.stringify(accounts), function (err) {
      if (err)
        return console.log(err);
    })
  } else {
    var accounts = [];
    accounts = JSON.parse(JSON.stringify(account));
    fs.writeFile(filePath + "\\.account", JSON.stringify(accounts), function (err) {
      if (err)
        return console.log(err);
    })
  }
}

// main process, for example app/main.js
//* Event Listeners
const {
  ipcMain
} = require('electron');

// Listener on the mainProcess to recieve renderProcess data
ipcMain.on('request-mainprocess-action', (event, proc) => {
  //TODO logic for communicating between main proc and render
  if (proc) {
    if (proc.id) {
      //TODO CHECK FOR STEAM INSTANCE AND CLOSE
      launchSteam(proc.id);
    }
    if (proc.post) {
      //* Generate Id
      // TODO CHECK UNIQUE
      proc.post.id = generateId(2, 'hex')

      // TODO MAKE BETTER CRYPTO function
      //* Generate Key 
      var key = generateId(20);
      //* Store Key 
      proc.post.key = key;
      //* Hash Key 
      console.log(proc.post.key);
      //? Maybe Concat ID, might be overkill
      encKey = createKey(proc.post.key);
      //* Encrypt PW
      var encrypted = aes256.encrypt(encKey, proc.post.password);
      proc.post.password = encrypted;
      // console.log(JSON.stringify(proc.post))

      //? Maybe obfuscate result
      //https://github.com/mongodb-js/objfuscate

      storeAccount(proc.post);

      // decryptKey = createKey(proc.post.key);
      // var decrypted = aes256.decrypt(decryptKey, encrypted);
      // console.log("Encrypted: " + encrypted);
      // console.log("Decrypted: " + decrypted);
    }
    if (proc.get) {
      // console.log(proc.get);
    }
    if (proc.put) {
      // console.log(proc.put);
    }
    if (proc.delete) {
      // console.log(proc.delete);
    }
  }
  //**http://electron.rocks/different-ways-to-communicate-between-main-and-renderer-process/ */

});

ipcMain.on('dom-ready', () => {
  account = getAccount();
  // account = readAccount();
  mainWindow.webContents.send('ping', account);
})
//! When complete use electron-winstaller to build exes
//? https://github.com/electron/windows-installer