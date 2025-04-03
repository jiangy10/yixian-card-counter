export interface IElectronAPI {
  isElectron: boolean;
  ipcRenderer: {
    invoke(channel: 'getUserDataPath'): Promise<string>;
    invoke(channel: 'readFile', filePath: string): Promise<string>;
    invoke(channel: 'writeFile', filePath: string, data: string): Promise<void>;
  }
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
} 