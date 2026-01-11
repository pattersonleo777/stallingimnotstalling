import Link from 'next/link';

export default function GamePortal() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0a0a0a', 
      color: 'white',
      fontFamily: 'Orbitron, sans-serif' 
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '50px', textShadow: '0 0 10px #00f2fe' }}>GODSRODS UNIVERSE</h1>
      
      <div style={{ display: 'flex', gap: '40px' }}>
        {/* God Rods Game Card */}
        <Link href="/games/gods-rods" style={{ textDecoration: 'none' }}>
          <div style={{ 
            width: '300px', height: '400px', border: '2px solid #00f2fe', borderRadius: '15px',
            background: 'linear-gradient(145deg, #111, #222)', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s'
          }}>
            <h2>GOD RODS</h2>
            <p>Orbital Kinetic Warfare</p>
          </div>
        </Link>

        {/* Fantasy Rally Game Card */}
        <Link href="/games/fantasy-rally" style={{ textDecoration: 'none' }}>
          <div style={{ 
            width: '300px', height: '400px', border: '2px solid #ff0055', borderRadius: '15px',
            background: 'linear-gradient(145deg, #111, #222)', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <h2>FANTASY RALLY</h2>
            <p>Mythical Combat Racing</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
