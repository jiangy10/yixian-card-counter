import { app, BrowserWindow, ipcMain, Menu, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import isDev from 'electron-is-dev';
import './battleLogConverter';
import './cardOperationLogConverter';
import { getGamePath } from './utils';

let windowManager: any = null;

// Try to load node-window-manager
try {
  const nodeWindowManager = require('node-window-manager');
  windowManager = nodeWindowManager.windowManager;
  console.log('node-window-manager loaded successfully');
} catch (error) {
  console.error('Failed to load node-window-manager:', error);
}

// Handle Squirrel events on Windows
if (require('electron-squirrel-startup')) {
  app.quit();
}

const GAME_PATH = getGamePath();

let mainWindow: BrowserWindow | null = null;
let floatingWindow: BrowserWindow | null = null;
let gameWindowMonitorInterval: NodeJS.Timeout | null = null;

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

// Find YiXianPai application window
async function findYiXianPaiWindow() {
  try {
    if (!windowManager) {
      console.error('node-window-manager not loaded correctly');
      return null;
    }

    if (typeof windowManager.getWindows !== 'function') {
      console.error('windowManager.getWindows is not a function');
      console.log('windowManager object:', Object.keys(windowManager));
      return null;
    }

    const windows = windowManager.getWindows();
    console.log(`Found ${windows.length} windows in total`);
    
    // Get current process ID to exclude ourselves
    const currentProcessId = process.pid;
    console.log('Current process ID:', currentProcessId);
    
    // First try to get active window (might be fullscreen)
    try {
      const activeWindow = windowManager.getActiveWindow();
      if (activeWindow) {
        const activeTitle = activeWindow.getTitle() || '';
        const activePath = activeWindow.path || '';
        const activeProcessId = activeWindow.processId || 0;
        
        console.log('Current active window:', {
          title: activeTitle,
          processId: activeProcessId,
          path: activePath
        });
        
        // Check if active window is YiXianPai
        if (activeProcessId !== currentProcessId && 
            !activePath.includes('yixian-card-counter') &&
            !activePath.includes('System/Library') &&
            (activeTitle.includes('弈仙牌') || activeTitle.includes('YiXianPai') || 
             activeTitle.toLowerCase().includes('yixianpai') ||
             activePath.includes('弈仙牌') || activePath.includes('YiXianPai') || 
             activePath.toLowerCase().includes('yixianpai'))) {
          console.log('Found YiXianPai via active window (possibly fullscreen):', { 
            title: activeTitle, 
            processId: activeProcessId, 
            path: activePath 
          });
          return activeWindow;
        }
      }
    } catch (activeWindowError) {
      console.log('Failed to get active window:', activeWindowError);
    }
    
    // Iterate through all windows for exact match
    for (let index = 0; index < windows.length; index++) {
      const window = windows[index];
      try {
        const title = window.getTitle() || '';
        const processName = window.processName || '';
        const processId = window.processId || 0;
        const path = window.path || '';
        
        console.log(`Window ${index + 1}:`, {
          title,
          processName,
          processId,
          path
        });
        
        // Exclude own process and obviously non-game processes
        if (processId === currentProcessId || 
            path.includes('yixian-card-counter') ||
            path.includes('Electron.app') ||
            title === 'Electron' ||
            path.includes('System/Library') ||
            path.includes('CoreServices')) {
          continue;
        }
        
        // Check if window title or process name contains YiXianPai related info
        const titleMatch = title.includes('弈仙牌') || title.includes('YiXianPai') || title.toLowerCase().includes('yixianpai');
        const processMatch = processName.includes('弈仙牌') || processName.includes('YiXianPai') || processName.toLowerCase().includes('yixianpai');
        const pathMatch = path.includes('弈仙牌') || path.includes('YiXianPai') || path.toLowerCase().includes('yixianpai');
        
        if (titleMatch || processMatch || pathMatch) {
          console.log('Found YiXianPai window:', { title, processName, processId, path });
          return window;
        }
      } catch (windowError) {
        console.error(`Error getting window ${index + 1} info:`, windowError);
      }
    }
    
    // If not found, try broader search (but still exclude system processes)
    for (const window of windows) {
      try {
        const title = window.getTitle() || '';
        const processName = window.processName || '';
        const processId = window.processId || 0;
        const path = window.path || '';
        
        // Exclude own process and system processes
        if (processId === currentProcessId || 
            path.includes('yixian-card-counter') ||
            path.includes('Electron.app') ||
            title === 'Electron' ||
            path.includes('System/Library') ||
            path.includes('CoreServices') ||
            path.includes('Applications/') === false) { // Only consider apps in Applications directory
          continue;
        }
        
        // Broader matching conditions
        if (title.toLowerCase().includes('yixian') || 
            processName.toLowerCase().includes('yixian') ||
            path.toLowerCase().includes('yixian') ||
            title.includes('弈仙') ||
            processName.includes('弈仙') ||
            path.includes('弈仙')) {
          console.log('Found possible YiXianPai window via broad search:', { title, processName, processId, path });
          return window;
        }
      } catch (windowError) {
        console.error('Error during broad search:', windowError);
      }
    }
    
    // Last resort: Find YiXianPai process via process list (for fullscreen cases)
    console.log('Trying to find YiXianPai via process list...');
    try {
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        exec('ps aux | grep -i yixian', (error: any, stdout: string) => {
          if (error) {
            console.log('Process search failed:', error);
            resolve(null);
            return;
          }
          
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.includes('YiXianPai') && !line.includes('grep')) {
              console.log('Found YiXianPai via process list:', line);
              // If process found, create a mock window object
              const mockWindow = {
                getBounds: () => {
                  const primaryDisplay = screen.getPrimaryDisplay();
                  return {
                    x: 0,
                    y: 0,
                    width: primaryDisplay.bounds.width,
                    height: primaryDisplay.bounds.height
                  };
                },
                getTitle: () => 'YiXianPai (Fullscreen)',
                path: '/YiXianPai.app'
              };
              resolve(mockWindow);
              return;
            }
          }
          resolve(null);
        });
      });
    } catch (processError) {
      console.error('Error during process search:', processError);
    }
    
    console.log('YiXianPai game window not found');
    console.log('Please ensure YiXianPai is running and window title or app name contains "弈仙牌", "YiXianPai" or "弈仙"');
    return null;
  } catch (error) {
    console.error('Error finding YiXianPai window:', error);
    return null;
  }
}

