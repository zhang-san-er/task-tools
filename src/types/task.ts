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
	isAvoidanceTask?: boolean; // 是否为逃避但需要做的任务
	createdAt: Date;
	completedAt?: Date;
	expiresAt?: Date;
	durationDays?: number; // 持续天数（从领取时开始计算）
	dailyLimit?: number; // 一天可以完成的次数
	exceedDaysRewardFormula?: string; // 超越天数奖励公式（如 "2n+10"，n为超越天数）
	claimedAt?: Date; // 任务被领取的时间（用于计算超越天数）
	order?: number; // 任务序号，用于排序
}

export interface TaskFormData {
	name: string;
	type: TaskType;
	points: number;
	entryCost?: number; // 入场积分（仅付费挑战）
	isRepeatable?: boolean; // 是否可重复执行
	isAvoidanceTask?: boolean; // 是否为逃避但需要做的任务
	expiresAt?: Date;
	durationDays?: number; // 持续天数（与expiresAt互斥）
	dailyLimit?: number; // 一天可以完成的次数
	exceedDaysRewardFormula?: string; // 超越天数奖励公式（如 "2n+10"，n为超越天数）
	order?: number; // 任务序号，用于排序
}
