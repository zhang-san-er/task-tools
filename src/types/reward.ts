export interface Reward {
	id: string;
	name: string;
	description: string;
	cost: number;
	icon: string;
	category: 'virtual' | 'real';
}

export interface RewardRecord {
	id: string;
	rewardId: string;
	rewardName: string;
	cost: number;
	redeemedAt: Date;
}
