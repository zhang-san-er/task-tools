# 工具集 PWA

一个完全离线的实用工具合集，支持 PWA 安装，数据存储在本地浏览器。包含任务管理、想法记录等多种实用工具。

## 项目定位

**移动端优先项目**：本项目主要面向移动端用户，特别是苹果手机（iPhone）用户。所有交互设计均针对触摸操作优化，不考虑 PC 端的鼠标悬停（hover）交互。

## 工具列表

### 🎯 任务平台

-   **任务管理**：创建和管理主线任务、付费挑战
-   **积分系统**：完成任务获得积分，升级等级
-   **奖励商城**：使用积分兑换虚拟或实物奖励
-   **任务记录**：查看历史任务完成记录和积分变化

### 💭 想法记录

-   **分类管理**：支持多个分区，自定义分区名称
-   **标签系统**：为想法添加标签，快速分类
-   **智能筛选**：按分区、标签筛选想法
-   **数据管理**：导出、导入、清除本地数据

## 功能特性

-   ✅ **完全离线**：所有数据存储在 localStorage，无需网络
-   ✅ **PWA 支持**：可安装到主屏幕，像原生应用一样使用
-   ✅ **移动端优化**：专为 iPhone 设计，触摸交互优化
-   ✅ **数据安全**：数据存储在本地，支持导出备份
-   ✅ **多工具集成**：一个应用包含多种实用工具

## 技术栈

-   React 18 + TypeScript
-   Vite（构建工具）
-   Zustand（状态管理）
-   Tailwind CSS（样式）
-   Vite PWA Plugin（PWA 支持）

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署

构建完成后，`dist` 目录包含所有静态文件，可以：

1. **直接部署**：将 `dist` 目录上传到任何静态文件服务器
2. **打包下载**：将 `dist` 目录压缩为 ZIP 文件，用户下载后解压即可使用
3. **本地使用**：直接打开 `dist/index.html`（需要启动本地服务器，因为 Service Worker 需要 HTTPS 或 localhost）

## 注意事项

-   Service Worker 需要 HTTPS 环境（或 localhost）才能正常工作
-   图标文件需要手动添加到 `public/icons/` 目录
-   所有数据存储在浏览器本地，清除浏览器数据会丢失所有记录

## 项目结构

```
task-tools/
├── public/          # 静态资源
├── src/
│   ├── components/  # React组件
│   ├── stores/      # Zustand状态管理
│   ├── types/       # TypeScript类型定义
│   ├── pages/       # 页面组件
│   └── utils/       # 工具函数
└── dist/            # 构建输出（构建后生成）
```

## 工具集开发规范

### 设计原则

1. **移动端优先**：所有设计以移动端（特别是 iPhone）为基准
2. **触摸优化**：使用 `active:` 伪类而非 `hover:`，所有交互通过点击/触摸触发
3. **一致性**：新工具应遵循现有工具的设计风格和交互模式
4. **离线优先**：所有数据存储在本地，支持完全离线使用

### 风格规范

#### 字体大小

-   **标题**：`text-3xl` (30px) - 页面主标题
-   **副标题**：`text-lg` (18px) - 弹窗标题、卡片标题
-   **正文**：`text-sm` (14px) - 主要内容、卡片内容
-   **小字**：`text-xs` (12px) - 辅助信息、标签、时间
-   **超小字**：`text-[10px]` - 标签、徽章文字

#### 颜色规范

-   **主色调**：蓝色渐变 `from-blue-500 to-indigo-500`
-   **次要操作**：紫色渐变 `from-purple-500 to-pink-500`
-   **危险操作**：红色 `bg-red-500`
-   **成功/确认**：绿色 `bg-green-500`
-   **文字颜色**：
    -   主文字：`text-gray-800`
    -   次要文字：`text-gray-600`
    -   辅助文字：`text-gray-400` / `text-gray-500`

#### 间距规范

-   **卡片内边距**：`p-3` 或 `p-4`
-   **卡片间距**：`mb-3` 或 `space-y-3`
-   **按钮内边距**：`px-3 py-2` 或 `px-4 py-2.5`
-   **元素间距**：`gap-2` 或 `gap-1.5`

#### 圆角规范

-   **卡片**：`rounded-xl` (12px) 或 `rounded-2xl` (16px)
-   **按钮**：`rounded-lg` (8px) 或 `rounded-xl`
-   **标签**：`rounded-md` (6px) 或 `rounded-lg`

### 组件使用规范

#### 卡片组件

```tsx
// 标准卡片结构
<div className="glass-effect rounded-xl p-3 mb-3 card-shadow border border-blue-200/60">
	{/* 卡片内容 */}
</div>
```

#### 按钮组件

```tsx
// 主要按钮
<button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md active:scale-95 transition-all">
  操作
</button>

// 次要按钮
<button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold active:scale-95 transition-all">
  取消
</button>

// 危险按钮
<button className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold active:scale-95 transition-all">
  删除
</button>
```

#### 弹窗组件

使用统一的 `ConfirmDialog` 组件：

```tsx
<ConfirmDialog
	open={showDialog}
	title="确认操作"
	message="确定要执行此操作吗？"
	onConfirm={handleConfirm}
	onCancel={handleCancel}
	confirmText="确认"
	cancelText="取消"
	confirmButtonClass="bg-red-500 text-white"
/>
```

