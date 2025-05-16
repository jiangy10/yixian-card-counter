import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as isDev from 'electron-is-dev';
import './battleLogConverter';

const GAME_PATH = '/Users/xuan/Library/Application Support/Steam/steamapps/common/YiXianPai';

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
  const filePath = path.join(GAME_PATH, 'tracking_cards.json');
  
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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    }
  });

  // Load React application
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
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
  console.log('Attempting to read file:', filePath);
  try {
    await ensureDirectoryExists(path.dirname(filePath));
    const content = await fs.readFile(filePath, 'utf-8');
    console.log('File content:', content);
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('File does not exist, returning empty object');
      return '{}';
    }
    console.error('Failed to read file:', error);
    throw error;
  }
});

// Write file
ipcMain.handle('writeFile', async (_, filePath: string, data: string) => {
  console.log('Attempting to write file:', filePath);
  console.log('Data to write:', data);
  try {
    await ensureDirectoryExists(path.dirname(filePath));
    await fs.writeFile(filePath, data, 'utf-8');
    
    // Verify write
    const content = await fs.readFile(filePath, 'utf-8');
    console.log('Verification of written content:', content);
    
    return true;
  } catch (error) {
    console.error('Failed to write file:', error);
    throw error;
  }
}); 