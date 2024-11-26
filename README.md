# Ink World

这个网站使用 [Docusaurus](https://docusaurus.io/) 构建，是一个现代化的静态网站生成器。

### 安装

```
pnpm install
```

### 本地开发

```powershell
pnpm start
```

这个命令启动一个本地开发服务器，并打开一个浏览器窗口。大多数更改会实时反映，无需重新启动服务器。

### 构建

```powershell
pnpm build
```

这个命令生成静态内容到 `build` 目录，并可以使用任何静态内容托管服务。

### 部署

使用 SSH:

```powershell
$ USE_SSH=true pnpm deploy
```

不使用 SSH:

```powershell
$ GIT_USER=<Your GitHub username> pnpm deploy
```

如果使用 GitHub Pages 进行托管，这个命令是构建网站并推送到 `gh-pages` 分支的便捷方式。

### 更多信息

- 查看 [官方文档](https://docusaurus.io/)
- 了解 [部署指南](https://docusaurus.io/docs/deployment)
- 探索 [国际化功能](https://docusaurus.io/docs/i18n/introduction)
