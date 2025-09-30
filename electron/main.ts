import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import isDev from 'electron-is-dev';
import './battleLogConverter';
import './cardOperationLogConverter';
import { getGamePath } from './utils';

const GAME_PATH = getGamePath();

let mainWindow: BrowserWindow | null = null;
let floatingWindow: BrowserWindow | null = null;

// Ensure directory exists
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Initialize tracking cards file
async function initTrackingCardsFile() {
  // match histroy tracking
  let filePath = path.join(GAME_PATH, 'match_tracking_cards.json');
  
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
  } catch {
    await fs.writeFile(filePath, '{}', 'utf-8');
  }

  // card deck trackiing
  filePath = path.join(GAME_PATH, 'deck_tracking_cards.json');
  
  try {
    await fs.access(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
  } catch {
    await fs.writeFile(filePath, '{}', 'utf-8');
  }
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    }
  });

  Menu.setApplicationMenu(null);

  // Load React application
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Add error handling
  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error('Load failed:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('preload-error', (_, preloadPath, error) => {
    console.error('Preload script error:', preloadPath, error);
  });
}

function createFloatingWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');

  floatingWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false, // no frame
    alwaysOnTop: true, // always on top
    transparent: true, // transparent background
    resizable: false, // not resizable
    skipTaskbar: true, // not in taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    }
  });

  // load floating window HTML page
  // FIXME: replace with card deck info
  if (isDev) {
    const floatingHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>悬浮窗</title>
        <style>
          body {
            margin: 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-family: Arial, sans-serif;
            border-radius: 10px;
            user-select: none;
            -webkit-app-region: drag;
          }
          .close-btn {
            position: absolute;
            top: 5px;
            right: 10px;
            cursor: pointer;
            font-size: 16px;
            -webkit-app-region: no-drag;
          }
          .content {
            margin-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="close-btn" onclick="window.electronAPI?.closeFloatingWindow()">×</div>
        <div class="content">
          <h3>弈仙牌计牌器</h3>
          <p>悬浮窗口</p>
        </div>
        <script>
          // 防止拖拽时选中文本
          document.addEventListener('selectstart', e => e.preventDefault());
        </script>
      </body>
      </html>
    `;
    floatingWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(floatingHTML));
  } else {
    const floatingPath = path.join(__dirname, '..', 'floating.html');
    floatingWindow.loadFile(floatingPath);
  }

  // set window position (top right)
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  floatingWindow.setPosition(width - 320, 20);

  floatingWindow.on('closed', () => {
    floatingWindow = null;
  });
}

// Initialize application
app.whenReady().then(async () => {
  await ensureDirectoryExists(GAME_PATH);
  await initTrackingCardsFile();
  createWindow();
  createFloatingWindow();
  require('./battleLogConverter');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    createFloatingWindow();
  }
});

// Get game directory path
ipcMain.handle('getUserDataPath', () => {
  return GAME_PATH;
});

// Read file
ipcMain.handle('readFile', async (_, filePath: string) => {
  try {
    await ensureDirectoryExists(path.dirname(filePath));
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return '{}';
    }
    console.error('Failed to read file:', error);
    throw error;
  }
});

// Write file
ipcMain.handle('writeFile', async (_, filePath: string, data: string) => {
  try {
    await ensureDirectoryExists(path.dirname(filePath));
    await fs.writeFile(filePath, data, 'utf-8');
    
    // Verify write
    const content = await fs.readFile(filePath, 'utf-8');
    
    return true;
  } catch (error) {
    console.error('Failed to write file:', error);
    throw error;
  }
});

// listen battle log update event
process.on && process.on('message', (msg: any) => {
  if (msg && msg.type === 'battle-log-updated' && mainWindow) {
    mainWindow.webContents.send('battle-log-updated');
  }
});

// 添加IPC处理程序
ipcMain.handle('get-user-data-path', () => {
  return GAME_PATH;
});

ipcMain.handle('read-file', async (_, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('write-file', async (_, filePath, data) => {
  try {
    await fs.writeFile(filePath, data, 'utf-8');
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
});

// handle floating window close
ipcMain.handle('close-floating-window', () => {
  if (floatingWindow) {
    floatingWindow.close();
  }
});

// handle floating window show/hide
ipcMain.handle('toggle-floating-window', () => {
  if (floatingWindow) {
    if (floatingWindow.isVisible()) {
      floatingWindow.hide();
    } else {
      floatingWindow.show();
    }
  } else {
    createFloatingWindow();
  }
}); 