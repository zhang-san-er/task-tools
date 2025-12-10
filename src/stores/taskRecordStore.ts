import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaskRecord } from '../types/taskRecord';

interface TaskRecordState {
	records: TaskRecord[];
	addRecord: (
		taskId: string,
		taskName: string,
		points: number,
		taskType: 'main' | 'demon',
		cost?: number
	) => void;
	getRecords: () => TaskRecord[];
	getRecordsByDate: (date: Date) => TaskRecord[];
	getRecordsByTaskId: (taskId: string, taskName?: string) => TaskRecord[];
	deleteRecordsByTaskId: (taskId: string, taskName?: string) => TaskRecord[];
	deleteRecord: (recordId: string) => void;
}

export const useTaskRecordStore = create<TaskRecordState>()(
	persist(
		(set, get) => ({
			records: [],

			addRecord: (
				taskId: string,
				taskName: string,
				points: number,
				taskType: 'main' | 'demon',
				cost?: number
			) => {
				const record: TaskRecord = {
					id: crypto.randomUUID(),
					taskId,
					taskName,
					points,
					cost,
					completedAt: new Date(),
					taskType,
				};

				set(state => ({
					records: [record, ...state.records], // 最新的在前面
				}));
			},

			getRecords: () => {
				return get().records;
			},

			getRecordsByDate: (date: Date) => {
				const targetDate = new Date(date);
				targetDate.setHours(0, 0, 0, 0);

				return get().records.filter(record => {
					const recordDate = new Date(record.completedAt);
					recordDate.setHours(0, 0, 0, 0);
					return (
						recordDate.getTime() === targetDate.getTime()
					);
				});
			},

			getRecordsByTaskId: (taskId: string, taskName?: string) => {
				return get().records.filter(
					record => 
						// 新数据：使用 taskId 匹配
						(record.taskId && record.taskId === taskId) ||
						// 老数据：使用 taskName 匹配（兼容性）
						(!record.taskId && taskName && record.taskName === taskName)
				);
			},

			deleteRecordsByTaskId: (taskId: string, taskName?: string) => {
				const recordsToDelete = get().records.filter(
					record => 
						// 新数据：使用 taskId 匹配
						(record.taskId && record.taskId === taskId) ||
						// 老数据：使用 taskName 匹配（兼容性）
						(!record.taskId && taskName && record.taskName === taskName)
				);
				set(state => ({
					records: state.records.filter(
						record => 
							// 保留不匹配的记录
							!(record.taskId === taskId || (!record.taskId && taskName && record.taskName === taskName))
					),
				}));
				return recordsToDelete;
			},

			deleteRecord: (recordId: string) => {
				set(state => ({
					records: state.records.filter(
						record => record.id !== recordId
					),
				}));
			},
		}),
		{
			name: 'habit-game-task-records',
			migrate: (persistedState: any) => {
				// 迁移函数：保持老数据不变，不添加 taskId
				// 老数据继续使用 taskName 进行匹配，新数据使用 taskId
				if (persistedState && persistedState.records) {
					persistedState.records = persistedState.records.map((record: any) => {
						// 确保日期字段正确序列化
						if (record.completedAt && typeof record.completedAt === 'string') {
							record.completedAt = new Date(record.completedAt);
						}
						// 老数据保持原样，不添加 taskId
						return record;
					});
				}
				return persistedState;
			},
		}
	)
);
