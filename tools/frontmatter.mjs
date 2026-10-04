#!/usr/bin/env node
// 笔记属性(front-matter)补全工具：
//   1) 完全没有属性头的笔记 → 补全 title / date / categories / tags
//   2) 有属性头但缺个别字段 → 只补缺的字段，已有字段一律不动
// date 一律取文件创建时间（与 Hexo 对缺失 date 的回退规则一致，保证 URL 稳定）
// categories 按所在目录层级生成，tags 取顶层目录名
// 用法：npm run fm:fill
import fs from 'node:fs';
import path from 'node:path';

const POSTS = path.resolve(import.meta.dirname, '..', 'source', '_posts');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
}

const pad = (n) => String(n).padStart(2, '0');
const safeTitle = (t) => (/[:#\[\]{}&*'",|>@`]/.test(t) ? JSON.stringify(t) : t);
const dateOf = (f) => {
  const b = fs.statSync(f).birthtime;
  return `${b.getFullYear()}-${pad(b.getMonth() + 1)}-${pad(b.getDate())} ${pad(b.getHours())}:${pad(b.getMinutes())}:${pad(b.getSeconds())}`;
};

let fullAdd = 0, patched = 0;
for (const f of walk(POSTS).filter((f) => /\.md$/i.test(f))) {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(POSTS, f);
  const parts = path.dirname(rel).split(path.sep).filter(Boolean);
  const title = path.basename(f, '.md');

  // 情况1：完全没有属性头
  if (!content.startsWith('---')) {
    const fm = [
      '---',
      `title: ${safeTitle(title)}`,
      `date: ${dateOf(f)}`,
      'categories:',
      ...parts.map((p) => `  - ${p}`),
      'tags:',
      ...(parts.length ? [`  - ${parts[0]}`] : []),
      '---',
      '',
    ].join('\n');
    fs.writeFileSync(f, fm + content);
    fullAdd++;
    console.log(`已补全属性: ${rel}`);
    continue;
  }

  // 情况2：有属性头但缺字段，只补缺的
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) continue; // 形式异常，不碰
  const fm = m[1];
  let insert = [];
  if (!/^title:/m.test(fm)) insert.push(`title: ${safeTitle(title)}`);
  if (!/^date:/m.test(fm)) insert.push(`date: ${dateOf(f)}`);
  let append = '';
  if (!/^categories:/m.test(fm)) {
    append += '\ncategories:';
    for (const p of parts) append += `\n  - ${p}`;
  }
  if (!/^tags:/m.test(fm)) {
    append += '\ntags:';
    if (parts.length) append += `\n  - ${parts[0]}`;
  }
  if (insert.length || append) {
    const newFm = (insert.length ? insert.join('\n') + '\n' : '') + fm + append;
    fs.writeFileSync(f, content.replace(m[0], `---\n${newFm}\n---`));
    patched++;
    console.log(`已补缺字段: ${rel}  补了 ${[...insert.map((l) => l.split(':')[0]), append.includes('categories') ? 'categories' : '', append.includes('tags') ? 'tags' : ''].filter(Boolean).join('/')}`);
  }
}
console.log(`\n完成：整篇补全 ${fullAdd}，补缺字段 ${patched}`);
