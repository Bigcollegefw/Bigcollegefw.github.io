# CLAUDE.md

本仓库是个人博客：Hexo 7.3.0 + 3-hexo 主题，同时是 Obsidian 笔记库。

**接手任何工作前，先读 `README.md`**——完整架构、工作流、迁移清单和全部已知坑都在那里，本文只是速记：

- 工作分支是 `source`；`main` 由 GitHub Actions 管理（只放构建产物，Pages 从它发布）；**禁止 `npx hexo d`**
- 推送 source 即自动构建部署（`.github/workflows/deploy.yml`）；obsidian-git 每 30 分钟自动提交推送
- 自定义工具脚本放 `tools/`（可用 ESM）；`scripts/` 是 Hexo 插件自动加载目录，只能放 CommonJS（目前仅 lazy-images.js）
- 根目录 `img/` 是 `source/img` 的镜像（Obsidian 预览绝对路径用），由 `npm run img:sync` 维护，勿手动改
- 图片引用约定为 `/img/xxx.webp` 绝对路径；新贴图走 `npm run img:compress` 归一
- 笔记属性：title 由 `npm run fm:fill` 补（新建时故意留空）；date 一律用文件创建时间（保证 URL 稳定）
- 协作偏好：直接快速执行、逐步可见，不要派后台子代理；重要架构变化后同步更新 README.md
