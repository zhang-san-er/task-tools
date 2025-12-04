import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// 自动刷新逻辑
if ('serviceWorker' in navigator) {
	let refreshing = false;

	// 强制刷新页面的辅助函数（绕过 Service Worker 缓存）
	const forceReload = () => {
		const url = new URL(window.location.href);
		// 添加时间戳参数确保绕过缓存
		url.searchParams.set('_sw_update', Date.now().toString());
		// 使用 replace 避免在历史记录中留下记录
		window.location.replace(url.toString());
	};

	// 监听 Service Worker 更新
	navigator.serviceWorker.addEventListener(
		'controllerchange',
		() => {
			if (!refreshing) {
				refreshing = true;
				// 使用强制刷新方法，确保绕过 Service Worker 缓存
				forceReload();
			}
		}
	);

	// 检查并处理等待中的更新
	navigator.serviceWorker.ready.then(registration => {
		// 定期检查更新 - 每5分钟检查一次
		setInterval(() => {
			registration.update();
		}, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000 毫秒

		// 监听更新发现事件
		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing;

			if (newWorker) {
				newWorker.addEventListener('statechange', () => {
					// 当新 Service Worker 安装完成并进入 waiting 状态时
					if (
						newWorker.state === 'installed' &&
						navigator.serviceWorker.controller
					) {
						// 自动激活新版本
						newWorker.postMessage({
							type: 'SKIP_WAITING',
						});
					}
				});
			}
		});

		// 如果已经有等待中的更新，立即激活
		if (registration.waiting) {
			registration.waiting.postMessage({
				type: 'SKIP_WAITING',
			});
		}
	});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter basename="/task-tools">
			<App />
		</BrowserRouter>
	</React.StrictMode>
);
