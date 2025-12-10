# 数据管理架构文档

## 核心原则

**重要：每个工具入口必须拥有独立的数据存储空间，实现数据隔离。**

本应用是一个工具集平台，每个工具入口（如任务平台、未来可能添加的其他工具）都应该有自己独立的数据存储命名空间，避免不同工具之间的数据冲突。

## 存储键命名规范

### 当前命名规范（任务平台）

任务平台作为第一个工具入口，使用以下存储键：

- `habit-game-tasks` - 任务数据
- `habit-game-user` - 用户数据（等级、积分、经验值）
- `habit-game-rewards` - 奖励商城数据
- `habit-game-task-records` - 任务完成记录

### 未来工具命名规范

**为新的工具入口创建数据存储时，必须遵循以下命名规范：**

```
{app-prefix}-{tool-id}-{data-type}
```

**示例：**
- 如果添加一个"番茄钟"工具（tool-id: `pomodoro`），存储键应该是：
  - `habit-game-pomodoro-tasks` - 番茄钟任务
  - `habit-game-pomodoro-sessions` - 番茄钟会话记录
  - `habit-game-pomodoro-settings` - 番茄钟设置

- 如果添加一个"记账本"工具（tool-id: `accounting`），存储键应该是：
  - `habit-game-accounting-transactions` - 交易记录
  - `habit-game-accounting-categories` - 分类数据
  - `habit-game-accounting-budgets` - 预算数据

### 命名规则

1. **前缀统一**：所有存储键使用 `habit-game-` 作为应用前缀
2. **工具标识**：使用 `{tool-id}` 标识工具（小写，使用连字符分隔）
3. **数据类型**：使用 `{data-type}` 描述数据类型（小写，使用连字符分隔）
4. **避免冲突**：确保不同工具的数据类型名称不冲突

## Zustand Store 配置规范

### 创建新工具的 Store

为新工具创建 Zustand store 时，必须指定独立的存储键：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义工具ID常量
const TOOL_ID = 'your-tool-id';

export const useYourToolStore = create<YourToolState>()(
  persist(
    (set, get) => ({
      // store 实现
    }),
    {
      name: `habit-game-${TOOL_ID}-your-data-type`, // 必须包含工具ID
    }
  )
);
```

### 存储键命名示例

```typescript
// ✅ 正确：包含工具ID
name: 'habit-game-pomodoro-tasks'
name: 'habit-game-accounting-transactions'

// ❌ 错误：缺少工具ID，会导致数据冲突
name: 'habit-game-tasks'  // 这是任务平台的存储键
name: 'habit-game-user'   // 这是任务平台的存储键
```

## 数据隔离原则

### 1. 每个工具独立存储

- 每个工具入口必须使用独立的存储键前缀
- 不同工具的数据不能共享存储键
- 即使数据类型相同（如"任务"），不同工具也应该使用不同的存储键

### 2. 用户数据隔离

**重要决策：用户数据（等级、积分等）的处理方式**

- **选项A：全局共享用户数据**（当前任务平台的实现）
  - 所有工具共享同一套用户等级和积分系统
  - 存储键：`habit-game-user`
  - 适用于：希望统一积分体系的场景

- **选项B：每个工具独立用户数据**
  - 每个工具有独立的用户数据
  - 存储键：`habit-game-{tool-id}-user`
  - 适用于：希望每个工具独立的场景

**当前实现采用选项A**，但未来如需支持独立用户数据，应使用选项B的命名规范。

### 3. 数据导入导出

使用 `src/utils/storage.ts` 中的工具函数时，需要注意：

- `exportData()` - 导出所有以 `habit-game-` 开头的数据
- `importData()` - 导入数据时，会保留存储键名
- `clearAllData()` - 清除所有以 `habit-game-` 开头的数据

**建议：** 未来可以为每个工具提供独立的数据导入导出功能。

## 实现检查清单

为新工具创建数据存储时，请检查：

- [ ] 存储键名包含工具ID：`habit-game-{tool-id}-{data-type}`
- [ ] 不同工具使用不同的存储键前缀
- [ ] Zustand persist 配置中正确设置了 `name` 属性
- [ ] 数据导入导出功能考虑了工具隔离
- [ ] 文档中记录了新工具的存储键命名

## 当前工具存储映射

### 任务平台（Task Platform）

| 数据类型 | 存储键 | Store |
|---------|--------|-------|
| 任务列表 | `habit-game-tasks` | `useTaskStore` |
| 用户数据 | `habit-game-user` | `useUserStore` |
| 奖励商城 | `habit-game-rewards` | `useRewardStore` |
| 任务记录 | `habit-game-task-records` | `useTaskRecordStore` |

## 迁移注意事项

如果未来需要重构现有存储键名（例如将任务平台的数据迁移到 `habit-game-task-platform-*`），需要：

1. 创建数据迁移函数
2. 在 persist 配置中使用 `migrate` 函数
3. 保持向后兼容性
4. 更新文档

## 最佳实践

1. **工具ID命名**：使用小写字母和连字符，如 `task-platform`、`pomodoro-timer`
2. **数据类型命名**：使用复数形式，如 `tasks`、`sessions`、`transactions`
3. **避免缩写**：使用完整的描述性名称，避免 `t`、`u`、`r` 等缩写
4. **文档记录**：在 `DATA_ARCHITECTURE.md` 中记录每个工具的存储键映射
5. **类型安全**：为每个工具的数据类型定义 TypeScript 类型

## 总结

**核心原则：入口级别的数据隔离**

- ✅ 每个工具入口使用独立的存储命名空间
- ✅ 存储键名格式：`habit-game-{tool-id}-{data-type}`
- ✅ 避免不同工具之间的数据冲突
- ✅ 保持数据管理的清晰和可维护性

遵循这些规范，可以确保应用在添加新工具时保持数据隔离和代码清晰。







