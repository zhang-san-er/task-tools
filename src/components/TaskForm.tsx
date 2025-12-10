import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import type { Task, TaskFormData, TaskType } from '../types/task';
import { getTomorrowStart } from '../utils/dateUtils';

interface TaskFormProps {
	onClose: () => void;
	task?: Task; // 编辑模式时传入任务数据
}

export const TaskForm: React.FC<TaskFormProps> = ({
	onClose,
	task,
}) => {
	// 阻止背景滚动
	useEffect(() => {
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
	}, []);
	const { addTask, updateTask } = useTaskStore();
	const isEditMode = !!task;
	const [formData, setFormData] = useState<TaskFormData>({
		name: task?.name || '',
		type: task?.type || 'main',
		points: task?.points || 0,
		entryCost: task?.entryCost || 0,
		isRepeatable:
			task?.isRepeatable !== undefined
				? task.isRepeatable
				: true,
		expiresAt: task?.expiresAt
			? typeof task.expiresAt === 'string'
				? new Date(task.expiresAt)
				: task.expiresAt instanceof Date
				? task.expiresAt
				: new Date(task.expiresAt)
			: undefined,
		durationDays: task?.durationDays,
		dailyLimit:
			task?.dailyLimit !== undefined
				? task.dailyLimit
				: undefined,
		exceedDaysRewardFormula: task?.exceedDaysRewardFormula || '',
	});
	const [timeLimitType, setTimeLimitType] = useState<
		'none' | 'expiresAt' | 'durationDays'
	>(
		task?.expiresAt
			? 'expiresAt'
			: task?.durationDays
			? 'durationDays'
			: 'none'
	);
	const [durationDaysInput, setDurationDaysInput] = useState(
		task?.durationDays?.toString() || ''
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			alert('请输入任务名称');
			return;
		}

		if (!formData.points || formData.points < 0.1) {
			alert('请输入有效的奖励积分（至少为0.1）');
			return;
		}

		// 校验每日完成次数限制（如果填写了，必须大于0）
		if (
			formData.dailyLimit !== undefined &&
			formData.dailyLimit !== null &&
			formData.dailyLimit < 1
		) {
			alert('每日完成次数限制必须大于0');
			return;
		}

		const submitData: TaskFormData = {
			...formData,
			expiresAt:
				timeLimitType === 'expiresAt'
					? formData.expiresAt
					: undefined,
			durationDays:
				timeLimitType === 'durationDays'
					? formData.durationDays
					: undefined,
		};

		if (isEditMode && task) {
			updateTask(task.id, submitData);
		} else {
			addTask(submitData);
		}

		// 重置表单
		setFormData({
			name: '',
			type: 'main',
			points: 0,
			entryCost: 0,
			isRepeatable: true,
			expiresAt: undefined,
			durationDays: undefined,
			dailyLimit: undefined,
			exceedDaysRewardFormula: '',
		});
		setTimeLimitType('none');
		setDurationDaysInput('');
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

	const handleOverlayWheel = (e: React.WheelEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

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
				onClick={onClose}
				onWheel={handleOverlayWheel}
				onTouchMove={handleOverlayTouchMove}
			/>

			{/* 弹窗 */}
			<div 
				className="fixed inset-0 z-[100] flex items-center justify-center p-4"
				style={{
					paddingTop: 'env(safe-area-inset-top)',
					paddingBottom: 'env(safe-area-inset-bottom)',
				}}
			>
				<form
					onSubmit={handleSubmit}
					onClick={e => e.stopPropagation()}
					className="glass-effect rounded-2xl card-shadow-lg border border-white/50 w-full max-w-md max-h-[80vh] flex flex-col">
					{/* 固定标题 */}
					<div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200/50">
						<h3 className="text-lg font-black text-gray-800 flex items-center justify-center gap-2 text-center">
							<span>✨</span>
							<span>
								{isEditMode
									? '编辑任务'
									: '创建新任务'}
							</span>
						</h3>
					</div>

					{/* 可滚动内容区域 */}
					<div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
						<div className="space-y-4">
							<div>
								<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
									任务名称
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
									任务类型
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
												formData.type ===
												'main'
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
												普通任务
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
												formData.type ===
												'demon'
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
												⚡
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
									step="0.1"
									min="0.1"
									max="1000"
									value={formData.points || ''}
									onChange={e => {
										const value = e.target.value;
										setFormData({
											...formData,
											points:
												value === ''
													? 0
													: parseFloat(
															value
													  ) || 0,
										});
									}}
									className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
								/>
								<p className="text-xs text-gray-500 mt-2 font-medium">
									✨ 完成任务可获得此积分奖励（支持0.1积分级别）
								</p>
							</div>

							{formData.type === 'demon' && (
								<div>
									<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
										入场积分
									</label>
									<input
										type="number"
										step="0.1"
										min="0"
										max="10000"
										value={
											formData.entryCost || 0
										}
										onChange={e =>
											setFormData({
												...formData,
												entryCost:
													parseFloat(
														e.target.value
													) || 0,
											})
										}
										className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
									/>
									<p className="text-xs text-gray-500 mt-2 font-medium">
										⚠️
										付费挑战需要支付入场积分才能开始，失败时入场积分将被扣除（支持0.1积分级别）
									</p>
								</div>
							)}

							<div>
								<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
									任务类型
								</label>
								<div className="grid grid-cols-2 gap-3 mb-4">
									<label
										className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${
											formData.isRepeatable !==
											false
												? 'border-purple-400 bg-purple-50'
												: 'border-gray-200 bg-white'
										}`}>
										<input
											type="radio"
											name="taskPeriod"
											checked={
												formData.isRepeatable !==
												false
											}
											onChange={() =>
												setFormData({
													...formData,
													isRepeatable:
														true,
												})
											}
											className="sr-only"
										/>
										<div className="text-center">
											<div className="text-2xl mb-1">
												🔄
											</div>
											<div className="text-sm font-bold text-gray-700">
												周期任务
											</div>
											<div className="text-xs text-gray-500 mt-1">
												周期性执行
											</div>
										</div>
									</label>
									<label
										className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${
											formData.isRepeatable ===
											false
												? 'border-purple-400 bg-purple-50'
												: 'border-gray-200 bg-white'
										}`}>
										<input
											type="radio"
											name="taskPeriod"
											checked={
												formData.isRepeatable ===
												false
											}
											onChange={() =>
												setFormData({
													...formData,
													isRepeatable:
														false,
													expiresAt:
														undefined, // 非周期任务不设置截止时间
												})
											}
											className="sr-only"
										/>
										<div className="text-center">
											<div className="text-2xl mb-1">
												✓
											</div>
											<div className="text-sm font-bold text-gray-700">
												一次性任务
											</div>
											<div className="text-xs text-gray-500 mt-1">
												完成后不再出现
											</div>
										</div>
									</label>
								</div>
								{formData.isRepeatable !== false && (
									<div>
										<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
											时间限制（可选）
										</label>
										<div className="space-y-3">
											<label className="flex items-center cursor-pointer">
												<input
													type="radio"
													name="timeLimit"
													checked={
														timeLimitType ===
														'none'
													}
													onChange={() => {
														setTimeLimitType(
															'none'
														);
														setFormData({
															...formData,
															expiresAt:
																undefined,
															durationDays:
																undefined,
														});
														setDurationDaysInput(
															''
														);
													}}
													className="w-5 h-5 border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-200"
												/>
												<span className="ml-2 text-sm font-semibold text-gray-700">
													无时间限制
												</span>
											</label>
											<label className="flex items-center cursor-pointer">
												<input
													type="radio"
													name="timeLimit"
													checked={
														timeLimitType ===
														'expiresAt'
													}
													onChange={() => {
														setTimeLimitType(
															'expiresAt'
														);
														setFormData({
															...formData,
															durationDays:
																undefined,
														});
														setDurationDaysInput(
															''
														);
													}}
													className="w-5 h-5 border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-200"
												/>
												<span className="ml-2 text-sm font-semibold text-gray-700">
													⏰ 设置截止日期
												</span>
											</label>
											{timeLimitType ===
												'expiresAt' && (
												<input
													type="date"
													min={getMinDate()}
													value={
														formData.expiresAt
															? (() => {
																	const date =
																		formData.expiresAt instanceof
																		Date
																			? formData.expiresAt
																			: typeof formData.expiresAt ===
																			  'string'
																			? new Date(
																					formData.expiresAt
																			  )
																			: new Date(
																					formData.expiresAt
																			  );
																	return date
																		.toISOString()
																		.split(
																			'T'
																		)[0];
															  })()
															: ''
													}
													onChange={
														handleDateChange
													}
													className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all ml-7"
												/>
											)}
											<label className="flex items-center cursor-pointer">
												<input
													type="radio"
													name="timeLimit"
													checked={
														timeLimitType ===
														'durationDays'
													}
													onChange={() => {
														setTimeLimitType(
															'durationDays'
														);
														setFormData({
															...formData,
															expiresAt:
																undefined,
														});
													}}
													className="w-5 h-5 border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-200"
												/>
												<span className="ml-2 text-sm font-semibold text-gray-700">
													📅
													设置持续天数（从领取时开始计算）
												</span>
											</label>
											{timeLimitType ===
												'durationDays' && (
												<div className="ml-7">
													<input
														type="number"
														min="1"
														max="365"
														value={
															durationDaysInput
														}
														onChange={e => {
															const value =
																e
																	.target
																	.value;
															setDurationDaysInput(
																value
															);
															const days =
																parseInt(
																	value
																) ||
																undefined;
															setFormData(
																{
																	...formData,
																	durationDays:
																		days,
																}
															);
														}}
														className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
														placeholder="请输入天数"
													/>
													<p className="text-xs text-gray-500 mt-2 font-medium">
														📅
														任务被领取后，将从领取时开始计算截止日期
													</p>
													{/* 超越天数奖励设置 */}
													<div className="mt-4">
														<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
															🎁 超越天数奖励（可选）
														</label>
														<input
															type="text"
															value={formData.exceedDaysRewardFormula || ''}
															onChange={e =>
																setFormData({
																	...formData,
																	exceedDaysRewardFormula: e.target.value,
																})
															}
															className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
															placeholder="例如：2n+10（n为超越天数）"
														/>
														<p className="text-xs text-gray-500 mt-2 font-medium">
															✨ 设置奖励公式，当任务超过截止日期完成时，可获得额外积分奖励。公式中 n 代表超越天数，例如：2n+10 表示超越1天奖励12积分，超越2天奖励14积分
														</p>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
								{formData.isRepeatable !== false && (
									<div>
										<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
											每日完成次数限制
										</label>
										<input
											type="number"
											min="1"
											max="100"
											value={
												formData.dailyLimit !==
												undefined
													? formData.dailyLimit
													: ''
											}
											onChange={e => {
												const value =
													e.target.value;
												setFormData({
													...formData,
													dailyLimit:
														value === ''
															? undefined
															: parseInt(
																	value
															  ) ||
															  undefined,
												});
											}}
											className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
											placeholder="请输入次数（可选，默认1次）"
										/>
										<p className="text-xs text-gray-500 mt-2 font-medium">
											📊
											设置该任务每天最多可以完成的次数，留空则默认为1次
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* 固定按钮区域 */}
					<div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-200/50">
						<div className="flex gap-3">
							<button
								type="submit"
								className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
								{isEditMode
									? '✨ 保存修改'
									: '✨ 创建任务'}
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
