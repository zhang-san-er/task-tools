import React, { useState } from 'react';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import { useUserStore } from '../stores/userStore';
import { useRewardStore } from '../stores/rewardStore';
import { ConfirmDialog } from './ConfirmDialog';

export const MyPoints: React.FC = () => {
	const { totalPoints, deductPoints } = useUserStore();
	const { getRecords } = useTaskRecordStore();
	const { getRedeemedRewards, addManualRedeemRecord } =
		useRewardStore();
	const records = getRecords();
	const redeemedRewards = getRedeemedRewards();

	const [showExchangeDialog, setShowExchangeDialog] =
		useState(false);
	const [exchangeForm, setExchangeForm] = useState({
		cost: '',
		description: '',
	});
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

	const handleExchangeSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const cost = parseInt(exchangeForm.cost);
		if (!cost || cost < 1) {
			setConfirmDialog({
				open: true,
				title: '输入错误',
				message: '请输入有效的积分数量（至少为1）',
				onConfirm: () =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					}),
				confirmText: '知道了',
				cancelText: '',
			});
			return;
		}

		if (cost > totalPoints) {
			setConfirmDialog({
				open: true,
				title: '积分不足',
				message: `需要 ${cost} 积分，当前只有 ${totalPoints} 积分。`,
				onConfirm: () =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					}),
				confirmText: '知道了',
				cancelText: '',
			});
			return;
		}

		if (!exchangeForm.description.trim()) {
			setConfirmDialog({
				open: true,
				title: '输入错误',
				message: '请输入积分用途',
				onConfirm: () =>
					setConfirmDialog({
						...confirmDialog,
						open: false,
					}),
				confirmText: '知道了',
				cancelText: '',
			});
			return;
		}

		// 显示确认弹窗
		setConfirmDialog({
			open: true,
			title: '确认兑换',
			message: `确定要使用 ${cost} 积分吗？\n\n用途：${exchangeForm.description}`,
			onConfirm: () => {
				setConfirmDialog({ ...confirmDialog, open: false });
				if (deductPoints(cost)) {
					addManualRedeemRecord(
						cost,
						exchangeForm.description.trim()
					);
					setExchangeForm({ cost: '', description: '' });
					setShowExchangeDialog(false);
				} else {
					setConfirmDialog({
						open: true,
						title: '兑换失败',
						message: '积分不足，无法兑换！',
						onConfirm: () =>
							setConfirmDialog({
								...confirmDialog,
								open: false,
							}),
						confirmText: '知道了',
						cancelText: '',
					});
				}
			},
			confirmText: '确认兑换',
			cancelText: '取消',
			confirmButtonClass:
				'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
		});
	};

	const formatDateTime = (date: Date | string) => {
		const d = typeof date === 'string' ? new Date(date) : date;
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}年${month}月${day}日`;
	};

	const formatRewardDateTime = (date: Date | string) => {
		const d = typeof date === 'string' ? new Date(date) : date;
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		const hours = String(d.getHours()).padStart(2, '0');
		const minutes = String(d.getMinutes()).padStart(2, '0');
		return `${year}年${month}月${day}日 ${hours}:${minutes}`;
	};

	return (
		<div className="w-full">
			<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
				<div className="text-center mb-6">
					<div className="text-5xl font-black text-gradient mb-2">
						{totalPoints}
					</div>
					<div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
						我的积分
					</div>
				</div>
			</div>

			{/* 积分兑换入口 */}
			<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
				<h3 className="text-lg font-black text-gray-800 mb-4">
					🎁 积分兑换
				</h3>
				<button
					onClick={() => setShowExchangeDialog(true)}
					className="w-full rounded-2xl p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200/60 hover:border-purple-300/60 hover:shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-3">
					<div className="text-5xl">🎁</div>
					<div className="text-sm font-bold text-gray-700">
						点击兑换奖励
					</div>
				</button>
			</div>

			{/* 兑换记录 */}
			{redeemedRewards.length > 0 && (
				<div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
					<h3 className="text-lg font-black text-gray-800 mb-4">
						🎁 兑换记录
					</h3>
					<div className="space-y-3">
						{redeemedRewards.map(record => (
							<div
								key={record.id}
								className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200/60 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-2xl">
												🎁
											</span>
											<h4 className="font-bold text-gray-800 text-sm">
												{record.rewardName}
											</h4>
										</div>
										<p className="text-xs text-gray-500">
											{formatRewardDateTime(
												record.redeemedAt
											)}
										</p>
									</div>
									<div className="text-right">
										<div className="text-lg font-black text-red-600">
											-{record.cost}
										</div>
										<div className="text-xs text-gray-500">
											消耗积分
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="glass-effect rounded-2xl card-shadow p-5 border border-white/50">
				<h3 className="text-lg font-black text-gray-800 mb-4">
					📜 完成记录
				</h3>

				{records.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-4xl mb-3">📝</div>
						<p className="text-gray-500 text-sm">
							还没有完成记录
						</p>
						<p className="text-gray-400 text-xs mt-1">
							完成任务后，记录会显示在这里
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{records.map(record => (
							<div
								key={record.id}
								className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex justify-between items-start mb-2">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span
												className={`text-xs px-2 py-1 rounded-full font-semibold ${
													record.taskType ===
													'demon'
														? 'bg-red-500 text-white'
														: 'bg-blue-500 text-white'
												}`}>
												{record.taskType ===
												'demon'
													? '💰 付费'
													: '⭐ 主线'}
											</span>
										</div>
										<h4 className="font-bold text-gray-800 text-sm mb-1">
											{record.taskName}
										</h4>
										<p className="text-xs text-gray-500">
											{formatDateTime(
												record.completedAt
											)}
										</p>
									</div>
									<div className="text-right">
										{record.cost &&
											record.cost > 0 && (
												<div className="text-sm font-bold text-red-600 mb-1">
													-{record.cost}
												</div>
											)}
										<div className="text-lg font-black text-orange-600">
											+{record.points}
										</div>
										<div className="text-xs text-gray-500">
											{record.cost &&
											record.cost > 0
												? '净收益'
												: '任务积分'}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* 积分兑换弹窗 */}
			{showExchangeDialog && (
				<>
					{/* 蒙层 */}
					<div
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
						onClick={() => {
							setShowExchangeDialog(false);
							setExchangeForm({
								cost: '',
								description: '',
							});
						}}
					/>

					{/* 弹窗 */}
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
						<form
							onSubmit={handleExchangeSubmit}
							onClick={e => e.stopPropagation()}
							className="glass-effect rounded-2xl card-shadow-lg border border-white/50 w-full max-w-md max-h-[80vh] flex flex-col">
							{/* 固定标题 */}
							<div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200/50">
								<h3 className="text-lg font-black text-gray-800 text-center">
									🎁 积分兑换
								</h3>
							</div>

							{/* 可滚动内容区域 */}
							<div className="flex-1 overflow-y-auto px-6 py-4">
								<div className="space-y-4">
									<div>
										<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
											消耗积分
										</label>
										<input
											type="number"
											min="1"
											max={totalPoints}
											value={exchangeForm.cost}
											onChange={e =>
												setExchangeForm({
													...exchangeForm,
													cost: e.target
														.value,
												})
											}
											className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
											placeholder="请输入积分数量"
											required
										/>
										<p className="text-xs text-gray-500 mt-2 font-medium">
											当前可用积分：
											<span className="font-bold text-orange-600">
												{totalPoints}
											</span>
										</p>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
											积分用途
										</label>
										<textarea
											value={
												exchangeForm.description
											}
											onChange={e =>
												setExchangeForm({
													...exchangeForm,
													description:
														e.target
															.value,
												})
											}
											className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
											placeholder="请输入积分用途，例如：买奶茶、看电影等"
											rows={4}
											required
										/>
									</div>
								</div>
							</div>

							{/* 固定按钮区域 */}
							<div className="flex-shrink-0 px-6 pt-4 pb-6 border-t border-gray-200/50">
								<div className="flex gap-3">
									<button
										type="submit"
										className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
										确认兑换
									</button>
									<button
										type="button"
										onClick={() => {
											setShowExchangeDialog(
												false
											);
											setExchangeForm({
												cost: '',
												description: '',
											});
										}}
										className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all">
										取消
									</button>
								</div>
							</div>
						</form>
					</div>
				</>
			)}

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
