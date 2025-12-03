import React from 'react';
import { useUserStore } from '../stores/userStore';
import { LevelProgress } from './LevelProgress';
import { ExperienceBar } from './HealthBar';

export const UserStats: React.FC = () => {
	const { level, totalPoints, experience, streak } = useUserStore();

	return (
		<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
			<div className="flex items-center justify-between mb-5">
				<h2 className="text-lg font-bold text-gray-800">
					我的档案
				</h2>
				<div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
					<span className="text-white text-sm font-bold">
						Lv.{level}
					</span>
				</div>
			</div>

			<div className="space-y-4">
				<LevelProgress
					experience={experience}
					level={level}
				/>

				<ExperienceBar experience={experience} level={level} />

				<div className="grid grid-cols-2 gap-3 pt-2">
					<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200/50">
						<div className="text-2xl font-black text-blue-600 mb-1">
							{totalPoints}
						</div>
						<div className="text-xs font-medium text-blue-700">
							总积分
						</div>
					</div>
					<div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center border border-orange-200/50">
						<div className="text-2xl font-black text-orange-600 mb-1">
							{streak}
						</div>
						<div className="text-xs font-medium text-orange-700">
							连续坚持
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
