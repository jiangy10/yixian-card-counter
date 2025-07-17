import * as fs from 'fs';
import * as path from 'path';

export const findMacGamePath = () => {
  const checkPath = (basePath: string): string | null => {
    try {
      if (fs.existsSync(path.join(basePath, 'BattleLog.json'))) {
        return basePath;
      }
      const deepPath = path.join(basePath, 'Data', 'Library', 'Application Support', 'com.darksun.yixianpai');
      if (fs.existsSync(path.join(deepPath, 'BattleLog.json'))) {
        return deepPath;
      }
    } catch (error: any) {
      if (error?.code !== 'EPERM' && error?.code !== 'ENAMETOOLONG') {
        console.error('Error checking path:', error);
      }
    }
    return null;
  };

  const possiblePaths = [
    path.join(process.env.HOME || '', 'Library/Containers/com.darksun.yixianpai'),
    path.join(process.env.HOME || '', 'Library/Application Support/com.darksun.yixianpai')
  ];

  for (const possiblePath of possiblePaths) {
    const result = checkPath(possiblePath);
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