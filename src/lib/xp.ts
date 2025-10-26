export function calculateLevel(xp: number): number {
  if (xp <= 10) return 1;

  const level = Math.floor((xp - 11) / 30) + 2;
  return level;
}

export function getXpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);

  if (currentLevel === 1) {
    return 11; // Total XP needed for level 2 (11 XP total)
  }

  // Calculate XP needed to reach next level
  const xpForCurrentLevel = (currentLevel - 2) * 30 + 11; // XP at start of current level
  const xpForNextLevel = (currentLevel - 1) * 30 + 11; // XP needed for next level
  
  return xpForNextLevel - currentXp;
}

export function getXpProgress(currentXp: number): { currentProgress: number; totalNeeded: number } {
  const currentLevel = calculateLevel(currentXp);
  
  if (currentLevel === 1) {
    return {
      currentProgress: currentXp,
      totalNeeded: 11
    };
  }
  
  const xpForCurrentLevel = (currentLevel - 2) * 30 + 11;
  const xpForNextLevel = (currentLevel - 1) * 30 + 11;
  
  return {
    currentProgress: currentXp - xpForCurrentLevel,
    totalNeeded: xpForNextLevel - xpForCurrentLevel
  };
}
