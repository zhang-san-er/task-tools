# 数据迁移文档

## 概述

本文档说明应用版本更新时的数据兼容性处理机制。应用使用 Zustand 的 `persist` 中间件将数据存储在浏览器的 localStorage 中，当应用更新时，需要确保历史数据能够正确迁移到新版本。

## 数据存储位置

所有数据存储在浏览器的 localStorage 中，使用以下键名：

- `habit-game-tasks` - 任务数据
- `habit-game-user` - 用户数据
- `habit-game-rewards` - 奖励数据
- `habit-game-task-records` - 任务完成记录

## 数据迁移机制

### taskStore 迁移

`taskStore` 的 `migrate` 函数会自动处理以下情况：

1. **日期字段序列化/反序列化**
   - `createdAt`、`expiresAt`、`completedAt` 字段在存储时会被序列化为字符串
   - 迁移时会自动转换为 Date 对象
   - 如果字段不存在，会设置合理的默认值

2. **缺失字段补全**
   - `isRepeatable`: 如果不存在，默认为 `true`（周期任务）
   - `isClaimed`: 如果不存在，默认为 `false`（未领取）
   - `isStarted`: 如果不存在，默认为 `false`（未开始）
   - `isCompleted`: 如果不存在，默认为 `false`（未完成）
   - `entryCost`: 对于付费任务（`type === 'demon'`），如果不存在则设为 0

3. **数据格式验证**
   - 确保任务类型（`type`）为 `'main'` 或 `'demon'`
   - 确保积分（`points`）为有效数字

### userStore 迁移

`userStore` 的 `migrate` 函数处理：

1. **字段重命名**
   - 旧版本的 `health` 字段会自动迁移到 `experience` 字段
   - 迁移后删除旧的 `health` 字段

2. **默认值设置**
   - 如果用户数据不存在，会使用初始值：
     - `level: 1`
     - `totalPoints: 0`
     - `currentPoints: 0`
     - `experience: 0`

### rewardStore 迁移

`rewardStore` 的迁移处理：

1. **奖励状态字段**
   - `isActive` 字段如果不存在，默认为 `true`（上架状态）

2. **兑换记录日期**
   - `redeemedAt` 字段会自动转换为 Date 对象

### taskRecordStore 迁移

`taskRecordStore` 的迁移处理：

1. **完成日期字段**
   - `completedAt` 字段会自动转换为 Date 对象

## 版本更新时的数据兼容性

### 新增功能兼容性

当应用添加新功能时，迁移函数会确保：

1. **任务编辑功能**
   - 历史任务数据完全兼容，可以正常编辑
   - 编辑时保留任务的 `id`、`createdAt` 等原始字段

2. **剩余天数显示**
   - 历史任务如果有 `expiresAt` 字段，会自动计算并显示剩余天数
   - 如果 `expiresAt` 不存在，则不显示

3. **非付费任务流程优化**
   - 历史任务根据 `type` 字段自动应用新的流程
   - `type === 'main'` 的任务直接显示完成按钮
   - `type === 'demon'` 的任务保持原有领取流程

4. **积分兑换模块重构**
   - 兑换记录存储在 `rewardStore` 中，不受影响
   - 历史兑换记录会自动显示在"兑换记录"区域

## 数据备份建议

虽然应用会自动处理数据迁移，但建议用户定期备份数据：

1. 使用"数据管理"页面的导出功能
2. 导出数据为 JSON 文件
3. 定期保存备份文件

## 故障排除

如果遇到数据迁移问题：

1. **检查浏览器控制台**
   - 查看是否有迁移相关的错误信息

2. **清除缓存**
   - 如果迁移失败，可以尝试清除浏览器缓存
   - 注意：这会删除所有本地数据

3. **手动修复**
   - 如果数据损坏，可以使用"数据管理"页面导入之前导出的备份
   - 或者使用"清除所有数据"功能重新开始

## 技术实现

迁移函数在 Zustand 的 `persist` 中间件中实现：

```typescript
persist(
  (set, get) => ({
    // store 实现
  }),
  {
    name: 'storage-key',
    migrate: (persistedState: any) => {
      // 迁移逻辑
      return persistedState;
    },
  }
)
```

迁移函数会在应用启动时自动执行，确保数据格式与当前版本兼容。

