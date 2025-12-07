/**
 * 计算超越天数奖励积分
 * @param formula 奖励公式，如 "2n+10"，n为超越天数
 * @param exceedDays 超越天数（负数或0表示未超越）
 * @returns 奖励积分，如果未超越则返回0
 */
export const calculateExceedDaysReward = (
	formula: string | undefined,
	exceedDays: number
): number => {
    exceedDays = 2;
	if (!formula || exceedDays <= 0) {
		return 0;
	}

	try {
		// 清理公式字符串，移除空格
		const cleanFormula = formula.trim().replace(/\s/g, '');

		// 验证公式格式（允许 n 变量）
		if (!/^[0-9+\-*/().n\s]+$/.test(cleanFormula)) {
			console.warn('Invalid formula format:', formula);
			return 0;
		}

		let totalReward = 0;

		// 遍历每一天，计算每天的奖励并累加
		for (let day = 1; day <= exceedDays; day++) {
			// 将公式中的 n 替换为当前天数
			const expression = cleanFormula.replace(
				/n/g,
				day.toString()
			);

			// 验证替换后的表达式只包含数字和运算符
			if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
				console.warn(
					'Invalid expression after replacement:',
					expression
				);
				continue;
			}

			// 计算当天的奖励
			const dailyReward = Function(
				`"use strict"; return (${expression})`
			)();

			// 确保结果是数字且非负
			if (
				typeof dailyReward === 'number' &&
				!isNaN(dailyReward) &&
				dailyReward >= 0
			) {
				totalReward += dailyReward;
			}
		}

		// 向下取整并返回总奖励
		return Math.floor(totalReward);
	} catch (error) {
		console.warn('Error calculating reward:', error);
		return 0;
	}
};

/**
 * 计算任务的超越天数
 * @param expiresAt 任务截止日期
 * @param claimedAt 任务领取日期
 * @param durationDays 持续天数
 * @returns 超越天数（负数表示未到期，0表示今天到期，正数表示已超越）
 */
export const calculateExceedDays = (
	expiresAt: Date | undefined,
	claimedAt: Date | undefined,
	durationDays: number | undefined
): number => {
	if (!expiresAt) {
		return 0;
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const expiryDate = new Date(expiresAt);
	expiryDate.setHours(0, 0, 0, 0);

	// 计算超越天数（今天 - 截止日期）
	const diffTime = today.getTime() - expiryDate.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	return diffDays;
};
