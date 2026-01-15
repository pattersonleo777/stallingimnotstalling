"use client";
import { useState, useEffect } from 'react';
import { useGame, Car, Part } from '../context/GameContext';
import Link from 'next/link';

interface AuctionItem {
  id: string;
  type: 'car' | 'part';
  item: Car | Part;
  seller: string;
  startPrice: number;
  currentBid: number;
  buyNowPrice?: number;
  bidCount: number;
  endsAt: Date;
  topBidder?: string;
}

// Mock auction data
const generateMockAuctions = (): AuctionItem[] => [
  {
    id: 'auc1',
    type: 'car',
    item: {
      id: 'car-auc1',
      name: 'Street Beast',
      make: 'Nissan',
      model: 'Silvia S15',
      year: 2002,
      paint: '#ff0000',
      raceNumber: 15,
      vinylLayers: [],
      stats: { horsepower: 280, torque: 260, weight: 2800, grip: 1.2, acceleration: 1.1, topSpeed: 1.15 },
      installedParts: [],
    } as Car,
    seller: 'DriftKing',
    startPrice: 5000,
    currentBid: 7500,
    buyNowPrice: 15000,
    bidCount: 8,
    endsAt: new Date(Date.now() + 3600000 * 2),
    topBidder: 'SpeedDemon',
  },
  {
    id: 'auc2',
    type: 'car',
    item: {
      id: 'car-auc2',
      name: 'JDM Legend',
      make: 'Toyota',
      model: 'Supra MK4',
      year: 1998,
      paint: '#ff8800',
      raceNumber: 34,
      vinylLayers: [],
      stats: { horsepower: 320, torque: 310, weight: 3100, grip: 1.1, acceleration: 1.2, topSpeed: 1.3 },
      installedParts: [],
    } as Car,
    seller: 'TurboKing',
    startPrice: 12000,
    currentBid: 18500,
    buyNowPrice: 30000,
    bidCount: 12,
    endsAt: new Date(Date.now() + 3600000 * 5),
    topBidder: 'RallyMaster',
  },
  {
    id: 'auc3',
    type: 'part',
    item: {
      id: 'part-auc3',
      name: 'GT35R Turbo Kit',
      type: 'turbo',
      rarity: 'rare',
      price: 5000,
      unlockLevel: 7,
      statBoosts: { horsepower: 90, acceleration: 0.15 },
    } as Part,
    seller: 'BoostJunkie',
    startPrice: 3000,
    currentBid: 4200,
    bidCount: 5,
    endsAt: new Date(Date.now() + 3600000 * 1),
    topBidder: 'NitroQueen',
  },
  {
    id: 'auc4',
    type: 'part',
    item: {
      id: 'part-auc4',
      name: 'Forged Internals',
      type: 'engine',
      rarity: 'epic',
      price: 8000,
      unlockLevel: 10,
      statBoosts: { horsepower: 100, torque: 80 },
    } as Part,
    seller: 'EngineMaster',
    startPrice: 6000,
    currentBid: 8800,
    buyNowPrice: 12000,
    bidCount: 9,
    endsAt: new Date(Date.now() + 3600000 * 8),
    topBidder: 'V8Power',
  },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#aaaaaa',
  uncommon: '#00ff00',
  rare: '#0088ff',
  epic: '#aa00ff',
  legendary: '#ff8800',
};

type TabType = 'browse' | 'mybids' | 'sell';

