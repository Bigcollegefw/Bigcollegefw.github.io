/**
 * 三栏自由调节（可选装特性）
 * 在左栏/中栏之间、中栏/正文之间各加一条可拖拽分隔条：
 *   - 拖动调整各栏宽度（左栏 90~420px，中栏 260~800px）
 *   - 宽度存 localStorage，下次访问自动恢复
 *   - 双击分隔条恢复主题默认宽度
 *   - 仅 >1024px 的桌面窗口生效，移动端/平板不受影响
 */
(function () {
  var LS_KEY = 'bz_panels_v1';
  var MIN_LEFT = 90, MAX_LEFT = 420, MIN_MID = 260, MAX_MID = 800;
  var BORDER = 2; // .nav 左中两栏边框合计

  var style = document.createElement('style');
  style.textContent =
    '@media (min-width: 1025px){' +
    '.nav{width:calc(var(--bz-left) + var(--bz-mid) + ' + BORDER + 'px) !important}' +
    '.nav.fullscreen{margin-left:calc(-1 * (var(--bz-left) + var(--bz-mid) + ' + BORDER + 'px)) !important}' +
    '.nav-left{width:var(--bz-left) !important}' +
    '.nav-right{width:var(--bz-mid) !important}' +
    '.title-list.friend{margin-left:calc(var(--bz-mid) + 1px) !important}' +
    '.bz-handle{position:fixed;top:0;height:100%;width:8px;margin-left:-4px;cursor:col-resize;z-index:99;' +
    'background:transparent;user-select:none}' +
    '.bz-handle::after{content:"";display:block;height:100%;width:2px;margin:0 auto;background:transparent;transition:background .15s}' +
    '.bz-handle:hover::after,.bz-handle.dragging::after{background:#309e85}' +
    '}' +
    '@media (max-width:1024px){.bz-handle{display:none}}';
  document.head.appendChild(style);

  var root = document.documentElement;

  function defaults() {
    var left = parseFloat(getComputedStyle(document.querySelector('.nav-left')).width) || 120;
    var mid = parseFloat(getComputedStyle(document.querySelector('.nav-right')).width) || 420;
    return { left: left, mid: mid };
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function apply(left, mid) {
    root.style.setProperty('--bz-left', clamp(left, MIN_LEFT, MAX_LEFT) + 'px');
    root.style.setProperty('--bz-mid', clamp(mid, MIN_MID, MAX_MID) + 'px');
  }

  function save(left, mid) { try { localStorage.setItem(LS_KEY, JSON.stringify({ left: left, mid: mid })); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) { return null; } }

  function makeHandle(which) {
    var h = document.createElement('div');
    h.className = 'bz-handle';
    h.title = '拖动调整宽度，双击恢复默认';
    if (which === 'left') h.style.left = 'var(--bz-left)';
    else h.style.left = 'calc(var(--bz-left) + var(--bz-mid) + ' + BORDER + 'px)';
    h.addEventListener('dblclick', function () {
      var d = defaults();
      apply(d.left, d.mid);
      save(d.left, d.mid);
    });
    h.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      h.classList.add('dragging');
      h.setPointerCapture(e.pointerId);
      var cur = load() || defaults();
      function move(ev) {
        if (which === 'left') {
          var d2 = defaults();
          apply(ev.clientX, cur.mid || d2.mid);
        } else {
          var c = load() || defaults();
          var leftNow = parseFloat(root.style.getPropertyValue('--bz-left')) || c.left;
          apply(leftNow, ev.clientX - leftNow - BORDER);
        }
      }
      function up(ev) {
        h.classList.remove('dragging');
        h.removeEventListener('pointermove', move);
        h.removeEventListener('pointerup', up);
        var leftNow = parseFloat(root.style.getPropertyValue('--bz-left')) || defaults().left;
        var midNow = parseFloat(root.style.getPropertyValue('--bz-mid')) || defaults().mid;
        save(leftNow, midNow);
      }
      h.addEventListener('pointermove', move);
      h.addEventListener('pointerup', up);
    });
    document.body.appendChild(h);
  }

  function init() {
    if (!document.querySelector('.nav-left') || document.querySelector('.bz-handle')) return;
    var saved = load();
    var d = defaults();
    apply(saved ? saved.left : d.left, saved ? saved.mid : d.mid);
    makeHandle('left');
    makeHandle('mid');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  // pjax 翻页后正文内容变化，但三栏结构常驻，无需重建；保险起见监听一次
  if (window.jQuery) window.jQuery(document).on('pjax:end', function () { init(); });
})();
