"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useGame, Car, calculateEffectiveStats } from '../context/GameContext';
import Link from 'next/link';

interface WagerRaceState {
  status: 'idle' | 'betting' | 'countdown' | 'racing' | 'finished';
  playerPosition: number;
  opponentPosition: number;
  playerSpeed: number;
  opponentSpeed: number;
  playerRPM: number;
  playerGear: number;
  raceTime: number;
  winner: 'player' | 'opponent' | null;
  wagerAmount: number;
  lightPhase: number;
}

const TRACK_LENGTH = 1320;
const GEAR_RATIOS = [3.5, 2.1, 1.4, 1.0, 0.8, 0.65];

const WAGER_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const AI_OPPONENTS = [
  { name: 'Rookie Racer', level: 1, multiplier: 0.7, make: 'Honda', model: 'Civic', baseHP: 150 },
  { name: 'Street Hustler', level: 3, multiplier: 0.85, make: 'Nissan', model: '240SX', baseHP: 200 },
  { name: 'Track Day Terror', level: 5, multiplier: 1.0, make: 'Toyota', model: 'Supra', baseHP: 280 },
  { name: 'Pro Drifter', level: 8, multiplier: 1.1, make: 'Mazda', model: 'RX-7', baseHP: 320 },
  { name: 'Racing Legend', level: 12, multiplier: 1.25, make: 'Nissan', model: 'GT-R', baseHP: 400 },
];

