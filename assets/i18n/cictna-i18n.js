/* cictna-i18n.js: English, French and Arabic for the CICTNA RDC demo apps.
 *
 * Each app keeps its interface in one source language and loads, in <head>:
 *   <script src="i18n-strings.js"></script>                       its dictionary
 *   <script src="/portfolio/assets/i18n/cictna-i18n.js"></script>  this file
 *
 * The dictionary file sets window.CI18N_CONFIG = {
 *   source: 'en' | 'fr',               language the app is written in
 *   dict: { 'Source text': { en, fr, ar } },   whole strings (spaces collapsed)
 *   patterns: [ ['^Regex (\\d+) source$', { en, fr, ar }] ],  for text with
 *            numbers or names in it; $1, $2... are the captures, themselves
 *            translated when the dictionary knows them
 *   mount: 'css selector',             where to put the language switch
 *                                      (default: a small floating switch)
 *   skip: 'css selector',              parts of the page never to translate
 *   css: '...'                         extra rules, usually right-to-left fixes
 * }
 *
 * The script translates the text the app puts on screen, whenever it puts it
 * there, plus titles, placeholders, tooltips, alert() and confirm(). Anything
 * the dictionary does not know stays as written: sample data, codes, names.
 * The language is the one shared by the whole of cictnardc.net ('lang' in
 * localStorage), so a visitor keeps the language they picked on the website.
 */
