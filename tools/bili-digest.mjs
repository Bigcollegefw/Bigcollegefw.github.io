#!/usr/bin/env node
// B站 UP 主视频文稿抓取（自媒体对标分析用）
// 用法: node tools/bili-digest.mjs [--count 8] [--ups 分析学爱好者,CG快报]
// 依赖: ~/.bili-cookie 文件里存 SESSDATA=xxx（浏览器 F12 → Application → Cookies 复制）
// 输出: transcripts/<UP名>/<序号>_<日期>_<标题>.md （本地文件，已 gitignore，勿外传）

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// ===== 配置区 =====
const UPS = [
  { name: "分析学爱好者", mid: "441167301" }, // AI for Math 区第一 UP
  { name: "CG快报", mid: "1067722283" },     // 游戏资讯口播
  // 钰子一: 打开TA的主页 space.bilibili.com/数字，把数字填进来，取消注释
  // { name: "钰子一", mid: "待补" },
];
const OUT = "transcripts";
// ===== 配置区结束 =====

const HOME = process.env.HOME;
const COOKIE = fs.readFileSync(path.join(HOME, ".bili-cookie"), "utf8").trim();
if (!COOKIE.includes("SESSDATA")) {
  console.error("~/.bili-cookie 里没有 SESSDATA，参照文件头注释配置");
  process.exit(1);
}
const APP_UA = "okhttp/3.4.1";
const WEB_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const COUNT = (() => {
  const i = process.argv.indexOf("--count");
  return i > -1 ? Number(process.argv[i + 1]) || 8 : 8;
})();
const ONLY = (() => {
  const i = process.argv.indexOf("--ups");
  return i > -1 ? process.argv[i + 1].split(",") : null;
})();
const ups = ONLY ? UPS.filter((u) => ONLY.includes(u.name)) : UPS;

// ---- wbi 签名（列表接口必需）----
let MIXIN = "";
async function wbiSign(params) {
  if (!MIXIN) {
    const nav = await (
      await fetch("https://api.bilibili.com/x/web-interface/nav", {
        headers: { "User-Agent": WEB_UA, cookie: COOKIE },
      })
    ).json();
    const { img_url, sub_url } = nav.data.wbi_img;
    const key = (img_url + sub_url).match(/[a-zA-Z0-9]{32}/g).join("");
    const ORD = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52];
    MIXIN = ORD.map((i) => key[i]).join("").slice(0, 32);
  }
  const wts = Math.floor(Date.now() / 1000);
  const q = Object.keys(params)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join("&");
  const w_rid = crypto.createHash("md5").update(q + `&wts=${wts}` + MIXIN).digest("hex");
  return `${q}&wts=${wts}&w_rid=${w_rid}`;
}

async function jfetch(url, headers) {
  // 风控有随机性：先用给定 UA，412/非JSON 时换 App UA 重试 2 次
  const attempts = [headers, { "User-Agent": APP_UA, cookie: COOKIE }, headers];
  let lastErr;
  for (let i = 0; i < attempts.length; i++) {
    const r = await fetch(url, { headers: attempts[i] });
    const t = await r.text();
    try {
      return JSON.parse(t);
    } catch {
      lastErr = new Error(`非JSON响应 HTTP ${r.status}（可能被风控）`);
      await sleep(2500);
    }
  }
  throw lastErr;
}
const webHeaders = { "User-Agent": WEB_UA, Referer: "https://www.bilibili.com/", cookie: COOKIE };

function cleanFile(s) {
  return s.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60);
}

// ---- 抓一位 UP 的最近视频文稿 ----
async function digestUP({ name, mid }) {
  console.log(`\n===== ${name} (mid ${mid}) =====`);
  const q = await wbiSign({ mid, ps: String(COUNT), pn: "1", order: "pubdate", platform: "web" });
  const list = await jfetch(
    `https://api.bilibili.com/x/space/wbi/arc/search?${q}`,
    { "User-Agent": WEB_UA, Referer: `https://space.bilibili.com/${mid}`, cookie: COOKIE },
  );
  if (list.code !== 0) {
    console.error(`  列表失败 code ${list.code}: ${list.message}`);
    return;
  }
  const dir = path.join(OUT, name);
  fs.mkdirSync(dir, { recursive: true });
  const videos = list.data.list.vlist;
  console.log(`  最近 ${videos.length} 期`);
  let idx = 0;
  for (const v of videos) {
    idx++;
    const date = new Date(v.created * 1000).toISOString().slice(0, 10);
    const file = path.join(dir, `${String(idx).padStart(2, "0")}_${date}_${cleanFile(v.title)}.md`);
    if (fs.existsSync(file)) {
      console.log(`  [skip] ${v.title.slice(0, 30)}`);
      continue;
    }
    try {
      // 1) bvid -> cid
      const view = await jfetch(
        `https://api.bilibili.com/x/web-interface/view?bvid=${v.bvid}`,
        { "User-Agent": APP_UA, cookie: COOKIE },
      );
      if (view.code !== 0) throw new Error(`view code ${view.code}`);
      const { aid, cid, duration } = view.data;
      await sleep(1500);
      // 2) 字幕列表
      const player = await jfetch(
        `https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`,
        webHeaders,
      );
      const subs = player.data?.subtitle?.subtitles || [];
      const zh = subs.find((s) => s.lan === "ai-zh") || subs.find((s) => s.lan?.startsWith("zh")) || subs[0];
      if (!zh) {
        console.error(`  [无字幕] ${v.title.slice(0, 30)}`);
        continue;
      }
      await sleep(1500);
      // 3) 下载字幕 JSON -> 纯文本
      const surl = zh.subtitle_url.startsWith("//") ? "https:" + zh.subtitle_url : zh.subtitle_url;
      const sj = JSON.parse(await (await fetch(surl, { headers: webHeaders })).text());
      const lines = sj.body.map((b) => b.content);
      const text = lines.join("");
      // 4) 写文稿（带分段，方便阅读）
      const paras = [];
      for (let i = 0; i < lines.length; i += 8) paras.push(lines.slice(i, i + 8).join(""));
      const md = [
        `# ${v.title}`,
        "",
        `- UP主: ${name} | BV: ${v.bvid} | 发布: ${date}`,
        `- 播放: ${v.play} | 弹幕: ${v.video_review} | 收藏: ${v.favorites} | 时长: ${Math.round(duration / 60)}分钟`,
        `- 字幕: ${zh.lan_doc}（AI生成，可能有少量识别错误）`,
        `- 链接: https://www.bilibili.com/video/${v.bvid}`,
        "",
        ...paras.map((p) => p + "\n"),
      ].join("\n");
      fs.writeFileSync(file, md);
      console.log(`  [ok ${String(idx).padStart(2, "0")}] ${v.title.slice(0, 30)} (${text.length}字)`);
    } catch (e) {
      console.error(`  [fail] ${v.title.slice(0, 30)}: ${e.message}`);
    }
    await sleep(1500);
  }
}

for (const up of ups) {
  await digestUP(up);
}
console.log("\n完成。文稿在 transcripts/ 目录（已 gitignore，勿提交勿外传）");