export default function WagerRacePage() {
  const { state, dispatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const [raceState, setRaceState] = useState<WagerRaceState>({
    status: 'idle',
    playerPosition: 0,
    opponentPosition: 0,
    playerSpeed: 0,
    opponentSpeed: 0,
    playerRPM: 1000,
    playerGear: 1,
    raceTime: 0,
    winner: null,
    wagerAmount: 0,
    lightPhase: 0,
  });

  const [selectedOpponent, setSelectedOpponent] = useState<typeof AI_OPPONENTS[0] | null>(null);
  const [selectedWager, setSelectedWager] = useState<number>(0);
  const [isShifting, setIsShifting] = useState(false);
  const [throttle, setThrottle] = useState(0);

  const playerStats = state.selectedCar ? calculateEffectiveStats(state.selectedCar) : null;

  const opponentCar: Car | null = selectedOpponent ? {
    id: 'wager-opponent',
    name: selectedOpponent.name,
    make: selectedOpponent.make,
    model: selectedOpponent.model,
    year: 2020,
    paint: '#ff4444',
    raceNumber: selectedOpponent.level * 10,
    vinylLayers: [],
    stats: {
      horsepower: selectedOpponent.baseHP * selectedOpponent.multiplier,
      torque: selectedOpponent.baseHP * 0.8,
      weight: 2800,
      grip: 1.0 + (selectedOpponent.level * 0.05),
      acceleration: 1.0 + (selectedOpponent.level * 0.03),
      topSpeed: 1.0 + (selectedOpponent.level * 0.04),
    },
    installedParts: [],
  } : null;

  const canAfford = (amount: number) => (state.player?.credits || 0) >= amount;

  // Draw race
  const drawRace = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.selectedCar || !opponentCar) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { playerPosition, opponentPosition, playerSpeed, opponentSpeed, lightPhase, playerGear, playerRPM } = raceState;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Night sky with neon glow
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, '#0a001a');
    gradient.addColorStop(1, '#1a0a20');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 150);

    // Neon city skyline
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 100, canvas.width, 100);
    for (let i = 0; i < 15; i++) {
      const h = 30 + Math.random() * 70;
      ctx.fillStyle = `rgba(${Math.random() * 50}, ${Math.random() * 30}, ${Math.random() * 50 + 30}, 0.8)`;
      ctx.fillRect(i * 65, 150 - h, 50, h);
      // Neon lights
      ctx.fillStyle = `hsl(${280 + Math.random() * 60}, 100%, 50%)`;
      ctx.fillRect(i * 65 + 10, 155 - h, 30, 3);
    }

    // Track with neon strips
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 200, canvas.width, 200);

    // Neon side strips
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(0, 200, canvas.width, 3);
    ctx.fillRect(0, 397, canvas.width, 3);

    // Center lane divider (animated)
    ctx.strokeStyle = '#666';
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(canvas.width, 300);
    ctx.stroke();
    ctx.setLineDash([]);

    // Start/Finish
    const startX = 80;
    const finishX = canvas.width - 80;

    // Neon start line
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(startX, 200, 4, 200);
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(startX, 200, 4, 200);
    ctx.shadowBlur = 0;

    // Checkered finish
    for (let y = 200; y < 400; y += 15) {
      for (let x = 0; x < 30; x += 15) {
        ctx.fillStyle = (x + y) % 30 === 0 ? 'white' : 'black';
        ctx.fillRect(finishX + x, y, 15, 15);
      }
    }

    // Car positions
    const trackLen = canvas.width - 160;
    const playerX = startX + (playerPosition / TRACK_LENGTH) * trackLen;
    const oppX = startX + (opponentPosition / TRACK_LENGTH) * trackLen;

    // Draw cars with glow
    drawNeonCar(ctx, Math.min(oppX, finishX), 250, opponentCar.paint, opponentCar.raceNumber);
    drawNeonCar(ctx, Math.min(playerX, finishX), 340, state.selectedCar.paint, state.selectedCar.raceNumber);

    // Starting lights
    if (raceState.status === 'countdown') {
      drawWagerLights(ctx, canvas.width / 2, 60, lightPhase);
    }

    // HUD
    drawWagerHUD(ctx, canvas, playerSpeed, oppSpeed, playerGear, playerRPM, raceState.wagerAmount, raceState.status);

  }, [raceState, state.selectedCar, opponentCar]);

  const drawNeonCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, num: number) => {
    // Neon glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 35, y + 8);
    ctx.lineTo(x - 25, y - 8);
    ctx.lineTo(x + 15, y - 12);
    ctx.lineTo(x + 38, y - 2);
    ctx.lineTo(x + 42, y + 12);
    ctx.lineTo(x - 40, y + 12);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Windows
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(x - 20, y - 5, 20, 12);
    ctx.fillRect(x + 5, y - 5, 18, 12);

    // Wheels
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x - 20, y + 18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.arc(x + 22, y + 18, 9, 0, Math.PI * 2);
    ctx.fill();

    // Number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${num}`, x, y + 5);
  };

  const drawWagerLights = (ctx: CanvasRenderingContext2D, x: number, y: number, phase: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(x - 50, y - 25, 100, 60);
    ctx.strokeStyle = '#ff00ff';
    ctx.strokeRect(x - 50, y - 25, 100, 60);

    const colors = ['#ff0000', '#ffff00', '#00ff00'];
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x - 25 + i * 25, y, 10, 0, Math.PI * 2);
      if (phase > i) {
        ctx.fillStyle = colors[i];
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors[i];
      } else {
        ctx.fillStyle = '#333';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  const drawWagerHUD = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, speed: number, oppSpeed: number, gear: number, rpm: number, wager: number, status: string) => {
    // Wager display
    if (wager > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(canvas.width / 2 - 80, 10, 160, 40);
      ctx.strokeStyle = '#ffff00';
      ctx.strokeRect(canvas.width / 2 - 80, 10, 160, 40);
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`WAGER: ${wager} CR`, canvas.width / 2, 38);
    }

    // Speed & gear (bottom HUD)
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(20, canvas.height - 70, 180, 55);
    ctx.strokeStyle = '#00ffff';
    ctx.strokeRect(20, canvas.height - 70, 180, 55);

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(speed)}`, 30, canvas.height - 35);
    ctx.font = '12px Arial';
    ctx.fillText('MPH', 100, canvas.height - 35);

    // Gear
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(210, canvas.height - 70, 50, 55);
    ctx.strokeStyle = '#ff00ff';
    ctx.strokeRect(210, canvas.height - 70, 50, 55);
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${gear}`, 235, canvas.height - 35);

    // RPM bar
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(270, canvas.height - 70, 130, 55);
    ctx.strokeStyle = '#ff6600';
    ctx.strokeRect(270, canvas.height - 70, 130, 55);

    const rpmPct = (rpm - 1000) / 7000;
    const rpmColor = rpm > 7000 ? '#ff0000' : rpm > 6000 ? '#ff6600' : '#00ff00';
    ctx.fillStyle = rpmColor;
    ctx.fillRect(280, canvas.height - 50, 110 * rpmPct, 15);
  };

  // Game loop
  useEffect(() => {
    const loop = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;

      if (raceState.status === 'racing' && playerStats && opponentCar) {
        setRaceState(prev => {
          const power = playerStats.horsepower * (throttle / 100);
          const accel = (power / playerStats.weight) * 50 * GEAR_RATIOS[prev.playerGear - 1];

          let rpm = prev.playerRPM + (throttle * 30 - (isShifting ? 3000 : 0)) * dt;
          rpm = Math.max(1000, Math.min(8000, rpm));

          const gearMult = GEAR_RATIOS[prev.playerGear - 1];
          let spd = prev.playerSpeed + accel * dt;
          const maxSpd = (8000 / gearMult) * 0.02 * playerStats.topSpeed;
          spd = Math.min(spd, maxSpd) * (1 - 0.01 * dt);

          const pPos = prev.playerPosition + spd * 1.467 * dt;

          // Opponent
          const oppStats = calculateEffectiveStats(opponentCar);
          const oppPwr = oppStats.horsepower * (selectedOpponent?.multiplier || 1);
          const oppAcc = (oppPwr / oppStats.weight) * 45;
          let oppSpd = prev.opponentSpeed + oppAcc * dt;
          oppSpd = Math.min(oppSpd, 180 * oppStats.topSpeed) * (1 - 0.008 * dt);
          const oPos = prev.opponentPosition + oppSpd * 1.467 * dt;

          const time = prev.raceTime + dt;

          let winner = prev.winner;
          let status = prev.status;
          if (pPos >= TRACK_LENGTH || oPos >= TRACK_LENGTH) {
            status = 'finished';
            if (!winner) {
              winner = pPos >= TRACK_LENGTH ? 'player' : 'opponent';
              if (winner === 'player') {
                dispatch({ type: 'ADD_XP', payload: 150 });
                dispatch({ type: 'ADD_CREDITS', payload: prev.wagerAmount * 2 });
                dispatch({ type: 'RECORD_WIN' });
              } else {
                dispatch({ type: 'ADD_XP', payload: 25 });
                dispatch({ type: 'ADD_CREDITS', payload: -prev.wagerAmount });
                dispatch({ type: 'RECORD_LOSS' });
              }
            }
          }

          return {
            ...prev,
            playerPosition: pPos,
            opponentPosition: oPos,
            playerSpeed: spd,
            opponentSpeed: oppSpd,
            playerRPM: rpm,
            raceTime: time,
            winner,
            status,
          };
        });
      }

      drawRace();
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [drawRace, raceState.status, throttle, isShifting, playerStats, opponentCar, selectedOpponent, dispatch]);

  const startWagerRace = () => {
    if (!selectedOpponent || !selectedWager || !canAfford(selectedWager)) return;

    setRaceState(prev => ({
      ...prev,
      status: 'countdown',
      wagerAmount: selectedWager,
      lightPhase: 0,
    }));

    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      setRaceState(prev => ({ ...prev, lightPhase: phase }));
      if (phase >= 3) {
        clearInterval(interval);
        setRaceState(prev => ({ ...prev, status: 'racing' }));
      }
    }, 1000);
  };

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
      wagerAmount: 0,
      lightPhase: 0,
    });
    setSelectedOpponent(null);
    setSelectedWager(0);
    setThrottle(0);
  };

  // Keyboard controls
  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        setThrottle(100);
      }
      if (e.key === 'Shift' || e.key === 'ArrowRight') {
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
    const keyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') setThrottle(0);
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [raceState.status, raceState.playerGear, raceState.playerRPM]);

  if (!state.selectedCar) {
    return (
      <div style={styles.container}>
        <div style={styles.noCarMessage}>
          <h2>No Car Selected</h2>
          <Link href="/games/fantasy-rally/garage" style={styles.goToGarage}>GO TO GARAGE</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>WAGER RACE</h1>
        <div style={styles.credits}>💎 {state.player?.credits.toLocaleString() || 0} CR</div>
      </header>

      {raceState.status === 'idle' && (
        <div style={styles.setupPanel}>
          <h2 style={styles.sectionTitle}>SELECT OPPONENT</h2>
          <div style={styles.opponentGrid}>
            {AI_OPPONENTS.map((opp) => (
              <div
                key={opp.name}
                style={{
                  ...styles.opponentCard,
                  border: selectedOpponent?.name === opp.name ? '2px solid #ff00ff' : '1px solid #333',
                }}
                onClick={() => setSelectedOpponent(opp)}
              >
                <div style={styles.oppLevel}>LVL {opp.level}</div>
                <div style={styles.oppName}>{opp.name}</div>
                <div style={styles.oppCar}>{opp.make} {opp.model}</div>
                <div style={styles.oppHP}>{Math.round(opp.baseHP * opp.multiplier)} HP</div>
              </div>
            ))}
          </div>

          <h2 style={styles.sectionTitle}>SELECT WAGER</h2>
          <div style={styles.wagerGrid}>
            {WAGER_AMOUNTS.map((amt) => (
              <button
                key={amt}
                style={{
                  ...styles.wagerBtn,
                  background: selectedWager === amt ? '#ff00ff' : '#222',
                  opacity: canAfford(amt) ? 1 : 0.4,
                }}
                onClick={() => canAfford(amt) && setSelectedWager(amt)}
                disabled={!canAfford(amt)}
              >
                {amt} CR
              </button>
            ))}
          </div>

          {selectedOpponent && selectedWager > 0 && (
            <div style={styles.racePreview}>
              <div>
                <strong>YOUR CAR:</strong> {state.selectedCar.name} ({playerStats?.horsepower} HP)
              </div>
              <div style={styles.vs}>VS</div>
              <div>
                <strong>OPPONENT:</strong> {selectedOpponent.name} ({Math.round(selectedOpponent.baseHP * selectedOpponent.multiplier)} HP)
              </div>
              <div style={styles.wagerPreview}>
                WIN: <span style={{ color: '#00ff00' }}>+{selectedWager * 2} CR</span> |
                LOSE: <span style={{ color: '#ff4444' }}>-{selectedWager} CR</span>
              </div>
              <button style={styles.startRaceBtn} onClick={startWagerRace}>
                START WAGER RACE
              </button>
            </div>
          )}
        </div>
      )}

      {(raceState.status === 'countdown' || raceState.status === 'racing' || raceState.status === 'finished') && (
        <>
          <div style={styles.canvasWrap}>
            <canvas ref={canvasRef} width={800} height={420} style={styles.canvas} />
          </div>

          {raceState.status === 'racing' && (
            <div style={styles.raceInfo}>
              <div style={styles.timer}>{raceState.raceTime.toFixed(3)}s</div>
            </div>
          )}

          {raceState.status === 'finished' && (
            <div style={styles.resultPanel}>
              <h2 style={{
                color: raceState.winner === 'player' ? '#00ff00' : '#ff4444',
                fontSize: '2.5rem',
              }}>
                {raceState.winner === 'player' ? 'YOU WIN!' : 'YOU LOSE'}
              </h2>
              <div style={styles.resultStats}>
                <div>Time: {raceState.raceTime.toFixed(3)}s</div>
                {raceState.winner === 'player' ? (
                  <div style={{ color: '#00ff00' }}>+{raceState.wagerAmount * 2} CR | +150 XP</div>
                ) : (
                  <div style={{ color: '#ff4444' }}>-{raceState.wagerAmount} CR | +25 XP</div>
                )}
              </div>
              <button style={styles.playAgainBtn} onClick={resetRace}>RACE AGAIN</button>
            </div>
          )}

          <div style={styles.controls}>
            <button
              style={styles.gasBtn}
              onMouseDown={() => setThrottle(100)}
              onMouseUp={() => setThrottle(0)}
              onTouchStart={() => setThrottle(100)}
              onTouchEnd={() => setThrottle(0)}
            >GAS</button>
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
            >SHIFT</button>
          </div>
        </>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a001a 0%, #1a0020 100%)',
    color: 'white',
    padding: '20px',
    fontFamily: "'Orbitron', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },
  backBtn: { color: '#888', textDecoration: 'none' },
  title: { color: '#ff00ff', fontSize: '1.5rem', margin: 0, textShadow: '0 0 20px #ff00ff' },
  credits: { background: '#222', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ff00ff' },
  setupPanel: { maxWidth: '800px', margin: '0 auto' },
  sectionTitle: { color: '#ff00ff', fontSize: '1rem', letterSpacing: '2px', marginBottom: '15px' },
  opponentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' },
  opponentCard: {
    background: '#151515',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  oppLevel: { fontSize: '0.7rem', color: '#ff00ff', marginBottom: '5px' },
  oppName: { fontWeight: 'bold', marginBottom: '5px' },
  oppCar: { fontSize: '0.8rem', color: '#888', marginBottom: '5px' },
  oppHP: { color: '#00ffff', fontSize: '0.9rem' },
  wagerGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' },
  wagerBtn: {
    padding: '15px 25px',
    border: '1px solid #ff00ff',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  },
  racePreview: {
    background: '#151515',
    border: '1px solid #ff00ff',
    borderRadius: '15px',
    padding: '25px',
    textAlign: 'center',
  },
  vs: { fontSize: '2rem', color: '#ff00ff', margin: '15px 0' },
  wagerPreview: { marginTop: '15px', color: '#888' },
  startRaceBtn: {
    marginTop: '20px',
    background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
    border: 'none',
    color: 'white',
    padding: '15px 40px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  canvasWrap: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  canvas: { borderRadius: '10px', border: '2px solid #ff00ff', maxWidth: '100%' },
  raceInfo: { textAlign: 'center' },
  timer: { fontSize: '2rem', color: '#00ffff' },
  resultPanel: { textAlign: 'center', background: '#151515', padding: '30px', borderRadius: '15px', maxWidth: '500px', margin: '0 auto' },
  resultStats: { margin: '20px 0' },
  playAgainBtn: { background: '#222', border: '1px solid #ff00ff', color: 'white', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  controls: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' },
  gasBtn: { width: '100px', height: '70px', background: 'linear-gradient(135deg, #ff00ff, #ff6600)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  shiftBtn: { width: '100px', height: '70px', background: '#222', border: '2px solid #00ffff', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  noCarMessage: { textAlign: 'center', padding: '100px' },
  goToGarage: { display: 'inline-block', marginTop: '20px', background: '#ff00ff', color: 'white', padding: '15px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' },
};
