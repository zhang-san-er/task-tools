import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import type { TaskFormData, TaskType } from '../types/task';
import { getTomorrowStart } from '../utils/dateUtils';

interface TaskFormProps {
	onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onClose }) => {
	// 阻止背景滚动
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);
	const { addTask } = useTaskStore();
	const [formData, setFormData] = useState<TaskFormData>({
		name: '',
		type: 'main',
		points: 10,
		entryCost: 0,
		expiresAt: undefined,
	});
	const [hasExpiry, setHasExpiry] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			alert('请输入悬赏名称');
			return;
		}

		addTask({
			...formData,
			expiresAt: hasExpiry ? formData.expiresAt : undefined,
		});

		// 重置表单
		setFormData({
			name: '',
			type: 'main',
			points: 10,
			entryCost: 0,
			expiresAt: undefined,
		});
		setHasExpiry(false);
		onClose();
	};

	const handleDateChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (e.target.value) {
			const date = new Date(e.target.value);
			date.setHours(23, 59, 59, 999);
			setFormData({ ...formData, expiresAt: date });
		} else {
			setFormData({ ...formData, expiresAt: undefined });
		}
	};

	const getMinDate = () => {
		const tomorrow = getTomorrowStart();
		return tomorrow.toISOString().split('T')[0];
	};

	return (
		<>
			{/* 蒙层 */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
				onClick={onClose}
			/>

			{/* 弹窗 */}
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
				<form
					onSubmit={handleSubmit}
					onClick={e => e.stopPropagation()}
					className="glass-effect rounded-2xl card-shadow-lg p-6 border border-white/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
					<h3 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
						<span>✨</span>
						<span>发布新悬赏</span>
					</h3>

					<div className="space-y-4">
						<div>
							<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
								悬赏名称
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={e =>
									setFormData({
										...formData,
										name: e.target.value,
									})
								}
								className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
								placeholder="例如：早睡、喝水、锻炼..."
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
								悬赏类型
							</label>
							<div className="grid grid-cols-2 gap-3">
								<label
									className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${
										formData.type === 'main'
											? 'border-blue-400 bg-blue-50'
											: 'border-gray-200 bg-white'
									}`}>
									<input
										type="radio"
										value="main"
										checked={
											formData.type === 'main'
										}
										onChange={e =>
											setFormData({
												...formData,
												type: e.target
													.value as TaskType,
											})
										}
										className="sr-only"
									/>
									<div className="text-center">
										<div className="text-2xl mb-1">
											⭐
										</div>
										<div className="text-sm font-bold text-gray-700">
											主线悬赏
										</div>
									</div>
								</label>
								<label
									className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${
										formData.type === 'demon'
											? 'border-red-400 bg-red-50'
											: 'border-gray-200 bg-white'
									}`}>
									<input
										type="radio"
										value="demon"
										checked={
											formData.type === 'demon'
										}
										onChange={e =>
											setFormData({
												...formData,
												type: e.target
													.value as TaskType,
											})
										}
										className="sr-only"
									/>
									<div className="text-center">
										<div className="text-2xl mb-1">
											⚔️
										</div>
										<div className="text-sm font-bold text-red-600">
											付费挑战
										</div>
									</div>
								</label>
							</div>
						</div>

						<div>
							<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
								奖励积分
							</label>
							<input
								type="number"
								min="1"
								max="1000"
								value={formData.points}
								onChange={e =>
									setFormData({
										...formData,
										points:
											parseInt(
												e.target.value
											) || 10,
									})
								}
								className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
							/>
							<p className="text-xs text-gray-500 mt-2 font-medium">
								✨ 完成悬赏可获得此悬赏积分
							</p>
						</div>

						{formData.type === 'demon' && (
							<div>
								<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
									入场积分
								</label>
								<input
									type="number"
									min="0"
									max="10000"
									value={formData.entryCost || 0}
									onChange={e =>
										setFormData({
											...formData,
											entryCost:
												parseInt(
													e.target.value
												) || 0,
										})
									}
									className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
								/>
								<p className="text-xs text-gray-500 mt-2 font-medium">
									⚠️
									付费挑战需要支付入场积分才能开始，失败时入场积分将被扣除
								</p>
							</div>
						)}

						<div>
							<label className="flex items-center mb-2 cursor-pointer">
								<input
									type="checkbox"
									checked={hasExpiry}
									onChange={e => {
										setHasExpiry(
											e.target.checked
										);
										if (!e.target.checked) {
											setFormData({
												...formData,
												expiresAt: undefined,
											});
										}
									}}
									className="w-5 h-5 rounded border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-200"
								/>
								<span className="ml-2 text-sm font-semibold text-gray-700">
									⏰ 设置截止日期
								</span>
							</label>
							{hasExpiry && (
								<input
									type="date"
									min={getMinDate()}
									value={
										formData.expiresAt
											? formData.expiresAt
													.toISOString()
													.split('T')[0]
											: ''
									}
									onChange={handleDateChange}
									className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
								/>
							)}
						</div>

						<div className="flex gap-3 pt-2">
							<button
								type="submit"
								className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
								✨ 发布悬赏
							</button>
							<button
								type="button"
								onClick={onClose}
								className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all">
								取消
							</button>
						</div>
					</div>
				</form>
			</div>
		</>
	);
};
