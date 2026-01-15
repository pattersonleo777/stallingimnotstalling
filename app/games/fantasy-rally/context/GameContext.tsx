"use client";
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface CarStats {
  horsepower: number;
  torque: number;
  weight: number;
  grip: number;
  acceleration: number;
  topSpeed: number;
}

export interface Car {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  imageUrl?: string;
  paint: string;
  bodyKit?: string;
  wheels?: string;
  raceNumber: number;
  vinylLayers: VinylLayer[];
  stats: CarStats;
  installedParts: Part[];
}

export interface VinylLayer {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface Part {
  id: string;
  name: string;
  type: 'engine' | 'turbo' | 'suspension' | 'tires' | 'brakes' | 'exhaust' | 'bodykit' | 'wheels' | 'nitrous';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  statBoosts: Partial<CarStats>;
  unlockLevel: number;
  price: number;
}

export interface Player {
  id: string;
  name: string;
  xp: number;
  level: number;
  credits: number;
  wins: number;
  losses: number;
  title: string;
}

export interface Wager {
  id: string;
  amount: number;
  status: 'pending' | 'active' | 'completed';
  carId: string;
  opponentId?: string;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  status: 'online' | 'offline' | 'racing';
}

export interface GameState {
  player: Player | null;
  cars: Car[];
  parts: Part[];
  selectedCar: Car | null;
  wagers: Wager[];
  friends: Friend[];
  activeTab: string;
  raceInProgress: boolean;
  loading: boolean;
}

// Actions
type GameAction =
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'SET_CARS'; payload: Car[] }
  | { type: 'ADD_CAR'; payload: Car }
  | { type: 'UPDATE_CAR'; payload: Car }
  | { type: 'SELECT_CAR'; payload: Car | null }
  | { type: 'SET_PARTS'; payload: Part[] }
  | { type: 'ADD_PART'; payload: Part }
  | { type: 'INSTALL_PART'; payload: { carId: string; part: Part } }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'ADD_CREDITS'; payload: number }
  | { type: 'SET_WAGERS'; payload: Wager[] }
  | { type: 'ADD_WAGER'; payload: Wager }
  | { type: 'SET_FRIENDS'; payload: Friend[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_RACE_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RECORD_WIN' }
  | { type: 'RECORD_LOSS' };

// XP and Leveling calculations
export const calculateLevel = (xp: number): { level: number; title: string; nextLevelXP: number; progress: number } => {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const titles = [
    "Street Novice", "Garage Rat", "Weekend Warrior", "Track Day Regular",
    "Amateur Racer", "Pro Street", "Circuit Champion", "Rally Master",
    "Racing Legend", "God Rod Prime"
  ];
  const titleIndex = Math.min(Math.floor(level / 3), titles.length - 1);
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return { level, title: titles[titleIndex], nextLevelXP, progress };
};

// Initial state
const initialState: GameState = {
  player: null,
  cars: [],
  parts: [],
  selectedCar: null,
  wagers: [],
  friends: [],
  activeTab: 'garage',
  raceInProgress: false,
  loading: true,
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'SET_CARS':
      return { ...state, cars: action.payload };
    case 'ADD_CAR':
      return { ...state, cars: [...state.cars, action.payload] };
    case 'UPDATE_CAR':
      return {
        ...state,
        cars: state.cars.map(c => c.id === action.payload.id ? action.payload : c),
        selectedCar: state.selectedCar?.id === action.payload.id ? action.payload : state.selectedCar,
      };
    case 'SELECT_CAR':
      return { ...state, selectedCar: action.payload };
    case 'SET_PARTS':
      return { ...state, parts: action.payload };
    case 'ADD_PART':
      return { ...state, parts: [...state.parts, action.payload] };
    case 'INSTALL_PART': {
      const { carId, part } = action.payload;
      const updatedCars = state.cars.map(car => {
        if (car.id === carId) {
          const existingParts = car.installedParts.filter(p => p.type !== part.type);
          return { ...car, installedParts: [...existingParts, part] };
        }
        return car;
      });
      return { ...state, cars: updatedCars };
    }
    case 'ADD_XP':
      if (!state.player) return state;
      const newXP = state.player.xp + action.payload;
      const levelInfo = calculateLevel(newXP);
      return {
        ...state,
        player: { ...state.player, xp: newXP, level: levelInfo.level, title: levelInfo.title },
      };
    case 'ADD_CREDITS':
      if (!state.player) return state;
      return { ...state, player: { ...state.player, credits: state.player.credits + action.payload } };
    case 'SET_WAGERS':
      return { ...state, wagers: action.payload };
    case 'ADD_WAGER':
      return { ...state, wagers: [...state.wagers, action.payload] };
    case 'SET_FRIENDS':
      return { ...state, friends: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_RACE_IN_PROGRESS':
      return { ...state, raceInProgress: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'RECORD_WIN':
      if (!state.player) return state;
      return { ...state, player: { ...state.player, wins: state.player.wins + 1 } };
    case 'RECORD_LOSS':
      if (!state.player) return state;
      return { ...state, player: { ...state.player, losses: state.player.losses + 1 } };
    default:
      return state;
  }
}

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    // Load initial data
    const loadGameData = async () => {
      try {
        // Fetch player data
        const playerRes = await fetch('/api/games/fantasy-rally/player');
        if (playerRes.ok) {
          const playerData = await playerRes.json();
          const levelInfo = calculateLevel(playerData.xp || 0);
          dispatch({
            type: 'SET_PLAYER',
            payload: { ...playerData, ...levelInfo },
          });
        }

        // Fetch cars
        const carsRes = await fetch('/api/games/fantasy-rally/cars');
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          dispatch({ type: 'SET_CARS', payload: carsData });
        }

        // Fetch parts
        const partsRes = await fetch('/api/games/fantasy-rally/parts');
        if (partsRes.ok) {
          const partsData = await partsRes.json();
          dispatch({ type: 'SET_PARTS', payload: partsData });
        }

        // Fetch friends
        const friendsRes = await fetch('/api/games/fantasy-rally/friends');
        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          dispatch({ type: 'SET_FRIENDS', payload: friendsData });
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadGameData();
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Calculate car's effective stats with installed parts
export function calculateEffectiveStats(car: Car): CarStats {
  const baseStats = car.stats;
  const boosts = car.installedParts.reduce(
    (acc, part) => ({
      horsepower: acc.horsepower + (part.statBoosts.horsepower || 0),
      torque: acc.torque + (part.statBoosts.torque || 0),
      weight: acc.weight + (part.statBoosts.weight || 0),
      grip: acc.grip + (part.statBoosts.grip || 0),
      acceleration: acc.acceleration + (part.statBoosts.acceleration || 0),
      topSpeed: acc.topSpeed + (part.statBoosts.topSpeed || 0),
    }),
    { horsepower: 0, torque: 0, weight: 0, grip: 0, acceleration: 0, topSpeed: 0 }
  );

  return {
    horsepower: baseStats.horsepower + boosts.horsepower,
    torque: baseStats.torque + boosts.torque,
    weight: Math.max(baseStats.weight + boosts.weight, 500),
    grip: baseStats.grip + boosts.grip,
    acceleration: baseStats.acceleration + boosts.acceleration,
    topSpeed: baseStats.topSpeed + boosts.topSpeed,
  };
}
