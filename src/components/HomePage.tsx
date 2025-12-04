import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
	const navigate = useNavigate();

	const tools = [
		{
			id: 'task-platform',
			title: '🎯 任务平台',
			description: '高效管理任务，轻松获得奖励',
			path: '/task-platform',
			gradient: 'from-purple-500 to-pink-500',
			bgGradient: 'from-purple-50 to-pink-50',
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
			<div className="w-full max-w-md mx-auto min-h-screen">
				{/* 顶部装饰 */}
				<div className="gradient-bg w-full h-32 rounded-b-3xl relative overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

					<header className="relative z-10 text-center pt-8 px-4">
						<h1 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
							🛠️ 工具集
						</h1>
						<p className="text-white/90 text-sm font-medium">
							精选实用工具，提升工作效率
						</p>
					</header>
				</div>

				<div className="px-4 -mt-6 relative z-20 pb-8">
					<div className="grid grid-cols-1 gap-4">
						{tools.map(tool => (
							<button
								key={tool.id}
								onClick={() => navigate(tool.path)}
								className={`bg-gradient-to-br ${tool.bgGradient} rounded-3xl p-6 text-left border border-white/60 shadow-lg hover:shadow-xl transition-all active:scale-98 group`}>
								<div className="flex items-start justify-between mb-3">
									<div className="flex-1">
										<h3 className="text-xl font-black text-gray-800 mb-2 group-hover:scale-105 transition-transform">
											{tool.title}
										</h3>
										<p className="text-sm text-gray-600 leading-relaxed">
											{tool.description}
										</p>
									</div>
									<div
										className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
										<svg
											className="w-6 h-6 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</div>
							</button>
						))}
					</div>

					<div className="mt-12 text-center">
						<p className="text-xs text-gray-400">
							✨ 更多工具即将上线
						</p>
					</div>
				</div>

				<footer className="mt-12 px-4 text-center text-xs text-gray-400 pb-8">
					<p>✨ 数据安全存储在本地，完全离线可用</p>
				</footer>
			</div>
		</div>
	);
};

