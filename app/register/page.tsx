"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: 'white', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ width: '400px', padding: '40px', background: '#111', borderRadius: '15px', border: '1px solid #00f2fe', boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#00f2fe' }}>ENLIST: NEW PILOT</h2>
        {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}
        
        <input type="text" placeholder="Callsign (Name)" required style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#222', border: '1px solid #333', color: 'white' }} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} />
        
        <input type="email" placeholder="Email" required style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#222', border: '1px solid #333', color: 'white' }} 
          onChange={(e) => setFormData({...formData, email: e.target.value})} />
        
        <input type="password" placeholder="Access Code" required style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#222', border: '1px solid #333', color: 'white' }} 
          onChange={(e) => setFormData({...formData, password: e.target.value})} />
        
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#00f2fe', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          INITIALIZE ACCOUNT
        </button>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Already registered? <Link href="/login" style={{ color: '#00f2fe' }}>Login here</Link>
        </p>
      </form>
    </div>
  );
}
