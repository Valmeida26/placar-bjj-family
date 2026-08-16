const { app, BrowserWindow } = require('electron')
const path = require('path')

app.setPath(
    'userData',
    path.join(app.getPath('appData'), 'BJJ Family - 1 Tela')
);

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
}

function createWindow () {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        fullscreen: true, // mude para true se quiser abrir direto em tela cheia
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})