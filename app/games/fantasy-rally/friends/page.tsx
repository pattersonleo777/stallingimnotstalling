"use client";
import { useState } from 'react';
import { useGame, Friend } from '../context/GameContext';
import Link from 'next/link';

// Mock friends data for demo
const MOCK_FRIENDS: Friend[] = [
  { id: '1', name: 'SpeedDemon', level: 12, status: 'online' },
  { id: '2', name: 'TurboKing', level: 8, status: 'racing' },
  { id: '3', name: 'DriftMaster', level: 15, status: 'offline' },
  { id: '4', name: 'NitroQueen', level: 6, status: 'online' },
  { id: '5', name: 'StreetLegend', level: 20, status: 'offline' },
];

const FRIEND_REQUESTS: Friend[] = [
  { id: '6', name: 'RallyRookie', level: 3, status: 'offline' },
  { id: '7', name: 'TrackStar', level: 9, status: 'online' },
];

const ONLINE_PLAYERS: Friend[] = [
  { id: '8', name: 'FastFury', level: 7, status: 'online' },
  { id: '9', name: 'GearHead', level: 11, status: 'online' },
  { id: '10', name: 'V8Power', level: 5, status: 'online' },
  { id: '11', name: 'JDMLover', level: 14, status: 'racing' },
  { id: '12', name: 'EuroTuner', level: 9, status: 'online' },
];

type TabType = 'friends' | 'requests' | 'find';

