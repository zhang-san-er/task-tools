import React from 'react';
import { getLevelProgress, getPointsForCurrentLevel, getPointsForNextLevel } from '../utils/levelCalculator';

interface ExperienceBarProps {
  experience: number;
  level: number;
}

export const ExperienceBar: React.FC<ExperienceBarProps> = ({ experience, level }) => {
  const currentLevelExp = getPointsForCurrentLevel(level);
  const nextLevelExp = getPointsForNextLevel(level);
  const progress = experience - currentLevelExp;
  const needed = nextLevelExp - currentLevelExp;
  const progressPercent = needed > 0 ? Math.min(100, Math.max(0, (progress / needed) * 100)) : 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
          <span>⭐</span>
          <span>经验值</span>
        </span>
        <span className="text-xs font-bold text-gray-700">{experience}</span>
      </div>
      <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-purple-400 to-pink-500 h-full transition-all duration-500 rounded-full relative"
          style={{ width: `${progressPercent}%` }}
        >
          {progressPercent > 0 && (
            <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1 text-center">
        距离下一级还需 {Math.max(0, needed - progress)} 经验
      </div>
    </div>
  );
};

