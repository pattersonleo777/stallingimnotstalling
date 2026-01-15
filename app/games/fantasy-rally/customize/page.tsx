"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useGame, Car, VinylLayer } from '../context/GameContext';
import Link from 'next/link';

const PAINT_COLORS = [
  '#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#00ffcc',
  '#00ccff', '#0066ff', '#6600ff', '#ff00ff', '#ff0066',
  '#ffffff', '#cccccc', '#666666', '#333333', '#000000',
];

const BODY_KITS = [
  { id: 'stock', name: 'Stock', price: 0 },
  { id: 'street', name: 'Street Fighter', price: 500 },
  { id: 'widebody', name: 'Wide Body', price: 1500 },
  { id: 'aero', name: 'Aero Package', price: 2000 },
  { id: 'nismo', name: 'Nismo Style', price: 3000 },
  { id: 'rocket', name: 'Rocket Bunny', price: 5000 },
];

const WHEEL_OPTIONS = [
  { id: 'stock', name: 'Stock Wheels', price: 0 },
  { id: 'enkei', name: 'Enkei RPF1', price: 800 },
  { id: 'te37', name: 'Volk TE37', price: 1200 },
  { id: 'work', name: 'Work Meister', price: 1500 },
  { id: 'bbs', name: 'BBS LM', price: 2000 },
  { id: 'rays', name: 'Rays G25', price: 2500 },
];

type CustomizeTab = 'paint' | 'livery' | 'bodykit' | 'wheels' | 'vinyl';

