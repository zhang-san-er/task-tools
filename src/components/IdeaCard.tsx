import React, { useState } from 'react';
import type { Idea } from '../types/idea';
import { useIdeaStore } from '../stores/ideaStore';
import { IdeaForm } from './IdeaForm';
import { ConfirmDialog } from './ConfirmDialog';

interface IdeaCardProps {
	idea: Idea;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
	const { deleteIdea } = useIdeaStore();
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleDelete = () => {
		deleteIdea(idea.id);
		setShowDeleteConfirm(false);
	};

	const handleCardClick = () => {
		setIsEditing(true);
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteConfirm(true);
	};

	if (isEditing) {
		return (
			<IdeaForm
				initialData={{
					content: idea.content,
					category: idea.category,
					tags: idea.tags,
				}}
				ideaId={idea.id}
				onClose={() => setIsEditing(false)}
			/>
		);
	}

	return (
		<>
			<div
				onClick={handleCardClick}
				className="glass-effect rounded-xl p-3 mb-3 card-shadow border border-blue-200/60 hover:border-blue-300/60 hover:shadow-md transition-all duration-300 cursor-pointer relative">
				{/* 删除按钮 - 右上角 */}
				<button
					onClick={handleDeleteClick}
					className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm text-gray-400 active:text-red-500 active:bg-red-50/90 rounded-full transition-all active:scale-95 z-10 shadow-sm">
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						strokeWidth={2}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{/* 第一行：分区和时间 */}
				<div className="flex items-center justify-between gap-2 mb-2 min-w-0 pr-8">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-semibold rounded-md">
							{idea.category}
						</span>
						<span className="text-[10px] text-gray-400 font-medium">
							{(() => {
								const date =
									idea.createdAt instanceof Date
										? idea.createdAt
										: new Date(idea.createdAt);
								const hours = String(
									date.getHours()
								).padStart(2, '0');
								const minutes = String(
									date.getMinutes()
								).padStart(2, '0');
								return `${hours}:${minutes}`;
							})()}
						</span>
					</div>
				</div>

				{/* 标签 */}
				{idea.tags && idea.tags.length > 0 && (
					<div className="flex gap-1 flex-wrap mb-2">
						{idea.tags.map((tag, index) => (
							<span
								key={index}
								className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded">
								#{tag}
							</span>
						))}
					</div>
				)}

				{/* 内容区域 */}
				<div className="min-w-0">
					<p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap text-sm font-medium word-break-break-word overflow-wrap-anywhere">
						{idea.content}
					</p>
				</div>
			</div>

			<ConfirmDialog
				open={showDeleteConfirm}
				title="确认删除"
				message="确定要删除这条想法吗？此操作无法撤销。"
				onConfirm={handleDelete}
				onCancel={() => setShowDeleteConfirm(false)}
				confirmText="删除"
				cancelText="取消"
				confirmButtonClass="bg-red-500 text-white"
			/>
		</>
	);
};
