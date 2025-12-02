import React from 'react';

interface HealthBarProps {
  health: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ health }) => {
  const getHealthGradient = () => {
    if (health >= 70) return 'from-green-400 to-emerald-500';
    if (health >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-rose-600';
  };

  const getHealthEmoji = () => {
    if (health >= 80) return '💚';
    if (health >= 50) return '💛';
    if (health >= 20) return '🧡';
    return '❤️';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
          <span>{getHealthEmoji()}</span>
          <span>生命能量</span>
        </span>
        <span className="text-xs font-bold text-gray-700">{health}/100</span>
      </div>
      <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`bg-gradient-to-r ${getHealthGradient()} h-full transition-all duration-500 rounded-full relative`}
          style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
        >
          {health > 0 && (
            <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
          )}
        </div>
      </div>
    </div>
  );
};

