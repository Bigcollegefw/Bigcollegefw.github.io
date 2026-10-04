'use strict';
// 渲染后给页面所有 <img> 补充 loading="lazy" 与 decoding="async"，
// 浏览器只加载视口内的图片，首屏和长文章明显变快。
hexo.extend.filter.register('after_render:html', (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, '<img loading="lazy" decoding="async"$1>');
});
