# 项目架构文档

## 项目结构

```
task-tools/
├── src/
│   ├── components/          # React 组件
│   │   ├── TaskCard.tsx     # 任务卡片组件
│   │   ├── TaskForm.tsx     # 任务创建表单
│   │   ├── TaskList.tsx     # 任务列表
│   │   ├── UserStats.tsx    # 用户统计信息
│   │   ├── MyPoints.tsx     # 积分页面
│   │   ├── RewardShop.tsx  # 奖励商城
│   │   ├── DataManager.tsx  # 数据管理
│   │   ├── ConfirmDialog.tsx # 确认对话框
│   │   ├── LevelProgress.tsx # 等级进度条
│   │   └── HealthBar.tsx    # 经验值进度条
│   ├── stores/              # Zustand 状态管理
│   │   ├── taskStore.ts     # 任务状态管理
│   │   ├── userStore.ts     # 用户状态管理
│   │   ├── rewardStore.ts   # 奖励状态管理
│   │   └── taskRecordStore.ts # 任务记录管理
│   ├── types/               # TypeScript 类型定义
│   │   ├── task.ts          # 任务类型
│   │   ├── user.ts          # 用户类型
│   │   ├── reward.ts        # 奖励类型
│   │   └── taskRecord.ts    # 任务记录类型
│   ├── utils/               # 工具函数
│   │   ├── dateUtils.ts     # 日期工具
│   │   ├── levelCalculator.ts # 等级计算
│   │   └── storage.ts       # 数据导入导出
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── docs/                    # 项目文档
└── package.json            # 项目配置
```

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型系统
- **Zustand** - 状态管理（带持久化）
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具
- **PWA** - 渐进式 Web 应用支持

## 数据流

### Store 结构

1. **taskStore** - 任务管理
   - `tasks`: Task[] - 任务列表
   - `addTask()` - 添加任务
   - `toggleTaskCompletion()` - 切换完成状态
   - `claimTask()` / `unclaimTask()` - 领取/取消领取
   - `deleteTask()` - 删除任务

2. **userStore** - 用户数据
   - `level`: number - 用户等级
   - `totalPoints`: number - 总积分
   - `experience`: number - 经验值
   - `streak`: number - 连续坚持天数
   - `addPoints()` - 增加积分
   - `deductPoints()` - 扣除积分
   - `handleTaskCompletion()` - 处理任务完成

3. **rewardStore** - 奖励商城
   - `rewards`: Reward[] - 奖励列表
   - `redeemedRewards`: RewardRecord[] - 兑换记录
   - `addReward()` - 添加奖励
   - `redeemReward()` - 兑换奖励

4. **taskRecordStore** - 任务记录
   - `records`: TaskRecord[] - 完成记录
   - `addRecord()` - 添加记录
   - `getRecords()` - 获取记录

### 数据持久化

所有 Store 使用 Zustand 的 `persist` 中间件，数据存储在 localStorage：
- `habit-game-tasks` - 任务数据
- `habit-game-user` - 用户数据
- `habit-game-rewards` - 奖励数据
- `habit-game-task-records` - 任务记录

**重要：** 关于数据管理架构和入口级别的数据隔离原则，请参考 [数据管理架构文档](./DATA_ARCHITECTURE.md)。

## 组件说明

### 核心组件

- **App.tsx** - 主应用，管理页面路由和导航
- **TaskList** - 任务列表，支持筛选和创建
- **TaskCard** - 单个任务卡片，显示任务信息和操作按钮
- **TaskForm** - 任务创建/编辑表单弹窗

### 功能组件

- **UserStats** - 显示用户等级、积分、连续天数
- **MyPoints** - 积分页面，显示积分和完成记录
- **RewardShop** - 奖励商城，支持兑换和管理
- **DataManager** - 数据导入导出和清除

### 通用组件

- **ConfirmDialog** - 确认对话框，统一弹窗样式
- **LevelProgress** - 等级进度条
- **HealthBar** - 经验值进度条

## 样式系统

- 使用 Tailwind CSS 工具类
- 自定义工具类（`index.css`）：
  - `.glass-effect` - 毛玻璃效果
  - `.card-shadow` - 卡片阴影
  - `.gradient-bg` - 渐变背景
  - `.text-gradient` - 渐变文字

## 弹窗布局规范

所有弹窗遵循统一布局：
- 标题固定在顶部（`flex-shrink-0`）
- 内容区域可滚动（`flex-1 overflow-y-auto`）
- 按钮固定在底部（`flex-shrink-0`）
- 使用 `flex flex-col` 布局，最大高度 `max-h-[80vh]`

