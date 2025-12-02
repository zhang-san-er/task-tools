# 部署说明

## 构建应用

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建完成后，所有文件将输出到 `dist` 目录。

## 部署方式

### 方式1：静态文件服务器

将 `dist` 目录的内容上传到任何支持静态文件的服务器：
- GitHub Pages
- Netlify
- Vercel
- 自己的服务器（Nginx/Apache）

### 方式2：打包下载（推荐）

1. 构建应用：`npm run build`
2. 压缩 `dist` 目录为 ZIP 文件
3. 用户下载 ZIP 文件后解压
4. 在解压后的目录中启动本地服务器：

```bash
# 使用 Python（如果已安装）
cd dist
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server dist -p 8000
```

5. 在浏览器中访问 `http://localhost:8000`

**注意**：Service Worker 需要 HTTPS 或 localhost 才能正常工作。

### 方式3：单文件应用（不推荐）

由于 Service Worker 的限制，无法真正实现单文件应用。但可以将所有文件打包在一个目录中，用户下载后解压即可使用。

## PWA 安装

### iPhone Safari

1. 在 Safari 中打开应用
2. 点击底部的分享按钮
3. 选择"添加到主屏幕"
4. 应用将作为独立应用运行

### Android Chrome

1. 打开应用
2. 浏览器会显示"添加到主屏幕"提示
3. 点击"添加"即可

## 图标配置

在部署前，请确保 `public/icons/` 目录下有：
- `icon-192x192.png`
- `icon-512x512.png`

如果没有图标，应用仍可正常运行，但安装到主屏幕时可能显示默认图标。

## 离线功能

应用使用 Service Worker 实现离线功能：
- 首次访问时会缓存所有资源
- 之后即使离线也能正常使用
- 数据存储在 localStorage，完全本地化

## 数据备份

应用内置数据导入/导出功能：
- 点击右下角的设置按钮
- 选择"导出数据"保存备份
- 选择"导入数据"恢复备份