#### 数据管理弹窗

参考 `DataManagerDialog` 组件，包含：

-   数据统计显示
-   导出数据功能
-   导入数据功能（带文件选择器）
-   清除数据功能（带确认对话框）

### 功能架构规范

#### 1. CRUD 操作

所有工具必须支持：

-   ✅ **创建（Create）**：通过表单创建新条目
-   ✅ **读取（Read）**：列表展示，支持筛选和排序
-   ✅ **更新（Update）**：点击卡片进入编辑模式
-   ✅ **删除（Delete）**：删除按钮 + 确认对话框

#### 2. 编辑功能

-   点击卡片进入编辑模式（显示表单）
-   表单使用统一的 `Form` 组件或参考 `IdeaForm` / `TaskForm`
-   支持取消和保存操作
-   编辑时显示原始数据

#### 3. 删除功能

-   删除按钮位于卡片右上角或操作区域
-   必须使用 `ConfirmDialog` 进行二次确认
-   删除操作不可撤销，提示要明确

#### 4. 数据存储

使用 Zustand + persist 中间件：

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useToolStore = create<ToolState>()(
	persist(
		(set, get) => ({
			items: [],
			addItem: item =>
				set(state => ({ items: [...state.items, item] })),
			updateItem: (id, item) =>
				set(state => ({
					items: state.items.map(i =>
						i.id === id ? item : i
					),
				})),
			deleteItem: id =>
				set(state => ({
					items: state.items.filter(i => i.id !== id),
				})),
		}),
		{
			name: 'tool-storage-key', // localStorage key
			migrate: persistedState => {
				// 数据迁移逻辑
				return persistedState;
			},
		}
	)
);
```

#### 5. 数据导入导出

参考 `DataManagerDialog` 实现：

-   **导出**：将数据转换为 JSON，使用 Blob 下载
-   **导入**：读取 JSON 文件，验证格式，显示确认对话框
-   **清除**：清除所有数据，需要二次确认

```tsx
// 导出示例
const handleExport = () => {
	const data = {
		items: items.map(item => ({
			...item,
			createdAt:
				item.createdAt instanceof Date
					? item.createdAt.toISOString()
					: item.createdAt,
		})),
		exportDate: new Date().toISOString(),
	};
	const jsonStr = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonStr], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `数据备份_${formatDate(new Date())}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};
```

#### 6. 筛选和排序

-   支持按分类/标签筛选（参考 `IdeaNotes`）
-   默认按创建时间倒序排列
-   筛选按钮使用统一的样式

#### 7. 日期时间显示

-   时间显示：`HH:mm` 格式（如 `14:30`）
-   日期分组：今天、昨天、具体日期
-   使用 `dateUtils.ts` 中的工具函数

### 页面结构规范

#### 标准页面布局

```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
	<div className="w-full max-w-md mx-auto min-h-screen pb-24">
		{/* 顶部装饰 */}
		<div className="gradient-bg w-full h-32 rounded-b-3xl">
			<header>
				<h1>工具名称</h1>
				<p>工具描述</p>
			</header>
		</div>

		{/* 内容区域 */}
		<div className="px-4 -mt-6 relative z-20 pb-8">
			{/* 操作栏 */}
			{/* 筛选栏 */}
			{/* 列表内容 */}
		</div>

		{/* 页脚 */}
		<footer>
			<p>✨ 数据安全存储在本地，完全离线可用</p>
		</footer>
	</div>
</div>
```

### 参考实现

#### 任务平台（TaskPlatform）

-   **位置**：`src/pages/TaskPlatform.tsx`
-   **特点**：任务管理、积分系统、奖励商城
-   **参考点**：CRUD 操作、数据管理、状态管理

#### 想法记录（IdeaNotes）

-   **位置**：`src/pages/IdeaNotes.tsx`
-   **特点**：分类管理、标签系统、筛选功能
-   **参考点**：编辑删除、数据导入导出、筛选排序

#### 数据管理（DataManagerDialog）

-   **位置**：`src/components/DataManagerDialog.tsx`
-   **特点**：统一的数据管理入口
-   **参考点**：导入导出实现、错误处理

### 添加新工具的步骤

1. **创建类型定义**：在 `src/types/` 下创建类型文件
2. **创建 Store**：在 `src/stores/` 下创建状态管理，使用 persist
3. **创建组件**：
    - 卡片组件（如 `XxxCard.tsx`）
    - 表单组件（如 `XxxForm.tsx`）
    - 列表组件（如 `XxxList.tsx`）
4. **创建页面**：在 `src/pages/` 下创建页面组件
5. **添加路由**：在 `src/App.tsx` 中添加路由
6. **添加到主页**：在 `src/components/HomePage.tsx` 中添加工具入口
7. **实现数据管理**：参考 `DataManagerDialog` 实现导入导出

### 注意事项

-   ✅ 所有组件使用箭头函数语法
-   ✅ 使用 TypeScript 严格类型
-   ✅ 移动端优先，不使用 hover 效果
-   ✅ 数据存储在 localStorage，key 使用统一前缀
-   ✅ 支持数据迁移，使用 migrate 函数
-   ✅ 删除操作必须二次确认
-   ✅ 导出数据包含时间戳和版本信息
-   ✅ 导入数据需要验证格式和显示确认