(function () {
  'use strict';
  if (window.CI18N) return;
  var C = window.CI18N_CONFIG || {};
  var SOURCE = C.source || 'en';
  var LANGS = ['en', 'fr', 'ar'];
  var NAMES = { en: 'EN', fr: 'FR', ar: 'عربي' };
  var FONT_BASE = '/portfolio/assets/fonts/';

  /* ---------- language ---------- */
  function pickLang() {
    var q = null, s = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (LANGS.indexOf(q) >= 0) { save(q); return q; }
    try { s = localStorage.getItem('lang'); } catch (e) {}
    if (LANGS.indexOf(s) >= 0) return s;
    var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.indexOf(n) >= 0 ? n : 'en';
  }
  function save(l) { try { localStorage.setItem('lang', l); } catch (e) {} }
  var lang = pickLang();

  /* ---------- dictionary ---------- */
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  var DICT = Object.create(null);
  Object.keys(C.dict || {}).forEach(function (k) { DICT[norm(k)] = C.dict[k]; });
  var misses = Object.create(null);  // text seen with no translation, see CI18N.missing()
  var PATTERNS = (C.patterns || []).map(function (p) { return [new RegExp(p[0]), p[1]]; });

  function lookup(core) {
    var e = DICT[core];
    return e && e[lang] != null ? e[lang] : null;
  }
  function translateCore(core) {
    if (lang === SOURCE || !core) return core;
    var hit = lookup(core);
    if (hit != null) return hit;
    for (var i = 0; i < PATTERNS.length; i++) {
      var re = PATTERNS[i][0], tpl = PATTERNS[i][1][lang];
      if (tpl == null) continue;
      var m = core.match(re);
      if (m && m[0].length === core.length) {
        hit = tpl.replace(/\$(\d)/g, function (_, d) {
          var g = m[+d]; if (g == null) return '';
          var gh = lookup(norm(g));
          if (gh != null) return gh;
          if (g.indexOf(', ') > 0) return g.split(', ').map(function (x) { var y = lookup(norm(x)); return y != null ? y : x; }).join(lang === 'ar' ? '، ' : ', ');
          return g;
        });
        return hit;
      }
    }
    if (/[A-Za-zÀ-ÿ\u0600-\u06FF]{2}/.test(core)) misses[core] = (misses[core] || 0) + 1;
    return core;
  }
  function t(s) {
    if (s == null || lang === SOURCE) return s;
    s = String(s);
    var m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var core = norm(m[2]);
    var out = translateCore(core);
    return out === core ? s : m[1] + out + m[3];
  }

  /* ---------- page ---------- */
  var origText = new WeakMap();   // text node -> source text
  var written = new WeakMap();    // text node -> what we last wrote into it
  var origAttr = new WeakMap();   // element -> { attr: source value }
  var ATTRS = ['title', 'placeholder', 'aria-label', 'alt', 'data-tooltip'];
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1, svg: 1, SVG: 1, TEMPLATE: 1 };
  var SKIP_SEL = '[data-i18n-skip],[contenteditable=""],[contenteditable="true"],.ci18n-switch' + (C.skip ? ',' + C.skip : '');

  function skipped(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentNode) {
      if (SKIP_TAGS[e.tagName]) return true;
      if (e.getAttribute && e.getAttribute('translate') === 'no') return true;
    }
    return !!(el && el.closest && el.closest(SKIP_SEL));
  }
  function doText(node) {
    if (!node.parentNode || node.parentNode.nodeType !== 1) return;
    if (node.parentNode.tagName !== 'TITLE' && skipped(node.parentNode)) return;
    var cur = node.nodeValue;
    if (!origText.has(node) || written.get(node) !== cur) origText.set(node, cur);
    var src = origText.get(node);
    if (!/[A-Za-zÀ-ÿ؀-ۿ]/.test(src)) return;
    var out = t(src);
    if (out !== cur) { written.set(node, out); node.nodeValue = out; }
    else written.set(node, cur);
  }
  function doAttrs(el) {
    if (skipped(el)) return;
    var store = origAttr.get(el);
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (v == null) continue;
      if (!store) { store = {}; origAttr.set(el, store); }
      if (store[a] == null || (store[a + '>'] !== v)) store[a] = v;
      var out = t(store[a]);
      store[a + '>'] = out;
      if (out !== v) el.setAttribute(a, out);
    }
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/.test(el.type) && el.value) {
      if (!store) { store = {}; origAttr.set(el, store); }
      if (store.value == null || store['value>'] !== el.value) store.value = el.value;
      var ov = t(store.value); store['value>'] = ov; if (ov !== el.value) el.value = ov;
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) { if (SKIP_TAGS[root.tagName] || (root.tagName !== 'HTML' && root.tagName !== 'HEAD' && root.tagName !== 'TITLE' && skipped(root))) return; doAttrs(root); }
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeType === 1) {
          if (SKIP_TAGS[n.tagName]) return NodeFilter.FILTER_REJECT;
          if (n.matches && n.matches(SKIP_SEL)) return NodeFilter.FILTER_REJECT;
          if (n.getAttribute('translate') === 'no') return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }

  var busy = false;
  var mo = new MutationObserver(function (list) {
    if (busy) return;
    busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') { if (m.target.nodeType === 1) doAttrs(m.target); }
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    } finally { busy = false; }
  });
  function observe() {
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['value']) });
  }

  /* ---------- direction, fonts, switch ---------- */
  function fontCss() {
    var r = 'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F';
    return [400, 500, 600, 700].map(function (w) {
      return '@font-face{font-family:"CI Arabic";font-style:normal;font-weight:' + w + ';font-display:swap;src:url(' +
        FONT_BASE + 'ibm-plex-sans-arabic-' + w + '.woff2) format("woff2");unicode-range:' + r + '}';
    }).join('\n');
  }
  var style = document.createElement('style');
  style.id = 'ci18n-style';
  style.textContent = fontCss() + '\n' +
    '.ci18n-switch{display:inline-flex;gap:2px;padding:2px;border-radius:999px;border:1px solid rgba(31,46,47,.18);background:rgba(255,255,255,.92);direction:ltr;font:600 12px/1.2 "Archivo","CI Arabic",system-ui,sans-serif;box-shadow:0 6px 18px -10px rgba(0,0,0,.35)}' +
    '.ci18n-switch button{all:unset;cursor:pointer;padding:5px 10px;border-radius:999px;color:#5b6b6a}' +
    '.ci18n-switch button[data-l="ar"]{font-family:"CI Arabic","Segoe UI",Tahoma,sans-serif}' +
    '.ci18n-switch button[aria-pressed="true"]{background:#1f2e2f;color:#eef2f1}' +
    '.ci18n-switch button:focus-visible{outline:2px solid #3d6d78;outline-offset:2px}' +
    '.ci18n-float{position:fixed;z-index:2147483000;bottom:14px;inset-inline-end:14px}' +
    '@media print{.ci18n-switch{display:none!important}}' +
    (C.css || '');
  (document.head || document.documentElement).appendChild(style);

  function applyDir() {
    var h = document.documentElement;
    h.setAttribute('lang', lang);
    h.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    h.classList.toggle('ci18n-rtl', lang === 'ar');
  }

  var switches = [];
  function makeSwitch() {
    var box = document.createElement('div');
    box.className = 'ci18n-switch';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Language');
    box.setAttribute('translate', 'no');
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.l = l; b.textContent = NAMES[l];
      if (l === 'ar') b.setAttribute('aria-label', 'العربية');
      b.addEventListener('click', function () { setLang(l, true); });
      box.appendChild(b);
    });
    switches.push(box);
    paintSwitches();
    return box;
  }
  function paintSwitches() {
    switches.forEach(function (box) {
      [].forEach.call(box.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.l === lang)); });
    });
  }
  function mountSwitch() {
    var host = C.mount && document.querySelector(C.mount);
    var box = makeSwitch();
    if (host) host.appendChild(box);
    else { box.classList.add('ci18n-float'); document.body.appendChild(box); }
  }

  var listeners = [];
  function setLang(l, remember) {
    if (LANGS.indexOf(l) < 0 || l === lang) { if (remember) save(l); return; }
    lang = l;
    if (remember) save(l);
    applyDir();
    paintSwitches();
    busy = true;
    try { walk(document.documentElement); } finally { busy = false; }
    listeners.forEach(function (f) { try { f(lang); } catch (e) {} });
    try { window.dispatchEvent(new CustomEvent('ci18n:change', { detail: { lang: lang } })); } catch (e) {}
  }

  /* alert / confirm / prompt speak the visitor's language too */
  ['alert', 'confirm', 'prompt'].forEach(function (k) {
    var f = window[k]; if (typeof f !== 'function') return;
    window[k] = function (msg) { var a = [].slice.call(arguments); a[0] = t(msg); return f.apply(window, a); };
  });

  window.CI18N = {
    t: t,
    get lang() { return lang; },
    source: SOURCE,
    missing: function () { return Object.keys(misses); },
    setLang: function (l) { setLang(l, true); },
    onChange: function (f) { listeners.push(f); },
    refresh: function () { busy = true; try { walk(document.documentElement); } finally { busy = false; } }
  };

  applyDir();
  walk(document.documentElement);
  observe();
  function ready() { walk(document.body); mountSwitch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
