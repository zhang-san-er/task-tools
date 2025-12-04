import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserStats } from '../components/UserStats';
import { TaskList } from '../components/TaskList';
import { MyPoints } from '../components/MyPoints';
import { DataManager } from '../components/DataManager';

type Page = 'home' | 'points' | 'settings';

export const TaskPlatform: React.FC = () => {
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState<Page>('home');

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
			<div className="w-full max-w-md mx-auto min-h-screen pb-24">
				{/* 顶部装饰 */}
				<div className="gradient-bg w-full h-32 rounded-b-3xl relative overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

					<header className="relative z-10 text-center pt-8 px-4">
						<div className="flex items-center justify-center gap-2 mb-2">
							<button
								onClick={() => navigate('/')}
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
								🎯 任务平台
							</h1>
							<div className="w-8"></div>
						</div>
						<p className="text-white/90 text-sm font-medium">
							高效管理任务，轻松获得奖励
						</p>
					</header>
				</div>

				<div className="px-4 -mt-6 relative z-20">
					{currentPage === 'home' && (
						<>
							<UserStats />
							<TaskList />
						</>
					)}
					{currentPage === 'points' && <MyPoints />}
					{currentPage === 'settings' && <DataManager />}
				</div>

				<footer className="mt-12 px-4 text-center text-xs text-gray-400">
					<p>✨ 数据安全存储在本地，完全离线可用</p>
				</footer>

				{/* 底部导航 */}
				<div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50">
					<div className="grid grid-cols-3 h-16">
						<button
							onClick={() => setCurrentPage('home')}
							className={`flex flex-col items-center justify-center gap-1 transition-colors ${
								currentPage === 'home'
									? 'text-purple-600'
									: 'text-gray-400'
							}`}>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
							</svg>
							<span className="text-xs font-semibold">
								悬赏大厅
							</span>
						</button>
						<button
							onClick={() => setCurrentPage('points')}
							className={`flex flex-col items-center justify-center gap-1 transition-colors ${
								currentPage === 'points'
									? 'text-purple-600'
									: 'text-gray-400'
							}`}>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-xs font-semibold">
								我的积分
							</span>
						</button>
						<button
							onClick={() => setCurrentPage('settings')}
							className={`flex flex-col items-center justify-center gap-1 transition-colors ${
								currentPage === 'settings'
									? 'text-purple-600'
									: 'text-gray-400'
							}`}>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span className="text-xs font-semibold">
								数据管理
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

