export interface TaskRecord {
	id: string;
	taskName: string;
	points: number;
	cost?: number; // 支出积分（付费任务的入场费）
	completedAt: Date;
	taskType: 'main' | 'demon';
}
