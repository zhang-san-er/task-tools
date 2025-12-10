import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRewardStore } from '../stores/rewardStore';
import { useUserStore } from '../stores/userStore';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const RewardRecords: React.FC = () => {
	const navigate = useNavigate();
	const { getRedeemedRewards, deleteRedeemRecord } = useRewardStore();
	const { addPoints } = useUserStore();
	const records = getRedeemedRewards();
	
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

	const formatDateTime = (date: Date | string) => {
		const d = typeof date === 'string' ? new Date(date) : date;
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		const hours = String(d.getHours()).padStart(2, '0');
		const minutes = String(d.getMinutes()).padStart(2, '0');
		return `${year}年${month}月${day}日 ${hours}:${minutes}`;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
			<div className="w-full max-w-md mx-auto min-h-screen pb-8">
				{/* 顶部装饰 */}
				<div className="gradient-bg w-full h-32 rounded-b-3xl relative overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

					<header className="relative z-10 text-center pt-8 px-4">
						<div className="flex items-center justify-center gap-2 mb-2">
							<button
								onClick={() => navigate('/task-platform')}
								className="text-white/80 hover:text-white transition-colors p-1">
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
								🎁 兑换记录
							</h1>
							<div className="w-8"></div>
						</div>
						<p className="text-white/90 text-sm font-medium">
							共 {records.length} 条记录
						</p>
					</header>
				</div>

				<div className="px-4 -mt-6 relative z-20">
					{records.length === 0 ? (
						<div className="glass-effect rounded-2xl card-shadow p-8 border border-white/50 text-center">
							<div className="text-4xl mb-3">🎁</div>
							<p className="text-gray-500 text-sm">
								还没有兑换记录
							</p>
							<p className="text-gray-400 text-xs mt-1">
								兑换奖励后，记录会显示在这里
							</p>
						</div>
					) : (
						<div className="glass-effect rounded-2xl card-shadow p-5 border border-white/50">
							<div className="space-y-3">
								{records.map(record => (
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
													{formatDateTime(
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
				</div>

				<footer className="mt-8 px-4 text-center text-xs text-gray-400 pb-8">
					<p>✨ 数据安全存储在本地，完全离线可用</p>
				</footer>
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