export default function FriendsPage() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>(state.friends.length > 0 ? state.friends : MOCK_FRIENDS);
  const [requests, setRequests] = useState<Friend[]>(FRIEND_REQUESTS);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return '#4ade80';
      case 'racing': return '#f97316';
      case 'offline': return '#666';
    }
  };

  const handleAcceptRequest = (friend: Friend) => {
    setFriends([...friends, { ...friend, status: 'offline' }]);
    setRequests(requests.filter(r => r.id !== friend.id));
    dispatch({ type: 'ADD_XP', payload: 10 });
  };

  const handleDeclineRequest = (friendId: string) => {
    setRequests(requests.filter(r => r.id !== friendId));
  };

  const handleSendRequest = (player: Friend) => {
    if (sentRequests.includes(player.id)) return;
    setSentRequests([...sentRequests, player.id]);
    dispatch({ type: 'ADD_XP', payload: 5 });
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
    setSelectedFriend(null);
  };

  const filteredPlayers = searchQuery
    ? ONLINE_PLAYERS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !friends.some(f => f.id === p.id)
      )
    : ONLINE_PLAYERS.filter(p => !friends.some(f => f.id === p.id));

  const onlineFriends = friends.filter(f => f.status !== 'offline');
  const offlineFriends = friends.filter(f => f.status === 'offline');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>FRIENDS</h1>
        <div style={styles.friendCount}>
          {onlineFriends.length} / {friends.length} Online
        </div>
      </header>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            background: activeTab === 'friends' ? '#ff6600' : 'transparent',
            color: activeTab === 'friends' ? 'black' : 'white',
          }}
          onClick={() => setActiveTab('friends')}
        >
          FRIENDS ({friends.length})
        </button>
        <button
          style={{
            ...styles.tab,
            background: activeTab === 'requests' ? '#ff6600' : 'transparent',
            color: activeTab === 'requests' ? 'black' : 'white',
          }}
          onClick={() => setActiveTab('requests')}
        >
          REQUESTS ({requests.length})
        </button>
        <button
          style={{
            ...styles.tab,
            background: activeTab === 'find' ? '#ff6600' : 'transparent',
            color: activeTab === 'find' ? 'black' : 'white',
          }}
          onClick={() => setActiveTab('find')}
        >
          FIND RACERS
        </button>
      </div>

      <div style={styles.content}>
        {/* Friends List */}
        {activeTab === 'friends' && (
          <div style={styles.friendsContent}>
            {friends.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👥</div>
                <p>No friends yet!</p>
                <p style={styles.emptyHint}>Find racers and send friend requests</p>
              </div>
            ) : (
              <>
                {/* Online Friends */}
                {onlineFriends.length > 0 && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>ONLINE - {onlineFriends.length}</h3>
                    <div style={styles.friendsGrid}>
                      {onlineFriends.map(friend => (
                        <FriendCard
                          key={friend.id}
                          friend={friend}
                          onSelect={() => setSelectedFriend(friend)}
                          selected={selectedFriend?.id === friend.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline Friends */}
                {offlineFriends.length > 0 && (
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>OFFLINE - {offlineFriends.length}</h3>
                    <div style={styles.friendsGrid}>
                      {offlineFriends.map(friend => (
                        <FriendCard
                          key={friend.id}
                          friend={friend}
                          onSelect={() => setSelectedFriend(friend)}
                          selected={selectedFriend?.id === friend.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Selected Friend Actions */}
            {selectedFriend && (
              <div style={styles.friendActions}>
                <h3 style={styles.actionTitle}>{selectedFriend.name}</h3>
                <div style={styles.actionButtons}>
                  {selectedFriend.status === 'online' && (
                    <Link href={`/games/fantasy-rally/wager?opponent=${selectedFriend.id}`} style={styles.actionBtn}>
                      🏁 CHALLENGE TO RACE
                    </Link>
                  )}
                  <button style={styles.viewProfileBtn}>👤 VIEW PROFILE</button>
                  <button
                    style={styles.removeBtn}
                    onClick={() => handleRemoveFriend(selectedFriend.id)}
                  >
                    ❌ REMOVE FRIEND
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div style={styles.requestsContent}>
            {requests.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📬</div>
                <p>No pending requests</p>
              </div>
            ) : (
              <div style={styles.requestsList}>
                {requests.map(request => (
                  <div key={request.id} style={styles.requestCard}>
                    <div style={styles.requestInfo}>
                      <div style={styles.requestAvatar}>
                        {request.name.charAt(0)}
                      </div>
                      <div>
                        <div style={styles.requestName}>{request.name}</div>
                        <div style={styles.requestLevel}>Level {request.level}</div>
                      </div>
                    </div>
                    <div style={styles.requestActions}>
                      <button
                        style={styles.acceptBtn}
                        onClick={() => handleAcceptRequest(request)}
                      >
                        ✓ ACCEPT
                      </button>
                      <button
                        style={styles.declineBtn}
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Find Racers Tab */}
        {activeTab === 'find' && (
          <div style={styles.findContent}>
            <div style={styles.searchBox}>
              <input
                style={styles.searchInput}
                placeholder="Search for racers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <h3 style={styles.sectionTitle}>ONLINE RACERS</h3>
            <div style={styles.playersList}>
              {filteredPlayers.map(player => (
                <div key={player.id} style={styles.playerCard}>
                  <div style={styles.playerInfo}>
                    <div style={{ ...styles.statusDot, background: getStatusColor(player.status) }} />
                    <div style={styles.playerAvatar}>{player.name.charAt(0)}</div>
                    <div>
                      <div style={styles.playerName}>{player.name}</div>
                      <div style={styles.playerLevel}>Level {player.level}</div>
                    </div>
                  </div>
                  {sentRequests.includes(player.id) ? (
                    <span style={styles.pendingBadge}>PENDING</span>
                  ) : (
                    <button
                      style={styles.addFriendBtn}
                      onClick={() => handleSendRequest(player)}
                    >
                      + ADD FRIEND
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FriendCard({
  friend,
  onSelect,
  selected,
}: {
  friend: Friend;
  onSelect: () => void;
  selected: boolean;
}) {
  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return '#4ade80';
      case 'racing': return '#f97316';
      case 'offline': return '#666';
    }
  };

  return (
    <div
      style={{
        ...friendCardStyles.card,
        border: selected ? '2px solid #ff6600' : '1px solid #333',
      }}
      onClick={onSelect}
    >
      <div style={{ ...friendCardStyles.statusDot, background: getStatusColor(friend.status) }} />
      <div style={friendCardStyles.avatar}>{friend.name.charAt(0)}</div>
      <div style={friendCardStyles.name}>{friend.name}</div>
      <div style={friendCardStyles.level}>LVL {friend.level}</div>
      <div style={{ ...friendCardStyles.status, color: getStatusColor(friend.status) }}>
        {friend.status.toUpperCase()}
      </div>
    </div>
  );
}

const friendCardStyles: { [key: string]: React.CSSProperties } = {
  card: {
    background: '#151515',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
  },
  statusDot: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  avatar: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 auto 10px',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  level: {
    color: '#888',
    fontSize: '0.8rem',
    marginBottom: '5px',
  },
  status: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
};

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
    marginBottom: '20px',
  },
  backBtn: { color: '#666', textDecoration: 'none' },
  title: { color: '#ff6600', fontSize: '1.5rem', margin: 0 },
  friendCount: { color: '#4ade80', fontSize: '0.9rem' },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
  },
  tab: {
    flex: 1,
    padding: '15px',
    border: '1px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '1px',
    fontSize: '0.8rem',
    transition: 'all 0.2s',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  friendsContent: {},
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  emptyHint: {
    fontSize: '0.85rem',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#888',
    fontSize: '0.8rem',
    letterSpacing: '2px',
    marginBottom: '15px',
  },
  friendsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px',
  },
  friendActions: {
    background: '#151515',
    border: '1px solid #ff6600',
    borderRadius: '15px',
    padding: '25px',
    marginTop: '20px',
  },
  actionTitle: {
    margin: '0 0 20px 0',
    color: '#ff6600',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  viewProfileBtn: {
    background: '#222',
    border: '1px solid #444',
    borderRadius: '8px',
    color: 'white',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid #ff4444',
    borderRadius: '8px',
    color: '#ff4444',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  requestsContent: {},
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  requestCard: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  requestAvatar: {
    width: '45px',
    height: '45px',
    background: 'linear-gradient(135deg, #4ade80, #00ccff)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  requestName: {
    fontWeight: 'bold',
  },
  requestLevel: {
    color: '#888',
    fontSize: '0.8rem',
  },
  requestActions: {
    display: 'flex',
    gap: '10px',
  },
  acceptBtn: {
    background: '#4ade80',
    border: 'none',
    borderRadius: '6px',
    color: 'black',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  declineBtn: {
    background: 'transparent',
    border: '1px solid #ff4444',
    borderRadius: '6px',
    color: '#ff4444',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  findContent: {},
  searchBox: {
    marginBottom: '25px',
  },
  searchInput: {
    width: '100%',
    padding: '15px 20px',
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  playerCard: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  playerAvatar: {
    width: '40px',
    height: '40px',
    background: '#333',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  playerName: {
    fontWeight: 'bold',
  },
  playerLevel: {
    color: '#888',
    fontSize: '0.8rem',
  },
  addFriendBtn: {
    background: 'transparent',
    border: '1px solid #ff6600',
    borderRadius: '6px',
    color: '#ff6600',
    padding: '8px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  pendingBadge: {
    color: '#888',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
};
