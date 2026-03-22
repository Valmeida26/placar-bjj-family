const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let displayWindow;

function createWindows() {
    //TELA 1 (CONTROLE)
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        fullscreen: true, // coloque true se quiser abrir direto em tela cheia
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    //TELA 2 (PLACAR)
    displayWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    displayWindow.loadFile(path.join(__dirname, 'display.html'));
}

// Criar janelas quando o app estiver pronto
app.whenReady().then(() => {
    createWindows();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindows();
    });
});

// Fechar o app quando todas as janelas forem fechadas
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});