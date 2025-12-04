import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Idea, IdeaFormData } from '../types/idea';

interface IdeaState {
	ideas: Idea[];
	categories: string[]; // 所有分区列表
	addIdea: (ideaData: IdeaFormData) => void;
	updateIdea: (id: string, ideaData: IdeaFormData) => void;
	deleteIdea: (id: string) => void;
	getIdeasByCategory: (category: string) => Idea[];
	addCategory: (category: string) => void;
	updateCategory: (oldCategory: string, newCategory: string) => void; // 更新分区名称
	deleteCategory: (category: string) => void; // 删除分区时，删除该分区下的所有想法
	importData: (data: { ideas: Idea[]; categories: string[] }) => void; // 导入数据
	clearData: () => void; // 清除所有数据
	cleanupEmptyCategories: () => void; // 清理空分区
}

export const useIdeaStore = create<IdeaState>()(
	persist(
		(set, get) => ({
			ideas: [],
			categories: ['默认'], // 默认包含"默认"分区

			addIdea: (ideaData: IdeaFormData) => {
				const category = ideaData.category || '默认';
				const newIdea: Idea = {
					id: crypto.randomUUID(),
					content: ideaData.content,
					category: category,
					createdAt: new Date(),
					tags: ideaData.tags || [],
				};

				// 如果分区不存在，自动添加
				const currentCategories = get().categories;
				if (!currentCategories.includes(newIdea.category)) {
					set(state => ({
						categories: [
							...state.categories,
							newIdea.category,
						],
					}));
				}

				set(state => ({
					ideas: [...state.ideas, newIdea],
				}));
			},

			updateIdea: (id: string, ideaData: IdeaFormData) => {
				const category = ideaData.category || '默认';
				const currentCategories = get().categories;

				// 如果新分区不存在，自动添加
				if (!currentCategories.includes(category)) {
					set(state => ({
						categories: [...state.categories, category],
					}));
				}

				set(state => ({
					ideas: state.ideas.map(idea =>
						idea.id === id
							? {
									...idea,
									content: ideaData.content,
									category: category,
									tags: ideaData.tags || [],
									updatedAt: new Date(),
							  }
							: idea
					),
				}));
			},

			deleteIdea: (id: string) => {
				set(state => ({
					ideas: state.ideas.filter(idea => idea.id !== id),
				}));
			},

			getIdeasByCategory: (category: string) => {
				return get().ideas.filter(
					idea => idea.category === category
				);
			},

			addCategory: (category: string) => {
				const currentCategories = get().categories;
				if (!currentCategories.includes(category)) {
					set(state => ({
						categories: [...state.categories, category],
					}));
				}
			},

			updateCategory: (oldCategory: string, newCategory: string) => {
				// 不允许更新"默认"分区
				if (oldCategory === '默认') {
					return;
				}
				// 不允许新名称为空或与旧名称相同
				if (!newCategory || newCategory.trim() === '' || newCategory === oldCategory) {
					return;
				}
				const trimmedNewCategory = newCategory.trim();
				const currentCategories = get().categories;
				// 如果新名称已存在，不允许更新
				if (currentCategories.includes(trimmedNewCategory)) {
					return;
				}
				
				set(state => ({
					ideas: state.ideas.map(idea =>
						idea.category === oldCategory
							? { ...idea, category: trimmedNewCategory }
							: idea
					),
					categories: state.categories.map(cat =>
						cat === oldCategory ? trimmedNewCategory : cat
					),
				}));
			},

			deleteCategory: (category: string) => {
				// 不允许删除"默认"分区
				if (category === '默认') {
					return;
				}
				// 删除该分区下的所有想法，并将它们移到"默认"分区
				set(state => {
					const defaultCategory = '默认';
					// 确保"默认"分区存在
					const updatedCategories = state.categories.includes(defaultCategory)
						? state.categories
						: [defaultCategory, ...state.categories];
					
					return {
						ideas: state.ideas.map(idea =>
							idea.category === category
								? { ...idea, category: defaultCategory }
								: idea
						),
						categories: updatedCategories.filter(
							cat => cat !== category
						),
					};
				});
			},

			importData: (data: { ideas: Idea[]; categories: string[] }) => {
				set({
					ideas: data.ideas,
					categories: data.categories,
				});
			},

			clearData: () => {
				set({
					ideas: [],
					categories: ['默认'],
				});
			},

			cleanupEmptyCategories: () => {
				const state = get();
				let needsUpdate = false;
				
				// 将所有空 category 的想法改为"默认"
				const updatedIdeas = state.ideas.map((idea) => {
					if (!idea.category || idea.category === '') {
						needsUpdate = true;
						return { ...idea, category: '默认' };
					}
					return idea;
				});
				
				// 移除空字符串分区，确保有"默认"分区
				let updatedCategories = state.categories.filter(
					cat => cat && cat !== ''
				);
				if (!updatedCategories.includes('默认')) {
					updatedCategories = ['默认', ...updatedCategories];
					needsUpdate = true;
				} else if (state.categories.includes('')) {
					needsUpdate = true;
				}
				
				if (needsUpdate) {
					set({
						ideas: updatedIdeas,
						categories: updatedCategories,
					});
				}
			},
		}),
		{
			name: 'habit-game-ideas',
			migrate: (persistedState: any) => {
				if (!persistedState) {
					return { ideas: [], categories: ['默认'] };
				}
				
				// 先处理 ideas，将空字符串 category 改为"默认"
				if (persistedState.ideas && Array.isArray(persistedState.ideas)) {
					persistedState.ideas = persistedState.ideas.map(
						(idea: any) => ({
							...idea,
							createdAt: idea.createdAt
								? new Date(idea.createdAt)
								: new Date(),
							updatedAt: idea.updatedAt
								? new Date(idea.updatedAt)
								: undefined,
							// 将空字符串、null、undefined category 改为"默认"
							category: (!idea.category || idea.category === '' || idea.category === null || idea.category === undefined)
								? '默认'
								: idea.category,
						})
					);
				} else {
					persistedState.ideas = [];
				}
				
				// 处理 categories
				if (!persistedState.categories || !Array.isArray(persistedState.categories)) {
					persistedState.categories = ['默认'];
				} else {
					// 移除空字符串、null、undefined 分区
					persistedState.categories = persistedState.categories.filter(
						(cat: string) => cat !== '' && cat !== null && cat !== undefined
					);
					// 确保有"默认"分区
					if (!persistedState.categories.includes('默认')) {
						persistedState.categories = ['默认', ...persistedState.categories];
					}
				}
				
				// 迁移：移除"未分类"分区，将"未分类"的想法改为"默认"
				if (persistedState.categories && persistedState.categories.includes('未分类')) {
					persistedState.categories = persistedState.categories.filter(
						(cat: string) => cat !== '未分类'
					);
					if (persistedState.ideas) {
						persistedState.ideas = persistedState.ideas.map((idea: any) => ({
							...idea,
							category: idea.category === '未分类' ? '默认' : idea.category,
						}));
					}
				}
				
				return persistedState;
			},
		}
	)
);
