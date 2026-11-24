// The hosted demo's stand-in for the tool's service: a simulated plant and the same answers the
// real service gives, all in the browser. It is loaded only when the page is served without the
// service (see pickBackend in app.js). Nothing here talks to a real server.
//
// The plant mirrors the demo plant built into the real tool: a mixing line, a packaging line,
// utilities, one variable of every data type and a thousand sensors. Values move, set points are
// followed, and one sensor drops out now and then.

import { t } from "./i18n.js";

const DEMO_URL = "opc.tcp://demo-plant:4840";
const STEP_MS = 500;
const TYPE_IDS = { Boolean: 1, SByte: 2, Byte: 3, Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, LocalizedText: 21 };
const RANGES = {
  SByte: [-128n, 127n], Byte: [0n, 255n], Int16: [-32768n, 32767n], UInt16: [0n, 65535n],
  Int32: [-2147483648n, 2147483647n], UInt32: [0n, 4294967295n],
  Int64: [-9223372036854775808n, 9223372036854775807n], UInt64: [0n, 18446744073709551615n],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pad = (n, width) => String(n).padStart(width, "0");

// ---- values as text, and text back to values (the same rules as the real tool) ---------------

function formatScalar(value, type) {
  if (value === null || value === undefined) return "";
  switch (type) {
    case "Boolean": return value ? "true" : "false";
    case "Float": return String(parseFloat(value.toPrecision(7)));
    case "DateTime": return value.toISOString();
    case "ByteString": return [...value].map((b) => pad(b.toString(16).toUpperCase(), 2)).join("");
    default: return String(value);
  }
}

function formatValue(node) {
  if (!node.isArray) return formatScalar(node.value, node.type);
  return "[" + node.value.map((v) => (node.type === "String" ? JSON.stringify(v) : formatScalar(v, node.type))).join(", ") + "]";
}

const describeType = (node) => (node.isArray ? `${node.type}[${node.value.length}]` : node.type);

function parseScalar(text, type) {
  const s = text.trim();
  switch (type) {
    case "Boolean": {
      const u = s.toUpperCase();
      if (["TRUE", "1", "ON"].includes(u)) return true;
      if (["FALSE", "0", "OFF"].includes(u)) return false;
      throw new Error(t("A Boolean is true or false (1 and 0 also work)."));
    }
    case "Float": case "Double": {
      const normal = s.includes(",") && !s.includes(".") ? s.replace(",", ".") : s;
      if (normal === "" || !/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(normal)) throw new Error(t("'{0}' is not a {1} number.", text, type));
      return type === "Float" ? Math.fround(Number(normal)) : Number(normal);
    }
    case "String": case "LocalizedText": return text;
    case "DateTime": {
      const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + "Z");
      if (s === "" || isNaN(date)) throw new Error(t("A DateTime is written like 2026-01-31T14:30:00Z."));
      return date;
    }
    case "Guid":
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) throw new Error(t("'{0}' is not a Guid.", text));
      return s.toLowerCase();
    case "ByteString": {
      const hex = s.replaceAll(" ", "");
      if (hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) throw new Error(t("A ByteString is written in hexadecimal, for example 0A FF 10."));
      return Uint8Array.from(hex.match(/../g) ?? [], (pair) => parseInt(pair, 16));
    }
    default: {
      const [min, max] = RANGES[type];
      let big;
      try {
        big = /^0x[0-9a-f]+$/i.test(s) ? BigInt(s) : /^[+-]?\d+$/.test(s) ? BigInt(s) : null;
      } catch { big = null; }
      if (big === null) throw new Error(t("'{0}' is not a whole number ({1}).", text, type));
      if (big < min || big > max) throw new Error(t("{0} does not fit in {1} ({2} to {3}).", s, type, String(min), String(max)));
      return type === "Int64" || type === "UInt64" ? big : Number(big);
    }
  }
}

