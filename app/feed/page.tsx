"use client";
import React, { useEffect, useState } from 'react';
import ModelViewer from '@/app/components/ModelViewer';
import Link from 'next/link';
import { calculateLevel } from '@/app/lib/leveling';

export default function GlobalFeed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/feed').then(res => res.json()).then(setItems);
  }, []);

  const handleAction = async (modelId: string, action: string) => {
    const text = action === 'comment' ? prompt("Enter message:") : null;
    if (action === 'comment' && !text) return;

    await fetch('/api/social', {
      method: 'POST',
      body: JSON.stringify({ modelId, action, text })
    });
    alert("Social Interaction Logged");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', padding: '40px' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#00f2fe', letterSpacing: '2px', textShadow: '0 0 10px #00f2fe' }}>GLOBAL ARMORY</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link href="/leaderboard" style={{ color: '#ff0055', textDecoration: 'none' }}>🏆 Leaderboard</Link>
            <Link href="/profile" style={{ color: '#aaa', textDecoration: 'none' }}>👤 Your Hangar</Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' }}>
        {items.map((item: any) => {
          const userModels = item.user.models || [];
          const totalParts = userModels.reduce((acc, m) => acc + (m.partCount || 1), 0);
          const pilotStats = calculateLevel(userModels.length, totalParts);

          return (
            <div key={item.id} style={{ background: '#111', borderRadius: '15px', padding: '20px', border: '1px solid #333', position: 'relative' }}>
              {/* Level Badge Overlay */}
              <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#00f2fe', color: 'black', padding: '5px 12px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 0 15px #00f2fe' }}>
                LVL {pilotStats.level}
              </div>

              <div style={{ height: '320px', marginBottom: '15px', background: '#000', borderRadius: '10px' }}>
                <ModelViewer url={item.url} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>{item.name}</h3>
                  <p style={{ color: '#00f2fe', fontSize: '11px', margin: '5px 0' }}>{pilotStats.title.toUpperCase()}</p>
                  <p style={{ color: '#666', fontSize: '13px' }}>Pilot: <span style={{color: '#fff'}}>{item.user.name || 'Unknown'}</span></p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#444' }}>
                   {item.game.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => handleAction(item.id, 'like')} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #ff0055', color: '#ff0055', cursor: 'pointer', borderRadius: '5px' }}>
                  ❤️ {item._count.likes} LIKES
                </button>
                <button onClick={() => handleAction(item.id, 'comment')} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #00f2fe', color: '#00f2fe', cursor: 'pointer', borderRadius: '5px' }}>
                  💬 {item._count.comments}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
