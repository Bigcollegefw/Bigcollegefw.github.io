#!/usr/bin/env node
// 博客图片管理工具
// 用法：
//   node scripts/img-manage.mjs check     报告：孤儿图片 / 重复图片 / 缺失图片 / 超大文件
//   node scripts/img-manage.mjs clean     孤儿与重复图片移入 _image_trash，修复引用
//   node scripts/img-manage.mjs compress  PNG 压缩为 WebP，文章图片引用统一改为 /img/ 绝对路径
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMG_DIR = path.join(ROOT, 'source', 'img');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const TRASH = path.join(ROOT, '_image_trash');
const TRASH_SUB = {
  orphan: path.join(TRASH, 'orphan'),
  dup: path.join(TRASH, 'dup'),
  originals: path.join(TRASH, 'originals'),
  mdBackup: path.join(TRASH, 'md_backup'),
};
const THEME_SCAN = [
  path.join(ROOT, 'themes', '3-hexo', '_config.yml'),
  path.join(ROOT, 'themes', '3-hexo', 'layout'),
  path.join(ROOT, 'themes', '3-hexo', 'source', 'css'),
];
// 主题/站点在用的功能性图片，永不移动或改名
const KEEP_FILES = new Set(['avatar.jpg', 'alipay.jpg', 'weixin.jpg', 'brown-papersq.png', 'gov.png', 'school-book.png']);
const IMG_NAME = String.raw`[A-Za-z0-9_.%-]+\.(?:png|jpe?g|gif|webp|bmp)`;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const postMds = () => walk(POSTS_DIR).filter((p) => /\.md$/i.test(p));
const imgFiles = () => fs.readdirSync(IMG_DIR).filter((f) => fs.statSync(path.join(IMG_DIR, f)).isFile());
const sizeOf = (name) => fs.statSync(path.join(IMG_DIR, name)).size;
const totalSize = (names) => names.reduce((s, f) => s + sizeOf(f), 0);
const fmt = (n) => (n / 1024).toFixed(0) + 'KB';
const md5 = (p) => crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');

/** 文章中引用的图片名 -> 引用它的文章列表 */
function mdRefs() {
  const refs = new Map();
  for (const p of postMds()) {
    for (const m of fs.readFileSync(p, 'utf8').matchAll(new RegExp(IMG_NAME, 'gi'))) {
      if (!refs.has(m[0])) refs.set(m[0], []);
      refs.get(m[0]).push(path.relative(ROOT, p));
    }
  }
  return refs;
}

/** 主题配置/模板/样式里引用的 /img/xxx 文件名 */
function themeRefs() {
  const files = THEME_SCAN.flatMap((p) => (fs.existsSync(p) ? (fs.statSync(p).isDirectory() ? walk(p) : [p]) : []));
  const refs = new Set();
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/\/img\/([A-Za-z0-9_.%-]+)/g)) refs.add(m[1]);
  }
  return refs;
}

function analyze() {
  const files = imgFiles();
  const refs = mdRefs();
  const referenced = new Set([...refs.keys(), ...themeRefs(), ...KEEP_FILES]);
  const orphans = files.filter((f) => !referenced.has(f));
  const byHash = new Map();
  for (const f of files) {
    const h = md5(path.join(IMG_DIR, f));
    if (!byHash.has(h)) byHash.set(h, []);
    byHash.get(h).push(f);
  }
  const dupGroups = [...byHash.values()].filter((g) => g.length > 1).map((g) => g.sort());
  const missing = [...refs.keys()].filter((n) => !files.includes(n));
  return { files, refs, referenced, orphans, dupGroups, missing };
}

/** 修改文章前先备份原稿到 _image_trash/md_backup */
function backupMd(p) {
  const dest = path.join(TRASH_SUB.mdBackup, path.relative(ROOT, p));
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(p, dest);
  }
}

function check() {
  const { files, orphans, dupGroups, missing } = analyze();
  const big = files.filter((f) => sizeOf(f) > 500 * 1024).sort((a, b) => sizeOf(b) - sizeOf(a));
  console.log(`图片目录：${files.length} 个文件，共 ${fmt(totalSize(files))}`);
  console.log(`\n[孤儿图片] ${orphans.length} 张（未被文章/主题引用，共 ${fmt(totalSize(orphans))}）`);
  orphans.forEach((f) => console.log(`  ${f}  ${fmt(sizeOf(f))}`));
  console.log(`\n[重复图片] ${dupGroups.length} 组`);
  dupGroups.forEach((g) => console.log(`  ${g.join(' = ')}`));
  console.log(`\n[文章引用了但目录中不存在] ${missing.length} 个`);
  missing.forEach((n) => console.log(`  ${n}`));
  console.log(`\n[>500KB 大图] ${big.length} 张，共 ${fmt(totalSize(big))}`);
  big.slice(0, 10).forEach((f) => console.log(`  ${f}  ${fmt(sizeOf(f))}`));
  const typo = postMds().filter((p) => fs.readFileSync(p, 'utf8').includes('。img'));
  if (typo.length) console.log(`\n[疑似坏引用（。img）] ${typo.map((p) => path.relative(ROOT, p)).join(', ')}`);
}

