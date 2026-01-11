"use client";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid Credentials');
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: 'white' }}>
      <form onSubmit={handleSubmit} style={{ width: '400px', padding: '40px', background: '#111', borderRadius: '15px', border: '1px solid #ff0055', boxShadow: '0 0 20px rgba(255, 0, 85, 0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#ff0055' }}>SECURE LOGIN</h2>
        {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}
        
        <input type="email" placeholder="Email" required style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#222', border: '1px solid #333', color: 'white' }} 
          onChange={(e) => setEmail(e.target.value)} />
        
        <input type="password" placeholder="Password" required style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#222', border: '1px solid #333', color: 'white' }} 
          onChange={(e) => setPassword(e.target.value)} />
        
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#ff0055', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          AUTHORIZE ACCESS
        </button>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          New here? <Link href="/register" style={{ color: '#ff0055' }}>Enlist Today</Link>
        </p>
      </form>
    </div>
  );
}
