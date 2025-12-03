import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';
import { calculateLevel } from '../utils/levelCalculator';
import { useTaskStore } from './taskStore';

interface UserState extends User {
	addPoints: (points: number) => void;
	deductPoints: (points: number) => boolean;
	addExperience: (amount: number) => void;
	updateStreak: () => void;
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
	streak: 0,
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
				const state = get();
				if (state.totalPoints < points) {
					return false; // 积分不足
				}

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

			updateStreak: () => {
				// 检查今天是否有完成的任务
				const allTasks = useTaskStore.getState().tasks;
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				const hasCompletedToday = allTasks.some(task => {
					if (!task.isCompleted || !task.completedAt)
						return false;
					const completedDate = new Date(task.completedAt);
					completedDate.setHours(0, 0, 0, 0);
					return (
						completedDate.getTime() === today.getTime()
					);
				});

				if (hasCompletedToday) {
					set(state => ({
						streak: state.streak > 0 ? state.streak : 1,
					}));
				}
				// 注意：不自动重置streak，只有在明确没有完成时才重置
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

				// 更新连续天数
				setTimeout(() => {
					get().updateStreak();
				}, 100);
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
