import React, { useState, useMemo } from 'react';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import type { TaskRecord } from '../types/taskRecord';

export const TaskCalendar: React.FC = () => {
	const { getRecords } = useTaskRecordStore();
	const records = getRecords();
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [currentMonth, setCurrentMonth] = useState(new Date());

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

	return (
		<div className="w-full">
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
						const isSelected = selectedDate && date && 
							date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
						const totalPoints = date ? getTotalPointsForDate(date) : 0;

						return (
							<button
								key={index}
								onClick={() => date && setSelectedDate(date)}
								disabled={!date || !isCurrentMonthDay}
								className={`
									aspect-square p-1 rounded-lg transition-all text-xs font-semibold
									${!date || !isCurrentMonthDay
										? 'text-gray-300 cursor-default'
										: isSelected
										? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
										: isTodayDay
										? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
										: hasRecordsDay
										? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300'
										: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
									}
								`}>
								<div className="flex flex-col items-center justify-center h-full">
									<div className="text-sm font-bold">
										{date ? date.getDate() : ''}
									</div>
									{hasRecordsDay && (
										<div className="text-[10px] mt-0.5">
											+{totalPoints.toFixed(1)}
										</div>
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
					<h3 className="text-lg font-black text-gray-800 mb-4">
						📅 {formatDate(selectedDate)}
					</h3>
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

