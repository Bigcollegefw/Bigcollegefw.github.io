#!/usr/bin/env node
// 新闻简报抓取脚本（自媒体选题用）
// 用法: node tools/news-fetch.mjs [--days 2] [--out news]
// 输出: news/简报-YYYY-MM-DD.md （本地文件，不进博客发布目录）

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

// Google News RSS：按关键词聚合，覆盖面广且天然按时间排
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

// 优质站方 RSS（补充深度源）
const FEEDS = [
  { name: "GameDeveloper", url: "https://www.gamedeveloper.com/rss.xml" },
  { name: "GamesIndustry.biz", url: "https://www.gamesindustry.biz/feed" },
  { name: "机核", url: "https://www.gcores.com/rss" },
];

function googleNewsRss(q) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
}

function stripHtml(s = "") {
  return s.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
}

function parseRss(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const get = (tag) => {
      const t = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return t ? stripHtml(t[1]) : "";
    };
    items.push({
      title: get("title"),
      link: get("link"),
      date: new Date(get("pubDate") || Date.now()),
      source: get("source") || get("description").slice(0, 30),
    });
  }
  return items;
}

async function fetchText(url, tries = 3) {
  // 断网容错：单源失败重试 3 次，间隔 20s
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh) news-digest/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    } catch (e) {
      if (i === tries) throw new Error(`${e.message} ${url}`);
      console.error(`  [retry ${i}/3] ${e.message}`);
      await new Promise((r) => setTimeout(r, 20000));
    }
  }
}

async function gather() {
  const tasks = [
    ...CN_QUERIES.map((q) => ({ name: `中文:${q}`, url: googleNewsRss(q) })),
    ...EN_QUERIES.map((q) => ({ name: `EN:${q}`, url: googleNewsRss(q) })),
    ...FEEDS,
  ];
  const results = await Promise.allSettled(tasks.map((t) => fetchText(t.url)));
  const items = [];
  const seen = new Set();
  const cutoff = Date.now() - DAYS * 86400e3;
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") {
      console.error(`  [skip] ${tasks[i].name}: ${r.reason?.message}`);
      return;
    }
    for (const it of parseRss(r.value)) {
      if (!it.title || it.date.getTime() < cutoff) continue;
      const key = it.title.slice(0, 40);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(it);
    }
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

function group(items) {
  const g = { "游戏行业/公司动态": [], "引擎与技术(Unity/UE/AI)": [], "游戏作品/平台": [] };
  for (const it of items) {
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
  console.error("全部来源失败（可能断网），本次不写入文件，等下一个兜底时点重试");
  process.exit(1);
}
const grouped = group(items);

const today = new Date().toISOString().slice(0, 10);
let md = `# 游戏圈选题简报 ${today}\n\n> 自动生成于 ${new Date().toLocaleString("zh-CN")}，覆盖近 ${DAYS} 天国内外新闻。⭐ = 标题热度加权高，优先看。\n`;

for (const [cat, list] of Object.entries(grouped)) {
  if (!list.length) continue;
  md += `\n## ${cat}（${list.length}）\n\n`;
  for (const it of list) {
    const star = score(it.title) >= 4 ? "⭐ " : "";
    md += `- ${star}${it.title}  \n  ${it.date.toLocaleDateString("zh-CN")} · ${it.source || "未知来源"}\n  ${it.link}\n`;
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, `简报-${today}.md`);
fs.writeFileSync(file, md);
// 同时维护一份"最新"，方便固定读取
fs.writeFileSync(path.join(OUT_DIR, "最新简报.md"), md);
console.log(`已写入 ${file}`);
