import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { RaceResult } from '../App';

interface GameProps {
  onFinish: (result: RaceResult) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Kart {
  x: number;
  y: number;
  angle: number;
  speed: number;
  lap: number;
  checkpoint: number;
  finished: boolean;
  finishTime: number;
}

interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

const TRACK_WIDTH = 800;
const TRACK_HEIGHT = 600;
const KART_SIZE = 20;
const MAX_SPEED = 5;
const ACCELERATION = 0.15;
const BRAKE = 0.2;
const FRICTION = 0.02;
const TURN_SPEED = 0.06;
const TOTAL_LAPS = 3;

// Track checkpoints (circular track)
const CHECKPOINTS = [
  { x: 400, y: 100, radius: 60 },
  { x: 650, y: 200, radius: 60 },
  { x: 700, y: 400, radius: 60 },
  { x: 550, y: 520, radius: 60 },
  { x: 250, y: 520, radius: 60 },
  { x: 100, y: 400, radius: 60 },
  { x: 150, y: 200, radius: 60 },
];

const FINISH_LINE = { x: 400, y: 150, width: 80, height: 20 };

const Game: React.FC<GameProps> = ({ onFinish, difficulty }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceTime, setRaceTime] = useState(0);
  const gameLoopRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const controlsRef = useRef<Controls>({ up: false, down: false, left: false, right: false });
  const [scale, setScale] = useState(1);

  const playerRef = useRef<Kart>({
    x: 380,
    y: 180,
    angle: -Math.PI / 2,
    speed: 0,
    lap: 0,
    checkpoint: 0,
    finished: false,
    finishTime: 0,
  });

  const botRef = useRef<Kart>({
    x: 420,
    y: 180,
    angle: -Math.PI / 2,
    speed: 0,
    lap: 0,
    checkpoint: 0,
    finished: false,
    finishTime: 0,
  });

  const botSpeedMultiplier = difficulty === 'easy' ? 0.7 : difficulty === 'medium' ? 0.85 : 1;

