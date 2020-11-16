const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow = null;

function createWindow () {
  console.log('creating window');
  mainWindow = new BrowserWindow({
    width: isDev ? 1100 : 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.removeMenu();
  }
  mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('open-dialog', (event, stateProperty) => {
  dialog.showOpenDialog({
    properties: [
      'openDirectory',
    ],
  }).then(result => {
    mainWindow.webContents.send('finish-dialog', {
      stateProperty,
      path: result.canceled ? false : result.filePaths[0],
    });
  }).catch(err => {
    console.log(err);
    mainWindow.webContents.send('finish-dialog', {
      stateProperty,
      path: false,
    });
  })
})