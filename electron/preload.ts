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
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    readFile: (path: string) => ipcRenderer.invoke('read-file', path),
    writeFile: (path: string, data: string) => ipcRenderer.invoke('write-file', path, data),
    isElectron: true,
    onBattleLogUpdated: (callback: () => void) => {
      ipcRenderer.on('battle-log-updated', callback);
      return () => ipcRenderer.removeListener('battle-log-updated', callback);
    },
    onCardOperationLogUpdated: (callback: () => void) => {
      ipcRenderer.on('card-operation-log-updated', callback);
      return () => ipcRenderer.removeListener('card-operation-log-updated', callback);
    }
  });
} catch (error) {
  console.error('Error in preload script:', error);
} 