/* Sheet to Database: the app. One page, hash routes, all state in memory. */
(function () {
  "use strict";
  const K = KIT, { h, put, t, num } = K, S = S2D;
  let decisions = {}, extra = [], res = null, DB = null;
  const ui = { sheet: "customers", only: false, page: 0, dialect: "postgres", table: "orders" };

  function compute() {
    res = S.run(decisions);
    DB = { customers: res.tables.customers.slice(), products: res.tables.products.slice(), orders: res.tables.orders.slice(), order_lines: res.tables.order_lines.slice() };
    extra.forEach((x) => {
      const o = { id: Math.max(0, ...DB.orders.map((y) => y.id)) + 1, order_no: x.order_no, customer_id: x.customer_id, order_date: x.order_date, status: x.status, isNew: true };
      DB.orders.push(o);
      DB.order_lines.push({ id: Math.max(0, ...DB.order_lines.map((y) => y.id)) + 1, order_id: o.id, product_id: x.product_id, qty: x.qty, unit_price: x.unit_price, src: null });
    });
  }

  /* ---------- formatting ---------- */
  const money = (v) => (v == null ? "" : num(v, 2));
  const sar = (v) => h("span", { class: "num" }, money(v), h("span", { class: "muted" }, " SAR"));
  const code = (s) => h("code", {}, s);
  const chip = (label, cls) => h("span", { class: "chip " + (cls || "") }, t(label));
  const dateOf = (ts) => (ts == null || ts === "" ? "" : h("span", { class: "num" }, S.iso(ts)));
  const SHEET = { customers: "Customers", products: "Products", orders: "Orders 2026" };
  /** Translate the short texts the pipeline writes into its report. */
  function tx(s) {
    let m;
    if ((m = String(s).match(/^= row (\d+)$/))) return t("same as row {0}", m[1]);
    if ((m = String(s).match(/^(.+) \(from Orders\)$/))) return t("{0} (from the Orders sheet)", m[1]);
    if ((m = String(s).match(/^(.+) \(recalculated\)$/))) return t("{0} (recalculated)", m[1]);
    if ((m = String(s).match(/^keep ([\d.]+)$/))) return t("keep {0}", m[1]);
    return t(s);
  }
  const ST = { Paid: "pine", Unpaid: "amber", Cancelled: "grey" };
  const was = (v) => (v === "(empty)" ? h("span", { class: "was emp" }, t("(empty)")) : h("span", { class: "pre was" }, v));
  const bt = (s) => (/^[+\d.,\s]+$/.test(s) ? K.ltr(s) : s);

  /* ---------- icons ---------- */
  const I = {
    home: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    sheet: "M4 4h16v16H4zM4 9h16M4 14h16M9 4v16M15 4v16",
    broom: "M14 4l6 6M5 21l4-9 3 3-7 6zM9 12l5-5 3 3-5 5",
    hand: "M9 12l2 2 4-5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
    db: "M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6",
    table: "M4 5h16v14H4zM4 10h16M10 5v14",
    scale: "M12 4v16M6 20h12M5 8h14M5 8l-2.5 6h5zM19 8l-2.5 6h5z",
  };
  const icon = (d) => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, h("path", { d }));
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#e7a982"/><rect x="8" y="10" width="12" height="20" rx="2" fill="none" stroke="#21414a" stroke-width="2.4"/><path d="M8 17h12M8 23h12M14 10v20" stroke="#21414a" stroke-width="1.6"/><path d="M23 20h4" stroke="#21414a" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="31" cy="14" rx="4.5" ry="2.2" fill="#21414a"/><path d="M26.5 14v12c0 1.2 2 2.2 4.5 2.2s4.5-1 4.500-2.2V14" fill="none" stroke="#21414a" stroke-width="2.2"/></svg>';

  /* ---------- shell ---------- */
  const ROUTES = [
    ["overview", "Overview", I.home, null],
    ["sheets", "The workbook", I.sheet, "Before"], ["cleaning", "Cleaning report", I.broom, "Before"], ["decisions", "Your decisions", I.hand, "Before"],
    ["database", "Database design", I.db, "After"], ["data", "Clean data", I.table, "After"], ["checks", "Checks", I.scale, "After"],
  ];
  const side = h("aside", { class: "side" });
  const top = h("header", { class: "top" });
  const page = h("main", { class: "page", id: "page" });
  const demo = h("div", { class: "demo-bar" });
  document.body.append(h("div", { class: "shell" }, side, h("div", { class: "main" }, demo, top, page)));
  document.addEventListener("click", (e) => { if (document.body.classList.contains("nav-open") && !e.target.closest(".side,.menu-btn")) document.body.classList.remove("nav-open"); });
  const route = () => { const r = location.hash.replace(/^#\/?/, "").split("?")[0]; return ROUTES.some((x) => x[0] === r) ? r : "overview"; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function drawShell() {
    const cur = route();
    let group;
    const nav = h("nav", { "aria-label": t("Main menu") });
    ROUTES.forEach(([id, label, ic, grp]) => {
      if (grp !== group) { group = grp; if (grp) nav.append(h("h4", {}, t(grp))); }
      const n = id === "decisions" ? res.stats.pending : 0;
      nav.append(h("a", { href: "#/" + id, "aria-current": id === cur ? "page" : null, onclick: () => document.body.classList.remove("nav-open") }, icon(ic), h("span", {}, t(label)), n ? h("span", { class: "count" }, n) : null));
    });
    put(side,
      h("a", { class: "brand", href: "#/overview", html: LOGO + `<div><b>${esc(t("Sheet to Database"))}</b><small>${esc(t("Sample: a wholesale supplier"))}</small></div>` }),
      nav,
      h("div", { class: "foot" }, h("div", {}, t("Demo with sample data.")), h("div", {}, t("Built by"), " ", h("a", { href: "https://cictnardc.net", target: "_blank", rel: "noopener" }, "CICTNA RDC")),
        h("button", { class: "btn sm ghost", type: "button", style: "margin-top:10px;color:#dfe8e7;border-color:rgba(255,255,255,.2)", onclick: () => { location.hash = "#/overview"; location.reload(); } }, t("Reset demo"))));
    const r = ROUTES.find((x) => x[0] === cur);
    put(top,
      h("button", { class: "menu-btn", type: "button", "aria-label": t("Menu"), onclick: () => document.body.classList.toggle("nav-open") }, "☰"),
      h("div", {}, h("h1", {}, t(r[1])), h("div", { class: "crumb" }, K.ltr("orders-2026.xlsx"), " → ", t("4 related tables"))),
      h("div", { class: "grow" }),
      K.switcher());
    put(demo, t("Interactive demo with sample data: a real cleaning run on an untidy workbook. Decide the open questions and watch the numbers change. Nothing is saved."), " ", h("a", { href: "https://cictnardc.net/portfolio/", target: "_blank", rel: "noopener" }, t("More apps by CICTNA RDC")));
    document.title = t(r[1]) + " | " + t("Sheet to Database") + " · CICTNA RDC";
  }
  function render(keep) {
    drawShell();
    put(page, (PAGES[route()] || PAGES.overview)());
    if (!keep) window.scrollTo(0, 0);
  }
  const card = (title, body, extraEl, sub) => h("section", { class: "card" }, h("header", {}, h("h2", {}, title), h("div", { class: "grow" }), extraEl || null, sub ? h("p", {}, sub) : null), body);
  function kpi(label, value, small, cls, href) {
    const el = h(href ? "a" : "div", { class: "kpi " + (cls || ""), href: href || null, style: href ? "text-decoration:none;color:inherit" : null }, h("span", {}, t(label)), h("b", {}, value), h("small", {}, small));
    return el;
  }
  function decide(id, state) { if (state) decisions[id] = state; else delete decisions[id]; compute(); render(true); }

  /* ---------- pages ---------- */
  const PAGES = {};

  PAGES.overview = function () {
    const s = res.stats, T = DB;
    const kpis = h("div", { class: "kpis" },
      kpi("Rows read", num(s.read), t("from 3 sheets"), "", "#/sheets"),
      kpi("Cells corrected", num(s.fixed), t("automatically, each one logged"), "good", "#/cleaning"),
      kpi("Duplicates merged", num(s.merged + s.dupRows), t("clients, items and pasted rows"), "good", "#/cleaning"),
      kpi("Waiting for you", num(s.pending), s.pending ? t("{0} rows held back until you decide", s.held) : t("every question answered"), s.pending ? "warn" : "good", "#/decisions"),
      kpi("Records loaded", num(T.customers.length + T.products.length + T.orders.length + T.order_lines.length), t("in 4 related tables"), "", "#/data"));

    /* one client, typed several ways */
    const C = S.RAW[0];
    const groups = new Map();
    C.rows.forEach((r, i) => { const k = r[0].toLowerCase().replace(/\b(co|est)\b\.?/g, "").replace(/[^a-z0-9]+/g, ""); (groups.get(k) || groups.set(k, []).get(k)).push([i, r]); });
    const g = [...groups.values()].filter((x) => x.length > 1).sort((a, b) => b.length - a.length)[0];
    const cleanRow = T.customers.find((c) => c.name.toLowerCase().replace(/[^a-z0-9]+/g, "") === g[0][1][0].toLowerCase().replace(/\b(co|est)\b\.?/g, "").replace(/[^a-z0-9]+/g, ""));
    const before = h("table", { class: "mini-sheet" }, h("thead", {}, h("tr", {}, [t("Row"), "Client", "Phone", "City", "Client since"].map((c) => h("th", {}, c)))),
      h("tbody", {}, g.map(([i, r]) => h("tr", {}, h("td", { class: "rn" }, i + 2), h("td", {}, h("span", { class: "pre" }, r[0])), h("td", {}, K.ltr(r[2] || "")), h("td", {}, r[3]), h("td", {}, K.ltr(r[5]))))));
    const after = h("table", { class: "mini-sheet clean" }, h("thead", {}, h("tr", {}, ["id", "name", "phone", "city", "since"].map((c) => h("th", {}, c)))),
      h("tbody", {}, h("tr", {}, h("td", { class: "rn" }, cleanRow.id), h("td", {}, cleanRow.name), h("td", {}, K.ltr(cleanRow.phone)), h("td", {}, cleanRow.city), h("td", {}, cleanRow.since ? S.iso(cleanRow.since) : ""))));
    const example = card(t("One client, typed {0} ways", g.length), h("div", { class: "pad ba" },
      h("div", {}, h("p", { class: "mini" }, t("In the workbook")), h("div", { class: "scroll" }, before)),
      h("div", { class: "arrow", "aria-hidden": "true" }, "↓"),
      h("div", {}, h("p", { class: "mini" }, t("In the database")), h("div", { class: "scroll" }, after))),
      null, t("Different spelling, phone format, city name and date format. The pipeline recognises one client and keeps the best of each row."));

    const by = {}; res.issues.forEach((x) => (by[x.rule] = (by[x.rule] || 0) + 1));
    const isAsk = (rule) => res.reviews.some((x) => x.rule === rule);
    const sorted = Object.entries(by).sort((a, b) => b[1] - a[1]);
    const topRules = sorted.filter(([r]) => !isAsk(r)).slice(0, 6).concat(sorted.filter(([r]) => isAsk(r)).slice(0, 3)).map(([rule, n]) => ({ label: t(rule), value: n, cls: isAsk(rule) ? "dawn" : "" }));
    const pend = res.reviews.filter((r) => r.state === "pending");
    const open = card(t("Waiting for your decision"), pend.length ? h("ul", { class: "list" }, pend.slice(0, 5).map((r) => h("li", {}, h("span", { class: "dot dawn" }), h("div", { class: "what" }, t(r.rule), h("small", {}, t(SHEET[r.sheet]) + ", " + t("row {0}", r.row) + ": ", K.ltr(r.before))), h("a", { class: "btn sm", href: "#/decisions" }, t("Decide"))))) : h("div", { class: "pad muted" }, t("Nothing is waiting. Every row of the workbook is in the database or accounted for.")),
      pend.length > 5 ? h("a", { class: "btn ghost sm", href: "#/decisions" }, t("All {0}", pend.length)) : null, t("The pipeline never guesses on money or missing records. It asks."));
    const steps = card(t("How a migration runs"), h("ol", { class: "steps" }, [
      ["Read every sheet as it is", "Nothing is edited in your file. The workbook stays your backup."],
      ["Clean with written rules", "Dates, phones, prices, units and names go to one format. Each change is logged with the old and new value."],
      ["Merge duplicates", "The same client or item typed twice becomes one record, and its orders follow it."],
      ["Ask about what is unclear", "Wrong totals, unknown clients and missing prices wait for your answer."],
      ["Load and prove", "Related tables with keys and constraints, then row counts and totals compared with the workbook."],
    ].map(([a, b]) => h("li", {}, h("b", {}, t(a)), h("span", {}, t(b))))));
    return [h("p", { class: "lede" }, t("A small company kept clients, items and a year of orders in one workbook. This is that workbook going into a real database: cleaned by rules, checked against the source, with the doubtful cases left for a person to decide.")), kpis,
      h("div", { class: "grid g32" }, example, open),
      h("div", { class: "grid g32" }, card(t("What was wrong in the workbook"), h("div", { class: "pad" }, K.hbars(topRules)), h("a", { class: "btn ghost sm", href: "#/cleaning" }, t("Full report")), t("Number of cells or rows per rule. Orange bars are the ones that need a decision.")), steps)];
  };

  PAGES.sheets = function () {
    const sh = S.RAW.find((x) => x.id === ui.sheet);
    const map = new Map(); res.issues.filter((x) => x.sheet === sh.id).forEach((x) => { const k = x.row + "|" + x.col; if (!map.has(k) || x.action !== "fixed") map.set(k, x); });
    const dupRows = new Set(res.issues.filter((x) => x.sheet === sh.id && (x.rule === "Duplicate merged" || x.rule === "Row entered twice")).map((x) => x.row));
    const rowHas = new Set([...map.keys()].map((k) => +k.split("|")[0]));
    let rows = sh.rows.map((r, i) => [i + 2, r]);
    if (ui.only) rows = rows.filter(([n]) => rowHas.has(n));
    const size = 28, pages = Math.max(1, Math.ceil(rows.length / size)); if (ui.page >= pages) ui.page = pages - 1;
    const view = rows.slice(ui.page * size, ui.page * size + size);
    const letters = "ABCDEFGH";
    const grid = h("table", { class: "sheet" },
      h("thead", {}, h("tr", {}, h("th", { class: "corner" }), sh.cols.map((c, i) => h("th", {}, letters[i]))), h("tr", { class: "hdr" }, h("th", { class: "rn" }, "1"), sh.cols.map((c) => h("td", {}, c)))),
      h("tbody", {}, view.map(([n, r]) => h("tr", { class: dupRows.has(n) ? "dup" : "" }, h("th", { class: "rn" }, n), r.map((v, c) => {
        const x = map.get(n + "|" + c);
        const cls = !x ? "" : x.action === "fixed" ? "fx" : x.action === "review" ? "rv" : "ok";
        return h("td", { class: cls, title: x ? t(x.rule) + (x.after ? " → " + tx(x.after) : "") : null }, h("span", { class: "pre" }, v));
      })))));
    const tabs = h("div", { class: "seg", role: "group" }, S.RAW.map((x) => h("button", { type: "button", "aria-pressed": String(x.id === ui.sheet), onclick: () => { ui.sheet = x.id; ui.page = 0; render(true); } }, t(SHEET[x.id]), " ", h("span", { class: "muted num" }, x.rows.length))));
    const legend = h("div", { class: "legend-row" }, h("span", {}, h("i", { class: "sw fx" }), t("corrected automatically")), h("span", {}, h("i", { class: "sw rv" }), t("needs your decision")), h("span", {}, h("i", { class: "sw ok" }), t("decided")), h("span", {}, h("i", { class: "sw dupl" }), t("duplicate row")));
    const foot = h("div", { class: "tfoot" }, h("span", { class: "muted" }, t("{0} rows", num(rows.length))), h("div", { class: "grow" }),
      h("button", { class: "btn ghost sm", type: "button", disabled: ui.page === 0 ? true : null, onclick: () => { ui.page--; render(true); } }, t("Previous")), h("span", { class: "muted num" }, (ui.page + 1) + " / " + pages),
      h("button", { class: "btn ghost sm", type: "button", disabled: ui.page >= pages - 1 ? true : null, onclick: () => { ui.page++; render(true); } }, t("Next")));
    return [h("p", { class: "lede" }, t("The workbook exactly as it was typed over the years. Hover a coloured cell to see what the pipeline did with it.")),
      card(K.ltr("orders-2026.xlsx"), [h("div", { class: "tools" }, tabs, h("div", { class: "grow" }), h("label", { class: "only" }, h("input", { type: "checkbox", checked: ui.only ? true : null, onchange: (e) => { ui.only = e.target.checked; ui.page = 0; render(true); } }), " ", t("Only rows with something to fix"))), h("div", { class: "scroll" }, grid), foot], null, legend)];
  };

  PAGES.cleaning = function () {
    const rules = [...new Set(res.issues.map((x) => x.rule))];
    const tbl = K.table({ id: "cleaning", csvName: "cleaning-report", pageSize: 20, rows: () => res.issues, sortBy: null,
      search: (x) => x.rule + " " + x.before + " " + x.after + " " + x.row,
      filters: [
        { label: "All sheets", options: () => Object.entries(SHEET), test: (x, v) => x.sheet === v },
        { label: "All rules", options: () => rules.map((r) => [r, r]), test: (x, v) => x.rule === v },
        { label: "All outcomes", options: () => [["fixed", "Corrected"], ["review", "Needs a decision"], ["decided", "Decided"]], test: (x, v) => x.action === v },
      ],
      cols: [
        { key: "sheet", label: "Sheet", render: (x) => t(SHEET[x.sheet]), csv: (x) => SHEET[x.sheet] },
        { key: "row", label: "Row", num: true, render: (x) => h("span", { class: "num" }, x.row) },
        { key: "col", label: "Column", render: (x) => S.RAW.find((s) => s.id === x.sheet).cols[x.col], csv: (x) => S.RAW.find((s) => s.id === x.sheet).cols[x.col] },
        { key: "rule", label: "Rule", render: (x) => t(x.rule), csv: (x) => x.rule },
        { key: "before", label: "In the sheet", render: (x) => was(x.before) },
        { key: "after", label: "In the database", render: (x) => (x.after ? h("span", { class: "now" }, bt(tx(x.after))) : h("span", { class: "muted" }, "…")) },
        { key: "action", label: "Outcome", render: (x) => chip(x.action === "fixed" ? "Corrected" : x.action === "review" ? "Needs a decision" : "Decided", x.action === "fixed" ? "pine" : x.action === "review" ? "dawn" : "") },
      ] });
    const by = {}; res.issues.forEach((x) => (by[x.sheet] = (by[x.sheet] || 0) + 1));
    return [h("p", { class: "lede" }, t("Every change the pipeline made, one line per cell: where it was, which rule applied, the old value and the new one. This report is delivered with the database, so anyone can trace a record back to the sheet.")),
      h("div", { class: "kpis" }, Object.entries(SHEET).map(([id, name]) => kpi(name, num(by[id] || 0), t("changes logged"))), kpi("Rules applied", num(rules.length), t("each one written down"))),
      card(t("Cleaning report"), tbl.el)];
  };

  PAGES.decisions = function () {
    const pend = res.reviews.filter((r) => r.state === "pending");
    const item = (r) => h("li", { class: "dec " + r.state }, h("div", { class: "what" },
        h("div", { class: "dhead" }, chip(SHEET[r.sheet], "grey"), h("span", { class: "muted" }, t("row {0}", r.row)), h("b", {}, t(r.rule)), r.ctx ? h("span", { class: "muted ctx" }, K.ltr(r.ctx)) : null),
        h("div", { class: "dbody" }, h("span", { class: "muted" }, t("In the sheet") + ": "), was(r.before))),
      r.state === "pending"
        ? h("div", { class: "dbtn" }, h("button", { class: "btn sm primary", type: "button", onclick: () => decide(r.id, "accept") }, bt(tx(r.suggestion))), r.alt !== r.suggestion ? h("button", { class: "btn sm", type: "button", onclick: () => decide(r.id, "reject") }, bt(tx(r.alt))) : null)
        : h("div", { class: "dbtn" }, chip(r.state === "accept" ? "Decided" : "Decided", "pine"), h("span", { class: "now" }, bt(tx(r.state === "accept" ? r.suggestion : r.alt))), h("button", { class: "btn sm ghost", type: "button", onclick: () => decide(r.id, null) }, t("Undo"))));
    const all = h("button", { class: "btn primary sm", type: "button", disabled: pend.length ? null : true, onclick: () => { res.reviews.forEach((r) => { if (r.state === "pending") decisions[r.id] = "accept"; }); compute(); render(true); K.toast(t("All suggestions accepted"), "good"); } }, t("Accept all suggestions"));
    return [h("p", { class: "lede" }, t("The cases a rule cannot settle safely. Each one shows what the sheet says and what the pipeline suggests. Rows that depend on an open question stay out of the database until you answer, then load at once.")),
      h("div", { class: "kpis" }, kpi("Open questions", num(pend.length), t("of {0} found", res.reviews.length), pend.length ? "warn" : "good"), kpi("Rows held back", num(res.stats.held), t("order rows waiting on an answer"), res.stats.held ? "warn" : "good"), kpi("Order lines loaded", num(DB.order_lines.length), t("of {0} rows in the sheet", S.RAW[2].rows.length)), kpi("Database total", money(res.total), "SAR")),
      card(t("Your decisions"), h("ul", { class: "list decs" }, res.reviews.slice().sort((a, b) => (a.state === "pending" ? 0 : 1) - (b.state === "pending" ? 0 : 1)).map(item)), all)];
  };

  PAGES.database = function () {
    const W = 880, H = 232, bw = 190, rh = 22, pos = { customers: [10, 14], orders: [240, 44], order_lines: [470, 14], products: [680, 54] };
    const svg = h("svg", { viewBox: `0 0 ${W} ${H}`, class: "erd", role: "img", "aria-label": t("Database design") });
    const yOf = (tn, col) => pos[tn][1] + 30 + S.SCHEMA.find((x) => x.name === tn).cols.findIndex((c) => c[0] === col) * rh + rh / 2;
    [["orders", "customer_id", "customers"], ["order_lines", "order_id", "orders"], ["order_lines", "product_id", "products"]].forEach(([a, col, b]) => {
      const right = pos[b][0] > pos[a][0];
      const x1 = right ? pos[a][0] + bw : pos[a][0], x2 = right ? pos[b][0] : pos[b][0] + bw, y1 = yOf(a, col), y2 = yOf(b, "id"), mx = (x1 + x2) / 2;
      svg.append(h("path", { d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, class: "rel" }), h("circle", { cx: x2, cy: y2, r: 4, class: "one" }), h("path", { d: `M${x1} ${y1 - 6} L${x1 + (right ? 9 : -9)} ${y1} L${x1} ${y1 + 6}`, class: "many" }));
    });
    S.SCHEMA.forEach((tb) => {
      const [x, y] = pos[tb.name], g = h("g", {});
      g.append(h("rect", { x, y, width: bw, height: 30 + tb.cols.length * rh + 6, rx: 9, class: "tbox" }), h("rect", { x, y, width: bw, height: 30, rx: 9, class: "thead" }), h("rect", { x, y: y + 20, width: bw, height: 10, class: "thead" }),
        h("text", { x: x + 12, y: y + 20, class: "tname" }, tb.name), h("text", { x: x + bw - 12, y: y + 20, class: "tcount", "text-anchor": "end" }, num(DB[tb.name].length)));
      tb.cols.forEach(([n, ty, f], i) => { const yy = y + 30 + i * rh + 15; f = f || ""; g.append(h("text", { x: x + 12, y: yy, class: "cname" + (f.includes("pk") ? " pk" : "") }, n), h("text", { x: x + bw - 12, y: yy, class: "ctype", "text-anchor": "end" }, (f.includes("pk") ? "PK " : f.includes("fk") ? "FK " : "") + ty)); });
      svg.append(g);
    });
    const seg = h("div", { class: "seg", role: "group" }, [["postgres", "PostgreSQL"], ["sqlserver", "SQL Server"], ["mysql", "MySQL"]].map(([id, l]) => h("button", { type: "button", "aria-pressed": String(id === ui.dialect), onclick: () => { ui.dialect = id; render(true); } }, l)));
    const sqlText = S.sql(ui.dialect);
    const copy = h("button", { class: "btn ghost sm", type: "button", onclick: () => { (navigator.clipboard ? navigator.clipboard.writeText(sqlText) : Promise.reject()).then(() => K.toast(t("Copied"), "good"), () => K.toast(t("Select the text and copy it"))); } }, t("Copy"));
    const rules = [["One record per client and per item", "Unique names and codes: a second “Al Noor Trading” cannot be created by mistake."], ["Orders always belong to a client", "A foreign key refuses an order for a client that does not exist."], ["Lines always point to a real item", "No more free-text item names. The code is the link."], ["Totals are calculated, not typed", "The line total is quantity × price, so it can never disagree."], ["Types that mean something", "Dates are dates and prices are numbers, ready for reports and filters."]];
    return [h("p", { class: "lede" }, t("One flat Orders sheet repeated the client and item on every row. In the database each thing is stored once and linked by keys, which is what stops the old mistakes from coming back.")),
      card(t("Tables and links"), h("div", { class: "pad erd-wrap" }, svg), null, t("The number in each header is the record count right now. It moves when you answer an open question.")),
      h("div", { class: "grid g32" }, card(t("Create script"), h("pre", { class: "json sql" }, sqlText), [seg, copy]), card(t("What the database now guarantees"), h("ul", { class: "list" }, rules.map(([a, b]) => h("li", {}, h("span", { class: "dot pine" }), h("div", { class: "what" }, t(a), h("small", {}, t(b))))))))];
  };

  PAGES.data = function () {
    const cust = new Map(DB.customers.map((c) => [c.id, c])), prod = new Map(DB.products.map((p) => [p.id, p])), ord = new Map(DB.orders.map((o) => [o.id, o]));
    const linesOf = (id) => DB.order_lines.filter((l) => l.order_id === id);
    const totalOf = (id) => linesOf(id).reduce((s, l) => s + l.qty * l.unit_price, 0);
    const defs = {
      orders: { rows: () => DB.orders, rowKey: (o) => o.id, search: (o) => o.order_no + " " + cust.get(o.customer_id).name + " " + o.status, rowClass: (o) => (o.isNew ? "sel" : ""),
        filters: [{ label: "All statuses", options: () => ["Paid", "Unpaid", "Cancelled"].map((s) => [s, s]), test: (o, v) => o.status === v }],
        cols: [{ key: "order_no", label: "Order", render: (o) => code(o.order_no) }, { key: "customer", label: "Client", sort: (o) => cust.get(o.customer_id).name, text: (o) => cust.get(o.customer_id).name }, { key: "order_date", label: "Date", render: (o) => dateOf(o.order_date), csv: (o) => (o.order_date ? S.iso(o.order_date) : "") }, { key: "status", label: "Status", render: (o) => chip(o.status, ST[o.status]), csv: (o) => o.status }, { key: "lines", label: "Lines", num: true, sort: (o) => linesOf(o.id).length, text: (o) => linesOf(o.id).length }, { key: "total", label: "Total", num: true, sort: (o) => totalOf(o.id), render: (o) => sar(totalOf(o.id)), csv: (o) => totalOf(o.id).toFixed(2) }],
        actions: (o) => h("button", { class: "btn sm ghost", type: "button", onclick: () => showOrder(o) }, t("Open")) },
      order_lines: { rows: () => DB.order_lines, rowKey: (l) => l.id, search: (l) => ord.get(l.order_id).order_no + " " + prod.get(l.product_id).code + " " + prod.get(l.product_id).name,
        cols: [{ key: "order", label: "Order", sort: (l) => ord.get(l.order_id).order_no, render: (l) => code(ord.get(l.order_id).order_no), csv: (l) => ord.get(l.order_id).order_no }, { key: "code", label: "Code", sort: (l) => prod.get(l.product_id).code, render: (l) => code(prod.get(l.product_id).code), csv: (l) => prod.get(l.product_id).code }, { key: "item", label: "Item", sort: (l) => prod.get(l.product_id).name, text: (l) => prod.get(l.product_id).name }, { key: "qty", label: "Qty", num: true, render: (l) => h("span", { class: "num" }, num(l.qty)) }, { key: "unit_price", label: "Price", num: true, render: (l) => h("span", { class: "num" }, money(l.unit_price)) }, { key: "total", label: "Total", num: true, sort: (l) => l.qty * l.unit_price, render: (l) => sar(l.qty * l.unit_price), csv: (l) => (l.qty * l.unit_price).toFixed(2) }, { key: "src", label: "Sheet row", num: true, render: (l) => (l.src ? h("span", { class: "num muted" }, l.src) : chip("New", "pine")) }] },
      customers: { rows: () => DB.customers, rowKey: (c) => c.id, search: (c) => c.name + " " + c.contact + " " + c.city + " " + c.phone,
        filters: [{ label: "All cities", options: () => [...new Set(DB.customers.map((c) => c.city).filter(Boolean))].sort().map((c) => [c, c]), test: (c, v) => c.city === v }],
        cols: [{ key: "id", label: "id", num: true, render: (c) => h("span", { class: "num muted" }, c.id) }, { key: "name", label: "Client" }, { key: "contact", label: "Contact" }, { key: "phone", label: "Phone", render: (c) => K.ltr(c.phone) }, { key: "city", label: "City" }, { key: "email", label: "Email", render: (c) => K.ltr(c.email) }, { key: "since", label: "Client since", render: (c) => dateOf(c.since), csv: (c) => (c.since ? S.iso(c.since) : "") }, { key: "src", label: "Sheet rows", num: true, render: (c) => (c.src > 1 ? chip(t("{0} merged", c.src), "") : c.src ? h("span", { class: "num muted" }, 1) : chip("Added", "pine")), csv: (c) => c.src }] },
      products: { rows: () => DB.products, rowKey: (p) => p.id, search: (p) => p.code + " " + p.name,
        cols: [{ key: "code", label: "Code", render: (p) => code(p.code) }, { key: "name", label: "Item" }, { key: "unit", label: "Unit" }, { key: "price", label: "Price", num: true, render: (p) => (p.price == null ? chip("No price yet", "dawn") : sar(p.price)), csv: (p) => (p.price == null ? "" : p.price.toFixed(2)) }, { key: "sold", label: "Qty sold", num: true, sort: (p) => DB.order_lines.filter((l) => l.product_id === p.id).reduce((s, l) => s + l.qty, 0), text: (p) => num(DB.order_lines.filter((l) => l.product_id === p.id).reduce((s, l) => s + l.qty, 0)) }] },
    };
    function showOrder(o) {
      const c = cust.get(o.customer_id);
      K.modal(o.order_no, [h("dl", { class: "kv" }, h("dt", {}, t("Client")), h("dd", {}, c.name + (c.city ? ", " + c.city : "")), h("dt", {}, t("Date")), h("dd", {}, dateOf(o.order_date) || "…"), h("dt", {}, t("Status")), h("dd", {}, chip(o.status, ST[o.status]))),
        h("table", { class: "tbl", style: "margin-top:12px" }, h("thead", {}, h("tr", {}, [t("Code"), t("Item"), t("Qty"), t("Price"), t("Total")].map((x, i) => h("th", { class: i > 1 ? "n" : "" }, x)))), h("tbody", {}, linesOf(o.id).map((l) => { const p = prod.get(l.product_id); return h("tr", {}, h("td", {}, code(p.code)), h("td", {}, p.name), h("td", { class: "n" }, num(l.qty)), h("td", { class: "n" }, money(l.unit_price)), h("td", { class: "n" }, sar(l.qty * l.unit_price))); }), h("tr", {}, h("td", { colspan: "4", class: "n" }, h("b", {}, t("Total"))), h("td", { class: "n" }, h("b", {}, sar(totalOf(o.id)))))))], null, true);
    }
    function newOrder() {
      const cs = K.select(DB.customers.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => [c.id, c.name])), ps = K.select(DB.products.filter((p) => p.price != null).map((p) => [p.id, p.code + "  " + p.name]));
      const q = h("input", { type: "number", min: "1", step: "1", value: "10", inputmode: "numeric" }), st = K.select([["Unpaid", t("Unpaid")], ["Paid", t("Paid")]]);
      const line = h("p", { class: "muted", style: "margin:0" });
      const upd = () => { const p = prod.get(+ps.value), n = +q.value; put(line, n > 0 && Number.isInteger(n) ? [t("Line total") + ": ", sar(n * p.price), " (", money(p.price), " / ", p.unit, ")"] : t("Quantity must be a whole number above zero")); };
      ps.onchange = upd; q.oninput = upd; upd();
      K.modal(t("New order"), h("div", { class: "form" }, h("div", { class: "full" }, K.field(t("Client"), cs)), h("div", { class: "full" }, K.field(t("Item"), ps)), K.field(t("Qty"), q), K.field(t("Status"), st), h("div", { class: "full" }, line)), [[t("Cancel"), null, "ghost"], [t("Save order"), () => {
        const n = +q.value, p = prod.get(+ps.value);
        if (!(n > 0 && Number.isInteger(n))) { K.toast(t("Quantity must be a whole number above zero"), "bad"); return false; }
        const no = "SO-" + (Math.max(...DB.orders.map((o) => +o.order_no.replace(/\D/g, "") || 0)) + 1);
        extra.push({ order_no: no, customer_id: +cs.value, product_id: p.id, qty: n, unit_price: p.price, status: st.value, order_date: Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) });
        compute(); ui.table = "orders"; ui.justAdded = no; render(true); K.toast(t("{0} saved", no), "good");
      }, "primary"]]);
    }
    const d = defs[ui.table];
    const tbl = K.table(Object.assign({ id: ui.table, csvName: ui.table, pageSize: 15 }, d));
    if (ui.justAdded) { tbl.setSearch(ui.justAdded); ui.justAdded = null; }
    const seg = h("div", { class: "seg", role: "group" }, S.SCHEMA.map((x) => h("button", { type: "button", "aria-pressed": String(x.name === ui.table), onclick: () => { ui.table = x.name; render(true); } }, K.ltr(x.name), " ", h("span", { class: "muted num" }, num(DB[x.name].length)))));
    return [h("p", { class: "lede" }, t("The same data after loading: searchable, sortable, exportable, and safe to work on by several people at once. The New order form shows the kind of simple entry screen that replaces typing into the sheet.")),
      card(t("Clean data"), tbl.el, [seg, h("button", { class: "btn primary sm", type: "button", onclick: newOrder }, "+ " + t("New order"))])];
  };

  PAGES.checks = function () {
    const rows = res.checks.map((c) => { const exp = c.source - c.merged - c.held + c.added; return Object.assign({ ok: exp === c.loaded }, c); });
    const tb = h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, [t("What"), t("Rows in the sheet"), t("Duplicates merged"), t("Held back"), t("Added by your decisions"), t("In the database"), ""].map((x, i) => h("th", { class: i ? "n" : "" }, x)))),
      h("tbody", {}, rows.map((c) => h("tr", {}, h("td", {}, t(c.what)), h("td", { class: "n" }, num(c.source)), h("td", { class: "n" }, c.merged ? "− " + num(c.merged) : "0"), h("td", { class: "n" }, c.held ? "− " + num(c.held) : "0"), h("td", { class: "n" }, c.added ? "+ " + num(c.added) : "0"), h("td", { class: "n" }, h("b", {}, num(c.loaded))), h("td", { class: "n" }, chip(c.ok ? "Balanced" : "Check", c.ok ? "pine" : "red"))))));
    const netSrc = res.srcTotal - res.dupTotal - res.heldTotal, corr = Math.round((res.total - netSrc) * 100) / 100;
    const line = (label, v, cls, sign) => h("li", {}, h("div", { class: "what" }, t(label)), h("span", { class: "num " + (cls || "") }, (sign || "") + money(Math.abs(v))));
    const moneyCard = card(t("Order value, sheet against database"), h("ul", { class: "list sum" },
      line("Sum of the Total column in the sheet", res.srcTotal),
      line("Rows entered twice, removed", res.dupTotal, "muted", "− "),
      line("Rows held back, waiting for a decision", res.heldTotal, res.heldTotal ? "warnv" : "muted", "− "),
      line("Totals you chose to recalculate", corr, "muted", corr < 0 ? "− " : "+ "),
      h("li", { class: "tot" }, h("div", { class: "what" }, h("b", {}, t("Order value in the database"))), h("b", { class: "num" }, money(res.total) + " SAR"))),
      chip("Balanced", "pine"), t("Every riyal of difference between the sheet and the database is explained by one of these lines."));
    const added = extra.length ? h("p", { class: "muted", style: "margin:0" }, t("Orders entered in this demo after the load are not part of these checks: {0}", extra.length)) : null;
    return [h("p", { class: "lede" }, t("A migration is only finished when the numbers agree. These checks are run at the end of every load and delivered as a signed-off sheet.")),
      card(t("Row counts"), h("div", { class: "scroll" }, tb), null, t("Rows in the sheet, minus duplicates, minus rows waiting for you, plus records you asked to add, must equal what is in the database.")),
      h("div", { class: "grid g2" }, moneyCard, card(t("Also delivered"), h("ul", { class: "list" }, [["The cleaning report", "Every changed cell with its old and new value, as a spreadsheet."], ["The create script", "Tables, keys and indexes for PostgreSQL, SQL Server or MySQL."], ["A repeatable load", "The same rules can run again on next month's file."], ["A short guide", "How the tables relate and how to add records."]].map(([a, b]) => h("li", {}, h("span", { class: "dot" }), h("div", { class: "what" }, t(a), h("small", {}, t(b)))))))), added];
  };

  compute();
  window.addEventListener("hashchange", () => render());
  K.onChange(() => render(true));
  render();
})();
