"use client";
import { useState } from 'react';
import { useGame, calculateEffectiveStats, Car } from '../context/GameContext';
import Link from 'next/link';

const STARTER_CARS = [
  { name: 'Street Runner', make: 'Nissan', model: 'Sentra B13', year: 1994, horsepower: 140, torque: 132, weight: 2400 },
  { name: 'JDM Classic', make: 'Honda', model: 'Civic EG', year: 1995, horsepower: 125, torque: 106, weight: 2200 },
  { name: 'Euro Spec', make: 'Volkswagen', model: 'Golf GTI', year: 1998, horsepower: 150, torque: 155, weight: 2700 },
  { name: 'American Muscle', make: 'Ford', model: 'Mustang', year: 1990, horsepower: 225, torque: 300, weight: 3200 },
];

export default function GaragePage() {
  const { state, dispatch } = useGame();
  const [showAddCar, setShowAddCar] = useState(false);
  const [newCarForm, setNewCarForm] = useState({ name: '', make: '', model: '', year: 2020 });
  const [selectedStarter, setSelectedStarter] = useState<typeof STARTER_CARS[0] | null>(null);

  const handleSelectCar = (car: Car) => {
    dispatch({ type: 'SELECT_CAR', payload: car });
  };

  const handleAddCar = async () => {
    if (!selectedStarter) return;

    const newCar: Car = {
      id: `car-${Date.now()}`,
      name: newCarForm.name || selectedStarter.name,
      make: selectedStarter.make,
      model: selectedStarter.model,
      year: selectedStarter.year,
      paint: '#ff0000',
      raceNumber: Math.floor(Math.random() * 99) + 1,
      vinylLayers: [],
      stats: {
        horsepower: selectedStarter.horsepower,
        torque: selectedStarter.torque,
        weight: selectedStarter.weight,
        grip: 1.0,
        acceleration: 1.0,
        topSpeed: 1.0,
      },
      installedParts: [],
    };

    dispatch({ type: 'ADD_CAR', payload: newCar });
    dispatch({ type: 'ADD_XP', payload: 50 });
    setShowAddCar(false);
    setSelectedStarter(null);
    setNewCarForm({ name: '', make: '', model: '', year: 2020 });
  };

  const getCarPowerToWeight = (car: Car) => {
    const stats = calculateEffectiveStats(car);
    return (stats.horsepower / (stats.weight / 1000)).toFixed(1);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>MY GARAGE</h1>
        <button style={styles.addBtn} onClick={() => setShowAddCar(true)}>+ ADD CAR</button>
      </header>

      {/* Selected Car Display */}
      {state.selectedCar && (
        <div style={styles.selectedCarPanel}>
          <div style={styles.selectedCarImage}>
            {state.selectedCar.imageUrl ? (
              <img src={state.selectedCar.imageUrl} alt={state.selectedCar.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ ...styles.carColorPreview, background: state.selectedCar.paint }}>
                <span style={styles.raceNumber}>#{state.selectedCar.raceNumber}</span>
              </div>
            )}
          </div>
          <div style={styles.selectedCarInfo}>
            <h2 style={styles.selectedCarName}>{state.selectedCar.name}</h2>
            <p style={styles.selectedCarMake}>
              {state.selectedCar.year} {state.selectedCar.make} {state.selectedCar.model}
            </p>
            <div style={styles.statsGrid}>
              <StatBar label="POWER" value={calculateEffectiveStats(state.selectedCar).horsepower} max={800} color="#ff6600" />
              <StatBar label="TORQUE" value={calculateEffectiveStats(state.selectedCar).torque} max={600} color="#ff0066" />
              <StatBar label="WEIGHT" value={calculateEffectiveStats(state.selectedCar).weight} max={4000} color="#00f2fe" inverted />
              <StatBar label="GRIP" value={calculateEffectiveStats(state.selectedCar).grip * 100} max={200} color="#4ade80" />
            </div>
            <div style={styles.pwrRatio}>
              <span>POWER/WEIGHT: </span>
              <strong>{getCarPowerToWeight(state.selectedCar)} HP/ton</strong>
            </div>
            <div style={styles.actionButtons}>
              <Link href="/games/fantasy-rally/customize" style={styles.actionBtn}>CUSTOMIZE</Link>
              <Link href="/games/fantasy-rally/race" style={styles.raceBtn}>RACE</Link>
            </div>
          </div>
        </div>
      )}

      {/* Car Grid */}
      <div style={styles.carsGrid}>
        {state.cars.length === 0 ? (
          <div style={styles.emptyCar} onClick={() => setShowAddCar(true)}>
            <div style={styles.emptyIcon}>+</div>
            <p>Add your first car</p>
          </div>
        ) : (
          state.cars.map((car) => (
            <div
              key={car.id}
              style={{
                ...styles.carCard,
                border: state.selectedCar?.id === car.id ? '2px solid #ff6600' : '1px solid #333',
              }}
              onClick={() => handleSelectCar(car)}
            >
              <div style={{ ...styles.carCardImage, background: car.paint }}>
                <span style={styles.cardRaceNum}>#{car.raceNumber}</span>
              </div>
              <div style={styles.carCardInfo}>
                <h3 style={styles.carCardName}>{car.name}</h3>
                <p style={styles.carCardMake}>{car.year} {car.make}</p>
                <div style={styles.carCardStats}>
                  <span>⚡ {car.stats.horsepower} HP</span>
                  <span>🔧 {car.installedParts.length} parts</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Car Modal */}
      {showAddCar && (
        <div style={styles.modalOverlay} onClick={() => setShowAddCar(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>ADD NEW CAR</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>CAR NAME</label>
              <input
                style={styles.input}
                placeholder="Enter custom name..."
                value={newCarForm.name}
                onChange={(e) => setNewCarForm({ ...newCarForm, name: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>SELECT STARTER CAR</label>
              <div style={styles.starterGrid}>
                {STARTER_CARS.map((car) => (
                  <div
                    key={car.model}
                    style={{
                      ...styles.starterCard,
                      border: selectedStarter?.model === car.model ? '2px solid #ff6600' : '1px solid #333',
                    }}
                    onClick={() => setSelectedStarter(car)}
                  >
                    <div style={styles.starterIcon}>🚗</div>
                    <div style={styles.starterName}>{car.name}</div>
                    <div style={styles.starterMake}>{car.year} {car.make} {car.model}</div>
                    <div style={styles.starterStats}>
                      {car.horsepower} HP | {car.weight} lbs
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => setShowAddCar(false)}>CANCEL</button>
              <button
                style={{ ...styles.confirmBtn, opacity: selectedStarter ? 1 : 0.5 }}
                onClick={handleAddCar}
                disabled={!selectedStarter}
              >
                ADD TO GARAGE (+50 XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, max, color, inverted }: { label: string; value: number; max: number; color: string; inverted?: boolean }) {
  const percentage = inverted ? ((max - value) / max) * 100 : (value / max) * 100;
  return (
    <div style={statBarStyles.container}>
      <div style={statBarStyles.labelRow}>
        <span style={statBarStyles.label}>{label}</span>
        <span style={statBarStyles.value}>{Math.round(value)}</span>
      </div>
      <div style={statBarStyles.barBg}>
        <div style={{ ...statBarStyles.barFill, width: `${Math.min(percentage, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

const statBarStyles: { [key: string]: React.CSSProperties } = {
  container: { marginBottom: '10px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  label: { fontSize: '0.7rem', color: '#888', letterSpacing: '1px' },
  value: { fontSize: '0.8rem', fontWeight: 'bold' },
  barBg: { height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)',
    color: 'white',
    padding: '30px',
    fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  backBtn: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  title: {
    fontSize: '1.8rem',
    margin: 0,
    color: '#ff6600',
    letterSpacing: '3px',
  },
  addBtn: {
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  selectedCarPanel: {
    display: 'flex',
    gap: '40px',
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '30px',
    marginBottom: '40px',
  },
  selectedCarImage: {
    width: '350px',
    height: '250px',
    background: '#0a0a0a',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carColorPreview: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  raceNumber: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  selectedCarInfo: {
    flex: 1,
  },
  selectedCarName: {
    fontSize: '2rem',
    margin: '0 0 5px 0',
  },
  selectedCarMake: {
    color: '#888',
    margin: '0 0 25px 0',
  },
  statsGrid: {
    marginBottom: '20px',
  },
  pwrRatio: {
    color: '#ff6600',
    marginBottom: '25px',
    fontSize: '1.1rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
  },
  actionBtn: {
    background: '#222',
    border: '1px solid #444',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textDecoration: 'none',
    textAlign: 'center',
  },
  raceBtn: {
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textDecoration: 'none',
    textAlign: 'center',
  },
  carsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  carCard: {
    background: '#151515',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  carCardImage: {
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardRaceNum: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
  },
  carCardInfo: {
    padding: '15px',
  },
  carCardName: {
    margin: '0 0 5px 0',
    fontSize: '1rem',
  },
  carCardMake: {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '0.8rem',
  },
  carCardStats: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#ff6600',
    fontSize: '0.75rem',
  },
  emptyCar: {
    background: '#151515',
    border: '2px dashed #333',
    borderRadius: '12px',
    height: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '30px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    margin: '0 0 25px 0',
    color: '#ff6600',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  formGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: '#888',
    fontSize: '0.8rem',
    letterSpacing: '1px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
  },
  starterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  },
  starterCard: {
    background: '#0a0a0a',
    borderRadius: '10px',
    padding: '15px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  starterIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  starterName: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  starterMake: {
    color: '#888',
    fontSize: '0.8rem',
    marginBottom: '8px',
  },
  starterStats: {
    color: '#ff6600',
    fontSize: '0.75rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    marginTop: '30px',
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#888',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  confirmBtn: {
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