  // Handle resize
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = containerRef.current.clientHeight - 200;
        const scaleX = containerWidth / TRACK_WIDTH;
        const scaleY = containerHeight / TRACK_HEIGHT;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !raceStarted) {
      setRaceStarted(true);
      startTimeRef.current = Date.now();
    }
  }, [countdown, raceStarted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') controlsRef.current.up = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') controlsRef.current.down = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') controlsRef.current.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') controlsRef.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') controlsRef.current.up = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') controlsRef.current.down = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') controlsRef.current.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') controlsRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updateKart = useCallback((kart: Kart, controls: Controls, isBot: boolean): void => {
    // Acceleration/Brake
    if (controls.up) {
      kart.speed = Math.min(kart.speed + ACCELERATION * (isBot ? botSpeedMultiplier : 1), MAX_SPEED * (isBot ? botSpeedMultiplier : 1));
    } else if (controls.down) {
      kart.speed = Math.max(kart.speed - BRAKE, -MAX_SPEED * 0.3);
    } else {
      kart.speed *= (1 - FRICTION);
    }

    // Turning (only when moving)
    if (Math.abs(kart.speed) > 0.1) {
      if (controls.left) kart.angle -= TURN_SPEED * (kart.speed > 0 ? 1 : -1);
      if (controls.right) kart.angle += TURN_SPEED * (kart.speed > 0 ? 1 : -1);
    }

    // Movement
    kart.x += Math.cos(kart.angle) * kart.speed;
    kart.y += Math.sin(kart.angle) * kart.speed;

    // Track boundaries (oval track)
    const centerX = TRACK_WIDTH / 2;
    const centerY = TRACK_HEIGHT / 2;
    const outerRadiusX = 350;
    const outerRadiusY = 250;
    const innerRadiusX = 180;
    const innerRadiusY = 120;

    const dx = kart.x - centerX;
    const dy = kart.y - centerY;
    const distOuter = Math.sqrt((dx * dx) / (outerRadiusX * outerRadiusX) + (dy * dy) / (outerRadiusY * outerRadiusY));
    const distInner = Math.sqrt((dx * dx) / (innerRadiusX * innerRadiusX) + (dy * dy) / (innerRadiusY * innerRadiusY));

    if (distOuter > 1) {
      kart.x = centerX + (dx / distOuter);
      kart.y = centerY + (dy / distOuter);
      kart.speed *= 0.5;
    }

    if (distInner < 1) {
      const pushFactor = 1 / distInner;
      kart.x = centerX + dx * pushFactor * (innerRadiusX / outerRadiusX);
      kart.y = centerY + dy * pushFactor * (innerRadiusY / outerRadiusY);
      kart.speed *= 0.5;
    }

    // Check checkpoints
    const nextCheckpoint = CHECKPOINTS[kart.checkpoint % CHECKPOINTS.length];
    const cpDist = Math.sqrt((kart.x - nextCheckpoint.x) ** 2 + (kart.y - nextCheckpoint.y) ** 2);
    if (cpDist < nextCheckpoint.radius) {
      kart.checkpoint++;
    }

    // Check finish line (only after all checkpoints in this lap)
    if (kart.checkpoint >= CHECKPOINTS.length * (kart.lap + 1)) {
      if (kart.x > FINISH_LINE.x - FINISH_LINE.width / 2 &&
          kart.x < FINISH_LINE.x + FINISH_LINE.width / 2 &&
          kart.y > FINISH_LINE.y - FINISH_LINE.height / 2 &&
          kart.y < FINISH_LINE.y + FINISH_LINE.height / 2) {
        kart.lap++;
        if (kart.lap >= TOTAL_LAPS && !kart.finished) {
          kart.finished = true;
          kart.finishTime = Date.now() - startTimeRef.current;
        }
      }
    }
  }, [botSpeedMultiplier]);

  const getBotControls = useCallback((): Controls => {
    const bot = botRef.current;
    const targetCheckpoint = CHECKPOINTS[bot.checkpoint % CHECKPOINTS.length];

    let targetX = targetCheckpoint.x;
    let targetY = targetCheckpoint.y;

    // If near checkpoint, look ahead
    const distToCheckpoint = Math.sqrt((bot.x - targetX) ** 2 + (bot.y - targetY) ** 2);
    if (distToCheckpoint < 100) {
      const nextCp = CHECKPOINTS[(bot.checkpoint + 1) % CHECKPOINTS.length];
      targetX = (targetX + nextCp.x) / 2;
      targetY = (targetY + nextCp.y) / 2;
    }

    const angleToTarget = Math.atan2(targetY - bot.y, targetX - bot.x);
    let angleDiff = angleToTarget - bot.angle;

    // Normalize angle
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    return {
      up: true,
      down: false,
      left: angleDiff < -0.1,
      right: angleDiff > 0.1,
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!raceStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const player = playerRef.current;
      const bot = botRef.current;

      // Update
      if (!player.finished) {
        updateKart(player, controlsRef.current, false);
      }
      if (!bot.finished) {
        updateKart(bot, getBotControls(), true);
      }

      // Update race time
      setRaceTime(Date.now() - startTimeRef.current);

      // Check if race is over
      if (player.finished && bot.finished) {
        onFinish({
          playerTime: player.finishTime,
          botTime: bot.finishTime,
          winner: player.finishTime <= bot.finishTime ? 'player' : 'bot',
        });
        return;
      }

      // Draw
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, TRACK_WIDTH, TRACK_HEIGHT);

      // Draw track
      const centerX = TRACK_WIDTH / 2;
      const centerY = TRACK_HEIGHT / 2;

      // Outer track glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 150, centerX, centerY, 400);
      gradient.addColorStop(0, 'rgba(26, 10, 46, 0.8)');
      gradient.addColorStop(1, 'rgba(10, 10, 15, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, TRACK_WIDTH, TRACK_HEIGHT);

      // Track outline
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f5ff';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 350, 250, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ff00ff';
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 180, 120, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Track surface
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#2d1b4e';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 350, 250, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Finish line
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffff00';
      ctx.fillRect(FINISH_LINE.x - FINISH_LINE.width / 2, FINISH_LINE.y - FINISH_LINE.height / 2, FINISH_LINE.width, FINISH_LINE.height);
      ctx.shadowBlur = 0;

      // Checkered pattern on finish
      ctx.fillStyle = '#000';
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 2; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(
              FINISH_LINE.x - FINISH_LINE.width / 2 + i * 10,
              FINISH_LINE.y - FINISH_LINE.height / 2 + j * 10,
              10, 10
            );
          }
        }
      }

      // Draw speed trail for player
      if (player.speed > 1) {
        ctx.strokeStyle = `rgba(0, 245, 255, ${player.speed / MAX_SPEED * 0.5})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(
          player.x - Math.cos(player.angle) * player.speed * 8,
          player.y - Math.sin(player.angle) * player.speed * 8
        );
        ctx.stroke();
      }

      // Draw bot trail
      if (bot.speed > 1) {
        ctx.strokeStyle = `rgba(255, 0, 255, ${bot.speed / (MAX_SPEED * botSpeedMultiplier) * 0.5})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bot.x, bot.y);
        ctx.lineTo(
          bot.x - Math.cos(bot.angle) * bot.speed * 8,
          bot.y - Math.sin(bot.angle) * bot.speed * 8
        );
        ctx.stroke();
      }

      // Draw karts
      const drawKart = (kart: Kart, color: string, glowColor: string) => {
        ctx.save();
        ctx.translate(kart.x, kart.y);
        ctx.rotate(kart.angle);

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;

        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(KART_SIZE / 2, 0);
        ctx.lineTo(-KART_SIZE / 2, -KART_SIZE / 3);
        ctx.lineTo(-KART_SIZE / 3, 0);
        ctx.lineTo(-KART_SIZE / 2, KART_SIZE / 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
      };

      drawKart(player, '#1a0a2e', '#00f5ff');
      drawKart(bot, '#1a0a2e', '#ff00ff');

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [raceStarted, updateKart, getBotControls, onFinish, botSpeedMultiplier]);

  const handleTouchControl = (control: keyof Controls, pressed: boolean) => {
    controlsRef.current[control] = pressed;
  };

  return (
    <div className="game-container" ref={containerRef}>
      <div className="game-hud">
        <div className="hud-item player-hud">
          <span className="hud-label">YOU</span>
          <span className="hud-value">LAP {Math.min(playerRef.current.lap + 1, TOTAL_LAPS)}/{TOTAL_LAPS}</span>
        </div>
        <div className="hud-item time-hud">
          <span className="hud-label">TIME</span>
          <span className="hud-value">{(raceTime / 1000).toFixed(1)}s</span>
        </div>
        <div className="hud-item bot-hud">
          <span className="hud-label">BOT</span>
          <span className="hud-value">LAP {Math.min(botRef.current.lap + 1, TOTAL_LAPS)}/{TOTAL_LAPS}</span>
        </div>
      </div>

      <div className="canvas-wrapper" style={{ transform: `scale(${scale})` }}>
        <canvas
          ref={canvasRef}
          width={TRACK_WIDTH}
          height={TRACK_HEIGHT}
          className="game-canvas"
        />

        {countdown > 0 && (
          <div className="countdown">
            <span className="countdown-number">{countdown}</span>
          </div>
        )}

        {countdown === 0 && !raceStarted && (
          <div className="countdown">
            <span className="countdown-go">GO!</span>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mobile-controls">
        <div className="control-left">
          <button
            className="touch-btn turn-btn"
            onTouchStart={() => handleTouchControl('left', true)}
            onTouchEnd={() => handleTouchControl('left', false)}
            onMouseDown={() => handleTouchControl('left', true)}
            onMouseUp={() => handleTouchControl('left', false)}
            onMouseLeave={() => handleTouchControl('left', false)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button
            className="touch-btn turn-btn"
            onTouchStart={() => handleTouchControl('right', true)}
            onTouchEnd={() => handleTouchControl('right', false)}
            onMouseDown={() => handleTouchControl('right', true)}
            onMouseUp={() => handleTouchControl('right', false)}
            onMouseLeave={() => handleTouchControl('right', false)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
          </button>
        </div>
        <div className="control-right">
          <button
            className="touch-btn accel-btn"
            onTouchStart={() => handleTouchControl('up', true)}
            onTouchEnd={() => handleTouchControl('up', false)}
            onMouseDown={() => handleTouchControl('up', true)}
            onMouseUp={() => handleTouchControl('up', false)}
            onMouseLeave={() => handleTouchControl('up', false)}
          >
            GAS
          </button>
          <button
            className="touch-btn brake-btn"
            onTouchStart={() => handleTouchControl('down', true)}
            onTouchEnd={() => handleTouchControl('down', false)}
            onMouseDown={() => handleTouchControl('down', true)}
            onMouseUp={() => handleTouchControl('down', false)}
            onMouseLeave={() => handleTouchControl('down', false)}
          >
            BRAKE
          </button>
        </div>
      </div>

      <style>{`
        .game-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          padding-bottom: 3rem;
          overflow: hidden;
        }

        .game-hud {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 800px;
          margin-bottom: 1rem;
          gap: 0.5rem;
        }

        .hud-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
        }

        .hud-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
        }

        .hud-value {
          font-family: 'Press Start 2P', cursive;
          font-size: 0.7rem;
        }

        .player-hud .hud-value {
          color: var(--neon-cyan);
          text-shadow: 0 0 10px var(--neon-cyan);
        }

        .bot-hud .hud-value {
          color: var(--neon-pink);
          text-shadow: 0 0 10px var(--neon-pink);
        }

        .time-hud .hud-value {
          color: var(--neon-yellow);
          text-shadow: 0 0 10px var(--neon-yellow);
        }

        .canvas-wrapper {
          position: relative;
          transform-origin: top center;
        }

        .game-canvas {
          border: 2px solid rgba(0, 245, 255, 0.3);
          border-radius: 8px;
          box-shadow: 0 0 30px rgba(0, 245, 255, 0.2);
        }

        .countdown {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .countdown-number {
          font-family: 'Press Start 2P', cursive;
          font-size: 6rem;
          color: var(--neon-yellow);
          text-shadow: 0 0 30px var(--neon-yellow), 0 0 60px var(--neon-yellow);
          animation: countPulse 1s ease-out;
        }

        .countdown-go {
          font-family: 'Press Start 2P', cursive;
          font-size: 4rem;
          color: var(--neon-green);
          text-shadow: 0 0 30px var(--neon-green), 0 0 60px var(--neon-green);
          animation: countPulse 0.5s ease-out;
        }

        @keyframes countPulse {
          from {
            transform: scale(1.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .mobile-controls {
          display: none;
          width: 100%;
          max-width: 500px;
          justify-content: space-between;
          margin-top: 1rem;
          padding: 0 1rem;
        }

        .control-left,
        .control-right {
          display: flex;
          gap: 0.5rem;
        }

        .touch-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.5rem;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          touch-action: manipulation;
        }

        .turn-btn {
          border-color: var(--neon-cyan);
          color: var(--neon-cyan);
        }

        .turn-btn svg {
          width: 30px;
          height: 30px;
        }

        .accel-btn {
          border-color: var(--neon-green);
          color: var(--neon-green);
        }

        .brake-btn {
          border-color: var(--neon-pink);
          color: var(--neon-pink);
        }

        .touch-btn:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 900px) {
          .mobile-controls {
            display: flex;
          }
        }

        @media (max-width: 640px) {
          .game-container {
            padding: 0.5rem;
            padding-bottom: 3.5rem;
          }

          .game-hud {
            margin-bottom: 0.5rem;
          }

          .hud-item {
            padding: 0.35rem 0.5rem;
          }

          .hud-label {
            font-size: 0.5rem;
          }

          .hud-value {
            font-size: 0.55rem;
          }

          .countdown-number {
            font-size: 4rem;
          }

          .countdown-go {
            font-size: 3rem;
          }

          .touch-btn {
            width: 55px;
            height: 55px;
          }
        }
      `}</style>
    </div>
  );
};

export default Game;
