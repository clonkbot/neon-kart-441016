import React, { useState, useEffect, useCallback, useRef } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import './styles.css';

export type GameState = 'menu' | 'playing' | 'finished';

export interface RaceResult {
  playerTime: number;
  botTime: number;
  winner: 'player' | 'bot';
}

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const startGame = useCallback(() => {
    setGameState('playing');
    setRaceResult(null);
  }, []);

  const endGame = useCallback((result: RaceResult) => {
    setRaceResult(result);
    setGameState('finished');
  }, []);

  const returnToMenu = useCallback(() => {
    setGameState('menu');
    setRaceResult(null);
  }, []);

  return (
    <div className="app-container">
      <div className="scanlines" />
      <div className="noise-overlay" />

      {gameState === 'menu' && (
        <StartScreen
          onStart={startGame}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          lastResult={raceResult}
        />
      )}

      {gameState === 'playing' && (
        <Game
          onFinish={endGame}
          difficulty={difficulty}
        />
      )}

      {gameState === 'finished' && raceResult && (
        <div className="result-screen">
          <div className="result-content">
            <h1 className={`result-title ${raceResult.winner === 'player' ? 'winner' : 'loser'}`}>
              {raceResult.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
            </h1>
            <div className="result-times">
              <div className="time-row">
                <span className="time-label">YOUR TIME</span>
                <span className="time-value player-time">{(raceResult.playerTime / 1000).toFixed(2)}s</span>
              </div>
              <div className="time-row">
                <span className="time-label">BOT TIME</span>
                <span className="time-value bot-time">{(raceResult.botTime / 1000).toFixed(2)}s</span>
              </div>
            </div>
            <div className="result-buttons">
              <button className="neon-button cyan" onClick={startGame}>
                RACE AGAIN
              </button>
              <button className="neon-button pink" onClick={returnToMenu}>
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <span>Requested by @trustnoneisakey · Built by @clonkbot</span>
      </footer>
    </div>
  );
}

export default App;