function parseValue(text, type, isArray) {
  if (!isArray) return parseScalar(text ?? "", type);
  let list;
  try { list = JSON.parse(text); } catch { list = null; }
  if (!Array.isArray(list)) throw new Error(t("An array is written as a list in square brackets, for example [1, 2, 3]."));
  return list.map((item, i) => {
    try {
      if (item === null || typeof item === "object") throw new Error("not a plain value");
      return parseScalar(String(item), type);
    } catch (error) {
      throw new Error(t("Element {0}: {1}", i + 1, error.message));
    }
  });
}

// ---- the plant ------------------------------------------------------------------------------

function buildPlant() {
  const nodes = new Map();
  const add = (id, parent, name, cls, extra = {}) => {
    const node = { id, parent, name, cls, children: [], rev: 0, status: "Good", ts: new Date(), ...extra };
    nodes.set(id, node);
    if (parent) nodes.get(parent).children.push(id);
    return node;
  };
  const ns = (id) => "ns=1;s=" + id;
  const folder = (id, parent, name) => add(ns(id), parent, name, "Object").id;
  const variable = (id, parent, name, type, value, writable = false) =>
    add(ns(id), parent, name, "Variable", { type, value, writable, isArray: Array.isArray(value) });

  add("i=84", null, "Root", "Object");
  add("i=85", "i=84", "Objects", "Object");
  add("i=86", "i=84", "Types", "Object");
  add("i=87", "i=84", "Views", "Object");
  add("i=2253", "i=85", "Server", "Object");
  add("i=2259", "i=2253", "State", "Variable", { type: "Int32", value: 0, writable: false, isArray: false });
  add("i=2258", "i=2253", "CurrentTime", "Variable", { type: "DateTime", value: new Date(), writable: false, isArray: false });
  add("i=2255", "i=2253", "NamespaceArray", "Variable", { type: "String", value: ["http://opcfoundation.org/UA/", "urn:opcua-explorer:demo-plant"], writable: false, isArray: true });

  const plant = folder("DemoPlant", "i=85", "Demo plant");

  const mixing = folder("MixingLine", plant, "Mixing line");
  [42, 61].forEach((level, i) => {
    const id = `MixingLine.Tank${pad(i + 1, 2)}`;
    const tank = folder(id, mixing, `Tank ${pad(i + 1, 2)}`);
    variable(id + ".Level", tank, "Level", "Double", level);
    variable(id + ".LevelSetpoint", tank, "LevelSetpoint", "Double", level, true);
    variable(id + ".Temperature", tank, "Temperature", "Double", i === 0 ? 38.5 : 41.2);
    variable(id + ".InletValveOpen", tank, "InletValveOpen", "Boolean", false);
    const agitator = folder(id + ".Agitator", tank, "Agitator");
    variable(id + ".Agitator.Running", agitator, "Running", "Boolean", i === 0, true);
    variable(id + ".Agitator.Speed", agitator, "Speed", "Float", 0);
    variable(id + ".Agitator.SpeedSetpoint", agitator, "SpeedSetpoint", "Float", 120, true);
  });
  const pump = folder("MixingLine.Pump01", mixing, "Pump 01");
  variable("MixingLine.Pump01.Running", pump, "Running", "Boolean", false);
  variable("MixingLine.Pump01.Current", pump, "Current", "Float", 0);
  variable("MixingLine.Pump01.Starts", pump, "Starts", "UInt32", 312);

  const packaging = folder("PackagingLine", plant, "Packaging line");
  const conveyor = folder("PackagingLine.Conveyor01", packaging, "Conveyor 01");
  variable("PackagingLine.Conveyor01.Running", conveyor, "Running", "Boolean", true, true);
  variable("PackagingLine.Conveyor01.Speed", conveyor, "Speed", "Float", 0);
  variable("PackagingLine.Conveyor01.SpeedSetpoint", conveyor, "SpeedSetpoint", "Float", Math.fround(0.8), true);
  const counters = folder("PackagingLine.Counters", packaging, "Counters");
  variable("PackagingLine.Counters.Good", counters, "Good", "UInt32", 1280);
  variable("PackagingLine.Counters.Rejected", counters, "Rejected", "UInt32", 14);
  variable("PackagingLine.Counters.Reset", counters, "Reset", "Boolean", false, true);
  variable("PackagingLine.State", packaging, "State", "Int16", 2);
  variable("PackagingLine.StateText", packaging, "StateText", "String", "Running");
  variable("PackagingLine.StatusWord", packaging, "StatusWord", "UInt16", 5);
  variable("PackagingLine.RecipeName", packaging, "RecipeName", "String", "Standard 500 g", true);

  const utilities = folder("Utilities", plant, "Utilities");
  const compressor = folder("Utilities.Compressor", utilities, "Compressor");
  variable("Utilities.Compressor.Pressure", compressor, "Pressure", "Double", 6.9);
  variable("Utilities.Compressor.MotorTemperature", compressor, "MotorTemperature", "Double", 54);
  const energy = folder("Utilities.Energy", utilities, "Energy");
  variable("Utilities.Energy.ActivePower", energy, "ActivePower", "Double", 31.4);
  variable("Utilities.Energy.TotalEnergy", energy, "TotalEnergy", "Double", 18452.7);
  variable("Utilities.Energy.PhaseCurrents", energy, "PhaseCurrents", "Double", [44.1, 45, 43.7]);

  const diagnostics = folder("Diagnostics", plant, "Diagnostics");
  variable("Diagnostics.Heartbeat", diagnostics, "Heartbeat", "UInt32", 0);
  variable("Diagnostics.PlantTime", diagnostics, "PlantTime", "DateTime", new Date());
  variable("Diagnostics.UnreliableSensor", diagnostics, "UnreliableSensor", "Double", 20);
  variable("Diagnostics.LastMessages", diagnostics, "LastMessages", "String", ["Plant started", "Recipe loaded", "", ""]);

  const types = folder("DataTypes", plant, "Data types");
  const samples = [
    ["Boolean", "Boolean", true], ["SByte", "SByte", -12], ["Byte", "Byte", 200], ["Int16", "Int16", -1200],
    ["UInt16", "UInt16", 51000], ["Int32", "Int32", -123456], ["UInt32", "UInt32", 3000000000],
    ["Int64", "Int64", -9000000000n], ["UInt64", "UInt64", 18000000000000000000n],
    ["Float", "Float", Math.fround(3.14159)], ["Double", "Double", 2.718281828459045], ["String", "String", "Hello"],
    ["DateTime", "DateTime", new Date("2026-01-31T14:30:00Z")], ["Guid", "Guid", "0f8fad5b-d9cb-469f-a165-70867728950e"],
    ["ByteString", "ByteString", Uint8Array.of(0x0a, 0xff, 0x10)], ["LocalizedText", "LocalizedText", "Ready"],
    ["BooleanArray", "Boolean", [true, false, true, true]], ["Int32Array", "Int32", [1, 2, 3, 5, 8, 13]],
    ["DoubleArray", "Double", [0.5, 1.5, 2.5]], ["StringArray", "String", ["red", "green", "blue"]],
  ];
  for (const [name, type, value] of samples) variable("DataTypes." + name, types, name, type, value, true);

  const bulk = folder("Bulk", plant, "Bulk sensors");
  const sensors = [];
  for (let a = 1; a <= 10; a++) {
    const area = folder(`Bulk.Area${pad(a, 2)}`, bulk, `Area ${pad(a, 2)}`);
    for (let s = 1; s <= 100; s++) {
      sensors.push(variable(`Bulk.Area${pad(a, 2)}.Sensor${pad(s, 3)}`, area, `Sensor${pad(s, 3)}`, "Float", Math.fround(20 + Math.random() * 10)));
    }
  }
  return { nodes, ns, sensors };
}

