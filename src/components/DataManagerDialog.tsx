import React, { useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import type { Idea } from '../types/idea';

interface DataManagerDialogProps {
	open: boolean;
	onClose: () => void;
	ideas: Idea[];
	categories: string[];
	onImport: (data: { ideas: Idea[]; categories: string[] }) => void;
	onClear: () => void;
}

export const DataManagerDialog: React.FC<DataManagerDialogProps> = ({
	open,
	onClose,
	ideas,
	categories,
	onImport,
	onClear,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [showImportConfirm, setShowImportConfirm] = useState(false);
	const [importError, setImportError] = useState<string | null>(null);
	const [pendingImportData, setPendingImportData] = useState<{ ideas: Idea[]; categories: string[] } | null>(null);

	if (!open) return null;

	// 导出数据
	const handleExport = () => {
		try {
			const data = {
				ideas: ideas.map(idea => ({
					...idea,
					createdAt: idea.createdAt instanceof Date 
						? idea.createdAt.toISOString() 
						: idea.createdAt,
					updatedAt: idea.updatedAt 
						? (idea.updatedAt instanceof Date 
							? idea.updatedAt.toISOString() 
							: idea.updatedAt)
						: undefined,
				})),
				categories,
				exportDate: new Date().toISOString(),
			};
			const jsonStr = JSON.stringify(data, null, 2);
			const blob = new Blob([jsonStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			const today = new Date();
			const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
			a.download = `想法记录_${dateStr}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('导出数据失败:', error);
			alert('导出数据失败，请重试');
		}
	};

	// 处理文件选择
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setImportError(null);
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target?.result as string;
				const data = JSON.parse(text);

				// 验证数据格式
				if (!data.ideas || !Array.isArray(data.ideas)) {
					throw new Error('数据格式错误：缺少 ideas 数组');
				}

				// 转换日期字符串为 Date 对象
				const importedIdeas: Idea[] = data.ideas.map((idea: any) => ({
					...idea,
					createdAt: idea.createdAt 
						? (typeof idea.createdAt === 'string' 
							? new Date(idea.createdAt) 
							: new Date(idea.createdAt))
						: new Date(),
					updatedAt: idea.updatedAt 
						? (typeof idea.updatedAt === 'string' 
							? new Date(idea.updatedAt) 
							: new Date(idea.updatedAt))
						: undefined,
				}));

				const importedCategories = data.categories || [];

				// 保存待导入的数据，显示确认对话框
				setPendingImportData({
					ideas: importedIdeas,
					categories: importedCategories,
				});
				setShowImportConfirm(true);

				// 重置文件输入
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
			} catch (error) {
				console.error('导入数据失败:', error);
				setImportError(error instanceof Error ? error.message : '导入数据失败，请检查文件格式');
			}
		};

		reader.onerror = () => {
			setImportError('读取文件失败');
		};

		reader.readAsText(file);
	};

	// 触发文件选择
	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			{/* 蒙层 */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
				onClick={onClose}
			/>

			{/* 对话框 */}
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				<div
					onClick={e => e.stopPropagation()}
					className="glass-effect rounded-2xl card-shadow-lg border border-white/50 w-full max-w-md max-h-[80vh] flex flex-col">
					{/* 固定标题 */}
					<div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200/50">
						<h3 className="text-lg font-black text-gray-800 text-center">
							💾 数据管理
						</h3>
					</div>

					{/* 可滚动内容区域 */}
					<div className="flex-1 overflow-y-auto px-6 py-4">
						<div className="space-y-4">
							{/* 数据统计 */}
							<div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
								<div className="text-sm text-gray-600 space-y-1">
									<div className="flex justify-between">
										<span>想法记录：</span>
										<span className="font-semibold text-gray-800">{ideas.length} 条</span>
									</div>
									<div className="flex justify-between">
										<span>分区数量：</span>
										<span className="font-semibold text-gray-800">{categories.length} 个</span>
									</div>
								</div>
							</div>

							{/* 导入错误提示 */}
							{importError && (
								<div className="bg-red-50 border border-red-200 rounded-lg p-3">
									<p className="text-sm text-red-600">{importError}</p>
								</div>
							)}

							{/* 操作按钮 */}
							<div className="space-y-2">
								<button
									onClick={handleExport}
									className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									导出数据
								</button>

								<button
									onClick={handleImportClick}
									className="w-full px-4 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
									导入数据
								</button>

								<button
									onClick={() => setShowClearConfirm(true)}
									className="w-full px-4 py-3 bg-white border-2 border-red-500 text-red-600 rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									清除数据
								</button>
							</div>

							{/* 提示信息 */}
							<div className="text-xs text-gray-500 space-y-1 pt-2">
								<p>• 导出：将当前数据保存为 JSON 文件</p>
								<p>• 导入：从 JSON 文件恢复数据（会覆盖现有数据）</p>
								<p>• 清除：删除所有本地数据（建议先导出备份）</p>
							</div>
						</div>
					</div>

					{/* 固定按钮区域 */}
					<div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-200/50">
						<button
							type="button"
							onClick={onClose}
							className="w-full px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all">
							关闭
						</button>
					</div>
				</div>
			</div>

			{/* 隐藏的文件输入 */}
			<input
				ref={fileInputRef}
				type="file"
				accept=".json"
				onChange={handleFileSelect}
				className="hidden"
			/>

			{/* 导入数据确认对话框 */}
			<ConfirmDialog
				open={showImportConfirm}
				title="确认导入数据"
				message={`确定要导入数据吗？这将覆盖现有的 ${ideas.length} 条想法记录和 ${categories.length} 个分区。导入后将包含 ${pendingImportData?.ideas.length || 0} 条想法记录和 ${pendingImportData?.categories.length || 0} 个分区。`}
				onConfirm={() => {
					if (pendingImportData) {
						onImport(pendingImportData);
						setPendingImportData(null);
						setShowImportConfirm(false);
						onClose();
					}
				}}
				onCancel={() => {
					setPendingImportData(null);
					setShowImportConfirm(false);
				}}
				confirmText="导入"
				cancelText="取消"
				confirmButtonClass="bg-blue-500 text-white"
			/>

			{/* 清除数据确认对话框 */}
			<ConfirmDialog
				open={showClearConfirm}
				title="确认清除所有数据"
				message="确定要清除所有想法记录吗？此操作无法撤销，建议先导出数据备份。"
				onConfirm={() => {
					onClear();
					setShowClearConfirm(false);
					onClose();
				}}
				onCancel={() => setShowClearConfirm(false)}
				confirmText="清除"
				cancelText="取消"
				confirmButtonClass="bg-red-500 text-white"
			/>
		</>
	);
};

