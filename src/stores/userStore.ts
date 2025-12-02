import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user';
import { calculateLevel } from '../utils/levelCalculator';
import { useTaskStore } from './taskStore';

interface UserState extends User {
	addPoints: (points: number) => void;
	deductPoints: (points: number) => boolean;
	deductHealth: (amount: number) => void;
	restoreHealth: (amount: number) => void;
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
	health: 100,
	streak: 0,
};

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			...INITIAL_USER,

			addPoints: (points: number) => {
				set(state => {
					const newTotalPoints = state.totalPoints + points;
					const newLevel = calculateLevel(newTotalPoints);
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
					const newLevel = calculateLevel(newTotalPoints);
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

			deductHealth: (amount: number) => {
				set(state => ({
					health: Math.max(0, state.health - amount),
				}));
			},

			restoreHealth: (amount: number) => {
				set(state => ({
					health: Math.min(100, state.health + amount),
				}));
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
				// 完成任务获得积分
				get().addPoints(points);

				// 更新连续天数
				setTimeout(() => {
					get().updateStreak();
				}, 100);
			},

			handleTaskFailure: (
				isDemon: boolean,
				entryCost?: number
			) => {
				if (isDemon && entryCost && entryCost > 0) {
					// 付费挑战失败扣除入场积分（如果还没扣除的话）
					// 注意：这里entryCost已经在开始时扣除了，所以失败时不再扣除
					// 但如果需要失败时额外扣除，可以在这里添加
					get().deductHealth(15);
				} else if (isDemon) {
					get().deductHealth(15);
				} else {
					// 普通任务失败扣除少量生命值
					get().deductHealth(5);
				}
			},
		}),
		{
			name: 'habit-game-user',
		}
	)
);
