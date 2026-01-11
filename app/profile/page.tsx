"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import ModelViewer from "@/app/components/ModelViewer";
import { calculateLevel } from "@/app/lib/leveling";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState({ level: 1, xp: 0, title: "", nextLevelXP: 0 });

  useEffect(() => {
    if (session) {
      fetch('/api/models/user')
        .then(res => res.json())
        .then(data => {
          setModels(data);
          const totalParts = data.reduce((acc, m) => acc + (m.partCount || 1), 0);
          setStats(calculateLevel(data.length, totalParts));
        });
    }
  }, [session]);

  if (!session) return <div style={{color: 'white', padding: '50px'}}>Access Denied.</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: 'white', padding: '40px' }}>
      {/* Leveling Header */}
      <div style={{ background: 'linear-gradient(90deg, #111 0%, #222 100%)', padding: '30px', borderRadius: '15px', borderLeft: '5px solid #00f2fe', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#00f2fe', margin: 0 }}>RANK: {stats.title.toUpperCase()}</h4>
            <h1 style={{ fontSize: '48px', margin: '10px 0' }}>LEVEL {stats.level}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#888' }}>PILOT: {session.user.name}</p>
            <button onClick={() => signOut()} style={{ marginTop: '10px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '5px 15px', cursor: 'pointer' }}>LOGOUT</button>
          </div>
        </div>
        
        {/* XP Bar */}
        <div style={{ width: '100%', height: '10px', background: '#333', borderRadius: '5px', marginTop: '20px', overflow: 'hidden' }}>
          <div style={{ width: `${(stats.xp / stats.nextLevelXP) * 100}%`, height: '100%', background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }}></div>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{stats.xp} / {stats.nextLevelXP} XP TO NEXT LEVEL</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        <div>
          <h2>HANGAR ASSETS ({models.length})</h2>
          {models.map(m => (
            <div key={m.id} style={{ padding: '15px', background: '#111', border: '1px solid #333', marginBottom: '10px', borderRadius: '8px' }}>
              <strong>{m.name}</strong>
              <div style={{ color: '#00f2fe', fontSize: '12px' }}>{m.partCount} Components Installed</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#111', borderRadius: '15px', padding: '20px', border: '1px solid #333', height: '500px' }}>
            <p style={{ textAlign: 'center', color: '#444', marginTop: '200px' }}>Select an asset from your hangar to inspect technical specs.</p>
        </div>
      </div>
    </div>
  );
}
