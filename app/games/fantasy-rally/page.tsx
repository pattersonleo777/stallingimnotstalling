"use client";
import { useState } from 'react';
import ModelViewer from '@/app/components/ModelViewer';

export default function FantasyRally() {
  const [carUrl, setCarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setCarUrl(data.url);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ background: '#1a0f00', color: '#ffaa00', minHeight: '100vh', padding: '40px' }}>
      <h1 style={{ textShadow: '0 0 10px #ff4400' }}>FANTASY RALLY</h1>
      <p>Upload your mythic car (.glb) to enter the garage</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input type="file" accept=".glb" onChange={handleUpload} disabled={isUploading} />
        {isUploading && <span> Processing Engine...</span>}
      </div>

      <div style={{ border: '3px solid #ffaa00', borderRadius: '20px', overflow: 'hidden' }}>
        {carUrl ? (
          <ModelViewer url={carUrl} />
        ) : (
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
            Awaiting Vehicle Summoning...
          </div>
        )}
      </div>
    </div>
  );
}
