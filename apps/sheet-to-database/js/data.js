/* Sheet to Database: the sample workbook (three untidy sheets, the same on every visit)
   and the pipeline that cleans it and loads it into four related tables. No DOM in this file. */
(function (root) {
  "use strict";
  const rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
  const R = rng(20261124), pick = (a) => a[Math.floor(R() * a.length)], int = (a, b) => a + Math.floor(R() * (b - a + 1));
  const pad = (n, w) => String(n).padStart(w || 2, "0");

  /* ---------- the tidy truth the workbook was typed from ---------- */
  const CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Medina", "Mecca"];
  const NAMES = ["Al Noor Trading", "Delta Hardware", "Gulf Fresh Foods", "Marsa Bakery", "Sahara Tools", "Blue Palm Cafe", "Atlas Building Supplies", "Rimal Printing", "Najm Electronics", "Wadi Pharmacy", "Oasis Catering", "Safa Clinic", "Zahra Flowers", "Bahr Fish Market", "Qimma Sports", "Lina Fashion", "Tariq Auto Parts", "Burj Stationery", "Hadaf Logistics", "Yasmin Sweets", "Rawda Nursery", "Madar Travel", "Nakheel Dates", "Fajr Laundry", "Sama Optics", "Jawhara Jewellery", "Kanz Grocery", "Wahat Furniture"];
  const CONTACTS = ["Ahmed Salem", "Sara Haddad", "Omar Khalil", "Lina Mansour", "Yousef Nasser", "Huda Karim", "Khaled Aziz", "Mona Farid", "Tariq Jaber", "Rania Saad", "Faisal Amin", "Dina Rashed", "Sami Darwish", "Nour Hamdan"];
  const PRODUCTS = [["P-1001", "A4 Paper 80g, box of 5", "box", 24.5], ["P-1002", "Thermal Roll 80mm", "roll", 1.2], ["P-1003", "Barcode Label 50x30, roll", "roll", 3.75], ["P-1004", "Packing Tape 48mm", "pcs", 1.6], ["P-1005", "Stretch Film 500mm", "roll", 9.9], ["P-1006", "Carton Box 40x30x30", "pcs", 0.85], ["P-1007", "Bubble Wrap 1m x 50m", "roll", 18], ["P-1008", "Shipping Envelope A4", "pack", 6.4], ["P-1009", "Marker Black, box of 12", "box", 7.2], ["P-1010", "Toner Cartridge 85A", "pcs", 38], ["P-1011", "Receipt Book A5", "pcs", 2.1], ["P-1012", "Price Gun Labels", "pack", 4.3], ["P-1013", "Pallet Wrap Dispenser", "pcs", 21], ["P-1014", "Cable Ties 200mm, pack of 100", "pack", 2.9], ["P-1015", "Hand Scanner Stand", "pcs", 14.5], ["P-1016", "Cash Drawer Insert", "pcs", 11], ["P-1017", "Cleaning Wipes, tub", "pcs", 5.6], ["P-1018", "Label Printer Ribbon", "roll", 8.25], ["P-1019", "Storage Bin 30L", "pcs", 6.9], ["P-1020", "Safety Gloves, pair", "pcs", 1.95], ["P-1021", "Whiteboard 90x60", "pcs", 27], ["P-1022", "Extension Lead 5m", "pcs", 12.4]];
  const base = Date.UTC(2026, 0, 5);
  const day = 86400000;

  const customers = NAMES.map((name, i) => {
    const slug = name.toLowerCase().replace(/[^a-z]+/g, "").slice(0, 10);
    return { name, contact: CONTACTS[i % CONTACTS.length], phone: "+9665" + int(0, 9) + pad(int(0, 9999999), 7), city: CITIES[i % CITIES.length], email: "info@" + slug + ".example", since: Date.UTC(int(2017, 2025), int(0, 11), int(1, 28)) };
  });

  /* ---------- the ways people type the same thing differently ---------- */
  const nameVar = (n, k) => [n.toUpperCase(), n + " ", n.replace("Al ", "Al-"), n + " Co.", n.replace(" ", "  "), n.toLowerCase(), n + " Est."][k % 7];
  const phoneVar = (p, k) => { const d = p.slice(4); return ["0" + d, "966" + d, "+966 " + d.slice(0, 2) + " " + d.slice(2, 5) + " " + d.slice(5), "00966" + d, "0" + d.slice(0, 2) + "-" + d.slice(2, 5) + "-" + d.slice(5), p][k % 6]; };
  const CITY_VAR = { Riyadh: ["RIYADH", "Riyad", "Ar Riyadh", "الرياض", "riyadh "], Jeddah: ["Jedda", "JEDDAH", "جدة", "Jiddah"], Dammam: ["DAMMAM", "Damam", "الدمام"], Khobar: ["Al Khobar", "Al-Khobar", "الخبر"], Medina: ["Madinah", "Al Madinah", "المدينة"], Mecca: ["Makkah", "MECCA", "مكة"] };
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateVar = (ts, k) => { const d = new Date(ts), y = d.getUTCFullYear(), m = d.getUTCMonth(), dd = d.getUTCDate(); return [y + "-" + pad(m + 1) + "-" + pad(dd), pad(dd) + "/" + pad(m + 1) + "/" + y, pad(dd) + "-" + MON[m] + "-" + String(y).slice(2), dd + " " + MONTHS[m] + " " + y, String(Math.round(ts / day) + 25569), pad(dd) + "." + pad(m + 1) + "." + y][k % 6]; };
  const UNIT_VAR = { pcs: ["pcs", "PC", "piece", "Pcs.", "pieces"], box: ["box", "Box", "BOX ", "bx"], roll: ["roll", "Roll", "rolls", "RL"], pack: ["pack", "Pack", "pk", "packet"] };
  const priceVar = (p, k) => [String(p), p.toFixed(2).replace(".", ","), "SAR " + p, p.toFixed(2) + " ", " " + p, p.toFixed(2)][k % 6];

  /* ---------- sheet 1: Customers ---------- */
  const custRows = [], dupAt = [];
  customers.forEach((c, i) => {
    const row = (v) => [v.name, v.contact, v.phone, v.city, v.email, v.since];
    const messy = (k, drop) => ({ name: k % 3 ? c.name : nameVar(c.name, i + k), contact: drop === "contact" ? "" : c.contact, phone: drop === "phone" ? "" : phoneVar(c.phone, i + k), city: (i + k) % 2 ? pick(CITY_VAR[c.city]) : c.city, email: drop === "email" ? "" : (k % 4 === 1 ? " " + c.email.toUpperCase() : c.email), since: dateVar(c.since, i + k) });
    custRows.push(row(messy(0, i % 9 === 4 ? "email" : null)));
    if (i % 3 === 1) { dupAt.push(custRows.length); custRows.push(row(Object.assign(messy(2, i % 2 ? "contact" : "email"), { name: nameVar(c.name, i + 3) }))); }
    if (i % 9 === 1) custRows.push(row(Object.assign(messy(4, null), { name: nameVar(c.name, i + 5) })));
    if (i === 10) custRows.push(row(Object.assign(messy(5, "contact"), { name: nameVar(c.name, 2) })));
  });
  const withMail = custRows.map((r, i) => (r[4] && !dupAt.includes(i) ? i : -1)).filter((i) => i > 3);
  custRows[withMail[0]][4] = custRows[withMail[0]][4].trim().toLowerCase().replace("info@", "sales at ");   // not an email address
  custRows[withMail[7]][4] = custRows[withMail[7]][4].trim().toLowerCase().replace(".example", "");        // no domain ending
  custRows[withMail[12]][5] = "last year";                // not a date
  custRows[dupAt[2]][2] = phoneVar("+966551230088", 0);   // a second, different number for a client entered twice
  // shuffle a little so duplicates are not side by side
  for (let i = custRows.length - 1; i > 0; i--) { const j = Math.max(0, i - int(0, 6)); [custRows[i], custRows[j]] = [custRows[j], custRows[i]]; }

  /* ---------- sheet 2: Products ---------- */
  const prodRows = PRODUCTS.map((p, i) => [i % 5 === 3 ? p[0].toLowerCase() : (i % 7 === 2 ? p[0] + " " : p[0]), i % 6 === 1 ? p[1].toUpperCase() : p[1], pick(UNIT_VAR[p[2]]), priceVar(p[3], i)]);
  prodRows[6][3] = "";                                    // price never filled in
  prodRows[15][3] = "ask";                                // price is a note
  prodRows.splice(9, 0, ["P-1004", "Packing tape 48 mm", "pc", "1,75"]);   // same code again, other price
  prodRows.splice(19, 0, ["p-1012 ", "Price Gun Labels", "Pack", "4.30"]); // same code again, same price

  /* ---------- sheet 3: Orders (one row per item, order details repeated or left blank) ---------- */
  const STATUS_VAR = { Paid: ["Paid", "paid", "PAID", "Payed", "paid "], Unpaid: ["Unpaid", "unpaid", "Pending", "not paid", "UNPAID"], Cancelled: ["Cancelled", "cancelled", "Canceled", "CANCELLED"] };
  const orderRows = [];
  const UNKNOWN_CLIENTS = ["Reef Marine Supplies", "Hilal Print House"];
  let no = 2401;
  for (let o = 0; o < 96; o++) {
    const c = o === 40 || o === 71 ? null : customers[(o * 7 + int(0, 5)) % customers.length];
    const client = c ? (o % 4 === 0 ? nameVar(c.name, o) : c.name) : UNKNOWN_CLIENTS[o === 40 ? 0 : 1];
    const ts = base + int(0, 300) * day, status = pick(["Paid", "Paid", "Paid", "Unpaid", "Unpaid", "Cancelled"]);
    const lines = int(1, 4), used = new Set();
    for (let l = 0; l < lines; l++) {
      let p; do { p = PRODUCTS[int(0, PRODUCTS.length - 1)]; } while (used.has(p[0])); used.add(p[0]);
      const qty = int(1, 12) * (p[3] < 3 ? 10 : 1), price = p[3];
      const first = l === 0 || o % 3 !== 0;   // every third order leaves the repeated cells blank after its first row
      orderRows.push([
        first ? "SO-" + no : "",
        first ? dateVar(ts, o + l) : "",
        first ? client : "",
        (o + l) % 5 === 2 ? p[1] : ((o + l) % 11 === 5 ? p[0].toLowerCase() : p[0]),
        (o + l) % 9 === 4 ? qty + " " + p[2] : ((o + l) % 13 === 6 ? qty + ".0" : String(qty)),
        (o + l) % 8 === 3 ? "" : priceVar(price, o + l),
        (qty * price).toFixed(2),
        first ? pick(STATUS_VAR[status]) : "",
      ]);
    }
    no++;
  }
  [14, 63, 118, 171, 205].forEach((i) => { if (orderRows[i]) orderRows[i][6] = Math.abs(parseFloat(orderRows[i][6]) + [10, -4.5, 100, 2, -20][i % 5]).toFixed(2); });  // totals that do not add up
  [22, 90, 150, 199].forEach((i) => { if (orderRows[i] && orderRows[i][0]) orderRows.splice(i + 1, 0, orderRows[i].slice()); });                       // the same row pasted twice
  orderRows[57][3] = "Gift box (custom)";                // an item that is not in the Products sheet
  orderRows[132][3] = "P-1099";

  const RAW = [
    { id: "customers", name: "Customers", cols: ["Client", "Contact", "Phone", "City", "Email", "Client since"], rows: custRows },
    { id: "products", name: "Products", cols: ["Code", "Item", "Unit", "Price"], rows: prodRows },
    { id: "orders", name: "Orders 2026", cols: ["Order", "Date", "Client", "Item", "Qty", "Price", "Total", "Status"], rows: orderRows },
  ];

  /* ====================== the pipeline ====================== */
  const clean = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  const nameKey = (s) => clean(s).toLowerCase().replace(/\b(co|est|llc|ltd)\b\.?/g, "").replace(/[^a-z0-9؀-ۿ]+/g, " ").trim();
  const itemKey = (s) => clean(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
  const title = (s) => clean(s).toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/-/g, " ");
  const CITY_MAP = {}; Object.keys(CITY_VAR).forEach((c) => { CITY_MAP[nameKey(c)] = c; CITY_VAR[c].forEach((v) => (CITY_MAP[nameKey(v)] = c)); });
  const UNIT_MAP = {}; Object.keys(UNIT_VAR).forEach((u) => UNIT_VAR[u].forEach((v) => (UNIT_MAP[itemKey(v)] = u))); UNIT_MAP.pc = "pcs";
  const STATUS_MAP = {}; Object.keys(STATUS_VAR).forEach((u) => STATUS_VAR[u].forEach((v) => (STATUS_MAP[itemKey(v)] = u)));
  function phone(s) { let d = clean(s).replace(/[^0-9]/g, ""); if (!d) return ""; if (d.startsWith("00")) d = d.slice(2); if (d.startsWith("0")) d = "966" + d.slice(1); return /^9665\d{8}$/.test(d) ? "+" + d : null; }
  function parseDate(s) {
    s = clean(s); if (!s) return "";
    let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    if ((m = s.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})$/))) return Date.UTC(+m[3], +m[2] - 1, +m[1]);
    if ((m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/)) && MON.indexOf(m[2]) >= 0) return Date.UTC(2000 + +m[3], MON.indexOf(m[2]), +m[1]);
    if ((m = s.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/)) && MONTHS.indexOf(m[2]) >= 0) return Date.UTC(+m[3], MONTHS.indexOf(m[2]), +m[1]);
    if (/^\d{5}$/.test(s)) return (+s - 25569) * day;   // a date stored as a spreadsheet serial number
    return null;
  }
  const iso = (ts) => { const d = new Date(ts); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); };
  function money(s) { s = clean(s).replace(/^[A-Za-z]+\s*/, ""); if (!s) return ""; if (/^\d+,\d{1,2}$/.test(s)) s = s.replace(",", "."); return /^\d+(\.\d+)?$/.test(s) ? Math.round(parseFloat(s) * 100) / 100 : null; }
  function qty(s) { const m = clean(s).match(/^(\d+)(?:\.0+)?(?:\s*[A-Za-z.]+)?$/); return m ? +m[1] : null; }
  const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

  /**
   * Run the whole migration. decisions: { reviewId: "accept" | "reject" }.
   * Returns { tables, issues, reviews, stats, checks }.
   */
  function run(decisions) {
    decisions = decisions || {};
    const issues = [], reviews = [];
    const fix = (sheet, row, col, rule, before, after) => issues.push({ sheet, row: row + 2, col, rule, before: String(before), after: String(after), action: "fixed" });
    const ask = (id, sheet, row, col, rule, before, suggestion, alt, ctx) => { const state = decisions[id] || "pending"; reviews.push({ id, sheet, row: row + 2, col, rule, before: String(before), suggestion, alt, state, ctx: ctx || "" }); issues.push({ sheet, row: row + 2, col, rule, before: String(before), after: state === "accept" ? suggestion : state === "reject" ? alt : "", action: state === "pending" ? "review" : "decided" }); return state; };
    const [SC, SP, SO] = RAW;

    /* ----- customers ----- */
    const byKey = new Map();
    SC.rows.forEach((r, i) => {
      const [n, contact, ph, city, email, since] = r;
      const name = title(nameKey(n)).replace(/\bAl /g, "Al ");
      if (clean(n) !== name) fix("customers", i, 0, "Name tidied", n, name);
      let p = phone(ph); if (p && p !== clean(ph)) fix("customers", i, 2, "Phone in one format", ph, p);
      let c = CITY_MAP[nameKey(city)] || clean(city); if (c !== city) fix("customers", i, 3, "City spelling", city, c);
      let e = clean(email).toLowerCase(); if (e && e !== email && emailOk(e)) fix("customers", i, 4, "Email trimmed, lower case", email, e);
      if (e && !emailOk(e)) { const st = ask("c-email-" + i, "customers", i, 4, "Not an email address", email, "leave empty", "keep as typed", name); e = st === "reject" ? clean(email) : ""; }
      let d = parseDate(since);
      if (d === null) { ask("c-date-" + i, "customers", i, 5, "Not a date", since, "leave empty", "leave empty", name); d = ""; }
      else if (d !== "" && iso(d) !== since) fix("customers", i, 5, "Date in one format", since, iso(d));
      const rec = { name, contact: clean(contact), phone: p || "", city: c, email: e, since: d, rows: [i] };
      const k = nameKey(n), was = byKey.get(k);
      if (!was) { byKey.set(k, rec); return; }
      issues.push({ sheet: "customers", row: i + 2, col: 0, rule: "Duplicate merged", before: clean(n), after: "= row " + (was.rows[0] + 2), action: "fixed" });
      was.rows.push(i);
      if (was.phone && rec.phone && was.phone !== rec.phone) { const st = ask("c-phone-" + i, "customers", i, 2, "Two phone numbers for one client", rec.phone, was.phone, rec.phone, name); if (st === "reject") was.phone = rec.phone; }
      ["contact", "phone", "city", "email", "since"].forEach((f) => { if (!was[f] && rec[f]) was[f] = rec[f]; });
    });
    const T_customers = [...byKey.values()].map((c, i) => ({ id: i + 1, name: c.name, contact: c.contact, phone: c.phone, city: c.city, email: c.email, since: c.since === "" ? null : c.since, src: c.rows.length }));
    const custByKey = new Map(T_customers.map((c) => [nameKey(c.name), c]));

    /* ----- products ----- */
    const prodByCode = new Map();
    SP.rows.forEach((r, i) => {
      const code = clean(r[0]).toUpperCase(); if (code !== r[0]) fix("products", i, 0, "Code tidied", r[0], code);
      const name = /^[^a-z]+$/.test(r[1]) ? title(r[1]).replace(/(\d)([A-Z])\b/g, (m, a, b) => a + b.toLowerCase()) : clean(r[1]); if (name !== r[1]) fix("products", i, 1, "Name tidied", r[1], name);
      const unit = UNIT_MAP[itemKey(r[2])] || clean(r[2]); if (unit !== r[2]) fix("products", i, 2, "Unit in one spelling", r[2], unit);
      let price = money(r[3]);
      if (price !== null && price !== "" && String(price) !== r[3]) fix("products", i, 3, "Price as a number", r[3], price.toFixed(2));
      const was = prodByCode.get(code);
      if (was) {
        issues.push({ sheet: "products", row: i + 2, col: 0, rule: "Duplicate merged", before: code, after: "= row " + (was.row + 2), action: "fixed" });
        if (price && was.price && price !== was.price) { const st = ask("p-price-" + i, "products", i, 3, "Two prices for one item", r[3], was.price.toFixed(2), price.toFixed(2), code + ", " + was.name); if (st === "reject") was.price = price; }
        return;
      }
      prodByCode.set(code, { code, name, unit, price: price || null, row: i, raw: r[3] });
    });
    /* prices typed in the Orders sheet, used to suggest a missing product price */
    const seen = new Map();
    SO.rows.forEach((r) => { const k = clean(r[3]).toUpperCase(), v = money(r[5]); if (v) { const m = seen.get(k) || new Map(); m.set(v, (m.get(v) || 0) + 1); seen.set(k, m); } });
    prodByCode.forEach((p) => {
      if (p.price) return;
      const m = seen.get(p.code); const best = m ? [...m.entries()].sort((a, b) => b[1] - a[1])[0][0] : null;
      const st = ask("p-noprice-" + p.row, "products", p.row, 3, p.raw ? "Price is not a number" : "Price is empty", p.raw || "(empty)", best ? best.toFixed(2) + " (from Orders)" : "leave empty", "leave empty", p.code + ", " + p.name);
      if (st === "accept" && best) p.price = best;
    });
    const T_products = [...prodByCode.values()].map((p, i) => ({ id: i + 1, code: p.code, name: p.name, unit: p.unit, price: p.price }));
    const prodBy = new Map(); T_products.forEach((p) => { prodBy.set(p.code, p); prodBy.set(itemKey(p.name), p); });

    /* ----- orders and order lines ----- */
    const T_orders = [], T_lines = [], orderByNo = new Map();
    let last = null, held = 0, dupRows = 0, srcTotal = 0, dupTotal = 0, heldTotal = 0;
    const seenRow = new Set();
    SO.rows.forEach((r, i) => {
      srcTotal += money(r[6]) || 0;
      const sig = r.join("|");
      if (r[0] && seenRow.has(sig)) { dupRows++; dupTotal += money(r[6]) || 0; issues.push({ sheet: "orders", row: i + 2, col: 0, rule: "Row entered twice", before: r[0] + ", " + r[3], after: "removed", action: "fixed" }); return; }
      seenRow.add(sig);
      let no = clean(r[0]);
      if (!no && last) { no = last.no; fix("orders", i, 0, "Blank cell filled from the row above", "(empty)", no); }
      else if (no) last = { no, date: r[1], client: r[2], status: r[7] };
      const head = last;
      let order = orderByNo.get(no);
      if (!order) {
        const hi = i;
        const d = parseDate(head.date); if (d && iso(d) !== head.date) fix("orders", hi, 1, "Date in one format", head.date, iso(d));
        const st = STATUS_MAP[itemKey(head.status)] || clean(head.status); if (st !== head.status) fix("orders", hi, 7, "Status in one spelling", head.status, st);
        let c = custByKey.get(nameKey(head.client)), hold = false;
        if (c && clean(head.client) !== c.name) fix("orders", hi, 2, "Client matched to Customers", head.client, c.name);
        if (!c) {
          const s = ask("o-client-" + hi, "orders", hi, 2, "Client is not in Customers", head.client, "add the client", "leave the order out", no);
          if (s === "accept") { c = { id: T_customers.length + 1, name: clean(head.client), contact: "", phone: "", city: "", email: "", since: null, src: 0 }; T_customers.push(c); custByKey.set(nameKey(c.name), c); }
          else hold = true;
        }
        order = { id: T_orders.length + 1, order_no: no, customer_id: c ? c.id : null, order_date: d || null, status: st, hold };
        orderByNo.set(no, order);
        if (!hold) T_orders.push(order); else order.id = null;
      }
      if (order.hold) { held++; heldTotal += money(r[6]) || 0; return; }
      /* the line */
      const raw = clean(r[3]);
      let p = prodBy.get(raw.toUpperCase()) || prodBy.get(itemKey(raw));
      if (p && raw !== p.code) fix("orders", i, 3, /^p-/i.test(raw) ? "Code tidied" : "Item name replaced by its code", r[3], p.code);
      if (!p) {
        const s = ask("o-item-" + i, "orders", i, 3, "Item is not in Products", r[3], "add the item", "leave the row out", no);
        if (s !== "accept") { held++; heldTotal += money(r[6]) || 0; return; }
        p = { id: T_products.length + 1, code: /^P-\d+$/i.test(raw) ? raw.toUpperCase() : "P-NEW-" + (T_products.length + 1), name: /^P-\d+$/i.test(raw) ? "(to be named)" : raw, unit: "pcs", price: money(r[5]) || null }; T_products.push(p); prodBy.set(p.code, p); prodBy.set(itemKey(p.name), p);
      }
      const q = qty(r[4]); if (q !== null && String(q) !== r[4]) fix("orders", i, 4, "Quantity as a number", r[4], q);
      let price = money(r[5]);
      if (price === "" && p.price) { price = p.price; fix("orders", i, 5, "Price taken from Products", "(empty)", price.toFixed(2)); }
      else if (price && String(price) !== r[5]) fix("orders", i, 5, "Price as a number", r[5], price.toFixed(2));
      if (!price) price = money(r[6]) && q ? Math.round((money(r[6]) / q) * 100) / 100 : 0;
      const tot = money(r[6]), calc = Math.round(q * price * 100) / 100;
      if (tot && Math.abs(tot - calc) > 0.005) {
        const s = ask("o-total-" + i, "orders", i, 6, "Total is not quantity × price", r[6], calc.toFixed(2) + " (recalculated)", "keep " + tot.toFixed(2), no + ", " + p.code + ", " + q + " × " + price.toFixed(2));
        if (s === "pending") { held++; heldTotal += money(r[6]) || 0; return; }
        if (s === "reject") price = Math.round((tot / q) * 10000) / 10000;
      }
      T_lines.push({ id: T_lines.length + 1, order_id: order.id, product_id: p.id, qty: q, unit_price: price, src: i + 2 });
    });
    /* an order whose every row was held has no lines: leave it out as well */
    const withLines = new Set(T_lines.map((l) => l.order_id));
    const orders = T_orders.filter((o) => withLines.has(o.id));

    const total = T_lines.reduce((s, l) => s + l.qty * l.unit_price, 0);
    const pending = reviews.filter((r) => r.state === "pending").length;
    const fixed = issues.filter((x) => x.action === "fixed").length;
    const merged = issues.filter((x) => x.rule === "Duplicate merged").length;
    const stats = { read: SC.rows.length + SP.rows.length + SO.rows.length, loaded: T_customers.length + T_products.length + orders.length + T_lines.length, fixed, merged, dupRows, pending, held, decided: reviews.length - pending };
    const added = T_customers.filter((c) => !c.src).length;
    const checks = [
      { what: "Customers", source: SC.rows.length, merged: issues.filter((x) => x.sheet === "customers" && x.rule === "Duplicate merged").length, held: 0, added, loaded: T_customers.length },
      { what: "Products", source: SP.rows.length, merged: issues.filter((x) => x.sheet === "products" && x.rule === "Duplicate merged").length, held: 0, added: T_products.length - prodByCode.size, loaded: T_products.length },
      { what: "Order rows", source: SO.rows.length, merged: dupRows, held, added: 0, loaded: T_lines.length },
    ];
    return { tables: { customers: T_customers, products: T_products, orders, order_lines: T_lines }, issues, reviews, stats, checks, srcTotal: Math.round(srcTotal * 100) / 100, dupTotal: Math.round(dupTotal * 100) / 100, heldTotal: Math.round(heldTotal * 100) / 100, total: Math.round(total * 100) / 100 };
  }

  const SCHEMA = [
    { name: "customers", cols: [["id", "int", "pk"], ["name", "text", "nn uq"], ["contact", "text"], ["phone", "text"], ["city", "text"], ["email", "text"], ["since", "date"]] },
    { name: "products", cols: [["id", "int", "pk"], ["code", "text", "nn uq"], ["name", "text", "nn"], ["unit", "text", "nn"], ["price", "money"]] },
    { name: "orders", cols: [["id", "int", "pk"], ["order_no", "text", "nn uq"], ["customer_id", "int", "nn fk:customers"], ["order_date", "date"], ["status", "text", "nn"]] },
    { name: "order_lines", cols: [["id", "int", "pk"], ["order_id", "int", "nn fk:orders"], ["product_id", "int", "nn fk:products"], ["qty", "int", "nn"], ["unit_price", "money", "nn"]] },
  ];
  const TYPES = { postgres: { int: "integer", text: "text", date: "date", money: "numeric(12,2)", pk: "integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY" }, sqlserver: { int: "int", text: "nvarchar(200)", date: "date", money: "decimal(12,2)", pk: "int IDENTITY(1,1) PRIMARY KEY" }, mysql: { int: "int", text: "varchar(200)", date: "date", money: "decimal(12,2)", pk: "int AUTO_INCREMENT PRIMARY KEY" } };
  function sql(dialect) {
    const T = TYPES[dialect];
    return SCHEMA.map((t) => {
      const lines = t.cols.map(([n, ty, f]) => {
        f = f || ""; if (f.includes("pk")) return "  " + n.padEnd(12) + T.pk;
        const fk = (f.match(/fk:(\w+)/) || [])[1];
        return "  " + n.padEnd(12) + T[ty] + (f.includes("nn") ? " NOT NULL" : "") + (f.includes("uq") ? " UNIQUE" : "") + (fk ? " REFERENCES " + fk + "(id)" : "");
      });
      if (t.name === "order_lines") lines.push("  CHECK (qty > 0)");
      return "CREATE TABLE " + t.name + " (\n" + lines.join(",\n") + "\n);";
    }).join("\n\n") + "\n\nCREATE INDEX ix_orders_customer ON orders(customer_id);\nCREATE INDEX ix_lines_order ON order_lines(order_id);\nCREATE INDEX ix_lines_product ON order_lines(product_id);";
  }

  root.S2D = { RAW, run, SCHEMA, sql, iso };
})(typeof window !== "undefined" ? window : globalThis);
