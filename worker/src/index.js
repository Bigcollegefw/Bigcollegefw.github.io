// 博客阅读量计数服务 —— 自托管于 Cloudflare Workers + KV
// 协议兼容 3-hexo 主题的不蒜子标记（busuanzi_value_page_pv / site_pv / site_uv）
// 端点：
//   GET /bz.js  客户端脚本（自动填充页面上的计数占位符，支持 pjax）
//   GET /api?path=<页面路径>&uv=<访客id>  计数并返回 JSON
const UV_TTL = 60 * 60 * 24 * 180; // 独立访客去重窗口：180 天

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/bz.js') {
      return new Response(CLIENT_JS, {
        headers: {
          'content-type': 'application/javascript; charset=utf-8',
          'cache-control': 'public, max-age=3600',
          'access-control-allow-origin': '*',
        },
      });
    }

    if (url.pathname === '/api') {
      const path = normalizePath(url.searchParams.get('path') || request.headers.get('referer') || '/');
      const uv = (url.searchParams.get('uv') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);

      // KV 最终一致：并发瞬间可能少量少计，个人博客场景足够
      const [sitePvOld, pagePvOld, visitorOld, siteUvOld] = await Promise.all([
        env.BV.get('site_pv'),
        env.BV.get('pv:' + path),
        uv ? env.BV.get('visitor:' + uv) : Promise.resolve('1'),
        env.BV.get('site_uv'),
      ]);
      const sitePv = Number(sitePvOld || 0) + 1;
      const pagePv = Number(pagePvOld || 0) + 1;
      const siteUv = Number(siteUvOld || 0) + (visitorOld ? 0 : 1);
      await Promise.all([
        env.BV.put('site_pv', String(sitePv)),
        env.BV.put('pv:' + path, String(pagePv)),
        env.BV.put('site_uv', String(siteUv)),
        ...(uv ? [env.BV.put('visitor:' + uv, '1', { expirationTtl: UV_TTL })] : []),
      ]);

      return new Response(JSON.stringify({ site_uv: siteUv, site_pv: sitePv, page_pv: pagePv }), {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'access-control-allow-origin': '*',
          'cache-control': 'no-store',
        },
      });
    }

    return new Response('blog counter service: /bz.js /api\n', { status: 404 });
  },
};

function normalizePath(p) {
  try { p = decodeURIComponent(p); } catch { /* 保留原样 */ }
  let pathname = '/';
  try { pathname = new URL(p, 'https://x.invalid').pathname; } catch { /* 保留 */ }
  return (pathname.replace(/\/+$/, '') || '/').slice(0, 200);
}

// 客户端脚本：按脚本自身地址定位 API（无需写死域名），填充占位符；监听 pjax 翻页重取
const CLIENT_JS = `(function () {
  function uvId() {
    try {
      var k = 'bz_uv_id', v = localStorage.getItem(k);
      if (!v) { v = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return ''; }
  }
  function fill(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  function fetchCounts() {
    var base = document.currentScript ? new URL('.', document.currentScript.src).href : '';
    if (!base) return;
    fetch(base + 'api?path=' + encodeURIComponent(location.pathname) + '&uv=' + encodeURIComponent(uvId()))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        fill('busuanzi_value_page_pv', d.page_pv);
        fill('busuanzi_value_site_pv', d.site_pv);
        fill('busuanzi_value_site_uv', d.site_uv);
      })
      .catch(function () { fill('busuanzi_value_page_pv', '-'); });
  }
  fetchCounts();
  if (window.jQuery) { window.jQuery(document).on('pjax:success', fetchCounts); }
  else { document.addEventListener('pjax:success', fetchCounts); }
})();
`;
