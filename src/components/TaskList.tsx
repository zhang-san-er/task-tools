import React, { useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import type { TaskType } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

export const TaskList: React.FC = () => {
	const { tasks, getTasksByType } = useTaskStore();
	const [filter, setFilter] = useState<'all' | TaskType>('all');
	const [showForm, setShowForm] = useState(false);

	const filteredTasks =
		filter === 'all' ? tasks : getTasksByType(filter);

	const mainTasks = getTasksByType('main');
	const demonTasks = getTasksByType('demon');

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-black text-gray-800">
					📋 悬赏大厅
				</h2>
				<button
					onClick={() => setShowForm(true)}
					className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">
					✨ 新建
				</button>
			</div>

			{showForm && (
				<TaskForm onClose={() => setShowForm(false)} />
			)}

			<div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
				<button
					onClick={() => setFilter('all')}
					className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all shadow-sm active:scale-95 ${
						filter === 'all'
							? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
							: 'bg-white/80 text-gray-600 shadow-sm'
					}`}>
					全部 ({tasks.length})
				</button>
				<button
					onClick={() => setFilter('main')}
					className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all shadow-sm active:scale-95 ${
						filter === 'main'
							? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200'
							: 'bg-white/80 text-gray-600 shadow-sm'
					}`}>
					⭐ 主线悬赏 ({mainTasks.length})
				</button>
				<button
					onClick={() => setFilter('demon')}
					className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold text-sm transition-all shadow-sm active:scale-95 ${
						filter === 'demon'
							? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-200'
							: 'bg-white/80 text-gray-600 shadow-sm'
					}`}>
					💰 付费挑战 ({demonTasks.length})
				</button>
			</div>

			{filteredTasks.length === 0 ? (
				<div className="text-center py-16">
					<div className="text-6xl mb-4">🎯</div>
					<p className="text-lg font-bold text-gray-600 mb-2">
						还没有悬赏
					</p>
					<p className="text-sm text-gray-400">
						点击右上角"新建"发布你的第一个悬赏
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
