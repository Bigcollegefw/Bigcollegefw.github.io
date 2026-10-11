#!/usr/bin/env node
// 新闻简报抓取脚本（自媒体选题用）
// 用法: node tools/news-fetch.mjs [--days 2] [--out news] [--force]
// 输出: news/简报-YYYY-MM-DD.md （本地文件，不进博客发布目录）
// 来源: Google News RSS / 站方 RSS(Atom) / YouTube 频道 / Reddit / Hacker News(Algolia)
// 注意: YouTube/Reddit/HN 需要代理才能访问；断网时全源失败则不写文件，等兜底时点重跑

import fs from "node:fs";
import path from "node:path";

const DAYS = (() => {
  const i = process.argv.indexOf("--days");
  return i > -1 ? Number(process.argv[i + 1]) || 2 : 2;
})();
const FORCE = process.argv.includes("--force");
const OUT_DIR = (() => {
  const i = process.argv.indexOf("--out");
  return i > -1 ? process.argv[i + 1] : "news";
})();

const today0 = new Date().toISOString().slice(0, 10);
const finalFile = path.join(OUT_DIR, `简报-${today0}.md`);
if (!FORCE && fs.existsSync(finalFile)) {
  console.log(`${today0} 的简报已存在，跳过（--force 可强制刷新）`);
  process.exit(0);
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

// ===== 配置区：想加减来源改这里 =====

// Google News 关键词（新闻聚合，国内直连一般可用）
const CN_QUERIES = [
  "游戏 新闻",
  "Unity OR 虚幻引擎",
  "游戏公司 裁员 OR 融资 OR 收购",
  "AI 游戏",
];
const EN_QUERIES = [
  "video game industry news",
  "Unity OR \"Unreal Engine\" news",
  "game studio layoffs OR acquisition",
  "AI games generative",
];

// 站方 RSS（group = 简报中的分类，不填则自动按标题归类）
const FEEDS = [
  { name: "GameDeveloper", url: "https://www.gamedeveloper.com/rss.xml", group: "海外行业/技术媒体" },
  { name: "GamesIndustry.biz", url: "https://www.gamesindustry.biz/feed", group: "海外行业/技术媒体" },
  { name: "机核", url: "https://www.gcores.com/rss", group: "游戏作品/平台" },
];

// YouTube 频道（需代理）。频道 ID 获取：频道页 → 查看源码搜 "channel_id"，或外部工具
// 想加频道就在数组里加一行 { name, id }
const YT_CHANNELS = [
  { name: "Two Minute Papers", id: "UCbfYPyITQ-7l4upoX8nvctg" }, // AI 前沿新闻解读
];

// Reddit 版块（需代理）——"阵营吵架"话题的主要产地
const REDDITS = ["Games", "gamedev", "Unity3D", "unrealengine", "pcgaming"];

// Hacker News 关键词（需代理）
const HN_QUERIES = ["AI game", "Unity OR Unreal", "game industry"];
// ===== 配置区结束 =====

const googleNewsRss = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;

const stripHtml = (s = "") =>
  s.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();

// 同时支持 RSS2.0 的 <item> 和 Atom 的 <entry>
function parseFeed(xml) {
  const items = [];
  const blocks = [...xml.matchAll(/<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g)];
  for (const [, block] of blocks) {
    const tag = (t) => {
      const m = block.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`));
      return m ? stripHtml(m[1]) : "";
    };
    // Atom 的链接在 <link href="...">，RSS 在 <link>文本</link>
    let link = tag("link");
    const href = block.match(/<link[^>]*href="([^"]+)"/);
    if (href && !link) link = href[1];
    const author = block.match(/<name>([^<]+)<\/name>/);
    items.push({
      title: tag("title"),
      link,
      date: new Date(tag("pubDate") || tag("published") || tag("updated") || Date.now()),
      source: tag("source") || (author ? author[1].trim() : ""),
    });
  }
  return items;
}

// HN 走 Algolia JSON API（比 RSS 稳）
function parseHN(json, q) {
  const data = JSON.parse(json);
  return (data.hits || []).map((h) => ({
    title: h.title || h.story_title || "",
    link: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    date: new Date((h.created_at_i || 0) * 1000 || Date.now()),
    source: `HN·${h.points ?? 0}分`,
    _hnTitle: h.title || "",
  }));
}

async function fetchText(url, tries = 3) {
  // 断网容错：单源失败重试 3 次，间隔 20s（429 限流则等更久）
  for (let i = 1; i <= tries; i++) {
    let waited = false;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    } catch (e) {
      if (i === tries) throw new Error(`${e.message} ${url}`);
      waited = /429/.test(e.message);
      console.error(`  [retry ${i}/3] ${e.message}`);
      await new Promise((r) => setTimeout(r, waited ? 45000 : 20000));
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Reddit 对匿名并发限流严格：串行 + 间隔
async function fetchSequential(tasks) {
  const out = [];
  for (const t of tasks) {
    try {
      out.push({ status: "fulfilled", value: await fetchText(t.url), task: t });
    } catch (e) {
      out.push({ status: "rejected", reason: e, task: t });
    }
    await sleep(4000);
  }
  return out;
}

async function gather() {
  // Google News 并发抓；YouTube/Reddit 串行慢抓（限流敏感）
  const gnTasks = [
    ...CN_QUERIES.map((q) => ({ name: `中文:${q}`, url: googleNewsRss(q) })),
    ...EN_QUERIES.map((q) => ({ name: `EN:${q}`, url: googleNewsRss(q) })),
    ...FEEDS.map((f) => ({ ...f })),
  ];
  const slowTasks = [
    ...YT_CHANNELS.map((c) => ({
      name: `YT:${c.name}`,
      url: `https://www.youtube.com/feeds/videos.xml?channel_id=${c.id}`,
      group: "YouTube 视频",
      sourceName: c.name,
    })),
    ...REDDITS.map((r) => ({
      name: `Reddit:r/${r}`,
      url: `https://www.reddit.com/r/${r}/.rss`,
      group: "Reddit 社区热议",
      sourceName: `r/${r}`,
    })),
  ];
  const [results, slowResults] = await Promise.all([
    Promise.allSettled(gnTasks.map((t) => fetchText(t.url))),
    fetchSequential(slowTasks),
  ]);
  const hnTasks = HN_QUERIES.map((q) => ({
    name: `HN:${q}`,
    url: `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=15&numericFilters=points>5`,
  }));
  const hnResults = await Promise.allSettled(hnTasks.map((t) => fetchText(t.url)));

  const items = [];
  const seen = new Set();
  const cutoff = Date.now() - DAYS * 86400e3;
  const add = (it, group, sourceName) => {
    if (!it.title || it.date.getTime() < cutoff) return;
    const key = it.title.slice(0, 40);
    if (seen.has(key)) return;
    seen.add(key);
    if (group) it._group = group;
    if (sourceName) it._srcName = sourceName;
    items.push(it);
  };
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") {
      console.error(`  [skip] ${gnTasks[i].name}: ${r.reason?.message}`);
      return;
    }
    for (const it of parseFeed(r.value)) add(it, gnTasks[i].group);
  });
  for (const r of slowResults) {
    if (r.status !== "fulfilled") {
      console.error(`  [skip] ${r.task.name}: ${r.reason?.message}`);
      continue;
    }
    for (const it of parseFeed(r.value)) add(it, r.task.group, r.task.sourceName);
  }
  hnResults.forEach((r, i) => {
    if (r.status !== "fulfilled") {
      console.error(`  [skip] ${hnTasks[i].name}: ${r.reason?.message}`);
      return;
    }
    for (const it of parseHN(r.value)) add(it, "Hacker News 热议");
  });
  return items.sort((a, b) => b.date - a.date);
}

