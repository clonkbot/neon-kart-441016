import React from 'react';
import type { RaceResult } from '../App';

interface StartScreenProps {
  onStart: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (d: 'easy' | 'medium' | 'hard') => void;
  lastResult: RaceResult | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, difficulty, setDifficulty, lastResult }) => {
  return (
    <div className="start-screen">
      <div className="title-container">
        <h1 className="game-title">
          <span className="title-neon">NEON</span>
          <span className="title-kart">KART</span>
        </h1>
        <div className="title-subtitle">ARCADE RACING</div>
      </div>

      <div className="kart-preview">
        <svg viewBox="0 0 100 60" className="kart-svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Kart body */}
          <rect x="20" y="25" width="60" height="20" rx="5" fill="#1a0a2e" stroke="#00f5ff" strokeWidth="2" filter="url(#glow)"/>
          {/* Cockpit */}
          <ellipse cx="50" cy="25" rx="15" ry="10" fill="#1a0a2e" stroke="#ff00ff" strokeWidth="2" filter="url(#glow)"/>
          {/* Wheels */}
          <circle cx="28" cy="48" r="8" fill="#0a0a0f" stroke="#ffff00" strokeWidth="2" filter="url(#glow)"/>
          <circle cx="72" cy="48" r="8" fill="#0a0a0f" stroke="#ffff00" strokeWidth="2" filter="url(#glow)"/>
          {/* Speed lines */}
          <line x1="5" y1="30" x2="15" y2="30" stroke="#00f5ff" strokeWidth="2" opacity="0.7"/>
          <line x1="0" y1="35" x2="12" y2="35" stroke="#ff00ff" strokeWidth="2" opacity="0.5"/>
          <line x1="3" y1="40" x2="10" y2="40" stroke="#00f5ff" strokeWidth="2" opacity="0.3"/>
        </svg>
      </div>

      <div className="difficulty-selector">
        <span className="diff-label">DIFFICULTY</span>
        <div className="diff-buttons">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              className={`diff-btn ${difficulty === d ? 'active' : ''} ${d}`}
              onClick={() => setDifficulty(d)}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <button className="neon-button cyan start-btn" onClick={onStart}>
        START RACE
      </button>

      <div className="controls-info">
        <h3>CONTROLS</h3>
        <div className="control-grid">
          <div className="control-item">
            <kbd>W</kbd> / <kbd>↑</kbd>
            <span>Accelerate</span>
          </div>
          <div className="control-item">
            <kbd>S</kbd> / <kbd>↓</kbd>
            <span>Brake</span>
          </div>
          <div className="control-item">
            <kbd>A</kbd> / <kbd>←</kbd>
            <span>Steer Left</span>
          </div>
          <div className="control-item">
            <kbd>D</kbd> / <kbd>→</kbd>
            <span>Steer Right</span>
          </div>
        </div>
        <p className="mobile-hint">On mobile: Use on-screen controls</p>
      </div>

      <style>{`
        .start-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          padding-bottom: 3rem;
          gap: 1.5rem;
          animation: fadeIn 0.8s ease-out;
        }

        .title-container {
          text-align: center;
        }

        .game-title {
          font-family: 'Press Start 2P', cursive;
          font-size: clamp(1.5rem, 6vw, 3rem);
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }

        .title-neon {
          color: var(--neon-cyan);
          text-shadow: 0 0 20px var(--neon-cyan), 0 0 40px var(--neon-cyan);
          animation: flicker 3s ease-in-out infinite;
        }

        .title-kart {
          color: var(--neon-pink);
          text-shadow: 0 0 20px var(--neon-pink), 0 0 40px var(--neon-pink);
          animation: flicker 3s ease-in-out infinite 0.5s;
        }

        .title-subtitle {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(0.6rem, 2vw, 0.9rem);
          color: var(--neon-yellow);
          letter-spacing: 0.5em;
          margin-top: 0.5rem;
          text-shadow: 0 0 10px var(--neon-yellow);
        }

        .kart-preview {
          width: clamp(120px, 30vw, 200px);
          animation: float 3s ease-in-out infinite;
        }

        .kart-svg {
          width: 100%;
          height: auto;
        }

        .difficulty-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .diff-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.2em;
        }

        .diff-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .diff-btn {
          font-family: 'Press Start 2P', cursive;
          font-size: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 44px;
          min-width: 44px;
        }

        .diff-btn.easy.active {
          border-color: var(--neon-green);
          color: var(--neon-green);
          box-shadow: 0 0 10px var(--neon-green);
        }

        .diff-btn.medium.active {
          border-color: var(--neon-yellow);
          color: var(--neon-yellow);
          box-shadow: 0 0 10px var(--neon-yellow);
        }

        .diff-btn.hard.active {
          border-color: var(--neon-pink);
          color: var(--neon-pink);
          box-shadow: 0 0 10px var(--neon-pink);
        }

        .diff-btn:hover:not(.active) {
          border-color: rgba(255, 255, 255, 0.6);
          color: rgba(255, 255, 255, 0.8);
        }

        .start-btn {
          margin-top: 0.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .controls-info {
          text-align: center;
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          max-width: 400px;
        }

        .controls-info h3 {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.75rem;
          letter-spacing: 0.2em;
        }

        .control-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .control-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
        }

        .control-item kbd {
          font-family: 'Press Start 2P', cursive;
          font-size: 0.5rem;
          padding: 0.35rem 0.5rem;
          background: rgba(0, 245, 255, 0.1);
          border: 1px solid var(--neon-cyan);
          border-radius: 4px;
          color: var(--neon-cyan);
        }

        .control-item span {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.55rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .mobile-hint {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.55rem;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 0.75rem;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
          96% { opacity: 0.9; }
          97% { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @media (max-width: 640px) {
          .start-screen {
            gap: 1rem;
            padding: 1rem;
            padding-bottom: 3.5rem;
          }

          .control-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25rem;
          }

          .controls-info {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StartScreen;
