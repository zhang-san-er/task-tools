import React, { useState } from 'react';
import {
	exportData,
	importData,
	clearAllData,
} from '../utils/storage';
import { ConfirmDialog } from './ConfirmDialog';

export const DataManager: React.FC = () => {
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
		confirmText?: string;
		cancelText?: string;
		confirmButtonClass?: string;
	}>({
		open: false,
		title: '',
		message: '',
		onConfirm: () => {},
	});

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
		setConfirmDialog({
			open: true,
			title: '⚠️ 警告',
			message:
				'此操作将清除所有数据，且无法恢复！确定要继续吗？',
			onConfirm: () => {
				setConfirmDialog({
					open: true,
					title: '再次确认',
					message: '请再次确认：真的要清除所有数据吗？',
					onConfirm: () => {
						clearAllData();
						setConfirmDialog({
							open: true,
							title: '数据已清除',
							message: '数据已清除，页面将刷新。',
							onConfirm: () => {
								window.location.reload();
							},
							confirmText: '知道了',
							cancelText: '',
						});
					},
					confirmText: '确认清除',
					cancelText: '取消',
					confirmButtonClass: 'bg-red-500 text-white',
				});
			},
			confirmText: '继续',
			cancelText: '取消',
			confirmButtonClass: 'bg-red-500 text-white',
		});
	};

	return (
		<div className="w-full">
			<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
				<div className="text-center mb-2">
					<div className="text-3xl mb-2">⚙️</div>
					<div className="text-lg font-black text-gray-800 mb-1">
						数据管理
					</div>
					<div className="text-sm text-gray-600">
						备份、恢复或清除应用数据
					</div>
				</div>
			</div>

			<div className="space-y-3">
				<button
					onClick={handleExport}
					className="w-full glass-effect rounded-2xl card-shadow p-4 border-2 border-blue-200/50 hover:border-blue-300/50 transition-all active:scale-95">
					<div className="flex items-center gap-4">
						<div className="text-4xl flex-shrink-0">
							💾
						</div>
						<div className="flex-1 text-left">
							<h4 className="font-black text-gray-800 mb-1">
								导出数据
							</h4>
							<p className="text-sm text-gray-600">
								将应用数据导出为 JSON 文件备份
							</p>
						</div>
					</div>
				</button>

				<button
					onClick={handleImport}
					className="w-full glass-effect rounded-2xl card-shadow p-4 border-2 border-green-200/50 hover:border-green-300/50 transition-all active:scale-95">
					<div className="flex items-center gap-4">
						<div className="text-4xl flex-shrink-0">
							📥
						</div>
						<div className="flex-1 text-left">
							<h4 className="font-black text-gray-800 mb-1">
								导入数据
							</h4>
							<p className="text-sm text-gray-600">
								从备份文件恢复应用数据
							</p>
						</div>
					</div>
				</button>

				<button
					onClick={handleClear}
					className="w-full glass-effect rounded-2xl card-shadow p-4 border-2 border-red-200/50 hover:border-red-300/50 transition-all active:scale-95">
					<div className="flex items-center gap-4">
						<div className="text-4xl flex-shrink-0">
							🗑️
						</div>
						<div className="flex-1 text-left">
							<h4 className="font-black text-gray-800 mb-1">
								清除数据
							</h4>
							<p className="text-sm text-red-600">
								⚠️ 清除所有数据，此操作不可恢复
							</p>
						</div>
					</div>
				</button>
			</div>

			<div className="mt-6 glass-effect rounded-2xl card-shadow p-4 border border-white/50">
				<div className="text-center">
					<div className="text-xs text-gray-500 mb-2">
						💡 提示
					</div>
					<p className="text-xs text-gray-400 leading-relaxed">
						所有数据都存储在本地浏览器中，完全离线可用。
						<br />
						建议定期导出数据备份，以防数据丢失。
					</p>
				</div>
			</div>

			<ConfirmDialog
				open={confirmDialog.open}
				title={confirmDialog.title}
				message={confirmDialog.message}
				onConfirm={confirmDialog.onConfirm}
				onCancel={() =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					})
				}
				confirmText={confirmDialog.confirmText}
				cancelText={confirmDialog.cancelText}
				confirmButtonClass={confirmDialog.confirmButtonClass}
			/>
		</div>
	);
};
