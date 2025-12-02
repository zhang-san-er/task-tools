import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reward, RewardRecord } from '../types/reward';

interface RewardState {
	rewards: Reward[];
	redeemedRewards: RewardRecord[];
	addReward: (reward: Reward) => void;
	redeemReward: (rewardId: string) => boolean;
	getRedeemedRewards: () => RewardRecord[];
}

const defaultRewards: Reward[] = [
	{
		id: '1',
		name: '休息日',
		description: '给自己放一天假，放松心情',
		cost: 50,
		icon: '🏖️',
		category: 'virtual',
	},
	{
		id: '2',
		name: '小奖励',
		description: '买一杯喜欢的奶茶或零食',
		cost: 100,
		icon: '☕',
		category: 'real',
	},
	{
		id: '3',
		name: '电影票',
		description: '看一场想看的电影',
		cost: 200,
		icon: '🎬',
		category: 'real',
	},
	{
		id: '4',
		name: '美食大餐',
		description: '去喜欢的餐厅吃一顿',
		cost: 300,
		icon: '🍽️',
		category: 'real',
	},
	{
		id: '5',
		name: '购物券',
		description: '买一件心仪的小物品',
		cost: 500,
		icon: '🛍️',
		category: 'real',
	},
	{
		id: '6',
		name: '成就徽章',
		description: '获得专属成就徽章',
		cost: 1000,
		icon: '🏆',
		category: 'virtual',
	},
];

export const useRewardStore = create<RewardState>()(
	persist(
		(set, get) => ({
			rewards: defaultRewards,
			redeemedRewards: [],

			addReward: (reward: Reward) => {
				set(state => ({
					rewards: [...state.rewards, reward],
				}));
			},

			redeemReward: (rewardId: string) => {
				const reward = get().rewards.find(
					r => r.id === rewardId
				);
				if (!reward) return false;

				const record: RewardRecord = {
					id: crypto.randomUUID(),
					rewardId: reward.id,
					rewardName: reward.name,
					cost: reward.cost,
					redeemedAt: new Date(),
				};

				set(state => ({
					redeemedRewards: [
						...state.redeemedRewards,
						record,
					],
				}));

				return true;
			},

			getRedeemedRewards: () => {
				return get().redeemedRewards;
			},
		}),
		{
			name: 'habit-game-rewards',
		}
	)
);
