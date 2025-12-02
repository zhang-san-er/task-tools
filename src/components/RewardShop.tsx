import React from 'react';
import { useRewardStore } from '../stores/rewardStore';
import { useUserStore } from '../stores/userStore';

export const RewardShop: React.FC = () => {
  const { rewards, redeemReward } = useRewardStore();
  const { totalPoints, deductPoints } = useUserStore();

  const handleRedeem = (rewardId: string, cost: number, name: string) => {
    if (totalPoints < cost) {
      alert(`积分不足！需要 ${cost} 积分，当前只有 ${totalPoints} 积分。`);
      return;
    }

    if (confirm(`确定要用 ${cost} 积分兑换「${name}」吗？`)) {
      if (deductPoints(cost)) {
        redeemReward(rewardId);
        alert(`🎉 兑换成功！已扣除 ${cost} 积分。`);
      } else {
        alert('兑换失败，积分不足！');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="glass-effect rounded-2xl card-shadow p-5 mb-4 border border-white/50">
        <div className="text-center mb-2">
          <div className="text-3xl mb-2">🛍️</div>
          <div className="text-lg font-black text-gray-800 mb-1">积分商城</div>
          <div className="text-sm text-gray-600">当前积分：<span className="font-bold text-orange-600">{totalPoints}</span></div>
        </div>
      </div>

      <div className="space-y-3">
        {rewards.map((reward) => {
          const canAfford = totalPoints >= reward.cost;
          
          return (
            <div
              key={reward.id}
              className={`glass-effect rounded-2xl card-shadow p-4 border-2 transition-all ${
                canAfford
                  ? 'border-purple-200/50 hover:border-purple-300/50'
                  : 'border-gray-200/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{reward.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-gray-800">{reward.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      reward.category === 'virtual'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {reward.category === 'virtual' ? '虚拟' : '实物'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-black text-orange-600">
                      {reward.cost} 积分
                    </div>
                    <button
                      onClick={() => handleRedeem(reward.id, reward.cost, reward.name)}
                      disabled={!canAfford}
                      className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
                        canAfford
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200 hover:shadow-purple-300'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '立即兑换' : '积分不足'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

