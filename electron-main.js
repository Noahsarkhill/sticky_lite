const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

let backendProcess = null;

function startBackend() {
    const backendPath = path.join(__dirname, "run_backend.py");

    backendProcess = spawn("python3", [backendPath], {
        cwd: __dirname,
        env: {
            ...process.env,
            STICKY_LITE_DATA_DIR: app.getPath("userData"),
        },
        stdio: "inherit",
    });

    backendProcess.on("error", (error) => {
        console.error("Failed to start backend:", error);
    });

    backendProcess.on("exit", (code) => {
        console.log("Backend exited with code:", code);
    });
}


function waitForBackend(retries = 30) {
    return new Promise((resolve, reject) => {
        const tryRequest = () => {
            const request = http.get("http://127.0.0.1:8000/health", (response) => {
                if (response.statusCode === 200) {
                    resolve();
                } else {
                    retry();
                }
            });

            request.on("error", retry);

            request.setTimeout(1000, () => {
                request.destroy();
                retry();
            });
        };

        const retry = () => {
            if (retries <= 0) {
                reject(new Error("Backend did not start in time"));
                return;
            }

            retries -= 1;
            setTimeout(tryRequest, 500);
        };

        tryRequest();
    });
}


function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
    });

    mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));
    
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
    startBackend();

    try {
        await waitForBackend();
        createWindow();
    } catch (error) {
        console.error(error);
        app.quit();
    }
});


app.on("before-quit", () => {
    if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});