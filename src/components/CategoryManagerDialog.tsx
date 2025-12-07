import React, { useState } from 'react';

interface CategoryManagerDialogProps {
	open: boolean;
	categories: string[];
	categoryCounts: Record<string, number>;
	onDelete: (category: string) => void;
	onUpdate: (oldCategory: string, newCategory: string) => void;
	onClose: () => void;
}

export const CategoryManagerDialog: React.FC<CategoryManagerDialogProps> = ({
	open,
	categories,
	categoryCounts,
	onDelete,
	onUpdate,
	onClose,
}) => {
	const [editingCategory, setEditingCategory] = useState<string | null>(null);
	const [editValue, setEditValue] = useState<string>('');

	const handleStartEdit = (category: string) => {
		if (category === '默认') return; // 不允许编辑"默认"分区
		setEditingCategory(category);
		setEditValue(category || '默认');
	};

	const handleSaveEdit = () => {
		if (editingCategory && editValue.trim() && editValue.trim() !== editingCategory) {
			onUpdate(editingCategory, editValue.trim());
		}
		setEditingCategory(null);
		setEditValue('');
	};

	const handleCancelEdit = () => {
		setEditingCategory(null);
		setEditValue('');
	};

	const handleClose = () => {
		handleCancelEdit(); // 关闭时重置编辑状态
		onClose();
	};

	if (!open) return null;

	return (
		<>
			{/* 蒙层 */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
				onClick={handleClose}
			/>

			{/* 对话框 */}
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				<div
					onClick={e => e.stopPropagation()}
					className="glass-effect rounded-2xl card-shadow-lg border border-white/50 w-full max-w-sm max-h-[70vh] flex flex-col">
					{/* 固定标题 */}
					<div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-200/50">
						<h3 className="text-sm font-bold text-gray-800 text-center">
							分区管理
						</h3>
					</div>
					{/* 可滚动内容区域 */}
					<div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
						{categories.length === 0 ? (
							<p className="text-xs text-gray-500 text-center py-4">
								暂无分区
							</p>
						) : (
							<div className="space-y-1.5">
								{categories.map((category) => {
									const displayCategory = category || '默认';
									const isDefault = displayCategory === '默认';
									const isEditing = editingCategory === category;
									
									return (
										<div
											key={category || '默认'}
											className="flex items-center justify-between p-2 bg-gray-50 rounded-lg transition-colors">
											{isEditing ? (
												<div className="flex-1 flex items-center gap-1.5">
													<input
														type="text"
														value={editValue}
														onChange={(e) => setEditValue(e.target.value)}
														onKeyPress={(e) => {
															if (e.key === 'Enter') {
																handleSaveEdit();
															} else if (e.key === 'Escape') {
																handleCancelEdit();
															}
														}}
														className="flex-1 px-2 py-1 border border-blue-500 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
														autoFocus
													/>
													<button
														onClick={handleSaveEdit}
														className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs font-medium active:bg-blue-600 active:scale-95 transition-all">
														✓
													</button>
													<button
														onClick={handleCancelEdit}
														className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium active:bg-gray-300 active:scale-95 transition-all">
														✕
													</button>
												</div>
											) : (
												<>
													<span 
														onClick={() => !isDefault && handleStartEdit(category)}
														className={`font-medium text-gray-700 text-xs flex-1 ${!isDefault ? 'cursor-pointer hover:text-blue-600 active:scale-95 transition-all' : ''}`}>
														{displayCategory}
													</span>
													<div className="flex items-center gap-2">
														<span className="text-xs text-gray-400">
															{categoryCounts[category] || categoryCounts[''] || 0} 条
														</span>
														{!isDefault && (
															<>
																<button
																	onClick={() => handleStartEdit(category)}
																	className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium active:bg-blue-100 active:scale-95 transition-all">
																	编辑
																</button>
																<button
																	onClick={() => onDelete(category)}
																	className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-xs font-medium active:bg-red-100 active:scale-95 transition-all">
																	删除
																</button>
															</>
														)}
													</div>
												</>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
					{/* 固定按钮区域 */}
					<div className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-gray-200/50">
						<button
							type="button"
							onClick={handleClose}
							className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold active:bg-gray-200 active:scale-95 transition-all">
							关闭
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

