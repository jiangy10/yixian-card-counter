import * as fs from 'fs';
import * as path from 'path';

export const findMacGamePath = () => {
  const searchBattleLog = (dir: string): string | null => {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file.includes('com.darksun.yixianpai')) {
          if (fs.existsSync(path.join(fullPath, 'BattleLog.json'))) {
            return fullPath;
          }
        }
      }
    } catch (error) {
      console.error('Error searching for BattleLog.json:', error);
    }
    return null;
  };

  const searchPaths = [
    path.join(process.env.HOME || '', 'Library'),
    path.join(process.env.HOME || '', 'Library/Containers'),
  ];

  for (const searchPath of searchPaths) {
    const result = searchBattleLog(searchPath);
    if (result) {
      return result;
    }
  }

  return path.join(process.env.HOME || '', 'Library/Application Support/com.darksun.yixianpai');
};

export const getGamePath = () => {
  return process.platform === 'darwin'
    ? findMacGamePath()
    : path.join(
        process.env.USERPROFILE || '',
        'AppData',
        'LocalLow',
        'DarkSunStudio',
        'YiXianPai'
      );
}; 