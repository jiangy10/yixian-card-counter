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
 * Parse operation log content to CardOperation array
 * @param logContent - Raw log file content
 * @returns Parsed operations array, or null if waiting for data
 */
function parseOperationLog(logContent: string): CardOperation[] | null {
  const lines = logContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // skip the first line
  const jsonLines = lines.slice(1);
  
  if (jsonLines.length === 0) {
    return null;
  }

  return jsonLines.map(line => JSON.parse(line));
}

/**
 * Calculate deck card counts (cards used from deck)
 * @param operations - Parsed card operations
 * @returns Record of card names to their used counts
 */
function calculateDeckCards(operations: CardOperation[]): { [key: string]: CardCount } {
  const cardCounts: { [key: string]: CardCount } = {};

  operations.forEach((op) => {
    if (op.operation === 0) { // draw cards: observed from deck
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
    
    if (op.operation === 1) { // replace card: srcCard -2 from deck, dstCard -1 from deck
      if (op.dstCard.name && !op.dstCard.name.includes('梦•')) { // SEASONAL EFFECT
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
    }
  });

  return cardCounts;
}

/**
 * Calculate current hand cards from operations
 * Operation types:
 * - 0 (draw cards 抽牌): Draw cards from deck to hand, cards array added to hand
 * - 1 (replace card 换牌): Exchange card, srcCard -1 from hand, dstCard +1 to hand
 * - 2 (use card 炼化): Use card, srcCard -1 from hand
 * @param operations - Parsed card operations
 * @returns Record of card names to their counts in hand (only positive counts)
 */
function calculateHandCards(operations: CardOperation[]): { [key: string]: CardCount } {
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

  return filteredCards;
}

function processOperationLog() {
  try {
    const operationLogPath = path.join(GAME_PATH, 'CardOperationLog.json');
    const convertedOperationLogPath = path.join(GAME_PATH, 'ConvertedCardOperationLog.json');
    const convertedHandCardPath = path.join(GAME_PATH, 'ConvertedHandCard.json');

    if (fs.existsSync(operationLogPath)) {
      const logContent = fs.readFileSync(operationLogPath, 'utf-8');
      
      // Parse operations once
      const operations = parseOperationLog(logContent);
      
      if (operations === null) {
        // Waiting for data
        const waitingData: ConvertedData = { cards: {}, status: "waiting" };
        fs.writeFileSync(convertedOperationLogPath, JSON.stringify(waitingData, null, 2));
        fs.writeFileSync(convertedHandCardPath, JSON.stringify(waitingData, null, 2));
        return;
      }

      // Calculate deck and hand cards using parsed operations
      const deckCards = calculateDeckCards(operations);
      const handCards = calculateHandCards(operations);

      // Write results
      fs.writeFileSync(convertedOperationLogPath, JSON.stringify({ cards: deckCards }, null, 2));
      fs.writeFileSync(convertedHandCardPath, JSON.stringify({ cards: handCards }, null, 2));

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