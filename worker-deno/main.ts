// 博客阅读量计数服务 —— Deno Deploy 版
// （Cloudflare workers.dev 在国内被 DNS 污染，故移植到 deno.dev，见 README）
// 端点：
//   GET /bz.js  客户端脚本（自动填充页面上的不蒜子占位符，支持 pjax）
//   GET /api?path=<页面路径>&uv=<访客id>  计数并返回 JSON
// 数据存储：Deno KV（Deploy 平台内置，无需配置）
const UV_TTL_MS = 180 * 24 * 3600 * 1000; // 独立访客去重窗口：180 天

const kv = await Deno.openKv();

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

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
    const path = normalizePath(url.searchParams.get('path') || req.headers.get('referer') || '/');
    const uv = (url.searchParams.get('uv') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);

    const [sitePvOld, pagePvOld, visitorOld, siteUvOld] = await Promise.all([
      kv.get(['site_pv']),
      kv.get(['pv', path]),
      uv ? kv.get(['visitor', uv]) : Promise.resolve({ value: true }),
      kv.get(['site_uv']),
    ]);
    const sitePv = Number(sitePvOld.value || 0) + 1;
    const pagePv = Number(pagePvOld.value || 0) + 1;
    const siteUv = Number(siteUvOld.value || 0) + (visitorOld.value ? 0 : 1);
    await Promise.all([
      kv.set(['site_pv'], sitePv),
      kv.set(['pv', path], pagePv),
      kv.set(['site_uv'], siteUv),
      ...(uv ? [kv.set(['visitor', uv], true, { expireIn: UV_TTL_MS })] : []),
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
});

function normalizePath(p: string): string {
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
