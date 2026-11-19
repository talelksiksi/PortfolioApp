/*
 * Tray Store Controller, simulation
 *
 * Model
 * - Storage channels at x1..x5, y1..y4. Every channel always holds 12 trays
 *   on plain rollers. Position 1 is the front end, 12 the back end.
 * - x0 y1 is the infeed belt, x0 y2 the outfeed belt.
 * - Two transfer devices (TDs), one per face, always at the same channel.
 *   Each holds up to 2 trays and together they always hold 2 trays.
 * - Pushing k trays into a channel from one side moves k trays out of the
 *   other end onto the opposite TD.
 */
(() => {
  'use strict';

  const XS = 5, YS = 4, LEN = 12, CAP = 2;
  const IN_KEY = '0.1', OUT_KEY = '0.2';

  const PRODUCTS = [
    { sku: 'BRG-6204', name: 'Bearing 6204', color: '#3d6d78' },
    { sku: 'VLV-V20', name: 'Valve body V20', color: '#c4744a' },
    { sku: 'SEL-S12', name: 'Seal kit S12', color: '#4f8a68' },
    { sku: 'SNS-PX3', name: 'Proximity sensor PX3', color: '#7a6aa8' },
    { sku: 'GRW-G40', name: 'Gear wheel G40', color: '#b8923f' },
    { sku: 'FLT-F08', name: 'Filter cartridge F8', color: '#2c8c94' },
  ];
  const BY_SKU = Object.fromEntries(PRODUCTS.map(p => [p.sku, p]));

  // ---------- state ----------
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeState() {
    const r = rng(20261111);
    const st = { ch: {}, tdF: [], tdB: [], pos: { x: 0, y: 1 }, trays: {} };
    let n = 100;
    const newTray = (sku, qty) => { const id = n++; st.trays[id] = { id, sku, qty }; return id; };
    // Mostly empty trays, as in a real buffer, with a few product trays
    // placed away from the channel ends so retrieval needs real shuffling.
    for (let x = 1; x <= XS; x++) for (let y = 1; y <= YS; y++) {
      st.ch[`${x}.${y}`] = Array.from({ length: LEN }, () => newTray(null, 0));
    }
    const keys = Object.keys(st.ch);
    const used = new Set();
    PRODUCTS.forEach(prod => {
      const count = 3 + Math.floor(r() * 2);
      for (let c = 0; c < count; c++) {
        let key, idx, guard = 0;
        do { key = keys[Math.floor(r() * keys.length)]; idx = 2 + Math.floor(r() * 8); } while (used.has(`${key}:${idx}`) && guard++ < 50);
        used.add(`${key}:${idx}`);
        const t = st.trays[st.ch[key][idx]];
        t.sku = prod.sku; t.qty = 6 + Math.floor(r() * 25);
      }
    });
    st.tdF = [newTray(null, 0), newTray(null, 0)];
    return st;
  }

  const clone = st => ({
    ch: Object.fromEntries(Object.entries(st.ch).map(([k, v]) => [k, v.slice()])),
    tdF: st.tdF.slice(), tdB: st.tdB.slice(), pos: { ...st.pos }, trays: st.trays,
  });

  // ---------- mechanics ----------
  const sideArr = (st, s) => (s === 'F' ? st.tdF : st.tdB);

  function applyPush(st, key, side, k) {
    const hF = st.tdF.length;
    if (side === 'F' && (hF < k || st.tdB.length + k > CAP)) throw new Error('bad push F');
    if (side === 'B' && (st.tdB.length < k || hF + k > CAP)) throw new Error('bad push B');
    const run = st.tdF.concat(st.ch[key], st.tdB);
    const nF = side === 'F' ? hF - k : hF + k;
    st.tdF = run.slice(0, nF);
    st.ch[key] = run.slice(nF, nF + LEN);
    st.tdB = run.slice(nF + LEN);
  }
  function applyOut(st, side) { return side === 'F' ? st.tdF.pop() : st.tdB.shift(); }
  function applyRcv(st, side, id) { if (side === 'F') st.tdF.push(id); else st.tdB.unshift(id); }

  const parseKey = k => { const [x, y] = k.split('.').map(Number); return { x, y }; };
  const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const label = k => { const { x, y } = parseKey(k); return `x${x} y${y}`; };
  const sideName = s => (s === 'F' ? 'front' : 'back');
  const other = s => (s === 'F' ? 'B' : 'F');

  function locate(st, id) {
    let i = st.tdF.indexOf(id); if (i >= 0) return { where: 'F', idx: i };
    i = st.tdB.indexOf(id); if (i >= 0) return { where: 'B', idx: i };
    for (const [k, lane] of Object.entries(st.ch)) { i = lane.indexOf(id); if (i >= 0) return { where: 'ch', key: k, idx: i }; }
    return null;
  }

  function chooseTarget(st, sku) {
    let best = null;
    for (const t of Object.values(st.trays)) {
      if (t.sku !== sku || t.qty <= 0) continue;
      const loc = locate(st, t.id); if (!loc) continue;
      let cost;
      if (loc.where !== 'ch') cost = 0.5;
      else cost = Math.min(loc.idx, LEN - 1 - loc.idx) + 0.1 * dist(st.pos, parseKey(loc.key));
      if (!best || cost < best.cost) best = { id: t.id, cost };
    }
    return best && best.id;
  }

  function nearestStorage(fromKey, exclude) {
    const a = parseKey(fromKey); let best = null;
    for (let x = 1; x <= XS; x++) for (let y = 1; y <= YS; y++) {
      const k = `${x}.${y}`; if (k === exclude) continue;
      const s = Math.abs(a.x - x) + Math.abs(a.y - y) + (a.y !== y ? 0.1 : 0);
      if (!best || s < best.s) best = { k, s };
    }
    return best.k;
  }

  // ---------- planner ----------
  function buildPlan(real, sku) {
    const st = clone(real);
    const target = chooseTarget(st, sku);
    if (target == null) return null;
    const steps = [];
    const prod = BY_SKU[sku];
    const tname = `T-${target}`;
    const loc = locate(st, target);
    let exitSide;

    const push = (key, side, k, kind) => {
      applyPush(st, key, side, k);
      let text;
      if (kind === 'park') text = `Push ${k} from the ${sideName(side)} into ${label(key)}, the nearest channel. ${k} ${k > 1 ? 'trays come' : 'tray comes'} out at the ${sideName(other(side))}, ready to push again.`;
      else if (kind === 'unblock') text = `Push ${k} from the ${sideName(side)} into ${label(key)}. ${k} blocking ${k > 1 ? 'trays come' : 'tray comes'} out at the ${sideName(other(side))}.`;
      else if (kind === 'retrieve') text = `Push ${k} from the ${sideName(side)} into ${label(key)}. Target tray ${tname} comes out at the ${sideName(other(side))}.`;
      else text = `Push ${k} from the ${sideName(side)} into ${label(key)} so ${tname} sits at the edge of the ${sideName(other(side))} transfer device.`;
      steps.push({ op: 'MOV', key, side, qty: k, text });
    };

    if (loc.where === 'ch') {
      const key = loc.key;
      const backBlock = LEN - 1 - loc.idx, frontBlock = loc.idx;
      exitSide = backBlock < frontBlock ? 'B' : 'F';
      const P = other(exitSide);
      let remaining = (exitSide === 'B' ? backBlock : frontBlock) + 1;
      const park = nearestStorage(key, key);
      steps.push({ op: 'INFO', text: `Target tray ${tname} (${prod.name}) is at position ${loc.idx + 1} of 12 in ${label(key)}. Nearest end: ${sideName(exitSide)}, ${remaining - 1} ${remaining - 1 === 1 ? 'tray' : 'trays'} in the way.`, park, target, key });
      let guard = 0;
      while (remaining > 0 && guard++ < 40) {
        const hP = sideArr(st, P).length;
        if (hP === 0) { push(park, exitSide, sideArr(st, exitSide).length, 'park'); continue; }
        const k = Math.min(hP, remaining);
        push(key, P, k, k === remaining ? 'retrieve' : 'unblock');
        remaining -= k;
      }
    } else {
      exitSide = loc.where;
      const arr = sideArr(st, exitSide);
      const inner = exitSide === 'F' ? arr.length - 1 : 0;
      steps.push({ op: 'INFO', text: `Target tray ${tname} (${prod.name}) is already on the ${sideName(exitSide)} transfer device.`, target });
      if (loc.idx !== inner) {
        const key = nearestStorage(`${st.pos.x}.${st.pos.y}`, null);
        push(key, exitSide, 1, 'shift');
      }
    }
    applyOut(st, exitSide);
    steps.push({ op: 'OUT', key: OUT_KEY, side: exitSide, qty: 1, text: `Push ${tname} from the ${sideName(exitSide)} onto the outfeed belt at x0 y2.` });
    steps.push({ op: 'PICK', text: `Operator picks 1 × ${prod.name} from ${tname}.` });
    applyRcv(st, exitSide, target);
    steps.push({ op: 'RCV', key: IN_KEY, side: exitSide, qty: 1, text: `Take ${tname} back from the infeed belt at x0 y1 onto the ${sideName(exitSide)} transfer device.` });
    return { target, sku, exitSide, steps };
  }

  // ---------- telegrams ----------
  let seq = 0;
  const pad = (n, w) => String(n).padStart(w, '0');
  const chField = k => { const { x, y } = parseKey(k); return `${pad(x, 2)}.${pad(y, 2)}`; };
  function telegram(type, s, fields) {
    const body = [type, pad(s, 4), ...fields].join('*');
    let cs = 0; for (const c of body) cs ^= c.charCodeAt(0);
    return `$${body}*CS=${pad(cs.toString(16).toUpperCase(), 2)}#`;
  }

  // ---------- UI ----------
  const $ = id => document.getElementById(id);
  const S = makeState();
  let speed = 1, busy = false, faultArmed = false;
  const queue = [];
  let currentTarget = null, parkKey = null;
  const t0 = performance.now();
  const wait = ms => new Promise(r => setTimeout(r, ms / speed));

  const gridEl = $('grid'), laneEl = $('lane'), chanBox = $('chanBox');
  const cells = {};

  function buildGrid() {
    $('ylabels').innerHTML = Array.from({ length: YS }, (_, i) => `<span>y${YS - i}</span>`).join('');
    $('xlabels').innerHTML = Array.from({ length: XS + 1 }, (_, x) => `<span>x${x}</span>`).join('');
    for (let y = YS; y >= 1; y--) {
      for (let x = 0; x <= XS; x++) {
        const k = `${x}.${y}`;
        const c = document.createElement('div');
        if (x === 0) {
          if (k === IN_KEY) { c.className = 'cell io'; c.textContent = 'Infeed'; }
          else if (k === OUT_KEY) { c.className = 'cell io'; c.textContent = 'Outfeed'; }
          else c.className = 'cell none';
        } else {
          c.className = 'cell';
          c.innerHTML = `<div class="strip">${'<i class="seg"></i>'.repeat(LEN)}</div>`;
          c.title = label(k);
        }
        gridEl.appendChild(c);
        cells[k] = c;
      }
    }
  }

  function paintGrid() {
    for (const [k, lane] of Object.entries(S.ch)) {
      const segs = cells[k].querySelectorAll('.seg');
      lane.forEach((id, i) => {
        const t = S.trays[id];
        const s = segs[i];
        s.style.background = t.sku ? BY_SKU[t.sku].color : '';
        s.style.boxShadow = t.sku ? 'none' : '';
        s.classList.toggle('target', id === currentTarget);
      });
      cells[k].classList.toggle('park', k === parkKey);
    }
    Object.entries(cells).forEach(([k, c]) => c.classList.toggle('active', k === `${S.pos.x}.${S.pos.y}`));
  }

  function placeMarks(ms) {
    const c = cells[`${S.pos.x}.${S.pos.y}`];
    const f = $('markF'), b = $('markB');
    [f, b].forEach(m => { m.style.transitionDuration = `${ms / speed}ms`; m.style.height = `${c.offsetHeight}px`; });
    f.style.transform = `translate(${c.offsetLeft - 3}px, ${c.offsetTop}px)`;
    b.style.transform = `translate(${c.offsetLeft + c.offsetWidth - 3}px, ${c.offsetTop}px)`;
    $('tdText').textContent = `x${S.pos.x} y${S.pos.y}`;
  }

  // lane trays
  const trayEls = new Map();
  function trayEl(id) {
    let el = trayEls.get(id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'tray';
      laneEl.appendChild(el);
      trayEls.set(id, el);
    }
    const t = S.trays[id];
    el.style.background = t.sku ? BY_SKU[t.sku].color : '';
    el.style.boxShadow = t.sku ? 'none' : '';
    el.title = t.sku ? `T-${id}, ${BY_SKU[t.sku].name}, ${t.qty} units` : `T-${id}, empty`;
    el.classList.toggle('target', id === currentTarget);
    return el;
  }

  function laneLayout() {
    const key = `${S.pos.x}.${S.pos.y}`;
    const map = new Map();
    const hF = S.tdF.length;
    S.tdF.forEach((id, j) => map.set(id, 2 - hF + j));
    if (S.ch[key]) S.ch[key].forEach((id, j) => map.set(id, 2 + j));
    S.tdB.forEach((id, j) => map.set(id, 14 + j));
    return map;
  }

  function renderLane(ms) {
    const layout = laneLayout();
    for (const [id, el] of trayEls) {
      if (!layout.has(id)) { el.remove(); trayEls.delete(id); }
    }
    const added = [];
    for (const [id, i] of layout) {
      const isNew = !trayEls.has(id);
      const el = trayEl(id);
      el.style.transitionDuration = `${ms / speed}ms`;
      if (isNew) { el.style.transitionDuration = '0ms'; el.classList.add('fade'); added.push(el); }
      el.style.setProperty('--i', i);
    }
    if (added.length) requestAnimationFrame(() => requestAnimationFrame(() => added.forEach(el => {
      el.style.transitionDuration = `${220 / speed}ms`; el.classList.remove('fade');
    })));
    const key = `${S.pos.x}.${S.pos.y}`;
    const io = !S.ch[key];
    chanBox.classList.toggle('belt', io);
    $('laneTitle').textContent = key === IN_KEY ? 'x0 y1, infeed belt' : key === OUT_KEY ? 'x0 y2, outfeed belt' : `Channel ${label(key)}`;
    $('laneHint').textContent = io ? 'Front TD, belt, back TD' : 'Front TD, tray positions 1 to 12, back TD';
    $('posScale').innerHTML = '<span></span>' + Array.from({ length: LEN }, (_, i) => `<span>${io ? '' : i + 1}</span>`).join('') + '<span></span>';
  }

  function sizeSlots() {
    const w = laneEl.parentElement.clientWidth - 28;
    const slot = Math.max(16, Math.min(30, Math.floor(w / 16)));
    document.documentElement.style.setProperty('--slot', `${slot}px`);
  }

  function renderProducts() {
    const units = {}, trays = {};
    for (const id of allTrayIds()) {
      const t = S.trays[id];
      if (t.sku && t.qty > 0) { units[t.sku] = (units[t.sku] || 0) + t.qty; trays[t.sku] = (trays[t.sku] || 0) + 1; }
    }
    $('products').innerHTML = PRODUCTS.map(p => `
      <li><span class="dot" style="background:${p.color}"></span>
      <span><span class="pname">${p.name}</span><br><span class="mono hint">${p.sku}</span></span>
      <span class="pmeta">${units[p.sku] || 0} units<br>${trays[p.sku] || 0} trays</span>
      <button class="req" data-sku="${p.sku}" ${units[p.sku] ? '' : 'disabled'}>Request</button></li>`).join('');
  }
  function allTrayIds() { return [...Object.values(S.ch).flat(), ...S.tdF, ...S.tdB]; }

  function renderQueue() {
    $('queue').textContent = queue.length ? `Queued: ${queue.map(s => BY_SKU[s].name).join(', ')}` : '';
  }

  // log
  const logEl = $('log');
  function log(kind, text) {
    const s = ((performance.now() - t0) / 1000).toFixed(1).padStart(6, ' ');
    const line = document.createElement('div');
    const arrow = kind === 'tx' ? '→ PLC ' : kind === 'rx' ? '← PLC ' : '      ';
    line.innerHTML = `<span class="t">${s}s</span> <span class="${kind}">${arrow}${text.replace(/</g, '&lt;')}</span>`;
    logEl.appendChild(line);
    while (logEl.children.length > 120) logEl.firstChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setLink(ok) {
    $('linkPill').classList.toggle('down', !ok);
    $('linkText').textContent = ok ? 'OK' : 'Down';
  }

  // ---------- execution ----------
  async function travelTo(key) {
    const to = parseKey(key);
    const d = dist(S.pos, to);
    if (d === 0) return;
    S.pos = to;
    const ms = 300 + 170 * d;
    placeMarks(ms);
    paintGrid();
    for (const [id, el] of trayEls) { if (!S.tdF.includes(id) && !S.tdB.includes(id)) { el.style.transitionDuration = `${150 / speed}ms`; el.classList.add('fade'); } }
    await wait(ms);
    renderLane(0);
  }

  async function runStep(step) {
    if (step.op === 'PICK') {
      const t = S.trays[currentTarget];
      const before = t.qty;
      $('pickText').textContent = `Picking 1 × ${BY_SKU[t.sku].name} from T-${t.id}`;
      await wait(1300);
      t.qty -= 1;
      $('pickText').textContent = `Picked 1 × ${BY_SKU[t.sku].name}. T-${t.id}: ${before} → ${t.qty} units, sending tray back.`;
      renderProducts();
      log('note', `Pick confirmed: 1 × ${t.sku} from T-${t.id}`);
      return;
    }
    await travelTo(step.key);
    seq += 1;
    const s = seq;
    let tx;
    if (step.op === 'RCV') tx = telegram('RCV', s, [`CH=${chField(step.key)}`, `TO=${step.side}`, `QTY=${step.qty}`]);
    else tx = telegram('MOV', s, [`CH=${chField(step.key)}`, `FROM=${step.side}`, `QTY=${step.qty}`]);
    log('tx', tx);
    await wait(120);

    // the PLC executes the move
    if (step.op === 'MOV') {
      applyPush(S, step.key, step.side, step.qty);
      renderLane(450 + 200 * step.qty);
      paintGrid();
      await wait(450 + 200 * step.qty);
    } else if (step.op === 'OUT') {
      const id = applyOut(S, step.side);
      const el = trayEls.get(id);
      el.style.transitionDuration = `${700 / speed}ms`;
      el.style.setProperty('--i', step.side === 'F' ? 9 : 4);
      await wait(700);
      el.classList.add('fade');
      await wait(200);
      el.remove(); trayEls.delete(id);
      $('pickText').textContent = `T-${id} arriving on the outfeed belt`;
    } else if (step.op === 'RCV') {
      applyRcv(S, step.side, currentTarget);
      const el = trayEl(currentTarget);
      el.style.transitionDuration = '0ms';
      el.style.setProperty('--i', step.side === 'F' ? 9 : 4);
      el.classList.add('fade');
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      el.classList.remove('fade');
      renderLane(700);
      await wait(700);
      $('pickText').textContent = 'Idle';
    }

    // confirmation
    if (faultArmed) {
      faultArmed = false;
      $('faultBtn').classList.remove('armed');
      $('faultBtn').textContent = 'Drop PLC link';
      log('bad', `No ACK for #${pad(s, 4)} within 1.5 s. Holding the sequence, link down.`);
      setLink(false);
      await wait(1500);
      log('note', 'Reconnecting...');
      await wait(1200);
      setLink(true);
      log('note', `Link restored. Asking the PLC what happened to #${pad(s, 4)} before sending anything new.`);
      log('tx', telegram('QRY', s, []));
      await wait(220);
      log('rx', telegram('STA', s, ['DONE']));
      log('note', `#${pad(s, 4)} was already executed. Not resending it, continuing with the next move.`);
    } else {
      await wait(220);
      log('rx', telegram('ACK', s, ['OK']));
    }
  }

  async function runRequest(sku) {
    const plan = buildPlan(S, sku);
    if (!plan) { log('note', `No stock for ${sku}`); return; }
    currentTarget = plan.target;
    const info = plan.steps.find(s => s.op === 'INFO');
    parkKey = info.park || null;
    const steps = plan.steps.filter(s => s.op !== 'INFO');
    const plcCount = steps.filter(s => s.op !== 'PICK').length;
    $('planHint').textContent = `${BY_SKU[sku].name}: ${plcCount} PLC moves`;
    const planEl = $('plan');
    planEl.innerHTML = `<p class="hint" style="margin:0 0 6px -1.4rem">${info.text}</p>` + steps.map(s => `<li>${s.text}</li>`).join('');
    const items = planEl.querySelectorAll('li');
    log('note', `Request from parent system: ${sku}. Planned ${plcCount} moves for T-${plan.target}.`);
    paintGrid(); renderLane(0);
    for (let i = 0; i < steps.length; i++) {
      items[i].classList.add('now');
      await runStep(steps[i]);
      items[i].classList.remove('now');
      items[i].classList.add('done');
    }
    log('note', `Request ${sku} complete.`);
    currentTarget = null; parkKey = null;
    paintGrid(); renderLane(0);
  }

  async function pump() {
    if (busy) return;
    busy = true;
    while (queue.length) {
      const sku = queue.shift();
      renderQueue();
      await runRequest(sku);
    }
    busy = false;
  }

  // ---------- wiring ----------
  $('products').addEventListener('click', e => {
    const b = e.target.closest('.req'); if (!b) return;
    queue.push(b.dataset.sku);
    renderQueue();
    pump();
    if (window.matchMedia('(max-width: 900px)').matches) document.querySelector('.store-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
    speed = Number(b.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('on', x === b));
  }));
  $('faultBtn').addEventListener('click', () => {
    faultArmed = !faultArmed;
    $('faultBtn').classList.toggle('armed', faultArmed);
    $('faultBtn').textContent = faultArmed ? 'Next ACK will be lost' : 'Drop PLC link';
    if (faultArmed) log('note', 'Fault armed: the next confirmation from the PLC will be lost.');
  });
  window.addEventListener('resize', () => { sizeSlots(); placeMarks(0); });

  buildGrid();
  sizeSlots();
  paintGrid();
  renderProducts();
  renderLane(0);
  requestAnimationFrame(() => placeMarks(0));
  log('note', 'Controller online. PLC link established. Waiting for requests.');

  // expose for tests
  window.__sim = { S, buildPlan, applyPush, clone };
})();
