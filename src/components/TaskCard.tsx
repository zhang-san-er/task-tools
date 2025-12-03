import React, { useState } from 'react';
import type { Task } from '../types/task';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import { formatDate, isExpired } from '../utils/dateUtils';
import { ConfirmDialog } from './ConfirmDialog';

interface TaskCardProps {
	task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
	const { toggleTaskCompletion, deleteTask, startTask, cancelTask, claimTask, unclaimTask } =
		useTaskStore();
	const {
		handleTaskStart,
		handleTaskCompletion,
		totalPoints,
	} = useUserStore();
	const { addRecord } = useTaskRecordStore();

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

	const isTaskExpired =
		task.expiresAt &&
		isExpired(task.expiresAt) &&
		!task.isCompleted;

	const getTaskTypeLabel = () => {
		return task.type === 'demon' ? '💰 付费挑战' : '⭐ 主线悬赏';
	};

	const getTaskTypeBadgeColor = () => {
		return task.type === 'demon'
			? 'bg-red-500 text-white'
			: 'bg-blue-500 text-white';
	};

	const handleClaim = () => {
		// 如果是付费任务且有入场费，需要先支付
		if (task.type === 'demon' && task.entryCost && task.entryCost > 0) {
			if (totalPoints < task.entryCost) {
				setConfirmDialog({
					open: true,
					title: '积分不足',
					message: `需要 ${task.entryCost} 积分入场，当前只有 ${totalPoints} 积分。`,
					onConfirm: () => setConfirmDialog({ ...confirmDialog, open: false }),
					confirmText: '知道了',
					cancelText: '',
				});
				return;
			}

			setConfirmDialog({
				open: true,
				title: '确认支付',
				message: `确定要支付 ${task.entryCost} 积分领取这个付费挑战吗？\n\n⚠️ 如果失败，入场积分将被扣除！`,
				onConfirm: () => {
					if (handleTaskStart(task.entryCost!)) {
						claimTask(task.id);
						startTask(task.id); // 已支付，直接标记为已开始
						setConfirmDialog({ ...confirmDialog, open: false });
					} else {
						setConfirmDialog({
							open: true,
							title: '支付失败',
							message: '积分不足，无法领取挑战！',
							onConfirm: () => setConfirmDialog({ ...confirmDialog, open: false }),
							confirmText: '知道了',
							cancelText: '',
						});
					}
				},
				confirmText: '确认支付',
				cancelText: '取消',
				confirmButtonClass: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
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

	const handleToggle = () => {
		// 只有已领取的任务才能完成
		if (!task.isClaimed) {
			setConfirmDialog({
				open: true,
				title: '提示',
				message: '请先领取任务！',
				onConfirm: () => setConfirmDialog({ ...confirmDialog, open: false }),
				confirmText: '知道了',
				cancelText: '',
			});
			return;
		}

		if (!task.isCompleted) {
			// 完成悬赏（付费任务领取时已支付，这里直接完成）
			toggleTaskCompletion(task.id);
			handleTaskCompletion(
				task.id,
				task.points,
				task.type === 'demon',
				task.entryCost
			);
			// 记录完成记录，包含支出积分
			addRecord(task.name, task.points, task.type, task.entryCost);
			// 任务完成后自动取消领取
			unclaimTask(task.id);
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

	const handleCancel = () => {
		setConfirmDialog({
			open: true,
			title: '取消任务',
			message: '确定要取消这个任务吗？取消后可以重新开始。',
			onConfirm: () => {
				cancelTask(task.id);
				setConfirmDialog({ ...confirmDialog, open: false });
			},
			confirmText: '确认',
			cancelText: '取消',
		});
	};

	return (
		<div
			className={`rounded-3xl p-5 mb-4 transition-all duration-300 card-shadow hover:shadow-lg ${
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
						<span
							className={`text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm ${getTaskTypeBadgeColor()}`}>
							{getTaskTypeLabel()}
						</span>
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
						<div className="text-xs text-gray-500 font-medium">
							<span>⏳ {formatDate(task.expiresAt)}</span>
						</div>
					)}
					{task.type === 'demon' &&
						task.entryCost &&
						task.entryCost > 0 && (
							<span
								className={`text-xs font-bold px-2 py-1 rounded-lg ${
									task.isStarted
										? 'bg-red-100 text-red-700'
										: totalPoints >=
										  task.entryCost
										? 'bg-yellow-100 text-yellow-700'
										: 'bg-gray-100 text-gray-500'
								}`}>
								{task.isStarted
									? '✓ 已入场'
									: `入场 ${task.entryCost} 积分`}
							</span>
						)}
					{task.isRepeatable && (
						<span className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 font-semibold">
							🔄 可重复
						</span>
					)}
					<span className="text-sm font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
						+{task.points} 积分
					</span>
				</div>
				<div className="flex-shrink-0 flex flex-col gap-2">
					{!task.isClaimed ? (
						<button
							onClick={handleClaim}
							className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200/50 whitespace-nowrap">
							领取
						</button>
					) : (
						<>
							<button
								onClick={handleUnclaim}
								className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap">
								取消
							</button>
							<button
								onClick={handleToggle}
								disabled={task.isCompleted}
							className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap ${
								task.isCompleted
									? 'bg-gray-200 text-gray-400 cursor-not-allowed'
									: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50 hover:shadow-purple-300/50'
							}`}>
								{task.isCompleted ? '已完成' : '完成'}
							</button>
						</>
					)}
				</div>
			</div>

			<ConfirmDialog
				open={confirmDialog.open}
				title={confirmDialog.title}
				message={confirmDialog.message}
				onConfirm={confirmDialog.onConfirm}
				onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
				confirmText={confirmDialog.confirmText}
				cancelText={confirmDialog.cancelText}
				confirmButtonClass={confirmDialog.confirmButtonClass}
			/>
		</div>
	);
};
