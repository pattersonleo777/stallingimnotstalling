"use client";
import React from 'react';

export default function AssetGallery({ models, onSelect }: { models: any[], onSelect: (url: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
      {models.map((model) => (
        <div 
          key={model.id} 
          onClick={() => onSelect(model.url)}
          style={{ padding: '10px', border: '1px solid #444', cursor: 'pointer', textAlign: 'center', background: '#222', borderRadius: '8px' }}
        >
          <div style={{ fontSize: '12px' }}>{model.name}</div>
        </div>
      ))}
    </div>
  );
}
