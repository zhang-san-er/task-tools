import React, { useState, useEffect } from 'react';
import type { Task } from '../types/task';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import {
	formatDate,
	isExpired,
	getDaysRemaining,
} from '../utils/dateUtils';
import {
	calculateExceedDays,
	calculateExceedDaysReward,
} from '../utils/rewardCalculator';
import { ConfirmDialog } from './ConfirmDialog';
import { TaskForm } from './TaskForm';

interface TaskCardProps {
	task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
	const {
		toggleTaskCompletion,
		deleteTask,
		startTask,
		claimTask,
		unclaimTask,
	} = useTaskStore();
	const { handleTaskStart, handleTaskCompletion, totalPoints } =
		useUserStore();
	const { addRecord, getRecordsByDate } = useTaskRecordStore();

	const [isEditing, setIsEditing] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新日期显示
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

	// 使用 Page Visibility API 实现每日刷新
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				// 页面变为可见时，刷新日期状态
				setRefreshKey(prev => prev + 1);
			}
		};

		document.addEventListener(
			'visibilitychange',
			handleVisibilityChange
		);

		return () => {
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange
			);
		};
	}, []);

	const isTaskExpired =
		task.expiresAt &&
		isExpired(task.expiresAt) &&
		!task.isCompleted;

	// 计算超越天数奖励
	const exceedDays = calculateExceedDays(
		task.expiresAt,
		task.claimedAt,
		task.durationDays
	);
	const exceedReward = calculateExceedDaysReward(
		task.exceedDaysRewardFormula,
		exceedDays
	);

	// 检查今日完成次数
	const getTodayCompletedCount = () => {
		const today = new Date();
		const todayRecords = getRecordsByDate(today);
		return todayRecords.filter(
			record =>
				// 新数据：使用 taskId 匹配
				(record.taskId && record.taskId === task.id) ||
				// 老数据：使用 taskName 匹配（兼容性）
				(!record.taskId && record.taskName === task.name)
		).length;
	};

	const todayCompletedCount = getTodayCompletedCount();
	const dailyLimit =
		task.dailyLimit !== undefined ? task.dailyLimit : 1;
	const isDailyLimitReached = todayCompletedCount >= dailyLimit;

	const getTaskTypeLabel = () => {
		return task.type === 'demon' ? '⚡ 付费挑战' : '⭐ 普通任务';
	};

	const getTaskTypeBadgeColor = () => {
		return task.type === 'demon'
			? 'bg-red-500 text-white'
			: 'bg-blue-500 text-white';
	};

	const handleClaim = () => {
		// 如果是付费任务且有入场费，需要先支付
		if (
			task.type === 'demon' &&
			task.entryCost &&
			task.entryCost > 0
		) {
			const newTotalPoints = totalPoints - task.entryCost;
			const pointsMessage =
				newTotalPoints < 0
					? `\n\n⚠️ 支付后积分将变为 ${newTotalPoints}（负分，超前消费）`
					: `\n\n支付后剩余积分：${newTotalPoints}`;

			setConfirmDialog({
				open: true,
				title: '确认支付',
				message: `确定要支付 ${task.entryCost?.toFixed(
					1
				)} 积分领取这个付费挑战吗？${pointsMessage}\n\n⚠️ 如果失败，入场积分将被扣除！`,
				onConfirm: () => {
					if (handleTaskStart(task.entryCost!)) {
						claimTask(task.id);
						startTask(task.id); // 已支付，直接标记为已开始
						setConfirmDialog({
							...confirmDialog,
							open: false,
						});
					} else {
						setConfirmDialog({
							open: true,
							title: '支付失败',
							message: '支付失败！',
							onConfirm: () =>
								setConfirmDialog({
									...confirmDialog,
									open: false,
								}),
							confirmText: '知道了',
							cancelText: '',
						});
					}
				},
				confirmText: '确认支付',
				cancelText: '取消',
				confirmButtonClass:
					'bg-gradient-to-r from-red-500 to-rose-600 text-white',
			});
		} else {
			// 免费任务直接领取
			claimTask(task.id);
		}
	};

	const handleUnclaim = () => {
		setConfirmDialog({
			open: true,
			title: '取消领取',
			message: '确定要取消领取这个任务吗？',
			onConfirm: () => {
				unclaimTask(task.id);
				setConfirmDialog({ ...confirmDialog, open: false });
			},
			confirmText: '确认',
			cancelText: '取消',
		});
	};

	const hasTimeLimit = !!(task.expiresAt || task.durationDays);

	const handleToggle = () => {
		// 检查每日完成次数限制
		if (isDailyLimitReached && !task.isCompleted) {
			setConfirmDialog({
				open: true,
				title: '已达到每日完成次数限制',
				message: `该任务今天已完成 ${todayCompletedCount}/${dailyLimit} 次，已达到每日完成次数限制。`,
				onConfirm: () =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					}),
				confirmText: '知道了',
				cancelText: '',
			});
			return;
		}

		// 如果有时间限制（截止日期或持续天数），需要先领取
		if (hasTimeLimit && !task.isClaimed) {
			setConfirmDialog({
				open: true,
				title: '提示',
				message: '请先领取任务！',
				onConfirm: () =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					}),
				confirmText: '知道了',
				cancelText: '',
			});
			return;
		}

		// 付费任务需要先领取
		if (task.type === 'demon' && !task.isClaimed) {
			setConfirmDialog({
				open: true,
				title: '提示',
				message: '请先领取任务！',
				onConfirm: () =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					}),
				confirmText: '知道了',
				cancelText: '',
			});
			return;
		}

		// 非付费任务且没有时间限制，直接完成，需要确认
		if (task.type === 'main' && !hasTimeLimit) {
			if (!task.isCompleted) {
				const totalPoints = task.points + exceedReward;
				const rewardText =
					exceedReward > 0
						? `\n\n基础积分：${task.points.toFixed(
								1
						  )}\n超越天数奖励：+${exceedReward.toFixed(
								1
						  )} 积分\n总计：${totalPoints.toFixed(
								1
						  )} 积分`
						: `\n\n完成后将获得 ${task.points.toFixed(
								1
						  )} 积分。`;
				setConfirmDialog({
					open: true,
					title: '确认完成',
					message: `确定要完成「${task.name}」吗？${rewardText}`,
					onConfirm: () => {
						toggleTaskCompletion(task.id);
						handleTaskCompletion(
							task.id,
							task.points,
							false,
							undefined
						);
						// 如果有超越天数奖励，额外添加奖励积分
						if (exceedReward > 0) {
							handleTaskCompletion(
								task.id,
								exceedReward,
								false,
								undefined
							);
						}
						addRecord(
							task.id,
							task.name,
							totalPoints,
							task.type,
							undefined
						);
						setConfirmDialog({
							...confirmDialog,
							open: false,
						});
					},
					confirmText: '确认完成',
					cancelText: '取消',
					confirmButtonClass:
						'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
				});
			} else {
				// 取消完成（不扣除积分，只是取消完成状态）
				toggleTaskCompletion(task.id);
			}
			return;
		}

		// 有时间限制或付费任务，需要先领取才能完成
		if (!task.isCompleted) {
			const totalPoints = task.points + exceedReward;
			const rewardText =
				exceedReward > 0
					? `\n\n基础积分：${task.points.toFixed(
							1
					  )}\n超越天数奖励：+${exceedReward.toFixed(
							1
					  )} 积分\n总计：${totalPoints.toFixed(1)} 积分`
					: `\n\n完成后将获得 ${task.points.toFixed(
							1
					  )} 积分。`;
			const entryCostText =
				task.type === 'demon' &&
				task.entryCost &&
				task.entryCost > 0
					? `\n\n⚠️ 注意：这是付费挑战，入场时已支付 ${task.entryCost} 积分。`
					: '';
			setConfirmDialog({
				open: true,
				title: '确认完成',
				message: `确定要完成「${task.name}」吗？${rewardText}${entryCostText}`,
				onConfirm: () => {
					// 完成悬赏（付费任务领取时已支付，这里直接完成）
					toggleTaskCompletion(task.id);
					handleTaskCompletion(
						task.id,
						task.points,
						task.type === 'demon',
						task.entryCost
					);
					// 如果有超越天数奖励，额外添加奖励积分
					if (exceedReward > 0) {
						handleTaskCompletion(
							task.id,
							exceedReward,
							task.type === 'demon',
							task.entryCost
						);
					}
					// 记录完成记录，包含支出积分和总积分
					addRecord(
						task.id,
						task.name,
						totalPoints,
						task.type,
						task.entryCost
					);
					// 任务完成后自动取消领取
					unclaimTask(task.id);
					setConfirmDialog({
						...confirmDialog,
						open: false,
					});
				},
				confirmText: '确认完成',
				cancelText: '取消',
				confirmButtonClass:
					'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
			});
		} else {
			// 取消完成（不扣除生命值，只是取消完成状态）
			toggleTaskCompletion(task.id);
			// 注意：取消完成不应该扣除积分，这里只是切换状态
		}
	};

	const handleDelete = () => {
		setConfirmDialog({
			open: true,
			title: '删除任务',
			message: '确定要删除这个任务吗？',
			onConfirm: () => {
				deleteTask(task.id);
				setConfirmDialog({ ...confirmDialog, open: false });
			},
			confirmText: '删除',
			cancelText: '取消',
			confirmButtonClass: 'bg-red-500 text-white',
		});
	};

	const handleCardClick = (e: React.MouseEvent) => {
		// 如果点击的是按钮或删除图标，不触发编辑
		if (
			(e.target as HTMLElement).closest('button') ||
			(e.target as HTMLElement).closest('svg')
		) {
			return;
		}
		setIsEditing(true);
	};

	return (
		<>
			{isEditing && (
				<TaskForm
					task={task}
					onClose={() => setIsEditing(false)}
				/>
			)}
			<div
				onClick={handleCardClick}
				className={`rounded-3xl p-5 mb-4 transition-all duration-300 card-shadow hover:shadow-lg cursor-pointer ${
					task.isCompleted
						? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/60'
						: isTaskExpired
						? 'bg-gray-100/90 border-2 border-gray-300/60'
						: task.type === 'demon'
						? 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200/60'
						: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60'
				}`}>
				<div className="flex justify-between items-start mb-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2 flex-wrap">
							{task.order !== undefined && (
								<span className="text-xs px-2 py-1 rounded-md font-bold shadow-sm bg-gray-200 text-gray-700 min-w-[2rem] text-center">
									#{task.order}
								</span>
							)}
							{task.isAvoidanceTask && (
								<span className="text-xs px-2.5 py-1 rounded-md font-semibold shadow-sm bg-orange-500 text-white">
									🎯 特殊挑战
								</span>
							)}
							<span
								className={`text-xs px-2.5 py-1 rounded-md font-semibold shadow-sm ${getTaskTypeBadgeColor()}`}>
								{getTaskTypeLabel()}
							</span>
							{task.isRepeatable && (
								<span className="text-xs px-2 py-1 rounded-md bg-purple-100 text-purple-700 font-semibold">
									🔄 周期任务
								</span>
							)}
							{isTaskExpired && (
								<span className="text-xs px-2.5 py-1 rounded-full bg-gray-500/80 text-white font-medium">
									⏰ 已过期
								</span>
							)}
						</div>
						<h3
							className={`text-base font-bold leading-tight ${
								task.isCompleted
									? 'line-through text-gray-400'
									: 'text-gray-800'
							}`}>
							{task.name}
						</h3>
					</div>
					<button
						onClick={handleDelete}
						className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
						aria-label="删除任务">
						<svg
							className="w-5 h-5"
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

				<div className="flex items-start justify-between mt-4 pt-3 border-t border-gray-200/50 gap-3">
					<div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
						{task.expiresAt && (
							<div
								className="text-xs text-gray-500 font-medium"
								key={refreshKey}>
								{isTaskExpired ? (
									<span className="text-gray-500">
										⏰ 已过期
									</span>
								) : (
									<span>
										⏳{' '}
										{formatDate(task.expiresAt)}
										<span className="ml-1 text-orange-600 font-bold">
											(剩余{' '}
											{getDaysRemaining(
												task.expiresAt
											)}{' '}
											天)
										</span>
									</span>
								)}
							</div>
						)}
						{task.durationDays && !task.expiresAt && (
							<div className="text-xs text-gray-500 font-medium">
								{(() => {
									// 计算预览到期日期（假设从今天开始计算）
									const previewDate = new Date();
									previewDate.setDate(
										previewDate.getDate() +
											task.durationDays
									);
									previewDate.setHours(
										23,
										59,
										59,
										999
									);
									const daysRemaining =
										getDaysRemaining(previewDate);
									// 使用 refreshKey 确保日期计算会重新执行
									return (
										<span key={refreshKey}>
											⏳{' '}
											{formatDate(previewDate)}
											<span className="ml-1 text-orange-600 font-bold">
												(剩余 {daysRemaining}{' '}
												天)
											</span>
										</span>
									);
								})()}
							</div>
						)}
						{task.type === 'demon' &&
							task.entryCost &&
							task.entryCost > 0 && (
								<span
									className={`text-xs font-bold px-2 py-1 rounded-lg ${
										task.isStarted
											? 'bg-red-100 text-red-700'
											: 'bg-yellow-100 text-yellow-700'
									}`}>
									{task.isStarted
										? '✓ 已入场'
										: `入场 ${task.entryCost} 积分`}
								</span>
							)}
						{(task.isRepeatable ||
							dailyLimit > 1 ||
							todayCompletedCount > 0) && (
							<span
								className={`text-xs px-2 py-1 rounded-lg font-semibold ${
									isDailyLimitReached
										? 'bg-gray-200 text-gray-600'
										: 'bg-indigo-100 text-indigo-700'
								}`}>
								今日已完成 {todayCompletedCount}/
								{dailyLimit} 次
							</span>
						)}
						<span className="text-sm font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
							+{task.points.toFixed(1)} 积分
						</span>
						{exceedReward > 0 && (
							<span className="text-sm font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
								🎁 +{exceedReward.toFixed(1)} 超越奖励
							</span>
						)}
					</div>
					<div className="flex-shrink-0 flex flex-col gap-1.5">
						{task.type === 'demon' || hasTimeLimit ? (
							// 付费任务或有时间限制的任务：需要领取
							!task.isClaimed ? (
								<button
									onClick={handleClaim}
									className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200/50 whitespace-nowrap">
									领取
								</button>
							) : (
								<>
									<button
										onClick={handleUnclaim}
										className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg font-bold text-xs transition-all shadow-sm active:scale-95 whitespace-nowrap">
										取消
									</button>
									<button
										onClick={handleToggle}
										disabled={
											task.isCompleted ||
											isDailyLimitReached
										}
										className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap ${
											task.isCompleted ||
											isDailyLimitReached
												? 'bg-gray-200 text-gray-400 cursor-not-allowed'
												: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50 hover:shadow-purple-300/50'
										}`}
										title={
											isDailyLimitReached
												? `今日已完成 ${todayCompletedCount}/${dailyLimit} 次`
												: ''
										}>
										{task.isCompleted
											? '已完成'
											: isDailyLimitReached
											? `已完成 ${todayCompletedCount}/${dailyLimit}`
											: '完成'}
									</button>
								</>
							)
						) : (
							// 非付费任务且没有时间限制：直接显示完成按钮
							<button
								onClick={handleToggle}
								disabled={
									task.isCompleted ||
									isDailyLimitReached
								}
								className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap ${
									task.isCompleted ||
									isDailyLimitReached
										? 'bg-gray-200 text-gray-400 cursor-not-allowed'
										: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50 hover:shadow-purple-300/50'
								}`}
								title={
									isDailyLimitReached
										? `今日已完成 ${todayCompletedCount}/${dailyLimit} 次`
										: ''
								}>
								{task.isCompleted
									? '已完成'
									: isDailyLimitReached
									? `已完成 ${todayCompletedCount}/${dailyLimit}`
									: '完成'}
							</button>
						)}
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
					confirmButtonClass={
						confirmDialog.confirmButtonClass
					}
				/>
			</div>
		</>
	);
};