// ---- the stand-in service -------------------------------------------------------------------

export function createDemoBackend(ApiError) {
  const { nodes, ns, sensors } = buildPlant();
  const get = (id) => nodes.get(ns(id));
  // A change of value or quality counts as one revision; the watch list reports revisions.
  const set = (node, value, status = "Good") => {
    const before = node.status + "|" + formatValue(node);
    node.value = value;
    node.status = status;
    node.ts = new Date();
    if (before !== node.status + "|" + formatValue(node)) node.rev++;
  };

  let handlers = {};
  const emit = (name, payload) => handlers[name]?.(JSON.parse(JSON.stringify(payload)));

  let connection = null;      // { securityMode, securityPolicy, user }
  let writesEnabled = false;
  const watch = new Map();    // nodeId -> { name, node, seenRev, changes, order }
  let scan = { state: "idle", tags: [], token: 0 };

  // ---- simulation ----
  const sim = { tick: 0, level: [42, 61], temp: [38.5, 41.2], agitator: [0, 0], conveyor: 0, pumpRunning: false, energy: 18452.7, unreliable: 20 };
  const round = (x, digits) => Number(x.toFixed(digits));
  const clamp = (x, min, max) => Math.min(max, Math.max(min, x));

  function step() {
    sim.tick++;
    const dt = STEP_MS / 1000;
    let anyValve = false;
    for (let i = 0; i < 2; i++) {
      const id = `MixingLine.Tank${pad(i + 1, 2)}`;
      const setpoint = clamp(get(id + ".LevelSetpoint").value, 0, 100);
      const valve = sim.level[i] < setpoint - 0.5;
      anyValve ||= valve;
      sim.level[i] += valve ? 1.6 * dt : sim.level[i] > setpoint + 0.5 ? -0.9 * dt : 0;
      sim.level[i] = clamp(sim.level[i] + (Math.random() - 0.5) * 0.05, 0, 100);
      const target = get(id + ".Agitator.Running").value ? clamp(get(id + ".Agitator.SpeedSetpoint").value, 0, 300) : 0;
      sim.agitator[i] += clamp(target - sim.agitator[i], -25 * dt, 25 * dt);
      sim.temp[i] = clamp(sim.temp[i] + (sim.agitator[i] > 1 ? 0.02 : -0.01) + (Math.random() - 0.5) * 0.04, 18, 85);
      set(get(id + ".Level"), round(sim.level[i], 2));
      set(get(id + ".Temperature"), round(sim.temp[i], 2));
      set(get(id + ".InletValveOpen"), valve);
      set(get(id + ".Agitator.Speed"), round(sim.agitator[i], 1));
    }
    if (anyValve && !sim.pumpRunning) set(get("MixingLine.Pump01.Starts"), get("MixingLine.Pump01.Starts").value + 1);
    sim.pumpRunning = anyValve;
    set(get("MixingLine.Pump01.Running"), anyValve);
    set(get("MixingLine.Pump01.Current"), anyValve ? round(11.5 + Math.random(), 2) : 0);

    const on = get("PackagingLine.Conveyor01.Running").value;
    const speedSetpoint = clamp(get("PackagingLine.Conveyor01.SpeedSetpoint").value, 0, 2);
    sim.conveyor += clamp((on ? speedSetpoint : 0) - sim.conveyor, -0.3 * dt, 0.3 * dt);
    const good = get("PackagingLine.Counters.Good"), rejected = get("PackagingLine.Counters.Rejected");
    if (get("PackagingLine.Counters.Reset").value) {
      set(good, 0);
      set(rejected, 0);
      set(get("PackagingLine.Counters.Reset"), false);
    }
    if (sim.conveyor > 0.05 && Math.random() < sim.conveyor) {
      if (Math.random() < 0.02) set(rejected, rejected.value + 1); else set(good, good.value + 1);
    }
    const state = !on && sim.conveyor < 0.01 ? 0 : on && Math.abs(sim.conveyor - speedSetpoint) > 0.02 ? 1 : on ? 2 : 3;
    set(get("PackagingLine.Conveyor01.Speed"), round(sim.conveyor, 3));
    set(get("PackagingLine.State"), state);
    set(get("PackagingLine.StateText"), ["Stopped", "Starting", "Running", "Stopping"][state]);
    set(get("PackagingLine.StatusWord"), 1 | (state === 1 || state === 3 ? 2 : 0) | (state === 2 ? 4 : 0));

    const phase = sim.tick * dt;
    const power = 28 + 6 * Math.sin(phase / 9) + (sim.pumpRunning ? 7.5 : 0) + sim.conveyor * 3;
    sim.energy += power * dt / 3600;
    set(get("Utilities.Compressor.Pressure"), round(6.9 + 0.35 * Math.sin(phase / 5), 3));
    set(get("Utilities.Compressor.MotorTemperature"), round(54 + 3 * Math.sin(phase / 40), 2));
    set(get("Utilities.Energy.ActivePower"), round(power, 2));
    set(get("Utilities.Energy.TotalEnergy"), round(sim.energy, 3));
    set(get("Utilities.Energy.PhaseCurrents"), [1.42, 1.44, 1.4].map((k) => round(power * k + Math.random(), 2)));

    set(get("Diagnostics.Heartbeat"), sim.tick);
    set(get("Diagnostics.PlantTime"), new Date());
    set(nodes.get("i=2258"), new Date());
    // The unreliable sensor drops out for five seconds in every thirty and keeps its last reading.
    const failed = phase % 30 >= 25;
    if (!failed) sim.unreliable = round(20 + 2 * Math.sin(phase / 3), 3);
    set(get("Diagnostics.UnreliableSensor"), sim.unreliable, failed ? "BadSensorFailure" : "Good");

    for (let k = 0; k < 40; k++) {
      const sensor = sensors[Math.floor(Math.random() * sensors.length)];
      set(sensor, round(clamp(sensor.value + Math.random() - 0.5, 5, 60), 2));
    }

    if (connection) {
      const changed = [];
      for (const [nodeId, item] of watch) {
        if (item.node && item.node.rev !== item.seenRev) {
          item.seenRev = item.node.rev;
          item.changes++;
          changed.push(watchDto(nodeId, item));
        }
      }
      if (changed.length) emit("values", changed);
    }
  }
  setInterval(step, STEP_MS);

  // ---- shapes of the answers ----
  const valueDto = (node) => ({
    nodeId: node.id,
    text: formatValue(node),
    type: describeType(node),
    status: node.status,
    severity: node.status === "Good" ? "good" : "bad",
    sourceTimestamp: node.ts.toISOString(),
    serverTimestamp: new Date().toISOString(),
  });
  const missingValue = (nodeId) => ({ nodeId, text: "", type: "", status: "BadNodeIdUnknown", severity: "bad", sourceTimestamp: null, serverTimestamp: null });
  const watchDto = (nodeId, item) => ({
    nodeId, name: item.name,
    itemStatus: item.node ? "Good" : "BadNodeIdUnknown",
    monitored: Boolean(item.node),
    value: item.node && item.seenRev !== null ? valueDto(item.node) : null,
    changes: item.changes,
  });
  const watchList = () => [...watch].map(([nodeId, item]) => watchDto(nodeId, item));
  const status = () => ({
    state: connection ? "Connected" : "Disconnected",
    reason: null,
    url: connection ? DEMO_URL : null,
    securityMode: connection?.securityMode ?? null,
    securityPolicy: connection?.securityPolicy ?? null,
    user: connection?.user ?? null,
    namespaces: connection ? nodes.get("i=2255").value : [],
    limits: connection ? { maxNodesPerRead: 1000, maxNodesPerWrite: 1000, maxNodesPerBrowse: 100, maxMonitoredItemsPerCall: 1000 } : null,
    writesEnabled,
    demo: { running: true, url: DEMO_URL },
    version: "0.1.0",
    nativeVersion: "v1.5.10",
  });
  const scanState = () => ({
    state: scan.state, startNodeId: scan.start ?? null, startPath: scan.startPath ?? null,
    nodesVisited: scan.visited ?? 0, variables: scan.tags.length, depth: scan.depth ?? 0,
    truncated: Boolean(scan.truncated), message: scan.message ?? null, elapsedSeconds: scan.elapsed ?? 0,
  });
  const tagDto = (tag, withValue) => ({
    nodeId: tag.node.id, path: tag.path, name: tag.node.name, nodeClass: "Variable",
    dataType: tag.node.type, shape: tag.node.isArray ? "Array" : "Scalar", access: tag.node.writable ? "RW" : "R",
    value: withValue ? formatValue(tag.node) : null, status: withValue ? tag.node.status : null,
    sourceTimestamp: withValue ? tag.node.ts.toISOString() : null,
  });

  // ---- checks ----
  const requireConnection = () => { if (!connection) throw new ApiError(t("Not connected to a server.")); };
  const parseNodeId = (text) => {
    const id = (text ?? "").trim();
    if (!/^(ns=\d+;)?[isgb]=.+$/.test(id)) throw new ApiError(t("'{0}' is not a NodeId. Examples: ns=2;s=Pump01.Speed or ns=3;i=1001.", text ?? ""));
    return id;
  };
  const requireUrl = (url) => {
    const address = (url ?? "").trim();
    if (!address) throw new ApiError(t("Enter the server address, for example opc.tcp://192.168.0.10:4840."));
    if (!address.toLowerCase().startsWith("opc.tcp://")) throw new ApiError(t("The address must start with opc.tcp://"));
    if (address.toLowerCase().replace(/\/+$/, "") !== DEMO_URL) throw new ApiError(t("This online demo only reaches its simulated plant at {0}. The real tool connects to your own servers.", DEMO_URL));
  };

  // ---- scan ----
  const comparePaths = (a, b) => {
    const x = a.split("/"), y = b.split("/");
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      const c = x[i].localeCompare(y[i], "en", { numeric: true, sensitivity: "base" });
      if (c !== 0) return c;
    }
    return x.length - y.length;
  };

  async function runScan(request) {
    const token = ++scan.token;
    const start = nodes.get(request.nodeId ? parseNodeId(request.nodeId) : "i=85");
    const maxDepth = clamp(request.maxDepth ?? 12, 1, 64);
    const maxNodes = clamp(request.maxNodes ?? 50000, 1, 500000);
    const began = performance.now();
    scan = { token, state: "running", start: request.nodeId ?? "i=85", startPath: start?.name, tags: [], visited: 1, depth: 0, readValues: request.readValues !== false };
    const done = (state, message) => {
      scan.state = state;
      scan.message = [message, scan.depthLimited ? t("There are nodes deeper than {0} levels that were not visited.", maxDepth) : null].filter(Boolean).join(" ") || null;
      scan.elapsed = round((performance.now() - began) / 1000, 1);
      emit("scan", scanState());
    };
    emit("scan", scanState());
    if (!start) return done("failed", t("The server does not know {0}.", request.nodeId));

    let frontier = [{ node: start, path: start.name }];
    while (frontier.length && scan.depth < maxDepth && !scan.truncated) {
      await sleep(180);
      if (scan.token !== token) return;
      if (scan.cancelled) return done("cancelled", t("Stopped. The list shows what was found until then."));
      const next = [];
      for (const { node, path } of frontier) {
        for (const childId of node.children) {
          const child = nodes.get(childId);
          if (!request.includeServerNodes && childId === "i=2253") continue;
          scan.visited++;
          const childPath = path + "/" + child.name;
          if (child.cls === "Variable") scan.tags.push({ node: child, path: childPath });
          next.push({ node: child, path: childPath });
          if (scan.visited >= maxNodes) { scan.truncated = true; break; }
        }
        if (scan.truncated) break;
      }
      frontier = next;
      scan.depth++;
      emit("scan", scanState());
    }
    if (!scan.truncated && scan.depth >= maxDepth && frontier.some((f) => f.node.children.length)) {
      scan.depthLimited = true;
      scan.truncated = true;
    }
    scan.tags.sort((a, b) => comparePaths(a.path, b.path));
    scan.state = "reading";
    emit("scan", scanState());
    await sleep(250);
    if (scan.token !== token) return;
    done("completed", scan.truncated && !scan.depthLimited ? t("Stopped at the limit of {0} nodes. Scan a smaller branch or raise the limit.", maxNodes) : null);
  }

  // ---- the API ----
  const routes = {
    status: () => status(),
    endpoints: (body) => {
      requireUrl(body.url);
      return [
        { endpointUrl: DEMO_URL, securityMode: "None", securityPolicyUri: "http://opcfoundation.org/UA/SecurityPolicy#None", securityPolicy: "None", securityLevel: 0, userTokens: ["Anonymous"], serverName: "Demo plant", serverCertificateThumbprint: null, supported: true },
        { endpointUrl: DEMO_URL, securityMode: "SignAndEncrypt", securityPolicyUri: "http://opcfoundation.org/UA/SecurityPolicy#Basic256Sha256", securityPolicy: "Basic256Sha256", securityLevel: 3, userTokens: ["UserName"], serverName: "Demo plant", serverCertificateThumbprint: "5B1C0E7A94D23F6088A1C3D5E7F9024B6D8ACE13", supported: true },
      ];
    },
    connect: (body) => {
      requireUrl(body.url);
      const secure = body.securityMode && body.securityMode !== "None";
      if (secure && !body.acceptServerCertificate) throw new ApiError(t("The certificates were not accepted. Tick the box to accept the server's certificate."), "BadSecurityChecksFailed");
      if (secure && !body.userName) throw new ApiError(t("The server refused the sign-in. This endpoint needs a user name (any name works in the demo)."), "BadIdentityTokenRejected");
      connection = { securityMode: secure ? body.securityMode : "None", securityPolicy: secure ? "Basic256Sha256" : "None", user: secure ? body.userName : null };
      writesEnabled = false;
      watch.clear();
      emit("status", status());
      emit("watch", []);
      return status();
    },
    disconnect: () => {
      connection = null;
      writesEnabled = false;
      watch.clear();
      if (scan.state === "running" || scan.state === "reading") scan.cancelled = true;
      emit("status", status());
      emit("watch", []);
      return status();
    },
    "writes-enabled": (body) => {
      if (body.enabled) requireConnection();
      writesEnabled = Boolean(body.enabled);
      emit("status", status());
      return status();
    },
    browse: (_, query) => {
      requireConnection();
      const id = query.nodeId ? parseNodeId(query.nodeId) : "i=84";
      const node = nodes.get(id);
      if (!node) return { nodeId: id, status: "BadNodeIdUnknown", children: [] };
      return { nodeId: id, status: "Good", children: node.children.map((childId) => {
        const child = nodes.get(childId);
        return { nodeId: childId, displayName: child.name, browseName: child.name, nodeClass: child.cls, typeDefinition: child.cls === "Variable" ? "i=63" : "i=61" };
      }) };
    },
    node: (_, query) => {
      requireConnection();
      const id = parseNodeId(query.nodeId);
      const node = nodes.get(id);
      if (!node) throw new ApiError(t("The server does not know {0}.", id), "BadNodeIdUnknown");
      const isVariable = node.cls === "Variable";
      const browseName = (id.startsWith("ns=1") ? "1:" : "") + node.name;
      const attributes = [
        { name: "NodeClass", value: node.cls, status: null },
        { name: "BrowseName", value: browseName, status: null },
        { name: "DisplayName", value: node.name, status: null },
      ];
      if (isVariable) {
        const access = node.writable ? "Read and write" : "Read only";
        attributes.push(
          { name: "DataType", value: `${node.type} (i=${TYPE_IDS[node.type]})`, status: null },
          { name: "ValueRank", value: node.isArray ? "Array" : "Scalar", status: null },
          { name: "AccessLevel", value: access, status: null },
          { name: "UserAccessLevel", value: access, status: null },
          { name: "MinimumSamplingInterval", value: "0 ms", status: null },
          { name: "Historizing", value: "false", status: null });
      } else {
        attributes.push({ name: "EventNotifier", value: "0", status: null });
      }
      return {
        nodeId: id, nodeClass: node.cls, displayName: node.name, browseName, description: null, attributes,
        value: isVariable ? valueDto(node) : null,
        dataType: isVariable ? node.type : null, dataTypeId: isVariable ? `i=${TYPE_IDS[node.type]}` : null,
        builtInType: isVariable ? node.type : null, isArray: Boolean(node.isArray),
        canRead: isVariable, canWrite: isVariable && node.writable,
      };
    },
    read: (body) => {
      requireConnection();
      return (body.nodeIds ?? []).map((text) => {
        const id = parseNodeId(text);
        const node = nodes.get(id);
        return node?.cls === "Variable" ? valueDto(node) : missingValue(id);
      });
    },
    write: (body) => {
      requireConnection();
      if (!writesEnabled) throw new ApiError(t("Writing is locked. Unlock it first."));
      return (body.items ?? []).map((item) => {
        const id = parseNodeId(item.nodeId);
        const node = nodes.get(id);
        const fail = (code, message) => ({ nodeId: id, ok: false, status: code, message });
        if (!node || node.cls !== "Variable") return fail("BadNodeIdUnknown", null);
        if (!node.writable) return fail("BadNotWritable", t("The access level does not allow writing to the Node."));
        try {
          set(node, parseValue(item.value, node.type, node.isArray));
          node.rev++;
        } catch (error) {
          return fail("BadTypeMismatch", error.message);
        }
        return { nodeId: id, ok: true, status: "Good", message: null };
      });
    },
    scan: (body) => {
      if (body === undefined) return scanState();
      requireConnection();
      if (scan.state === "running" || scan.state === "reading") throw new ApiError(t("A scan is already running. Stop it first."));
      runScan(body);
      return scanState();
    },
    "scan/result": () => ({ state: scanState(), tags: scan.tags.map((tag) => tagDto(tag, scan.readValues)) }),
    "scan/cancel": () => { scan.cancelled = true; return scanState(); },
    "scan/refresh": () => { requireConnection(); scan.readValues = true; return scanState(); },
    watch: (body) => {
      if (body === undefined) return watchList();
      requireConnection();
      const fresh = (body.items ?? []).map((item) => ({ id: parseNodeId(item.nodeId), name: item.name })).filter((item) => !watch.has(item.id));
      if (watch.size + fresh.length > 2000) throw new ApiError(t("The watch list holds at most {0} tags.", 2000));
      for (const item of fresh) {
        const node = nodes.get(item.id);
        watch.set(item.id, { name: item.name?.trim() || item.id, node: node?.cls === "Variable" ? node : null, seenRev: null, changes: 0 });
      }
      emit("watch", watchList());
      return watchList();
    },
    "watch/remove": (body) => {
      for (const id of body.nodeIds ?? []) watch.delete(parseNodeId(id));
      emit("watch", watchList());
      return watchList();
    },
    "watch/clear": () => { watch.clear(); emit("watch", []); return []; },
    "demo/start": () => ({ running: true, url: DEMO_URL }),
    "demo/stop": () => ({ running: true, url: DEMO_URL }),
  };

  return {
    demo: true,
    demoUrl: DEMO_URL,
    async request(path, body) {
      const [route, queryText] = path.split("?");
      const handler = routes[route];
      await sleep(40 + Math.random() * 60); // a network would take about this long
      if (!handler) throw new ApiError(t("Request failed ({0}).", 404));
      return JSON.parse(JSON.stringify(handler(body, Object.fromEntries(new URLSearchParams(queryText ?? ""))) ?? null));
    },
    listen(newHandlers) {
      handlers = newHandlers;
      emit("status", status());
      emit("watch", watchList());
      emit("scan", scanState());
    },
    /** The scanned tag list as a CSV file, as the real tool's export does. */
    exportCsv() {
      const field = (value) => (/[",\r\n]/.test(value ?? "") ? `"${value.replaceAll('"', '""')}"` : value ?? "");
      const lines = ["Path,Name,NodeId,Kind,DataType,Shape,Access,Value,Status,SourceTimestamp"];
      for (const tag of scan.tags) {
        const d = tagDto(tag, true);
        lines.push([d.path, d.name, d.nodeId, d.nodeClass, d.dataType, d.shape, d.access, d.value, d.status, d.sourceTimestamp].map(field).join(","));
      }
      return new Blob(["﻿" + lines.join("\r\n") + "\r\n"], { type: "text/csv;charset=utf-8" });
    },
  };
}
