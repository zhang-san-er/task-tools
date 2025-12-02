import React, { useState, useEffect } from 'react';
import {
	exportData,
	importData,
	clearAllData,
} from '../utils/storage';

export const DataManager: React.FC = () => {
	const [showManager, setShowManager] = useState(false);

	// 阻止背景滚动
	useEffect(() => {
		if (showManager) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [showManager]);

	const handleExport = () => {
		const data = exportData();
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `habit-game-backup-${
			new Date().toISOString().split('T')[0]
		}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		alert('数据导出成功！');
	};

	const handleImport = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = e => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = event => {
				const content = event.target?.result as string;
				if (importData(content)) {
					alert('数据导入成功！请刷新页面。');
					window.location.reload();
				} else {
					alert('数据导入失败，请检查文件格式。');
				}
			};
			reader.readAsText(file);
		};
		input.click();
	};

	const handleClear = () => {
		if (
			confirm(
				'⚠️ 警告：此操作将清除所有数据，且无法恢复！确定要继续吗？'
			)
		) {
			if (confirm('请再次确认：真的要清除所有数据吗？')) {
				clearAllData();
				alert('数据已清除，页面将刷新。');
				window.location.reload();
			}
		}
	};

	if (!showManager) {
		return (
			<button
				onClick={() => setShowManager(true)}
				className="fixed bottom-20 right-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white w-14 h-14 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center text-xl z-40"
				aria-label="数据管理">
				⚙️
			</button>
		);
	}

	return (
		<>
			{/* 蒙层 */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
				onClick={() => setShowManager(false)}
			/>

			{/* 弹窗 */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div
					onClick={e => e.stopPropagation()}
					className="glass-effect rounded-2xl card-shadow-lg p-5 border border-white/50 min-w-[280px] max-w-md">
					<div className="flex justify-between items-center mb-4">
						<h3 className="font-black text-gray-800 text-sm uppercase tracking-wide">
							数据管理
						</h3>
						<button
							onClick={() => setShowManager(false)}
							className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
							✕
						</button>
					</div>
					<div className="space-y-2">
						<button
							onClick={handleExport}
							className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all text-sm">
							💾 导出数据
						</button>
						<button
							onClick={handleImport}
							className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all text-sm">
							📥 导入数据
						</button>
						<button
							onClick={handleClear}
							className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all text-sm">
							🗑️ 清除数据
						</button>
					</div>
				</div>
			</div>
		</>
	);
};
