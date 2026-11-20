/* Batch Dosing Gateway: the simulation. A gateway takes production orders from the ERP, turns each batch into
   recipe setpoints, writes them to the dosing PLC (Modbus TCP or OPC UA), follows the batch through the PLC's
   handshake, reads back the dosed quantities and confirms the order to the ERP. The PLC and the plant are simulated.
   All names and figures are invented. */
(function () {
  "use strict";
  const R = KIT.rng(4207);
  const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  const SILOS = [
    { id: "S1", name: "Maize, ground", short: "Maize", cap: 30000, level: 21400, tol: 1.0, rate: 260, kind: "dry" },
    { id: "S2", name: "Soybean meal 46%", short: "Soybean meal", cap: 20000, level: 13800, tol: 1.0, rate: 200, kind: "dry" },
    { id: "S3", name: "Wheat bran", short: "Wheat bran", cap: 15000, level: 9100, tol: 1.5, rate: 140, kind: "dry" },
    { id: "S4", name: "Limestone, fine", short: "Limestone", cap: 8000, level: 5200, tol: 1.0, rate: 90, kind: "dry" },
    { id: "S5", name: "Vitamin and mineral premix", short: "Premix", cap: 2000, level: 1240, tol: 0.5, rate: 18, kind: "micro" },
    { id: "T1", name: "Soybean oil", short: "Oil", cap: 5000, level: 3600, tol: 2.0, rate: 22, kind: "liquid" },
  ];
  const RECIPES = [
    { code: "LAY-16", num: 101, name: "Layer feed, 16% protein", mix: 90, parts: { S1: 58, S2: 24, S3: 6, S4: 9, S5: 2.5, T1: 0.5 } },
    { code: "BRS-22", num: 102, name: "Broiler starter, 22% protein", mix: 120, parts: { S1: 55, S2: 35, S3: 3, S4: 1.5, S5: 2.5, T1: 3 } },
    { code: "BRF-19", num: 103, name: "Broiler finisher, 19% protein", mix: 120, parts: { S1: 62, S2: 28, S3: 2.5, S4: 1.5, S5: 2, T1: 4 } },
    { code: "DRY-14", num: 104, name: "Dairy concentrate, 14% protein", mix: 90, parts: { S1: 45, S2: 18, S3: 30, S4: 3, S5: 3, T1: 1 } },
  ];
  const MIXER = 2000;            // kg per batch
  const PLC_EP = { modbus: "192.168.20.11:502 · unit 1", opcua: "opc.tcp://192.168.20.11:4840" };
  const ERP_EP = "https://erp.example/api/v1";

  /* ---------- PLC interface (one table, two protocols) ---------- */
  const TAGS = [
    { name: "Heartbeat (gateway)", reg: 40001, type: "UINT16", dir: "W", node: "Doser.GwHeartbeat", note: "Counts up every second. If it stops, the PLC finishes the batch in progress and waits." },
    { name: "Heartbeat (PLC)", reg: 40002, type: "UINT16", dir: "R", node: "Doser.PlcHeartbeat", note: "Counts up every second." },
    { name: "Command", reg: 40010, type: "UINT16", dir: "W", node: "Doser.Command", note: "1 Load, 2 Start, 3 Hold, 4 Acknowledge, 5 Abort" },
    { name: "Status word", reg: 40011, type: "UINT16", dir: "R", node: "Doser.Status", note: "bit 0 Ready, 1 Loaded, 2 Dosing, 3 Mixing, 4 Done, 5 Held, 6 Fault" },
    { name: "Batch id", reg: 40012, type: "UINT32", dir: "W", node: "Doser.BatchId", note: "Echoed back with the results, so a batch is never booked twice." },
    { name: "Recipe number", reg: 40014, type: "UINT16", dir: "W", node: "Doser.Recipe", note: "" },
    { name: "Mixing time (s)", reg: 40015, type: "UINT16", dir: "W", node: "Doser.MixTime", note: "" },
  ].concat(SILOS.map((s, i) => ({ name: `Setpoint ${s.id} (kg)`, reg: 40020 + i * 2, type: "FLOAT32", dir: "W", node: `Doser.Setpoint[${i + 1}]`, note: s.name })))
    .concat(SILOS.map((s, i) => ({ name: `Dosed ${s.id} (kg)`, reg: 40040 + i * 2, type: "FLOAT32", dir: "R", node: `Doser.Actual[${i + 1}]`, note: s.name })))
    .concat([{ name: "Active step", reg: 40060, type: "UINT16", dir: "R", node: "Doser.Step", note: "0 idle, 1 to 6 dosing a silo, 7 mixing, 8 discharging" },
      { name: "Fault code", reg: 40061, type: "UINT16", dir: "R", node: "Doser.FaultCode", note: "0 none, 11 low level, 12 scale fault, 13 gate jam" }]);

  const S = {
    t: 0, speed: 1, auto: true, proto: "modbus", ver: 0, logVer: 0, alarmVer: 0,
    silos: SILOS, recipes: RECIPES, orders: [], batches: [], alarms: [], log: [],
    plc: { state: "IDLE", step: 0, batchId: 0, sp: {}, act: {}, scale: 0, flow: 0, mixLeft: 0, phase: "", cur: null, hb: 0, fault: 0 },
    gw: { phase: "idle", wait: 0, order: null, batchNo: 0, hb: 0, tid: 1 },
    link: { up: true, cut: false, retries: 0, backoff: 0, nextTry: 0, lastOk: 0, lat: 6 },
    erp: { up: true, pending: [] },
    faults: { drift: false },
    stats: { kg: 0, batches: 0, inTol: 0 },
    nextOrder: 4, nextBatch: 26110340, seq: 3108, alarmSeq: 1,
  };
  const subs = [];
  const bump = (what) => { S.ver++; if (what === "log") S.logVer++; if (what === "alarm") S.alarmVer++; };

  /* ---------- log and alarms ---------- */
  function log(ch, dir, text, hex) {
    S.log.push({ ts: Date.now(), ch, dir, text, hex: hex || "" });
    if (S.log.length > 500) S.log.splice(0, S.log.length - 500);
    bump("log");
  }
  function alarm(code, sev, key, args, src) {
    if (S.alarms.some((a) => a.code === code && a.active)) return;
    S.alarms.unshift({ id: S.alarmSeq++, code, sev, key, args: args || [], src, ts: Date.now(), active: true, acked: false, cleared: 0 });
    bump("alarm");
  }
  function clear(code) { S.alarms.forEach((a) => { if (a.code === code && a.active) { a.active = false; a.cleared = Date.now(); } }); bump("alarm"); }

  /* ---------- telegram formatting ---------- */
  const hx = (n, b) => n.toString(16).toUpperCase().padStart(b * 2, "0");
  const f32 = (v) => { const d = new DataView(new ArrayBuffer(4)); d.setFloat32(0, v); return hx(d.getUint32(0), 4); };
  const sp = (s) => s.match(/.{1,2}/g).join(" ");
  function mbWrite(addr, words) {           // FC16 write multiple registers
    const tid = S.gw.tid++ & 0xffff, data = words.join(""), n = data.length / 4;
    const pdu = "10" + hx(addr - 40001, 2) + hx(n, 2) + hx(n * 2, 1) + data;
    return sp(hx(tid, 2) + "0000" + hx(pdu.length / 2 + 1, 2) + "01" + pdu);
  }
  function mbRead(addr, n) {                // FC03 read holding registers
    const tid = S.gw.tid++ & 0xffff;
    return sp(hx(tid, 2) + "0000" + "0006" + "01" + "03" + hx(addr - 40001, 2) + hx(n, 2));
  }
  const u16 = (v) => hx(v & 0xffff, 2);
  function plcWrite(what, addr, words, opc) {
    if (S.proto === "modbus") log("PLC", "→", `${what} · FC16 ${addr}..${addr + words.join("").length / 4 - 1}`, mbWrite(addr, words));
    else log("PLC", "→", `${what} · Write ${opc}`);
  }
  function plcRead(what, addr, n, result, opc) {
    if (S.proto === "modbus") { log("PLC", "→", `${what} · FC03 ${addr} ×${n}`, mbRead(addr, n)); log("PLC", "←", result); }
    else { log("PLC", "→", `${what} · Read ${opc}`); log("PLC", "←", result); }
  }

  /* ---------- orders from the ERP ---------- */
  function newOrder(recipeCode, qty, quiet) {
    const r = RECIPES.find((x) => x.code === recipeCode) || RECIPES[Math.floor(R() * RECIPES.length)];
    qty = qty || [4000, 6000, 8000, 10000][Math.floor(R() * 4)];
    const id = `MO-26-${S.seq++}`;
    const payload = { orderId: id, material: `FG-${r.code}`, recipe: r.code, quantity: qty, unit: "kg", line: "Mixing line 1", due: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16) + "Z" };
    const o = { id, recipe: r.code, qty, batches: Math.ceil(qty / MIXER), done: 0, status: "Received", received: Date.now(), payload, kg: 0, issues: [] };
    S.orders.push(o);
    log("ERP", "←", `POST /orders ${id} · ${r.code} · ${qty} kg`, JSON.stringify(payload));
    // validation
    const need = {}; Object.entries(r.parts).forEach(([k, pct]) => (need[k] = (qty * pct) / 100));
    const low = SILOS.filter((s) => need[s.id] > s.level);
    if (qty > 40000) { o.status = "Rejected"; o.issues.push(["Quantity above the daily capacity of the line", []]); log("ERP", "→", `422 ${id} rejected: quantity above line capacity`); }
    else {
      o.status = "Queued";
      if (low.length) { o.issues.push(["Not enough in {0} for the whole order", [low.map((s) => s.id).join(", ")]]); }
      log("ERP", "→", `202 Accepted ${id} · ${o.batches} batches of ${Math.round(qty / o.batches)} kg`);
    }
    bump();
    if (!quiet) emit("order", o);
    return o;
  }

  /* ---------- gateway ---------- */
  function linkOk() { return S.link.up; }
  function linkFail(what) {
    S.link.retries++;
    S.link.backoff = Math.min(8, S.link.backoff ? S.link.backoff * 2 : 1);
    S.link.nextTry = S.t + S.link.backoff;
    log("PLC", "×", `${what}: no answer within 1500 ms, retry ${S.link.retries} in ${S.link.backoff} s`);
    if (S.link.retries >= 2) alarm("LINK", "high", "PLC link lost, retrying", [], "Gateway");
  }
  function linkBack() {
    if (S.link.retries) { log("PLC", "·", `Link restored after ${S.link.retries} retries, reading PLC state to resynchronise`); clear("LINK"); }
    S.link.retries = 0; S.link.backoff = 0; S.link.lastOk = S.t;
  }
  function statusWord() {
    const p = S.plc;
    return (p.state === "IDLE" ? 1 : 0) | (p.state === "LOADED" ? 2 : 0) | (p.state === "DOSING" ? 4 : 0) | (p.state === "MIXING" || p.state === "DISCHARGE" ? 8 : 0) | (p.state === "DONE" ? 16 : 0) | (p.state === "HELD" ? 32 : 0);
  }
  /** One gateway step. Called every 0.25 s of plant time. */
  function gateway() {
    const g = S.gw;
    if (S.t < S.link.nextTry) return;
    if (g.wait > S.t) return;
    if (!linkOk()) { if (g.phase !== "idle" || S.orders.some((o) => o.status === "Queued")) linkFail(g.phase === "monitor" ? "Status poll" : "Write"); return; }
    if (S.link.retries) { linkBack(); if (g.phase === "monitor" || g.phase === "load") { g.phase = "monitor"; } }

    if (g.phase === "idle") {
      const o = S.orders.find((x) => x.status === "Queued" || x.status === "Running");
      if (!o) return;
      if (S.plc.state !== "IDLE") return;
      const r = RECIPES.find((x) => x.code === o.recipe);
      const left = o.qty - o.kg, size = Math.min(MIXER, Math.round(left / (o.batches - o.done)));
      const setp = {}; SILOS.forEach((s) => (setp[s.id] = Math.round(((size * (r.parts[s.id] || 0)) / 100) * 10) / 10));
      g.order = o; g.batchNo = o.done + 1; g.size = size; g.setp = setp; g.batchId = S.nextBatch++;
      o.status = "Running";
      log("PLC", "·", `${o.id} batch ${g.batchNo}/${o.batches}: ${size} kg of ${r.code} → setpoints`);
      plcWrite(`Batch ${g.batchId}, recipe ${r.num}, mix ${r.mix} s`, 40012, [hx(g.batchId, 4), u16(r.num), u16(r.mix)], `BatchId=${g.batchId}, Recipe=${r.num}, MixTime=${r.mix}`);
      plcWrite("Setpoints " + SILOS.map((s) => s.id + "=" + setp[s.id]).join(" "), 40020, SILOS.map((s) => f32(setp[s.id])), "Setpoint[1..6] = [" + SILOS.map((s) => setp[s.id]).join(", ") + "]");
      plcWrite("Command LOAD", 40010, [u16(1)], "Command=1 (Load)");
      plc.load(g.batchId, setp, r.mix);
      g.phase = "start"; g.wait = S.t + 0.6; bump();
    } else if (g.phase === "start") {
      if (S.plc.state !== "LOADED") return;
      plcRead("Status", 40011, 1, `Status 0x${u16(statusWord())} Loaded`, "Doser.Status");
      plcWrite("Command START", 40010, [u16(2)], "Command=2 (Start)");
      plc.start();
      g.phase = "monitor"; g.wait = S.t + 1; bump();
    } else if (g.phase === "monitor") {
      const st = S.plc.state;
      plcRead("Status", 40011, 2, `Status 0x${u16(statusWord())} ${st[0] + st.slice(1).toLowerCase()}, step ${S.plc.step}${S.plc.fault ? ", fault " + S.plc.fault : ""}`, "Doser.Status, Doser.Step");
      if (st === "DONE") g.phase = "collect";
      g.wait = S.t + (st === "DONE" ? 0.3 : 2);
    } else if (g.phase === "collect") {
      const p = S.plc;
      if (S.batches.some((b) => b.id === p.batchId)) { log("PLC", "·", `Batch ${p.batchId} already booked, results ignored`); }
      else {
        plcRead("Dosed quantities", 40040, 12, "Dosed " + SILOS.map((s) => s.id + "=" + p.act[s.id].toFixed(1)).join(" "), "Doser.Actual[1..6]");
        const o = g.order;
        const lines = SILOS.filter((s) => g.setp[s.id] > 0).map((s) => { const spv = g.setp[s.id], a = p.act[s.id], dev = spv ? ((a - spv) / spv) * 100 : 0; return { silo: s.id, sp: spv, act: a, dev, ok: Math.abs(dev) <= s.tol }; });
        const ok = lines.every((l) => l.ok), kg = lines.reduce((a, l) => a + l.act, 0);
        S.batches.unshift({ id: p.batchId, order: o.id, recipe: o.recipe, no: g.batchNo, of: o.batches, start: p.started, end: Date.now(), size: g.size, kg, lines, ok });
        o.done++; o.kg += kg; S.stats.kg += kg; S.stats.batches++; if (ok) S.stats.inTol++;
        if (!ok) alarm("TOL" + p.batchId, "medium", "Batch {0}: {1} outside tolerance, held for quality check", [p.batchId, lines.filter((l) => !l.ok).map((l) => l.silo).join(", ")], "Quality");
        if (o.done >= o.batches) { o.status = "Done"; S.erp.pending.push(o.id); }
      }
      plcWrite("Command ACKNOWLEDGE", 40010, [u16(4)], "Command=4 (Acknowledge)");
      plc.ack();
      g.phase = "idle"; g.order = null; g.wait = S.t + 1; bump();
    }
  }
  function erpStep() {
    if (!S.erp.pending.length || S.erp.nextTry > S.t) return;
    const id = S.erp.pending[0], o = S.orders.find((x) => x.id === id);
    const body = { orderId: o.id, recipe: o.recipe, quantityProduced: Math.round(o.kg * 10) / 10, unit: "kg", batches: S.batches.filter((b) => b.order === o.id).map((b) => ({ batchId: b.id, kg: Math.round(b.kg * 10) / 10, inTolerance: b.ok })), finished: new Date().toISOString() };
    o.confirmation = body;
    log("ERP", "→", `POST /production-confirmations ${o.id} · ${Math.round(o.kg)} kg`, JSON.stringify(body));
    if (!S.erp.up) { log("ERP", "×", "503 Service Unavailable, kept in the outbox, retry in 10 s"); o.status = "Confirm pending"; S.erp.nextTry = S.t + 10; alarm("ERP", "low", "ERP not reachable, confirmations queued", [], "Gateway"); bump(); return; }
    log("ERP", "←", `201 Created ${o.id}`);
    S.erp.pending.shift(); o.status = "Confirmed"; o.confirmed = Date.now(); clear("ERP"); bump(); emit("confirmed", o);
  }

  /* ---------- the PLC and the plant ---------- */
  const plc = {
    load(id, setp, mix) { const p = S.plc; Object.assign(p, { state: "LOADED", batchId: id, sp: { ...setp }, act: {}, scale: 0, flow: 0, step: 0, mixTime: mix, fault: 0, cur: null }); SILOS.forEach((s) => (p.act[s.id] = 0)); },
    start() { const p = S.plc; p.state = "DOSING"; p.step = 1; p.started = Date.now(); p.phase = "coarse"; },
    ack() { const p = S.plc; p.state = "IDLE"; p.step = 0; p.cur = null; p.scale = 0; p.flow = 0; },
    tick(dt) {
      const p = S.plc; p.hb += dt;
      if (p.state === "HELD" && p.manual) return;
      if (p.state === "DOSING" || p.state === "HELD") {
        while (p.step <= SILOS.length && !(p.sp[SILOS[p.step - 1].id] > 0)) p.step++;
        if (p.step > SILOS.length) { p.state = "MIXING"; p.step = 7; p.mixLeft = p.mixTime; p.cur = null; return; }
        const s = SILOS[p.step - 1], target = p.sp[s.id];
        p.cur = s.id;
        if (s.level <= 0.5) { if (p.state !== "HELD") { p.state = "HELD"; p.fault = 11; alarm("LOW" + s.id, "high", "{0} {1}: low level, dosing held", [s.id, s.short], "PLC"); bump(); } return; }
        if (p.state === "HELD") { p.state = "DOSING"; p.fault = 0; clear("LOW" + s.id); }
        const done = p.act[s.id];
        const fine = done >= target * 0.94;
        const rate = (fine ? s.rate / 7 : s.rate) * dt;
        let take = Math.min(rate, s.level, Math.max(0, target - done));
        if (!fine) take = Math.min(take, target * 0.94 - done + 0.0001);
        p.phase = fine ? "fine" : "coarse";
        p.act[s.id] += take; s.level -= take;
        if (s.kind === "liquid") p.flow = p.act[s.id]; else p.scale += take;
        if (p.act[s.id] >= target - 1e-6 || (fine && target - p.act[s.id] < s.rate / 7 * dt)) {
          // in-flight material and scale settling give a small error; a drifting scale gives a large one
          const err = gauss() * s.tol * 0.28 / 100 + (S.faults.drift && s.kind !== "liquid" ? s.tol * 1.9 / 100 : 0);
          const extra = target * err;
          p.act[s.id] = Math.max(0, target + extra); s.level = Math.max(0, s.level - extra);
          if (s.kind !== "liquid") p.scale = SILOS.filter((x) => x.kind !== "liquid").reduce((a, x) => a + p.act[x.id], 0);
          p.step++; bump();
        }
      } else if (p.state === "MIXING") {
        p.mixLeft -= dt * (p.mixTime / 8);     // a demo mix takes 8 s of plant time
        if (p.mixLeft <= 0) { p.state = "DISCHARGE"; p.step = 8; p.dis = p.scale + p.flow; bump(); }
      } else if (p.state === "DISCHARGE") {
        const out = (p.dis / 3) * dt;
        p.scale = Math.max(0, p.scale - out); p.flow = Math.max(0, p.flow - out * 0.2);
        if (p.scale <= 1) { p.scale = 0; p.flow = 0; p.state = "DONE"; p.step = 0; bump(); }
      }
    },
  };

  /* ---------- clock ---------- */
  let lastHb = 0, lastAuto = 0, acc = 0;
  function tick() {
    const dt = 0.1 * S.speed;
    S.t += dt; acc += dt;
    plc.tick(dt);
    S.link.up = !S.link.cut;
    while (acc >= 0.25) { acc -= 0.25; gateway(); }
    erpStep();
    if (S.t - lastHb >= 1) { lastHb = S.t; if (S.link.up) S.gw.hb = (S.gw.hb + 1) & 0xffff; }
    if (S.auto && S.t - lastAuto > 40) {
      lastAuto = S.t;
      if (S.orders.filter((o) => o.status === "Queued" || o.status === "Running").length < 3) newOrder(null, null, false);
    }
    subs.forEach((f) => f());
  }

  /* ---------- history to start from ---------- */
  (function seed() {
    const t0 = Date.now() - 5 * 3600000;
    const mk = (code, qty, minsAgo, okAll) => {
      const r = RECIPES.find((x) => x.code === code), n = Math.ceil(qty / MIXER), id = `MO-26-${S.seq++}`;
      const o = { id, recipe: code, qty, batches: n, done: n, status: "Confirmed", received: Date.now() - minsAgo * 60000 - n * 6 * 60000, kg: 0, issues: [], payload: { orderId: id, material: `FG-${code}`, recipe: code, quantity: qty, unit: "kg", line: "Mixing line 1" } };
      for (let i = 0; i < n; i++) {
        const size = qty / n, lines = SILOS.filter((s) => r.parts[s.id]).map((s) => { const spv = Math.round(size * r.parts[s.id]) / 100, dev = gauss() * s.tol * 0.3 + (!okAll && i === 1 && s.id === "S3" ? s.tol * 1.6 : 0); return { silo: s.id, sp: spv, act: spv * (1 + dev / 100), dev, ok: Math.abs(dev) <= s.tol }; });
        const kg = lines.reduce((a, l) => a + l.act, 0), ok = lines.every((l) => l.ok), end = o.received + (i + 1) * 6 * 60000;
        S.batches.unshift({ id: S.nextBatch++, order: id, recipe: code, no: i + 1, of: n, start: end - 5 * 60000, end, size, kg, lines, ok });
        o.kg += kg; S.stats.kg += kg; S.stats.batches++; if (ok) S.stats.inTol++;
      }
      o.confirmed = o.received + n * 6 * 60000 + 20000;
      o.confirmation = { orderId: id, recipe: code, quantityProduced: Math.round(o.kg * 10) / 10, unit: "kg" };
      S.orders.push(o);
      if (!okAll) S.alarms.push({ id: S.alarmSeq++, code: "TOLold", sev: "medium", key: "Batch {0}: {1} outside tolerance, held for quality check", args: [S.batches[1].id, "S3"], src: "Quality", ts: o.received + 12 * 60000, active: false, acked: true, cleared: o.received + 40 * 60000 });
    };
    mk("LAY-16", 8000, 250, true); mk("BRS-22", 6000, 170, false); mk("DRY-14", 4000, 90, true); mk("BRF-19", 6000, 30, true);
    S.alarms.push({ id: S.alarmSeq++, code: "LINKold", sev: "high", key: "PLC link lost, retrying", args: [], src: "Gateway", ts: t0 + 3600000, active: false, acked: true, cleared: t0 + 3600000 + 42000 });
    S.alarms.sort((a, b) => b.ts - a.ts);
    log("PLC", "·", `Connected to the dosing PLC at ${PLC_EP.modbus}`);
    log("ERP", "·", `Listening for production orders from ${ERP_EP}`);
    newOrder("LAY-16", 6000, true);
    newOrder("BRS-22", 4000, true);
  })();

  const listeners = { order: [], confirmed: [] };
  function emit(k, v) { (listeners[k] || []).forEach((f) => f(v)); }

  window.SIM = {
    S, SILOS, RECIPES, TAGS, MIXER, PLC_EP, ERP_EP, newOrder,
    onTick: (f) => subs.push(f), on: (k, f) => listeners[k].push(f),
    setProto(p) { if (p === S.proto) return; S.proto = p; log("PLC", "·", `Protocol switched to ${p === "modbus" ? "Modbus TCP, " + PLC_EP.modbus : "OPC UA, " + PLC_EP.opcua}`); bump(); },
    cutLink(v) { S.link.cut = v; log("PLC", "·", v ? "Network cable to the PLC pulled (simulated)" : "Network cable plugged back in"); bump(); },
    erpDown(v) { S.erp.up = !v; if (!v) S.erp.nextTry = 0; log("ERP", "·", v ? "ERP taken offline (simulated)" : "ERP back online"); bump(); },
    drift(v) { S.faults.drift = v; log("PLC", "·", v ? "Weigh scale calibration drift injected (simulated)" : "Weigh scale recalibrated"); bump(); },
    emptySilo(id) { const s = SILOS.find((x) => x.id === id); s.level = Math.min(s.level, 3); log("PLC", "·", `${id} almost empty (simulated)`); bump(); },
    refill(id) { const s = SILOS.find((x) => x.id === id); s.level = s.cap * 0.9; log("PLC", "·", `${id} refilled to ${Math.round(s.cap * 0.9)} kg`); bump(); },
    ack(id) { S.alarms.forEach((a) => { if (id == null || a.id === id) a.acked = true; }); bump("alarm"); },
    hold() { const p = S.plc; if (p.state === "DOSING") { p.state = "HELD"; p.fault = 0; p.manual = true; log("PLC", "→", "Command HOLD"); bump(); } else if (p.state === "HELD" && p.manual) { p.state = "DOSING"; p.manual = false; log("PLC", "→", "Command START (resume)"); bump(); } },
    statusWord,
  };
  setInterval(tick, 100);
})();
