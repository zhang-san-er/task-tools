# 习惯养成游戏 PWA

一个完全离线的游戏化习惯追踪应用，支持PWA安装，数据存储在本地浏览器。

## 功能特性

- ✅ 任务系统：主线任务和心魔挑战
- ✅ 用户成长：积分、等级、生命值系统
- ✅ 数据持久化：所有数据存储在localStorage
- ✅ PWA支持：可安装到主屏幕，完全离线使用
- ✅ 响应式设计：适配iPhone和各种设备

## 技术栈

- React 18 + TypeScript
- Vite（构建工具）
- Zustand（状态管理）
- Tailwind CSS（样式）
- Vite PWA Plugin（PWA支持）

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

- Service Worker 需要 HTTPS 环境（或 localhost）才能正常工作
- 图标文件需要手动添加到 `public/icons/` 目录
- 所有数据存储在浏览器本地，清除浏览器数据会丢失所有记录

## 项目结构

```
task-tools/
├── public/          # 静态资源
├── src/
│   ├── components/  # React组件
│   ├── stores/      # Zustand状态管理
│   ├── types/       # TypeScript类型定义
│   └── utils/       # 工具函数
└── dist/            # 构建输出（构建后生成）
```

