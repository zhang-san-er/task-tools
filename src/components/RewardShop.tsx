import React, { useState } from 'react';
import { useRewardStore } from '../stores/rewardStore';
import { useUserStore } from '../stores/userStore';
import type { Reward } from '../types/reward';
import { ConfirmDialog } from './ConfirmDialog';

export const RewardShop: React.FC = () => {
	const {
		rewards,
		redeemReward,
		addReward,
		updateReward,
		deleteReward,
		toggleRewardStatus,
	} = useRewardStore();
	const { totalPoints, deductPoints } = useUserStore();
	const [isEditing, setIsEditing] = useState(false);
	const [editingReward, setEditingReward] = useState<Reward | null>(
		null
	);
	const [showAddForm, setShowAddForm] = useState(false);
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
		confirmText?: string;
		cancelText?: string;
		confirmButtonClass?: string;
	}>({
		open: false,
		title: '',
		message: '',
		onConfirm: () => {},
	});

	// 获取上架的商品（非编辑模式下只显示上架商品）
	const activeRewards = rewards.filter(
		reward => reward.isActive !== false
	);
	// 编辑模式下显示所有商品
	const displayRewards = isEditing ? rewards : activeRewards;

	const handleRedeem = (
		rewardId: string,
		cost: number,
		name: string
	) => {
		const newTotalPoints = totalPoints - cost;
		const pointsMessage = newTotalPoints < 0 
			? `\n\n⚠️ 兑换后积分将变为 ${newTotalPoints}（负分，超前消费）`
			: `\n\n兑换后剩余积分：${newTotalPoints}`;

		setConfirmDialog({
			open: true,
			title: '确认兑换',
			message: `确定要用 ${cost.toFixed(1)} 积分兑换「${name}」吗？${pointsMessage}`,
			onConfirm: () => {
				setConfirmDialog({ ...confirmDialog, open: false });
				if (deductPoints(cost)) {
					redeemReward(rewardId);
									alert(`🎉 兑换成功！已扣除 ${cost.toFixed(1)} 积分。`);
				} else {
					alert('兑换失败！');
				}
			},
			confirmText: '确认兑换',
			cancelText: '取消',
		});
	};

	const handleEdit = (reward: Reward) => {
		setEditingReward(reward);
		setIsEditing(true);
	};

	const handleDelete = (rewardId: string, name: string) => {
		setConfirmDialog({
			open: true,
			title: '删除商品',
			message: `确定要删除「${name}」吗？`,
			onConfirm: () => {
				deleteReward(rewardId);
				setConfirmDialog({ ...confirmDialog, open: false });
			},
			confirmText: '删除',
			cancelText: '取消',
			confirmButtonClass: 'bg-red-500 text-white',
		});
	};

	const handleToggleStatus = (rewardId: string) => {
		toggleRewardStatus(rewardId);
	};

	const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editingReward) return;

		const formData = new FormData(e.currentTarget);
		updateReward(editingReward.id, {
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			cost: parseFloat(formData.get('cost') as string) || 0,
			icon: formData.get('icon') as string,
			category: formData.get('category') as 'virtual' | 'real',
		});

		setEditingReward(null);
		setIsEditing(false);
	};

	const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const newReward: Reward = {
			id: crypto.randomUUID(),
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			cost: parseFloat(formData.get('cost') as string) || 0,
			icon: formData.get('icon') as string,
			category: formData.get('category') as 'virtual' | 'real',
		};
		addReward(newReward);
		setShowAddForm(false);
		e.currentTarget.reset();
	};

	return (
		<div className="w-full">
			<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
				<div className="flex justify-between items-center mb-2">
					<div className="text-center flex-1">
						<div className="text-3xl mb-2">🛍️</div>
						<div className="text-lg font-black text-gray-800 mb-1">
							积分商城
						</div>
						<div className="text-sm text-gray-600">
							当前积分：
							<span className="font-bold text-orange-600">
								{totalPoints}
							</span>
						</div>
					</div>
					<button
						onClick={() => setIsEditing(!isEditing)}
						className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all active:scale-95">
						{isEditing ? '完成编辑' : '编辑商城'}
					</button>
				</div>
			</div>

			{isEditing && (
				<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
					{showAddForm ? (
						<form
							onSubmit={handleAdd}
							className="space-y-3">
							<h4 className="font-bold text-gray-800 mb-3">
								添加新奖励
							</h4>
							<input
								type="text"
								name="name"
								placeholder="奖励名称"
								required
								className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
							/>
							<input
								type="text"
								name="description"
								placeholder="描述"
								required
								className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
							/>
							<input
								type="text"
								name="icon"
								placeholder="图标（emoji）"
								required
								className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
							/>
								<input
									type="number"
									name="cost"
									placeholder="所需积分"
									required
									step="0.1"
									min="0.1"
									className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
								/>
							<select
								name="category"
								required
								className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400">
								<option value="virtual">虚拟</option>
								<option value="real">实物</option>
							</select>
							<div className="flex gap-2">
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm">
									添加
								</button>
								<button
									type="button"
									onClick={() =>
										setShowAddForm(false)
									}
									className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm">
									取消
								</button>
							</div>
						</form>
					) : (
						<button
							onClick={() => setShowAddForm(true)}
							className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">
							+ 添加新奖励
						</button>
					)}
				</div>
			)}

			{editingReward && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
					<form
						onSubmit={handleSaveEdit}
						onClick={e => e.stopPropagation()}
						className="glass-effect rounded-2xl card-shadow-lg border border-white/50 w-full max-w-md max-h-[80vh] flex flex-col">
						{/* 固定标题 */}
						<div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200/50">
							<h3 className="text-lg font-black text-gray-800 text-center">
								编辑奖励
							</h3>
						</div>
						{/* 可滚动内容区域 */}
						<div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
							<div className="space-y-3">
								<input
									type="text"
									name="name"
									defaultValue={editingReward.name}
									placeholder="奖励名称"
									required
									className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
								/>
								<input
									type="text"
									name="description"
									defaultValue={
										editingReward.description
									}
									placeholder="描述"
									required
									className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
								/>
								<input
									type="text"
									name="icon"
									defaultValue={editingReward.icon}
									placeholder="图标（emoji）"
									required
									className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
								/>
								<input
									type="number"
									name="cost"
									defaultValue={editingReward.cost}
									placeholder="所需积分"
									required
									step="0.1"
									min="0.1"
									className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
								/>
								<select
									name="category"
									defaultValue={
										editingReward.category
									}
									required
									className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400">
									<option value="virtual">
										虚拟
									</option>
									<option value="real">实物</option>
								</select>
							</div>
						</div>
						{/* 固定按钮区域 */}
						<div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-200/50">
							<div className="flex gap-2">
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm">
									保存
								</button>
								<button
									type="button"
									onClick={() => {
										setEditingReward(null);
										setIsEditing(false);
									}}
									className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm">
									取消
								</button>
							</div>
						</div>
					</form>
				</div>
			)}

			<div className="space-y-3">
				{displayRewards.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-4xl mb-3">🛍️</div>
						<p className="text-gray-500 text-sm">
							{isEditing
								? '还没有商品，点击"添加新奖励"创建第一个商品'
								: '暂无上架商品'}
						</p>
					</div>
				) : (
					displayRewards.map(reward => {
						// 允许负分，所以总是可以兑换
						const canAfford = true;
						const isActive = reward.isActive !== false;

						return (
							<div
								key={reward.id}
								className={`glass-effect rounded-3xl card-shadow p-5 border-2 transition-all hover:shadow-lg ${
									!isEditing && !isActive
										? 'hidden'
										: isActive
										? canAfford
											? 'border-purple-200/50 hover:border-purple-300/50'
											: 'border-gray-200/50 opacity-60'
										: 'border-gray-200/50 opacity-40 bg-gray-50'
								}`}>
								<div className="flex items-start gap-4">
									<div className="text-4xl flex-shrink-0">
										{reward.icon}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<h4
												className={`font-black ${
													isActive
														? 'text-gray-800'
														: 'text-gray-400'
												}`}>
												{reward.name}
											</h4>
											<span
												className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
													reward.category ===
													'virtual'
														? 'bg-purple-100 text-purple-700'
														: 'bg-green-100 text-green-700'
												}`}>
												{reward.category ===
												'virtual'
													? '虚拟'
													: '实物'}
											</span>
											{isEditing && (
												<span
													className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
														isActive
															? 'bg-green-100 text-green-700'
															: 'bg-gray-200 text-gray-500'
													}`}>
													{isActive
														? '✓ 上架'
														: '下架'}
												</span>
											)}
										</div>
										<p
											className={`text-sm mb-3 ${
												isActive
													? 'text-gray-600'
													: 'text-gray-400'
											}`}>
											{reward.description}
										</p>
										<div className="flex items-center justify-between">
											<div
												className={`text-lg font-black ${
													isActive
														? 'text-orange-600'
														: 'text-gray-400'
												}`}>
												{reward.cost.toFixed(1)} 积分
											</div>
											<div className="flex gap-2">
												{isEditing && (
													<>
														<button
															onClick={() =>
																handleToggleStatus(
																	reward.id
																)
															}
															className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 ${
																isActive
																	? 'bg-gray-500 text-white'
																	: 'bg-green-500 text-white'
															}`}>
															{isActive
																? '下架'
																: '上架'}
														</button>
														<button
															onClick={() =>
																handleEdit(
																	reward
																)
															}
															className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95">
															编辑
														</button>
														<button
															onClick={() =>
																handleDelete(
																	reward.id,
																	reward.name
																)
															}
															className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95">
															删除
														</button>
													</>
												)}
												{!isEditing &&
													isActive && (
														<button
															onClick={() =>
																handleRedeem(
																	reward.id,
																	reward.cost,
																	reward.name
																)
															}
															disabled={
																!canAfford
															}
															className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 ${
																canAfford
																	? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200/50 hover:shadow-purple-300/50'
																	: 'bg-gray-300 text-gray-500 cursor-not-allowed'
															}`}>
															{canAfford
																? '立即兑换'
																: '积分不足'}
														</button>
													)}
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			<ConfirmDialog
				open={confirmDialog.open}
				title={confirmDialog.title}
				message={confirmDialog.message}
				onConfirm={confirmDialog.onConfirm}
				onCancel={() =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					})
				}
				confirmText={confirmDialog.confirmText}
				cancelText={confirmDialog.cancelText}
				confirmButtonClass={confirmDialog.confirmButtonClass}
			/>
		</div>
	);
};
