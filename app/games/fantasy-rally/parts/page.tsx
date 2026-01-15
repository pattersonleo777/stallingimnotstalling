"use client";
import { useState } from 'react';
import { useGame, Part, Car } from '../context/GameContext';
import Link from 'next/link';

const PART_TYPES = [
  { type: 'engine', name: 'Engine', icon: '🔧' },
  { type: 'turbo', name: 'Turbo', icon: '💨' },
  { type: 'suspension', name: 'Suspension', icon: '🔩' },
  { type: 'tires', name: 'Tires', icon: '⚫' },
  { type: 'brakes', name: 'Brakes', icon: '🛑' },
  { type: 'exhaust', name: 'Exhaust', icon: '💭' },
  { type: 'nitrous', name: 'Nitrous', icon: '⚡' },
] as const;

const SHOP_PARTS: Part[] = [
  { id: 'eng1', name: 'Stage 1 Engine Tune', type: 'engine', rarity: 'common', price: 500, unlockLevel: 1, statBoosts: { horsepower: 15, torque: 10 } },
  { id: 'eng2', name: 'Stage 2 Engine Build', type: 'engine', rarity: 'uncommon', price: 1500, unlockLevel: 3, statBoosts: { horsepower: 35, torque: 25 } },
  { id: 'eng3', name: 'Stage 3 Stroker Kit', type: 'engine', rarity: 'rare', price: 4000, unlockLevel: 6, statBoosts: { horsepower: 60, torque: 50 } },
  { id: 'eng4', name: 'Forged Internals', type: 'engine', rarity: 'epic', price: 8000, unlockLevel: 10, statBoosts: { horsepower: 100, torque: 80 } },
  { id: 'turbo1', name: 'Small Turbo', type: 'turbo', rarity: 'common', price: 800, unlockLevel: 2, statBoosts: { horsepower: 25, acceleration: 0.05 } },
  { id: 'turbo2', name: 'GT28 Turbo', type: 'turbo', rarity: 'uncommon', price: 2000, unlockLevel: 4, statBoosts: { horsepower: 50, acceleration: 0.1 } },
  { id: 'turbo3', name: 'GT35R Turbo', type: 'turbo', rarity: 'rare', price: 5000, unlockLevel: 7, statBoosts: { horsepower: 90, acceleration: 0.15 } },
  { id: 'turbo4', name: 'Twin Turbo Kit', type: 'turbo', rarity: 'epic', price: 12000, unlockLevel: 12, statBoosts: { horsepower: 150, acceleration: 0.25 } },
  { id: 'susp1', name: 'Lowering Springs', type: 'suspension', rarity: 'common', price: 300, unlockLevel: 1, statBoosts: { grip: 0.1, weight: -20 } },
  { id: 'susp2', name: 'Coilovers', type: 'suspension', rarity: 'uncommon', price: 1200, unlockLevel: 3, statBoosts: { grip: 0.2, weight: -30 } },
  { id: 'susp3', name: 'Air Suspension', type: 'suspension', rarity: 'rare', price: 3500, unlockLevel: 6, statBoosts: { grip: 0.35, weight: -50 } },
  { id: 'tire1', name: 'Sport Tires', type: 'tires', rarity: 'common', price: 400, unlockLevel: 1, statBoosts: { grip: 0.15 } },
  { id: 'tire2', name: 'Semi-Slicks', type: 'tires', rarity: 'uncommon', price: 1000, unlockLevel: 4, statBoosts: { grip: 0.3 } },
  { id: 'tire3', name: 'Racing Slicks', type: 'tires', rarity: 'rare', price: 2500, unlockLevel: 8, statBoosts: { grip: 0.5, topSpeed: 0.05 } },
  { id: 'brake1', name: 'Sport Brake Pads', type: 'brakes', rarity: 'common', price: 250, unlockLevel: 1, statBoosts: { grip: 0.05 } },
  { id: 'brake2', name: 'Big Brake Kit', type: 'brakes', rarity: 'uncommon', price: 1500, unlockLevel: 5, statBoosts: { grip: 0.15, weight: 15 } },
  { id: 'exh1', name: 'Cat-Back Exhaust', type: 'exhaust', rarity: 'common', price: 400, unlockLevel: 1, statBoosts: { horsepower: 10, weight: -10 } },
  { id: 'exh2', name: 'Full Exhaust System', type: 'exhaust', rarity: 'uncommon', price: 1200, unlockLevel: 3, statBoosts: { horsepower: 25, weight: -20 } },
  { id: 'exh3', name: 'Titanium Exhaust', type: 'exhaust', rarity: 'rare', price: 4000, unlockLevel: 7, statBoosts: { horsepower: 40, weight: -40 } },
  { id: 'nos1', name: 'Nitrous 50 Shot', type: 'nitrous', rarity: 'uncommon', price: 1000, unlockLevel: 4, statBoosts: { horsepower: 50, acceleration: 0.1 } },
  { id: 'nos2', name: 'Nitrous 100 Shot', type: 'nitrous', rarity: 'rare', price: 2500, unlockLevel: 8, statBoosts: { horsepower: 100, acceleration: 0.2 } },
  { id: 'nos3', name: 'Nitrous 150 Shot', type: 'nitrous', rarity: 'epic', price: 5000, unlockLevel: 12, statBoosts: { horsepower: 150, acceleration: 0.3 } },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa',
  uncommon: '#00ff00',
  rare: '#0088ff',
  epic: '#aa00ff',
  legendary: '#ff8800',
};

