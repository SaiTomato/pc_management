# GitHub 推送指南

## 步骤 1: 在 GitHub 上创建新仓库

1. 登录你的 GitHub 账户
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `pc-management` (或你喜欢的名字)
   - Description: `PC Management System with React, TypeScript, Express, PostgreSQL`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 "Create repository"

## 步骤 2: 连接本地仓库到 GitHub

在项目根目录运行以下命令（替换 `<your-username>` 和 `<repository-name>` 为你的实际值）：

```bash
git remote add origin https://github.com/<your-username>/<repository-name>.git
git branch -M main
git push -u origin main
```

例如：
```bash
git remote add origin https://github.com/yourusername/pc-management.git
git branch -M main
git push -u origin main
```

## 步骤 3: 如果使用 SSH（推荐）

如果你配置了 SSH 密钥，可以使用：

```bash
git remote add origin git@github.com:<your-username>/<repository-name>.git
git branch -M main
git push -u origin main
```

## 注意事项

- 如果提示输入用户名和密码，建议使用 Personal Access Token 而不是密码
- 如果遇到认证问题，可以配置 Git Credential Manager
- `.env` 文件已被 `.gitignore` 忽略，不会被推送到 GitHub（这是安全的）

## 后续推送

之后如果需要推送新的更改：

```bash
git add .
git commit -m "你的提交信息"
git push
```
