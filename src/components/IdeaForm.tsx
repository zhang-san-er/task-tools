import React, { useState, useEffect } from 'react';
import { useIdeaStore } from '../stores/ideaStore';
import type { IdeaFormData } from '../types/idea';
import { CustomSelect } from './CustomSelect';

interface IdeaFormProps {
	initialData?: IdeaFormData;
	ideaId?: string;
	onClose: () => void;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({
	initialData,
	ideaId,
	onClose,
}) => {
	const { addIdea, updateIdea, categories, addCategory } = useIdeaStore();
	const [content, setContent] = useState(initialData?.content || '');
	const [category, setCategory] = useState(initialData?.category || '默认');
	const [newCategory, setNewCategory] = useState('');
	const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
	const [tags, setTags] = useState<string[]>(initialData?.tags || []);
	const [tagInput, setTagInput] = useState('');

	// 过滤掉空字符串分区，确保有"默认"分区
	const validCategories = categories.filter(cat => cat && cat !== '');
	const displayCategories = validCategories.includes('默认') ? validCategories : ['默认', ...validCategories];

	useEffect(() => {
		if (initialData) {
			setContent(initialData.content);
			// 如果 category 是空字符串，使用"默认"
			setCategory(initialData.category && initialData.category !== '' ? initialData.category : '默认');
			setTags(initialData.tags || []);
		}
	}, [initialData]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		const ideaData: IdeaFormData = {
			content: content.trim(),
			category: category || '默认',
			tags: tags,
		};

		if (ideaId) {
			updateIdea(ideaId, ideaData);
		} else {
			addIdea(ideaData);
		}

		onClose();
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()]);
			setTagInput('');
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleAddNewCategory = () => {
		if (newCategory.trim() && !categories.includes(newCategory.trim())) {
			addCategory(newCategory.trim());
			setCategory(newCategory.trim());
			setNewCategory('');
			setShowNewCategoryInput(false);
		}
	};

	return (
		<div className="glass-effect rounded-2xl p-4 mb-3 card-shadow-lg border-2 border-blue-200/60 transition-all duration-300">
			<form onSubmit={handleSubmit} className="space-y-3">
				{/* 想法内容 */}
				<div>
					<label className="block text-xs font-bold text-gray-700 mb-1.5">
						想法内容
					</label>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="记录你的想法..."
						className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all bg-white text-sm"
						rows={4}
						required
						autoFocus
					/>
				</div>

				{/* 分区 */}
				<div>
					<label className="block text-xs font-bold text-gray-700 mb-1.5">
						分区
					</label>
					<div className="flex gap-1.5">
							{!showNewCategoryInput ? (
							<>
								{displayCategories.length > 0 ? (
									<div className="flex-1">
										<CustomSelect
											value={category || '默认'}
											onChange={(val) => setCategory(val || '默认')}
											options={displayCategories}
										/>
									</div>
								) : (
									<div className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 flex items-center">
										暂无分区，请新建
									</div>
								)}
								<button
									type="button"
									onClick={() => setShowNewCategoryInput(true)}
									className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 active:scale-95 transition-all whitespace-nowrap">
									+ 新建
								</button>
							</>
						) : (
							<div className="flex gap-1.5 flex-1">
								<input
									type="text"
									value={newCategory}
									onChange={(e) => setNewCategory(e.target.value)}
									placeholder="新分区名称"
									className="flex-1 px-3 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm font-medium transition-all"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleAddNewCategory();
										}
									}}
									autoFocus
								/>
								<button
									type="button"
									onClick={handleAddNewCategory}
									className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 active:scale-95 transition-all">
									✓
								</button>
								<button
									type="button"
									onClick={() => {
										setShowNewCategoryInput(false);
										setNewCategory('');
									}}
									className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 active:scale-95 transition-all">
									✕
								</button>
							</div>
						)}
					</div>
				</div>

				{/* 标签 */}
				<div>
					<label className="block text-xs font-bold text-gray-700 mb-1.5">
						标签（可选）
					</label>
					<div className="flex gap-1.5 mb-1.5">
						<input
							type="text"
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									handleAddTag();
								}
							}}
							placeholder="输入标签后按回车"
							className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium transition-all"
						/>
						<button
							type="button"
							onClick={handleAddTag}
							className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 active:scale-95 transition-all whitespace-nowrap">
							+ 添加
						</button>
					</div>
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{tags.map((tag, index) => (
								<span
									key={index}
									className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
									#{tag}
									<button
										type="button"
										onClick={() => handleRemoveTag(tag)}
										className="hover:text-blue-900 transition-colors text-xs">
										✕
									</button>
								</span>
							))}
						</div>
					)}
				</div>

				{/* 操作按钮 */}
				<div className="flex gap-2 pt-1">
					<button
						type="button"
						onClick={onClose}
						className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 active:scale-95 transition-all">
						取消
					</button>
					<button
						type="submit"
						className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all">
						{ideaId ? '保存' : '添加'}
					</button>
				</div>
			</form>
		</div>
	);
};
