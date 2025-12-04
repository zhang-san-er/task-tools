import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskRecordStore } from '../stores/taskRecordStore';

export const TaskRecords: React.FC = () => {
	const navigate = useNavigate();
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
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
			<div className="w-full max-w-md mx-auto min-h-screen pb-8">
				{/* 顶部装饰 */}
				<div className="gradient-bg w-full h-32 rounded-b-3xl relative overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

					<header className="relative z-10 text-center pt-8 px-4">
						<div className="flex items-center justify-center gap-2 mb-2">
							<button
								onClick={() => navigate('/task-platform')}
								className="text-white/80 hover:text-white transition-colors p-1">
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 19l-7-7m0 0l7-7m-7 7h18"
									/>
								</svg>
							</button>
							<h1 className="text-3xl font-black text-white drop-shadow-lg">
								📜 完成记录
							</h1>
							<div className="w-8"></div>
						</div>
						<p className="text-white/90 text-sm font-medium">
							共 {records.length} 条记录
						</p>
					</header>
				</div>

				<div className="px-4 -mt-6 relative z-20">
					{records.length === 0 ? (
						<div className="glass-effect rounded-2xl card-shadow p-8 border border-white/50 text-center">
							<div className="text-4xl mb-3">📝</div>
							<p className="text-gray-500 text-sm">
								还没有完成记录
							</p>
							<p className="text-gray-400 text-xs mt-1">
								完成任务后，记录会显示在这里
							</p>
						</div>
					) : (
						<div className="glass-effect rounded-2xl card-shadow p-5 border border-white/50">
							<div className="space-y-3">
								{records.map(record => (
									<div
										key={record.id}
										className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow">
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
															? '⚡ 付费'
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
												{record.cost &&
													record.cost > 0 && (
														<div className="text-sm font-bold text-red-600 mb-1">
															-{record.cost}
														</div>
													)}
												<div className="text-lg font-black text-orange-600">
													+{record.points}
												</div>
												<div className="text-xs text-gray-500">
													{record.cost &&
													record.cost > 0
														? '净收益'
														: '任务积分'}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<footer className="mt-8 px-4 text-center text-xs text-gray-400 pb-8">
					<p>✨ 数据安全存储在本地，完全离线可用</p>
				</footer>
			</div>
		</div>
	);
};