function clean() {
  Object.values(TRASH_SUB).forEach((d) => fs.mkdirSync(d, { recursive: true }));
  const { orphans, dupGroups } = analyze();
  const log = [`# _image_trash 清单 ${new Date().toISOString()}`, ''];
  log.push(`## 孤儿图片（${orphans.length} 张，观察确认后可整目录删除）`);
  for (const f of orphans) {
    const size = fmt(sizeOf(f));
    fs.renameSync(path.join(IMG_DIR, f), path.join(TRASH_SUB.orphan, f));
    log.push(`orphan/${f}  ${size}`);
  }
  log.push('', `## 重复图片（保留被引用的那份，其余移入 dup/，文章引用已改指向保留文件）`);
  const orphanSet = new Set(orphans);
  const losers = [];
  for (const g of dupGroups) {
    const keeper = g.find((f) => !orphanSet.has(f)); // 保留者必须是被引用的那份
    if (!keeper) continue; // 整组都是孤儿，已随孤儿流程移走
    for (const f of g) {
      if (f === keeper || orphanSet.has(f)) continue; // 孤儿成员已移入 orphan/
      fs.renameSync(path.join(IMG_DIR, f), path.join(TRASH_SUB.dup, f));
      log.push(`dup/${f}  ->  保留 ${keeper}`);
      losers.push([f, keeper]);
    }
  }
  // 改写文章：重复图名 -> 保留图名；修复中文句号坏引用
  let touched = 0;
  for (const p of postMds()) {
    let c = fs.readFileSync(p, 'utf8');
    const orig = c;
    for (const [loser, keeper] of losers) c = c.split(loser).join(keeper);
    c = c.replace(/。img\//g, 'img/');
    if (c !== orig) {
      backupMd(p);
      fs.writeFileSync(p, c);
      touched++;
    }
  }
  fs.writeFileSync(path.join(TRASH, 'manifest.txt'), log.join('\n'));
  console.log(`清理完成：孤儿 ${orphans.length} 张、重复 ${losers.length} 张已移入 _image_trash；改写文章 ${touched} 个`);
  console.log(`明细见 _image_trash/manifest.txt`);
  syncPreview();
}

async function compress() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('缺少 sharp，请先执行：npm i -D sharp');
    process.exit(1);
  }
  const { refs } = analyze();
  const before = imgFiles();
  const beforeBytes = totalSize(before);
  const targets = before.filter((f) => /\.png$/i.test(f) && refs.has(f) && !KEEP_FILES.has(f));
  fs.mkdirSync(TRASH_SUB.originals, { recursive: true });
  const rename = new Map();
  let saved = 0, done = 0;
  console.log(`待压缩：${targets.length} 张 PNG（共 ${fmt(totalSize(targets))}）`);
  for (const f of targets) {
    const src = path.join(IMG_DIR, f);
    const out = path.join(IMG_DIR, f.replace(/\.png$/i, '') + '.webp');
    if (fs.existsSync(out)) continue; // 已处理过
    let img = sharp(src);
    const meta = await img.metadata();
    if ((meta.width ?? 0) > 1400) img = img.resize({ width: 1400, withoutEnlargement: true });
    const buf = await img.webp({ quality: 85, effort: 4 }).toBuffer();
    const oldSize = fs.statSync(src).size;
    if (buf.length >= oldSize * 0.9) continue; // 收益不足 10%，保留原格式
    fs.writeFileSync(out, buf);
    fs.renameSync(src, path.join(TRASH_SUB.originals, f));
    rename.set(f, path.basename(out));
    saved += oldSize - buf.length;
    if (++done % 30 === 0) console.log(`  已压缩 ${done}/${targets.length}…`);
  }
  // 所有本地图引用统一为 /img/绝对路径，并应用改名映射
  const relRe = new RegExp('(?:\\.\\./)+img/(' + IMG_NAME + ')', 'gi');
  const absRe = new RegExp('/img/(' + IMG_NAME + ')', 'gi');
  let touched = 0;
  for (const p of postMds()) {
    let c = fs.readFileSync(p, 'utf8');
    const orig = c;
    c = c.replace(relRe, (_m, n) => '/img/' + (rename.get(n) ?? n));
    c = c.replace(absRe, (m, n) => (rename.has(n) ? '/img/' + rename.get(n) : m));
    if (c !== orig) {
      backupMd(p);
      fs.writeFileSync(p, c);
      touched++;
    }
  }
  const after = imgFiles();
  console.log(`压缩完成：${rename.size} 张转 WebP，节省 ${fmt(saved)}；文章改写 ${touched} 个`);
  console.log(`img 目录：${before.length} 个/${fmt(beforeBytes)} → ${after.length} 个/${fmt(totalSize(after))}`);
  console.log('原图备份在 _image_trash/originals/');
  syncPreview();
}

/** 把 source/img 镜像到项目根 img/（真实文件副本）。
 *  用途：Obsidian 把笔记里的 /img/xxx 绝对路径解析到 <库根>/img/，
 *  只有真实文件才会被 Obsidian 索引（junction 无效），因此维护这份副本。 */
function syncPreview() {
  const dest = path.join(ROOT, 'img');
  fs.mkdirSync(dest, { recursive: true });
  const srcNames = imgFiles();
  const destNames = new Set(fs.readdirSync(dest));
  let copied = 0, removed = 0;
  for (const f of srcNames) {
    const s = path.join(IMG_DIR, f), d = path.join(dest, f);
    if (!fs.existsSync(d) || fs.statSync(d).size !== fs.statSync(s).size) {
      fs.copyFileSync(s, d);
      copied++;
    }
  }
  for (const f of destNames) {
    if (!srcNames.includes(f)) {
      fs.rmSync(path.join(dest, f));
      removed++;
    }
  }
  console.log(`预览镜像 img/：新增/更新 ${copied}、移除 ${removed}，已与 source/img 一致`);
}

const cmd = process.argv[2];
if (cmd === 'check') check();
else if (cmd === 'clean') clean();
else if (cmd === 'compress') await compress();
else if (cmd === 'sync') syncPreview();
else {
  console.log('用法: node scripts/img-manage.mjs <check|clean|compress|sync>');
  process.exit(1);
}
