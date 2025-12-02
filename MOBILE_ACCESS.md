# 手机访问指南

## 方案4：构建 PWA 并通过公网隧道访问

### 快速开始

#### 方法1：使用自动化脚本（推荐）

```bash
npm run deploy
```

这个脚本会：
1. 自动构建项目
2. 启动静态服务器（端口 5173）
3. 创建公网隧道
4. 显示公网 URL（格式类似：`https://xxx.loca.lt`）

**在手机上打开显示的 URL 即可访问！**

#### 方法2：手动步骤

**步骤1：构建项目**
```bash
npm run build
```

**步骤2：启动静态服务器**
```bash
npm run serve:prod
```

**步骤3：在另一个终端创建公网隧道**
```bash
npm run tunnel
```

**步骤4：复制显示的 URL 到手机浏览器访问**

### 注意事项

1. **保持终端运行**：服务器和隧道都需要保持运行状态
2. **URL 会变化**：每次运行 localtunnel 都会生成新的 URL
3. **HTTPS 支持**：localtunnel 提供的 URL 是 HTTPS，PWA 功能可以正常使用
4. **停止服务**：按 `Ctrl+C` 停止服务

### 其他内网穿透方案

如果 localtunnel 不稳定，可以尝试：

#### ngrok（更稳定，需要注册）
```bash
# 1. 访问 https://ngrok.com/ 注册账号
# 2. 安装 ngrok
# 3. 运行
ngrok http 5173
```

#### serveo（无需安装）
```bash
ssh -R 80:localhost:5173 serveo.net
```

### 故障排查

- **无法访问**：确保防火墙允许端口 5173
- **URL 失效**：重新运行 `npm run tunnel` 获取新 URL
- **PWA 功能异常**：确保使用 HTTPS URL（localtunnel 默认提供）

