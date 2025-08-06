import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import isDev from 'electron-is-dev';
import './battleLogConverter';
import './cardOperationLogConverter';
import { getGamePath } from './utils';

const GAME_PATH = getGamePath();

let mainWindow: BrowserWindow | null = null;

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
  const filePath = path.join(GAME_PATH, 'match_tracking_cards.json');
  
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

// Initialize application
app.whenReady().then(async () => {
  await ensureDirectoryExists(GAME_PATH);
  await initTrackingCardsFile();
  createWindow();
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