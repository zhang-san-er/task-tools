import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import type { TaskType } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

export const TaskList: React.FC = () => {
	const { tasks, getTasksByType, getActiveTasks, ensureAllTasksHaveOrder } = useTaskStore();
	
	// 确保所有任务都有序号（只在任务列表变化时检查）
	useEffect(() => {
		// 检查是否有任务没有序号
		const hasTasksWithoutOrder = tasks.some(task => task.order === undefined);
		if (hasTasksWithoutOrder) {
			ensureAllTasksHaveOrder();
		}
	}, [tasks.length, ensureAllTasksHaveOrder]); // 只在任务数量变化时检查
	const [filter, setFilter] = useState<'all' | TaskType | 'active'>(
		'all'
	);
	const [showForm, setShowForm] = useState(false);

	const activeTasks = getActiveTasks();
	const mainTasks = getTasksByType('main');
	const demonTasks = getTasksByType('demon');

	// 任务排序：先按序号排序，序号相同或没有序号的按完成状态排序
	const sortTasks = (taskList: typeof tasks) => {
		const sorted = [...taskList].sort((a, b) => {
			// 先按序号排序（序号小的在前）
			const orderA = a.order !== undefined ? a.order : Infinity;
			const orderB = b.order !== undefined ? b.order : Infinity;
			if (orderA !== orderB) {
				return orderA - orderB;
			}
			
			// 序号相同或都没有序号时，未完成的任务排在前面
			if (a.isCompleted !== b.isCompleted) {
				return a.isCompleted ? 1 : -1;
			}
			
			// 都已完成时，按完成时间升序排列（最早的在前，最新的在后）
			if (a.isCompleted && b.isCompleted) {
				const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
				const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
				if (timeA === 0 && timeB === 0) return 0;
				return timeA - timeB;
			}
			
			return 0;
		});
		
		return sorted;
	};

	const filteredTasksRaw =
		filter === 'all'
			? tasks
			: filter === 'active'
			? activeTasks
			: getTasksByType(filter);
	
	const filteredTasks = sortTasks(filteredTasksRaw);

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-black text-gray-800">
					📋 悬赏大厅
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all">
					✨ 新建
				</button>
			</div>

			{showForm && (
				<TaskForm onClose={() => setShowForm(false)} />
			)}

			<div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
				<button
					onClick={() => setFilter('all')}
					className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 ${
						filter === 'all'
							? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50'
							: 'bg-white/90 text-gray-600 shadow-sm hover:shadow-md'
					}`}>
					全部 ({tasks.length})
				</button>
				<button
					onClick={() => setFilter('active')}
					className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all shadow-sm active:scale-95 ${
						filter === 'active'
							? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200'
							: 'bg-white/80 text-gray-600 shadow-sm'
					}`}>
					🔥 进行中 ({activeTasks.length})
				</button>
				<button
					onClick={() => setFilter('main')}
					className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all shadow-sm active:scale-95 ${
						filter === 'main'
							? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200'
							: 'bg-white/80 text-gray-600 shadow-sm'
					}`}>
					⭐ 普通任务 ({mainTasks.length})
				</button>
				<button
					onClick={() => setFilter('demon')}
					className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all shadow-sm active:scale-95 ${
						filter === 'demon'
							? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-200'
							: 'bg-white/80 text-gray-600 shadow-sm'
					}`}>
					⚡ 付费挑战 ({demonTasks.length})
				</button>
			</div>

			{filteredTasks.length === 0 ? (
				<div className="text-center py-16">
					<div className="text-6xl mb-4">🎯</div>
					<p className="text-lg font-bold text-gray-600 mb-2">
						还没有任务
					</p>
					<p className="text-sm text-gray-400">
						点击右上角"新建"创建你的第一个任务
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{filteredTasks.map(task => (
						<TaskCard
							key={task.id}
							task={task}
						/>
					))}
				</div>
			)}
		</div>
	);
};
