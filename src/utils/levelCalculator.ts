/**
 * 根据总积分计算当前等级
 * 每100积分升一级
 */
export const calculateLevel = (totalPoints: number): number => {
  return Math.floor(totalPoints / 100) + 1;
};

/**
 * 计算当前等级所需的积分
 */
export const getPointsForCurrentLevel = (level: number): number => {
  return (level - 1) * 100;
};

/**
 * 计算下一等级所需的积分
 */
export const getPointsForNextLevel = (level: number): number => {
  return level * 100;
};

/**
 * 计算当前等级进度百分比
 */
export const getLevelProgress = (totalPoints: number): number => {
  const currentLevel = calculateLevel(totalPoints);
  const pointsForCurrentLevel = getPointsForCurrentLevel(currentLevel);
  const pointsForNextLevel = getPointsForNextLevel(currentLevel);
  const progress = totalPoints - pointsForCurrentLevel;
  const needed = pointsForNextLevel - pointsForCurrentLevel;
  
  return Math.min(100, Math.max(0, (progress / needed) * 100));
};

