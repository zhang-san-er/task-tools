import React from 'react';
import { useUserStore } from '../stores/userStore';
import { LevelProgress } from './LevelProgress';
import { ExperienceBar } from './HealthBar';

export const UserStats: React.FC = () => {
	const { level, totalPoints, experience } = useUserStore();

	return (
		<div className="glass-effect rounded-3xl card-shadow p-6 mb-5 border border-white/60">
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

				<div className="pt-3">
					<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow">
						<div className="text-3xl font-black text-blue-600 mb-1.5">
							{totalPoints}
						</div>
						<div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
							总积分
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
