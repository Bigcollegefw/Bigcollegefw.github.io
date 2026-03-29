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

换到 Mac（或其他电脑）后，从零开始配置 Hexo 博客环境的完整步骤。按照以下顺序执行即可。

## 第一步：克隆仓库

```bash
git clone https://github.com/Bigcollegefw/Bigcollegefw.github.io.git
cd Bigcollegefw.github.io
```

## 第二步：安装 Hexo CLI

```bash
npm install -g hexo-cli
```

## 第三步：安装项目依赖

```bash
npm install
```

## 第四步：重新克隆主题（重要！）

主题目录 `themes/3-hexo/` 没有提交到 Git 仓库，需要重新克隆：

```bash
cd themes
git clone https://github.com/yelog/hexo-theme-3-hexo.git 3-hexo
cd ..
```

## 第五步：配置 SSH 认证

### 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519 -N ""
```

### 添加公钥到 GitHub

1. 查看公钥：`cat ~/.ssh/id_ed25519.pub`
2. 复制公钥内容（以 `ssh-ed25519 AAAAC3...` 开头）
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

## 第六步：修改部署地址为 SSH

编辑根目录 `_config.yml`，找到 `deploy.repo`，将 HTTPS 地址改为 SSH 地址：

```yaml
deploy:
  type: git
  repo: git@github.com:Bigcollegefw/Bigcollegefw.github.io.git
  branch: main
```

原来的 HTTPS 地址：

```
https://github.com/Bigcollegefw/Bigcollegefw.github.io.git
```

改为 SSH 地址：

```
git@github.com:Bigcollegefw/Bigcollegefw.github.io.git
```

## 写博客和部署命令

```bash
# 本地预览（浏览器打开 http://localhost:4000）
hexo clean && hexo g && hexo s

# 部署到网站
hexo clean && hexo g && hexo d
```

## 目录结构说明

```
Bigcollegefw.github.io/
├── source/          # 博客文章源文件（Markdown）
├── public/          # hexo g 生成的静态页面（不需要提交）
├── themes/3-hexo/  # 主题（需要重新克隆，不在仓库中）
├── _config.yml     # Hexo 配置
└── package.json    # 项目依赖
```

## 配置 Obsidian 自动日期模板（重要！）

文章模板文件位于：`source/_posts/.templates/博客文章模板.md`

模板内容：
```yaml
---
title: {{title}}
date: {{date}}
categories:
  -
tags:
  -
---

## 前言
```

### 在 Obsidian 中设置模板

1. 打开 Obsidian 设置
2. 进入 **Community plugins** → 启用 **Templater** 插件（如果没有，先在 Community plugins 中搜索安装）
3. 进入 **Templater** 设置：
   - **Template folder location**：设置为 `source/_posts/.templates`
   - **Trigger for new file creation**：勾选
4. 新建文章时使用模板：
   - 设置快捷键（如 `Ctrl+E`）快速从模板创建文件
   - 或使用命令面板（`Ctrl+P`）→ `Templater: Create new file from template`

### 模板中的变量

| 变量 | 含义 |
|------|------|
| `{{title}}` | 文件名（不含扩展名） |
| `{{date}}` | 创建时的日期时间 |

## 注意事项

- **主题必须重新克隆**：这是因为主题通过 `git clone` 安装，但没有被提交到仓库，换电脑后目录是空的
- SSH 认证配置只影响本机，Windows 和 Mac 互不影响
- `.obsidian/` 目录是 Obsidian 编辑器的配置，不需要提交
- 每次部署前建议先 `hexo clean` 清除缓存
- **文章 frontmatter 中的 `date:` 字段会自动从模板填充**，不要手动修改或留空
