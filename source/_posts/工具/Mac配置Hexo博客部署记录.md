---
title: Mac 配置 Hexo 博客部署记录
date: 2026-03-29 21:20:00
categories:
  - 工具
tags:
  - Hexo
  - Mac
  - 博客
---

## 前言

换到 Mac 后需要重新配置 Hexo 环境，以下是完整的配置记录。

## 环境检查

```bash
node -v   # 查看 Node.js 版本
npm -v    # 查看 npm 版本
hexo -v   # 查看 Hexo 版本
```

## 安装 Hexo CLI（全局）

```bash
npm install -g hexo-cli
```

## 安装项目依赖

在博客根目录下执行：

```bash
npm install
```

## 配置 SSH 认证

### 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519 -N ""
```

### 添加公钥到 GitHub

1. 查看公钥：`cat ~/.ssh/id_ed25519.pub`
2. 复制公钥内容
3. 打开 GitHub → Settings → SSH and GPG keys → New SSH key
4. 粘贴公钥，保存

### 测试连接

```bash
ssh -T git@github.com
```

看到以下内容说明成功：

```
Hi Bigcollegefw! You've successfully authenticated, but GitHub does not provide shell access.
```

## 修改部署地址为 SSH

编辑 `_config.yml`，将 `deploy.repo` 改为 SSH 地址：

```yaml
deploy:
  type: git
  repo: git@github.com:Bigcollegefw/Bigcollegefw.github.io.git
  branch: main
```

## 写博客和部署命令

```bash
# 本地预览
hexo clean && hexo g && hexo s

# 部署到网站
hexo clean && hexo g && hexo d
```

## 注意事项

- SSH 认证配置只影响本机，Windows 和 Mac 互不影响
- Windows 可以继续使用 HTTPS + PAT，也可以配置 SSH
- `.obsidian/` 目录建议加入 `.gitignore`，避免编辑器状态冲突
