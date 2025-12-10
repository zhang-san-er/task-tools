import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskCalendar } from '../components/TaskCalendar';

export const TaskCalendarPage: React.FC = () => {
	const navigate = useNavigate();

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
								📅 任务日历
							</h1>
							<div className="w-8"></div>
						</div>
						<p className="text-white/90 text-sm font-medium">
							按日期查看完成的任务
						</p>
					</header>
				</div>

				<div className="px-4 -mt-6 relative z-20">
					<TaskCalendar />
				</div>

				<footer className="mt-8 px-4 text-center text-xs text-gray-400 pb-8">
					<p>✨ 数据安全存储在本地，完全离线可用</p>
				</footer>
			</div>
		</div>
	);
};

