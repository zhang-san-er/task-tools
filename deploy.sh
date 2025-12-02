#!/bin/bash

# 构建项目
echo "🔨 正在构建项目..."
npm run build

# 启动静态服务器
echo "🚀 正在启动静态服务器..."
npx serve -s dist -p 5173 &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 启动 localtunnel
echo "🌐 正在创建公网隧道..."
echo "📱 请在手机上访问下面显示的 URL："
npx localtunnel --port 5173

# 清理：当 localtunnel 退出时，也停止服务器
trap "kill $SERVER_PID 2>/dev/null" EXIT

