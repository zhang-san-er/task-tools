/**
 * 格式化日期为 YYYY-MM-DD
 */
export const formatDate = (date: Date | string): string => {
	const d = typeof date === 'string' ? new Date(date) : date;
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

/**
 * 检查日期是否是今天
 */
export const isToday = (date: Date | string): boolean => {
	const today = new Date();
	return formatDate(date) === formatDate(today);
};

/**
 * 检查日期是否已过期
 */
export const isExpired = (date: Date | string): boolean => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const compareDate =
		typeof date === 'string' ? new Date(date) : new Date(date);
	compareDate.setHours(0, 0, 0, 0);
	return compareDate < today;
};

/**
 * 获取今天的开始时间
 */
export const getTodayStart = (): Date => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
};

/**
 * 获取明天的开始时间
 */
export const getTomorrowStart = (): Date => {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	return tomorrow;
};

/**
 * 计算剩余天数
 * @param expiresAt 截止日期
 * @returns 剩余天数，如果已过期返回负数，如果今天到期返回0
 */
export const getDaysRemaining = (
	expiresAt: Date | string
): number => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const expiryDate =
		typeof expiresAt === 'string'
			? new Date(expiresAt)
			: new Date(expiresAt);
	expiryDate.setHours(0, 0, 0, 0);

	const diffTime = expiryDate.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return diffDays;
};
