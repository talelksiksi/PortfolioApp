/* Plant Spare Parts Store: the app. One page, hash routes, all state in memory. */
(function () {
  "use strict";
  const K = KIT, { h, put, t, num } = K, D = SPS_DATA, DAY = D.DAY;
  const PART = new Map(D.PARTS.map((p) => [p.no, p]));
  const SUP = new Map(D.SUPPLIERS.map((s) => [s.code, s]));
  const UNIT = new Map(D.UNITS.map((u) => [u.code, u]));
  const STORE = new Map(D.STORES.map((s) => [s.id, s]));
  const ME = D.USERS.store;
  let NEXT_STOCK = 5000, NEXT_MOVE = 90000;

  /* ---------- formatting ---------- */
  const money = (v, d) => Number(v).toLocaleString(K.locale(), { style: "currency", currency: "USD", minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const dec = (u) => (UNIT.get(u) || { dec: 0 }).dec;
  const qty = (q, u) => num(q, Number.isInteger(q) ? 0 : dec(u));
  const qu = (q, u) => h("span", { class: "num" }, qty(q, u), h("span", { class: "muted" }, " " + u));
  const code = (s) => h("code", {}, s);
  const days = (ts) => Math.round((ts - Date.now()) / DAY);
  const chip = (label, cls) => h("span", { class: "chip " + (cls || "") }, t(label));

  /* ---------- stock logic ---------- */
  const rows = (no) => D.STOCK.filter((s) => s.part === no);
  const fefo = (no) => rows(no).filter((s) => s.status === "ok").sort((a, b) => (a.exp || 9e15) - (b.exp || 9e15) || a.recv - b.recv);
  const onHand = (no) => rows(no).reduce((s, r) => s + r.qty, 0);
  const avail = (no) => rows(no).filter((r) => r.status === "ok").reduce((s, r) => s + r.qty - r.reserved, 0);
  const openPO = (p) => p.status === "Sent" || p.status === "Part received";
  const onOrder = (no) => D.POS.filter(openPO).reduce((s, p) => s + p.lines.filter((l) => l.part === no).reduce((a, l) => a + l.qty - l.received, 0), 0);
  const onDraft = (no) => D.POS.some((p) => p.status === "Draft" && p.lines.some((l) => l.part === no));
  function partStatus(p) {
    const a = avail(p.no), o = onOrder(p.no);
    if (a <= 0 && o <= 0) return ["Out of stock", "red"];
    if (a + o <= p.rop) return ["Reorder", "dawn"];
    if (a <= p.rop) return ["On order", ""];
    return ["OK", "pine"];
  }
  const openReq = (r) => r.status === "Requested" || r.status === "Picking" || r.status === "Part issued";

  /** Reserve stock for every open request line, first expiry first out. */
  function reserveAll() {
    D.STOCK.forEach((s) => (s.reserved = 0));
    D.REQS.filter(openReq).sort((a, b) => (a.priority ? -1 : 0) - (b.priority ? -1 : 0) || a.created - b.created).forEach((r) => r.lines.forEach((l) => {
      let need = l.qty - l.issued;
      fefo(l.part).forEach((s) => { const take = Math.min(need, s.qty - s.reserved); if (take > 0) { s.reserved += take; need -= take; } });
      l.short = need;
    }));
  }
  /** Which bin and lot each line of a request would come from. */
  function pickPlan(r) {
    const out = [];
    r.lines.forEach((l) => {
      let need = l.qty - l.issued;
      fefo(l.part).forEach((s) => { if (need <= 0) return; const take = Math.min(need, s.qty); if (take > 0) { out.push({ part: l.part, bin: s.bin, lot: s.lot, exp: s.exp, qty: take, row: s }); need -= take; } });
      if (need > 0) out.push({ part: l.part, bin: "", lot: "", qty: need, short: true });
    });
    return out;
  }
  function audit(entity, ref, action, detail) { D.AUDIT.unshift({ ts: Date.now(), who: ME, entity, ref, action, detail: detail || "" }); }
  function move(type, part, q, bin, lot, ref, note) { D.MOVES.push({ id: NEXT_MOVE++, ts: Date.now(), type, part, qty: q, bin, lot, ref, who: ME, note: note || "" }); }

  function issueRequest(r) {
    let any = 0;
    pickPlan(r).filter((x) => !x.short).forEach((x) => {
      const s = x.row;
      s.qty -= x.qty; any += x.qty;
      const l = r.lines.find((y) => y.part === x.part); l.issued += x.qty;
      move("Issue", x.part, -x.qty, x.bin, x.lot, r.wo, r.asset);
      if (s.qty <= 0) D.STOCK.splice(D.STOCK.indexOf(s), 1);
    });
    if (!any) { K.toast(t("Nothing in stock to issue yet"), "bad"); return; }
    r.status = r.lines.every((l) => l.issued >= l.qty) ? "Issued" : "Part issued";
    audit("Issue request", r.id, r.status === "Issued" ? "Issued" : "Part issued", `${r.wo}, ${r.tech}`);
    reserveAll();
    K.toast(t("{0} issued to {1}", r.id, r.wo), "good");
  }

  /* ---------- icons ---------- */
  const I = {
    home: "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    box: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9",
    swap: "M4 8h13l-3-3M20 16H7l3 3",
    coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9.5c0-1.2 1.3-2 3-2s3 .8 3 2-1.3 1.6-3 2-3 .8-3 2 1.3 2 3 2 3-.8 3-2M12 6v1.5M12 16.5V18",
    cart: "M3 4h2l2.4 11h10.2L20 7H6.2M9 20h.01M17 20h.01",
    wrench: "M14.5 5.5a4 4 0 0 0 5 5L12 18a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2zM6 21l-3-3",
    tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
    truck: "M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18a1.5 1.5 0 1 0 0-.01M17 18a1.5 1.5 0 1 0 0-.01",
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    ruler: "M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2",
    log: "M6 3h9l4 4v14H6zM9 10h7M9 14h7M9 18h4",
  };
  const icon = (d) => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, h("path", { d }));
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#e7a982"/><path d="M20 9.5 29 14v12l-9 4.5L11 26V14z" fill="#21414a"/><path d="M11 14l9 4.5 9-4.5M20 18.5v12" stroke="#f1c09b" stroke-width="2" fill="none"/><circle cx="20" cy="18.5" r="2.4" fill="#f1c09b"/></svg>';

  /* ---------- shell ---------- */
  const ROUTES = [
    ["overview", "Overview", I.home, null],
    ["stock", "Current stock", I.box, "Stock"], ["movements", "Stock movements", I.swap, "Stock"], ["value", "Stock value", I.coin, "Stock"],
    ["issues", "Issue requests", I.wrench, "Work orders"], ["purchase-orders", "Purchase orders", I.cart, "Work orders"],
    ["parts", "Parts", I.tag, "Master data"], ["suppliers", "Suppliers", I.truck, "Master data"], ["bins", "Bins", I.grid, "Master data"], ["units", "Units of measure", I.ruler, "Master data"],
    ["audit", "Audit log", I.log, "Admin"],
  ];
  const side = h("aside", { class: "side" });
  const top = h("header", { class: "top" });
  const page = h("main", { class: "page", id: "page" });
  const demo = h("div", { class: "demo-bar" });
  document.body.append(h("div", { class: "shell" }, side, h("div", { class: "main" }, demo, top, page)));
  document.addEventListener("click", (e) => { if (document.body.classList.contains("nav-open") && !e.target.closest(".side,.menu-btn")) document.body.classList.remove("nav-open"); });

  const route = () => { const r = location.hash.replace(/^#\/?/, "").split("?")[0]; return ROUTES.some((x) => x[0] === r) ? r : "overview"; };
  const param = (k) => { const m = location.hash.match(new RegExp("[?&]" + k + "=([^&]+)")); return m ? decodeURIComponent(m[1]) : ""; };

  function drawShell() {
    const cur = route();
    let group = undefined;
    const nav = h("nav", { "aria-label": t("Main menu") });
    ROUTES.forEach(([id, label, ic, grp]) => {
      if (grp !== group) { group = grp; if (grp) nav.append(h("h4", {}, t(grp))); }
      const n = id === "issues" ? D.REQS.filter(openReq).length : 0;
      nav.append(h("a", { href: "#/" + id, "aria-current": id === cur ? "page" : null, onclick: () => document.body.classList.remove("nav-open") }, icon(ic), h("span", {}, t(label)), n ? h("span", { class: "count" }, n) : null));
    });
    put(side,
      h("a", { class: "brand", href: "#/overview", html: LOGO + `<div><b>${esc(t("Plant Spare Parts Store"))}</b><small>${esc(D.SITE.plant)}</small></div>` }),
      nav,
      h("div", { class: "foot" }, h("div", {}, t("Demo with sample data.")), h("div", {}, t("Built by"), " ", h("a", { href: "https://cictnardc.net", target: "_blank", rel: "noopener" }, "CICTNA RDC")),
        h("button", { class: "btn sm ghost", type: "button", style: "margin-top:10px;color:#dfe8e7;border-color:rgba(255,255,255,.2)", onclick: () => { location.hash = "#/overview"; location.reload(); } }, t("Reset demo"))));
    const r = ROUTES.find((x) => x[0] === cur);
    put(top,
      h("button", { class: "menu-btn", type: "button", "aria-label": t("Menu"), onclick: () => document.body.classList.toggle("nav-open") }, "☰"),
      h("div", {}, h("h1", {}, t(r[1])), h("div", { class: "crumb" }, D.SITE.plant + " · " + t(D.SITE.store))),
      h("div", { class: "grow" }),
      h("div", { class: "who" }, h("span", { class: "av" }, "RH"), h("span", { class: "nm" }, ME + " · " + t("Storekeeper"))),
      K.switcher());
    put(demo, t("Interactive demo with sample data: issue parts, receive orders, move stock. Nothing is saved."), " ", h("a", { href: "https://cictnardc.net/portfolio/", target: "_blank", rel: "noopener" }, t("More apps by CICTNA RDC")));
    document.title = t(r[1]) + " | " + t("Plant Spare Parts Store") + " · CICTNA RDC";
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function render() {
    drawShell();
    const r = route();
    const fn = PAGES[r] || PAGES.overview;
    put(page, fn());
    window.scrollTo(0, 0);
  }
  const card = (title, body, extra, sub) => h("section", { class: "card" }, h("header", {}, h("h2", {}, title), h("div", { class: "grow" }), extra || null, sub ? h("p", {}, sub) : null), body);
  const go = (hash) => { location.hash = hash; };

  /* ---------- pages ---------- */
  const PAGES = {};

  PAGES.overview = function () {
    const total = D.STOCK.reduce((s, r) => s + r.qty * PART.get(r.part).cost, 0);
    const st = D.PARTS.map((p) => [p, partStatus(p)[0]]);
    const reorder = st.filter(([, s]) => s === "Reorder" || s === "Out of stock");
    const critZero = D.PARTS.filter((p) => p.crit === "A" && avail(p.no) <= 0);
    const openPOs = D.POS.filter(openPO);
    const poVal = openPOs.reduce((s, p) => s + p.lines.reduce((a, l) => a + (l.qty - l.received) * l.price, 0), 0);
    const reqs = D.REQS.filter(openReq);
    const expiring = D.STOCK.filter((s) => s.exp && days(s.exp) <= 60);
    const quarantine = D.STOCK.filter((s) => s.status === "quarantine");
    const weekIssues = D.MOVES.filter((m) => m.type === "Issue" && m.ts > Date.now() - 7 * DAY).length;

    const kpis = h("div", { class: "kpis" },
      kpi("Stock value", money(total), t("{0} stock lines", D.STOCK.length)),
      kpi("Parts to reorder", reorder.length, t("below reorder point, nothing on order"), reorder.length ? "warn" : "good", "#/parts?status=Reorder"),
      kpi("Critical spares at zero", critZero.length, t("criticality A, nothing available"), critZero.length ? "bad" : "good", "#/parts?status=Out of stock"),
      kpi("Open purchase orders", openPOs.length, money(poVal) + " " + t("still to receive"), "", "#/purchase-orders"),
      kpi("Open issue requests", reqs.length, t("{0} lines issued in the last 7 days", weekIssues), reqs.length > 4 ? "warn" : "", "#/issues"),
      kpi("Lots expiring", expiring.length, t("within 60 days"), expiring.length ? "warn" : "good", "#/stock?f=expiring"));

    // issues and receipts per week, last 12 weeks
    const weeks = [];
    for (let w = 11; w >= 0; w--) {
      const end = Date.now() - w * 7 * DAY, start = end - 7 * DAY;
      const ms = D.MOVES.filter((m) => m.ts > start && m.ts <= end);
      weeks.push({ label: K.dateShort(start).replace(/\.$/, ""), value: ms.filter((m) => m.type === "Issue").length, value2: ms.filter((m) => m.type === "Receipt").length });
    }
    const flow = card(t("Issues and receipts per week"), h("div", { class: "pad" }, h("div", { class: "legend-row" }, h("span", {}, h("i", { style: "background:var(--sea)" }), t("Issue lines")), h("span", {}, h("i", { style: "background:var(--dawn)" }), t("Receipt lines"))), K.columns(weeks, { label: t("Issues and receipts per week") })));

    const byCat = D.CATS.map((c) => ({ label: t(c), value: D.STOCK.filter((s) => PART.get(s.part).cat === c).reduce((a, s) => a + s.qty * PART.get(s.part).cost, 0) })).sort((a, b) => b.value - a.value);
    const value = card(t("Stock value by category"), h("div", { class: "pad" }, K.hbars(byCat, (v) => money(v))), h("a", { class: "btn sm ghost", href: "#/value" }, t("Details")));

    const att = [];
    critZero.forEach((p) => att.push(["red", t("Critical spare at zero"), p.no + " · " + p.desc, onOrder(p.no) ? t("On order: {0}", qty(onOrder(p.no), p.unit) + " " + p.unit) : t("Nothing on order"), "#/parts?q=" + p.no]));
    reorder.filter(([p]) => p.crit !== "A" || avail(p.no) > 0).forEach(([p]) => att.push(["dawn", t("Below reorder point"), p.no + " · " + p.desc, t("Available {0}, reorder at {1}", qty(avail(p.no), p.unit), p.rop), "#/parts?q=" + p.no]));
    expiring.forEach((s) => att.push(["dawn", t("Lot expiring in {0} days", days(s.exp)), s.part + " · " + s.lot, s.bin, "#/stock?q=" + s.lot]));
    quarantine.forEach((s) => att.push(["grey", t("In quarantine"), s.part + " · " + s.bin, s.note || "", "#/stock?f=quarantine"]));
    const attention = card(t("Needs attention"), h("ul", { class: "list" }, att.slice(0, 9).map(([c, what, sub, info, href]) => h("li", {}, h("span", { class: "dot " + c }), h("div", { class: "what" }, h("b", {}, what), h("small", {}, sub)), h("span", { class: "muted", style: "font-size:12.5px" }, info), h("a", { class: "btn sm ghost", href }, t("Open"))))),
      reorder.length ? h("button", { class: "btn sm dawn", type: "button", onclick: orderShortages }, t("Order shortages")) : null);

    const reqList = card(t("Open issue requests"), h("ul", { class: "list" }, reqs.map((r) => h("li", {}, h("span", { class: "dot " + (r.priority ? "red" : r.lines.some((l) => l.short > 0) ? "dawn" : "") }),
      h("div", { class: "what" }, h("b", {}, r.wo, " · ", r.asset), h("small", {}, r.task + " · " + r.tech)), r.priority ? chip(r.priority, "red") : null, reqChip(r),
      h("button", { class: "btn sm", type: "button", onclick: () => pickList(r) }, t("Pick list"))))), h("a", { class: "btn sm ghost", href: "#/issues" }, t("All requests")));

    const recent = D.MOVES.slice().sort((a, b) => b.ts - a.ts).slice(0, 8);
    const moves = card(t("Latest stock movements"), h("ul", { class: "list" }, recent.map((m) => h("li", {}, h("span", { class: "dot " + (m.qty < 0 ? "" : m.type === "Receipt" ? "pine" : "grey") }),
      h("div", { class: "what" }, h("b", {}, t(m.type), " · ", m.part), h("small", {}, (PART.get(m.part) || {}).desc)), h("span", { class: "num" }, (m.qty > 0 ? "+" : "") + qty(m.qty, PART.get(m.part).unit)), h("span", { class: "muted", style: "font-size:12px;min-width:90px;text-align:end" }, K.dateTime(m.ts))))), h("a", { class: "btn sm ghost", href: "#/movements" }, t("All movements")));

    return [kpis, h("div", { class: "grid g32" }, flow, value), h("div", { class: "grid g2" }, attention, reqList), moves];
  };
  function kpi(label, value, small, cls, href) {
    const el = h(href ? "a" : "div", { class: "kpi " + (cls || ""), href: href || null, style: href ? "text-decoration:none;color:inherit" : null }, h("span", {}, t(label)), h("b", {}, value), h("small", {}, small));
    return el;
  }
  const reqChip = (r) => chip(r.status, { Requested: "", Picking: "amber", "Part issued": "dawn", Issued: "pine", Returned: "grey" }[r.status]);
  const poChip = (p) => chip(p.status, { Draft: "grey", Sent: "", "Part received": "dawn", Received: "pine" }[p.status]);

  PAGES.stock = function () {
    const f = param("f");
    const tb = K.table({
      id: "stock", csvName: "current-stock", select: true, rowKey: (r) => r.id, rows: () => D.STOCK,
      search: (r) => [r.part, PART.get(r.part).desc, r.bin, r.lot].join(" "),
      rowClass: (r) => (r.status === "quarantine" ? "bad" : r.exp && days(r.exp) <= 60 ? "warn" : ""),
      sortBy: "part",
      filters: [
        { label: "All stores", options: () => D.STORES.map((s) => [s.id, s.name]), test: (r, v) => r.bin.startsWith(v + "-") },
        { label: "All categories", options: () => D.CATS.map((c) => [c, c]), test: (r, v) => PART.get(r.part).cat === v },
        { label: "Any status", options: () => [["ok", "Available"], ["quarantine", "Quarantine"], ["expiring", "Expiring within 60 days"], ["reserved", "Reserved"]],
          test: (r, v) => (v === "expiring" ? r.exp && days(r.exp) <= 60 : v === "reserved" ? r.reserved > 0 : r.status === v) },
      ],
      cols: [
        { key: "part", label: "Part", render: (r) => code(r.part) },
        { key: "desc", label: "Description", cls: "wrap", text: (r) => PART.get(r.part).desc, sort: (r) => PART.get(r.part).desc },
        { key: "bin", label: "Bin", render: (r) => code(r.bin) },
        { key: "lot", label: "Lot", render: (r) => (r.lot ? code(r.lot) : h("span", { class: "muted" }, "-")) },
        { key: "exp", label: "Expiry", sort: (r) => r.exp || 9e15, text: (r) => (r.exp ? K.date(r.exp) : ""), render: (r) => (r.exp ? h("span", {}, K.date(r.exp), days(r.exp) <= 60 ? [" ", chip(t("{0} d", days(r.exp)), days(r.exp) <= 30 ? "red" : "dawn")] : null) : h("span", { class: "muted" }, "-")) },
        { key: "qty", label: "On hand", num: true, render: (r) => qu(r.qty, PART.get(r.part).unit), text: (r) => r.qty },
        { key: "reserved", label: "Reserved", num: true, text: (r) => (r.reserved ? qty(r.reserved, PART.get(r.part).unit) : "") },
        { key: "avail", label: "Available", num: true, sort: (r) => (r.status === "ok" ? r.qty - r.reserved : 0), text: (r) => qty(r.status === "ok" ? r.qty - r.reserved : 0, PART.get(r.part).unit) },
        { key: "value", label: "Value", num: true, sort: (r) => r.qty * PART.get(r.part).cost, text: (r) => money(r.qty * PART.get(r.part).cost) },
        { key: "status", label: "Status", text: (r) => t(r.status === "ok" ? "Available" : "Quarantine"), render: (r) => (r.status === "ok" ? chip("Available", "pine") : h("span", { title: r.note || "" }, chip("Quarantine", "red"))) },
      ],
      bulk: [["Quarantine", (rs) => setStatus(rs, "quarantine"), "danger"], ["Release", (rs) => setStatus(rs, "ok")]],
      actions: (r) => [h("button", { class: "btn sm", type: "button", onclick: () => transfer(r) }, t("Move")), h("button", { class: "btn sm", type: "button", onclick: () => count(r) }, t("Count")),
        h("a", { class: "btn sm ghost", href: "#/movements?q=" + encodeURIComponent(r.part) }, t("History"))],
    });
    if (f) tb.setFilter(2, f);
    if (param("q")) tb.setSearch(param("q"));
    const all = D.STOCK.reduce((s, r) => s + r.qty * PART.get(r.part).cost, 0);
    return [h("p", { class: "lede" }, t("Every stock line by part, bin and lot. Lot-tracked items (oils, chemicals, membranes, sensors) are issued first expiry, first out. Select lines to quarantine or release them.")),
      card(t("Current stock"), tb.el, h("span", { class: "muted" }, t("Total value"), " ", h("b", { class: "num" }, money(all))))];
  };
  function setStatus(rs, status) {
    rs.forEach((r) => {
      if (r.status === status) return;
      r.status = status; if (status === "ok") delete r.note; else r.note = t("Held for inspection");
      move(status === "ok" ? "Release" : "Quarantine", r.part, 0, r.bin, r.lot, "Stock line " + r.id, "");
      audit("Stock line", String(r.id), status === "ok" ? "Released" : "Quarantined", r.part + " " + r.bin);
    });
    reserveAll();
    K.toast(t(status === "ok" ? "{0} lines released" : "{0} lines quarantined", rs.length), status === "ok" ? "good" : "");
    render();
  }
  function transfer(r) {
    const p = PART.get(r.part);
    const s = K.select(D.BINS.filter((b) => b.code !== r.bin).map((b) => [b.code, b.code + " · " + t(b.type)]), "");
    const q = h("input", { type: "number", min: "0", step: "any", value: String(r.qty - r.reserved), max: String(r.qty) });
    K.modal(t("Move stock"), h("div", { class: "form" },
      h("dl", { class: "kv full" }, h("dt", {}, t("Part")), h("dd", {}, code(r.part), " ", p.desc), h("dt", {}, t("From bin")), h("dd", {}, code(r.bin)), r.lot ? [h("dt", {}, t("Lot")), h("dd", {}, code(r.lot))] : null),
      K.field(t("To bin"), s), K.field(t("Quantity") + " (" + p.unit + ")", q)),
    [[t("Cancel"), null, "ghost"], [t("Move"), () => {
      const n = Number(q.value);
      if (!(n > 0) || n > r.qty) { K.toast(t("Enter a quantity up to {0}", qty(r.qty, p.unit)), "bad"); return false; }
      if (n === r.qty) r.bin = s.value;
      else { r.qty -= n; D.STOCK.push({ ...r, id: NEXT_STOCK++, qty: n, reserved: 0, bin: s.value }); }
      move("Transfer", r.part, 0, s.value, r.lot, r.bin + " → " + s.value, qty(n, p.unit) + " " + p.unit);
      audit("Stock line", String(r.id), "Moved", `${qty(n, p.unit)} ${p.unit} to ${s.value}`);
      reserveAll(); K.toast(t("Moved to {0}", s.value), "good"); render();
    }, "primary"]]);
  }
  function count(r) {
    const p = PART.get(r.part);
    const q = h("input", { type: "number", min: "0", step: "any", value: String(r.qty) });
    K.modal(t("Count stock line"), h("div", { class: "form" },
      h("dl", { class: "kv full" }, h("dt", {}, t("Part")), h("dd", {}, code(r.part), " ", p.desc), h("dt", {}, t("Bin")), h("dd", {}, code(r.bin)), h("dt", {}, t("System quantity")), h("dd", {}, qu(r.qty, p.unit))),
      K.field(t("Counted quantity") + " (" + p.unit + ")", q)),
    [[t("Cancel"), null, "ghost"], [t("Save count"), () => {
      const n = Number(q.value);
      if (!(n >= 0)) return false;
      const diff = n - r.qty;
      if (diff === 0) { K.toast(t("Count matches, nothing to adjust"), "good"); return; }
      r.qty = n; move("Adjustment", r.part, diff, r.bin, r.lot, "Cycle count", "");
      audit("Stock line", String(r.id), "Counted", `${diff > 0 ? "+" : ""}${qty(diff, p.unit)} ${p.unit}`);
      if (r.qty <= 0) D.STOCK.splice(D.STOCK.indexOf(r), 1);
      reserveAll(); K.toast(t("Adjusted by {0}", (diff > 0 ? "+" : "") + qty(diff, p.unit) + " " + p.unit), "good"); render();
    }, "primary"]]);
  }

  PAGES.parts = function () {
    const tb = K.table({
      id: "parts", csvName: "parts", rowKey: (p) => p.no, rows: () => D.PARTS, sortBy: "no",
      search: (p) => [p.no, p.desc, p.cat, p.sup, SUP.get(p.sup).name].join(" "),
      rowClass: (p) => ({ red: "bad", dawn: "warn" }[partStatus(p)[1]] || ""),
      filters: [
        { label: "All categories", options: () => D.CATS.map((c) => [c, c]), test: (p, v) => p.cat === v },
        { label: "Any criticality", options: () => [["A", "A, plant stops"], ["B", "B, reduced output"], ["C", "C, no impact"]], test: (p, v) => p.crit === v },
        { label: "Any status", options: () => [["OK", "OK"], ["On order", "On order"], ["Reorder", "Reorder"], ["Out of stock", "Out of stock"]], test: (p, v) => (v === "Reorder" ? ["Reorder", "Out of stock"].includes(partStatus(p)[0]) : partStatus(p)[0] === v) },
      ],
      cols: [
        { key: "no", label: "Part", render: (p) => code(p.no) },
        { key: "desc", label: "Description", cls: "wrap" },
        { key: "cat", label: "Category", text: (p) => t(p.cat) },
        { key: "crit", label: "Criticality", render: (p) => chip(p.crit, { A: "red", B: "amber", C: "grey" }[p.crit]), text: (p) => p.crit },
        { key: "unit", label: "Unit", render: (p) => code(p.unit) },
        { key: "rop", label: "Reorder at", num: true, text: (p) => qty(p.rop, p.unit) },
        { key: "max", label: "Max", num: true, text: (p) => qty(p.max, p.unit) },
        { key: "onhand", label: "On hand", num: true, sort: (p) => onHand(p.no), text: (p) => qty(onHand(p.no), p.unit) },
        { key: "avail", label: "Available", num: true, sort: (p) => avail(p.no), text: (p) => qty(avail(p.no), p.unit) },
        { key: "order", label: "On order", num: true, sort: (p) => onOrder(p.no), text: (p) => (onOrder(p.no) ? qty(onOrder(p.no), p.unit) : "") },
        { key: "status", label: "Status", sort: (p) => partStatus(p)[0], text: (p) => t(partStatus(p)[0]), render: (p) => { const [s, c] = partStatus(p); return [chip(s, c), onDraft(p.no) ? [" ", chip("Draft PO", "grey")] : null]; } },
        { key: "cost", label: "Unit cost", num: true, text: (p) => money(p.cost, p.cost < 100 ? 2 : 0) },
        { key: "sup", label: "Supplier", text: (p) => SUP.get(p.sup).name },
      ],
      actions: (p) => h("button", { class: "btn sm", type: "button", onclick: () => editPart(p) }, t("Edit")),
    });
    const s = param("status"); if (s) tb.setFilter(2, s === "Out of stock" ? "Out of stock" : "Reorder");
    if (param("q")) tb.setSearch(param("q"));
    const short = D.PARTS.filter((p) => ["Reorder", "Out of stock"].includes(partStatus(p)[0]) && !onDraft(p.no)).length;
    return [h("p", { class: "lede" }, t("Spare parts master data with criticality, reorder point and stock levels. Criticality A means the plant stops or loses a train without the part.")),
      card(t("Parts"), tb.el, short ? h("button", { class: "btn sm dawn", type: "button", onclick: orderShortages }, t("Order shortages ({0})", short)) : null)];
  };
  function editPart(p) {
    const f = { min: h("input", { type: "number", min: "0", value: String(p.min) }), rop: h("input", { type: "number", min: "0", value: String(p.rop) }), max: h("input", { type: "number", min: "0", value: String(p.max) }),
      crit: K.select([["A", "A"], ["B", "B"], ["C", "C"]], p.crit), sup: K.select(D.SUPPLIERS.map((s) => [s.code, s.name]), p.sup), cost: h("input", { type: "number", min: "0", step: "0.01", value: String(p.cost) }) };
    K.modal(t("Edit part") + " " + p.no, h("div", { class: "form" }, h("div", { class: "full muted" }, p.desc),
      K.field(t("Minimum"), f.min), K.field(t("Reorder at"), f.rop), K.field(t("Maximum"), f.max), K.field(t("Criticality"), f.crit), K.field(t("Supplier"), f.sup), K.field(t("Unit cost") + " (USD)", f.cost)),
    [[t("Cancel"), null, "ghost"], [t("Save"), () => {
      const nv = { min: +f.min.value, rop: +f.rop.value, max: +f.max.value, crit: f.crit.value, sup: f.sup.value, cost: +f.cost.value };
      if (!(nv.min <= nv.rop && nv.rop <= nv.max)) { K.toast(t("Minimum, reorder point and maximum must go up in that order"), "bad"); return false; }
      const ch = Object.keys(nv).filter((k) => nv[k] !== p[k]).map((k) => `${k} ${p[k]} → ${nv[k]}`);
      Object.assign(p, nv);
      if (ch.length) audit("Part", p.no, "Changed", ch.join(", "));
      K.toast(t("Saved"), "good"); render();
    }, "primary"]]);
  }
  function orderShortages() {
    const need = D.PARTS.filter((p) => ["Reorder", "Out of stock"].includes(partStatus(p)[0]) && !onDraft(p.no));
    if (!need.length) { K.toast(t("No shortages to order")); return; }
    const bySup = {};
    need.forEach((p) => { (bySup[p.sup] = bySup[p.sup] || []).push({ part: p.no, qty: Math.max(1, Math.ceil(p.max - avail(p.no) - onOrder(p.no))), received: 0, price: p.cost }); });
    const made = [];
    let n = 419;
    Object.entries(bySup).forEach(([sup, lines]) => {
      while (D.POS.some((p) => p.id === `PO-26-${String(n).padStart(4, "0")}`)) n++;
      const id = `PO-26-${String(n).padStart(4, "0")}`;
      D.POS.unshift({ id, sup, created: Date.now(), due: Date.now() + SUP.get(sup).lead * DAY, status: "Draft", lines, buyer: D.USERS.buyer });
      audit("Purchase order", id, "Created", t("From shortages") + `, ${lines.length} lines`); made.push(id);
    });
    K.toast(t("{0} draft purchase orders created", made.length), "good");
    go("#/purchase-orders");
  }

  PAGES["purchase-orders"] = function () {
    const tb = K.table({
      id: "pos", csvName: "purchase-orders", rowKey: (p) => p.id, rows: () => D.POS,
      search: (p) => [p.id, SUP.get(p.sup).name, p.lines.map((l) => l.part).join(" ")].join(" "),
      rowClass: (p) => (openPO(p) && p.due < Date.now() ? "warn" : ""),
      filters: [
        { label: "Any status", options: () => [["Draft", "Draft"], ["Sent", "Sent"], ["Part received", "Part received"], ["Received", "Received"]], test: (p, v) => p.status === v },
        { label: "All suppliers", options: () => D.SUPPLIERS.map((s) => [s.code, s.name]), test: (p, v) => p.sup === v },
      ],
      cols: [
        { key: "id", label: "Order", render: (p) => code(p.id) },
        { key: "sup", label: "Supplier", text: (p) => SUP.get(p.sup).name },
        { key: "created", label: "Created", text: (p) => K.date(p.created) },
        { key: "due", label: "Due", text: (p) => K.date(p.due), render: (p) => [K.date(p.due), openPO(p) && p.due < Date.now() ? [" ", chip("Late", "red")] : null] },
        { key: "lines", label: "Lines", num: true, sort: (p) => p.lines.length, text: (p) => p.lines.length },
        { key: "value", label: "Value", num: true, sort: (p) => poValue(p), text: (p) => money(poValue(p)) },
        { key: "rec", label: "Received", sort: (p) => poRec(p), text: (p) => Math.round(poRec(p) * 100) + "%", render: (p) => h("div", { style: "display:flex;gap:8px;align-items:center" }, h("div", { class: "meter" }, h("i", { style: `width:${poRec(p) * 100}%` })), h("span", { class: "num muted" }, Math.round(poRec(p) * 100) + "%")) },
        { key: "status", label: "Status", text: (p) => t(p.status), render: poChip },
      ],
      actions: (p) => [h("button", { class: "btn sm ghost", type: "button", onclick: () => poLines(p) }, t("Lines")),
        p.status === "Draft" ? h("button", { class: "btn sm primary", type: "button", onclick: () => { p.status = "Sent"; p.created = Date.now(); p.due = Date.now() + SUP.get(p.sup).lead * DAY; audit("Purchase order", p.id, "Sent to supplier", SUP.get(p.sup).email); K.toast(t("{0} sent to {1}", p.id, SUP.get(p.sup).name), "good"); render(); } }, t("Send")) : null,
        openPO(p) ? h("button", { class: "btn sm primary", type: "button", onclick: () => receive(p) }, t("Receive")) : null],
    });
    return [h("p", { class: "lede" }, t("Orders to suppliers, from draft to goods received. Receiving books the parts into a bin, with a lot number for lot-tracked items, and frees them for issue.")), card(t("Purchase orders"), tb.el,
      h("button", { class: "btn sm dawn", type: "button", onclick: orderShortages }, t("Order shortages")))];
  };
  const poValue = (p) => p.lines.reduce((s, l) => s + l.qty * l.price, 0);
  const poRec = (p) => { const q = p.lines.reduce((s, l) => s + l.qty, 0); return q ? p.lines.reduce((s, l) => s + l.received, 0) / q : 0; };
  function poLines(p) {
    K.modal(p.id + " · " + SUP.get(p.sup).name, h("div", {},
      h("dl", { class: "kv", style: "margin-bottom:12px" }, h("dt", {}, t("Status")), h("dd", {}, poChip(p)), h("dt", {}, t("Buyer")), h("dd", {}, p.buyer), h("dt", {}, t("Due")), h("dd", {}, K.date(p.due))),
      h("div", { class: "scroll" }, h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, ["Part", "Description", "Ordered", "Received", "Price", "Value"].map((c, i) => h("th", { class: i > 1 ? "n" : "" }, t(c))))),
        h("tbody", {}, p.lines.map((l) => { const pt = PART.get(l.part); return h("tr", {}, h("td", {}, code(l.part)), h("td", { class: "wrap" }, pt.desc), h("td", { class: "n" }, qu(l.qty, pt.unit)), h("td", { class: "n" }, qty(l.received, pt.unit)), h("td", { class: "n" }, money(l.price, l.price < 100 ? 2 : 0)), h("td", { class: "n" }, money(l.qty * l.price))); }))))), null, true);
  }
  function receive(p) {
    const inputs = [];
    const body = h("tbody", {}, p.lines.filter((l) => l.received < l.qty).map((l) => {
      const pt = PART.get(l.part);
      const q = h("input", { type: "number", min: "0", step: "any", value: String(l.qty - l.received), style: "width:90px" });
      const lot = pt.lot ? h("input", { type: "text", value: `L${new Date().getFullYear() % 100}${Math.floor(100 + Math.random() * 900)}-A`, style: "width:110px" }) : null;
      const home = (D.STOCK.find((s) => s.part === l.part) || {}).bin;
      const bin = K.select(D.BINS.filter((b) => b.store === pt.store).map((b) => [b.code, b.code]), home);
      inputs.push({ l, pt, q, lot, bin });
      return h("tr", {}, h("td", {}, code(l.part), h("div", { class: "muted", style: "font-size:12px;white-space:normal" }, pt.desc)), h("td", { class: "n" }, qty(l.qty - l.received, pt.unit) + " " + pt.unit), h("td", {}, q), h("td", {}, lot || h("span", { class: "muted" }, "-")), h("td", {}, bin));
    }));
    K.modal(t("Receive {0}", p.id), h("div", {}, h("p", { class: "muted", style: "margin-top:0" }, SUP.get(p.sup).name + " · " + t("Check the quantities against the delivery note.")),
      h("div", { class: "scroll" }, h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, ["Part", "Open", "Receiving", "Lot", "Bin"].map((c, i) => h("th", { class: i === 1 ? "n" : "" }, t(c))))), body))),
    [[t("Cancel"), null, "ghost"], [t("Book receipt"), () => {
      let lines = 0;
      inputs.forEach(({ l, pt, q, lot, bin }) => {
        const n = Math.min(Number(q.value) || 0, l.qty - l.received);
        if (n <= 0) return;
        l.received += n; lines++;
        D.STOCK.push({ id: NEXT_STOCK++, part: l.part, bin: bin.value, lot: lot ? lot.value : "", qty: n, reserved: 0, recv: Date.now(), exp: pt.life ? Date.now() + pt.life * DAY : null, status: "ok" });
        move("Receipt", l.part, n, bin.value, lot ? lot.value : "", p.id, SUP.get(p.sup).name);
      });
      if (!lines) { K.toast(t("Nothing to receive"), "bad"); return false; }
      p.status = p.lines.every((l) => l.received >= l.qty) ? "Received" : "Part received";
      audit("Purchase order", p.id, "Goods received", `${lines} lines, ${t(p.status)}`);
      reserveAll(); K.toast(t("{0} lines booked into stock", lines), "good"); render();
    }, "primary"]], true);
  }

  PAGES.issues = function () {
    const tb = K.table({
      id: "reqs", csvName: "issue-requests", rowKey: (r) => r.id, rows: () => D.REQS,
      search: (r) => [r.id, r.wo, r.asset, r.aname, r.task, r.tech, r.lines.map((l) => l.part).join(" ")].join(" "),
      rowClass: (r) => (r.priority && openReq(r) ? "bad" : openReq(r) && r.lines.some((l) => l.short > 0) ? "warn" : ""),
      filters: [{ label: "Any status", options: () => [["open", "Open"], ["Requested", "Requested"], ["Picking", "Picking"], ["Part issued", "Part issued"], ["Issued", "Issued"], ["Returned", "Returned"]], test: (r, v) => (v === "open" ? openReq(r) : r.status === v) }],
      cols: [
        { key: "id", label: "Request", render: (r) => code(r.id) },
        { key: "wo", label: "Work order", render: (r) => code(r.wo) },
        { key: "asset", label: "Asset", render: (r) => h("span", {}, code(r.asset), " ", h("span", { class: "muted" }, r.aname)), text: (r) => r.asset + " " + r.aname },
        { key: "task", label: "Job", cls: "wrap" },
        { key: "tech", label: "Technician" },
        { key: "need", label: "Needed", text: (r) => K.date(r.need) },
        { key: "lines", label: "Lines", num: true, sort: (r) => r.lines.length, text: (r) => r.lines.length },
        { key: "status", label: "Status", text: (r) => t(r.status), render: (r) => [r.priority && openReq(r) ? [chip(r.priority, "red"), " "] : null, reqChip(r), openReq(r) && r.lines.some((l) => l.short > 0) ? [" ", chip("Short", "dawn")] : null] },
      ],
      actions: (r) => [h("button", { class: "btn sm ghost", type: "button", onclick: () => pickList(r) }, t(openReq(r) ? "Pick list" : "Lines")),
        openReq(r) ? h("button", { class: "btn sm primary", type: "button", onclick: () => { issueRequest(r); render(); } }, t("Issue")) : null],
    });
    tb.setFilter(0, param("all") ? "" : "open");
    return [h("p", { class: "lede" }, t("Parts requested against maintenance work orders. Stock is reserved as soon as a request comes in, the pick list shows the bin and lot to take, and issuing books the parts out to the work order.")),
      card(t("Issue requests"), tb.el, h("button", { class: "btn sm primary", type: "button", onclick: newRequest }, t("+ New request")))];
  };
  function pickList(r) {
    const plan = openReq(r) ? pickPlan(r) : [];
    const lines = openReq(r)
      ? h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, ["Bin", "Part", "Lot", "Take", ""].map((c, i) => h("th", { class: i === 3 ? "n" : "" }, c ? t(c) : "")))),
        h("tbody", {}, plan.sort((a, b) => (a.bin || "~").localeCompare(b.bin || "~")).map((x) => { const p = PART.get(x.part); return h("tr", { class: x.short ? "bad" : "" }, h("td", {}, x.bin ? code(x.bin) : "-"), h("td", {}, code(x.part), h("div", { class: "muted", style: "font-size:12px;white-space:normal" }, p.desc)), h("td", {}, x.lot ? code(x.lot) : "-"), h("td", { class: "n" }, qu(x.qty, p.unit)), h("td", {}, x.short ? chip("Not in stock", "red") : x.exp ? h("span", { class: "muted", style: "font-size:12px" }, t("exp.") + " " + K.date(x.exp)) : null)); })))
      : h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, ["Part", "Requested", "Issued"].map((c, i) => h("th", { class: i ? "n" : "" }, t(c))))), h("tbody", {}, r.lines.map((l) => { const p = PART.get(l.part); return h("tr", {}, h("td", {}, code(l.part), " ", h("span", { class: "muted" }, p.desc)), h("td", { class: "n" }, qu(l.qty, p.unit)), h("td", { class: "n" }, qty(l.issued, p.unit))); })));
    const m = K.modal((openReq(r) ? t("Pick list") : t("Lines")) + " · " + r.id, h("div", {},
      h("dl", { class: "kv", style: "margin-bottom:12px" }, h("dt", {}, t("Work order")), h("dd", {}, code(r.wo), " ", r.task), h("dt", {}, t("Asset")), h("dd", {}, code(r.asset), " ", r.aname), h("dt", {}, t("Technician")), h("dd", {}, r.tech), h("dt", {}, t("Status")), h("dd", {}, reqChip(r))),
      h("div", { class: "scroll" }, lines)),
    openReq(r) ? [[t("Close"), null, "ghost"], r.status === "Requested" ? [t("Start picking"), () => { r.status = "Picking"; audit("Issue request", r.id, "Picking started", ""); render(); }] : null, [t("Issue to work order"), () => { issueRequest(r); render(); }, "primary"]].filter(Boolean) : null, true);
    return m;
  }
  function newRequest() {
    const asset = K.select(D.ASSETS.map(([c, n]) => [c, c + " · " + n]), "");
    const task = h("input", { type: "text", value: t("Replace mechanical seal") });
    const tech = K.select(D.USERS.tech.map((x) => [x, x]), "");
    const prio = K.select([["", t("Normal")], ["Urgent", t("Urgent")]], "");
    const partOpts = [["", "-"]].concat(D.PARTS.map((p) => [p.no, p.no + " · " + p.desc]));
    const lines = [0, 1, 2].map((i) => ({ p: K.select(partOpts, i === 0 ? "MS-SEAL-045" : i === 1 ? "GSK-DN100" : ""), q: h("input", { type: "number", min: "1", value: i < 2 ? (i ? "2" : "1") : "1", style: "width:80px" }) }));
    let n = 947; while (D.REQS.some((r) => r.id === `IR-26-${String(n).padStart(4, "0")}`)) n++;
    let w = 1191; while (D.REQS.some((r) => r.wo === `WO-26-${w}`)) w++;
    K.modal(t("New issue request"), h("div", { class: "form" },
      h("div", { class: "full muted" }, t("Work order {0}, created in the maintenance system and sent here with its parts list.", `WO-26-${w}`)),
      K.field(t("Asset"), asset), K.field(t("Job"), task), K.field(t("Technician"), tech), K.field(t("Priority"), prio),
      h("div", { class: "full" }, h("div", { class: "field" }, h("span", {}, t("Parts"))), lines.map(({ p, q }) => h("div", { style: "display:flex;gap:8px;margin-top:6px" }, h("div", { style: "flex:1;min-width:0" }, p), q)))),
    [[t("Cancel"), null, "ghost"], [t("Create request"), () => {
      const ls = lines.filter((x) => x.p.value && Number(x.q.value) > 0).map((x) => ({ part: x.p.value, qty: Number(x.q.value), issued: 0 }));
      if (!ls.length) { K.toast(t("Add at least one part"), "bad"); return false; }
      const a = D.ASSETS.find(([c]) => c === asset.value);
      const r = { id: `IR-26-${String(n).padStart(4, "0")}`, wo: `WO-26-${w}`, asset: a[0], aname: a[1], task: task.value, tech: tech.value, created: Date.now(), need: Date.now() + DAY, status: "Requested", lines: ls, priority: prio.value || undefined };
      D.REQS.unshift(r); reserveAll();
      audit("Issue request", r.id, "Created", `${r.wo}, ${r.asset}`);
      const short = ls.filter((l) => l.short > 0).length;
      K.toast(short ? t("{0} created, {1} lines short", r.id, short) : t("{0} created and stock reserved", r.id), short ? "" : "good");
      render();
    }, "primary"]]);
  }

  PAGES.movements = function () {
    const tb = K.table({
      id: "moves", csvName: "stock-movements", rowKey: (m) => m.id, rows: () => D.MOVES, sortBy: "ts", sortDir: -1,
      search: (m) => [m.part, (PART.get(m.part) || {}).desc, m.bin, m.lot, m.ref, m.who, m.note].join(" "),
      filters: [
        { label: "All types", options: () => ["Receipt", "Issue", "Return", "Transfer", "Adjustment", "Quarantine", "Release"].map((x) => [x, x]), test: (m, v) => m.type === v },
        { label: "Any time", options: () => [["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]], test: (m, v) => m.ts > Date.now() - Number(v) * DAY },
      ],
      cols: [
        { key: "ts", label: "Time", text: (m) => K.dateTime(m.ts) },
        { key: "type", label: "Type", text: (m) => t(m.type), render: (m) => chip(m.type, { Receipt: "pine", Issue: "", Return: "amber", Transfer: "grey", Adjustment: "dawn", Quarantine: "red", Release: "pine" }[m.type]) },
        { key: "part", label: "Part", render: (m) => code(m.part) },
        { key: "desc", label: "Description", cls: "wrap", text: (m) => (PART.get(m.part) || {}).desc },
        { key: "qty", label: "Quantity", num: true, text: (m) => (m.qty ? (m.qty > 0 ? "+" : "") + qty(m.qty, PART.get(m.part).unit) : ""), render: (m) => (m.qty ? h("span", { style: "color:" + (m.qty > 0 ? "var(--pine)" : "var(--red)") }, (m.qty > 0 ? "+" : "") + qty(m.qty, PART.get(m.part).unit)) : h("span", { class: "muted" }, "-")) },
        { key: "bin", label: "Bin", render: (m) => code(m.bin) },
        { key: "lot", label: "Lot", text: (m) => m.lot || "" },
        { key: "ref", label: "Reference", text: (m) => m.ref },
        { key: "note", label: "Note", text: (m) => m.note },
        { key: "who", label: "User" },
      ],
    });
    if (param("q")) tb.setSearch(param("q"));
    return [h("p", { class: "lede" }, t("Every receipt, issue, return, transfer and count correction, with who did it and why. A year of history in this demo.")), card(t("Stock movements"), tb.el)];
  };

  PAGES.value = function () {
    const val = (s) => s.qty * PART.get(s.part).cost;
    const total = D.STOCK.reduce((a, s) => a + val(s), 0);
    const lastIssue = (no) => D.MOVES.filter((m) => m.part === no && m.type === "Issue").reduce((a, m) => Math.max(a, m.ts), 0);
    const slow = D.PARTS.filter((p) => onHand(p.no) > 0 && Date.now() - lastIssue(p.no) > 180 * DAY);
    const slowVal = slow.reduce((a, p) => a + onHand(p.no) * p.cost, 0);
    const aVal = D.STOCK.filter((s) => PART.get(s.part).crit === "A").reduce((a, s) => a + val(s), 0);
    const colors = ["#3d6d78", "#e7a982", "#2f5a46"];
    const byStore = D.STORES.map((s, i) => ({ label: t(s.name), value: Math.round(D.STOCK.filter((r) => r.bin.startsWith(s.id + "-")).reduce((a, r) => a + val(r), 0)), color: colors[i] }));
    const byCat = D.CATS.map((c) => ({ label: t(c), value: D.STOCK.filter((s) => PART.get(s.part).cat === c).reduce((a, s) => a + val(s), 0) })).sort((a, b) => b.value - a.value);
    const tb = K.table({
      id: "slow", csvName: "slow-moving", rowKey: (p) => p.no, rows: () => slow, sortBy: "value", sortDir: -1,
      search: (p) => p.no + " " + p.desc,
      cols: [
        { key: "no", label: "Part", render: (p) => code(p.no) }, { key: "desc", label: "Description", cls: "wrap" },
        { key: "crit", label: "Criticality", render: (p) => chip(p.crit, { A: "red", B: "amber", C: "grey" }[p.crit]), text: (p) => p.crit },
        { key: "oh", label: "On hand", num: true, sort: (p) => onHand(p.no), text: (p) => qty(onHand(p.no), p.unit) + " " + p.unit },
        { key: "value", label: "Value", num: true, sort: (p) => onHand(p.no) * p.cost, text: (p) => money(onHand(p.no) * p.cost) },
        { key: "last", label: "Last issued", sort: (p) => lastIssue(p.no), text: (p) => (lastIssue(p.no) ? t("{0} days ago", Math.round((Date.now() - lastIssue(p.no)) / DAY)) : t("Not in 12 months")) },
      ],
    });
    return [h("div", { class: "kpis" }, kpi("Stock value", money(total), t("at moving average cost")), kpi("Critical spares (A)", money(aVal), Math.round((aVal / total) * 100) + "% " + t("of stock value")),
      kpi("Slow moving", money(slowVal), t("{0} parts not issued for 6 months", slow.length), "warn"), kpi("Stock lines", num(D.STOCK.length), t("in {0} bins", new Set(D.STOCK.map((s) => s.bin)).size))),
    h("div", { class: "grid g2" }, card(t("Value by store"), h("div", { class: "pad" }, K.donut(byStore, null, (v) => money(v)))), card(t("Value by category"), h("div", { class: "pad" }, K.hbars(byCat, (v) => money(v))))),
    card(t("Slow-moving stock"), tb.el, null, t("Critical insurance spares are expected here: they are kept for breakdowns, not for regular use."))];
  };

  PAGES.suppliers = function () {
    const tb = K.table({
      id: "sups", csvName: "suppliers", rowKey: (s) => s.code, rows: () => D.SUPPLIERS, search: (s) => Object.values(s).join(" "),
      cols: [
        { key: "code", label: "Code", render: (s) => code(s.code) }, { key: "name", label: "Name" }, { key: "contact", label: "Contact" },
        { key: "email", label: "Email", render: (s) => h("span", { class: "ltr" }, s.email) }, { key: "phone", label: "Phone", render: (s) => h("span", { class: "ltr num" }, s.phone) },
        { key: "lead", label: "Lead time", num: true, text: (s) => t("{0} days", s.lead) },
        { key: "rating", label: "On-time delivery", render: (s) => h("div", { style: "display:flex;gap:8px;align-items:center" }, h("div", { class: "meter" }, h("i", { class: s.rating < 90 ? "hi" : "", style: `width:${s.rating}%` })), h("span", { class: "num muted" }, s.rating + "%")), text: (s) => s.rating + "%" },
        { key: "parts", label: "Parts", num: true, sort: (s) => D.PARTS.filter((p) => p.sup === s.code).length, text: (s) => D.PARTS.filter((p) => p.sup === s.code).length },
        { key: "open", label: "Open orders", num: true, sort: (s) => D.POS.filter((p) => p.sup === s.code && openPO(p)).length, text: (s) => D.POS.filter((p) => p.sup === s.code && openPO(p)).length || "" },
      ],
      actions: (s) => h("a", { class: "btn sm ghost", href: "#/purchase-orders" }, t("Orders")),
    });
    return [card(t("Suppliers"), tb.el)];
  };

  PAGES.bins = function () {
    const used = (b) => D.STOCK.filter((s) => s.bin === b.code);
    const tb = K.table({
      id: "bins", csvName: "bins", rowKey: (b) => b.code, rows: () => D.BINS, search: (b) => b.code + " " + b.type + " " + used(b).map((s) => s.part).join(" "),
      filters: [{ label: "All stores", options: () => D.STORES.map((s) => [s.id, s.name]), test: (b, v) => b.store === v }, { label: "Any fill", options: () => [["empty", "Empty"], ["used", "In use"], ["full", "Full"]], test: (b, v) => (v === "empty" ? !used(b).length : v === "full" ? used(b).length >= b.cap : used(b).length > 0) }],
      cols: [
        { key: "code", label: "Bin", render: (b) => code(b.code) }, { key: "store", label: "Store", text: (b) => t(STORE.get(b.store).name) }, { key: "type", label: "Type", text: (b) => t(b.type) },
        { key: "fill", label: "Lines used", sort: (b) => used(b).length / b.cap, text: (b) => used(b).length + "/" + b.cap, render: (b) => { const f = used(b).length / b.cap; return h("div", { style: "display:flex;gap:8px;align-items:center" }, h("div", { class: "meter" }, h("i", { class: f >= 1 ? "full" : f >= 0.75 ? "hi" : "", style: `width:${f * 100}%` })), h("span", { class: "num muted" }, used(b).length + "/" + b.cap)); } },
        { key: "parts", label: "Parts in bin", cls: "wrap", nosort: true, text: (b) => used(b).map((s) => s.part).join(", "), render: (b) => used(b).length ? used(b).map((s) => h("a", { href: "#/stock?q=" + s.part, style: "margin-inline-end:6px" }, code(s.part))) : h("span", { class: "muted" }, t("Empty")) },
      ],
    });
    return [card(t("Bins"), tb.el, null, t("Bin code = store, aisle and rack, level. Each bin takes a limited number of stock lines."))];
  };

  PAGES.units = function () {
    const tb = K.table({
      id: "units", csvName: "units", rowKey: (u) => u.code, rows: () => D.UNITS,
      cols: [
        { key: "code", label: "Code", render: (u) => code(u.code) }, { key: "name", label: "Name", text: (u) => t(u.name) }, { key: "base", label: "Base unit", render: (u) => code(u.base) },
        { key: "factor", label: "Base units per unit", num: true }, { key: "dec", label: "Decimals", num: true },
        { key: "parts", label: "Parts", num: true, sort: (u) => D.PARTS.filter((p) => p.unit === u.code).length, text: (u) => D.PARTS.filter((p) => p.unit === u.code).length },
      ],
    });
    return [card(t("Units of measure"), tb.el, null, t("Parts are stocked and issued in their own unit. Oils come in drums and are issued by the litre; fuses and bolts come by the box."))];
  };

  PAGES.audit = function () {
    const tb = K.table({
      id: "audit", csvName: "audit-log", rowKey: (a) => a.ts + a.ref, rows: () => D.AUDIT, sortBy: "ts", sortDir: -1,
      search: (a) => [a.who, a.entity, a.ref, a.action, a.detail].join(" "),
      filters: [{ label: "All records", options: () => ["Purchase order", "Issue request", "Stock line", "Part", "Supplier", "Bin"].map((x) => [x, x]), test: (a, v) => a.entity === v }],
      cols: [
        { key: "ts", label: "Time", text: (a) => K.dateTime(a.ts) }, { key: "who", label: "User" }, { key: "entity", label: "Record", text: (a) => t(a.entity) },
        { key: "ref", label: "Reference", render: (a) => code(a.ref) }, { key: "action", label: "Action", text: (a) => t(a.action) }, { key: "detail", label: "Detail", cls: "wrap" },
      ],
    });
    return [h("p", { class: "lede" }, t("Who changed what and when. Your own actions in this demo appear at the top.")), card(t("Audit log"), tb.el)];
  };

  /* ---------- start ---------- */
  reserveAll();
  window.addEventListener("hashchange", render);
  K.onChange(render);
  render();
})();
