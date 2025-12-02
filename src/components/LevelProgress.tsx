import React from 'react';
import { getLevelProgress } from '../utils/levelCalculator';

interface LevelProgressProps {
  totalPoints: number;
  level: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ totalPoints, level }) => {
  const progress = getLevelProgress(totalPoints);
  const nextLevelPoints = level * 100;
  const currentLevelPoints = (level - 1) * 100;
  const progressPoints = totalPoints - currentLevelPoints;
  const neededPoints = nextLevelPoints - currentLevelPoints;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          升级进度
        </span>
        <span className="text-xs font-bold text-gray-700">
          {progressPoints}/{neededPoints}
        </span>
      </div>
      <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-full transition-all duration-500 rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse-slow"></div>
        </div>
      </div>
    </div>
  );
};

