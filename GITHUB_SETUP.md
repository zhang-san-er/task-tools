# GitHub 托管指南

## 步骤 1：在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
    - **Repository name**: `task-tools`（或你喜欢的名称）
    - **Description**: `习惯养成游戏 PWA - 离线游戏化任务管理应用`
    - **Visibility**: 选择 Public 或 Private
    - **不要勾选** "Add a README file"、"Add .gitignore"、"Choose a license"（项目已有这些文件）
3. 点击 **Create repository**

## 步骤 2：连接本地仓库到 GitHub

创建仓库后，GitHub 会显示命令。在终端执行以下命令：

```bash
# 添加远程仓库（将 YOUR_USERNAME 替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/task-tools.git

# 或者使用 SSH（如果你配置了 SSH 密钥）
git remote add origin git@github.com:YOUR_USERNAME/task-tools.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

## 步骤 3：验证

推送成功后，访问 `https://github.com/YOUR_USERNAME/task-tools` 查看你的代码。

## 后续更新

之后每次修改代码后，使用以下命令推送：

```bash
git add .
git commit -m "描述你的更改"
git push
```

## 使用 GitHub Pages 部署（可选）

如果你想使用 GitHub Pages 托管静态网站：

1. 在 GitHub 仓库页面，点击 **Settings**
2. 左侧菜单找到 **Pages**
3. **Source** 选择 **GitHub Actions** 或 **Deploy from a branch**
4. 如果选择 branch，选择 `main` 分支，文件夹选择 `/dist`
5. 访问 `https://YOUR_USERNAME.github.io/task-tools` 查看网站

## 注意事项

-   `.gitignore` 已配置，`node_modules` 和 `dist` 文件夹不会被提交（这是正确的）
-   如果使用 GitHub Pages，需要配置构建工作流或手动构建后提交 `dist` 文件夹





