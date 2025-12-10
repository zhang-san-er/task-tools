import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';
import { calculateLevel } from '../utils/levelCalculator';

interface UserState extends User {
	addPoints: (points: number) => void;
	deductPoints: (points: number) => boolean;
	addExperience: (amount: number) => void;
	removePoints: (points: number) => void;
	removeExperience: (amount: number) => void;
	handleTaskStart: (entryCost: number) => boolean;
	handleTaskCompletion: (
		taskId: string,
		points: number,
		isDemon: boolean,
		entryCost?: number
	) => void;
	handleTaskFailure: (isDemon: boolean, entryCost?: number) => void;
}

const INITIAL_USER: User = {
	level: 1,
	totalPoints: 0,
	currentPoints: 0,
	experience: 0,
};

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			...INITIAL_USER,

			addPoints: (points: number) => {
				set(state => {
					const newTotalPoints = state.totalPoints + points;
					const newLevel = calculateLevel(state.experience);
					const newCurrentPoints =
						newTotalPoints - (newLevel - 1) * 100;

					return {
						totalPoints: newTotalPoints,
						currentPoints: newCurrentPoints,
						level: newLevel,
					};
				});
			},

			deductPoints: (points: number) => {
				// 允许负分，支持超前消费
				set(currentState => {
					const newTotalPoints =
						currentState.totalPoints - points;
					const newLevel = calculateLevel(currentState.experience);
					const newCurrentPoints =
						newTotalPoints - (newLevel - 1) * 100;

					return {
						totalPoints: newTotalPoints,
						currentPoints: newCurrentPoints,
						level: newLevel,
					};
				});

				return true;
			},

			addExperience: (amount: number) => {
				set(state => {
					const newExperience = state.experience + amount;
					const newLevel = calculateLevel(newExperience);
					
					return {
						experience: newExperience,
						level: newLevel,
					};
				});
			},

			removePoints: (points: number) => {
				set(state => {
					const newTotalPoints = state.totalPoints - points;
					const newLevel = calculateLevel(state.experience);
					const newCurrentPoints =
						newTotalPoints - (newLevel - 1) * 100;

					return {
						totalPoints: newTotalPoints,
						currentPoints: newCurrentPoints,
						level: newLevel,
					};
				});
			},

			removeExperience: (amount: number) => {
				set(state => {
					const newExperience = Math.max(0, state.experience - amount);
					const newLevel = calculateLevel(newExperience);
					const newCurrentPoints =
						state.totalPoints - (newLevel - 1) * 100;
					
					return {
						experience: newExperience,
						level: newLevel,
						currentPoints: newCurrentPoints,
					};
				});
			},

			handleTaskStart: (entryCost: number) => {
				// 开始付费挑战，扣除入场积分
				if (entryCost > 0) {
					return get().deductPoints(entryCost);
				}
				return true;
			},

			handleTaskCompletion: (
				_taskId: string,
				points: number,
				_isDemon: boolean,
				_entryCost?: number
			) => {
				// 完成任务获得积分和经验值（经验值等于积分值）
				get().addPoints(points);
				get().addExperience(points);
			},

			handleTaskFailure: (
				_isDemon: boolean,
				_entryCost?: number
			) => {
				// 任务失败不再扣除经验值
			},
		}),
		{
			name: 'habit-game-user',
			migrate: (persistedState: any) => {
				// 迁移函数：将 health 迁移到 experience
				if (persistedState) {
					if (persistedState.health !== undefined && persistedState.experience === undefined) {
						persistedState.experience = persistedState.health;
					}
					delete persistedState.health;
				}
				return persistedState;
			},
		}
	)
);
