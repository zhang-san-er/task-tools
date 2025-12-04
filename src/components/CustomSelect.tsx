import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
	value: string;
	onChange: (value: string) => void;
	options: string[];
	className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
	value,
	onChange,
	options,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const selectedOption = options.find((opt) => opt === value) || options[0];

	return (
		<div ref={selectRef} className={`relative ${className}`}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium transition-all text-left flex items-center justify-between">
				<span>{selectedOption}</span>
				<svg
					className={`w-4 h-4 text-gray-400 transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{isOpen && (
				<div className="absolute z-50 w-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
					{options.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => {
								onChange(option);
								setIsOpen(false);
							}}
							className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
								option === value
									? 'bg-blue-50 text-blue-700 font-semibold'
									: 'text-gray-700 hover:bg-gray-50'
							}`}>
							<div className="flex items-center gap-2">
								{option === value && (
									<svg
										className="w-4 h-4 text-blue-600 flex-shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								)}
								<span className="flex-1">{option}</span>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

