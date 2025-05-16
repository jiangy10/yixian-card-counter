import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script is running');

// Define allowed IPC channels
const validChannels = [
  'getUserDataPath',
  'readFile',
  'writeFile'
];

// Expose safe electron APIs to the window object
try {
  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      invoke: async (channel: string, ...args: any[]) => {
        if (validChannels.includes(channel)) {
          try {
            const result = await ipcRenderer.invoke(channel, ...args);
            return result;
          } catch (error) {
            console.error(`IPC call error ${channel}:`, error);
            throw error;
          }
        }
        throw new Error(`Access to IPC channel not allowed: ${channel}`);
      }
    },
    // Used to check if electron is loaded correctly
    isElectron: true
  });
} catch (error) {
  console.error('Failed to expose Electron APIs:', error);
} 