const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const extractZip = require('./extract');
const organize = require('./organize');

let mainWindow = null;

function createWindow () {
  console.log('creating window');
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 620,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.webContents.openDevTools();
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
  });
});

ipcMain.handle('extract', (event, zipFolderPath, unzipFolderPath) => {
  extractZip(zipFolderPath, unzipFolderPath, (report) => {
    if (typeof report.error === 'undefined') {
      mainWindow.webContents.send('progress', report);
    } else {
      console.error(report.message, report.error);
      mainWindow.webContents.send('file-error', report);
    }
  });
});

ipcMain.handle('organize', (event, unzipFolderPath, organizeIntoPath, renameStrategy, insertExif = false) => {
  organize(unzipFolderPath, organizeIntoPath, renameStrategy, insertExif, (report) => {
    if (typeof report.error === 'undefined') {
      mainWindow.webContents.send('progress', report);
    } else {
      console.error(report);
      // mainWindow.webContents.send('file-error', report);
    }
  });
});

ipcMain.handle('open-folder', (event, folderPath) => {
  shell.openPath(folderPath);
});