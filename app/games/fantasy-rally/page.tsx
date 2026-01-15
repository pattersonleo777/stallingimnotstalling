"use client";
import { useGame } from './context/GameContext';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function FantasyRallyHome() {
  const { state } = useGame();
  const { data: session } = useSession();

  const menuItems = [
    { id: 'garage', name: 'MY GARAGE', icon: '🏎️', href: '/games/fantasy-rally/garage', desc: 'View & manage your car collection' },
    { id: 'customize', name: 'CUSTOMIZE', icon: '🎨', href: '/games/fantasy-rally/customize', desc: 'Paint, livery, body kits & wheels' },
    { id: 'race', name: 'DRAG RACE', icon: '🏁', href: '/games/fantasy-rally/race', desc: 'Compete in street races' },
    { id: 'wager', name: 'WAGER RACE', icon: '💰', href: '/games/fantasy-rally/wager', desc: 'Bet credits on your skills' },
    { id: 'parts', name: 'PARTS SHOP', icon: '⚙️', href: '/games/fantasy-rally/parts', desc: 'Buy & create performance parts' },
    { id: 'auction', name: 'AUCTION', icon: '🔨', href: '/games/fantasy-rally/auction', desc: 'Buy & sell cars and parts' },
    { id: 'friends', name: 'FRIENDS', icon: '👥', href: '/games/fantasy-rally/friends', desc: 'Connect & race with friends' },
    { id: 'profile', name: 'PROFILE', icon: '👤', href: '/games/fantasy-rally/pilot', desc: 'View stats & achievements' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>FANTASY RALLY</h1>
          <p style={styles.subtitle}>Mythical Combat Racing</p>
        </div>
        {state.player && (
          <div style={styles.playerInfo}>
            <div style={styles.levelBadge}>LVL {state.player.level}</div>
            <div>
              <div style={styles.playerName}>{session?.user?.name || 'PILOT'}</div>
              <div style={styles.playerTitle}>{state.player.title}</div>
            </div>
            <div style={styles.credits}>
              <span style={styles.creditsIcon}>💎</span>
              {state.player.credits.toLocaleString()}
            </div>
          </div>
        )}
      </header>

      {/* XP Progress Bar */}
      {state.player && (
        <div style={styles.xpContainer}>
          <div style={styles.xpBarBg}>
            <div style={{ ...styles.xpBarFill, width: `${((state.player.xp % 100) / 100) * 100}%` }} />
          </div>
          <span style={styles.xpText}>{state.player.xp} XP</span>
        </div>
      )}

      {/* Quick Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{state.cars.length}</div>
          <div style={styles.statLabel}>CARS</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{state.parts.length}</div>
          <div style={styles.statLabel}>PARTS</div>
        </div>
        <div style={styles.statBox}>
          <div style={{ ...styles.statValue, color: '#4ade80' }}>{state.player?.wins || 0}</div>
          <div style={styles.statLabel}>WINS</div>
        </div>
        <div style={styles.statBox}>
          <div style={{ ...styles.statValue, color: '#f87171' }}>{state.player?.losses || 0}</div>
          <div style={styles.statLabel}>LOSSES</div>
        </div>
      </div>

      {/* Menu Grid */}
      <div style={styles.menuGrid}>
        {menuItems.map((item) => (
          <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={styles.menuCard}>
              <div style={styles.menuIcon}>{item.icon}</div>
              <div style={styles.menuName}>{item.name}</div>
              <div style={styles.menuDesc}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Car */}
      {state.selectedCar && (
        <div style={styles.featuredCar}>
          <h3 style={styles.featuredTitle}>SELECTED RIDE</h3>
          <div style={styles.carDisplay}>
            <div style={styles.carImage}>
              {state.selectedCar.imageUrl ? (
                <img src={state.selectedCar.imageUrl} alt={state.selectedCar.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={styles.carPlaceholder}>🏎️</div>
              )}
            </div>
            <div style={styles.carInfo}>
              <div style={styles.carName}>{state.selectedCar.name}</div>
              <div style={styles.carMake}>{state.selectedCar.year} {state.selectedCar.make} {state.selectedCar.model}</div>
              <div style={styles.carStats}>
                <span>⚡ {state.selectedCar.stats.horsepower} HP</span>
                <span>🏋️ {state.selectedCar.stats.weight} lbs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Link */}
      <Link href="/" style={styles.backLink}>← Back to Game Portal</Link>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)',
    color: 'white',
    padding: '30px',
    fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333',
  },
  title: {
    fontSize: '2.5rem',
    margin: 0,
    background: 'linear-gradient(90deg, #ff6600, #ff0066)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 30px rgba(255, 102, 0, 0.5)',
  },
  subtitle: {
    margin: '5px 0 0 0',
    color: '#888',
    fontSize: '0.9rem',
    letterSpacing: '3px',
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  levelBadge: {
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    padding: '10px 15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  playerTitle: {
    color: '#ff6600',
    fontSize: '0.8rem',
  },
  credits: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#222',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #444',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  creditsIcon: {
    fontSize: '1.2rem',
  },
  xpContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
  },
  xpBarBg: {
    flex: 1,
    height: '8px',
    background: '#222',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff6600, #ff0066)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  xpText: {
    color: '#888',
    fontSize: '0.85rem',
    minWidth: '80px',
    textAlign: 'right',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '30px',
  },
  statBox: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ff6600',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#666',
    letterSpacing: '2px',
    marginTop: '5px',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  menuCard: {
    background: 'linear-gradient(145deg, #151515, #1a1a1a)',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  },
  menuIcon: {
    fontSize: '2.5rem',
    marginBottom: '15px',
  },
  menuName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  menuDesc: {
    fontSize: '0.75rem',
    color: '#666',
  },
  featuredCar: {
    background: '#151515',
    border: '1px solid #ff6600',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '30px',
  },
  featuredTitle: {
    margin: '0 0 20px 0',
    color: '#ff6600',
    fontSize: '0.9rem',
    letterSpacing: '2px',
  },
  carDisplay: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
  },
  carImage: {
    width: '200px',
    height: '120px',
    background: '#0a0a0a',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carPlaceholder: {
    fontSize: '4rem',
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  carMake: {
    color: '#888',
    marginBottom: '15px',
  },
  carStats: {
    display: 'flex',
    gap: '20px',
    color: '#ff6600',
  },
  backLink: {
    display: 'inline-block',
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
    marginTop: '20px',
  },
};
