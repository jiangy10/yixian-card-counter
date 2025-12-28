import * as fs from 'fs';
import * as path from 'path';
import { getGamePath } from './utils';

const GAME_PATH = getGamePath();

interface CardCount {
  count: number;
}

interface PlayerOperationLog {
  player_username: string;
  sect?: string;
  side_jobs?: string[];
  cards: Record<string, CardCount>;
}

interface ConvertedOperationLog {
  players?: PlayerOperationLog[];
  cards?: Record<string, CardCount>;
  status?: string;
}

interface FloatingDeckPlayer {
  sect: string;
  side_jobs: string[];
  cards: Record<string, number>;
}


const deckTrackingPaths = [
  path.join(GAME_PATH, 'deck_reacking_card.json'),
  path.join(GAME_PATH, 'deck_tracking_cards.json')
];

const floatingDeckPath = path.join(GAME_PATH, 'FloatingDeck.json');

const specialLimitedCards = new Set(['锻体丹', '还魂丹', '锻体玄丹']);
const cardLibPath = path.join(__dirname, '../src/data/card_lib.json');
const specialCardLibPath = path.join(__dirname, '../src/data/special_card_lib.json');

function readFirstExisting(paths: string[]): string | null {
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function loadJsonFile<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to read JSON from ${filePath}:`, err);
    return null;
  }
}

function buildTrackingSet(): Set<string> {
  const trackingFile = readFirstExisting(deckTrackingPaths);
  if (!trackingFile) return new Set();

  const trackingData = loadJsonFile<Record<string, any>>(trackingFile) || {};
  const names = Object.keys(trackingData);
  const set = new Set<string>();
  names.forEach((name) => {
    set.add(name);
    const normalized = name.replace(/•/g, '·');
    const denormalized = name.replace(/·/g, '•');
    set.add(normalized);
    set.add(denormalized);
  });
  return set;
}

function mergeCardLibs() {
  const cardLibData = loadJsonFile<Record<string, any>>(cardLibPath) || {};
  const specialCardLibData = loadJsonFile<Record<string, any>>(specialCardLibPath) || {};
  return {
    ...cardLibData,
    ...specialCardLibData
  } as Record<
    string,
    {
      type: string;
      category: string;
      phase: number;
      ['match-recommend']: boolean;
    }
  >;
}

function inferAffinities(cardCounts: Record<string, CardCount>, cardLib: Record<string, any>) {
  const sectCounts: Record<string, number> = {};
  const sideJobCounts: Record<string, number> = {};

  Object.entries(cardCounts || {}).forEach(([name, info]) => {
    const cardInfo = cardLib[name];
    if (!cardInfo) return;
    if (cardInfo.type === 'sect') {
      sectCounts[cardInfo.category] = (sectCounts[cardInfo.category] || 0) + (info?.count || 0);
    }
    if (cardInfo.type === 'side-jobs') {
      sideJobCounts[cardInfo.category] = (sideJobCounts[cardInfo.category] || 0) + (info?.count || 0);
    }
  });

  const sect =
    Object.keys(sectCounts).length > 0
      ? Object.entries(sectCounts).reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
      : 'cloud-spirit';

  const sideJob =
    Object.keys(sideJobCounts).length > 0
      ? Object.entries(sideJobCounts).reduce((a, b) => (a[1] >= b[1] ? a : b))[0]
      : 'elixirist';

  return { sect, side_jobs: [sideJob] };
}

function calculateRemaining(
  playerLog: PlayerOperationLog,
  cardLib: Record<string, any>,
  trackingSet: Set<string>
): FloatingDeckPlayer {
  const sect = playerLog.sect;
  const side_jobs = playerLog.side_jobs && playerLog.side_jobs.length > 0 ? playerLog.side_jobs : undefined;
  const affinities = sect && side_jobs ? { sect, side_jobs } : inferAffinities(playerLog.cards, cardLib);
  const playerCards: Record<string, number> = {};

  Object.entries(cardLib).forEach(([name, info]) => {
    const isSectCard = info.type === 'sect' && info.category === affinities.sect;
    const isSideJobCard = info.type === 'side-jobs' && affinities.side_jobs.includes(info.category);
    if (!isSectCard && !isSideJobCard) return;

    const baseCount = specialLimitedCards.has(name) ? 4 : info.phase === 5 ? 6 : 8;
    const used = playerLog.cards?.[name]?.count || 0;
    const remaining = Math.max(0, baseCount - used);
    playerCards[name] = remaining;

    // include normalized/denormalized names so tracking lookups still work
    if (trackingSet.has(name)) return;
    const normalized = name.replace(/•/g, '·');
    const denormalized = name.replace(/·/g, '•');
    if (trackingSet.has(normalized) && !playerCards[normalized]) {
      playerCards[normalized] = remaining;
    }
    if (trackingSet.has(denormalized) && !playerCards[denormalized]) {
      playerCards[denormalized] = remaining;
    }
  });

  return {
    sect: affinities.sect,
    side_jobs: affinities.side_jobs,
    cards: playerCards
  };
}

function normalizePlayers(log: ConvertedOperationLog): PlayerOperationLog[] {
  if (Array.isArray(log.players)) {
    return log.players.map((p) => ({
      player_username: p.player_username,
      sect: p.sect,
      side_jobs: p.side_jobs,
      cards: p.cards || {}
    }));
  }

  if (log.cards) {
    // Fallback: single player log without player info
    return [
      {
        player_username: '未知玩家',
        cards: log.cards
      }
    ];
  }

  return [];
}

function processFloatingDeck() {
  try {
    const convertedPath = path.join(GAME_PATH, 'ConvertedCardOperationLog.json');
    if (!convertedPath) return;

    const convertedData = loadJsonFile<ConvertedOperationLog>(convertedPath);
    if (!convertedData || convertedData.status === 'waiting') {
      return;
    }

    const trackingSet = buildTrackingSet();
    const cardLib = mergeCardLibs();
    const players = normalizePlayers(convertedData);
    if (players.length === 0) return;

    const floatingData: Record<string, FloatingDeckPlayer> = {};

    players.forEach((player) => {
      floatingData[player.player_username] = calculateRemaining(player, cardLib, trackingSet);
    });

    fs.writeFileSync(floatingDeckPath, JSON.stringify(floatingData, null, 2));

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
