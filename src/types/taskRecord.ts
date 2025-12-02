export interface TaskRecord {
	id: string;
	taskName: string;
	points: number;
	completedAt: Date;
	taskType: 'main' | 'demon';
}
