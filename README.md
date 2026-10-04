# beishangzhajitui 的博客（Hexo + Obsidian 一体库）

> 本文档随 `source` 分支维护，是整个项目的说明书。**换电脑、换人接手、或忘了某个流程时，先读这里。**
> 最后更新：2026-10-04

## 一、这是什么

- **Hexo 7.3.0** 静态博客 + **3-hexo 主题**（三段式布局，已连同个性化修改一起提交进本仓库，基准版本 `yelog/hexo-theme-3-hexo@ef6bf12`）
- 线上地址：https://bigcollegefw.github.io/ （GitHub Pages）
- 本目录（仓库根）同时是 **Hexo 站点** 和 **Obsidian 笔记库**：文章直接在 Obsidian 里写
- 外层 `i:\HexoBlog\` 只是 Obsidian 的库外壳，真正的一切都在本目录

## 二、分支与部署架构（最重要，先看懂这个）

```
本地 source 分支 ──obsidian-git 每30分钟自动 commit+push──▶ GitHub source 分支
                                                              │ 推送自动触发
                                                              ▼
                     GitHub Actions（.github/workflows/deploy.yml）
                     npm ci → hexo generate → 发布整站到 main
                                                              │
                                                              ▼
                     GitHub main 分支（只放构建产物） ──▶ GitHub Pages 线上站点
```

- ⚠️ **永远不要手动跑 `npx hexo d`**——main 由 CI 管理，手动部署会把两边历史搅乱
- 想立刻发布不等 30 分钟：Obsidian 里 `Ctrl+P` → **"Obsidian Git: Commit-and-sync"**，约 2 分钟后上线
- 本地 `main` 分支已废弃，**日常工作永远在 `source` 分支**

## 三、目录结构

| 路径 | 用途 |
|---|---|
| `source/_posts/` | 全部文章。**目录即分类**（CSharp/图形学/摄影/视频文稿/游戏引擎/热更新…） |
| `source/img/` | 图片真身（绝大多数已压缩为 .webp） |
| `img/` | ⚠️ `source/img` 的**镜像副本**，只为让 Obsidian 能预览 `/img/` 绝对路径。自动生成（`npm run img:sync`），勿手动增删 |
| `tools/` | 自维护脚本：`frontmatter.mjs`（补属性）、`img-manage.mjs`（图片治理）、`fix-dates.mjs`（修历史日期） |
| `scripts/` | Hexo 插件目录，仅 `lazy-images.js`（全站图片懒加载）。⚠️ 必须是 CommonJS；普通工具脚本别放这，放 `tools/` |
| `themes/3-hexo/` | 主题本体（vendored，含个人修改） |
| `_image_trash/` | 图片治理回收站（orphan/孤儿、dup/重复、originals/压缩前原图、md_backup/改写前文章原稿 + manifest.txt）。确认无误后可整体删除 |
| `.obsidian/` | Obsidian 配置与插件（随仓库走） |

## 四、日常写作流程

1. **新建笔记**：在 `source/_posts/` 任意子目录新建，Templater 插件自动插入属性头——`date`=文件真实创建时间、`categories`=目录层级、`tags`=顶层目录。**title 故意留空**（新建时文件名是"未命名"），发布前由 `fm:fill` 按最终文件名补
2. **贴图**：直接 Ctrl+V，自动存到 `source/img/`，笔记里是相对路径（此时 Obsidian 能预览）
3. **写完收尾**（在 blog 目录跑）：
   ```bash
   npm run fm:fill        # 补缺的属性字段（title 等）
   npm run img:compress   # 新图压成 webp、引用改绝对路径、自动同步 img/ 镜像
   ```
4. **发布**：什么都不用做（≤30 分钟自动上线）；急件用 `Ctrl+P` → Commit-and-sync

## 五、常用命令速查

```bash
npm run fm:fill         # 给缺属性头的笔记补全（title/date/categories/tags）
npm run img:check       # 体检：孤儿图/重复图/超大图报告
npm run img:clean       # 清理孤儿与重复图进 _image_trash（含镜像同步）
npm run img:compress    # 压缩新图 + 引用统一 + 同步镜像
npm run img:sync        # 只同步 img/ 镜像
npx hexo s              # 本地预览 http://localhost:4000
```

## 六、换电脑迁移清单

1. **配 GitHub SSH key**，然后：
   ```bash
   git clone git@github.com:Bigcollegefw/Bigcollegefw.github.io.git blog
   cd blog && git checkout source
   ```
2. **Node 20** + `npm install`（sharp 是 devDependency，仅本地工具用）
3. **Obsidian**：把 `blog` 文件夹作为库打开。社区插件配置都随仓库走（obsidian-git、obsidian-custom-attachment-location、Templater、file-tree-alternative），重装插件后配置自动生效
4. ⚠️ **Templater 的总开关存在 Obsidian 本地存储里，不随仓库走**：设置 → 第三方插件 → Templater → 打开 **"Trigger on new file creation"**（模式应为 Folder templates）。不开的话新建笔记不会自动加属性头
5. 检查 git 提交身份：`git config user.name` / `user.email`，没有就配
6. 验证：随便改篇笔记 → `Ctrl+P` → Commit-and-sync → 2 分钟后刷新线上站点

## 七、已知规则与历史坑（改动前必读）

- 图片引用全部是 `/img/xxx.webp` **绝对路径**（网站正确；Obsidian 预览依赖根目录 `img/` 镜像实现，删了镜像预览就挂）
- `permalink: :year/:month/:hash.html`——**文章 front-matter 的 date 决定 URL**。批量改 date 会改 URL（外链会断），动之前先拿两篇做样本验证
- `updated_option: 'date'` 是刻意设置——改成 mtime 的话，CI 每次构建会把全站"更新时间"刷成构建当天
- 老 URL 的文章日期用的是**文件创建时间**（与 Hexo 对缺失 date 的回退规则一致，保证 URL 不变）
- 主题如需升级：本仓库是 vendored 副本，用基准 `ef6bf12` 对官方仓库 diff 后手动合并，别直接覆盖（会丢个人修改）
- 有 ~12 张图是七巧云外链（老文章里），外链失效需手动本地化
- 站点 `_config.yml` 的 `url` 仍是 `http://example.com` 占位符，**尚未修正**；将来装 RSS/Sitemap 前必须先改成 `https://bigcollegefw.github.io`
