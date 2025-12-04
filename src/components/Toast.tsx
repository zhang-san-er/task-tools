import React, { useEffect } from 'react';

interface ToastProps {
	message: string;
	type: 'success' | 'error' | 'info';
	onClose: () => void;
	duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
	message,
	type,
	onClose,
	duration = 3000,
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const getIcon = () => {
		switch (type) {
			case 'success':
				return '✅';
			case 'error':
				return '❌';
			case 'info':
				return 'ℹ️';
			default:
				return 'ℹ️';
		}
	};

	const getBgColor = () => {
		switch (type) {
			case 'success':
				return 'bg-green-500';
			case 'error':
				return 'bg-red-500';
			case 'info':
				return 'bg-blue-500';
			default:
				return 'bg-blue-500';
		}
	};

	return (
		<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] animate-slide-down">
			<div
				className={`${getBgColor()} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[280px] max-w-[90vw]`}>
				<span className="text-lg flex-shrink-0">
					{getIcon()}
				</span>
				<p className="flex-1 text-sm font-medium whitespace-pre-line">
					{message}
				</p>
				<button
					onClick={onClose}
					className="text-white/80 hover:text-white flex-shrink-0">
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};
