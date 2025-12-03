import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaskRecord } from '../types/taskRecord';

interface TaskRecordState {
	records: TaskRecord[];
	addRecord: (
		taskName: string,
		points: number,
		taskType: 'main' | 'demon',
		cost?: number
	) => void;
	getRecords: () => TaskRecord[];
	getRecordsByDate: (date: Date) => TaskRecord[];
}

export const useTaskRecordStore = create<TaskRecordState>()(
	persist(
		(set, get) => ({
			records: [],

			addRecord: (
				taskName: string,
				points: number,
				taskType: 'main' | 'demon',
				cost?: number
			) => {
				const record: TaskRecord = {
					id: crypto.randomUUID(),
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
		}),
		{
			name: 'habit-game-task-records',
		}
	)
);
