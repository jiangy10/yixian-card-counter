import fs from 'fs';
import path from 'path';
import { watch } from 'chokidar';

const GAME_PATH = path.join(
  process.env.USERPROFILE || '',
  'AppData',
  'LocalLow',
  'DarkSunStudio',
  'YiXianPai'
);

interface BattleLogCard {
  name: string;
  level: number;
  rarity: number;
}

interface BattleLogPlayer {
  username: string;
  character: string;
  life: number;
  lifeDelta: number;
  maxHp: number;
  level: number;
  opponentUsername: string;
  usedCards: BattleLogCard[];
}

interface BattleLogRound {
  round: number;
  players: BattleLogPlayer[];
}

interface SampleCard {
  name: string;
  level: number;
}

interface SamplePlayer {
  player_username: string;
  destiny: number;
  destiny_diff: number;
  health: number;
  cultivation: number;
  opponent_username: string;
  used_card: SampleCard[];
}

interface SampleData {
  rounds: {
    [key: string]: {
      players: SamplePlayer[];
    };
  };
}

function convertBattleLogToSample(battleLogContent: string): SampleData {
  const lines = battleLogContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  // ignore first line
  const jsonLines = lines.slice(1);
  let roundsArr: BattleLogRound[] = [];
  try {
    roundsArr = jsonLines.map(line => JSON.parse(line));
    const sampleData: SampleData = { rounds: {} };
    roundsArr.sort((a, b) => b.round - a.round);
    roundsArr.forEach((round) => {
      sampleData.rounds[round.round.toString()] = {
        players: round.players.map((player) => ({
          player_username: player.username,
          destiny: player.life,
          destiny_diff: player.lifeDelta,
          health: player.maxHp,
          cultivation: player.level,
          opponent_username: player.opponentUsername,
          used_card: player.usedCards.map((card) => ({
            name: card.name,
            level: card.rarity
          }))
        }))
      };
    });
    return sampleData;
  } catch (error) {
    console.error('Error converting battle log:', error);
    return { rounds: {} };
  }
}

const battleLogPath = path.join(GAME_PATH, 'BattleLog.json');
const convertedBattleLogPath = path.join(GAME_PATH, 'ConvertedBattleLog.json');

function processBattleLog() {
  try {
    if (fs.existsSync(battleLogPath)) {
      const battleLogContent = fs.readFileSync(battleLogPath, 'utf-8');
      const sampleData = convertBattleLogToSample(battleLogContent);
      fs.writeFileSync(convertedBattleLogPath, JSON.stringify(sampleData, null, 2));

      if (typeof process.send === 'function') {
        process.send({ type: 'battle-log-updated' });
      } else {
        try {
          const { BrowserWindow } = require('electron');
          const win = BrowserWindow.getAllWindows && BrowserWindow.getAllWindows()[0];
          if (win && win.webContents) {
            win.webContents.send('battle-log-updated');
          }
        } catch (e) {}
      }
    }
  } catch (error) {
    console.error('Error processing battle log:', error);
  }
}

processBattleLog();
setInterval(processBattleLog, 1000); 