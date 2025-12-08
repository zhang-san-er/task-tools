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
	// 阻止背景滚动
	React.useEffect(() => {
		if (!open) return;
		
		// 保存当前滚动位置
		const scrollY = window.scrollY;
		// 锁定背景滚动
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = '100%';
		
		return () => {
			// 恢复背景滚动
			document.body.style.overflow = '';
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			// 恢复滚动位置
			window.scrollTo(0, scrollY);
		};
	}, [open]);

	if (!open) return null;

	const handleOverlayTouchMove = (e: React.TouchEvent) => {
		// 只阻止在蒙层上的滑动，允许弹窗内容区域滑动
		const target = e.target as HTMLElement;
		if (target.classList.contains('dialog-overlay')) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	return (
		<>
			{/* 蒙层 */}
			<div
				className="dialog-overlay fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-[100] overflow-hidden"
				style={{
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					width: '100%',
					height: '100%',
					paddingBottom: 'env(safe-area-inset-bottom)',
					paddingTop: 'env(safe-area-inset-top)',
				}}
				onClick={onCancel}
				onTouchMove={handleOverlayTouchMove}
			/>

			{/* 对话框 */}
			<div 
				className="fixed inset-0 z-[100] flex items-center justify-center p-4"
				style={{
					paddingTop: 'env(safe-area-inset-top)',
					paddingBottom: 'env(safe-area-inset-bottom)',
				}}
			>
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

