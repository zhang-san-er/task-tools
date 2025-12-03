/**
 * 根据经验值计算当前等级
 * 1级升2级需要100经验
 * 第N级升到N+1级需要 100 * N 经验
 * 总经验值 = 100 * (1 + 2 + 3 + ... + (level-1)) = 100 * level * (level-1) / 2
 */
export const calculateLevel = (experience: number): number => {
  if (experience < 100) return 1;
  
  // 解方程：experience = 100 * level * (level-1) / 2
  // level^2 - level - 2*experience/100 = 0
  // level = (1 + sqrt(1 + 8*experience/100)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + 8 * experience / 100)) / 2);
  return Math.max(1, level);
};

/**
 * 计算达到指定等级所需的总经验值
 */
export const getExperienceForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return 100 * level * (level - 1) / 2;
};

/**
 * 计算当前等级所需的总经验值
 */
export const getPointsForCurrentLevel = (level: number): number => {
  return getExperienceForLevel(level);
};

/**
 * 计算下一等级所需的总经验值
 */
export const getPointsForNextLevel = (level: number): number => {
  return getExperienceForLevel(level + 1);
};

/**
 * 计算当前等级进度百分比
 */
export const getLevelProgress = (experience: number, level: number): number => {
  const currentLevelExp = getPointsForCurrentLevel(level);
  const nextLevelExp = getPointsForNextLevel(level);
  const progress = experience - currentLevelExp;
  const needed = nextLevelExp - currentLevelExp;
  
  return needed > 0 ? Math.min(100, Math.max(0, (progress / needed) * 100)) : 100;
};

