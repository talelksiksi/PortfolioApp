/* Plant Spare Parts Store: sample data for a water and power plant's maintenance stores.
   Every name, number and company here is invented. Generated from a fixed seed, so it is the same on every visit. */
(function () {
  "use strict";
  const R = KIT.rng(2611);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const between = (a, b) => a + Math.floor(R() * (b - a + 1));
  const DAY = 86400000;
  const NOW = Date.now();
  const ago = (d, h) => NOW - d * DAY - (h || between(1, 9)) * 3600000;

  const SITE = { plant: "Bayside Water & Power", store: "Central Stores", currency: "USD" };

  const STORES = [
    { id: "MS", name: "Main Store" },
    { id: "CS", name: "Chemicals & Oils Store" },
    { id: "YD", name: "Outdoor Yard" },
  ];

  const CATS = ["Pumps & seals", "Valves & actuators", "Bearings & transmission", "Motors & drives", "Electrical", "Instrumentation", "Filtration & membranes", "Lubricants & chemicals", "Fasteners & gaskets", "Safety & PPE"];

  const UNITS = [
    { code: "EA", name: "Each", base: "EA", factor: 1, dec: 0 },
    { code: "SET", name: "Set", base: "SET", factor: 1, dec: 0 },
    { code: "PR", name: "Pair", base: "PR", factor: 1, dec: 0 },
    { code: "BX10", name: "Box of 10", base: "EA", factor: 10, dec: 0 },
    { code: "BX50", name: "Box of 50", base: "EA", factor: 50, dec: 0 },
    { code: "KG", name: "Kilogram", base: "KG", factor: 1, dec: 1 },
    { code: "L", name: "Litre", base: "L", factor: 1, dec: 1 },
    { code: "DRUM", name: "Drum 208 L", base: "L", factor: 208, dec: 0 },
    { code: "M", name: "Metre", base: "M", factor: 1, dec: 1 },
    { code: "ROLL", name: "Roll", base: "ROLL", factor: 1, dec: 0 },
  ];

  const SUPPLIERS = [
    { code: "SUP-101", name: "Meridian Pumps & Seals", contact: "Dana Price", email: "orders@meridian-pumps.example", phone: "+1 555 0101", lead: 21, rating: 96 },
    { code: "SUP-102", name: "Atlas Bearings Supply", contact: "Omar Said", email: "sales@atlas-bearings.example", phone: "+1 555 0102", lead: 7, rating: 98 },
    { code: "SUP-103", name: "Valvetek Industrial", contact: "Inès Laurent", email: "service@valvetek.example", phone: "+1 555 0103", lead: 35, rating: 88 },
    { code: "SUP-104", name: "Kestrel Electric", contact: "Yusuf Demir", email: "trade@kestrel-electric.example", phone: "+1 555 0104", lead: 14, rating: 93 },
    { code: "SUP-105", name: "Halden Instruments", contact: "Mia Halden", email: "orders@halden.example", phone: "+1 555 0105", lead: 28, rating: 91 },
    { code: "SUP-106", name: "PureFlow Membranes", contact: "Raj Menon", email: "supply@pureflow.example", phone: "+1 555 0106", lead: 42, rating: 89 },
    { code: "SUP-107", name: "Orbis Lubricants", contact: "Lea Novak", email: "orders@orbis-lube.example", phone: "+1 555 0107", lead: 10, rating: 97 },
    { code: "SUP-108", name: "Fastline Fixings", contact: "Sam Ortiz", email: "sales@fastline.example", phone: "+1 555 0108", lead: 5, rating: 99 },
    { code: "SUP-109", name: "SafeWork PPE", contact: "Nadia Kerr", email: "hello@safework.example", phone: "+1 555 0109", lead: 6, rating: 95 },
  ];

  // no, description, category index, unit, criticality, min, max, unit cost, supplier, lot-tracked, shelf life (days), store
  const P = [
    ["MS-SEAL-045", "Mechanical seal 45 mm, SiC/SiC, high-pressure pump", 0, "EA", "A", 2, 6, 1840, "SUP-101", 0, 0, "MS"],
    ["MS-SEAL-065", "Mechanical seal 65 mm cartridge, seawater intake pump", 0, "EA", "A", 1, 4, 2620, "SUP-101", 0, 0, "MS"],
    ["PMP-IMP-250", "Impeller 250 mm, duplex stainless, booster pump", 0, "EA", "A", 1, 2, 4950, "SUP-101", 0, 0, "MS"],
    ["PMP-WR-080", "Wear ring set 80 mm, booster pump", 0, "SET", "B", 2, 6, 310, "SUP-101", 0, 0, "MS"],
    ["PMP-KIT-DOS", "Diaphragm repair kit, chemical dosing pump", 0, "SET", "B", 4, 12, 185, "SUP-101", 0, 0, "MS"],
    ["VLV-BF-200", "Butterfly valve DN200 PN16, EPDM liner", 1, "EA", "B", 2, 4, 760, "SUP-103", 0, 0, "YD"],
    ["VLV-BF-300", "Butterfly valve DN300 PN16, EPDM liner", 1, "EA", "A", 1, 2, 1390, "SUP-103", 0, 0, "YD"],
    ["VLV-CHK-100", "Dual plate check valve DN100 PN25", 1, "EA", "B", 2, 4, 540, "SUP-103", 0, 0, "YD"],
    ["VLV-BALL-025", "Ball valve DN25 PN40, 316 stainless", 1, "EA", "C", 6, 20, 96, "SUP-103", 0, 0, "MS"],
    ["ACT-PN-DA10", "Pneumatic actuator double acting, 10 Nm", 1, "EA", "B", 2, 5, 420, "SUP-103", 0, 0, "MS"],
    ["SOL-24VDC", "Solenoid valve 5/2, 24 V DC", 1, "EA", "B", 4, 10, 88, "SUP-103", 0, 0, "MS"],
    ["BRG-6312", "Deep groove ball bearing 6312-2RS C3", 2, "EA", "B", 6, 16, 64, "SUP-102", 0, 0, "MS"],
    ["BRG-6316", "Deep groove ball bearing 6316 C3", 2, "EA", "B", 4, 10, 138, "SUP-102", 0, 0, "MS"],
    ["BRG-22220", "Spherical roller bearing 22220 EK", 2, "EA", "A", 2, 4, 412, "SUP-102", 0, 0, "MS"],
    ["BRG-7312", "Angular contact bearing pair 7312 BECBM", 2, "PR", "A", 1, 3, 588, "SUP-102", 0, 0, "MS"],
    ["CPL-ELM-G5", "Coupling element, flexible jaw size G5", 2, "EA", "C", 4, 10, 46, "SUP-102", 0, 0, "MS"],
    ["BLT-SPB2000", "V-belt SPB 2000", 2, "EA", "C", 6, 18, 22, "SUP-102", 0, 0, "MS"],
    ["MOT-055-4P", "Motor 55 kW 4-pole IE3, B3 foot mount", 3, "EA", "A", 1, 1, 6200, "SUP-104", 0, 0, "YD"],
    ["MOT-011-4P", "Motor 11 kW 4-pole IE3, B35", 3, "EA", "B", 1, 2, 1180, "SUP-104", 0, 0, "MS"],
    ["VSD-075", "Variable speed drive 75 kW, 400 V", 3, "EA", "A", 1, 1, 7400, "SUP-104", 0, 0, "MS"],
    ["VSD-FAN-75", "Cooling fan kit for 75 kW drive", 3, "EA", "B", 1, 3, 240, "SUP-104", 0, 0, "MS"],
    ["CTR-025A", "Contactor 25 A, 230 V AC coil", 4, "EA", "C", 6, 15, 58, "SUP-104", 0, 0, "MS"],
    ["FUS-063-GG", "Fuse 63 A gG, NH00", 4, "BX10", "B", 2, 6, 74, "SUP-104", 0, 0, "MS"],
    ["MCB-C16", "Circuit breaker C16 1-pole", 4, "EA", "C", 10, 30, 12, "SUP-104", 0, 0, "MS"],
    ["CBL-4X16", "Power cable 4 x 16 mm², armoured", 4, "M", "C", 50, 200, 14, "SUP-104", 0, 0, "YD"],
    ["PT-0100-B", "Pressure transmitter 0 to 100 bar, 4-20 mA", 5, "EA", "A", 2, 5, 690, "SUP-105", 0, 0, "MS"],
    ["PT-0010-B", "Pressure transmitter 0 to 10 bar, 4-20 mA", 5, "EA", "B", 2, 6, 520, "SUP-105", 0, 0, "MS"],
    ["FT-MAG-150", "Electromagnetic flowmeter DN150", 5, "EA", "A", 1, 2, 3150, "SUP-105", 0, 0, "MS"],
    ["CND-SENS-01", "Conductivity sensor 0 to 2000 µS/cm", 5, "EA", "A", 2, 4, 860, "SUP-105", 0, 0, "MS"],
    ["PH-ELEC-01", "pH electrode, gel filled", 5, "EA", "B", 4, 10, 145, "SUP-105", 1, 540, "MS"],
    ["LT-RAD-20", "Radar level transmitter 20 m", 5, "EA", "B", 1, 2, 1920, "SUP-105", 0, 0, "MS"],
    ["RO-8040-SW", "Seawater RO membrane element 8 x 40 in", 6, "EA", "A", 14, 36, 780, "SUP-106", 1, 1095, "MS"],
    ["CF-05-40", "Cartridge filter 5 µm, 40 in", 6, "BX10", "A", 20, 60, 118, "SUP-106", 1, 1460, "MS"],
    ["CF-HSG-ORG", "O-ring set for cartridge filter housing", 6, "SET", "B", 4, 12, 36, "SUP-106", 0, 0, "MS"],
    ["OIL-ISO46", "Turbine oil ISO VG 46", 7, "DRUM", "A", 4, 10, 1290, "SUP-107", 1, 1825, "CS"],
    ["OIL-ISO68", "Gear oil ISO VG 68", 7, "L", "B", 60, 240, 7.4, "SUP-107", 1, 1825, "CS"],
    ["GRS-EP2", "Lithium grease EP2", 7, "KG", "B", 20, 60, 9.8, "SUP-107", 1, 1095, "CS"],
    ["CHM-ANTISC", "Antiscalant for RO, 25 kg can", 7, "KG", "A", 400, 1500, 4.6, "SUP-106", 1, 365, "CS"],
    ["CHM-SBS", "Sodium bisulfite, 25 kg bag", 7, "KG", "B", 300, 1200, 1.2, "SUP-106", 1, 730, "CS"],
    ["GSK-DN200", "Gasket DN200 PN16, EPDM", 8, "EA", "C", 10, 30, 18, "SUP-108", 0, 0, "MS"],
    ["GSK-DN100", "Spiral wound gasket DN100 PN40", 8, "EA", "B", 10, 30, 24, "SUP-108", 0, 0, "MS"],
    ["BLT-M16X80", "Hex bolt M16 x 80, 8.8, galvanised", 8, "BX50", "C", 4, 12, 38, "SUP-108", 0, 0, "MS"],
    ["ORK-METRIC", "O-ring kit, metric NBR, 382 pieces", 8, "SET", "C", 2, 5, 64, "SUP-108", 0, 0, "MS"],
    ["PPE-GLV-CHM", "Chemical resistant gloves, size 9", 9, "PR", "C", 40, 120, 6.5, "SUP-109", 0, 0, "MS"],
    ["PPE-GOGG", "Safety goggles, indirect vent", 9, "EA", "C", 20, 60, 8.2, "SUP-109", 0, 0, "MS"],
    ["PPE-H2S-MON", "Single gas monitor H2S", 9, "EA", "A", 4, 8, 410, "SUP-109", 1, 730, "MS"],
  ];
  const PARTS = P.map(([no, desc, c, unit, crit, min, max, cost, sup, lot, life, store]) => ({
    no, desc, cat: CATS[c], unit, crit, min, max, rop: Math.max(min, Math.round(min + (max - min) * 0.25)), cost, sup, lot: !!lot, life, store,
  }));

  // Bins: code = store-aisle-rack-level
  const BIN_TYPES = { MS: ["Shelf", "Shelf", "Drawer cabinet", "Pallet rack"], CS: ["Flammables cabinet", "Bunded pallet rack"], YD: ["Covered rack", "Ground bay"] };
  const BINS = [];
  STORES.forEach((s) => {
    const aisles = s.id === "MS" ? ["A", "B", "C", "D"] : s.id === "CS" ? ["F", "G"] : ["Y"];
    aisles.forEach((a, ai) => {
      const racks = s.id === "MS" ? 5 : 3;
      for (let r = 1; r <= racks; r++) for (let l = 1; l <= (s.id === "YD" ? 2 : 3); l++) {
        BINS.push({ code: `${s.id}-${a}${String(r).padStart(2, "0")}-${l}`, store: s.id, type: BIN_TYPES[s.id][(ai + r) % BIN_TYPES[s.id].length], cap: s.id === "MS" ? 4 : 3 });
      }
    });
  });
  const binsOf = (store) => BINS.filter((b) => b.store === store);

  const USERS = { store: "R. Haddad", planner: "M. Okafor", buyer: "S. Iyer", tech: ["L. Moreau", "A. Benali", "J. Kowalski", "K. Mensah"], sup: "T. Novak" };

  // Current stock: one to three lines per part, some lot-tracked with expiry dates.
  const STOCK = [];
  let sid = 1000;
  const usedBin = Object.create(null);
  function freeBin(store) {
    const list = binsOf(store);
    for (let i = 0; i < 40; i++) { const b = pick(list); if ((usedBin[b.code] || 0) < b.cap) { usedBin[b.code] = (usedBin[b.code] || 0) + 1; return b.code; } }
    return list[0].code;
  }
  const LOW = new Set(["MS-SEAL-065", "BRG-22220", "CF-05-40", "PT-0100-B", "CHM-ANTISC", "GSK-DN100", "PPE-GLV-CHM", "VSD-FAN-75"]);
  const ZERO = new Set(["BRG-7312", "LT-RAD-20"]);
  PARTS.forEach((p) => {
    if (ZERO.has(p.no)) return;
    let total = LOW.has(p.no) ? Math.max(1, Math.floor(p.min * 0.8)) : between(p.rop + 1, p.max);
    if (p.unit === "KG" || p.unit === "L" || p.unit === "M") total = LOW.has(p.no) ? Math.round(p.min * 0.7) : Math.round(between(p.rop + 1, p.max) / 5) * 5;
    const lines = p.lot ? Math.min(3, Math.max(1, Math.ceil(total / Math.max(1, p.min)))) : (total > 4 && R() < 0.3 ? 2 : 1);
    let left = total;
    const home = freeBin(p.store);
    for (let i = 0; i < lines && left > 0; i++) {
      const q = i === lines - 1 ? left : Math.max(1, Math.round(left * (0.35 + R() * 0.3)));
      left -= q;
      const recv = ago(between(10 + i * 70, 60 + i * 120));
      const lotNo = p.lot ? `L${new Date(recv).getFullYear() % 100}${String(between(100, 999))}-${String.fromCharCode(65 + i)}` : "";
      STOCK.push({ id: sid++, part: p.no, bin: i === 0 ? home : freeBin(p.store), lot: lotNo, qty: q, reserved: 0, recv, exp: p.life ? recv + p.life * DAY : null, status: "ok" });
    }
  });
  // A few lines that are about to expire, and two in quarantine.
  STOCK.filter((s) => s.exp).slice(0, 4).forEach((s, i) => { s.exp = NOW + [12, 26, 41, 55][i] * DAY; });
  const q1 = STOCK.find((s) => s.part === "PH-ELEC-01"); if (q1) { q1.status = "quarantine"; q1.note = "Failed calibration check on receipt"; }
  const q2 = STOCK.find((s) => s.part === "VLV-BF-200"); if (q2) { q2.status = "quarantine"; q2.note = "Liner damage found at inspection"; }

  const ASSETS = [
    ["HPP-2B", "High-pressure pump 2B"], ["HPP-1A", "High-pressure pump 1A"], ["SWI-1", "Seawater intake pump 1"], ["SWI-3", "Seawater intake pump 3"],
    ["RO-3", "Reverse osmosis train 3"], ["RO-5", "Reverse osmosis train 5"], ["BFP-2", "Boiler feed pump 2"], ["CT-1", "Cooling tower fan 1"],
    ["DOS-4", "Chemical dosing skid 4"], ["GT-1-LO", "Gas turbine 1 lube oil system"], ["CMP-1", "Instrument air compressor 1"], ["PWP-2", "Product water pump 2"],
  ];
  const TASKS = ["Replace mechanical seal", "Bearing replacement", "Annual overhaul", "Membrane change-out", "Replace transmitter", "Valve repair", "Lube oil top-up and filter change", "Drive fan replacement", "Planned inspection", "Cartridge filter change"];

  // Purchase orders
  const POS = [];
  const poLines = (sup, n) => { const ps = PARTS.filter((p) => p.sup === sup); const out = []; for (let i = 0; i < n && ps.length; i++) { const p = ps.splice(Math.floor(R() * ps.length), 1)[0]; out.push({ part: p.no, qty: Math.max(1, Math.round((p.max - p.min) * (0.4 + R() * 0.5))), received: 0, price: p.cost }); } return out; };
  const PO_PLAN = [["SUP-101", "Sent", 9, 2], ["SUP-102", "Part received", 15, 3], ["SUP-106", "Sent", 4, 2], ["SUP-104", "Draft", 1, 2], ["SUP-107", "Received", 30, 2], ["SUP-108", "Received", 44, 3], ["SUP-105", "Sent", 26, 2], ["SUP-103", "Sent", 50, 1], ["SUP-109", "Received", 60, 2], ["SUP-102", "Received", 85, 2], ["SUP-106", "Received", 120, 2]];
  PO_PLAN.forEach(([sup, status, age, n], i) => {
    const s = SUPPLIERS.find((x) => x.code === sup);
    const lines = poLines(sup, n);
    if (status === "Received") lines.forEach((l) => (l.received = l.qty));
    if (status === "Part received") { lines[0].received = lines[0].qty; }
    POS.push({ id: `PO-26-${String(418 - i * 7).padStart(4, "0")}`, sup, created: ago(age), due: ago(age) + s.lead * DAY, status, lines, buyer: USERS.buyer });
  });
  // Make sure the low lines are on order or flagged.
  POS[0].lines.push({ part: "MS-SEAL-065", qty: 3, received: 0, price: 2620 });
  POS[6].lines.push({ part: "PT-0100-B", qty: 3, received: 0, price: 690 });

  // Issue requests against work orders
  const REQS = [];
  const REQ_PLAN = [["Requested", 0], ["Requested", 0], ["Picking", 0], ["Requested", 1], ["Issued", 1], ["Issued", 2], ["Issued", 3], ["Part issued", 2], ["Issued", 5], ["Issued", 6], ["Returned", 9], ["Issued", 11]];
  REQ_PLAN.forEach(([status, age], i) => {
    const [asset, aname] = ASSETS[i % ASSETS.length];
    const n = between(1, 3);
    const lines = [];
    const pool = PARTS.filter((p) => !ZERO.has(p.no));
    for (let k = 0; k < n; k++) { const p = pick(pool); if (lines.some((l) => l.part === p.no)) continue; lines.push({ part: p.no, qty: Math.max(1, Math.min(p.unit === "KG" || p.unit === "L" ? 25 : 2, Math.ceil(p.min / 2))), issued: 0 }); }
    if (status === "Issued" || status === "Returned") lines.forEach((l) => (l.issued = l.qty));
    if (status === "Part issued") lines[0].issued = lines[0].qty;
    REQS.push({ id: `IR-26-${String(946 - i).padStart(4, "0")}`, wo: `WO-26-${String(1190 - i * 3).padStart(4, "0")}`, asset, aname, task: TASKS[i % TASKS.length], tech: USERS.tech[i % 4], created: ago(age, between(1, 6)), need: ago(age) + between(0, 3) * DAY, status, lines });
  });
  // One urgent request for a part that is out of stock.
  REQS[1].lines = [{ part: "BRG-7312", qty: 1, issued: 0 }, { part: "BRG-6316", qty: 2, issued: 0 }];
  REQS[1].asset = "BFP-2"; REQS[1].aname = "Boiler feed pump 2"; REQS[1].task = "Bearing replacement"; REQS[1].priority = "Urgent";

  // Movement history: a year of receipts, issues, returns, transfers and adjustments.
  const MOVES = [];
  let mid = 50000;
  const usage = (p) => (p.crit === "A" ? 0.08 : p.crit === "B" ? 0.14 : 0.22);
  for (let d = 364; d >= 0; d--) {
    PARTS.forEach((p) => {
      if (R() < usage(p) / 7) {
        const qty = p.unit === "KG" || p.unit === "L" ? between(5, 40) : p.unit === "M" ? between(5, 30) : between(1, Math.max(1, Math.ceil(p.min / 2)));
        const [asset] = pick(ASSETS);
        MOVES.push({ id: mid++, ts: ago(d), type: "Issue", part: p.no, qty: -qty, bin: "", lot: "", ref: `WO-26-${between(400, 1180)}`, who: USERS.store, note: asset });
      }
      if (R() < 0.006) {
        const qty = p.unit === "KG" || p.unit === "L" ? between(100, 400) : between(Math.max(1, p.min), p.max);
        MOVES.push({ id: mid++, ts: ago(d), type: "Receipt", part: p.no, qty, bin: "", lot: "", ref: `PO-26-${between(100, 410)}`, who: USERS.store, note: "" });
      }
      if (R() < 0.0015) MOVES.push({ id: mid++, ts: ago(d), type: "Return", part: p.no, qty: 1, bin: "", lot: "", ref: `WO-26-${between(400, 1180)}`, who: USERS.store, note: "Unused, returned to stock" });
      if (R() < 0.001) MOVES.push({ id: mid++, ts: ago(d), type: "Adjustment", part: p.no, qty: pick([-1, -1, 1, -2]), bin: "", lot: "", ref: "Cycle count", who: USERS.sup, note: "Count difference" });
      if (R() < 0.0008) MOVES.push({ id: mid++, ts: ago(d), type: "Transfer", part: p.no, qty: 0, bin: "", lot: "", ref: "Re-slotting", who: USERS.store, note: "" });
    });
  }
  // Bin and lot on each movement, from the part's current stock where it has some.
  MOVES.forEach((m) => { const s = STOCK.find((x) => x.part === m.part); const p = PARTS.find((x) => x.no === m.part); m.bin = s ? s.bin : binsOf(p.store)[0].code; m.lot = s ? s.lot : ""; });
  // Slow movers: no issue for over six months.
  ["PMP-IMP-250", "MOT-055-4P", "VLV-BF-300", "FT-MAG-150", "LT-RAD-20"].forEach((no) => {
    for (let i = MOVES.length - 1; i >= 0; i--) if (MOVES[i].part === no && MOVES[i].type === "Issue" && MOVES[i].ts > NOW - 210 * DAY) MOVES.splice(i, 1);
  });

  const AUDIT = [];
  const aud = (ts, who, entity, ref, action, detail) => AUDIT.push({ ts, who, entity, ref, action, detail });
  POS.forEach((p) => {
    aud(p.created, p.buyer, "Purchase order", p.id, "Created", `${p.lines.length} lines, supplier ${p.sup}`);
    if (p.status !== "Draft") aud(p.created + 3600000, p.buyer, "Purchase order", p.id, "Sent to supplier", "");
    if (p.status === "Received" || p.status === "Part received") aud(p.created + 12 * DAY, USERS.store, "Purchase order", p.id, "Goods received", p.status);
  });
  REQS.forEach((r) => {
    aud(r.created, USERS.planner, "Issue request", r.id, "Created", `${r.wo}, ${r.asset}`);
    if (r.status !== "Requested") aud(r.created + 2 * 3600000, USERS.store, "Issue request", r.id, r.status === "Picking" ? "Picking started" : "Issued", r.tech);
  });
  STOCK.filter((s) => s.status === "quarantine").forEach((s) => aud(s.recv + 3600000, USERS.store, "Stock line", String(s.id), "Quarantined", s.note));
  aud(ago(18), USERS.sup, "Part", "BRG-22220", "Changed", "Reorder point 2 → 3");
  aud(ago(40), USERS.sup, "Part", "CHM-ANTISC", "Changed", "Max 1200 → 1500 kg");
  aud(ago(63), "Admin", "Supplier", "SUP-106", "Changed", "Lead time 35 → 42 days");
  aud(ago(90), "Admin", "Bin", "CS-G01-1", "Created", "Bunded pallet rack");
  AUDIT.sort((a, b) => b.ts - a.ts);

  window.SPS_DATA = { SITE, STORES, CATS, UNITS, SUPPLIERS, PARTS, BINS, STOCK, ASSETS, POS, REQS, MOVES, AUDIT, USERS, DAY, NOW };
})();
