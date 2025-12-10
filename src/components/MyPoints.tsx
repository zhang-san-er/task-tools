import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskRecordStore } from '../stores/taskRecordStore';
import { useUserStore } from '../stores/userStore';
import { useRewardStore } from '../stores/rewardStore';
import { ConfirmDialog } from './ConfirmDialog';

export const MyPoints: React.FC = () => {
	const navigate = useNavigate();
	const { totalPoints, deductPoints, removePoints, removeExperience, addPoints } = useUserStore();
	const { getRecords, deleteRecord } = useTaskRecordStore();
	const { getRedeemedRewards, addManualRedeemRecord, deleteRedeemRecord } =
		useRewardStore();
	const records = getRecords();
	const redeemedRewards = getRedeemedRewards();
	const displayedRecords = records.slice(0, 5);
	const hasMoreRecords = records.length > 5;

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

		const cost = parseFloat(exchangeForm.cost);
		if (!cost || cost < 0.1) {
			setConfirmDialog({
				open: true,
				title: '输入错误',
				message: '请输入有效的积分数量（至少为0.1）',
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

		const newTotalPoints = totalPoints - cost;
		const pointsMessage = newTotalPoints < 0 
			? `\n\n⚠️ 兑换后积分将变为 ${newTotalPoints}（负分，超前消费）`
			: `\n\n兑换后剩余积分：${newTotalPoints}`;

		// 显示确认弹窗
		setConfirmDialog({
			open: true,
			title: '确认兑换',
			message: `确定要使用 ${cost.toFixed(1)} 积分吗？\n\n用途：${exchangeForm.description}${pointsMessage}`,
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
						message: '兑换失败！',
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
		const hours = String(d.getHours()).padStart(2, '0');
		const minutes = String(d.getMinutes()).padStart(2, '0');
		return `${year}年${month}月${day}日 ${hours}:${minutes}`;
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

			{/* 积分兑换入口和日历入口 */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<div className="glass-effect rounded-xl card-shadow p-3 border border-white/50">
					<h3 className="text-sm font-black text-gray-800 mb-2">
						🎁 积分兑换
					</h3>
					<button
						onClick={() => setShowExchangeDialog(true)}
						className="w-full rounded-lg p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200/60 hover:border-purple-300/60 hover:shadow-md transition-all active:scale-95 flex flex-row items-center justify-center gap-2">
						<div className="text-xl">🎁</div>
						<div className="text-xs font-bold text-gray-700">
							兑换奖励
						</div>
					</button>
				</div>
				<div className="glass-effect rounded-xl card-shadow p-3 border border-white/50">
					<h3 className="text-sm font-black text-gray-800 mb-2">
						📅 任务日历
					</h3>
					<button
						onClick={() => navigate('/task-platform/calendar')}
						className="w-full rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/60 hover:border-blue-300/60 hover:shadow-md transition-all active:scale-95 flex flex-row items-center justify-center gap-2">
						<div className="text-xl">📅</div>
						<div className="text-xs font-bold text-gray-700">
							查看日历
						</div>
					</button>
				</div>
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
									<div className="flex items-center gap-2">
										<div className="text-right">
											<div className="text-lg font-black text-red-600">
												-{record.cost.toFixed(1)}
											</div>
											<div className="text-xs text-gray-500">
												消耗积分
											</div>
										</div>
										<button
											onClick={() => {
												setConfirmDialog({
													open: true,
													title: '删除兑换记录',
													message: `确定要删除「${record.rewardName}」的兑换记录吗？\n\n⚠️ 删除后将返还 ${record.cost.toFixed(1)} 积分`,
													onConfirm: () => {
														const deletedRecord = deleteRedeemRecord(record.id);
														if (deletedRecord) {
															// 返还兑换时扣除的积分
															addPoints(deletedRecord.cost);
														}
														setConfirmDialog({
															...confirmDialog,
															open: false,
														});
													},
													confirmText: '删除',
													cancelText: '取消',
													confirmButtonClass: 'bg-red-500 text-white',
												});
											}}
											className="text-gray-400 hover:text-red-500 transition-colors p-1"
											aria-label="删除记录">
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
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
					<>
						<div className="space-y-3">
							{displayedRecords.map(record => (
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
														? '⚡ 付费'
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
										<div className="flex items-center gap-2">
											<div className="text-right">
												{record.cost &&
													record.cost > 0 && (
														<div className="text-sm font-bold text-red-600 mb-1">
															-{record.cost.toFixed(1)}
														</div>
													)}
												<div className="text-lg font-black text-orange-600">
													+{record.points.toFixed(1)}
												</div>
												<div className="text-xs text-gray-500">
													{record.cost &&
													record.cost > 0
														? '净收益'
														: '任务积分'}
												</div>
											</div>
											<button
												onClick={() => {
													// 计算需要回退的积分和经验
													const pointsToRollback = record.points;
													const costToRollback = record.cost || 0;
													const totalRollback = pointsToRollback + costToRollback;
													
													setConfirmDialog({
														open: true,
														title: '删除完成记录',
														message: `确定要删除「${record.taskName}」的完成记录吗？\n\n⚠️ 删除后将回退：\n- 积分：${pointsToRollback.toFixed(1)}\n${costToRollback > 0 ? `- 入场费：${costToRollback.toFixed(1)}\n` : ''}- 经验：${pointsToRollback.toFixed(1)}\n总计回退：${totalRollback.toFixed(1)} 积分`,
														onConfirm: () => {
															// 回退积分和经验
															if (totalRollback > 0) {
																removePoints(totalRollback);
															}
															if (pointsToRollback > 0) {
																removeExperience(pointsToRollback);
															}
															// 删除记录
															deleteRecord(record.id);
															setConfirmDialog({
																...confirmDialog,
																open: false,
															});
														},
														confirmText: '删除',
														cancelText: '取消',
														confirmButtonClass: 'bg-red-500 text-white',
													});
												}}
												className="text-gray-400 hover:text-red-500 transition-colors p-1"
												aria-label="删除记录">
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
						{hasMoreRecords && (
							<button
								onClick={() =>
									navigate('/task-platform/records')
								}
								className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all">
								查看全部记录 ({records.length} 条)
							</button>
						)}
					</>
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
							className="glass-effect rounded-2xl card-shadow-lg border border-white/50 w-full max-w-sm max-h-[70vh] flex flex-col">
							{/* 固定标题 */}
							<div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-200/50">
								<h3 className="text-base font-black text-gray-800 text-center">
									🎁 积分兑换
								</h3>
							</div>

							{/* 可滚动内容区域 */}
							<div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
								<div className="space-y-3">
									<div>
										<label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
											消耗积分
										</label>
										<input
											type="number"
											step="0.1"
											min="0.1"
											value={exchangeForm.cost}
											onChange={e =>
												setExchangeForm({
													...exchangeForm,
													cost: e.target
														.value,
												})
											}
											className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-sm"
											placeholder="请输入积分数量"
											required
										/>
										<p className="text-xs text-gray-500 mt-1.5 font-medium">
											当前积分：
											<span className="font-bold text-orange-600">
												{totalPoints}
											</span>
											<span className="text-gray-400 ml-2">
												（允许负分，支持超前消费，支持0.1积分级别）
											</span>
										</p>
									</div>

									<div>
										<label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
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
											className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-sm"
											placeholder="请输入积分用途，例如：买奶茶、看电影等"
											rows={3}
											required
										/>
									</div>
								</div>
							</div>

							{/* 固定按钮区域 */}
							<div className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-gray-200/50">
								<div className="flex gap-2">
									<button
										type="submit"
										className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">
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
										className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all">
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
