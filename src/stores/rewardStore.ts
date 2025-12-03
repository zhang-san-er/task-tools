import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reward, RewardRecord } from '../types/reward';

interface RewardState {
	rewards: Reward[];
	redeemedRewards: RewardRecord[];
	addReward: (reward: Reward) => void;
	updateReward: (rewardId: string, reward: Partial<Reward>) => void;
	deleteReward: (rewardId: string) => void;
	toggleRewardStatus: (rewardId: string) => void; // 切换商品上架/下架状态
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
		isActive: true,
	},
	{
		id: '2',
		name: '小奖励',
		description: '买一杯喜欢的奶茶或零食',
		cost: 100,
		icon: '☕',
		category: 'real',
		isActive: true,
	},
	{
		id: '3',
		name: '电影票',
		description: '看一场想看的电影',
		cost: 200,
		icon: '🎬',
		category: 'real',
		isActive: true,
	},
	{
		id: '4',
		name: '美食大餐',
		description: '去喜欢的餐厅吃一顿',
		cost: 300,
		icon: '🍽️',
		category: 'real',
		isActive: true,
	},
	{
		id: '5',
		name: '购物券',
		description: '买一件心仪的小物品',
		cost: 500,
		icon: '🛍️',
		category: 'real',
		isActive: true,
	},
	{
		id: '6',
		name: '成就徽章',
		description: '获得专属成就徽章',
		cost: 1000,
		icon: '🏆',
		category: 'virtual',
		isActive: true,
	},
];

export const useRewardStore = create<RewardState>()(
	persist(
		(set, get) => ({
			rewards: defaultRewards,
			redeemedRewards: [],

			addReward: (reward: Reward) => {
				set(state => ({
					rewards: [...state.rewards, { ...reward, isActive: reward.isActive !== undefined ? reward.isActive : true }],
				}));
			},

			updateReward: (rewardId: string, updatedReward: Partial<Reward>) => {
				set(state => ({
					rewards: state.rewards.map(reward =>
						reward.id === rewardId
							? { ...reward, ...updatedReward }
							: reward
					),
				}));
			},

			deleteReward: (rewardId: string) => {
				set(state => ({
					rewards: state.rewards.filter(reward => reward.id !== rewardId),
				}));
			},

			toggleRewardStatus: (rewardId: string) => {
				set(state => ({
					rewards: state.rewards.map(reward => {
						if (reward.id === rewardId) {
							// 如果当前是 false，切换为 true；否则切换为 false
							const currentStatus = reward.isActive !== false;
							return { ...reward, isActive: !currentStatus };
						}
						return reward;
					}),
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
