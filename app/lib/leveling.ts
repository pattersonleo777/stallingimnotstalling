export const calculateLevel = (uploads: number, parts: number) => {
  // Formula: Base XP = (Uploads * 100) + (Parts * 25)
  const totalXP = (uploads * 100) + (parts * 25);
  
  // Level = Floor of sqrt(XP / 50) 
  // Level 1: 50 XP | Level 5: 1250 XP | Level 10: 5000 XP
  const level = Math.floor(Math.sqrt(totalXP / 50)) || 1;
  
  const titles = [
    "Rookie Mechanic", "Grease Monkey", "Technician", 
    "Lead Engineer", "Fleet Architect", "Master Constructor", 
    "God Rod Prime", "Legendary Fabricator"
  ];
  
  const titleIndex = Math.min(Math.floor(level / 5), titles.length - 1);
  
  return {
    level,
    xp: totalXP,
    title: titles[titleIndex],
    nextLevelXP: Math.pow(level + 1, 2) * 50
  };
};
