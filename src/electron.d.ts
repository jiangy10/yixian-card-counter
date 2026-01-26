export interface IElectronAPI {
  isElectron: boolean;
  getUserDataPath: () => Promise<string>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, data: string) => Promise<void>;
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
  onBattleLogUpdated?: (callback: () => void) => () => void;
  onCardOperationLogUpdated?: (callback: () => void) => () => void;
  onTrackingCardsUpdated?: (callback: () => void) => () => void;
  onFloatingMatchUpdated?: (callback: () => void) => () => void;
  onFloatingDeckUpdated?: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
    electronAPI?: {
      closeFloatingWindow: () => Promise<void>;
      toggleFloatingWindow: () => Promise<boolean>;
      findAndCreateFloatingWindow: () => Promise<{ success: boolean; message: string }>;
    };
  }
} 