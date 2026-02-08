import * as fs from 'fs';
import * as path from 'path';
import { getGamePath } from './utils';

const GAME_PATH = getGamePath();

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

/**
 * Convert operation log to deck card counts (cards used from deck)
 */
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
      if (op.operation === 0) { // observed
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
      
      if (op.operation === 1) { // replaced
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

/**
 * Calculate current hand cards from operation log
 * Operation types:
 * - 0 (draw cards 抽牌): Draw cards from deck to hand, cards array added to hand
 * - 1 (replace card 换牌): Exchange card, srcCard -1 from hand, dstCard +1 to hand
 * - 2 (use card 炼化): Use card, srcCard -1 from hand
 */
function convertOperationLogToHandCards(logContent: string): ConvertedData | { cards: null, status: string } {
  const lines = logContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // skip the first line
  const jsonLines = lines.slice(1);
  
  if (jsonLines.length === 0) {
    return { cards: null, status: "waiting" };
  }

  try {
    const operations: CardOperation[] = jsonLines.map(line => JSON.parse(line));
    const handCards: { [key: string]: number } = {};

    operations.forEach((op) => {
      if (op.operation === 0) {
        // draw cards: cards array added to hand
        if (op.cards) {
          op.cards.forEach(card => {
            if (card.name) {
              handCards[card.name] = (handCards[card.name] || 0) + 1;
            }
          });
        }
      }

      if (op.operation === 1) {
        // replace card: srcCard -1, dstCard +1
        if (op.srcCard.name) {
          handCards[op.srcCard.name] = (handCards[op.srcCard.name] || 0) - 1;
        }
        if (op.dstCard.name) {
          handCards[op.dstCard.name] = (handCards[op.dstCard.name] || 0) + 1;
        }
      }

      if (op.operation === 2) {
        // use card: srcCard -1
        if (op.srcCard.name) {
          handCards[op.srcCard.name] = (handCards[op.srcCard.name] || 0) - 1;
        }
      }
    });

    // filter out cards with count 0 or negative
    const filteredCards: { [key: string]: CardCount } = {};
    Object.entries(handCards).forEach(([name, count]) => {
      if (count > 0) {
        filteredCards[name] = { count };
      }
    });

    return { cards: filteredCards };
  } catch (error) {
    console.error('Error converting operation log to hand cards:', error);
    return { cards: {} };
  }
}

function processOperationLog() {
  try {
    const operationLogPath = path.join(GAME_PATH, 'CardOperationLog.json');
    const convertedOperationLogPath = path.join(GAME_PATH, 'ConvertedCardOperationLog.json');
    const convertedHandCardPath = path.join(GAME_PATH, 'ConvertedHandCard.json');

    if (fs.existsSync(operationLogPath)) {
      const logContent = fs.readFileSync(operationLogPath, 'utf-8');
      
      // Convert to deck card counts
      const convertedData = convertOperationLogToSample(logContent);
      fs.writeFileSync(convertedOperationLogPath, JSON.stringify(convertedData, null, 2));

      // Convert to hand card counts
      const handCardData = convertOperationLogToHandCards(logContent);
      fs.writeFileSync(convertedHandCardPath, JSON.stringify(handCardData, null, 2));

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