export default function PartsShopPage() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory' | 'create'>('shop');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'engine' as Part['type'],
    prompt: '',
  });
  const [creatingPart, setCreatingPart] = useState(false);

  const playerLevel = state.player?.level || 1;
  const playerCredits = state.player?.credits || 0;

  const filteredParts = selectedType
    ? SHOP_PARTS.filter(p => p.type === selectedType)
    : SHOP_PARTS;

  const canBuy = (part: Part) => {
    return playerCredits >= part.price && playerLevel >= part.unlockLevel;
  };

  const handleBuyPart = (part: Part) => {
    if (!canBuy(part)) return;

    const newPart: Part = {
      ...part,
      id: `${part.id}-${Date.now()}`,
    };

    dispatch({ type: 'ADD_PART', payload: newPart });
    dispatch({ type: 'ADD_CREDITS', payload: -part.price });
    dispatch({ type: 'ADD_XP', payload: 20 });
  };

  const handleInstallPart = (part: Part) => {
    if (!state.selectedCar) return;
    dispatch({ type: 'INSTALL_PART', payload: { carId: state.selectedCar.id, part } });
    dispatch({ type: 'ADD_XP', payload: 15 });
  };

  const handleCreatePart = async () => {
    if (!createForm.name || !createForm.prompt) return;
    setCreatingPart(true);

    try {
      // Generate part image using Pollinations
      const encodedPrompt = encodeURIComponent(`${createForm.prompt}, car part, automotive, performance part, isolated, white background`);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

      // Determine rarity based on player level
      const rarities: Part['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      const maxRarityIndex = Math.min(Math.floor(playerLevel / 3), rarities.length - 1);
      const rarity = rarities[Math.floor(Math.random() * (maxRarityIndex + 1))];

      // Generate random stats based on rarity
      const rarityMultiplier = { common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 4 }[rarity];
      const baseBoost = 10 + Math.random() * 20;

      const statBoosts: Part['statBoosts'] = {};
      if (createForm.type === 'engine' || createForm.type === 'turbo' || createForm.type === 'exhaust') {
        statBoosts.horsepower = Math.round(baseBoost * rarityMultiplier);
        statBoosts.torque = Math.round(baseBoost * rarityMultiplier * 0.7);
      }
      if (createForm.type === 'turbo' || createForm.type === 'nitrous') {
        statBoosts.acceleration = parseFloat((0.05 * rarityMultiplier).toFixed(2));
      }
      if (createForm.type === 'suspension' || createForm.type === 'tires' || createForm.type === 'brakes') {
        statBoosts.grip = parseFloat((0.1 * rarityMultiplier).toFixed(2));
      }

      const newPart: Part = {
        id: `custom-${Date.now()}`,
        name: createForm.name,
        type: createForm.type,
        rarity,
        imageUrl,
        statBoosts,
        unlockLevel: 1,
        price: Math.round(500 * rarityMultiplier),
      };

      dispatch({ type: 'ADD_PART', payload: newPart });
      dispatch({ type: 'ADD_XP', payload: 50 });

      setCreateForm({ name: '', type: 'engine', prompt: '' });
      setActiveTab('inventory');
    } catch (error) {
      console.error('Error creating part:', error);
    } finally {
      setCreatingPart(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>PARTS SHOP</h1>
        <div style={styles.credits}>💎 {playerCredits.toLocaleString()} CR</div>
      </header>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['shop', 'inventory', 'create'] as const).map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              background: activeTab === tab ? '#ff6600' : 'transparent',
              color: activeTab === tab ? 'black' : 'white',
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div style={styles.shopContent}>
          {/* Type Filters */}
          <div style={styles.typeFilters}>
            <button
              style={{
                ...styles.filterBtn,
                background: selectedType === null ? '#ff6600' : '#222',
              }}
              onClick={() => setSelectedType(null)}
            >
              ALL
            </button>
            {PART_TYPES.map(pt => (
              <button
                key={pt.type}
                style={{
                  ...styles.filterBtn,
                  background: selectedType === pt.type ? '#ff6600' : '#222',
                }}
                onClick={() => setSelectedType(pt.type)}
              >
                {pt.icon} {pt.name}
              </button>
            ))}
          </div>

          {/* Parts Grid */}
          <div style={styles.partsGrid}>
            {filteredParts.map(part => {
              const affordable = canBuy(part);
              const levelLocked = playerLevel < part.unlockLevel;

              return (
                <div
                  key={part.id}
                  style={{
                    ...styles.partCard,
                    opacity: affordable ? 1 : 0.5,
                    borderColor: RARITY_COLORS[part.rarity],
                  }}
                  onClick={() => setSelectedPart(part)}
                >
                  <div style={{ ...styles.rarityBadge, background: RARITY_COLORS[part.rarity] }}>
                    {part.rarity.toUpperCase()}
                  </div>
                  <div style={styles.partIcon}>
                    {PART_TYPES.find(pt => pt.type === part.type)?.icon || '🔧'}
                  </div>
                  <div style={styles.partName}>{part.name}</div>
                  <div style={styles.partType}>{part.type.toUpperCase()}</div>
                  <div style={styles.partStats}>
                    {Object.entries(part.statBoosts).map(([stat, val]) => (
                      <span key={stat} style={styles.statBadge}>
                        +{typeof val === 'number' && val < 1 ? (val * 100).toFixed(0) + '%' : val} {stat}
                      </span>
                    ))}
                  </div>
                  {levelLocked ? (
                    <div style={styles.lockedBadge}>🔒 LEVEL {part.unlockLevel}</div>
                  ) : (
                    <button
                      style={styles.buyBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyPart(part);
                      }}
                      disabled={!affordable}
                    >
                      {part.price} CR
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div style={styles.inventoryContent}>
          {state.parts.length === 0 ? (
            <div style={styles.emptyInventory}>
              <p>No parts in inventory.</p>
              <p>Buy parts from the shop or create custom parts!</p>
            </div>
          ) : (
            <div style={styles.partsGrid}>
              {state.parts.map(part => (
                <div
                  key={part.id}
                  style={{
                    ...styles.partCard,
                    borderColor: RARITY_COLORS[part.rarity],
                  }}
                >
                  {part.imageUrl && (
                    <img src={part.imageUrl} alt={part.name} style={styles.partImage} />
                  )}
                  <div style={{ ...styles.rarityBadge, background: RARITY_COLORS[part.rarity] }}>
                    {part.rarity.toUpperCase()}
                  </div>
                  <div style={styles.partIcon}>
                    {!part.imageUrl && (PART_TYPES.find(pt => pt.type === part.type)?.icon || '🔧')}
                  </div>
                  <div style={styles.partName}>{part.name}</div>
                  <div style={styles.partType}>{part.type.toUpperCase()}</div>
                  <div style={styles.partStats}>
                    {Object.entries(part.statBoosts).map(([stat, val]) => (
                      <span key={stat} style={styles.statBadge}>
                        +{typeof val === 'number' && val < 1 ? (val * 100).toFixed(0) + '%' : val} {stat}
                      </span>
                    ))}
                  </div>
                  {state.selectedCar && (
                    <button
                      style={styles.installBtn}
                      onClick={() => handleInstallPart(part)}
                    >
                      INSTALL
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div style={styles.createContent}>
          <div style={styles.createPanel}>
            <h2 style={styles.createTitle}>CREATE CUSTOM PART</h2>
            <p style={styles.createDesc}>
              Use AI to generate unique performance parts. Higher player levels unlock rarer parts!
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>PART NAME</label>
              <input
                style={styles.input}
                placeholder="Enter part name..."
                value={createForm.name}
                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>PART TYPE</label>
              <div style={styles.typeGrid}>
                {PART_TYPES.map(pt => (
                  <button
                    key={pt.type}
                    style={{
                      ...styles.typeBtn,
                      background: createForm.type === pt.type ? '#ff6600' : '#222',
                    }}
                    onClick={() => setCreateForm({ ...createForm, type: pt.type as Part['type'] })}
                  >
                    {pt.icon} {pt.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>DESCRIBE YOUR PART (AI GENERATION)</label>
              <textarea
                style={styles.textarea}
                placeholder="Describe what your part looks like... (e.g., 'carbon fiber intake manifold with red accents')"
                value={createForm.prompt}
                onChange={e => setCreateForm({ ...createForm, prompt: e.target.value })}
              />
            </div>

            <div style={styles.createInfo}>
              <p>Your Level: <strong>{playerLevel}</strong></p>
              <p>Max Rarity Available: <strong style={{ color: RARITY_COLORS[['common', 'uncommon', 'rare', 'epic', 'legendary'][Math.min(Math.floor(playerLevel / 3), 4)]] }}>
                {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.min(Math.floor(playerLevel / 3), 4)]}
              </strong></p>
            </div>

            <button
              style={styles.createBtn}
              onClick={handleCreatePart}
              disabled={creatingPart || !createForm.name || !createForm.prompt}
            >
              {creatingPart ? 'GENERATING...' : 'CREATE PART (+50 XP)'}
            </button>
          </div>
        </div>
      )}
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
    marginBottom: '20px',
  },
  backBtn: { color: '#666', textDecoration: 'none' },
  title: { color: '#ff6600', fontSize: '1.5rem', margin: 0 },
  credits: { background: '#222', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ff6600' },
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
    transition: 'all 0.2s',
  },
  shopContent: {},
  typeFilters: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  filterBtn: {
    padding: '10px 15px',
    border: '1px solid #444',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  partsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  partCard: {
    background: '#151515',
    border: '2px solid',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.2s',
  },
  rarityBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.6rem',
    fontWeight: 'bold',
  },
  partIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  partName: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '0.9rem',
  },
  partType: {
    color: '#666',
    fontSize: '0.7rem',
    marginBottom: '10px',
  },
  partStats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  statBadge: {
    background: '#0a0a0a',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.65rem',
    color: '#4ade80',
  },
  buyBtn: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  lockedBadge: {
    color: '#ff4444',
    fontSize: '0.8rem',
    padding: '10px',
  },
  inventoryContent: {},
  emptyInventory: {
    textAlign: 'center',
    padding: '50px',
    color: '#666',
  },
  partImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  installBtn: {
    width: '100%',
    padding: '10px',
    background: '#222',
    border: '1px solid #4ade80',
    borderRadius: '6px',
    color: '#4ade80',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  createContent: {
    display: 'flex',
    justifyContent: 'center',
  },
  createPanel: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '30px',
    maxWidth: '600px',
    width: '100%',
  },
  createTitle: {
    color: '#ff6600',
    margin: '0 0 10px 0',
    textAlign: 'center',
  },
  createDesc: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '0.85rem',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#888',
    fontSize: '0.8rem',
    letterSpacing: '1px',
  },
  input: {
    width: '100%',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
  },
  typeBtn: {
    padding: '12px',
    border: '1px solid #444',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  createInfo: {
    background: '#0a0a0a',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.85rem',
  },
  createBtn: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #6600ff, #ff0066)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    letterSpacing: '1px',
  },
};
