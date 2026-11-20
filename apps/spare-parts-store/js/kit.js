/* Shared kit for the CICTNA RDC demo apps: languages (EN/FR/AR), DOM helpers,
   tables with search, sort, selection and CSV export, modals, toasts, small SVG charts. */
(function () {
  "use strict";
  const LANGS = ["en", "fr", "ar"];
  const read = () => { try { return localStorage.getItem("lang"); } catch (e) { return null; } };
  const write = (v) => { try { localStorage.setItem("lang", v); } catch (e) {} };
  let q = null;
  try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
  let lang = LANGS.includes(q) ? q : read();
  if (!LANGS.includes(lang)) lang = (navigator.language || "en").slice(0, 2).toLowerCase();
  if (!LANGS.includes(lang)) lang = "en";
  if (LANGS.includes(q)) write(q);

  const S = Object.create(null);
  const listeners = [];
  const idx = () => LANGS.indexOf(lang);

  /** Translate a key. Unknown keys come back as written (record data, codes, names). */
  function t(k, ...a) {
    const e = S[k];
    let s = e ? (e[idx()] != null ? e[idx()] : e[0]) : k;
    if (a.length) s = s.replace(/\{(\d)\}/g, (_, i) => (a[i] != null ? a[i] : ""));
    return s;
  }
  function apply() {
    const d = document.documentElement;
    d.lang = lang; d.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll(".lang-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }
  function set(l) {
    if (!LANGS.includes(l) || l === lang) return;
    lang = l; write(l); apply(); listeners.forEach((f) => f(lang));
  }
  function switcher() {
    const box = h("div", { class: "lang-switch", role: "group", "aria-label": "Language" });
    [["en", "EN"], ["fr", "FR"], ["ar", "عربي"]].forEach(([code, label]) => {
      box.append(h("button", { type: "button", "data-lang": code, lang: code, "aria-pressed": String(code === lang), onclick: () => set(code) }, label));
    });
    return box;
  }
  window.addEventListener("storage", (e) => { if (e.key === "lang" && LANGS.includes(e.newValue) && e.newValue !== lang) { lang = e.newValue; apply(); listeners.forEach((f) => f(lang)); } });

  const locale = () => (lang === "ar" ? "ar-u-nu-latn" : lang === "fr" ? "fr-FR" : "en-GB");
  const num = (n, d) => Number(n).toLocaleString(locale(), { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const date = (ts) => new Date(ts).toLocaleDateString(locale(), { day: "2-digit", month: "short", year: "numeric" });
  const dateShort = (ts) => new Date(ts).toLocaleDateString(locale(), { day: "2-digit", month: "short" });
  const time = (ts) => new Date(ts).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateTime = (ts) => dateShort(ts) + " " + new Date(ts).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit", hour12: false });

  /* ---------- DOM ---------- */
  function h(tag, attrs, ...kids) {
    const svg = ["svg", "g", "path", "rect", "circle", "line", "polyline", "polygon", "text", "defs", "linearGradient", "stop", "clipPath", "ellipse", "tspan"].includes(tag);
    const el = svg ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") svg ? el.setAttribute("class", v) : (el.className = v);
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    kids.flat(Infinity).forEach((c) => { if (c != null && c !== false) el.append(c.nodeType ? c : String(c)); });
    return el;
  }
  const put = (el, ...kids) => el.replaceChildren(...kids.flat(Infinity).filter((k) => k != null && k !== false));
  const ltr = (s) => h("bdi", { class: "ltr" }, s);

  function toast(msg, kind) {
    let box = document.querySelector(".toasts");
    if (!box) { box = h("div", { class: "toasts", role: "status", "aria-live": "polite" }); document.body.append(box); }
    const el = h("div", { class: "toast " + (kind || "") }, msg);
    box.append(el);
    setTimeout(() => el.classList.add("out"), 2800);
    setTimeout(() => el.remove(), 3200);
  }

  /** Modal dialog. buttons: [[label, fn, cls]]; fn may return false to keep it open. */
  function modal(title, body, buttons, wide) {
    const close = () => { wrap.remove(); document.removeEventListener("keydown", esc); };
    const esc = (e) => { if (e.key === "Escape") close(); };
    const foot = h("footer", {}, (buttons || [[t("Close"), null]]).map(([label, fn, cls]) => h("button", { class: "btn " + (cls || ""), type: "button", onclick: () => { if (!fn || fn() !== false) close(); } }, label)));
    const wrap = h("div", { class: "modal", onclick: (e) => { if (e.target === wrap) close(); } },
      h("div", { class: "box" + (wide ? " wide" : ""), role: "dialog", "aria-modal": "true", "aria-label": title }, h("header", {}, h("h3", {}, title), h("button", { class: "x", type: "button", "aria-label": t("Close"), onclick: close }, "×")), h("div", { class: "body" }, body), foot));
    document.addEventListener("keydown", esc);
    document.body.append(wrap);
    const f = wrap.querySelector("input,select,textarea"); if (f) setTimeout(() => f.focus(), 30);
    return { close, el: wrap };
  }

  function field(label, input) { return h("label", { class: "field" }, h("span", {}, label), input); }
  function select(options, value) {
    return h("select", {}, options.map(([v, l]) => h("option", { value: v, selected: String(v) === String(value) ? true : null }, l)));
  }

  function csv(name, cols, rows) {
    const esc = (v) => { const s = String(v == null ? "" : v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [cols.map((c) => esc(t(c.label))).join(",")].concat(rows.map((r) => cols.map((c) => esc(c.csv ? c.csv(r) : (c.text ? c.text(r) : r[c.key]))).join(",")));
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = h("a", { href: URL.createObjectURL(blob), download: name + ".csv" });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /**
   * Data table. opts: { id, cols:[{key,label,render(r),text(r),num,sort(r),width,cls}], rows(), rowKey(r),
   *   search(r) -> string, filters:[{label, options:[[v,l]], test(r,v)}], select:true, bulk:[[label, fn(rows), cls]],
   *   actions:(r)->nodes, empty, csvName, rowClass(r), pageSize }
   * Returns { el, refresh() }.
   */
  function table(o) {
    const state = { q: "", f: (o.filters || []).map(() => "") , sort: o.sortBy || null, dir: o.sortDir || 1, sel: new Set(), page: 0 };
    const el = h("div", { class: "tbl-wrap" });
    const tools = h("div", { class: "tools" });
    const scroller = h("div", { class: "scroll" });
    const foot = h("div", { class: "tfoot" });
    el.append(tools, scroller, foot);
    const size = o.pageSize || 25;

    function filtered() {
      let rows = o.rows();
      const q = state.q.trim().toLowerCase();
      if (q) rows = rows.filter((r) => (o.search ? o.search(r) : JSON.stringify(r)).toLowerCase().includes(q));
      (o.filters || []).forEach((f, i) => { if (state.f[i] !== "") rows = rows.filter((r) => f.test(r, state.f[i])); });
      if (state.sort) {
        const c = o.cols.find((x) => x.key === state.sort);
        const val = c && (c.sort || ((r) => r[c.key]));
        if (val) rows = rows.slice().sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * state.dir; });
      }
      return rows;
    }
    function drawTools() {
      const search = h("input", { type: "search", placeholder: t("Search…"), value: state.q, "aria-label": t("Search"), oninput: (e) => { state.q = e.target.value; state.page = 0; drawBody(); } });
      const fs = (o.filters || []).map((f, i) => {
        const s = select([["", t(f.label)]].concat(f.options().map(([v, l]) => [v, t(l)])), state.f[i]);
        s.setAttribute("aria-label", t(f.label));
        s.onchange = () => { state.f[i] = s.value; state.page = 0; drawBody(); };
        return s;
      });
      const bulk = h("div", { class: "bulk" });
      const exp = h("button", { class: "btn ghost sm", type: "button", onclick: () => csv(o.csvName || o.id, o.cols.filter((c) => !c.noCsv), filtered()) }, "⇩ CSV");
      put(tools, h("div", { class: "search" }, search), fs, h("div", { class: "grow" }), bulk, exp);
      drawBulk();
    }
    function drawBulk() {
      const bulk = tools.querySelector(".bulk");
      if (!bulk) return;
      if (!o.select || !state.sel.size) { put(bulk); return; }
      const rows = o.rows().filter((r) => state.sel.has(o.rowKey(r)));
      put(bulk, h("span", { class: "muted" }, t("{0} selected", rows.length)),
        (o.bulk || []).map(([label, fn, cls]) => h("button", { class: "btn sm " + (cls || ""), type: "button", onclick: () => { fn(rows); state.sel.clear(); refresh(); } }, t(label))));
    }
    function drawBody() {
      const rows = filtered();
      const pages = Math.max(1, Math.ceil(rows.length / size));
      if (state.page >= pages) state.page = pages - 1;
      const view = rows.slice(state.page * size, state.page * size + size);
      const head = h("tr", {},
        o.select ? h("th", { class: "chk" }, h("input", { type: "checkbox", "aria-label": t("Select all"), checked: view.length && view.every((r) => state.sel.has(o.rowKey(r))) ? true : null,
          onchange: (e) => { view.forEach((r) => e.target.checked ? state.sel.add(o.rowKey(r)) : state.sel.delete(o.rowKey(r))); drawBody(); drawBulk(); } })) : null,
        o.cols.map((c) => h("th", { class: (c.num ? "n " : "") + (c.cls || "") + (c.nosort ? "" : " sortable"), style: c.width ? "width:" + c.width : null, "aria-sort": state.sort === c.key ? (state.dir > 0 ? "ascending" : "descending") : null,
          onclick: c.nosort ? null : () => { if (state.sort === c.key) state.dir = -state.dir; else { state.sort = c.key; state.dir = 1; } drawBody(); } },
          t(c.label), c.nosort ? null : h("span", { class: "si" + (state.sort === c.key ? " on" : "") }, state.sort === c.key ? (state.dir > 0 ? "▲" : "▼") : "↕"))),
        o.actions ? h("th", { class: "act" }) : null);
      const body = view.map((r) => h("tr", { class: (state.sel.has(o.rowKey && o.rowKey(r)) ? "sel " : "") + (o.rowClass ? o.rowClass(r) || "" : "") },
        o.select ? h("td", { class: "chk" }, h("input", { type: "checkbox", "aria-label": t("Select"), checked: state.sel.has(o.rowKey(r)) ? true : null,
          onchange: (e) => { e.target.checked ? state.sel.add(o.rowKey(r)) : state.sel.delete(o.rowKey(r)); e.target.closest("tr").classList.toggle("sel", e.target.checked); drawBulk(); } })) : null,
        o.cols.map((c) => h("td", { class: (c.num ? "n " : "") + (c.cls || "") }, c.render ? c.render(r) : (c.text ? c.text(r) : r[c.key]))),
        o.actions ? h("td", { class: "act" }, o.actions(r)) : null));
      put(scroller, h("table", { class: "tbl" }, h("thead", {}, head), h("tbody", {}, body.length ? body : h("tr", {}, h("td", { colspan: String(o.cols.length + 2), class: "empty" }, t(o.empty || "Nothing to show")))))) ;
      put(foot, h("span", { class: "muted" }, t("{0} rows", num(rows.length))), h("div", { class: "grow" }),
        pages > 1 ? [h("button", { class: "btn ghost sm", type: "button", disabled: state.page === 0 ? true : null, onclick: () => { state.page--; drawBody(); } }, t("Previous")),
          h("span", { class: "muted num" }, (state.page + 1) + " / " + pages),
          h("button", { class: "btn ghost sm", type: "button", disabled: state.page >= pages - 1 ? true : null, onclick: () => { state.page++; drawBody(); } }, t("Next"))] : null);
    }
    function refresh() { drawTools(); drawBody(); }
    refresh();
    return { el, refresh, setFilter(i, v) { state.f[i] = v; refresh(); }, setSearch(v) { state.q = v; refresh(); } };
  }

  /* ---------- small SVG charts ---------- */
  /** Horizontal bars: items [{label, value, cls}] */
  function hbars(items, fmt) {
    const max = Math.max(1, ...items.map((i) => i.value));
    return h("div", { class: "hbars" }, items.map((i) => h("div", { class: "hb" },
      h("span", { class: "l" }, i.label), h("span", { class: "b" }, h("i", { class: i.cls || "", style: "width:" + Math.max(1.5, (i.value / max) * 100) + "%" })), h("span", { class: "v num" }, fmt ? fmt(i.value) : num(i.value)))));
  }
  /** Vertical columns: items [{label, value, value2?}] */
  function columns(items, opts) {
    opts = opts || {};
    const W = 560, H = 190, P = 26, max = Math.max(1, ...items.map((i) => Math.max(i.value, i.value2 || 0))) * 1.12;
    const bw = (W - P * 2) / items.length;
    const g = h("svg", { viewBox: `0 0 ${W} ${H + 24}`, class: "cols", role: "img", "aria-label": opts.label || "" });
    [0.25, 0.5, 0.75, 1].forEach((f) => g.append(h("line", { x1: P, x2: W - P, y1: H - (H - 10) * f, y2: H - (H - 10) * f, class: "grid" })));
    items.forEach((it, i) => {
      const x = P + i * bw, bh = ((H - 10) * it.value) / max;
      g.append(h("rect", { x: x + bw * 0.18, y: H - bh, width: bw * (it.value2 != null ? 0.32 : 0.64), height: bh, rx: 3, class: "c1" }, h("title", {}, it.label + ": " + num(it.value))));
      if (it.value2 != null) { const b2 = ((H - 10) * it.value2) / max; g.append(h("rect", { x: x + bw * 0.52, y: H - b2, width: bw * 0.32, height: b2, rx: 3, class: "c2" }, h("title", {}, it.label + ": " + num(it.value2)))); }
      if (items.length <= 8 || i % 2 === items.length % 2) g.append(h("text", { x: x + bw / 2, y: H + 16, "text-anchor": "middle", class: "lbl" }, it.label));
    });
    g.append(h("line", { x1: P, x2: W - P, y1: H, y2: H, class: "axis" }));
    return g;
  }
  /** Donut: items [{label, value, color}] */
  function donut(items, centre, fmt) {
    const tot = items.reduce((s, i) => s + i.value, 0) || 1, R = 52, C = 2 * Math.PI * R;
    let off = 0;
    const g = h("svg", { viewBox: "0 0 140 140", class: "donut", role: "img" }, h("circle", { cx: 70, cy: 70, r: R, class: "track" }));
    items.forEach((i) => { const len = (i.value / tot) * C; g.append(h("circle", { cx: 70, cy: 70, r: R, stroke: i.color, "stroke-dasharray": `${len} ${C - len}`, "stroke-dashoffset": String(-off), transform: "rotate(-90 70 70)", class: "seg" })); off += len; });
    if (centre) g.append(h("text", { x: 70, y: 76, "text-anchor": "middle", class: "ctr" }, centre));
    return h("div", { class: "donut-wrap" }, g, h("ul", { class: "legend" }, items.map((i) => h("li", {}, h("i", { style: "background:" + i.color }), h("span", {}, i.label), h("b", { class: "num" }, fmt ? fmt(i.value) : num(i.value))))));
  }

  /** Seeded random, so the sample data is the same on every visit. */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

  window.KIT = { t, set, switcher, apply, onChange: (f) => listeners.push(f), get lang() { return lang; }, add: (d) => { for (const k in d) S[k] = [k].concat(d[k]); },
    num, date, dateShort, time, dateTime, locale, h, put, ltr, toast, modal, field, select, csv, table, hbars, columns, donut, rng };
  document.addEventListener("DOMContentLoaded", apply);
})();