export default function CustomizePage() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<CustomizeTab>('paint');
  const [selectedPaint, setSelectedPaint] = useState(state.selectedCar?.paint || '#ff0000');
  const [raceNumber, setRaceNumber] = useState(state.selectedCar?.raceNumber || 0);
  const [selectedBodyKit, setSelectedBodyKit] = useState(state.selectedCar?.bodyKit || 'stock');
  const [selectedWheels, setSelectedWheels] = useState(state.selectedCar?.wheels || 'stock');
  const [vinylPrompt, setVinylPrompt] = useState('');
  const [generatingVinyl, setGeneratingVinyl] = useState(false);
  const [vinylLayers, setVinylLayers] = useState<VinylLayer[]>(state.selectedCar?.vinylLayers || []);
  const [selectedVinyl, setSelectedVinyl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw car preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw car body
    ctx.fillStyle = selectedPaint;
    ctx.beginPath();
    ctx.moveTo(100, 200);
    ctx.lineTo(150, 150);
    ctx.lineTo(250, 140);
    ctx.lineTo(350, 150);
    ctx.lineTo(400, 180);
    ctx.lineTo(420, 200);
    ctx.lineTo(420, 250);
    ctx.lineTo(80, 250);
    ctx.lineTo(80, 200);
    ctx.closePath();
    ctx.fill();

    // Draw windows
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(160, 155);
    ctx.lineTo(240, 148);
    ctx.lineTo(240, 185);
    ctx.lineTo(155, 185);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(250, 148);
    ctx.lineTo(340, 155);
    ctx.lineTo(355, 185);
    ctx.lineTo(250, 185);
    ctx.closePath();
    ctx.fill();

    // Draw wheels
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(130, 260, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(370, 260, 35, 0, Math.PI * 2);
    ctx.fill();

    // Wheel centers
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(130, 260, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(370, 260, 20, 0, Math.PI * 2);
    ctx.fill();

    // Race number
    if (raceNumber > 0) {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${raceNumber}`, 250, 210);
    }

    // Draw vinyl layers
    vinylLayers.forEach((layer) => {
      const img = new Image();
      img.src = layer.imageUrl;
      img.onload = () => {
        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);
        ctx.drawImage(img, -50, -50, 100, 100);
        ctx.restore();
      };
    });
  }, [selectedPaint, raceNumber, vinylLayers, selectedBodyKit, selectedWheels]);

  const handleGenerateVinyl = async () => {
    if (!vinylPrompt.trim()) return;
    setGeneratingVinyl(true);

    try {
      const encodedPrompt = encodeURIComponent(`${vinylPrompt}, vinyl sticker design, transparent background, racing decal style`);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

      const newVinyl: VinylLayer = {
        id: `vinyl-${Date.now()}`,
        imageUrl,
        x: 250,
        y: 180,
        scale: 0.5,
        rotation: 0,
      };

      setVinylLayers([...vinylLayers, newVinyl]);
      setVinylPrompt('');
      dispatch({ type: 'ADD_XP', payload: 25 });
    } catch (error) {
      console.error('Error generating vinyl:', error);
    } finally {
      setGeneratingVinyl(false);
    }
  };

  const handleSaveCustomization = () => {
    if (!state.selectedCar) return;

    const updatedCar: Car = {
      ...state.selectedCar,
      paint: selectedPaint,
      raceNumber,
      bodyKit: selectedBodyKit,
      wheels: selectedWheels,
      vinylLayers,
    };

    dispatch({ type: 'UPDATE_CAR', payload: updatedCar });
    dispatch({ type: 'ADD_XP', payload: 10 });
  };

  const handleVinylTransform = (id: string, property: 'x' | 'y' | 'scale' | 'rotation', delta: number) => {
    setVinylLayers(layers =>
      layers.map(layer =>
        layer.id === id
          ? { ...layer, [property]: layer[property] + delta }
          : layer
      )
    );
  };

  const handleRemoveVinyl = (id: string) => {
    setVinylLayers(layers => layers.filter(l => l.id !== id));
    setSelectedVinyl(null);
  };

  if (!state.selectedCar) {
    return (
      <div style={styles.container}>
        <div style={styles.noCarMessage}>
          <h2>No Car Selected</h2>
          <p>Go to the garage and select a car to customize.</p>
          <Link href="/games/fantasy-rally/garage" style={styles.goToGarage}>GO TO GARAGE</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/games/fantasy-rally" style={styles.backBtn}>← BACK</Link>
        <h1 style={styles.title}>CUSTOMIZE</h1>
        <button style={styles.saveBtn} onClick={handleSaveCustomization}>SAVE (+10 XP)</button>
      </header>

      <div style={styles.content}>
        {/* Car Preview Canvas */}
        <div style={styles.previewSection}>
          <canvas ref={canvasRef} width={500} height={350} style={styles.canvas} />
          <div style={styles.carInfo}>
            <strong>{state.selectedCar.name}</strong>
            <span>{state.selectedCar.year} {state.selectedCar.make} {state.selectedCar.model}</span>
          </div>
        </div>

        {/* Customization Tabs */}
        <div style={styles.customizePanel}>
          <div style={styles.tabs}>
            {(['paint', 'livery', 'bodykit', 'wheels', 'vinyl'] as CustomizeTab[]).map((tab) => (
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

          <div style={styles.tabContent}>
            {/* Paint Tab */}
            {activeTab === 'paint' && (
              <div>
                <h3 style={styles.sectionTitle}>PAINT COLOR</h3>
                <div style={styles.colorGrid}>
                  {PAINT_COLORS.map((color) => (
                    <div
                      key={color}
                      style={{
                        ...styles.colorSwatch,
                        background: color,
                        border: selectedPaint === color ? '3px solid #ff6600' : '2px solid #333',
                      }}
                      onClick={() => setSelectedPaint(color)}
                    />
                  ))}
                </div>
                <div style={styles.customColorSection}>
                  <label style={styles.label}>CUSTOM COLOR</label>
                  <input
                    type="color"
                    value={selectedPaint}
                    onChange={(e) => setSelectedPaint(e.target.value)}
                    style={styles.colorPicker}
                  />
                </div>
              </div>
            )}

            {/* Livery Tab */}
            {activeTab === 'livery' && (
              <div>
                <h3 style={styles.sectionTitle}>RACE NUMBER</h3>
                <div style={styles.numberSection}>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={raceNumber}
                    onChange={(e) => setRaceNumber(parseInt(e.target.value) || 0)}
                    style={styles.numberInput}
                  />
                  <div style={styles.presetNumbers}>
                    {[7, 13, 23, 46, 69, 88, 99].map((num) => (
                      <button
                        key={num}
                        style={styles.presetBtn}
                        onClick={() => setRaceNumber(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Body Kit Tab */}
            {activeTab === 'bodykit' && (
              <div>
                <h3 style={styles.sectionTitle}>BODY KIT</h3>
                <div style={styles.optionsGrid}>
                  {BODY_KITS.map((kit) => (
                    <div
                      key={kit.id}
                      style={{
                        ...styles.optionCard,
                        border: selectedBodyKit === kit.id ? '2px solid #ff6600' : '1px solid #333',
                      }}
                      onClick={() => setSelectedBodyKit(kit.id)}
                    >
                      <div style={styles.optionIcon}>🚗</div>
                      <div style={styles.optionName}>{kit.name}</div>
                      <div style={styles.optionPrice}>
                        {kit.price > 0 ? `${kit.price} CR` : 'FREE'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wheels Tab */}
            {activeTab === 'wheels' && (
              <div>
                <h3 style={styles.sectionTitle}>WHEELS</h3>
                <div style={styles.optionsGrid}>
                  {WHEEL_OPTIONS.map((wheel) => (
                    <div
                      key={wheel.id}
                      style={{
                        ...styles.optionCard,
                        border: selectedWheels === wheel.id ? '2px solid #ff6600' : '1px solid #333',
                      }}
                      onClick={() => setSelectedWheels(wheel.id)}
                    >
                      <div style={styles.optionIcon}>⚙️</div>
                      <div style={styles.optionName}>{wheel.name}</div>
                      <div style={styles.optionPrice}>
                        {wheel.price > 0 ? `${wheel.price} CR` : 'FREE'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vinyl/AI Generation Tab */}
            {activeTab === 'vinyl' && (
              <div>
                <h3 style={styles.sectionTitle}>AI VINYL GENERATOR</h3>
                <div style={styles.vinylGenerator}>
                  <input
                    style={styles.vinylInput}
                    placeholder="Describe your vinyl design... (e.g., 'flames', 'tribal pattern', 'racing stripes')"
                    value={vinylPrompt}
                    onChange={(e) => setVinylPrompt(e.target.value)}
                  />
                  <button
                    style={styles.generateBtn}
                    onClick={handleGenerateVinyl}
                    disabled={generatingVinyl || !vinylPrompt.trim()}
                  >
                    {generatingVinyl ? 'GENERATING...' : 'GENERATE (+25 XP)'}
                  </button>
                </div>

                {vinylLayers.length > 0 && (
                  <div style={styles.vinylLayersSection}>
                    <h4 style={styles.subTitle}>VINYL LAYERS</h4>
                    {vinylLayers.map((layer) => (
                      <div
                        key={layer.id}
                        style={{
                          ...styles.vinylLayerCard,
                          border: selectedVinyl === layer.id ? '2px solid #ff6600' : '1px solid #333',
                        }}
                        onClick={() => setSelectedVinyl(layer.id)}
                      >
                        <img src={layer.imageUrl} alt="vinyl" style={styles.vinylThumb} />
                        <div style={styles.vinylControls}>
                          <div style={styles.controlRow}>
                            <span>X:</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'x', -10)}>-</button>
                            <span>{Math.round(layer.x)}</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'x', 10)}>+</button>
                          </div>
                          <div style={styles.controlRow}>
                            <span>Y:</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'y', -10)}>-</button>
                            <span>{Math.round(layer.y)}</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'y', 10)}>+</button>
                          </div>
                          <div style={styles.controlRow}>
                            <span>Scale:</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'scale', -0.1)}>-</button>
                            <span>{layer.scale.toFixed(1)}</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'scale', 0.1)}>+</button>
                          </div>
                          <div style={styles.controlRow}>
                            <span>Rot:</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'rotation', -15)}>-</button>
                            <span>{layer.rotation}°</span>
                            <button onClick={() => handleVinylTransform(layer.id, 'rotation', 15)}>+</button>
                          </div>
                          <button style={styles.removeBtn} onClick={() => handleRemoveVinyl(layer.id)}>
                            REMOVE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
  saveBtn: {
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    border: 'none',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '30px',
  },
  previewSection: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    padding: '20px',
  },
  canvas: {
    width: '100%',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  carInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#888',
  },
  customizePanel: {
    background: '#151515',
    border: '1px solid #333',
    borderRadius: '15px',
    overflow: 'hidden',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #333',
  },
  tab: {
    flex: 1,
    padding: '15px 10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
    transition: 'all 0.2s ease',
  },
  tabContent: {
    padding: '20px',
    maxHeight: '500px',
    overflow: 'auto',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#888',
    fontSize: '0.8rem',
    letterSpacing: '2px',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  colorSwatch: {
    width: '100%',
    paddingBottom: '100%',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  customColorSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  label: {
    color: '#888',
    fontSize: '0.8rem',
  },
  colorPicker: {
    width: '60px',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  numberSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  numberInput: {
    width: '100%',
    padding: '15px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '2rem',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  presetNumbers: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  presetBtn: {
    padding: '10px 15px',
    background: '#222',
    border: '1px solid #444',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  optionCard: {
    background: '#0a0a0a',
    borderRadius: '10px',
    padding: '15px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  optionIcon: {
    fontSize: '1.5rem',
    marginBottom: '8px',
  },
  optionName: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  optionPrice: {
    fontSize: '0.7rem',
    color: '#ff6600',
  },
  vinylGenerator: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  vinylInput: {
    width: '100%',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.9rem',
  },
  generateBtn: {
    background: 'linear-gradient(135deg, #6600ff, #ff0066)',
    border: 'none',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  vinylLayersSection: {
    marginTop: '20px',
  },
  subTitle: {
    margin: '0 0 15px 0',
    color: '#888',
    fontSize: '0.7rem',
    letterSpacing: '1px',
  },
  vinylLayerCard: {
    display: 'flex',
    gap: '15px',
    background: '#0a0a0a',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '10px',
    cursor: 'pointer',
  },
  vinylThumb: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  vinylControls: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.7rem',
  },
  removeBtn: {
    marginTop: '5px',
    background: '#ff4444',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.7rem',
  },
  noCarMessage: {
    textAlign: 'center',
    padding: '100px 20px',
  },
  goToGarage: {
    display: 'inline-block',
    marginTop: '20px',
    background: 'linear-gradient(135deg, #ff6600, #ff0066)',
    color: 'white',
    padding: '15px 30px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};
