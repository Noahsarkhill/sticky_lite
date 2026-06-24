const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
    });

    mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));
    
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
});