// Monitor game window state
function startGameWindowMonitoring(targetWindow: any) {
  // Clear previous monitoring
  if (gameWindowMonitorInterval) {
    clearInterval(gameWindowMonitorInterval);
  }

  let targetProcessId = 0;
  try {
    targetProcessId = targetWindow.processId || 0;
  } catch (error) {
    console.log('Unable to get target process ID:', error);
  }

  console.log('Started game window monitoring, target process ID:', targetProcessId);

  let lastGameActiveState = true; // Initial state assumes game is active
  let stateChangeTimer: NodeJS.Timeout | null = null;
  
  // Get floating window process ID
  const floatingProcessId = process.pid;

  // Check more frequently, but use debouncing to avoid flickering
  gameWindowMonitorInterval = setInterval(() => {
    if (!floatingWindow || floatingWindow.isDestroyed()) {
      if (gameWindowMonitorInterval) {
        clearInterval(gameWindowMonitorInterval);
        gameWindowMonitorInterval = null;
      }
      if (stateChangeTimer) {
        clearTimeout(stateChangeTimer);
        stateChangeTimer = null;
      }
      return;
    }

    try {
      if (!windowManager) return;

      const activeWindow = windowManager.getActiveWindow();
      if (activeWindow) {
        const activeProcessId = activeWindow.processId || 0;
        const activeTitle = activeWindow.getTitle() || '';
        
        // Check if active window is game window or floating window itself
        const isGameActive = (targetProcessId > 0 && activeProcessId === targetProcessId) ||
                            activeTitle.includes('YiXianPai') ||
                            activeTitle.includes('弈仙牌');
        
        const isFloatingWindowActive = activeProcessId === floatingProcessId;
        
        // If floating window has focus, consider game still active (since floating window is on top of game)
        const shouldShowFloating = isGameActive || isFloatingWindowActive;

        // Only execute operation when state actually changes
        if (shouldShowFloating !== lastGameActiveState) {
          // Clear previous delayed operation
          if (stateChangeTimer) {
            clearTimeout(stateChangeTimer);
          }

          // Use delay to prevent flickering during rapid switching
          stateChangeTimer = setTimeout(() => {
            if (!floatingWindow || floatingWindow.isDestroyed()) return;

            if (shouldShowFloating) {
              // Game or floating window is active, show floating window
              if (!floatingWindow.isVisible()) {
                floatingWindow.show();
                floatingWindow.setAlwaysOnTop(true, 'screen-saver' as any);
                console.log('Game window activated, showing floating window');
              }
            } else {
              // Other window is active, hide floating window
              if (floatingWindow.isVisible()) {
                floatingWindow.hide();
                console.log('Game window lost focus, hiding floating window');
              }
            }

            lastGameActiveState = shouldShowFloating;
          }, 150); // 150ms delay, enough to handle rapid switching but imperceptible to user
        }
      }
    } catch (error) {
      console.error('Error monitoring game window:', error);
    }
  }, 300); // More frequent checks (every 300ms), with debouncing
}

// Create floating window
function createFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.focus();
    return;
  }

  const preloadPath = path.join(__dirname, 'preload.js');
  
  // Position at the top of the screen
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x: screenX, y: screenY } = primaryDisplay.bounds;
  
  // Default position and size
  const width = 300;
  const height = 200;
  // Position near top-left, but with some margin
  const x = screenX + 50;
  const y = screenY + 50;

  floatingWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: true,
    minWidth: 250,
    minHeight: 150,
    skipTaskbar: true,
    type: 'panel', // 'panel' works better for floating windows over fullscreen apps
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    }
  });

  // Enable visibility on all workspaces/fullscreen apps on macOS (needs to be set after creation or cast to any if in options)
  floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Load floating window content
  if (isDev) {
    // Load from localhost with hash for routing
    floatingWindow.loadURL('http://localhost:3000/#/floating');
  } else {
    // Load from file but with hash for routing
    // Note: loadFile with hash support requires a specific format or using loadURL with file:// protocol
    const indexPath = path.join(__dirname, '..', 'index.html');
    floatingWindow.loadURL(`file://${indexPath}#/floating`);
  }

  floatingWindow.on('closed', () => {
    floatingWindow = null;
  });
  
  // Ensure it stays on top
  floatingWindow.setAlwaysOnTop(true, 'screen-saver');
  floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  console.log('Floating window created (always visible)');
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

// Add IPC handlers
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

// Handle floating window related IPC calls
ipcMain.handle('toggle-floating-window', () => {
  if (floatingWindow) {
    floatingWindow.close();
    floatingWindow = null;
    return false;
  } else {
    createFloatingWindow();
    return true;
  }
});

ipcMain.handle('close-floating-window', () => {
  if (floatingWindow) {
    floatingWindow.close();
    floatingWindow = null;
  }
});

// Automatically open floating window (legacy name, now just opens it)
ipcMain.handle('find-and-create-floating-window', async () => {
  try {
    createFloatingWindow();
    return { 
      success: true, 
      message: 'Floating window created' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Error creating floating window: ' + error 
    };
  }
}); 