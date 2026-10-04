<%*
// 新笔记自动属性头：date=笔记文件的创建时间，categories=所在目录层级，tags=顶层分类
// title 故意不写：新建时文件名往往是"未命名"，标题留到发布前由 npm run fm:fill 按最终文件名补
const rel = tp.file.folder(true).replace(/^.*_posts\/?/, "");
const parts = rel ? rel.split("/") : [];
let out = "---\ndate: " + tp.file.creation_date("YYYY-MM-DD HH:mm:ss") + "\ncategories:";
for (const p of parts) out += "\n  - " + p;
out += "\ntags:";
if (parts.length) out += "\n  - " + parts[0];
tR += out + "\n---\n";
-%>