export default function AuctionPage() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [auctions, setAuctions] = useState<AuctionItem[]>(generateMockAuctions());
  const [filterType, setFilterType] = useState<'all' | 'car' | 'part'>('all');
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [myBids, setMyBids] = useState<string[]>([]);
  const [sellForm, setSellForm] = useState({
    type: 'car' as 'car' | 'part',
    itemId: '',
    startPrice: 1000,
    buyNowPrice: 0,
    duration: 24,
  });

  const playerCredits = state.player?.credits || 0;
  const playerName = state.player?.name || 'Player';

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prev => prev.map(a => ({ ...a })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (endsAt: Date) => {
    const diff = endsAt.getTime() - Date.now();
    if (diff <= 0) return 'ENDED';

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const filteredAuctions = filterType === 'all'
    ? auctions
    : auctions.filter(a => a.type === filterType);

  const handlePlaceBid = () => {
    if (!selectedAuction || bidAmount <= selectedAuction.currentBid) return;
    if (bidAmount > playerCredits) return;

    setAuctions(prev => prev.map(a =>
      a.id === selectedAuction.id
        ? { ...a, currentBid: bidAmount, bidCount: a.bidCount + 1, topBidder: playerName }
        : a
    ));
    setMyBids([...myBids, selectedAuction.id]);
    dispatch({ type: 'ADD_XP', payload: 10 });
    setSelectedAuction(null);
    setBidAmount(0);
  };

  const handleBuyNow = (auction: AuctionItem) => {
    if (!auction.buyNowPrice || auction.buyNowPrice > playerCredits) return;

    dispatch({ type: 'ADD_CREDITS', payload: -auction.buyNowPrice });
    dispatch({ type: 'ADD_XP', payload: 50 });

    if (auction.type === 'car') {
      dispatch({ type: 'ADD_CAR', payload: auction.item as Car });
    } else {
      dispatch({ type: 'ADD_PART', payload: auction.item as Part });
    }

    setAuctions(prev => prev.filter(a => a.id !== auction.id));
  };

  const handleCreateListing = () => {
    if (!sellForm.itemId || sellForm.startPrice < 100) return;

    const newAuction: AuctionItem = {
      id: `auc-${Date.now()}`,
      type: sellForm.type,
      item: sellForm.type === 'car'
        ? state.cars.find(c => c.id === sellForm.itemId)!
        : state.parts.find(p => p.id === sellForm.itemId)!,
      seller: playerName,
      startPrice: sellForm.startPrice,
      currentBid: sellForm.startPrice,
      buyNowPrice: sellForm.buyNowPrice > 0 ? sellForm.buyNowPrice : undefined,
      bidCount: 0,
      endsAt: new Date(Date.now() + sellForm.duration * 3600000),
    };

    setAuctions([...auctions, newAuction]);
    dispatch({ type: 'ADD_XP', payload: 25 });
    setSellForm({ type: 'car', itemId: '', startPrice: 1000, buyNowPrice: 0, duration: 24 });
    setActiveTab('browse');
  };

  const myBidAuctions = auctions.filter(a => myBids.includes(a.id));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>AUCTION HOUSE</h1>
        <div style={styles.credits}>💎 {playerCredits.toLocaleString()} CR</div>
      </header>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, background: activeTab === 'browse' ? '#ff6600' : 'transparent', color: activeTab === 'browse' ? 'black' : 'white' }}
          onClick={() => setActiveTab('browse')}
        >
          BROWSE
        </button>
        <button
          style={{ ...styles.tab, background: activeTab === 'mybids' ? '#ff6600' : 'transparent', color: activeTab === 'mybids' ? 'black' : 'white' }}
          onClick={() => setActiveTab('mybids')}
        >
          MY BIDS ({myBidAuctions.length})
        </button>
        <button
          style={{ ...styles.tab, background: activeTab === 'sell' ? '#ff6600' : 'transparent', color: activeTab === 'sell' ? 'black' : 'white' }}
          onClick={() => setActiveTab('sell')}
        >
          SELL
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div style={styles.browseContent}>
          {/* Filters */}
          <div style={styles.filters}>
            {(['all', 'car', 'part'] as const).map(type => (
              <button
                key={type}
                style={{
                  ...styles.filterBtn,
                  background: filterType === type ? '#ff6600' : '#222',
                }}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'ALL' : type === 'car' ? 'CARS' : 'PARTS'}
              </button>
            ))}
          </div>

          {/* Auction Grid */}
          <div style={styles.auctionGrid}>
            {filteredAuctions.map(auction => {
              const isCar = auction.type === 'car';
              const item = auction.item;
              const timeLeft = getTimeRemaining(auction.endsAt);
              const isEnding = timeLeft.includes('m') && !timeLeft.includes('h');

              return (
                <div
                  key={auction.id}
                  style={{
                    ...styles.auctionCard,
                    borderColor: isEnding ? '#ff4444' : '#333',
                  }}
                  onClick={() => {
                    setSelectedAuction(auction);
                    setBidAmount(auction.currentBid + 100);
                  }}
                >
                  {/* Item Preview */}
                  <div style={styles.itemPreview}>
                    {isCar ? (
                      <div style={{ ...styles.carPreview, background: (item as Car).paint }}>
                        <span style={styles.carNumber}>#{(item as Car).raceNumber}</span>
                      </div>
                    ) : (
                      <div style={styles.partPreview}>
                        <div style={{ ...styles.rarityDot, background: RARITY_COLORS[(item as Part).rarity] }} />
                        🔧
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div style={styles.itemInfo}>
                    <div style={styles.itemName}>
                      {isCar ? (item as Car).name : (item as Part).name}
                    </div>
                    <div style={styles.itemDetails}>
                      {isCar
                        ? `${(item as Car).year} ${(item as Car).make} ${(item as Car).model}`
                        : `${(item as Part).type.toUpperCase()} • ${(item as Part).rarity.toUpperCase()}`}
                    </div>
                    <div style={styles.sellerInfo}>
                      Seller: {auction.seller}
                    </div>
                  </div>

                  {/* Bid Info */}
                  <div style={styles.bidInfo}>
                    <div style={styles.currentBid}>
                      <span style={styles.bidLabel}>CURRENT BID</span>
                      <span style={styles.bidAmount}>{auction.currentBid.toLocaleString()} CR</span>
                    </div>
                    {auction.buyNowPrice && (
                      <button
                        style={styles.buyNowBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(auction);
                        }}
                        disabled={auction.buyNowPrice > playerCredits}
                      >
                        BUY NOW: {auction.buyNowPrice.toLocaleString()} CR
                      </button>
                    )}
                    <div style={{ ...styles.timeLeft, color: isEnding ? '#ff4444' : '#888' }}>
                      ⏱ {timeLeft}
                    </div>
                    <div style={styles.bidCount}>{auction.bidCount} bids</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Bids Tab */}
      {activeTab === 'mybids' && (
        <div style={styles.myBidsContent}>
          {myBidAuctions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔨</div>
              <p>No active bids</p>
              <p style={styles.emptyHint}>Browse auctions and place bids to see them here</p>
            </div>
          ) : (
            <div style={styles.bidsList}>
              {myBidAuctions.map(auction => {
                const isWinning = auction.topBidder === playerName;
                return (
                  <div key={auction.id} style={styles.bidCard}>
                    <div style={styles.bidItemInfo}>
                      <div style={styles.bidItemName}>
                        {auction.type === 'car' ? (auction.item as Car).name : (auction.item as Part).name}
                      </div>
                      <div style={styles.bidItemType}>{auction.type.toUpperCase()}</div>
                    </div>
                    <div style={styles.bidStatus}>
                      <div style={{ ...styles.bidStatusBadge, background: isWinning ? '#4ade80' : '#ff4444' }}>
                        {isWinning ? 'WINNING' : 'OUTBID'}
                      </div>
                      <div style={styles.bidCurrentAmount}>{auction.currentBid.toLocaleString()} CR</div>
                    </div>
                    <div style={styles.bidTimeLeft}>
                      ⏱ {getTimeRemaining(auction.endsAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div style={styles.sellContent}>
          <div style={styles.sellPanel}>
            <h2 style={styles.sellTitle}>CREATE LISTING</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>ITEM TYPE</label>
              <div style={styles.typeButtons}>
                <button
                  style={{ ...styles.typeBtn, background: sellForm.type === 'car' ? '#ff6600' : '#222' }}
                  onClick={() => setSellForm({ ...sellForm, type: 'car', itemId: '' })}
                >
                  🚗 CAR
                </button>
                <button
                  style={{ ...styles.typeBtn, background: sellForm.type === 'part' ? '#ff6600' : '#222' }}
                  onClick={() => setSellForm({ ...sellForm, type: 'part', itemId: '' })}
                >
                  🔧 PART
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>SELECT ITEM</label>
              <select
                style={styles.select}
                value={sellForm.itemId}
                onChange={e => setSellForm({ ...sellForm, itemId: e.target.value })}
              >
                <option value="">Select {sellForm.type}...</option>
                {sellForm.type === 'car'
                  ? state.cars.map(car => (
                      <option key={car.id} value={car.id}>
                        {car.name} - {car.year} {car.make} {car.model}
                      </option>
                    ))
                  : state.parts.map(part => (
                      <option key={part.id} value={part.id}>
                        {part.name} ({part.rarity})
                      </option>
                    ))}
              </select>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>STARTING PRICE (CR)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={sellForm.startPrice}
                  onChange={e => setSellForm({ ...sellForm, startPrice: parseInt(e.target.value) || 0 })}
                  min={100}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>BUY NOW PRICE (CR)</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Optional"
                  value={sellForm.buyNowPrice || ''}
                  onChange={e => setSellForm({ ...sellForm, buyNowPrice: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>DURATION</label>
              <div style={styles.durationButtons}>
                {[1, 6, 12, 24, 48].map(hours => (
                  <button
                    key={hours}
                    style={{ ...styles.durationBtn, background: sellForm.duration === hours ? '#ff6600' : '#222' }}
                    onClick={() => setSellForm({ ...sellForm, duration: hours })}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>

            <button
              style={styles.createListingBtn}
              onClick={handleCreateListing}
              disabled={!sellForm.itemId || sellForm.startPrice < 100}
            >
              CREATE LISTING (+25 XP)
            </button>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {selectedAuction && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAuction(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>PLACE BID</h2>
            <div style={styles.modalItemName}>
              {selectedAuction.type === 'car'
                ? (selectedAuction.item as Car).name
                : (selectedAuction.item as Part).name}
            </div>
            <div style={styles.modalCurrentBid}>
              Current Bid: <strong>{selectedAuction.currentBid.toLocaleString()} CR</strong>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>YOUR BID</label>
              <input
                type="number"
                style={styles.bidInput}
                value={bidAmount}
                onChange={e => setBidAmount(parseInt(e.target.value) || 0)}
                min={selectedAuction.currentBid + 100}
                step={100}
              />
            </div>
            <div style={styles.minBidHint}>
              Minimum: {(selectedAuction.currentBid + 100).toLocaleString()} CR
            </div>
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => setSelectedAuction(null)}>
                CANCEL
              </button>
              <button
                style={styles.placeBidBtn}
                onClick={handlePlaceBid}
                disabled={bidAmount <= selectedAuction.currentBid || bidAmount > playerCredits}
              >
                PLACE BID
              </button>
            </div>
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
  tabs: { display: 'flex', gap: '10px', marginBottom: '25px' },
  tab: { flex: 1, padding: '15px', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s' },
  browseContent: {},
  filters: { display: 'flex', gap: '10px', marginBottom: '20px' },
  filterBtn: { padding: '10px 20px', border: '1px solid #444', borderRadius: '6px', color: 'white', cursor: 'pointer' },
  auctionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  auctionCard: { background: '#151515', border: '2px solid', borderRadius: '15px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' },
  itemPreview: { height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' },
  carPreview: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  carNumber: { fontSize: '2rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' },
  partPreview: { fontSize: '3rem', position: 'relative' },
  rarityDot: { position: 'absolute', top: '-5px', right: '-5px', width: '15px', height: '15px', borderRadius: '50%' },
  itemInfo: { padding: '15px', borderBottom: '1px solid #222' },
  itemName: { fontWeight: 'bold', marginBottom: '5px' },
  itemDetails: { color: '#888', fontSize: '0.8rem', marginBottom: '5px' },
  sellerInfo: { color: '#666', fontSize: '0.75rem' },
  bidInfo: { padding: '15px' },
  currentBid: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  bidLabel: { color: '#888', fontSize: '0.7rem' },
  bidAmount: { color: '#ff6600', fontWeight: 'bold', fontSize: '1.1rem' },
  buyNowBtn: { width: '100%', padding: '10px', background: '#4ade80', border: 'none', borderRadius: '6px', color: 'black', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px', fontSize: '0.8rem' },
  timeLeft: { fontSize: '0.85rem', marginBottom: '5px' },
  bidCount: { color: '#666', fontSize: '0.75rem' },
  myBidsContent: {},
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#666' },
  emptyIcon: { fontSize: '4rem', marginBottom: '20px' },
  emptyHint: { fontSize: '0.85rem' },
  bidsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  bidCard: { background: '#151515', border: '1px solid #333', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bidItemInfo: {},
  bidItemName: { fontWeight: 'bold', marginBottom: '5px' },
  bidItemType: { color: '#888', fontSize: '0.8rem' },
  bidStatus: { textAlign: 'center' },
  bidStatusBadge: { padding: '5px 15px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px' },
  bidCurrentAmount: { fontWeight: 'bold' },
  bidTimeLeft: { color: '#888' },
  sellContent: { display: 'flex', justifyContent: 'center' },
  sellPanel: { background: '#151515', border: '1px solid #333', borderRadius: '15px', padding: '30px', maxWidth: '500px', width: '100%' },
  sellTitle: { color: '#ff6600', margin: '0 0 25px 0', textAlign: 'center' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.8rem', letterSpacing: '1px' },
  typeButtons: { display: 'flex', gap: '10px' },
  typeBtn: { flex: 1, padding: '15px', border: '1px solid #444', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
  select: { width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  input: { width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '1rem' },
  durationButtons: { display: 'flex', gap: '10px' },
  durationBtn: { flex: 1, padding: '12px', border: '1px solid #444', borderRadius: '8px', color: 'white', cursor: 'pointer' },
  createListingBtn: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #ff6600, #ff0066)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#151515', border: '1px solid #333', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '400px' },
  modalTitle: { margin: '0 0 20px 0', color: '#ff6600', textAlign: 'center' },
  modalItemName: { textAlign: 'center', fontWeight: 'bold', marginBottom: '15px' },
  modalCurrentBid: { textAlign: 'center', color: '#888', marginBottom: '20px' },
  bidInput: { width: '100%', padding: '15px', background: '#0a0a0a', border: '1px solid #ff6600', borderRadius: '8px', color: 'white', fontSize: '1.2rem', textAlign: 'center' },
  minBidHint: { textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: '10px' },
  modalButtons: { display: 'flex', gap: '15px', marginTop: '25px' },
  cancelBtn: { flex: 1, padding: '12px', background: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#888', cursor: 'pointer', fontWeight: 'bold' },
  placeBidBtn: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #ff6600, #ff0066)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
};
