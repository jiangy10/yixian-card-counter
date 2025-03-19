import React, { useEffect } from 'react';
import './App.css';

const { spawn } = window.require('child_process');
const activeWin = window.require('active-win');

function App() {
  useEffect(() => {
    const launchGame = async () => {
      try {
        // Launch game process
        const gamePath = 'D:\\steam\\steamapps\\common\\弈仙牌\\YiXianPai.exe';
        const gameArgs = [
          '-screen-fullscreen', '0',
          '-window-mode', '0',
          '-screen-width', '1280',
          '-screen-height', '720'
        ];

        const gameProcess = spawn(gamePath, gameArgs);

        // Monitor game process errors
        gameProcess.on('error', (err: Error) => {
          console.error('Failed to launch game:', err);
        });

        // Monitor game process exit
        gameProcess.on('exit', (code: number | null) => {
          console.log(`Game process exited with code: ${code}`);
        });

        // Wait for game window to appear
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Try to get game window
        const gameWindow = await activeWin();
        console.log('Found window:', gameWindow);

      } catch (err) {
        console.error('Error:', err);
      }
    };

    launchGame();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Game window will be embedded here</p>
      </header>
    </div>
  );
}

export default App;
