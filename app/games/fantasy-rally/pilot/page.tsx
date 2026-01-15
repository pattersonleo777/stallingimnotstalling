"use client";
import { useGame, calculateLevel } from '../context/GameContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function PilotProfilePage() {
  const { state } = useGame();
  const { data: session } = useSession();

  const player = state.player;
  const levelInfo = player ? calculateLevel(player.xp) : { level: 1, title: 'Street Novice', nextLevelXP: 100, progress: 0 };

  const winRate = player && (player.wins + player.losses) > 0
    ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1)
    : '0.0';

  const totalRaces = (player?.wins || 0) + (player?.losses || 0);

  const achievements = [
    { id: 'first_car', name: 'First Wheels', desc: 'Add your first car to the garage', unlocked: state.cars.length > 0 },
    { id: 'collector', name: 'Collector', desc: 'Own 5 cars', unlocked: state.cars.length >= 5 },
    { id: 'garage_king', name: 'Garage King', desc: 'Own 10 cars', unlocked: state.cars.length >= 10 },
    { id: 'first_win', name: 'First Victory', desc: 'Win your first race', unlocked: (player?.wins || 0) > 0 },
    { id: 'ten_wins', name: 'Veteran Racer', desc: 'Win 10 races', unlocked: (player?.wins || 0) >= 10 },
    { id: 'fifty_wins', name: 'Racing Legend', desc: 'Win 50 races', unlocked: (player?.wins || 0) >= 50 },
    { id: 'part_hunter', name: 'Part Hunter', desc: 'Collect 10 parts', unlocked: state.parts.length >= 10 },
    { id: 'customizer', name: 'Customizer', desc: 'Fully customize a car', unlocked: state.cars.some(c => c.bodyKit && c.wheels && c.vinylLayers.length > 0) },
    { id: 'high_roller', name: 'High Roller', desc: 'Win a 5000 CR wager', unlocked: (player?.credits || 0) > 5000 },
    { id: 'level_10', name: 'Rising Star', desc: 'Reach level 10', unlocked: (player?.level || 1) >= 10 },
    { id: 'level_25', name: 'Pro Driver', desc: 'Reach level 25', unlocked: (player?.level || 1) >= 25 },
    { id: 'wealthy', name: 'Tycoon', desc: 'Accumulate 100,000 CR', unlocked: (player?.credits || 0) >= 100000 },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>PILOT PROFILE</h1>
        <div />
      </header>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {session?.user?.name?.charAt(0) || 'P'}
          </div>
          <div style={styles.levelBadge}>LVL {player?.level || 1}</div>
        </div>

        <div style={styles.profileInfo}>
          <h2 style={styles.playerName}>{session?.user?.name || 'PILOT'}</h2>
          <div style={styles.playerTitle}>{levelInfo.title}</div>

          {/* XP Bar */}
          <div style={styles.xpSection}>
            <div style={styles.xpBarBg}>
              <div style={{ ...styles.xpBarFill, width: `${levelInfo.progress}%` }} />
            </div>
            <div style={styles.xpText}>
              {player?.xp || 0} / {levelInfo.nextLevelXP} XP
            </div>
          </div>

          {/* Credits */}
          <div style={styles.creditsDisplay}>
            <span style={styles.creditsIcon}>💎</span>
            <span style={styles.creditsAmount}>{(player?.credits || 0).toLocaleString()}</span>
            <span style={styles.creditsLabel}>CREDITS</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsSection}>
        <h3 style={styles.sectionTitle}>RACING STATS</h3>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{totalRaces}</div>
            <div style={styles.statLabel}>TOTAL RACES</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#4ade80' }}>{player?.wins || 0}</div>
            <div style={styles.statLabel}>VICTORIES</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#f87171' }}>{player?.losses || 0}</div>
            <div style={styles.statLabel}>DEFEATS</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#fbbf24' }}>{winRate}%</div>
            <div style={styles.statLabel}>WIN RATE</div>
          </div>
        </div>
      </div>

      {/* Garage Stats */}
      <div style={styles.garageSection}>
        <h3 style={styles.sectionTitle}>GARAGE</h3>
        <div style={styles.garageStats}>
          <div style={styles.garageStat}>
            <span style={styles.garageIcon}>🚗</span>
            <span style={styles.garageValue}>{state.cars.length}</span>
            <span style={styles.garageLabel}>Cars</span>
          </div>
          <div style={styles.garageStat}>
            <span style={styles.garageIcon}>🔧</span>
            <span style={styles.garageValue}>{state.parts.length}</span>
            <span style={styles.garageLabel}>Parts</span>
          </div>
          <div style={styles.garageStat}>
            <span style={styles.garageIcon}>👥</span>
            <span style={styles.garageValue}>{state.friends.length}</span>
            <span style={styles.garageLabel}>Friends</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div style={styles.achievementsSection}>
        <h3 style={styles.sectionTitle}>
          ACHIEVEMENTS ({unlockedCount}/{achievements.length})
        </h3>
        <div style={styles.achievementsGrid}>
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              style={{
                ...styles.achievementCard,
                opacity: achievement.unlocked ? 1 : 0.4,
                borderColor: achievement.unlocked ? '#ff6600' : '#333',
              }}
            >
              <div style={styles.achievementIcon}>
                {achievement.unlocked ? '🏆' : '🔒'}
              </div>
              <div style={styles.achievementInfo}>
                <div style={styles.achievementName}>{achievement.name}</div>
                <div style={styles.achievementDesc}>{achievement.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activitySection}>
        <h3 style={styles.sectionTitle}>QUICK ACTIONS</h3>
        <div style={styles.actionsGrid}>
          <Link href="/games/fantasy-rally/garage" style={styles.actionCard}>
            <span style={styles.actionIcon}>🏎️</span>
            <span style={styles.actionText}>My Garage</span>
          </Link>
          <Link href="/games/fantasy-rally/race" style={styles.actionCard}>
            <span style={styles.actionIcon}>🏁</span>
            <span style={styles.actionText}>Quick Race</span>
          </Link>
          <Link href="/games/fantasy-rally/customize" style={styles.actionCard}>
            <span style={styles.actionIcon}>🎨</span>
            <span style={styles.actionText}>Customize</span>
          </Link>
          <Link href="/games/fantasy-rally/friends" style={styles.actionCard}>
            <span style={styles.actionIcon}>👥</span>
            <span style={styles.actionText}>Friends</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)',
    color: 'white',
    padding: '20px',
    fontFamily: "'Orbitron', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  backBtn: { color: '#666', textDecoration: 'none' },
  title: { color: '#ff6600', fontSize: '1.5rem', margin: 0 },
  profileCard: {
    display: 'flex',
    gap: '30px',
    background: 'linear-gradient(145deg, #151515, #1a1a1a)',
    border: '1px solid #333',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: 'bold',
  },
  levelBadge: {
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ff6600',
    padding: '5px 15px',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  playerName: {
    margin: '0 0 5px 0',
    fontSize: '1.8rem',
  },
  playerTitle: {
    color: '#ff6600',
    fontSize: '1rem',
    marginBottom: '20px',
    letterSpacing: '2px',
  },
  xpSection: {
    marginBottom: '20px',
  },
  xpBarBg: {
    height: '10px',
    background: '#222',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  xpBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff6600, #ff0066)',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  xpText: {
    color: '#888',
    fontSize: '0.85rem',
  },
  creditsDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#0a0a0a',
    padding: '15px 20px',
    borderRadius: '10px',
    width: 'fit-content',
  },
  creditsIcon: {
    fontSize: '1.5rem',
  },
  creditsAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  creditsLabel: {
    color: '#666',
    fontSize: '0.8rem',
  },
  statsSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#888',
    fontSize: '0.9rem',
    letterSpacing: '2px',
    marginBottom: '15px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
  },
  statCard: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: '5px',
  },
  statLabel: {
    color: '#666',
    fontSize: '0.7rem',
    letterSpacing: '1px',
  },
  garageSection: {
    marginBottom: '30px',
  },
  garageStats: {
    display: 'flex',
    gap: '20px',
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px',
  },
  garageStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  garageIcon: {
    fontSize: '1.5rem',
  },
  garageValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  garageLabel: {
    color: '#888',
    fontSize: '0.9rem',
  },
  achievementsSection: {
    marginBottom: '30px',
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
  },
  achievementCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: '#151515',
    border: '2px solid',
    borderRadius: '12px',
    padding: '15px',
  },
  achievementIcon: {
    fontSize: '1.5rem',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontWeight: 'bold',
    marginBottom: '3px',
    fontSize: '0.9rem',
  },
  achievementDesc: {
    color: '#666',
    fontSize: '0.75rem',
  },
  activitySection: {
    marginBottom: '30px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px',
    textDecoration: 'none',
    color: 'white',
    transition: 'all 0.2s',
  },
  actionIcon: {
    fontSize: '2rem',
  },
  actionText: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
};
