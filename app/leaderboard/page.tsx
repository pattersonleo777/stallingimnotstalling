"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: 'white', padding: '50px', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#00f2fe', textShadow: '0 0 10px #00f2fe' }}>GLOBAL COMMAND RANKINGS</h1>
        
        <table style={{ width: '100%', marginTop: '40px', borderCollapse: 'collapse', background: '#111' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>RANK</th>
              <th style={{ padding: '15px' }}>PILOT</th>
              <th style={{ padding: '15px' }}>FLEET SIZE</th>
              <th style={{ padding: '15px' }}>COMBAT SCORE</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player.id} style={{ borderBottom: '1px solid #222', color: index < 3 ? '#00f2fe' : 'white' }}>
                <td style={{ padding: '15px' }}>#{index + 1}</td>
                <td style={{ padding: '15px' }}>{player.name || 'Anonymous'}</td>
                <td style={{ padding: '15px' }}>{player._count.models} Units</td>
                <td style={{ padding: '15px' }}>{player.score.toLocaleString()} XP</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Return to Command Center</Link>
        </div>
      </div>
    </div>
  );
}
