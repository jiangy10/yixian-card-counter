import * as fs from 'fs';
import * as path from 'path';

const GAME_PATH = process.env.mac
  ? path.join(
      process.env.HOME || '',
      'Library/Application Support/com.darksun.yixianpai'
    )
  : path.join(
      process.env.USERPROFILE || '',
      'AppData',
      'LocalLow',
      'DarkSunStudio',
      'YiXianPai'
    );

// Log the paths for debugging
console.log('Game Path:', GAME_PATH);
console.log('Operation Log Path:', path.join(GAME_PATH, 'CardOperationLog.json'));
console.log('Converted Operation Log Path:', path.join(GAME_PATH, 'ConvertedCardOperationLog.json'));

interface Card {
  name: string | null;
  level: number;
  rarity: number;
}

interface CardOperation {
  operation: number;
  round: number;
  srcCard: Card;
  dstCard: Card;
  cards: Card[] | null;
}

interface ConvertedOperation {
  round: number;
  operations: {
    type: 'draw' | 'combine' | 'discard';
    sourceCard?: {
      name: string;
      level: number;
    };
    targetCard?: {
      name: string;
      level: number;
    };
    drawnCards?: Array<{
      name: string;
      level: number;
    }>;
  }[];
}

interface ConvertedData {
  rounds: {
    [key: string]: ConvertedOperation;
  };
  status?: string;
}

function convertOperationLogToSample(logContent: string): ConvertedData | { rounds: null, status: string } {
  const lines = logContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // skip the first line
  const jsonLines = lines.slice(1);
  
  if (jsonLines.length === 0) {
    return { rounds: null, status: "waiting" };
  }

  try {
    const operations: CardOperation[] = jsonLines.map(line => JSON.parse(line));
    const convertedData: ConvertedData = { rounds: {} };

    operations.forEach((op) => {
      const roundKey = op.round.toString();
      
      if (!convertedData.rounds[roundKey]) {
        convertedData.rounds[roundKey] = {
          round: op.round,
          operations: []
        };
      }

      const operationTypes = {
        0: 'draw',
        1: 'combine',
        2: 'discard'
      } as const;

      const operation = {
        type: operationTypes[op.operation as keyof typeof operationTypes],
        sourceCard: op.srcCard.name ? {
          name: op.srcCard.name,
          level: op.srcCard.level
        } : undefined,
        targetCard: op.dstCard.name ? {
          name: op.dstCard.name,
          level: op.dstCard.level
        } : undefined,
        drawnCards: op.cards ? op.cards.map(card => ({
          name: card.name!,
          level: card.level
        })) : undefined
      };

      convertedData.rounds[roundKey].operations.push(operation);
    });

    return convertedData;
  } catch (error) {
    console.error('Error converting operation log:', error);
    return { rounds: {} };
  }
}

function processOperationLog() {
  try {
    const operationLogPath = path.join(GAME_PATH, 'CardOperationLog.json');
    const convertedOperationLogPath = path.join(GAME_PATH, 'ConvertedCardOperationLog.json');

    console.log('Checking if operation log exists:', operationLogPath);
    if (fs.existsSync(operationLogPath)) {
      console.log('Reading operation log file...');
      const logContent = fs.readFileSync(operationLogPath, 'utf-8');
      console.log('Converting operation log data...');
      const convertedData = convertOperationLogToSample(logContent);
      
      console.log('Writing converted data to:', convertedOperationLogPath);
      fs.writeFileSync(convertedOperationLogPath, JSON.stringify(convertedData, null, 2));
      console.log('Successfully wrote converted data');

      if (typeof process.send === 'function') {
        process.send({ type: 'card-operation-log-updated' });
      } else {
        try {
          const { BrowserWindow } = require('electron');
          const win = BrowserWindow.getAllWindows && BrowserWindow.getAllWindows()[0];
          if (win && win.webContents) {
            win.webContents.send('card-operation-log-updated');
          }
        } catch (e) {
          console.error('Error sending update notification:', e);
        }
      }
    } else {
      console.log('Operation log file not found');
    }
  } catch (error) {
    console.error('Error in processOperationLog:', error);
  }
}

processOperationLog();
setInterval(processOperationLog, 1000); 