"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useGame, Car, calculateEffectiveStats } from '../context/GameContext';
import Link from 'next/link';

interface RaceState {
  status: 'idle' | 'countdown' | 'racing' | 'finished';
  playerPosition: number;
  opponentPosition: number;
  playerSpeed: number;
  opponentSpeed: number;
  playerRPM: number;
  playerGear: number;
  raceTime: number;
  winner: 'player' | 'opponent' | null;
  reactionTime: number;
  lightPhase: number;
}

const TRACK_LENGTH = 1320; // Quarter mile in feet
const GEAR_RATIOS = [3.5, 2.1, 1.4, 1.0, 0.8, 0.65];

export default function RacePage() {
  const { state, dispatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const [raceState, setRaceState] = useState<RaceState>({
    status: 'idle',
    playerPosition: 0,
    opponentPosition: 0,
    playerSpeed: 0,
    opponentSpeed: 0,
    playerRPM: 1000,
    playerGear: 1,
    raceTime: 0,
    winner: null,
    reactionTime: 0,
    lightPhase: 0,
  });

  const [isShifting, setIsShifting] = useState(false);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [playerReacted, setPlayerReacted] = useState(false);
  const [throttle, setThrottle] = useState(0);
  const [opponent] = useState<Car>({
    id: 'opponent',
    name: 'Street Rival',
    make: 'Honda',
    model: 'Civic Type R',
    year: 2020,
    paint: '#0066ff',
    raceNumber: 77,
    vinylLayers: [],
    stats: {
      horsepower: 300 + Math.random() * 100,
      torque: 280 + Math.random() * 80,
      weight: 2800 + Math.random() * 400,
      grip: 1.2,
      acceleration: 1.1,
      topSpeed: 1.15,
    },
    installedParts: [],
  });

  const playerStats = state.selectedCar ? calculateEffectiveStats(state.selectedCar) : null;

  // Draw race scene
  const drawRace = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { playerPosition, opponentPosition, playerSpeed, opponentSpeed, status, lightPhase, playerGear, playerRPM } = raceState;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 150);
    skyGradient.addColorStop(0, '#1a0a20');
    skyGradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, 150);

    // Draw stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc((i * 37) % canvas.width, (i * 13) % 100, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw track
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 200, canvas.width, 200);

    // Track lines
    ctx.strokeStyle = '#444';
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(canvas.width, 300);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw lane markers
    ctx.fillStyle = '#333';
    for (let i = 0; i < canvas.width; i += 50) {
      const offset = (playerPosition * 0.3) % 50;
      ctx.fillRect(i - offset, 248, 20, 4);
      ctx.fillRect(i - offset, 348, 20, 4);
    }

    // Start/Finish line
    const startLineX = 100;
    const finishLineX = canvas.width - 100;

    // Start line
    ctx.fillStyle = 'white';
    ctx.fillRect(startLineX, 200, 5, 200);
    ctx.font = '12px Arial';
    ctx.fillText('START', startLineX - 15, 190);

    // Finish line (checkered)
    ctx.fillStyle = 'white';
    for (let y = 200; y < 400; y += 10) {
      for (let x = 0; x < 20; x += 10) {
        if ((x + y) % 20 === 0) {
          ctx.fillRect(finishLineX + x, y, 10, 10);
        }
      }
    }
    ctx.fillText('FINISH', finishLineX, 190);

    // Calculate car positions on screen
    const trackVisualLength = canvas.width - 200;
    const playerScreenX = startLineX + (playerPosition / TRACK_LENGTH) * trackVisualLength;
    const opponentScreenX = startLineX + (opponentPosition / TRACK_LENGTH) * trackVisualLength;

    // Draw opponent car (top lane)
    drawCar(ctx, Math.min(opponentScreenX, finishLineX), 250, opponent.paint, opponent.raceNumber);

    // Draw player car (bottom lane)
    if (state.selectedCar) {
      drawCar(ctx, Math.min(playerScreenX, finishLineX), 330, state.selectedCar.paint, state.selectedCar.raceNumber);
    }

    // Draw starting lights
    if (status === 'countdown' || status === 'idle') {
      drawLights(ctx, canvas.width / 2, 80, lightPhase);
    }

    // Draw HUD
    drawHUD(ctx, canvas, playerSpeed, opponentSpeed, playerGear, playerRPM, status);

  }, [raceState, state.selectedCar, opponent]);

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, num: number) => {
    // Car body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 40, y + 10);
    ctx.lineTo(x - 30, y - 5);
    ctx.lineTo(x + 10, y - 10);
    ctx.lineTo(x + 40, y);
    ctx.lineTo(x + 45, y + 15);
    ctx.lineTo(x - 45, y + 15);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 25, y - 3, 25, 12);
    ctx.fillRect(x + 5, y - 3, 20, 12);

    // Wheels
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x - 25, y + 20, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 25, y + 20, 10, 0, Math.PI * 2);
    ctx.fill();

    // Race number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${num}`, x, y + 8);
  };

  const drawLights = (ctx: CanvasRenderingContext2D, x: number, y: number, phase: number) => {
    const lightColors = ['#444', '#444', '#444', '#00ff00'];
    const activeColors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00'];

    ctx.fillStyle = '#222';
    ctx.fillRect(x - 40, y - 20, 80, 50);

    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x - 25 + i * 17, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = i < phase ? activeColors[i] : lightColors[i];
      ctx.fill();
    }
  };

  const drawHUD = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, speed: number, oppSpeed: number, gear: number, rpm: number, status: string) => {
    // Speed display
    ctx.fillStyle = '#151515';
    ctx.fillRect(20, canvas.height - 80, 200, 60);
    ctx.strokeStyle = '#ff6600';
    ctx.strokeRect(20, canvas.height - 80, 200, 60);

    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(speed)}`, 30, canvas.height - 40);
    ctx.font = '14px Arial';
    ctx.fillText('MPH', 100, canvas.height - 40);

    // Gear indicator
    ctx.fillStyle = '#151515';
    ctx.fillRect(240, canvas.height - 80, 60, 60);
    ctx.strokeStyle = '#ff6600';
    ctx.strokeRect(240, canvas.height - 80, 60, 60);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${gear}`, 270, canvas.height - 40);

    // RPM gauge
    ctx.fillStyle = '#151515';
    ctx.fillRect(320, canvas.height - 80, 150, 60);
    ctx.strokeStyle = '#ff6600';
    ctx.strokeRect(320, canvas.height - 80, 150, 60);

    // RPM bar
    const rpmPercent = (rpm - 1000) / 7000;
    const rpmBarWidth = 130 * rpmPercent;
    const rpmColor = rpm > 7000 ? '#ff0000' : rpm > 6000 ? '#ff6600' : '#00ff00';
    ctx.fillStyle = rpmColor;
    ctx.fillRect(330, canvas.height - 55, rpmBarWidth, 20);
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.fillText('RPM', 395, canvas.height - 35);

    // Opponent speed
    ctx.fillStyle = '#151515';
    ctx.fillRect(canvas.width - 120, canvas.height - 80, 100, 60);
    ctx.strokeStyle = '#0066ff';
    ctx.strokeRect(canvas.width - 120, canvas.height - 80, 100, 60);
    ctx.fillStyle = '#0066ff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${Math.round(oppSpeed)}`, canvas.width - 70, canvas.height - 45);
    ctx.font = '10px Arial';
    ctx.fillText('OPP MPH', canvas.width - 70, canvas.height - 30);
  };

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (raceState.status === 'racing' && playerStats) {
        setRaceState(prev => {
          // Physics calculations
          const playerPower = playerStats.horsepower * (throttle / 100);
          const playerAccel = (playerPower / playerStats.weight) * 50 * GEAR_RATIOS[prev.playerGear - 1];

          // RPM simulation
          let newRPM = prev.playerRPM + (throttle * 30 - (isShifting ? 3000 : 0)) * deltaTime;
          newRPM = Math.max(1000, Math.min(8000, newRPM));

          // Speed from RPM and gear
          const gearMultiplier = GEAR_RATIOS[prev.playerGear - 1];
          let newPlayerSpeed = prev.playerSpeed + playerAccel * deltaTime;

          // Speed limiter based on gear
          const maxSpeedForGear = (8000 / gearMultiplier) * 0.02 * playerStats.topSpeed;
          newPlayerSpeed = Math.min(newPlayerSpeed, maxSpeedForGear);

          // Drag
          newPlayerSpeed *= (1 - 0.01 * deltaTime);

          // Position
          const newPlayerPos = prev.playerPosition + newPlayerSpeed * 1.467 * deltaTime; // 1.467 = mph to ft/s

          // Opponent AI
          const oppStats = calculateEffectiveStats(opponent);
          const oppPower = oppStats.horsepower * 0.9;
          const oppAccel = (oppPower / oppStats.weight) * 45;
          let newOppSpeed = prev.opponentSpeed + oppAccel * deltaTime;
          newOppSpeed = Math.min(newOppSpeed, 180 * oppStats.topSpeed);
          newOppSpeed *= (1 - 0.008 * deltaTime);
          const newOppPos = prev.opponentPosition + newOppSpeed * 1.467 * deltaTime;

          // Race time
          const newRaceTime = prev.raceTime + deltaTime;

          // Check finish
          let winner = prev.winner;
          let status = prev.status;
          if (newPlayerPos >= TRACK_LENGTH || newOppPos >= TRACK_LENGTH) {
            status = 'finished';
            if (!winner) {
              winner = newPlayerPos >= TRACK_LENGTH ? 'player' : 'opponent';
              if (winner === 'player') {
                dispatch({ type: 'ADD_XP', payload: 100 });
                dispatch({ type: 'ADD_CREDITS', payload: 500 });
                dispatch({ type: 'RECORD_WIN' });
              } else {
                dispatch({ type: 'ADD_XP', payload: 25 });
                dispatch({ type: 'RECORD_LOSS' });
              }
            }
          }

          return {
            ...prev,
            playerPosition: newPlayerPos,
            opponentPosition: newOppPos,
            playerSpeed: newPlayerSpeed,
            opponentSpeed: newOppSpeed,
            playerRPM: newRPM,
            raceTime: newRaceTime,
            winner,
            status,
          };
        });
      }

      drawRace();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [drawRace, raceState.status, throttle, isShifting, playerStats, dispatch, opponent]);

  // Start countdown
  const startCountdown = () => {
    setCountdownStarted(true);
    setRaceState(prev => ({ ...prev, status: 'countdown', lightPhase: 0 }));

    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      setRaceState(prev => ({ ...prev, lightPhase: phase }));

      if (phase >= 4) {
        clearInterval(interval);
        setRaceState(prev => ({
          ...prev,
          status: 'racing',
          reactionTime: playerReacted ? 0 : Date.now(),
        }));
      }
    }, 1000);
  };

  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (raceState.status === 'idle' && !countdownStarted) {
          startCountdown();
        }
        if (raceState.status === 'countdown' && !playerReacted) {
          setPlayerReacted(true);
        }
        setThrottle(100);
      }
      if (e.key === 'ArrowRight' || e.key === 'Shift') {
        e.preventDefault();
        if (raceState.status === 'racing' && raceState.playerGear < 6 && raceState.playerRPM > 5500) {
          setIsShifting(true);
          setTimeout(() => {
            setRaceState(prev => ({ ...prev, playerGear: Math.min(6, prev.playerGear + 1), playerRPM: prev.playerRPM - 2500 }));
            setIsShifting(false);
          }, 200);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        setThrottle(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [raceState.status, raceState.playerGear, raceState.playerRPM, countdownStarted, playerReacted]);

  // Reset race
  const resetRace = () => {
    setRaceState({
      status: 'idle',
      playerPosition: 0,
      opponentPosition: 0,
      playerSpeed: 0,
      opponentSpeed: 0,
      playerRPM: 1000,
      playerGear: 1,
      raceTime: 0,
      winner: null,
      reactionTime: 0,
      lightPhase: 0,
    });
    setCountdownStarted(false);
    setPlayerReacted(false);
    setThrottle(0);
  };

  if (!state.selectedCar) {
    return (
      <div style={styles.container}>
        <div style={styles.noCarMessage}>
          <h2>No Car Selected</h2>
          <p>Go to the garage and select a car to race.</p>
          <Link href="/games/fantasy-rally/garage" style={styles.goToGarage}>GO TO GARAGE</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>DRAG RACE</h1>
        <div style={styles.statsDisplay}>
          {state.selectedCar.name} | {playerStats?.horsepower} HP
        </div>
      </header>

      {/* Race Canvas */}
      <div style={styles.canvasContainer}>
        <canvas ref={canvasRef} width={900} height={500} style={styles.canvas} />
      </div>

      {/* Controls & Status */}
      <div style={styles.controlsPanel}>
        {raceState.status === 'idle' && (
          <div style={styles.idlePanel}>
            <h2>READY TO RACE?</h2>
            <p>Press SPACE or ↑ to start countdown</p>
            <p style={styles.controlsHelp}>
              <strong>Controls:</strong><br />
              SPACE / ↑ = Throttle<br />
              SHIFT / → = Shift Up (when RPM &gt; 5500)
            </p>
            <button style={styles.startBtn} onClick={startCountdown}>START RACE</button>
          </div>
        )}

        {raceState.status === 'countdown' && (
          <div style={styles.countdownPanel}>
            <h2 style={styles.countdownText}>
              {raceState.lightPhase < 4 ? `LIGHTS: ${raceState.lightPhase}/3` : 'GO!'}
            </h2>
            <p>Hold SPACE to rev up!</p>
          </div>
        )}

        {raceState.status === 'racing' && (
          <div style={styles.racingPanel}>
            <div style={styles.raceTimer}>{raceState.raceTime.toFixed(3)}s</div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${(raceState.playerPosition / TRACK_LENGTH) * 100}%`, background: state.selectedCar.paint }} />
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${(raceState.opponentPosition / TRACK_LENGTH) * 100}%`, background: opponent.paint }} />
            </div>
          </div>
        )}

        {raceState.status === 'finished' && (
          <div style={styles.finishedPanel}>
            <h2 style={{
              ...styles.resultText,
              color: raceState.winner === 'player' ? '#00ff00' : '#ff4444'
            }}>
              {raceState.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
            </h2>
            <div style={styles.raceStats}>
              <div>Time: {raceState.raceTime.toFixed(3)}s</div>
              <div>Top Speed: {Math.round(Math.max(raceState.playerSpeed, 0))} MPH</div>
              {raceState.winner === 'player' && <div style={styles.rewards}>+100 XP | +500 CR</div>}
            </div>
            <button style={styles.restartBtn} onClick={resetRace}>RACE AGAIN</button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div style={styles.mobileControls}>
        <button
          style={styles.throttleBtn}
          onTouchStart={() => setThrottle(100)}
          onTouchEnd={() => setThrottle(0)}
          onMouseDown={() => setThrottle(100)}
          onMouseUp={() => setThrottle(0)}
        >
          GAS
        </button>
        <button
          style={styles.shiftBtn}
          onClick={() => {
            if (raceState.status === 'racing' && raceState.playerGear < 6 && raceState.playerRPM > 5500) {
              setIsShifting(true);
              setTimeout(() => {
                setRaceState(prev => ({ ...prev, playerGear: Math.min(6, prev.playerGear + 1), playerRPM: prev.playerRPM - 2500 }));
                setIsShifting(false);
              }, 200);
            }
          }}
        >
          SHIFT ↑
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: 'white',
    padding: '20px',
    fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backBtn: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  title: {
    fontSize: '1.5rem',
    margin: 0,
    color: '#ff6600',
    letterSpacing: '3px',
  },
  statsDisplay: {
    color: '#888',
    fontSize: '0.9rem',
  },
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  canvas: {
    borderRadius: '10px',
    border: '2px solid #333',
    maxWidth: '100%',
  },
  controlsPanel: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  idlePanel: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '30px',
  },
  controlsHelp: {
    color: '#666',
    fontSize: '0.85rem',
    marginTop: '20px',
  },
  startBtn: {
    marginTop: '20px',
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    color: 'white',
    padding: '15px 40px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    letterSpacing: '2px',
  },
  countdownPanel: {
    background: '#151515',
    border: '1px solid #ff6600',
    borderRadius: '15px',
    padding: '30px',
  },
  countdownText: {
    fontSize: '2rem',
    color: '#ff6600',
  },
  racingPanel: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '20px',
  },
  raceTimer: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: '20px',
  },
  progressBar: {
    height: '20px',
    background: '#222',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.1s linear',
  },
  finishedPanel: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '30px',
  },
  resultText: {
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  raceStats: {
    color: '#888',
    marginBottom: '20px',
  },
  rewards: {
    color: '#00ff00',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  restartBtn: {
    background: '#222',
    border: '1px solid #444',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  mobileControls: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '20px',
  },
  throttleBtn: {
    width: '120px',
    height: '80px',
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  shiftBtn: {
    width: '120px',
    height: '80px',
    background: '#333',
    border: '2px solid #ff6600',
    borderRadius: '10px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  noCarMessage: {
    textAlign: 'center',
    padding: '100px 20px',
  },
  goToGarage: {
    display: 'inline-block',
    marginTop: '20px',
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    color: 'white',
    padding: '15px 30px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};
