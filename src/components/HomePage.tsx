import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from './Toast';

export const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const [isChecking, setIsChecking] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: 'success' | 'error' | 'info';
	} | null>(null);
	const [isStandalone, setIsStandalone] = useState(false);

	// 检测是否为 PWA standalone 模式
	useEffect(() => {
		const isStandaloneMode =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone === true ||
			document.referrer.includes('android-app://');
		setIsStandalone(isStandaloneMode);
	}, []);

	const tools = [
		{
			id: 'task-platform',
			title: '🎯 任务平台',
			description: '高效管理任务，轻松获得奖励',
			path: '/task-platform',
			gradient: 'from-purple-500 to-pink-500',
			bgGradient: 'from-purple-50 to-pink-50',
		},
		{
			id: 'idea-notes',
			title: '💭 想法记录',
			description: '记录灵感想法，分类整理',
			path: '/idea-notes',
			gradient: 'from-blue-500 to-indigo-500',
			bgGradient: 'from-blue-50 to-indigo-50',
		},
	];

	const checkForUpdates = async () => {
		setIsChecking(true);

		try {
			// 优先检查 Service Worker 更新（PWA 标准做法）
			if ('serviceWorker' in navigator) {
				try {
					const registration = await navigator.serviceWorker
						.ready;
					await registration.update();

					// 检查是否有新版本
					if (registration.waiting) {
						setToast({
							message:
								'发现新版本！请刷新页面以获取最新功能。',
							type: 'success',
						});
						setIsChecking(false);
						return;
					}
				} catch (swError) {
					console.error(
						'Service Worker 更新检查失败:',
						swError
					);
				}
			}

			// 尝试从 GitHub API 获取最新 commit 信息（可选）
			// 注意：如果仓库是私有的或不存在，此步骤会失败，但不影响主要功能
			try {
				// 从当前页面 URL 推断仓库信息，或使用环境变量
				const currentUrl = window.location.href;
				const githubMatch = currentUrl.match(
					/github\.io\/([^\/]+)\/([^\/]+)/
				);

				if (githubMatch) {
					const repoOwner = githubMatch[1];
					const repoName = githubMatch[2] || 'task-tools';

					const response = await fetch(
						`https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=1`,
						{
							headers: {
								Accept: 'application/vnd.github.v3+json',
							},
						}
					);

					if (response.ok) {
						const commits = await response.json();
						if (commits.length > 0) {
							const latestCommit = commits[0];
							const commitDate = new Date(
								latestCommit.commit.author.date
							);
							const formattedDate = `${commitDate.getFullYear()}年${
								commitDate.getMonth() + 1
							}月${commitDate.getDate()}日 ${String(
								commitDate.getHours()
							).padStart(2, '0')}:${String(
								commitDate.getMinutes()
							).padStart(2, '0')}`;

							setToast({
								message: `最新代码更新：${formattedDate}\n${latestCommit.commit.message}`,
								type: 'success',
							});
							setIsChecking(false);
							return;
						}
					}
				}
			} catch (githubError) {
				console.log(
					'GitHub API 检查失败（这是正常的，如果仓库不存在或为私有）:',
					githubError
				);
			}

			// 如果没有发现更新
			setToast({
				message: '当前已是最新版本',
				type: 'info',
			});
		} catch (error) {
			setToast({
				message: '检查更新时出现错误，请稍后重试',
				type: 'error',
			});
		} finally {
			setIsChecking(false);
		}
	};

	const handleRefresh = async () => {
		try {
			// 如果有 Service Worker，先处理更新
			if ('serviceWorker' in navigator) {
				const registration = await navigator.serviceWorker
					.ready;

				// 如果有等待中的新版本，先激活它
				if (registration.waiting) {
					// 发送 SKIP_WAITING 消息给等待中的 Service Worker
					registration.waiting.postMessage({
						type: 'SKIP_WAITING',
					});

					// 监听 controllerchange 事件，当新的 Service Worker 激活后刷新
					let refreshing = false;
					navigator.serviceWorker.addEventListener(
						'controllerchange',
						() => {
							if (!refreshing) {
								refreshing = true;
								// 使用 location.href 赋值来强制刷新（比 reload 更可靠）
								window.location.href =
									window.location.href;
							}
						}
					);

					// 如果 1 秒内没有触发 controllerchange，直接刷新
					setTimeout(() => {
						if (!refreshing) {
							window.location.href =
								window.location.href;
						}
					}, 1000);

					return;
				}

				// 强制更新 Service Worker
				await registration.update();
			}

			// 使用 location.href 赋值来强制刷新（比 reload 更可靠）
			window.location.href = window.location.href;
		} catch (error) {
			// 如果出错，直接刷新
			window.location.href = window.location.href;
		}
	};

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
					<div className="grid grid-cols-2 gap-2">
						{tools.map(tool => (
							<button
								key={tool.id}
								onClick={() => navigate(tool.path)}
								className={`bg-gradient-to-br ${tool.bgGradient} rounded-xl p-3 text-left border border-white/60 shadow-md hover:shadow-lg transition-all active:scale-98 group flex flex-col`}>
								<div className="flex-1">
									<h3 className="text-sm font-black text-gray-800 mb-1 group-hover:scale-105 transition-transform">
										{tool.title}
									</h3>
									<p className="text-xs text-gray-600 leading-snug">
										{tool.description}
									</p>
								</div>
								<div className="mt-2 flex justify-end">
									<div
										className={`w-7 h-7 rounded-lg bg-gradient-to-r ${tool.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
										<svg
											className="w-3.5 h-3.5 text-white"
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

				{/* 底部操作按钮 */}
				<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 items-center">
					{/* 检查更新按钮 */}
					<button
						onClick={checkForUpdates}
						disabled={isChecking}
						className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
						{isChecking ? (
							<>
								<svg
									className="animate-spin h-3 w-3 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span>检查中</span>
							</>
						) : (
							<>
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								<span>检查更新</span>
							</>
						)}
					</button>

					{/* PWA 模式下显示刷新按钮 */}
					{isStandalone && (
						<button
							onClick={handleRefresh}
							className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5">
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							<span>刷新</span>
						</button>
					)}
				</div>

				{/* Toast 提示 */}
				{toast && (
					<Toast
						message={toast.message}
						type={toast.type}
						onClose={() => setToast(null)}
					/>
				)}
			</div>
		</div>
	);
};
