export type TaskType = 'main' | 'demon';

export interface Task {
	id: string;
	name: string;
	type: TaskType;
	isCompleted: boolean;
	points: number;
	entryCost?: number; // 入场积分（仅付费挑战）
	isStarted?: boolean; // 是否已开始（已支付入场费）
	isClaimed?: boolean; // 是否已领取
	isRepeatable?: boolean; // 是否可重复执行
	createdAt: Date;
	completedAt?: Date;
	expiresAt?: Date;
	durationDays?: number; // 持续天数（从领取时开始计算）
}

export interface TaskFormData {
	name: string;
	type: TaskType;
	points: number;
	entryCost?: number; // 入场积分（仅付费挑战）
	isRepeatable?: boolean; // 是否可重复执行
	expiresAt?: Date;
	durationDays?: number; // 持续天数（与expiresAt互斥）
}
