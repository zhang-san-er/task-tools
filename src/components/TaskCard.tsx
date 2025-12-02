import React from 'react';
import type { Task } from '../types/task';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import { formatDate, isExpired } from '../utils/dateUtils';

interface TaskCardProps {
	task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
	const { toggleTaskCompletion, deleteTask, startTask } =
		useTaskStore();
	const {
		handleTaskStart,
		handleTaskCompletion,
		totalPoints,
	} = useUserStore();
	const { addRecord } = useTaskRecordStore();

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

	const handleToggle = () => {
		if (!task.isCompleted) {
			// 如果是付费挑战且未开始，需要先支付入场费
			if (task.type === 'demon' && !task.isStarted) {
				const entryCost = task.entryCost || 0;
				if (entryCost > 0) {
					if (totalPoints < entryCost) {
						alert(
							`积分不足！需要 ${entryCost} 积分入场，当前只有 ${totalPoints} 积分。`
						);
						return;
					}

					if (
						!confirm(
							`确定要支付 ${entryCost} 积分开始这个付费挑战吗？\n\n⚠️ 如果失败，入场积分将被扣除！`
						)
					) {
						return;
					}

					// 支付入场费
					if (handleTaskStart(entryCost)) {
						startTask(task.id);
					} else {
						alert('积分不足，无法开始挑战！');
						return;
					}
				}
			}

			// 完成悬赏
			toggleTaskCompletion(task.id);
			handleTaskCompletion(
				task.id,
				task.points,
				task.type === 'demon',
				task.entryCost
			);
			// 记录完成记录
			addRecord(task.name, task.points, task.type);
		} else {
			// 取消完成（不扣除生命值，只是取消完成状态）
			toggleTaskCompletion(task.id);
			// 注意：取消完成不应该扣除积分，这里只是切换状态
		}
	};

	const handleDelete = () => {
		if (confirm('确定要删除这个悬赏吗？')) {
			deleteTask(task.id);
		}
	};

	return (
		<div
			className={`rounded-2xl p-4 mb-3 transition-all duration-300 card-shadow ${
				task.isCompleted
					? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50'
					: isTaskExpired
					? 'bg-gray-100/80 border-2 border-gray-300/50'
					: task.type === 'demon'
					? 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200/50'
					: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50'
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
					aria-label="删除悬赏">
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

			<div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50">
				<div className="text-xs text-gray-500 font-medium">
					{task.expiresAt ? (
						<span>⏳ {formatDate(task.expiresAt)}</span>
					) : (
						<span>∞ 无期限</span>
					)}
				</div>
				<div className="flex items-center gap-2 flex-wrap">
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
					<span className="text-sm font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
						+{task.points} 悬赏积分
					</span>
					<button
						onClick={handleToggle}
						disabled={
							!!(
								task.type === 'demon' &&
								!task.isStarted &&
								task.entryCost &&
								task.entryCost > 0 &&
								totalPoints < task.entryCost
							)
						}
						className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
							task.isCompleted
								? 'bg-gray-300 text-gray-600'
								: task.type === 'demon' &&
								  !task.isStarted &&
								  task.entryCost &&
								  task.entryCost > 0 &&
								  totalPoints < task.entryCost
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: task.type === 'demon'
								? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200'
								: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200'
						}`}>
						{task.isCompleted
							? '✓ 已完成'
							: task.type === 'demon' &&
							  !task.isStarted &&
							  task.entryCost &&
							  task.entryCost > 0
							? '开始挑战'
							: '完成'}
					</button>
				</div>
			</div>
		</div>
	);
};
