import React from 'react';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import { useUserStore } from '../stores/userStore';

export const MyPoints: React.FC = () => {
	const { totalPoints } = useUserStore();
	const { getRecords } = useTaskRecordStore();
	const records = getRecords();

	const formatDateTime = (date: Date | string) => {
		const d = typeof date === 'string' ? new Date(date) : date;
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}年${month}月${day}日`;
	};

	return (
		<div className="w-full">
			<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
				<div className="text-center mb-6">
					<div className="text-5xl font-black text-gradient mb-2">
						{totalPoints}
					</div>
					<div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
						我的积分
					</div>
				</div>
			</div>

			<div className="glass-effect rounded-2xl card-shadow p-5 border border-white/50">
				<h3 className="text-lg font-black text-gray-800 mb-4">
					📜 完成记录
				</h3>

				{records.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-4xl mb-3">📝</div>
						<p className="text-gray-500 text-sm">
							还没有完成记录
						</p>
						<p className="text-gray-400 text-xs mt-1">
							完成悬赏后，记录会显示在这里
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{records.map(record => (
							<div
								key={record.id}
								className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
								<div className="flex justify-between items-start mb-2">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span
												className={`text-xs px-2 py-1 rounded-full font-semibold ${
													record.taskType ===
													'demon'
														? 'bg-red-500 text-white'
														: 'bg-blue-500 text-white'
												}`}>
												{record.taskType ===
												'demon'
													? '💰 付费'
													: '⭐ 主线'}
											</span>
										</div>
										<h4 className="font-bold text-gray-800 text-sm mb-1">
											{record.taskName}
										</h4>
										<p className="text-xs text-gray-500">
											{formatDateTime(
												record.completedAt
											)}
										</p>
									</div>
									<div className="text-right">
										<div className="text-lg font-black text-orange-600">
											+{record.points}
										</div>
										<div className="text-xs text-gray-500">
											悬赏积分
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
