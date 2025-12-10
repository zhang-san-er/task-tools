export interface TaskRecord {
	id: string;
	taskId?: string; // 任务唯一ID（新数据有，老数据没有）
	taskName: string;
	points: number;
	cost?: number; // 支出积分（付费任务的入场费）
	completedAt: Date;
	taskType: 'main' | 'demon';
}
