import * as fs from 'fs';
import * as path from 'path';
import { getGamePath } from './utils';

const GAME_PATH = getGamePath();

interface CardCount {
  count: number;
}

interface ConvertedOperationLog {
  cards: Record<string, CardCount>;
  status?: string;
}

interface CardLibEntry {
  type: string;
  category: string;
  phase: number;
  'match-recommend': boolean;
}

const convertedOperationLogPath = path.join(GAME_PATH, 'ConvertedCardOperationLog.json');
const deckTrackingPath = path.join(GAME_PATH, 'deck_tracking_cards.json');
const floatingDeckTrackingPath = path.join(GAME_PATH, 'FloatingDeck_tracking.json');
const floatingDeckOnePath = path.join(GAME_PATH, 'FloatingDeck_one.json');

const specialLimitedCards = new Set(['锻体丹', '还魂丹', '锻体玄丹']);

// Find the correct resource path both in dev and production environment
function getResourcePath(): string {
  // Try several possible paths
  const possiblePaths = [
    path.join(__dirname, '../../src/data'),    // Dev: build/electron -> src/data
    path.join(__dirname, '../../../src/data'), // Some bundle configs
    path.join(process.cwd(), 'src/data'),      // From project root
  ];
  
  for (const basePath of possiblePaths) {
    const cardLibTestPath = path.join(basePath, 'card_lib.json');
    if (fs.existsSync(cardLibTestPath)) {
      return basePath;
    }
  }
  
  // Default to the most likely path
  return path.join(process.cwd(), 'src/data');
}

// const dataPath = getResourcePath();
const cardLibPath = 'src/data/card_lib.json';
const specialCardLibPath = 'src/data/special_card_lib.json';

function loadJsonFile<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to read JSON from ${filePath}:`, err);
    return null;
  }
}

function mergeCardLibs(): Record<string, CardLibEntry> {
  const cardLibData = loadJsonFile<Record<string, CardLibEntry>>(cardLibPath) || {};
  const specialCardLibData = loadJsonFile<Record<string, CardLibEntry>>(specialCardLibPath) || {};
  return {
    ...cardLibData,
    ...specialCardLibData
  };
}

function normalizeCardName(name: string): string {
  return name.replace(/•/g, '·');
}

function denormalizeCardName(name: string): string {
  return name.replace(/·/g, '•');
}

function buildTrackingSet(): Set<string> {
  if (!fs.existsSync(deckTrackingPath)) return new Set();
  
  const trackingData = loadJsonFile<Record<string, any>>(deckTrackingPath) || {};
  const names = Object.keys(trackingData);
  const set = new Set<string>();
  
  names.forEach((name) => {
    set.add(name);
    set.add(normalizeCardName(name));
    set.add(denormalizeCardName(name));
  });
  
  return set;
}

function inferAffinities(
  cardCounts: Record<string, CardCount>,
  cardLib: Record<string, CardLibEntry>
): { sect: string; side_jobs: string[] } {
  const sectCounts: Record<string, number> = {};
  const sideJobSet = new Set<string>();

  Object.entries(cardCounts).forEach(([name, info]) => {
    const cardInfo = cardLib[name];
    if (!cardInfo) return;
    
    if (cardInfo.type === 'sect') {
      sectCounts[cardInfo.category] = (sectCounts[cardInfo.category] || 0) + info.count;
    }
    
    if (cardInfo.type === 'side-jobs') {
      // Collect all side jobs present
      sideJobSet.add(cardInfo.category);
    }
  });

  const sect =
    Object.keys(sectCounts).length > 0
      ? Object.entries(sectCounts).reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
      : 'cloud-spirit';

  const side_jobs = Array.from(sideJobSet);
  
  return { sect, side_jobs: side_jobs.length > 0 ? side_jobs : ['elixirist'] };
}

function calculateRemainingDeck(
  usedCards: Record<string, CardCount>,
  cardLib: Record<string, CardLibEntry>
): Record<string, CardCount> {
  const { sect, side_jobs } = inferAffinities(usedCards, cardLib);
  
  // Inference log removed
  
  const remainingCards: Record<string, CardCount> = {};

  Object.entries(cardLib).forEach(([name, info]) => {
    const isSectCard = info.type === 'sect' && info.category === sect;
    const isSideJobCard = info.type === 'side-jobs' && side_jobs.includes(info.category);
    
    if (!isSectCard && !isSideJobCard) return;

    // Calculate initial count
    const baseCount = specialLimitedCards.has(name) 
      ? 4 
      : info.phase === 5 
      ? 6 
      : 8;
    
    // Calculate remaining
    const used = usedCards[name]?.count || 0;
    const remaining = Math.max(0, baseCount - used);
    
    remainingCards[name] = { count: remaining };
  });

  return remainingCards;
}

function filterByTracking(
  cards: Record<string, CardCount>,
  trackingSet: Set<string>
): Record<string, CardCount> {
  const filtered: Record<string, CardCount> = {};
  
  Object.entries(cards).forEach(([name, info]) => {
    if (trackingSet.has(name) || 
        trackingSet.has(normalizeCardName(name)) || 
        trackingSet.has(denormalizeCardName(name))) {
      filtered[name] = info;
    }
  });
  
  return filtered;
}

function filterByCountOne(cards: Record<string, CardCount>): Record<string, CardCount> {
  const filtered: Record<string, CardCount> = {};
  
  Object.entries(cards).forEach(([name, info]) => {
    if (info.count === 1) {
      filtered[name] = info;
    }
  });
  
  return filtered;
}

function processFloatingDeck() {
  try {
    if (!fs.existsSync(convertedOperationLogPath)) {
      // ConvertedCardOperationLog.json does not exist
      return;
    }

    const operationLog = loadJsonFile<ConvertedOperationLog>(convertedOperationLogPath);
    
    if (!operationLog || operationLog.status === 'waiting' || !operationLog.cards) {
      // Waiting for card operation data...
      return;
    }

    const cardLib = mergeCardLibs();
    
    // Calculate remaining deck
    const currentCardDeck = calculateRemainingDeck(operationLog.cards, cardLib);
    
    // Remaining card count log removed

    // Output FloatingDeck_tracking.json
    const trackingSet = buildTrackingSet();
    const trackingFiltered = filterByTracking(currentCardDeck, trackingSet);
    fs.writeFileSync(
      floatingDeckTrackingPath,
      JSON.stringify({ cards: trackingFiltered }, null, 2)
    );
    // FloatingDeck_tracking.json log removed

    // Output FloatingDeck_one.json
    const oneFiltered = filterByCountOne(currentCardDeck);
    fs.writeFileSync(
      floatingDeckOnePath,
      JSON.stringify({ cards: oneFiltered }, null, 2)
    );
    // FloatingDeck_one.json log removed

    // Send update event
    if (typeof process.send === 'function') {
      process.send({ type: 'floating-deck-updated' });
    } else {
      try {
        const { BrowserWindow } = require('electron');
        const win = BrowserWindow.getAllWindows && BrowserWindow.getAllWindows()[0];
        if (win && win.webContents) {
          win.webContents.send('floating-deck-updated');
        }
      } catch (e) {}
    }
  } catch (error) {
    console.error('Error processing floating deck:', error);
  }
}

processFloatingDeck();
setInterval(processFloatingDeck, 1000);
