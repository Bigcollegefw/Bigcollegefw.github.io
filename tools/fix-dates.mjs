#!/usr/bin/env node
// 修复老笔记里坏掉的 date 占位符（date:\n  "{ date }": → date: 文件创建时间）
// 用创建时间而非修改时间：Hexo 对无效 date 的回退规则就是创建时间，
// 显式写入相同的值可保证所有文章的 URL（年份/月份/hash）逐字符不变。
// 用法：
//   npm run fm:fix-dates                    修复全部
//   node tools/fix-dates.mjs --sample       只修复 2 篇样本（用于验证 URL 不变）
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const POSTS = path.join(ROOT, 'source', '_posts');
const BACKUP = path.join(ROOT, '_image_trash', 'md_backup');
const BROKEN = /date:[ \t]*\r?\n[ \t]*"\{ date \}":[ \t]*\r?\n/;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
}

const pad = (n) => String(n).padStart(2, '0');
const SAMPLES = [
  path.join(POSTS, 'CSharp', 'CSharp核心', '23.Object中的方法.md'),
  path.join(POSTS, '图形学', 'Shader', 'UnityShader', '1.材质和Shader.md'),
];

const targets = process.argv.includes('--sample')
  ? SAMPLES
  : walk(POSTS).filter((f) => /\.md$/i.test(f));

let fixed = 0;
for (const f of targets) {
  const content = fs.readFileSync(f, 'utf8');
  if (!BROKEN.test(content)) continue;
  const m = fs.statSync(f).birthtime;
  const d = `${m.getFullYear()}-${pad(m.getMonth() + 1)}-${pad(m.getDate())} ${pad(m.getHours())}:${pad(m.getMinutes())}:${pad(m.getSeconds())}`;
  const dest = path.join(BACKUP, path.relative(ROOT, f));
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(f, dest);
  }
  fs.writeFileSync(f, content.replace(BROKEN, `date: ${d}\n`));
  fixed++;
  console.log(`date已修复: ${path.relative(ROOT, f)} → 创建时间 ${d}`);
}
console.log(`\n完成：${fixed} 篇`);