// 粗排"冲击力"：标题含高热度关键词加权
function score(t) {
  const hot = ["AI", "裁员", "收购", "破产", "爆款", "首日", "纪录", "新高", "差评", "下架", "停运",
    "layoff", "shutdown", "acquisition", "lawsuit", "record", "ban", "Unity", "Unreal", "腾讯", "网易",
    "米哈游", "任天堂", "Steam", "黑神话"];
  return hot.reduce((s, k) => s + (t.includes(k) ? 2 : 0), 0);
}

// 争议度标记：检测"两拨人在吵架"的信号词 —— 这是选题的核心筛选条件
function heat(t) {
  const clash = ["抵制", "反对", "抗议", "争议", "回怼", "回应", "反驳", "道歉", "风波", "骂",
    "boycott", "backlash", "controversy", "slam", "angry", "protest", "criticize"];
  return clash.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0);
}

function group(items) {
  const g = {
    "游戏行业/公司动态": [],
    "引擎与技术(Unity/UE/AI)": [],
    "游戏作品/平台": [],
    "海外行业/技术媒体": [],
    "YouTube 视频": [],
    "Reddit 社区热议": [],
    "Hacker News 热议": [],
  };
  for (const it of items) {
    if (it._group) {
      (g[it._group] ||= []).push(it);
      continue;
    }
    const t = it.title;
    if (/Unity|Unreal|虚幻|引擎|AI|CryEngine|Godot/i.test(t)) g["引擎与技术(Unity/UE/AI)"].push(it);
    else if (/裁员|收购|融资|上市|财报|公司|厂商|行业|studio|layoff|acquisition|revenue/i.test(t))
      g["游戏行业/公司动态"].push(it);
    else g["游戏作品/平台"].push(it);
  }
  return g;
}

const items = await gather();
console.log(`共抓取 ${items.length} 条（近 ${DAYS} 天）`);
if (items.length === 0) {
  console.error("全部来源失败（可能断网/代理未开），本次不写入文件，等下一个兜底时点重试");
  process.exit(1);
}
const grouped = group(items);

const today = new Date().toISOString().slice(0, 10);
let md = `# 游戏圈选题简报 ${today}\n\n> 自动生成于 ${new Date().toLocaleString("zh-CN")}，覆盖近 ${DAYS} 天国内外新闻 + YouTube/Reddit/HN。⭐ = 热度高，🔥 = 有"阵营吵架"信号（优先做选题）。\n`;

for (const [cat, list] of Object.entries(grouped)) {
  if (!list.length) continue;
  md += `\n## ${cat}（${list.length}）\n\n`;
  for (const it of list) {
    const s = score(it.title), h = heat(it.title);
    const mark = h > 0 ? "🔥" : s >= 4 ? "⭐ " : "";
    const src = it._srcName || it.source || "";
    md += `- ${mark}${it.title}  \n  ${it.date.toLocaleDateString("zh-CN")}${src ? " · " + src : ""}\n  ${it.link}\n`;
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(finalFile, md);
// 同时维护一份"最新"，方便固定读取
fs.writeFileSync(path.join(OUT_DIR, "最新简报.md"), md);
console.log(`已写入 ${finalFile}`);
