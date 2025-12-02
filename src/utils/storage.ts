const STORAGE_VERSION = '1.0.0';
const STORAGE_KEY_PREFIX = 'habit-game-';

/**
 * 获取存储键名
 */
const getStorageKey = (key: string): string => {
  return `${STORAGE_KEY_PREFIX}${key}`;
};

/**
 * 保存数据到localStorage
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const storageKey = getStorageKey(key);
    const serialized = JSON.stringify({
      version: STORAGE_VERSION,
      data,
      timestamp: Date.now()
    });
    localStorage.setItem(storageKey, serialized);
  } catch (error) {
    console.error('保存数据失败:', error);
  }
};

/**
 * 从localStorage读取数据
 */
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storageKey = getStorageKey(key);
    const item = localStorage.getItem(storageKey);
    if (!item) {
      return defaultValue;
    }
    
    const parsed = JSON.parse(item);
    // 可以在这里检查版本号，进行数据迁移
    return parsed.data as T;
  } catch (error) {
    console.error('读取数据失败:', error);
    return defaultValue;
  }
};

/**
 * 导出所有数据为JSON
 */
export const exportData = (): string => {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value) {
        data[key] = JSON.parse(value);
      }
    }
  }
  return JSON.stringify(data, null, 2);
};

/**
 * 导入数据
 */
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
};

/**
 * 清除所有应用数据
 */
export const clearAllData = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

