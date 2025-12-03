export interface Reward {
	id: string;
	name: string;
	description: string;
	cost: number;
	icon: string;
	category: 'virtual' | 'real';
	isActive?: boolean; // 是否上架
}

export interface RewardRecord {
	id: string;
	rewardId: string;
	rewardName: string;
	cost: number;
	redeemedAt: Date;
}
