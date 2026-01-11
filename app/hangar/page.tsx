"use client";
import { useEffect, useState } from 'react';
import ModelViewer from '@/app/components/ModelViewer';
import Link from 'next/link';

export default function ComponentHangar() {
  const [models, setModels] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/models/user').then(res => res.json()).then(setModels);
  }, []);

  const filteredModels = models.filter(m => filter === 'all' || m.category === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#00f2fe', margin: 0 }}>COMPONENT HANGAR</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setFilter('all')} style={btnStyle(filter === 'all')}>ALL</button>
          <button onClick={() => setFilter('vehicle')} style={btnStyle(filter === 'vehicle')}>VEHICLES</button>
          <button onClick={() => setFilter('part')} style={btnStyle(filter === 'part')}>COMPONENTS</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredModels.map(model => (
          <div key={model.id} style={{ background: '#151515', border: '1px solid #333', padding: '15px', borderRadius: '10px' }}>
            <div style={{ height: '200px', background: '#000', borderRadius: '5px', marginBottom: '10px' }}>
              <ModelViewer url={model.url} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>{model.name}</h4>
                <small style={{ color: '#888' }}>Category: {model.category.toUpperCase()}</small>
              </div>
              <div style={{ color: '#00f2fe', fontWeight: 'bold' }}>{model.partCount} XP</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '40px' }}>
         <Link href="/profile" style={{ color: '#666' }}>← Back to Pilot Profile</Link>
      </div>
    </div>
  );
}

function btnStyle(active) {
  return {
    padding: '8px 20px',
    background: active ? '#00f2fe' : 'transparent',
    color: active ? 'black' : 'white',
    border: '1px solid #00f2fe',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: 'bold'
  };
}
