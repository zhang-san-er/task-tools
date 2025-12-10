import React, { useState, useMemo, useEffect } from 'react';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import { useTaskStore } from '../stores/taskStore';
import type { TaskRecord } from '../types/taskRecord';

export const TaskCalendar: React.FC = () => {
	const { getRecords } = useTaskRecordStore();
	const { tasks } = useTaskStore();
	const allRecords = getRecords();
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedTaskId, setSelectedTaskId] = useState<string>('all'); // 'all' 表示显示所有任务

	// 初始化时默认选中今天
	useEffect(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		setSelectedDate(today);
	}, []);

	// 获取当前月份的第一天和最后一天
	const getMonthStart = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		return new Date(year, month, 1);
	};

	const getMonthEnd = (date: Date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		return new Date(year, month + 1, 0);
	};

	// 获取日历网格的日期数组
	const calendarDays = useMemo(() => {
		const start = getMonthStart(currentMonth);
		const end = getMonthEnd(currentMonth);
		const startDay = start.getDay(); // 0 = 周日
		const daysInMonth = end.getDate();
		
		const days: (Date | null)[] = [];
		
		// 填充上个月的日期（显示为灰色）
		for (let i = 0; i < startDay; i++) {
			const date = new Date(start);
			date.setDate(date.getDate() - (startDay - i));
			days.push(date);
		}
		
		// 填充当前月的日期
		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(start);
			date.setDate(i);
			days.push(date);
		}
		
		// 填充下个月的日期，使日历网格完整（6行 x 7列 = 42天）
		const remainingDays = 42 - days.length;
		for (let i = 1; i <= remainingDays; i++) {
			const date = new Date(end);
			date.setDate(end.getDate() + i);
			days.push(date);
		}
		
		return days;
	}, [currentMonth]);

	// 根据选中的任务筛选记录
	const records = useMemo(() => {
		if (selectedTaskId === 'all') {
			return allRecords;
		}
		// 根据任务ID或任务名称筛选（兼容老数据）
		return allRecords.filter(record => {
			if (record.taskId) {
				return record.taskId === selectedTaskId;
			}
			// 老数据：通过任务名称匹配
			const task = tasks.find(t => t.id === selectedTaskId);
			return task && record.taskName === task.name;
		});
	}, [allRecords, selectedTaskId, tasks]);

	// 按日期分组记录
	const recordsByDate = useMemo(() => {
		const grouped: Record<string, TaskRecord[]> = {};
		records.forEach(record => {
			const date = new Date(record.completedAt);
			date.setHours(0, 0, 0, 0);
			const dateKey = date.toISOString().split('T')[0];
			if (!grouped[dateKey]) {
				grouped[dateKey] = [];
			}
			grouped[dateKey].push(record);
		});
		return grouped;
	}, [records]);

	// 获取某天的记录
	const getRecordsForDate = (date: Date | null): TaskRecord[] => {
		if (!date) return [];
		const dateKey = date.toISOString().split('T')[0];
		return recordsByDate[dateKey] || [];
	};

	// 获取某天的总积分
	const getTotalPointsForDate = (date: Date | null): number => {
		const dayRecords = getRecordsForDate(date);
		return dayRecords.reduce((sum, record) => sum + record.points, 0);
	};

	// 判断某天是否有记录
	const hasRecords = (date: Date | null): boolean => {
		if (!date) return false;
		const dateKey = date.toISOString().split('T')[0];
		return !!recordsByDate[dateKey];
	};

	// 判断某天是否有选中任务的记录（用于标记）
	const hasTaskRecord = (date: Date | null): boolean => {
		if (!date || selectedTaskId === 'all') return false;
		const dateKey = date.toISOString().split('T')[0];
		const dayRecords = recordsByDate[dateKey] || [];
		return dayRecords.length > 0;
	};

	// 判断是否是今天
	const isToday = (date: Date | null): boolean => {
		if (!date) return false;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const compareDate = new Date(date);
		compareDate.setHours(0, 0, 0, 0);
		return today.getTime() === compareDate.getTime();
	};

	// 判断是否是当前月份
	const isCurrentMonth = (date: Date | null): boolean => {
		if (!date) return false;
		return date.getMonth() === currentMonth.getMonth() &&
			date.getFullYear() === currentMonth.getFullYear();
	};

	// 格式化日期显示
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}年${month}月${day}日`;
	};

	// 切换月份
	const changeMonth = (delta: number) => {
		setCurrentMonth(prev => {
			const newDate = new Date(prev);
			newDate.setMonth(prev.getMonth() + delta);
			return newDate;
		});
		setSelectedDate(null);
	};

	const selectedRecords = selectedDate ? getRecordsForDate(selectedDate) : [];
	const selectedTotalPoints = selectedDate ? getTotalPointsForDate(selectedDate) : 0;

	// 获取选中任务的名称
	const selectedTaskName = useMemo(() => {
		if (selectedTaskId === 'all') return '全部任务';
		const task = tasks.find(t => t.id === selectedTaskId);
		return task ? task.name : '全部任务';
	}, [selectedTaskId, tasks]);

	const [isTaskSelectOpen, setIsTaskSelectOpen] = useState(false);
	const taskSelectRef = React.useRef<HTMLDivElement>(null);

	// 点击外部关闭下拉框
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				taskSelectRef.current &&
				!taskSelectRef.current.contains(event.target as Node)
			) {
				setIsTaskSelectOpen(false);
			}
		};

		if (isTaskSelectOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isTaskSelectOpen]);

	const selectedTask = selectedTaskId === 'all' 
		? { id: 'all', name: '全部任务' }
		: tasks.find(t => t.id === selectedTaskId) || { id: 'all', name: '全部任务' };

	return (
		<div className="w-full">
			{/* 任务筛选 */}
			<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50 relative" style={{ zIndex: 100 }}>
				<label className="block text-sm font-bold text-gray-700 mb-3">
					🔍 筛选任务
				</label>
				<div ref={taskSelectRef} className="relative" style={{ zIndex: 200 }}>
					<button
						type="button"
						onClick={() => setIsTaskSelectOpen(!isTaskSelectOpen)}
						className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-sm font-semibold text-gray-800 flex items-center justify-between hover:border-purple-300 shadow-sm hover:shadow-md">
						<span className="flex items-center gap-2">
							<span className="text-purple-500">📋</span>
							<span>{selectedTask.name}</span>
						</span>
						<svg
							className={`w-5 h-5 text-gray-400 transition-transform ${
								isTaskSelectOpen ? 'rotate-180' : ''
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

					{isTaskSelectOpen && (
						<div className="absolute w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-auto" style={{ zIndex: 9999 }}>
							<button
								type="button"
								onClick={() => {
									setSelectedTaskId('all');
									setIsTaskSelectOpen(false);
								}}
								className={`w-full px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl ${
									selectedTaskId === 'all'
										? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-bold border-l-4 border-purple-500'
										: 'text-gray-700 hover:bg-gray-50'
								}`}>
								<div className="flex items-center gap-3">
									{selectedTaskId === 'all' && (
										<svg
											className="w-5 h-5 text-purple-600 flex-shrink-0"
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
									<span className="text-base">📋</span>
									<span className="flex-1">全部任务</span>
								</div>
							</button>
							{tasks.map(task => (
								<button
									key={task.id}
									type="button"
									onClick={() => {
										setSelectedTaskId(task.id);
										setIsTaskSelectOpen(false);
									}}
									className={`w-full px-4 py-3 text-left text-sm transition-colors last:rounded-b-xl ${
										selectedTaskId === task.id
											? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-bold border-l-4 border-purple-500'
											: 'text-gray-700 hover:bg-gray-50'
									}`}>
									<div className="flex items-center gap-3">
										{selectedTaskId === task.id && (
											<svg
												className="w-5 h-5 text-purple-600 flex-shrink-0"
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
										<span className={`text-base ${task.type === 'demon' ? 'text-red-500' : 'text-blue-500'}`}>
											{task.type === 'demon' ? '⚡' : '⭐'}
										</span>
										<span className="flex-1">{task.name}</span>
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* 日历头部 */}
			<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
				<div className="flex items-center justify-between mb-4">
					<button
						onClick={() => changeMonth(-1)}
						className="px-3 py-2 rounded-lg bg-white/80 hover:bg-white transition-colors text-gray-700 font-semibold">
						← 上个月
					</button>
					<h3 className="text-lg font-black text-gray-800">
						{currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
					</h3>
					<button
						onClick={() => changeMonth(1)}
						className="px-3 py-2 rounded-lg bg-white/80 hover:bg-white transition-colors text-gray-700 font-semibold">
						下个月 →
					</button>
				</div>

				{/* 星期标题 */}
				<div className="grid grid-cols-7 gap-1 mb-2">
					{['日', '一', '二', '三', '四', '五', '六'].map(day => (
						<div
							key={day}
							className="text-center text-xs font-bold text-gray-600 py-2">
							{day}
						</div>
					))}
				</div>

				{/* 日历网格 */}
				<div className="grid grid-cols-7 gap-1">
					{calendarDays.map((date, index) => {
						const isCurrentMonthDay = isCurrentMonth(date);
						const isTodayDay = isToday(date);
						const hasRecordsDay = hasRecords(date);
						const hasTaskRecordDay = hasTaskRecord(date);
						const isSelected = selectedDate && date && 
							date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
						const totalPoints = date ? getTotalPointsForDate(date) : 0;

						return (
							<button
								key={index}
								onClick={() => date && setSelectedDate(date)}
								disabled={!date || !isCurrentMonthDay}
								className={`
									aspect-square p-1 rounded-lg transition-all text-xs font-semibold relative
									${!date || !isCurrentMonthDay
										? 'text-gray-300 cursor-default'
										: isSelected
										? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
										: isTodayDay
										? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
										: hasTaskRecordDay && selectedTaskId !== 'all'
										? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-400'
										: hasRecordsDay
										? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300'
										: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
									}
								`}>
								<div className="flex flex-col items-center justify-center h-full">
									<div className="text-sm font-bold">
										{date ? date.getDate() : ''}
									</div>
									{hasRecordsDay && selectedTaskId === 'all' && (
										<div className="text-[10px] mt-0.5">
											+{totalPoints.toFixed(1)}
										</div>
									)}
									{hasTaskRecordDay && selectedTaskId !== 'all' && (
										<div className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-500 rounded-full"></div>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* 选中日期的详细信息 */}
			{selectedDate && (
				<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
					<h3 className="text-lg font-black text-gray-800 mb-2">
						📅 {formatDate(selectedDate)}
					</h3>
					{selectedTaskId !== 'all' && (
						<p className="text-sm text-gray-600 mb-4">
							筛选：{selectedTaskName}
						</p>
					)}
					{selectedRecords.length === 0 ? (
						<div className="text-center py-8">
							<div className="text-4xl mb-2">📝</div>
							<p className="text-gray-500 text-sm">
								这一天没有完成记录
							</p>
						</div>
					) : (
						<>
							<div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/60">
								<div className="text-center">
									<div className="text-2xl font-black text-orange-600 mb-1">
										+{selectedTotalPoints.toFixed(1)}
									</div>
									<div className="text-xs text-gray-600">
										总积分
									</div>
								</div>
							</div>
							<div className="space-y-3">
								{selectedRecords.map(record => (
									<div
										key={record.id}
										className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/60 shadow-sm">
										<div className="flex justify-between items-start mb-2">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span
														className={`text-xs px-2 py-1 rounded-full font-semibold ${
															record.taskType ===
															'demon'
																? 'bg-red-500 text-white'
																: 'bg-blue-500 text-white'
														}`}>
														{record.taskType ===
														'demon'
															? '⚡ 付费'
															: '⭐ 主线'}
													</span>
												</div>
												<h4 className="font-bold text-gray-800 text-sm mb-1">
													{record.taskName}
												</h4>
												<p className="text-xs text-gray-500">
													{new Date(record.completedAt).toLocaleTimeString('zh-CN', {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
											</div>
											<div className="text-right">
												{record.cost &&
													record.cost > 0 && (
														<div className="text-sm font-bold text-red-600 mb-1">
															-{record.cost.toFixed(1)}
														</div>
													)}
												<div className="text-lg font-black text-orange-600">
													+{record.points.toFixed(1)}
												</div>
												<div className="text-xs text-gray-500">
													{record.cost &&
													record.cost > 0
														? '净收益'
														: '任务积分'}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};

