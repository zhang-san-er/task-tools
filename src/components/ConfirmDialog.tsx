import React from 'react';

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmText?: string;
	cancelText?: string;
	confirmButtonClass?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = '确认',
	cancelText = '取消',
	confirmButtonClass = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
}) => {
	if (!open) return null;

	return (
		<>
			{/* 蒙层 */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
				onClick={onCancel}
			/>

			{/* 对话框 */}
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				<div
					onClick={e => e.stopPropagation()}
					className="glass-effect rounded-2xl card-shadow-lg border border-white/50 w-full max-w-md max-h-[80vh] flex flex-col">
					{/* 固定标题 */}
					<div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200/50">
						<h3 className="text-lg font-black text-gray-800 text-center">
							{title}
						</h3>
					</div>
					{/* 可滚动内容区域 */}
					<div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
						<p className="text-sm text-gray-600 whitespace-pre-line">
							{message}
						</p>
					</div>
					{/* 固定按钮区域 */}
					<div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-200/50">
						<div className={`flex gap-3 ${!cancelText ? 'justify-center' : ''}`}>
							{cancelText && (
								<button
									type="button"
									onClick={onCancel}
									className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all">
									{cancelText}
								</button>
							)}
							<button
								type="button"
								onClick={onConfirm}
								className={`${cancelText ? 'flex-1' : 'px-8'} py-2.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all ${confirmButtonClass}`}>
								{confirmText}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

