import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	base: '/task-tools/', // GitHub Pages 子路径配置
	plugins: [
		react(),
		VitePWA({
			registerType: 'prompt', // 改为 prompt，确保用户控制更新
			includeAssets: ['favicon.ico', 'icons/*.png'],
			manifest: {
				name: '任务平台',
				short_name: '任务平台',
				description: '高效的任务管理与奖励系统',
				theme_color: '#3b82f6',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				scope: '/task-tools/',
				start_url: '/task-tools/',
				icons: [
					{
						src: 'icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				// 添加导航回退，确保离线时能访问
				navigateFallback: '/task-tools/index.html',
				navigateFallbackDenylist: [
					/^\/_/,
					/\/[^/?]+\.[^/]+$/,
				],
				// 使用 NetworkFirst 策略，离线时回退到缓存
				runtimeCaching: [
					{
						urlPattern:
							/^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					// 添加对所有导航请求的缓存策略
					{
						urlPattern: ({ request }) =>
							request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'navigations',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30天
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
			// 添加 devOptions 确保开发时也能测试 Service Worker
			devOptions: {
				enabled: true,
				type: 'module',
			},
		}),
	],
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		sourcemap: false,
	},
});
