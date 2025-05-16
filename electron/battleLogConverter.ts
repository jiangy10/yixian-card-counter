import fs from 'fs';
import path from 'path';
import { watch } from 'chokidar';

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
  const lines = battleLogContent.split('\n');
  const remainingLines = lines.slice(1);
  
  try {
    const rounds: BattleLogRound[] = [];
    
    for (const line of remainingLines) {
      if (line.trim() === '') continue;
      
      try {
        const roundData = JSON.parse(line) as BattleLogRound;
        if (roundData.round && Array.isArray(roundData.players)) {
          rounds.push(roundData);
        }
      } catch {
        continue;
      }
    }

    const sampleData: SampleData = {
      rounds: {}
    };

    rounds.sort((a, b) => b.round - a.round);

    rounds.forEach((round) => {
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
    throw error;
  }
}

const steamPath = path.join(process.env.HOME || '', 'Library/Application Support/Steam/steamapps/common/YiXianPai');
const battleLogPath = path.join(steamPath, 'BattleLog.json');
const convertedBattleLogPath = path.join(steamPath, 'ConvertedBattleLog.json');

const watcher = watch(battleLogPath, {
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

watcher.on('change', async (filePath) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const battleLogContent = fs.readFileSync(filePath, 'utf-8');
    const sampleData = convertBattleLogToSample(battleLogContent);
    
    fs.writeFileSync(convertedBattleLogPath, JSON.stringify(sampleData, null, 2));
  } catch (error) {
    console.error('Error processing battle log:', error);
    setTimeout(() => {
      watcher.emit('change', filePath);
    }, 1000);
  }
}); 