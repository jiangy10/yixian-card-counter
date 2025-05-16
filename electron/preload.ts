import { contextBridge, ipcRenderer } from 'electron';

// Define allowed IPC channels
const validChannels = [
  'getUserDataPath',
  'readFile',
  'writeFile'
];

// Expose safe electron APIs to the window object
try {
  contextBridge.exposeInMainWorld('electron', {
    getUserDataPath: () => ipcRenderer.invoke('getUserDataPath'),
    readFile: (path: string) => ipcRenderer.invoke('readFile', path),
    writeFile: (path: string, data: string) => ipcRenderer.invoke('writeFile', path, data),
    isElectron: true
  });
} catch (error) {
  console.error('Failed to expose Electron APIs:', error);
} 