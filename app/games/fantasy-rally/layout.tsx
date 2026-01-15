"use client";
import { GameProvider } from './context/GameContext';

export default function FantasyRallyLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <div className="fantasy-rally-app">
        {children}
      </div>
    </GameProvider>
  );
}
