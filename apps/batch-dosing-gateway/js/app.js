/* Batch Dosing Gateway: the screens. */
(function () {
  "use strict";
  const K = KIT, { h, put, t, num } = K, S = SIM.S, SILOS = SIM.SILOS, RECIPES = SIM.RECIPES;
  const RECIPE = new Map(RECIPES.map((r) => [r.code, r]));
  const code = (s) => h("code", {}, s);
  const chip = (label, cls) => h("span", { class: "chip " + (cls || "") }, t(label));
  const kg = (v, d) => "\u2066" + num(v, d == null ? (Math.abs(v) < 100 ? 1 : 0) : d) + " kg\u2069";
  const tons = (v) => "\u2066" + num(v / 1000, 1) + " t\u2069";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const STATE_CLS = { IDLE: "grey", LOADED: "", DOSING: "", MIXING: "amber", DISCHARGE: "amber", DONE: "pine", HELD: "red" };
  const STATE_LABEL = { IDLE: "Idle", LOADED: "Recipe loaded", DOSING: "Dosing", MIXING: "Mixing", DISCHARGE: "Discharging", DONE: "Done, waiting for acknowledge", HELD: "Held" };
  const ORDER_CLS = { Received: "grey", Queued: "", Running: "amber", Done: "dawn", "Confirm pending": "dawn", Confirmed: "pine", Rejected: "red" };
  const ochip = (o) => chip(o.status, ORDER_CLS[o.status]);

  /* ---------- icons and shell ---------- */
  const I = {
    live: "M3 12h4l3-8 4 16 3-8h4",
    list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
    flask: "M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7 15h10",
    batch: "M4 7h16v12H4zM8 7V4h8v3M8 12h8",
    bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
    plug: "M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5",
    log: "M6 3h9l4 4v14H6zM9 10h7M9 14h7M9 18h4",
  };
  const icon = (d) => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, h("path", { d }));
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#e7a982"/><path d="M13 9h14v8l-7 7-7-7z" fill="#21414a"/><rect x="15" y="26" width="10" height="5" rx="1.5" fill="#21414a"/><path d="M20 24v2" stroke="#21414a" stroke-width="2"/><circle cx="20" cy="13.5" r="2.2" fill="#f1c09b"/></svg>';
  const ROUTES = [["live", "Live plant", I.live], ["orders", "Production orders", I.list], ["batches", "Batch records", I.batch], ["recipes", "Recipes", I.flask], ["alarms", "Alarms", I.bell], ["interface", "PLC interface", I.plug], ["log", "Communication log", I.log]];

  const side = h("aside", { class: "side" }), top = h("header", { class: "top" }), page = h("main", { class: "page" }), demo = h("div", { class: "demo-bar" });
  document.body.append(h("div", { class: "shell" }, side, h("div", { class: "main" }, demo, top, page)));
  document.addEventListener("click", (e) => { if (document.body.classList.contains("nav-open") && !e.target.closest(".side,.menu-btn")) document.body.classList.remove("nav-open"); });
  const route = () => { const r = location.hash.replace(/^#\/?/, "").split("?")[0]; return ROUTES.some((x) => x[0] === r) ? r : "live"; };
  const activeAlarms = () => S.alarms.filter((a) => a.active || !a.acked).length;

  function drawShell() {
    const cur = route();
    put(side,
      h("a", { class: "brand", href: "#/live", html: LOGO + `<div><b>${esc(t("Batch Dosing Gateway"))}</b><small>${esc(t("Feed mill, mixing line 1"))}</small></div>` }),
      h("nav", { "aria-label": t("Main menu") }, ROUTES.map(([id, label, ic]) => { const n = id === "alarms" ? activeAlarms() : 0; return h("a", { href: "#/" + id, "aria-current": id === cur ? "page" : null, onclick: () => document.body.classList.remove("nav-open") }, icon(ic), h("span", {}, t(label)), n ? h("span", { class: "count al-count" }, n) : h("span", { class: id === "alarms" ? "al-count" : "" })); })),
      h("div", { class: "foot" }, h("div", {}, t("Demo with a simulated PLC and ERP.")), h("div", {}, t("Built by"), " ", h("a", { href: "https://cictnardc.net", target: "_blank", rel: "noopener" }, "CICTNA RDC")),
        h("button", { class: "btn sm ghost", type: "button", style: "margin-top:10px;color:#dfe8e7;border-color:rgba(255,255,255,.2)", onclick: () => { location.hash = "#/live"; location.reload(); } }, t("Reset demo"))));
    const r = ROUTES.find((x) => x[0] === cur);
    put(top, h("button", { class: "menu-btn", type: "button", "aria-label": t("Menu"), onclick: () => document.body.classList.toggle("nav-open") }, "☰"),
      h("div", {}, h("h1", {}, t(r[1])), h("div", { class: "crumb" }, t("ERP orders in, PLC instructions out"))),
      h("div", { class: "grow" }), h("div", { class: "who link-pill", id: "linkPill" }), K.switcher());
    put(demo, t("Live simulation: orders arrive from the ERP, the gateway drives the dosing PLC and confirms each order. Try the fault buttons."), " ", h("a", { href: "https://cictnardc.net/portfolio/", target: "_blank", rel: "noopener" }, t("More apps by CICTNA RDC")));
    document.title = t(r[1]) + " | " + t("Batch Dosing Gateway") + " · CICTNA RDC";
  }
  function paintPill() {
    const el = document.getElementById("linkPill"); if (!el) return;
    const up = S.link.up && !S.link.retries;
    put(el, h("span", { class: "dot " + (up ? "pine pulse" : "red") }), h("span", { class: "nm" }, up ? t("PLC connected") : t("PLC link lost")), h("span", { class: "chip grey" }, S.proto === "modbus" ? "Modbus TCP" : "OPC UA"));
    document.querySelectorAll(".al-count").forEach((c) => { const n = activeAlarms(); c.textContent = n || ""; c.className = n ? "count al-count" : "al-count"; });
  }

  let current = null;           // { update() } of the page on screen
  function render() {
    drawShell(); paintPill();
    const r = route();
    current = PAGES[r]();
    put(page, current.el);
    window.scrollTo(0, 0);
  }
  const card = (title, body, extra, sub, cls) => h("section", { class: "card " + (cls || "") }, h("header", {}, h("h2", {}, title), h("div", { class: "grow" }), extra || null, sub ? h("p", {}, sub) : null), body);
  const PAGES = {};

  /* ---------- live plant ---------- */
  PAGES.live = function () {
    const seg = (opts, val, fn) => h("div", { class: "seg" }, opts.map(([v, l]) => h("button", { type: "button", "aria-pressed": String(v === val()), onclick: (e) => { fn(v); e.currentTarget.parentNode.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(opts[i][0] === val()))); } }, l)));
    const faultBtn = (labelOn, labelOff, is, fn) => { const b = h("button", { class: "btn sm", type: "button" }); const paint = () => { b.textContent = t(is() ? labelOff : labelOn); b.classList.toggle("danger", !is()); b.classList.toggle("primary", is()); }; b.onclick = () => { fn(!is()); paint(); }; paint(); return b; };
    const siloSel = K.select(SILOS.map((s) => [s.id, s.id + " · " + t(s.short)]), "S4");
    const controls = h("section", { class: "card controls" }, h("div", { class: "pad ctl" },
      h("div", { class: "ctl-g" }, h("span", { class: "lbl" }, t("Orders from ERP")), seg([[true, t("Automatic")], [false, t("Manual")]], () => S.auto, (v) => (S.auto = v)), h("button", { class: "btn sm primary", type: "button", onclick: orderDialog }, t("+ Send an order"))),
      h("div", { class: "ctl-g" }, h("span", { class: "lbl" }, t("Protocol")), seg([["modbus", "Modbus TCP"], ["opcua", "OPC UA"]], () => S.proto, SIM.setProto)),
      h("div", { class: "ctl-g" }, h("span", { class: "lbl" }, t("Speed")), seg([[1, "1×"], [4, "4×"]], () => S.speed, (v) => (S.speed = v))),
      h("div", { class: "ctl-g faults" }, h("span", { class: "lbl" }, t("Simulate a fault")),
        faultBtn("Pull the PLC cable", "Plug the cable back", () => S.link.cut, SIM.cutLink),
        faultBtn("Take the ERP offline", "Bring the ERP back", () => !S.erp.up, SIM.erpDown),
        faultBtn("Make the scale drift", "Recalibrate the scale", () => S.faults.drift, SIM.drift),
        h("span", { class: "silo-f" }, siloSel, h("button", { class: "btn sm danger", type: "button", onclick: () => SIM.emptySilo(siloSel.value) }, t("Empty")), h("button", { class: "btn sm", type: "button", onclick: () => SIM.refill(siloSel.value) }, t("Refill"))))));

    const kpiEls = {};
    const kpi = (id, label) => { kpiEls[id] = { b: h("b", {}), s: h("small", {}), el: null }; kpiEls[id].el = h("div", { class: "kpi" }, h("span", {}, t(label)), kpiEls[id].b, kpiEls[id].s); return kpiEls[id].el; };
    const kpis = h("div", { class: "kpis" }, kpi("link", "PLC link"), kpi("queue", "Orders waiting"), kpi("batches", "Batches today"), kpi("kg", "Produced today"), kpi("tol", "Batches in tolerance"), kpi("al", "Active alarms"));

    const mim = mimic();
    const cb = h("div", { class: "pad" });
    const holdBtn = h("button", { class: "btn sm", type: "button", onclick: SIM.hold });
    const batchCard = card(t("Current batch"), cb, holdBtn);
    const queue = h("ul", { class: "list" });
    const queueCard = card(t("Order queue"), queue, h("a", { class: "btn sm ghost", href: "#/orders" }, t("All orders")));
    const logBox = h("div", { class: "tlog" });
    let paused = false;
    const pauseBtn = h("button", { class: "btn sm ghost", type: "button", onclick: () => { paused = !paused; pauseBtn.textContent = t(paused ? "Resume" : "Pause"); } }, t("Pause"));
    const logCard = card(t("Telegrams"), logBox, pauseBtn, t("What the gateway writes to and reads from the PLC and the ERP, as it happens."));
    const el = h("div", { class: "grid", style: "gap:16px" }, controls, kpis, h("div", { class: "grid live-g" }, card(t("Mixing line 1"), mim.el, null, null, "mimic-card"), batchCard), h("div", { class: "grid g2" }, queueCard, logCard));

    let ver = -1, lver = -1;
    function update() {
      paintPill();
      const up = S.link.up && !S.link.retries;
      const today = S.batches.filter((b) => b.end > new Date().setHours(0, 0, 0, 0));
      const waiting = S.orders.filter((o) => o.status === "Queued" || o.status === "Running");
      const act = S.alarms.filter((a) => a.active).length;
      const set = (id, v, s, cls) => { kpiEls[id].b.textContent = v; kpiEls[id].s.textContent = s; kpiEls[id].el.className = "kpi " + (cls || ""); };
      set("link", up ? t("Connected") : t("Retrying"), up ? `${S.proto === "modbus" ? "Modbus TCP" : "OPC UA"} · ${t("heartbeat")} ${S.gw.hb}` : t("retry {0}, next in {1} s", S.link.retries, Math.max(0, Math.ceil(S.link.nextTry - S.t))), up ? "good" : "bad");
      set("queue", waiting.length, waiting.length ? waiting.reduce((a, o) => a + o.batches - o.done, 0) + " " + t("batches to go") : t("nothing waiting"));
      set("batches", today.length, tons(today.reduce((a, b) => a + b.kg, 0)));
      set("kg", tons(S.stats.kg), t("since the start of the shift"));
      set("tol", Math.round((S.stats.inTol / Math.max(1, S.stats.batches)) * 100) + "%", t("{0} of {1} batches", S.stats.inTol, S.stats.batches), S.stats.inTol < S.stats.batches ? "warn" : "good");
      set("al", act, act ? t("needs attention") : t("all clear"), act ? "bad" : "good");
      mim.update();
      paintBatch(cb);
      const canHold = S.plc.state === "DOSING" || (S.plc.state === "HELD" && S.plc.manual);
      holdBtn.hidden = !canHold; holdBtn.textContent = t(S.plc.state === "HELD" ? "Resume dosing" : "Hold dosing");
      if (ver !== S.ver) {
        ver = S.ver;
        put(queue, S.orders.filter((o) => ["Queued", "Running", "Done", "Confirm pending", "Rejected"].includes(o.status) || (o.status === "Confirmed" && Date.now() - o.confirmed < 60000)).slice(-7).reverse().map((o) => h("li", {},
          h("span", { class: "dot " + (o.status === "Running" ? "dawn pulse" : o.status === "Confirmed" ? "pine" : o.status === "Rejected" ? "red" : "") }),
          h("div", { class: "what" }, h("b", {}, o.id, " · ", o.recipe), h("small", {}, kg(o.qty, 0) + " · " + t("{0} of {1} batches", o.done, o.batches))),
          h("div", { class: "meter", style: "width:80px" }, h("i", { style: `width:${(o.done / o.batches) * 100}%` })), ochip(o))));
      }
      if (!paused && lver !== S.logVer) { lver = S.logVer; put(logBox, S.log.slice(-60).reverse().map(logLine)); }
    }
    update();
    return { el, update };
  }

  function logLine(l) {
    return h("div", { class: "tl " + l.ch.toLowerCase() + (l.dir === "×" ? " err" : "") },
      h("span", { class: "ts" }, K.time(l.ts)), h("span", { class: "ch" }, l.ch), h("span", { class: "dir" }, l.dir),
      h("span", { class: "tx" }, l.text, l.hex && l.ch === "PLC" ? h("span", { class: "hex" }, l.hex) : null));
  }

  function paintBatch(box) {
    const p = S.plc, g = S.gw, o = g.order;
    if (!o && p.state === "IDLE") { put(box, h("p", { class: "muted", style: "margin:0" }, t("Waiting for the next order from the ERP."))); return; }
    const r = RECIPE.get(o ? o.recipe : "") || {};
    put(box,
      h("div", { class: "cb-head" }, h("div", {}, h("b", {}, o ? o.id : "-"), " ", h("span", { class: "muted" }, r.name ? t(r.name) : ""), h("div", { class: "muted", style: "font-size:12.5px" }, t("Batch {0} of {1}", g.batchNo, o ? o.batches : "-"), " · ", t("id"), " ", h("span", { class: "num" }, p.batchId), " · ", kg(g.size || 0, 0))), h("div", { class: "grow" }), chip(STATE_LABEL[p.state], STATE_CLS[p.state])),
      h("div", { class: "doses" }, SILOS.filter((s) => (p.sp[s.id] || 0) > 0).map((s) => {
        const spv = p.sp[s.id], a = p.act[s.id] || 0, i = SILOS.indexOf(s) + 1, done = p.step > i || p.state !== "DOSING" && p.state !== "HELD" && p.state !== "LOADED", on = p.step === i && (p.state === "DOSING" || p.state === "HELD");
        const dev = spv ? ((a - spv) / spv) * 100 : 0, ok = Math.abs(dev) <= s.tol;
        return h("div", { class: "dose" + (on ? " on" : "") },
          h("span", { class: "sid num" }, s.id), h("span", { class: "nm" }, t(s.short)),
          h("div", { class: "meter" }, h("i", { class: done && !ok ? "full" : "", style: `width:${Math.min(100, (a / spv) * 100)}%` })),
          h("span", { class: "num v" }, num(a, spv < 100 ? 1 : 0), h("span", { class: "muted" }, " / " + num(spv, spv < 100 ? 1 : 0) + " kg")),
          h("span", { class: "dv" }, done ? h("span", { class: "chip " + (ok ? "pine" : "red") }, (dev >= 0 ? "+" : "") + num(dev, 2) + "%") : on ? h("span", { class: "chip amber" }, t(p.state === "HELD" ? "Held" : p.phase === "fine" ? "Fine feed" : "Coarse feed")) : h("span", { class: "muted" }, "±" + s.tol + "%")));
      })),
      p.state === "MIXING" ? h("p", { class: "muted", style: "margin:10px 0 0" }, t("Mixing, {0} s left", Math.max(0, Math.ceil(p.mixLeft)))) : null,
      null);
  }

  /** Plant picture: five silos and an oil tank over a weigh hopper and a mixer. */
  function mimic() {
    const W = 760, H = 380, ref = {};
    const svg = h("svg", { viewBox: `0 0 ${W} ${H}`, class: "mimic", role: "img", "aria-label": t("Mixing line 1") });
    svg.append(h("defs", {}, SILOS.map((s, i) => h("clipPath", { id: "cl" + i }, s.kind === "liquid" ? h("rect", { x: 0, y: 0, width: 92, height: 70, rx: 30 }) : h("path", { d: "M0 0h70v104l-22 26H22L0 104z" })))));
    const xs = [30, 140, 250, 360, 470];
    SILOS.forEach((s, i) => {
      const liquid = s.kind === "liquid";
      const x = liquid ? 610 : xs[i], y = liquid ? 76 : 44;
      const g = h("g", { transform: `translate(${x} ${y})`, class: "vessel" });
      const shape = liquid ? h("rect", { x: 0, y: 0, width: 92, height: 70, rx: 30, class: "shell" }) : h("path", { d: "M0 0h70v104l-22 26H22L0 104z", class: "shell" });
      const fill = h("rect", { x: 0, y: 0, width: 100, height: 140, class: "fill", "clip-path": `url(#cl${i})` });
      g.append(fill, shape,
        h("text", { x: liquid ? 46 : 35, y: -22, "text-anchor": "middle", class: "vid" }, s.id),
        ref["pct" + i] = h("text", { x: liquid ? 46 : 35, y: liquid ? 40 : 58, "text-anchor": "middle", class: "vpct" }, ""),
        ref["nm" + i] = h("text", { x: liquid ? 46 : 35, y: -8, "text-anchor": "middle", class: "vname" }, ""));
      ref["fill" + i] = fill; ref["g" + i] = g;
      svg.append(g);
      if (!liquid) {
        // feeder screw and drop to the collector
        const fx = x + 35;
        ref["feed" + i] = h("g", { class: "feeder" }, h("rect", { x: fx - 9, y: 178, width: 18, height: 12, rx: 3 }), h("path", { d: `M${fx} 190V214`, class: "pipe" }), h("path", { d: `M${fx} 190V214`, class: "flow" }));
        svg.append(ref["feed" + i]);
      }
    });
    svg.append(h("path", { d: "M65 214H505", class: "pipe" }), ref.collector = h("path", { d: "M65 214H505", class: "flow" }));
    svg.append(h("path", { d: "M300 214V236", class: "pipe" }), ref.drop = h("path", { d: "M300 214V236", class: "flow" }));
    // weigh hopper and scale
    svg.append(h("path", { d: "M250 236h100v34l-22 20h-56l-22-20z", class: "shell" }), ref.hopFill = h("rect", { x: 250, y: 236, width: 100, height: 0, class: "fill dry", "clip-path": "url(#hopClip)" }));
    svg.querySelector("defs").append(h("clipPath", { id: "hopClip" }, h("path", { d: "M250 236h100v34l-22 20h-56l-22-20z" })));
    svg.append(h("rect", { x: 362, y: 244, width: 108, height: 36, rx: 6, class: "disp" }), ref.scale = h("text", { x: 416, y: 268, "text-anchor": "middle", class: "dispt" }, "0.0"), h("text", { x: 416, y: 296, "text-anchor": "middle", class: "vname" }, "WT-101 kg"));
    // oil line with flowmeter
    svg.append(h("path", { d: "M656 146V320H540", class: "pipe" }), ref.oil = h("path", { d: "M656 146V320H540", class: "flow" }));
    svg.append(h("rect", { x: 632, y: 196, width: 48, height: 26, rx: 5, class: "disp" }), ref.flow = h("text", { x: 656, y: 214, "text-anchor": "middle", class: "dispt sm" }, "0.0"), h("text", { x: 700, y: 214, class: "vname", "text-anchor": "start" }, "FT-201"));
    // mixer
    svg.append(h("path", { d: "M300 290V304", class: "pipe" }), ref.toMix = h("path", { d: "M300 290V304", class: "flow" }));
    svg.append(h("rect", { x: 210, y: 304, width: 330, height: 52, rx: 26, class: "shell" }), ref.mixFill = h("rect", { x: 210, y: 304, width: 330, height: 52, rx: 26, class: "fill dry", opacity: "0" }));
    ref.paddle = h("g", { class: "paddle", style: "transform-origin:375px 330px" }, h("path", { d: "M375 312v36M357 330h36M362 317l26 26M388 317l-26 26", class: "pad" }));
    svg.append(ref.paddle, h("text", { x: 228, y: 336, class: "vname", "text-anchor": "start" }, "M-301"));
    // discharge
    svg.append(h("path", { d: "M540 340H600V366", class: "pipe" }), ref.out = h("path", { d: "M540 340H600V366", class: "flow" }), h("text", { x: 612, y: 368, class: "vname", "text-anchor": "start" }, t("to the finished feed bin")));
    ref.state = h("text", { x: 20, y: 368, class: "vstate" }, "");
    svg.append(ref.state);

    function update() {
      const p = S.plc;
      SILOS.forEach((s, i) => {
        const f = s.level / s.cap, liquid = s.kind === "liquid", hgt = liquid ? 70 : 130;
        ref["fill" + i].setAttribute("y", String(hgt * (1 - f))); ref["fill" + i].setAttribute("height", String(hgt * f + 2));
        ref["fill" + i].setAttribute("class", "fill " + (liquid ? "oil" : f < 0.08 ? "low" : "dry"));
        ref["pct" + i].textContent = Math.round(f * 100) + "%";
        ref["nm" + i].textContent = t(s.short);
        const on = p.cur === s.id && p.state === "DOSING";
        ref["g" + i].setAttribute("class", "vessel" + (on ? " on" : "") + (p.cur === s.id && p.state === "HELD" ? " held" : ""));
        if (ref["feed" + i]) ref["feed" + i].setAttribute("class", "feeder" + (on ? " on" : ""));
      });
      const dryOn = p.state === "DOSING" && p.cur && SILOS.find((s) => s.id === p.cur).kind !== "liquid";
      ref.collector.setAttribute("class", "flow" + (dryOn ? " on" : "")); ref.drop.setAttribute("class", "flow" + (dryOn ? " on" : ""));
      ref.oil.setAttribute("class", "flow oilf" + (p.state === "DOSING" && p.cur === "T1" ? " on" : ""));
      const toMix = p.state === "MIXING" && p.mixLeft > p.mixTime * 0.9 || p.state === "DISCHARGE";
      ref.toMix.setAttribute("class", "flow" + (toMix ? " on" : ""));
      ref.out.setAttribute("class", "flow" + (p.state === "DISCHARGE" ? " on" : ""));
      const inHopper = p.state === "DOSING" || p.state === "HELD" || p.state === "LOADED" ? p.scale : 0;
      const hf = Math.min(1, inHopper / SIM.MIXER);
      ref.hopFill.setAttribute("y", String(290 - 54 * hf)); ref.hopFill.setAttribute("height", String(54 * hf));
      ref.scale.textContent = num(inHopper, 1); ref.flow.textContent = num(p.cur === "T1" || p.state === "MIXING" ? p.act.T1 || 0 : 0, 1);
      ref.mixFill.setAttribute("opacity", p.state === "MIXING" ? "0.9" : p.state === "DISCHARGE" ? String(0.9 * (p.scale / Math.max(1, p.dis || 1))) : "0");
      ref.paddle.setAttribute("class", "paddle" + (p.state === "MIXING" || p.state === "DISCHARGE" ? " spin" : ""));
      ref.state.textContent = "PLC · " + t(STATE_LABEL[p.state]) + (p.fault ? " · " + t("fault") + " " + p.fault : "");
    }
    update();
    return { el: h("div", { class: "pad mimic-wrap" }, svg), update };
  }

  function orderDialog() {
    const r = K.select(RECIPES.map((x) => [x.code, x.code + " · " + t(x.name)]), "BRS-22");
    const q = h("input", { type: "number", min: "500", step: "500", value: "6000" });
    K.modal(t("Send a production order from the ERP"), h("div", { class: "form" },
      h("p", { class: "full muted", style: "margin:0" }, t("In a real plant the ERP posts this to the gateway's API, or drops a file in a shared folder. The gateway checks it, splits it into batches of up to {0} kg and queues it.", num(SIM.MIXER))),
      K.field(t("Recipe"), r), K.field(t("Quantity (kg)"), q)),
    [[t("Cancel"), null, "ghost"], [t("Send"), () => { const o = SIM.newOrder(r.value, Math.max(500, Number(q.value) || 0)); K.toast(o.status === "Rejected" ? t("{0} rejected by the gateway", o.id) : t("{0} received: {1} batches queued", o.id, o.batches), o.status === "Rejected" ? "bad" : "good"); }, "primary"]]);
  }

  /* ---------- orders ---------- */
  PAGES.orders = function () {
    const tb = K.table({
      id: "orders", csvName: "production-orders", rowKey: (o) => o.id, rows: () => S.orders.slice().reverse(),
      search: (o) => [o.id, o.recipe, o.status].join(" "),
      rowClass: (o) => (o.status === "Rejected" ? "bad" : o.issues.length ? "warn" : ""),
      filters: [{ label: "Any status", options: () => ["Queued", "Running", "Confirm pending", "Confirmed", "Rejected"].map((x) => [x, x]), test: (o, v) => o.status === v }],
      cols: [
        { key: "id", label: "Order", render: (o) => code(o.id) },
        { key: "recipe", label: "Recipe", render: (o) => h("span", {}, code(o.recipe), " ", h("span", { class: "muted" }, t((RECIPE.get(o.recipe) || {}).name || ""))), text: (o) => o.recipe },
        { key: "qty", label: "Ordered", num: true, text: (o) => kg(o.qty, 0) },
        { key: "kg", label: "Produced", num: true, text: (o) => (o.kg ? kg(o.kg, 0) : "") },
        { key: "b", label: "Batches", sort: (o) => o.done / o.batches, text: (o) => o.done + "/" + o.batches, render: (o) => h("div", { style: "display:flex;gap:8px;align-items:center" }, h("div", { class: "meter" }, h("i", { style: `width:${(o.done / o.batches) * 100}%` })), h("span", { class: "num muted" }, o.done + "/" + o.batches)) },
        { key: "received", label: "Received", text: (o) => K.dateTime(o.received) },
        { key: "status", label: "Status", text: (o) => t(o.status), render: (o) => [ochip(o), o.issues.length ? [" ", h("span", { class: "chip dawn", title: o.issues.map(([k, a]) => t(k, ...a)).join("; ") }, "!")] : null] },
      ],
      actions: (o) => h("button", { class: "btn sm", type: "button", onclick: () => orderDetail(o) }, t("Details")),
    });
    let ver = S.ver, last = 0;
    return { el: h("div", { class: "grid" }, h("p", { class: "lede" }, t("Every order the ERP sent, what the gateway made of it and what it confirmed back. Open an order to see both messages.")), card(t("Production orders"), tb.el, h("button", { class: "btn sm primary", type: "button", onclick: orderDialog }, t("+ Send an order")))),
      update() { paintPill(); if (ver !== S.ver && Date.now() - last > 1500 && !document.querySelector(".modal")) { ver = S.ver; last = Date.now(); tb.refresh(); } } };
  };
  function orderDetail(o) {
    const pre = (obj) => h("pre", { class: "json" }, JSON.stringify(obj, null, 2));
    const bs = S.batches.filter((b) => b.order === o.id).slice().reverse();
    K.modal(o.id + " · " + o.recipe, h("div", { class: "grid", style: "gap:14px" },
      h("dl", { class: "kv" }, h("dt", {}, t("Status")), h("dd", {}, ochip(o)), h("dt", {}, t("Recipe")), h("dd", {}, t((RECIPE.get(o.recipe) || {}).name || "")), h("dt", {}, t("Ordered")), h("dd", {}, kg(o.qty, 0)), h("dt", {}, t("Produced")), h("dd", {}, kg(o.kg, 1)),
        o.issues.length ? [h("dt", {}, t("Checks")), h("dd", {}, o.issues.map(([k, a]) => t(k, ...a)).join("; "))] : null),
      h("div", { class: "grid g2" }, h("div", {}, h("h4", { class: "mini" }, t("Received from the ERP")), pre(o.payload)), h("div", {}, h("h4", { class: "mini" }, t("Confirmed to the ERP")), o.confirmation ? pre(o.confirmation) : h("p", { class: "muted" }, t("Sent when the last batch is done.")))),
      bs.length ? h("div", {}, h("h4", { class: "mini" }, t("Batches")), h("div", { class: "scroll" }, h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, ["Batch", "Dosed", "Finished", "Result"].map((c, i) => h("th", { class: i === 1 ? "n" : "" }, t(c))))),
        h("tbody", {}, bs.map((b) => h("tr", {}, h("td", {}, code(String(b.id)), " ", h("span", { class: "muted" }, b.no + "/" + b.of)), h("td", { class: "n" }, kg(b.kg, 1)), h("td", {}, K.dateTime(b.end)), h("td", {}, chip(b.ok ? "In tolerance" : "Out of tolerance", b.ok ? "pine" : "red")))))))) : null), null, true);
  }

  /* ---------- batches ---------- */
  PAGES.batches = function () {
    const tb = K.table({
      id: "batches", csvName: "batch-records", rowKey: (b) => b.id, rows: () => S.batches,
      search: (b) => [b.id, b.order, b.recipe].join(" "), rowClass: (b) => (b.ok ? "" : "bad"),
      filters: [{ label: "All results", options: () => [["ok", "In tolerance"], ["bad", "Out of tolerance"]], test: (b, v) => (v === "ok") === b.ok }, { label: "All recipes", options: () => RECIPES.map((r) => [r.code, r.code]), test: (b, v) => b.recipe === v }],
      cols: [
        { key: "id", label: "Batch", render: (b) => code(String(b.id)) }, { key: "order", label: "Order", render: (b) => h("span", {}, code(b.order), " ", h("span", { class: "muted" }, b.no + "/" + b.of)) },
        { key: "recipe", label: "Recipe", render: (b) => code(b.recipe) },
        { key: "size", label: "Target", num: true, text: (b) => kg(b.size, 0) }, { key: "kg", label: "Dosed", num: true, text: (b) => kg(b.kg, 1) },
        { key: "worst", label: "Largest deviation", num: true, sort: (b) => Math.max(...b.lines.map((l) => Math.abs(l.dev))), text: (b) => { const w = b.lines.reduce((a, l) => (Math.abs(l.dev) > Math.abs(a.dev) ? l : a), b.lines[0]); return w.silo + " " + (w.dev >= 0 ? "+" : "") + num(w.dev, 2) + "%"; } },
        { key: "end", label: "Finished", text: (b) => K.dateTime(b.end) },
        { key: "ok", label: "Result", text: (b) => t(b.ok ? "In tolerance" : "Out of tolerance"), render: (b) => chip(b.ok ? "In tolerance" : "Out of tolerance", b.ok ? "pine" : "red") },
      ],
      actions: (b) => h("button", { class: "btn sm", type: "button", onclick: () => batchDetail(b) }, t("Details")),
    });
    let n = S.batches.length;
    return { el: h("div", { class: "grid" }, h("p", { class: "lede" }, t("One record per batch: what was asked of each silo, what the scale and the flowmeter measured, and whether it stayed within the recipe's tolerance. This is the traceability a feed or food plant has to keep.")), card(t("Batch records"), tb.el)),
      update() { paintPill(); if (S.batches.length !== n && !document.querySelector(".modal")) { n = S.batches.length; tb.refresh(); } } };
  };
  function batchDetail(b) {
    K.modal(t("Batch {0}", b.id), h("div", {},
      h("dl", { class: "kv", style: "margin-bottom:12px" }, h("dt", {}, t("Order")), h("dd", {}, code(b.order), " · " + b.no + "/" + b.of), h("dt", {}, t("Recipe")), h("dd", {}, t(RECIPE.get(b.recipe).name)), h("dt", {}, t("Finished")), h("dd", {}, K.dateTime(b.end))),
      h("div", { class: "scroll" }, h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, ["Silo", "Ingredient", "Setpoint", "Dosed", "Deviation", "Tolerance", ""].map((c, i) => h("th", { class: i >= 2 && i <= 5 ? "n" : "" }, c ? t(c) : "")))),
        h("tbody", {}, b.lines.map((l) => { const s = SILOS.find((x) => x.id === l.silo); return h("tr", { class: l.ok ? "" : "bad" }, h("td", {}, code(l.silo)), h("td", {}, t(s.name)), h("td", { class: "n" }, kg(l.sp, 1)), h("td", { class: "n" }, kg(l.act, 1)), h("td", { class: "n" }, (l.dev >= 0 ? "+" : "") + num(l.dev, 2) + "%"), h("td", { class: "n" }, "±" + s.tol + "%"), h("td", {}, chip(l.ok ? "OK" : "Out", l.ok ? "pine" : "red"))); }))))), null, true);
  }

  /* ---------- recipes ---------- */
  PAGES.recipes = function () {
    const el = h("div", { class: "grid" }, h("p", { class: "lede" }, t("Recipes as the plant's quality team keeps them: share of each ingredient, mixing time and the tolerance each silo is held to. The gateway turns them into kilograms for every batch.")),
      h("div", { class: "grid g2" }, RECIPES.map((r) => card(r.code + " · " + t(r.name), h("div", { class: "scroll" }, h("table", { class: "tbl" },
        h("thead", {}, h("tr", {}, ["Silo", "Ingredient", "Share", "Per batch", "Tolerance"].map((c, i) => h("th", { class: i >= 2 ? "n" : "" }, t(c))))),
        h("tbody", {}, SILOS.filter((s) => r.parts[s.id]).map((s) => h("tr", {}, h("td", {}, code(s.id)), h("td", {}, t(s.name)), h("td", { class: "n" }, num(r.parts[s.id], 1) + "%"), h("td", { class: "n" }, kg((SIM.MIXER * r.parts[s.id]) / 100, 0)), h("td", { class: "n" }, "±" + s.tol + "%")))),
        h("tfoot", {}, h("tr", {}, h("td", { colspan: "2" }, t("Mixing time {0} s · PLC recipe number {1}", r.mix, r.num)), h("td", { class: "n" }, "100%"), h("td", { class: "n" }, kg(SIM.MIXER, 0)), h("td", {}))))),
        h("button", { class: "btn sm", type: "button", onclick: () => { const o = SIM.newOrder(r.code, 4000); K.toast(t("{0} received: {1} batches queued", o.id, o.batches), "good"); } }, t("Order 4 t"))))));
    return { el, update: paintPill };
  };

  /* ---------- alarms ---------- */
  PAGES.alarms = function () {
    const sevCls = { high: "red", medium: "dawn", low: "amber" };
    const tb = K.table({
      id: "alarms", csvName: "alarms", rowKey: (a) => a.id, rows: () => S.alarms, sortBy: "ts", sortDir: -1,
      search: (a) => t(a.key, ...a.args) + " " + a.src, rowClass: (a) => (a.active ? "bad" : !a.acked ? "warn" : "dim"),
      filters: [{ label: "All alarms", options: () => [["active", "Active"], ["unack", "Not acknowledged"], ["hist", "Cleared"]], test: (a, v) => (v === "active" ? a.active : v === "unack" ? !a.acked : !a.active) }],
      cols: [
        { key: "ts", label: "Raised", text: (a) => K.dateTime(a.ts) }, { key: "sev", label: "Severity", text: (a) => t(a.sev), render: (a) => chip(a.sev, sevCls[a.sev]) },
        { key: "src", label: "Source", text: (a) => t(a.src) }, { key: "text", label: "Alarm", cls: "wrap", text: (a) => t(a.key, ...a.args) },
        { key: "state", label: "State", text: (a) => t(a.active ? "Active" : "Cleared"), render: (a) => [chip(a.active ? "Active" : "Cleared", a.active ? "red" : "grey"), " ", a.acked ? chip("Acknowledged", "pine") : null] },
        { key: "cleared", label: "Cleared at", text: (a) => (a.cleared ? K.dateTime(a.cleared) : "") },
      ],
      actions: (a) => (!a.acked ? h("button", { class: "btn sm", type: "button", onclick: () => { SIM.ack(a.id); tb.refresh(); paintPill(); } }, t("Acknowledge")) : null),
    });
    let v = S.alarmVer;
    return { el: h("div", { class: "grid" }, h("p", { class: "lede" }, t("Raised by the gateway (lost link, ERP not reachable), by the PLC (low level) and by the quality check on every batch. Use the fault buttons on the live page to raise some.")),
      card(t("Alarms"), tb.el, h("button", { class: "btn sm", type: "button", onclick: () => { SIM.ack(); tb.refresh(); paintPill(); } }, t("Acknowledge all")))),
      update() { paintPill(); if (v !== S.alarmVer) { v = S.alarmVer; tb.refresh(); } } };
  };

  /* ---------- interface ---------- */
  PAGES.interface = function () {
    const steps = ["The ERP posts a production order. The gateway checks the recipe, the quantity and the silo levels, splits the order into batches and queues it.",
      "When the PLC reports Ready, the gateway writes the batch id, recipe number, mixing time and one setpoint per silo, then the Load command.",
      "The PLC answers Loaded. The gateway sends Start and polls the status word every 2 seconds.",
      "The PLC doses silo by silo, coarse then fine feed, mixes and discharges, then raises Done.",
      "The gateway reads the dosed quantities, books the batch under its id (never twice), checks each line against its tolerance and sends Acknowledge.",
      "After the last batch the gateway confirms the order to the ERP. If the ERP is down the confirmation waits in an outbox and is retried.",
      "If the PLC stops answering, the gateway retries after 1, 2, 4 then 8 seconds. The PLC finishes the batch on its own, and the gateway picks up the results when the link is back."];
    const tb = K.table({
      id: "tags", csvName: "plc-tag-map", rowKey: (x) => x.reg, rows: () => SIM.TAGS, pageSize: 40,
      cols: [
        { key: "name", label: "Signal", text: (x) => x.name }, { key: "dir", label: "Direction", text: (x) => (x.dir === "W" ? t("Gateway → PLC") : t("PLC → gateway")) },
        { key: "reg", label: "Modbus register", render: (x) => code(String(x.reg)) }, { key: "node", label: "OPC UA node", render: (x) => code("ns=2;s=" + x.node) },
        { key: "type", label: "Type", render: (x) => code(x.type) }, { key: "note", label: "Meaning", cls: "wrap" },
      ],
    });
    const el = h("div", { class: "grid" },
      h("div", { class: "grid g3" },
        card(t("Dosing PLC"), h("div", { class: "pad" }, h("dl", { class: "kv" }, h("dt", {}, "Modbus TCP"), h("dd", {}, code(SIM.PLC_EP.modbus)), h("dt", {}, "OPC UA"), h("dd", {}, code(SIM.PLC_EP.opcua)), h("dt", {}, t("Poll")), h("dd", {}, t("every 2 s, timeout 1500 ms")), h("dt", {}, t("Heartbeat")), h("dd", {}, t("both ways, every second"))))),
        card("ERP", h("div", { class: "pad" }, h("dl", { class: "kv" }, h("dt", {}, t("Orders in")), h("dd", {}, code("POST /orders")), h("dt", {}, t("Confirmations out")), h("dd", {}, code("POST " + SIM.ERP_EP + "/production-confirmations")), h("dt", {}, t("Format")), h("dd", {}, t("JSON over HTTPS, or CSV files in a shared folder"))))),
        card(t("Why a gateway"), h("div", { class: "pad" }, h("p", { style: "margin:0" }, t("The ERP thinks in orders and kilograms; the PLC thinks in registers and bits. The gateway is the translator in between, and the one place that keeps the record of what was asked and what was done."))))),
      card(t("Handshake, batch by batch"), h("ol", { class: "steps" }, steps.map((s) => h("li", {}, t(s))))),
      card(t("Tag map"), tb.el, null, t("The same signals over Modbus TCP (holding registers, floats as two registers, big-endian) or OPC UA (one node per signal). Switch the protocol on the live page.")));
    return { el, update: paintPill };
  };

  /* ---------- log ---------- */
  PAGES.log = function () {
    const tb = K.table({
      id: "log", csvName: "communication-log", rowKey: (l) => l.ts + l.text, rows: () => S.log.slice().reverse(), pageSize: 50,
      search: (l) => l.text + " " + l.hex, rowClass: (l) => (l.dir === "×" ? "bad" : ""),
      filters: [{ label: "All channels", options: () => [["PLC", "PLC"], ["ERP", "ERP"]], test: (l, v) => l.ch === v }],
      cols: [
        { key: "ts", label: "Time", text: (l) => K.time(l.ts) }, { key: "ch", label: "Channel", render: (l) => chip(l.ch, l.ch === "PLC" ? "" : "dawn") },
        { key: "dir", label: "Direction", text: (l) => ({ "→": t("Sent"), "←": t("Received"), "×": t("Failed"), "·": t("Info") }[l.dir]) },
        { key: "text", label: "Message", cls: "wrap mono-s" }, { key: "hex", label: "Frame", cls: "wrap mono-s", text: (l) => (l.hex && l.ch === "PLC" ? l.hex : "") },
      ],
    });
    let v = S.logVer, last = 0, paused = false;
    const btn = h("button", { class: "btn sm ghost", type: "button", onclick: () => { paused = !paused; btn.textContent = t(paused ? "Resume" : "Pause"); } }, t("Pause"));
    return { el: h("div", { class: "grid" }, card(t("Communication log"), tb.el, btn, t("The last 500 messages. Modbus frames are shown byte by byte, as they go over the wire."))),
      update() { paintPill(); if (!paused && v !== S.logVer && Date.now() - last > 2000) { v = S.logVer; last = Date.now(); tb.refresh(); } } };
  };

  /* ---------- start ---------- */
  let lastPaint = 0;
  SIM.onTick(() => { const n = Date.now(); if (n - lastPaint < 240 || !current) return; lastPaint = n; current.update(); });
  window.addEventListener("hashchange", render);
  K.onChange(render);
  render();
})();
