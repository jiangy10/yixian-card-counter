import * as fs from 'fs';
import * as path from 'path';

const GAME_PATH = process.platform === 'darwin'
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

interface CardCount {
  count: number;
}

interface ConvertedData {
  cards: {
    [cardName: string]: CardCount;
  };
  status?: string;
}

function convertOperationLogToSample(logContent: string): ConvertedData | { cards: null, status: string } {
  const lines = logContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // skip the first line
  const jsonLines = lines.slice(1);
  
  if (jsonLines.length === 0) {
    return { cards: null, status: "waiting" };
  }

  try {
    const operations: CardOperation[] = jsonLines.map(line => JSON.parse(line));
    const cardCounts: { [key: string]: CardCount } = {};

    operations.forEach((op) => {
      if (op.operation === 0) {
        if (op.cards) {
          op.cards.forEach(card => {
            if (card.name) {
              if (!cardCounts[card.name]) {
                cardCounts[card.name] = { count: 0 };
              }
              cardCounts[card.name].count += 1;
            }
          });
        }
      }
      
      if (op.operation === 1) {
        if (op.srcCard.name) {
          if (!cardCounts[op.srcCard.name]) {
            cardCounts[op.srcCard.name] = { count: 0 };
          }
          cardCounts[op.srcCard.name].count += 2;
        }
        if (op.dstCard.name) {
          if (!cardCounts[op.dstCard.name]) {
            cardCounts[op.dstCard.name] = { count: 0 };
          }
          cardCounts[op.dstCard.name].count += 1;
        }
      }
    });

    return { cards: cardCounts };
  } catch (error) {
    console.error('Error converting operation log:', error);
    return { cards: {} };
  }
}

function processOperationLog() {
  try {
    const operationLogPath = path.join(GAME_PATH, 'CardOperationLog.json');
    const convertedOperationLogPath = path.join(GAME_PATH, 'ConvertedCardOperationLog.json');

    if (fs.existsSync(operationLogPath)) {
      const logContent = fs.readFileSync(operationLogPath, 'utf-8');
      const convertedData = convertOperationLogToSample(logContent);
      
      fs.writeFileSync(convertedOperationLogPath, JSON.stringify(convertedData, null, 2));

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
    }
  } catch (error) {
    console.error('Error in processOperationLog:', error);
  }
}

processOperationLog();
setInterval(processOperationLog, 1000); 