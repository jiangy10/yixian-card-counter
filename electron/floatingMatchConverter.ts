import * as fs from 'fs';
import * as path from 'path';
import { getGamePath } from './utils';

const GAME_PATH = getGamePath();

interface TrackingCardEntry {
  name?: string;
  tracking?: boolean;
  [key: string]: any;
}

interface BattleLogCard {
  name: string;
  level?: number;
}

interface BattleLogPlayer {
  player_username: string;
  used_card: BattleLogCard[];
}

interface ConvertedBattleLog {
  rounds?: Record<
    string,
    {
      players: BattleLogPlayer[];
    }
  >;
  status?: string;
  [key: string]: any;
}

const convertedBattleLogPath = path.join(GAME_PATH, 'ConvertedBattleLog.json');
const trackingCardsPath = path.join(GAME_PATH, 'match_tracking_cards.json');
const floatingMatchPath = path.join(GAME_PATH, 'FloatingMatch.json');

const normalizeCardName = (name: string) => name.replace(/•/g, '·');
const denormalizeCardName = (name: string) => name.replace(/·/g, '•');

function buildTrackingSet(trackingData: Record<string, TrackingCardEntry>): Set<string> {
  const names = Object.keys(trackingData || {});
  const trackingSet = new Set<string>();

  names.forEach((name) => {
    trackingSet.add(name);

    const normalized = normalizeCardName(name);
    if (normalized !== name) {
      trackingSet.add(normalized);
    }

    const denormalized = denormalizeCardName(name);
    if (denormalized !== name) {
      trackingSet.add(denormalized);
    }
  });

  return trackingSet;
}

function processFloatingMatch() {
  try {
    if (!fs.existsSync(convertedBattleLogPath) || !fs.existsSync(trackingCardsPath)) {
      return;
    }

    const battleLogContent = fs.readFileSync(convertedBattleLogPath, 'utf-8');
    const trackingContent = fs.readFileSync(trackingCardsPath, 'utf-8');

    const battleLogData: ConvertedBattleLog = JSON.parse(battleLogContent || '{}');
    const trackingData: Record<string, TrackingCardEntry> = JSON.parse(trackingContent || '{}');

    if (!battleLogData || battleLogData.status === 'waiting' || !battleLogData.rounds) {
      fs.writeFileSync(floatingMatchPath, JSON.stringify({}, null, 4));
      return;
    }

    const trackingSet = buildTrackingSet(trackingData);
    const floatingData: Record<string, { cards: string[] }> = {};

    Object.values(battleLogData.rounds).forEach((round) => {
      if (!round || !Array.isArray(round.players)) return;

      round.players.forEach((player) => {
        if (!player || !Array.isArray(player.used_card)) return;

        player.used_card.forEach((card) => {
          const cardName = card?.name;
          if (!cardName) return;

          const isTracked =
            trackingSet.has(cardName) ||
            trackingSet.has(normalizeCardName(cardName)) ||
            trackingSet.has(denormalizeCardName(cardName));

          if (!isTracked) return;

          if (!floatingData[player.player_username]) {
            floatingData[player.player_username] = { cards: [] };
          }

          const playerCards = floatingData[player.player_username].cards;
          if (!playerCards.includes(cardName)) {
            playerCards.push(cardName);
          }
        });
      });
    });

    fs.writeFileSync(floatingMatchPath, JSON.stringify(floatingData, null, 4));

    if (typeof process.send === 'function') {
      process.send({ type: 'floating-match-updated' });
    } else {
      try {
        const { BrowserWindow } = require('electron');
        const win = BrowserWindow.getAllWindows && BrowserWindow.getAllWindows()[0];
        if (win && win.webContents) {
          win.webContents.send('floating-match-updated');
        }
      } catch (e) {}
    }
  } catch (error) {
    console.error('Error processing floating match data:', error);
  }
}

processFloatingMatch();
setInterval(processFloatingMatch, 1000);
