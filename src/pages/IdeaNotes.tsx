import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdeaStore } from '../stores/ideaStore';
import { IdeaCard } from '../components/IdeaCard';
import { IdeaForm } from '../components/IdeaForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CategoryManagerDialog } from '../components/CategoryManagerDialog';
import { DataManagerDialog } from '../components/DataManagerDialog';
import { formatDate } from '../utils/dateUtils';
import type { Idea } from '../types/idea';

export const IdeaNotes: React.FC = () => {
	const navigate = useNavigate();
	const { ideas, categories, deleteCategory, updateCategory, importData, clearData, cleanupEmptyCategories } = useIdeaStore();
	
	// 组件加载时清理空分区
	useEffect(() => {
		cleanupEmptyCategories();
	}, [cleanupEmptyCategories]);
	const [selectedCategory, setSelectedCategory] = useState<string>('全部');
	const [selectedTag, setSelectedTag] = useState<string>('全部');
	const [showForm, setShowForm] = useState(false);
	const [showCategoryManager, setShowCategoryManager] = useState(false);
	const [showDataManager, setShowDataManager] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

	// 过滤掉空字符串分区，确保有"默认"分区
	const validCategories = useMemo(() => {
		const filtered = categories.filter(cat => cat && cat !== '');
		if (!filtered.includes('默认')) {
			return ['默认', ...filtered];
		}
		return filtered;
	}, [categories]);

	// 获取所有标签列表
	const allTags = useMemo(() => {
		const tagSet = new Set<string>();
		ideas.forEach((idea) => {
			if (idea.tags && idea.tags.length > 0) {
				idea.tags.forEach((tag) => tagSet.add(tag));
			}
		});
		return Array.from(tagSet).sort();
	}, [ideas]);

	// 计算每个标签的数量
	const tagCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		allTags.forEach((tag) => {
			counts[tag] = ideas.filter((idea) => 
				idea.tags && idea.tags.includes(tag)
			).length;
		});
		return counts;
	}, [allTags, ideas]);

	// 使用 useMemo 优化性能，减少不必要的重新计算
	const filteredIdeas = useMemo(() => {
		let result = ideas;

		// 分区筛选
		if (selectedCategory !== '全部') {
			result = result.filter((idea) => {
				const ideaCategory = idea.category || '默认';
				return ideaCategory === selectedCategory;
			});
		}

		// 标签筛选
		if (selectedTag !== '全部') {
			result = result.filter((idea) => 
				idea.tags && idea.tags.includes(selectedTag)
			);
		}

		return result;
	}, [ideas, selectedCategory, selectedTag]);

	// 按创建时间倒序排列
	const sortedIdeas = useMemo(() => {
		return [...filteredIdeas].sort((a, b) => {
			const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
			const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
			return dateB.getTime() - dateA.getTime();
		});
	}, [filteredIdeas]);

	// 格式化日期标题
	const formatDateTitle = (date: Date | string): string => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const ideaDate = date instanceof Date ? new Date(date) : new Date(date);
		ideaDate.setHours(0, 0, 0, 0);
		
		const diffTime = today.getTime() - ideaDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return '今天';
		} else if (diffDays === 1) {
			return '昨天';
		} else {
			return ideaDate.toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		}
	};

	// 按日期分组想法
	const groupedIdeasByDate = useMemo(() => {
		const groups: Record<string, Idea[]> = {};
		
		sortedIdeas.forEach((idea) => {
			const createdAt = idea.createdAt instanceof Date ? idea.createdAt : new Date(idea.createdAt);
			const dateKey = formatDate(createdAt);
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(idea);
		});

		// 转换为数组并按日期倒序排序
		return Object.entries(groups).sort((a, b) => {
			return b[0].localeCompare(a[0]);
		});
	}, [sortedIdeas]);

	// 计算每个分区的数量（包括空字符串的处理）
	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		validCategories.forEach((cat) => {
			// 统计该分区和空字符串分区的数量（空字符串视为"默认"）
			if (cat === '默认') {
				counts[cat] = ideas.filter((idea) => !idea.category || idea.category === '' || idea.category === '默认').length;
			} else {
				counts[cat] = ideas.filter((idea) => idea.category === cat).length;
			}
		});
		return counts;
	}, [validCategories, ideas]);

	const handleDeleteCategory = (category: string) => {
		deleteCategory(category);
		setCategoryToDelete(null);
		setShowCategoryManager(false);
		if (selectedCategory === category) {
			setSelectedCategory('全部');
		}
	};

	// 处理导入数据
	const handleImportData = (data: { ideas: Idea[]; categories: string[] }) => {
		importData(data);
	};

	// 处理清除数据
	const handleClearData = () => {
		clearData();
		window.location.reload();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
			<div className="w-full max-w-md mx-auto min-h-screen pb-24">
				{/* 顶部装饰 - 固定高度，避免抖动 */}
				<div className="gradient-bg w-full h-32 rounded-b-3xl relative overflow-hidden flex-shrink-0">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

					<header className="relative z-10 text-center pt-8 px-4">
						<div className="flex items-center justify-between mb-2">
							<button
								onClick={() => navigate('/')}
								className="text-white/80 hover:text-white transition-colors p-1 active:scale-95">
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 19l-7-7m0 0l7-7m-7 7h18"
									/>
								</svg>
							</button>
							<h1 className="text-3xl font-black text-white drop-shadow-lg">
								💭 想法记录
							</h1>
							<button
								onClick={() => setShowDataManager(true)}
								className="text-white/80 hover:text-white transition-colors p-1 active:scale-95">
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</button>
						</div>
						<p className="text-white/90 text-sm font-medium">
							记录灵感，分类整理
						</p>
					</header>
				</div>

				{/* 内容区域 - 使用稳定的布局 */}
				<div className="px-4 -mt-6 relative z-20 pb-8">
					{/* 操作栏 - 固定高度 */}
					<div className="flex gap-2 mb-3 flex-shrink-0">
						<button
							onClick={() => setShowForm(!showForm)}
							className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md active:scale-95 transition-all">
							{showForm ? '✕ 取消' : '✨ 新建想法'}
						</button>
						<button
							onClick={() => setShowCategoryManager(true)}
							className="px-3 py-2 rounded-lg font-semibold text-sm shadow-sm active:shadow-md active:scale-95 transition-all border bg-white text-gray-700 border-gray-200">
							📁 分区
						</button>
					</div>


					{/* 表单 - 使用动画 */}
					{showForm && (
						<div className="transition-all duration-300">
							<IdeaForm onClose={() => setShowForm(false)} />
						</div>
					)}

					{/* 分区筛选 - 固定高度，避免抖动 */}
					<div className="mb-3 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
						<div className="flex gap-1.5 min-w-max">
							<button
								onClick={() => setSelectedCategory('全部')}
								className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all active:scale-95 ${
									selectedCategory === '全部'
										? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
										: 'bg-white text-gray-700 shadow-sm border border-gray-200 hover:border-gray-300'
								}`}>
								全部 ({ideas.length})
							</button>
							{validCategories.map((category) => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all active:scale-95 ${
										selectedCategory === category
											? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
											: 'bg-white text-gray-700 shadow-sm border border-gray-200 hover:border-gray-300'
									}`}>
									{category} ({categoryCounts[category] || 0})
								</button>
							))}
						</div>
					</div>

					{/* 标签筛选 - 固定高度，避免抖动 */}
					{allTags.length > 0 && (
						<div className="mb-3 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
							<div className="flex gap-1.5 min-w-max">
								<button
									onClick={() => setSelectedTag('全部')}
									className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all active:scale-95 ${
										selectedTag === '全部'
											? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
											: 'bg-white text-gray-700 shadow-sm border border-gray-200 hover:border-gray-300'
									}`}>
									全部标签
								</button>
								{allTags.map((tag) => (
									<button
										key={tag}
										onClick={() => setSelectedTag(tag)}
										className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all active:scale-95 ${
											selectedTag === tag
												? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
												: 'bg-white text-gray-700 shadow-sm border border-gray-200 hover:border-gray-300'
										}`}>
										#{tag} ({tagCounts[tag] || 0})
									</button>
								))}
							</div>
						</div>
					)}

					{/* 想法列表 - 使用稳定的布局 */}
					<div className="min-h-[200px]">
						{sortedIdeas.length === 0 ? (
							<div className="text-center py-16">
								<div className="text-6xl mb-4">💭</div>
								<p className="text-gray-500 text-lg font-bold mb-2">
									{selectedCategory === '全部' && selectedTag === '全部'
										? '还没有想法记录'
										: selectedCategory !== '全部' && selectedTag === '全部'
										? `"${selectedCategory}" 分区还没有想法`
										: selectedCategory === '全部' && selectedTag !== '全部'
										? `没有包含标签 "#${selectedTag}" 的想法`
										: `"${selectedCategory}" 分区中没有包含标签 "#${selectedTag}" 的想法`}
								</p>
								<p className="text-gray-400 text-sm">
									点击上方按钮开始记录吧
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{groupedIdeasByDate.map(([dateKey, ideas]) => (
									<div key={dateKey}>
										{/* 日期标题 */}
										<div className="mb-2 px-1">
											<h3 className="text-sm font-bold text-gray-600">
												{formatDateTitle(
													ideas[0].createdAt instanceof Date
														? ideas[0].createdAt
														: new Date(ideas[0].createdAt)
												)}
											</h3>
										</div>
										{/* 该日期的想法卡片 */}
										<div className="space-y-3">
											{ideas.map((idea) => (
												<IdeaCard key={idea.id} idea={idea} />
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<footer className="mt-12 px-4 pb-8">
					<div className="text-center text-xs text-gray-400">
						<p>✨ 数据安全存储在本地，完全离线可用</p>
					</div>
				</footer>
			</div>

			{/* 分区管理弹窗 */}
			<CategoryManagerDialog
				open={showCategoryManager}
				categories={validCategories}
				categoryCounts={categoryCounts}
				onDelete={(category) => setCategoryToDelete(category)}
				onUpdate={(oldCategory, newCategory) => {
					updateCategory(oldCategory, newCategory);
					// 如果当前选中的分区被更新了，更新选中状态
					if (selectedCategory === oldCategory) {
						setSelectedCategory(newCategory);
					}
				}}
				onClose={() => setShowCategoryManager(false)}
			/>

			{/* 删除分区确认对话框 */}
			<ConfirmDialog
				open={!!categoryToDelete}
				title="确认删除分区"
				message={`删除分区 "${categoryToDelete}" 后，该分区下的所有想法将被删除。确定要继续吗？`}
				onConfirm={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
				onCancel={() => setCategoryToDelete(null)}
				confirmText="删除"
				cancelText="取消"
				confirmButtonClass="bg-red-500 text-white"
			/>

			{/* 数据管理弹窗 */}
			<DataManagerDialog
				open={showDataManager}
				onClose={() => setShowDataManager(false)}
				ideas={ideas}
				categories={categories}
				onImport={handleImportData}
				onClear={handleClearData}
			/>
		</div>
	);
};
