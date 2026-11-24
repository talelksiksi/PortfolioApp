// OPC UA Explorer, browser side. Plain JavaScript, no build step: the page talks to the local
// service over a small JSON API and receives live updates over Server-Sent Events.
//
// Names, paths and values come from the controller, so nothing here is ever inserted as HTML.
// Every piece of text goes through el(), which sets textContent.

import { t, LANGS, currentLang, setLang, onLangChange, locale } from "./i18n.js";

const $ = (id) => document.getElementById(id);

// ---- small helpers -------------------------------------------------------------------------

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (value === true) node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ---- where the data comes from ---------------------------------------------------------------
//
// Normally the tool's own service, next to this page. When the page is served on its own (the
// hosted demo), there is no service: a simulated plant in the browser answers instead. The choice
// is made once, at start, and only a clear "no such service here" switches to the simulation. A
// service that is merely slow, stopped or refusing never does, so the real tool cannot end up
// showing invented values.

const liveBackend = {
  demo: false,
  async request(path, body) {
    const init = body === undefined
      ? {}
      : {
          method: "POST",
          // The service only accepts changes that carry this header (see RequestGuard).
          headers: { "Content-Type": "application/json", "X-Explorer": "1" },
          body: JSON.stringify(body),
        };
    let response;
    try {
      response = await fetch("api/" + path, init);
    } catch {
      throw new ApiError(t("The tool's service is not answering. Is it still running?"));
    }
    if (!response.ok) {
      let problem = null;
      try { problem = await response.json(); } catch { /* not JSON */ }
      throw new ApiError(problem?.error ?? t("Request failed ({0}).", response.status), problem?.status);
    }
    return response.status === 204 ? null : response.json();
  },
  listen(handlers, onDown, onUp) {
    const source = new EventSource("api/events");
    for (const [name, handler] of Object.entries(handlers)) {
      source.addEventListener(name, (e) => handler(JSON.parse(e.data)));
    }
    source.onerror = onDown;
    source.onopen = onUp;
  },
};

let backend = liveBackend;

async function pickBackend() {
  let response;
  try {
    response = await fetch("api/status");
  } catch {
    return liveBackend;
  }
  const json = (response.headers.get("content-type") ?? "").includes("json");
  if (response.status === 404 && !json) {
    const demo = await import("./demo-backend.js");
    return demo.createDemoBackend(ApiError);
  }
  return liveBackend;
}

const api = (path, body) => backend.request(path, body);

function toast(text, fail = false) {
  const node = el("div", { class: "toast" + (fail ? " fail" : ""), text });
  $("toasts").append(node);
  setTimeout(() => node.remove(), fail ? 7000 : 3500);
}

function logActivity(text, kind = "") {
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  $("activity").prepend(el("li", { class: kind }, el("time", { text: time }), el("span", { text })));
  while ($("activity").children.length > 200) $("activity").lastChild.remove();
}

const errorText = (error) => (error.status ? `${error.message} (${error.status})` : error.message);

function report(error) {
  toast(errorText(error), true);
  logActivity(errorText(error), "fail");
}

function confirmDialog(title, text, okLabel) {
  const dialog = $("confirmDialog");
  $("confirmTitle").textContent = title;
  $("confirmText").textContent = text;
  $("confirmOk").textContent = okLabel;
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true });
    dialog.returnValue = "cancel";
    dialog.showModal();
  });
}

// Remembered between visits in this browser only. Storage can be unavailable; the tool works without it.
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem("opcua-explorer." + key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("opcua-explorer." + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

const fmtCount = (n) => n.toLocaleString(locale());
const localTime = (iso) => (iso ? new Date(iso).toLocaleTimeString("en-GB", { hour12: false }) + "." + iso.slice(20, 23) : "");
const severityOf = (status) => (!status || status.startsWith("Good") ? "good" : status.startsWith("Uncertain") ? "uncertain" : "bad");
const quality = (status, severity) => el("span", { class: "q " + (severity ?? severityOf(status)), text: status ?? "", title: status ?? "" });
// Text from the server (names, NodeIds, values) reads left to right in every language.
const ltr = (text, props = {}) => el("bdi", { dir: "ltr", ...props, text });

// ---- state ---------------------------------------------------------------------------------

const state = {
  status: null,
  connected: false,
  serviceDown: false,
  treeRoot: "i=85",
  nodes: new Map(),       // nodeId -> { node, parent, children, open, loading, note }
  selected: null,         // nodeId shown in the detail pane
  detail: null,
  tags: [],
  view: [],               // filtered and sorted tags
  checked: new Set(),
  sort: { key: "path", dir: 1 },
  scan: { state: "idle" },
  watch: new Map(),       // nodeId -> watch item
};

// ---- language ------------------------------------------------------------------------------

/** Static text of the page: every element marked data-t keeps its English text as the key. */
function translatePage() {
  const lang = currentLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  for (const node of document.querySelectorAll("[data-t]")) {
    node.dataset.t ||= node.textContent.trim();
    node.textContent = t(node.dataset.t);
  }
  for (const node of document.querySelectorAll("[data-t-placeholder]")) {
    node.dataset.tPlaceholder ||= node.getAttribute("placeholder");
    node.setAttribute("placeholder", t(node.dataset.tPlaceholder));
  }
  for (const node of document.querySelectorAll("[data-t-title]")) {
    node.dataset.tTitle ||= node.getAttribute("title");
    node.setAttribute("title", t(node.dataset.tTitle));
  }
  for (const button of document.querySelectorAll("#langs button")) {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  }
}

function renderAll() {
  translatePage();
  if (state.status) applyStatus(state.status);
  renderEndpoints();
  renderTree();
  renderDetail();
  applyScan(state.scan, true);
  applyFilter();
  renderWatch();
}

// ---- connection ----------------------------------------------------------------------------

let endpoints = [];
let endpointChoice = null;

function selectedEndpoint() {
  const picked = document.querySelector('input[name="endpoint"]:checked');
  return picked ? endpoints[Number(picked.value)] : null;
}

function renderEndpoints() {
  const box = $("endpoints");
  box.replaceChildren();
  box.hidden = endpoints.length === 0;
  if (endpointChoice === null || !endpoints[endpointChoice]?.supported) endpointChoice = endpoints.findLastIndex((e) => e.supported);
  endpoints.forEach((e, i) => {
    const mode = e.securityMode === "None" ? t("No security")
      : e.securityMode === "SignAndEncrypt" ? t("Sign and encrypt, {0}", e.securityPolicy) : t("Sign, {0}", e.securityPolicy);
    const tokens = e.userTokens.map((k) => (k === "UserName" ? t("user name") : k === "Anonymous" ? t("anonymous") : k.toLowerCase())).join(", ") || t("none");
    const sub = [
      t("Sign-in: {0}", tokens),
      e.serverCertificateThumbprint ? t("Server certificate {0}", e.serverCertificateThumbprint) : null,
      e.supported ? null : t("Not supported by this tool yet"),
    ].filter(Boolean).join(" · ");
    box.append(el("label", { class: "endpoint" + (e.supported ? "" : " unsupported") },
      el("input", { type: "radio", name: "endpoint", value: i, disabled: !e.supported, checked: i === endpointChoice,
        onchange: () => { endpointChoice = i; syncAcceptRow(); } }),
      el("div", {}, el("div", { class: "endpoint-title", text: mode }), el("div", { class: "endpoint-sub", text: sub }))));
  });
  syncAcceptRow();
}

function syncAcceptRow() {
  const endpoint = selectedEndpoint();
  $("acceptRow").hidden = !endpoint || endpoint.securityMode === "None";
}

async function lookUpEndpoints() {
  $("connectError").textContent = "";
  $("endpointsBtn").disabled = true;
  endpointChoice = null;
  try {
    endpoints = await api("endpoints", { url: $("urlInput").value });
    if (backend.demo) endpointChoice = 0; // the plain endpoint: one click to get in
    renderEndpoints();
    if (endpoints.length === 0) $("connectError").textContent = t("The server answered but offers no endpoints.");
  } catch (error) {
    endpoints = [];
    renderEndpoints();
    $("connectError").textContent = errorText(error);
  } finally {
    $("endpointsBtn").disabled = false;
  }
}

async function connect(event) {
  event.preventDefault();
  $("connectError").textContent = "";
  $("connectBtn").disabled = true;
  const endpoint = selectedEndpoint();
  const url = $("urlInput").value.trim();
  try {
    await api("connect", {
      url,
      securityMode: endpoint?.securityMode ?? "None",
      securityPolicyUri: endpoint?.securityPolicyUri ?? null,
      userName: $("userInput").value || null,
      password: $("passInput").value || null,
      acceptServerCertificate: $("acceptInput").checked,
    });
    $("passInput").value = "";
    if (!backend.demo) {
      store.set("recent", [url, ...store.get("recent", []).filter((u) => u !== url)].slice(0, 8));
      renderRecent();
    }
    logActivity(t("Connected to {0}", url), "ok");
  } catch (error) {
    $("connectError").textContent = errorText(error);
  } finally {
    $("connectBtn").disabled = false;
  }
}

function renderRecent() {
  $("recentServers").replaceChildren(...store.get("recent", []).map((u) => el("option", { value: u })));
}

function applyStatus(status) {
  const wasConnected = state.connected;
  state.status = status;
  state.connected = status.state !== "Disconnected";

  if (!state.serviceDown) {
    $("statePill").className = "pill" + (status.state === "Connected" ? " connected" : state.connected ? " busy" : "");
    $("stateText").textContent = status.state === "Disconnected" ? t("Not connected") : t(status.state);
  }
  $("connUrl").textContent = status.url ?? "";
  $("connSec").textContent = state.connected
    ? [status.securityMode === "None" ? t("No security") : `${status.securityMode}, ${status.securityPolicy}`,
       status.user ? t("user {0}", status.user) : t("anonymous")].join(" · ")
    : "";

  $("welcome").hidden = state.connected;
  $("workspace").hidden = !state.connected;
  $("disconnectBtn").hidden = !state.connected;
  $("lockBtn").hidden = !state.connected;
  $("lockBtn").classList.toggle("open", status.writesEnabled);
  $("lockText").textContent = status.writesEnabled ? t("Writing unlocked") : t("Writing locked");
  $("lockBtn").title = status.writesEnabled ? t("Values you write go to the controller. Click to lock again.") : t("Writing is locked. Click to unlock.");

  $("demoBtn").textContent = status.demo.running ? t("Stop the demo plant") : t("Start the demo plant");
  $("demoState").textContent = status.demo.running ? t("Running at {0}", status.demo.url) : "";
  $("about").textContent = t("Version {0} · open62541 {1}", status.version, status.nativeVersion);

  if (state.connected && !wasConnected) {
    resetWorkspace();
    loadChildren(state.treeRoot, true);
  }
  if (state.detail) renderDetail();
}

function resetWorkspace() {
  state.nodes.clear();
  state.selected = null;
  state.detail = null;
  state.tags = [];
  state.checked.clear();
  renderDetail();
  applyFilter();
}

// ---- tree ----------------------------------------------------------------------------------

const caretSvg = () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 10 10");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M3 1.5 7 5 3 8.5");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.6");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.append(path);
  return svg;
};

// Two tanks both have a "Level": on the watch list a tag is named with its parent in front.
function watchName(nodeId, fallback) {
  const item = state.nodes.get(nodeId);
  const parent = item?.parent && item.parent !== state.treeRoot ? state.nodes.get(item.parent) : null;
  const name = item?.node.displayName ?? fallback ?? nodeId;
  return parent ? `${parent.node.displayName} / ${name}` : name;
}

const shortPath = (path) => path.split("/").slice(-2).join(" / ");

const kindLetter = { Object: "O", Variable: "V", Method: "M", View: "W", ObjectType: "T", VariableType: "T", DataType: "D", ReferenceType: "R" };
const canHaveChildren = (nodeClass) => nodeClass !== "Method";

function entry(nodeId, node) {
  let item = state.nodes.get(nodeId);
  if (!item) {
    item = { node: node ?? { nodeId, displayName: nodeId, nodeClass: "Object" }, parent: null, children: null, open: false, loading: false, note: null };
    state.nodes.set(nodeId, item);
  } else if (node) {
    item.node = node;
  }
  return item;
}

async function loadChildren(nodeId, open) {
  const item = entry(nodeId);
  item.loading = true;
  item.note = null;
  if (open) item.open = true;
  renderTree();
  try {
    const result = await api("browse?nodeId=" + encodeURIComponent(nodeId));
    item.children = result.children.map((child) => {
      entry(child.nodeId, child).parent = nodeId;
      return child.nodeId;
    });
    if (result.status !== "Good") item.note = result.status;
  } catch (error) {
    item.children = [];
    item.note = error.status ?? error.message;
  } finally {
    item.loading = false;
    renderTree();
  }
}

function toggle(nodeId) {
  const item = entry(nodeId);
  if (item.open) {
    item.open = false;
    renderTree();
  } else if (item.children === null) {
    loadChildren(nodeId, true);
  } else {
    item.open = true;
    renderTree();
  }
}

function renderTree() {
  const rows = [];
  const indent = (px) => `padding-inline-start:${px}px`;
  const visit = (nodeId, depth) => {
    const item = state.nodes.get(nodeId);
    if (!item) return;
    for (const childId of item.children ?? []) {
      const child = state.nodes.get(childId);
      const node = child.node;
      const expandable = canHaveChildren(node.nodeClass) && !(child.children && child.children.length === 0);
      rows.push(el("div", {
          class: "tree-row" + (child.open ? " open" : "") + (state.selected === childId ? " selected" : ""),
          style: indent(8 + depth * 16),
          role: "treeitem",
          dataset: { id: childId },
          title: childId,
          onclick: () => select(childId),
          ondblclick: () => expandable && toggle(childId),
        },
        el("span", { class: "tree-caret" + (expandable ? "" : " leaf"), onclick: (e) => { e.stopPropagation(); if (expandable) toggle(childId); } }, caretSvg()),
        el("span", { class: "kind " + node.nodeClass, text: kindLetter[node.nodeClass] ?? "?" }),
        ltr(node.displayName, { class: "tree-name" }),
        el("span", { class: "tree-actions" },
          node.nodeClass === "Variable"
            ? el("button", { class: "btn", text: t("Watch"), onclick: (e) => { e.stopPropagation(); addWatch([{ nodeId: childId, name: watchName(childId) }]); } })
            : null,
          node.nodeClass === "Object" || node.nodeClass === "View"
            ? el("button", { class: "btn", text: t("List tags"), onclick: (e) => { e.stopPropagation(); startScan(childId); } })
            : null)));
      if (child.loading) rows.push(el("div", { class: "tree-note", style: indent(46 + depth * 16), text: t("Reading") }));
      if (child.note) rows.push(el("div", { class: "tree-note", style: indent(46 + depth * 16), text: child.note }));
      if (child.open) visit(childId, depth + 1);
    }
  };
  const root = state.nodes.get(state.treeRoot);
  if (root?.loading && !root.children) rows.push(el("div", { class: "tree-note", style: indent(14), text: t("Reading the address space") }));
  if (root?.note) rows.push(el("div", { class: "tree-note", style: indent(14), text: root.note }));
  visit(state.treeRoot, 0);
  if (root?.children?.length === 0 && !root.note) rows.push(el("div", { class: "tree-note", style: indent(14), text: t("This server shows nothing here.") }));
  const tree = $("tree");
  const scroll = tree.scrollTop;
  tree.replaceChildren(...rows);
  tree.scrollTop = scroll;
  $("treeRootBtn").textContent = state.treeRoot === "i=85" ? "Objects" : "Root";
}

// ---- selected node -------------------------------------------------------------------------

async function select(nodeId) {
  state.selected = nodeId;
  renderTree();
  renderTags();
  try {
    state.detail = await api("node?nodeId=" + encodeURIComponent(nodeId));
    state.detail.writeResult = null;
  } catch (error) {
    state.detail = { nodeId, error: errorText(error) };
  }
  if (state.selected === nodeId) renderDetail();
}

function watchNameFor(detail) {
  const tag = state.tags.find((x) => x.nodeId === detail.nodeId);
  return tag ? shortPath(tag.path) : watchName(detail.nodeId, detail.displayName);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(t("Copied"));
  } catch {
    toast(t("Copying is not available here. Select the text instead."), true);
  }
}

function renderDetail() {
  const box = $("detail");
  const d = state.detail;
  if (!d) {
    box.replaceChildren(el("p", { class: "muted pad", text: t("Nothing selected.") }));
    return;
  }
  if (d.error) {
    box.replaceChildren(
      el("div", { class: "detail-id" }, ltr(d.nodeId, { class: "mono" })),
      el("p", { class: "pad form-error", text: d.error }));
    return;
  }

  const parts = [
    el("div", { class: "detail-title" },
      el("div", { class: "row" }, el("span", { class: "kind " + d.nodeClass, text: kindLetter[d.nodeClass] ?? "?" }), ltr(d.displayName, { class: "name" }))),
    el("div", { class: "detail-id" },
      ltr(d.nodeId, { class: "mono" }),
      el("button", { class: "btn tiny ghost", text: t("Copy"), onclick: () => copyText(d.nodeId) })),
  ];

  if (d.value) {
    const v = d.value;
    const watched = state.watch.has(d.nodeId);
    parts.push(el("div", { class: "value-box" },
      el("div", { class: "value", id: "detailValue", dir: "ltr", text: v.text === "" ? t("(no value)") : v.text }),
      el("div", { class: "meta" },
        quality(v.status, v.severity),
        ltr(v.type || d.dataType || ""),
        v.sourceTimestamp ? el("span", { text: t("source {0}", localTime(v.sourceTimestamp)), title: v.sourceTimestamp }) : null),
      el("div", { class: "actions" },
        el("button", { class: "btn tiny", text: t("Read again"), onclick: () => select(d.nodeId) }),
        el("button", { class: "btn tiny", text: watched ? t("On the watch list") : t("Add to watch"), disabled: watched,
          onclick: () => addWatch([{ nodeId: d.nodeId, name: watchNameFor(d) }]) }))));

    if (d.canWrite) {
      const unlocked = state.status?.writesEnabled;
      const typeText = d.builtInType ? (d.isArray ? t("{0} array", d.builtInType) : d.builtInType) : t("unknown type");
      const input = el("input", { class: "mono", type: "text", id: "writeInput", dir: "ltr", spellcheck: "false", disabled: !unlocked,
        placeholder: d.isArray ? "[1, 2, 3]" : t("New value"), value: d.pendingWrite ?? "" });
      input.addEventListener("input", () => { d.pendingWrite = input.value; });
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") writeSelected(); });
      parts.push(el("div", { class: "write-box" },
        el("label", { for: "writeInput", text: t("Write a value ({0})", typeText) }),
        el("div", { class: "row" }, input, el("button", { class: "btn primary", text: t("Write"), disabled: !unlocked, onclick: writeSelected })),
        unlocked ? null : el("div", { class: "hint", text: t("Writing is locked. Unlock it in the top bar first.") }),
        d.writeResult ? el("div", { class: "result " + (d.writeResult.ok ? "ok" : "fail"), text: d.writeResult.text }) : null));
    }
  }

  const attrs = el("dl", { class: "attrs" });
  if (d.description) attrs.append(el("dt", { text: t("Description") }), el("dd", { text: d.description }));
  for (const a of d.attributes) {
    if (a.name === "DisplayName" || a.name === "Description" || (a.name === "ArrayDimensions" && a.value === "[]")) continue;
    attrs.append(el("dt", { text: a.name }), el("dd", {}, ltr(a.status ? `${a.value} (${a.status})`.trim() : a.value)));
  }
  parts.push(attrs);
  box.replaceChildren(...parts);
}

async function writeSelected() {
  const d = state.detail;
  const input = $("writeInput");
  if (!d || !input) return;
  const value = input.value;
  const ok = await confirmDialog(t("Write this value?"),
    `${d.displayName}\n${d.nodeId}\n\n${t("New value: {0}", value)}\n\n${t("It goes straight to the controller.")}`, t("Write"));
  if (!ok) return;
  try {
    const [result] = await api("write", { items: [{ nodeId: d.nodeId, value, type: d.builtInType, isArray: d.isArray }] });
    const text = result.ok ? t("Written: {0}", value) : `${result.message ?? t("Refused")} (${result.status})`;
    logActivity(t("Write {0}: {1}", d.displayName, result.ok ? value : text), result.ok ? "ok" : "fail");
    if (result.ok) {
      await select(d.nodeId);
      if (state.detail?.nodeId === d.nodeId) {
        state.detail.writeResult = { ok: true, text };
        renderDetail();
      }
    } else {
      d.writeResult = { ok: false, text };
      renderDetail();
    }
  } catch (error) {
    report(error);
  }
}

async function toggleLock() {
  const enable = !state.status?.writesEnabled;
  if (enable) {
    const ok = await confirmDialog(t("Unlock writing?"),
      t("Values you write go straight to the controller and can move a machine. Unlock only when you know the installation is safe to write to."), t("Unlock"));
    if (!ok) return;
  }
  try {
    await api("writes-enabled", { enabled: enable });
    logActivity(enable ? t("Writing unlocked") : t("Writing locked"));
  } catch (error) {
    report(error);
  }
}

// ---- tags (scan results) -------------------------------------------------------------------

async function startScan(nodeId) {
  showTab("tags");
  try {
    // Progress and the end of the scan arrive as events; the answer to this request only
    // confirms that it started (a small scan can finish before the answer is read).
    await api("scan", {
      nodeId,
      maxDepth: Number($("optDepth").value) || null,
      maxNodes: Number($("optNodes").value) || null,
      includeServerNodes: $("optServer").checked,
      readValues: $("optValues").checked,
    });
  } catch (error) {
    report(error);
  }
}

let scanWasRunning = false;
let scanSeen = false;

function scanText(scan) {
  const where = scan.startPath ?? scan.startNodeId ?? "";
  if (scan.state === "idle") return t("Pick a folder in the address space and choose List tags.");
  if (scan.state === "running") return t("Scanning {0}: {1} nodes, {2} variables so far", where, fmtCount(scan.nodesVisited), fmtCount(scan.variables));
  if (scan.state === "reading") return t("Reading types and values of {0} variables under {1}", fmtCount(scan.variables), where);
  const text = t("{0} variables under {1}, {2} nodes visited in {3} s.", fmtCount(scan.variables), where, fmtCount(scan.nodesVisited), scan.elapsedSeconds);
  return scan.message ? text + " " + scan.message : text;
}

function applyScan(scan, redrawOnly = false) {
  state.scan = scan;
  const running = scan.state === "running" || scan.state === "reading";
  $("scanbar").className = "scanbar" + (running ? " running" : scan.state === "failed" ? " problem" : "");
  $("scanStopBtn").hidden = !running;
  $("scanText").textContent = scanText(scan);
  if (redrawOnly) return;

  if (running && !scanWasRunning) {
    state.tags = [];
    state.checked.clear();
    applyFilter();
  }
  if (scanWasRunning && !running) {
    loadScanResult();
    logActivity(scanText(scan), scan.state === "failed" ? "fail" : "");
  } else if (!scanSeen && !running && scan.state !== "idle") {
    loadScanResult(); // the page was opened after a scan had finished
  }
  scanSeen = true;
  scanWasRunning = running;
}

async function loadScanResult() {
  try {
    const result = await api("scan/result");
    state.tags = result.tags;
    for (const tag of state.tags) tag.search = `${tag.name}\n${tag.path}\n${tag.nodeId}\n${tag.dataType ?? ""}\n${tag.value ?? ""}`.toLowerCase();
    applyFilter();
  } catch (error) {
    report(error);
  }
}

function applyFilter() {
  const words = $("filterInput").value.toLowerCase().split(/\s+/).filter(Boolean);
  const hideProps = $("hidePropsInput").checked;
  const { key, dir } = state.sort;
  state.view = state.tags.filter((x) => (!hideProps || x.nodeClass !== "Property") && words.every((w) => x.search.includes(w)));
  if (key !== "path" || dir !== 1) {
    // The server already returns the list in tree order; other orders are sorted here.
    const numeric = key === "value";
    state.view.sort((a, b) => {
      const x = a[key] ?? "", y = b[key] ?? "";
      if (numeric && x !== "" && y !== "" && !isNaN(x) && !isNaN(y)) return (Number(x) - Number(y)) * dir;
      return String(x).localeCompare(String(y), undefined, { numeric: true }) * dir;
    });
  }
  for (const head of document.querySelectorAll("#tagsGrid [data-sort]")) {
    head.classList.toggle("asc", head.dataset.sort === key && dir === 1);
    head.classList.toggle("desc", head.dataset.sort === key && dir === -1);
  }
  const total = state.tags.length;
  $("tagCount").textContent = total === 0 ? "" : state.view.length === total ? fmtCount(total) : t("{0} of {1}", fmtCount(state.view.length), fmtCount(total));
  $("refreshBtn").disabled = total === 0;
  $("exportBtn").setAttribute("aria-disabled", String(total === 0));
  syncSelectionButtons();
  $("tagsBody").scrollTop = 0;
  renderTags();
}

function syncSelectionButtons() {
  const n = state.checked.size;
  $("watchSelBtn").disabled = n === 0;
  $("watchSelBtn").textContent = n === 0 ? t("Watch selected") : t("Watch {0} selected", fmtCount(n));
  $("selectAll").checked = state.view.length > 0 && state.view.every((x) => state.checked.has(x.nodeId));
}

// Only the rows in view are in the page, so a list of fifty thousand tags scrolls like one of fifty.
const ROW = 30;

function renderTags() {
  const body = $("tagsBody");
  const spacer = $("tagsSpacer");
  const count = state.view.length;
  spacer.style.height = count * ROW + "px";
  const first = Math.max(0, Math.floor(body.scrollTop / ROW) - 8);
  const last = Math.min(count, Math.ceil((body.scrollTop + body.clientHeight) / ROW) + 8);
  const rows = [spacer];
  if (count === 0) {
    const text = state.tags.length > 0 ? t("No tag matches the filter.")
      : state.scan.state === "running" || state.scan.state === "reading" ? t("Scanning") : t("No tags listed yet.");
    rows.push(el("div", { class: "grid-empty", text }));
  }
  for (let i = first; i < last; i++) {
    const x = state.view[i];
    const check = el("input", { type: "checkbox", checked: state.checked.has(x.nodeId) });
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      if (check.checked) state.checked.add(x.nodeId); else state.checked.delete(x.nodeId);
      syncSelectionButtons();
    });
    rows.push(el("div", { class: "grid-row" + (state.selected === x.nodeId ? " selected" : ""), style: `top:${i * ROW}px`, onclick: () => select(x.nodeId) },
      el("div", { class: "c-check" }, check),
      el("div", { class: "c-ltr", title: `${x.name}\n${x.path}` }, el("span", { class: "kind " + x.nodeClass, style: "display:inline-grid;margin-inline-end:7px;vertical-align:-4px", text: x.nodeClass === "Property" ? "P" : "V" }), x.name),
      // Cut at the start so the end of a long path, the part that differs, stays visible.
      el("div", { class: "c-path", title: x.path }, el("bdi", { text: x.path })),
      el("div", { class: "c-mono c-ltr", title: x.nodeId, text: x.nodeId }),
      el("div", { class: "c-ltr", title: x.shape && x.shape !== "Scalar" ? `${x.dataType} (${x.shape})` : x.dataType, text: (x.dataType ?? "") + (x.shape && x.shape !== "Scalar" ? "[]" : "") }),
      el("div", { class: "c-ltr", text: x.access ?? "" }),
      el("div", { class: "c-value c-ltr", title: x.value ?? "", text: x.value ?? "" }),
      el("div", {}, x.status ? quality(x.status) : null)));
  }
  body.replaceChildren(...rows);
}

async function refreshValues() {
  $("refreshBtn").disabled = true;
  try {
    await api("scan/refresh", {});
    await loadScanResult();
    toast(t("Values read again"));
  } catch (error) {
    report(error);
  } finally {
    $("refreshBtn").disabled = state.tags.length === 0;
  }
}

// ---- watch list ----------------------------------------------------------------------------

async function addWatch(items) {
  try {
    const before = state.watch.size;
    applyWatch(await api("watch", { items }));
    const added = state.watch.size - before;
    toast(added === 0 ? t("Already on the watch list") : added === 1 ? t("Added to the watch list") : t("{0} tags added to the watch list", fmtCount(added)));
  } catch (error) {
    report(error);
  }
}

function applyWatch(items) {
  state.watch = new Map(items.map((i) => [i.nodeId, i]));
  $("watchCount").textContent = items.length ? fmtCount(items.length) : "";
  $("watchClearBtn").disabled = items.length === 0;
  renderWatch();
  if (state.detail?.value) renderDetail();
}

function watchRow(item) {
  const v = item.value;
  return el("div", { class: "grid-row" + (state.selected === item.nodeId ? " selected" : ""), dataset: { id: item.nodeId }, onclick: () => select(item.nodeId) },
    el("div", { class: "c-ltr", title: item.name, text: item.name }),
    el("div", { class: "c-mono c-ltr", title: item.nodeId, text: item.nodeId }),
    el("div", { class: "c-value c-ltr", "data-cell": "value", title: v?.text ?? "", text: v?.text ?? "" }),
    el("div", { class: "c-ltr", "data-cell": "type", text: v?.type ?? "" }),
    el("div", { "data-cell": "quality" }, item.monitored ? (v ? quality(v.status, v.severity) : null) : quality(item.itemStatus, "bad")),
    el("div", { class: "c-mono c-ltr", "data-cell": "time", title: v?.sourceTimestamp ?? "", text: localTime(v?.sourceTimestamp) }),
    el("div", { class: "c-mono num", "data-cell": "changes", text: fmtCount(item.changes) }),
    el("div", {}, el("button", { class: "icon-btn", title: t("Remove from the watch list"), text: "×",
      onclick: async (e) => {
        e.stopPropagation();
        try { applyWatch(await api("watch/remove", { nodeIds: [item.nodeId] })); } catch (error) { report(error); }
      } })));
}

function renderWatch() {
  const body = $("watchBody");
  if (state.watch.size === 0) {
    body.replaceChildren(el("div", { class: "grid-empty", text: t("The watch list is empty. Add tags from the tree, the tag list or the selected node.") }));
    return;
  }
  body.replaceChildren(...[...state.watch.values()].map(watchRow));
}

function applyValues(items) {
  const body = $("watchBody");
  for (const item of items) {
    if (!state.watch.has(item.nodeId)) continue;
    state.watch.set(item.nodeId, item);
    const row = body.querySelector(`[data-id="${CSS.escape(item.nodeId)}"]`);
    if (!row) continue;
    const v = item.value;
    const cell = (name) => row.querySelector(`[data-cell="${name}"]`);
    const valueCell = cell("value");
    if (valueCell.textContent !== (v?.text ?? "")) {
      valueCell.textContent = v?.text ?? "";
      valueCell.title = v?.text ?? "";
      valueCell.classList.remove("flash");
      void valueCell.offsetWidth; // restart the highlight
      valueCell.classList.add("flash");
    }
    cell("type").textContent = v?.type ?? "";
    cell("quality").replaceChildren(v ? quality(v.status, v.severity) : "");
    cell("time").textContent = localTime(v?.sourceTimestamp);
    cell("changes").textContent = fmtCount(item.changes);

    // Keep the selected node's value box live as well.
    if (state.detail?.nodeId === item.nodeId && v && state.detail.value) {
      state.detail.value = v;
      const box = $("detailValue");
      if (box) box.textContent = v.text === "" ? t("(no value)") : v.text;
    }
  }
}

// ---- tabs and wiring -----------------------------------------------------------------------

function showTab(name) {
  for (const tab of document.querySelectorAll(".tab")) tab.classList.toggle("active", tab.dataset.tab === name);
  $("tab-tags").hidden = name !== "tags";
  $("tab-watch").hidden = name !== "watch";
  if (name === "tags") renderTags();
}

function listen() {
  backend.listen({
      status: applyStatus,
      watch: applyWatch,
      values: applyValues,
      scan: (scan) => applyScan(scan),
      notice: (notice) => { logActivity(notice.text); toast(notice.text); },
    },
    () => {
      if (state.serviceDown) return;
      state.serviceDown = true;
      $("statePill").className = "pill busy";
      $("stateText").textContent = t("Tool not answering");
    },
    () => { state.serviceDown = false; });
}

/** The hosted demo: say so, hide what needs the real service, and get the visitor one click from the plant. */
async function setUpDemo() {
  document.body.classList.add("is-demo");
  $("demoBanner").hidden = false;
  $("urlInput").value = backend.demoUrl;
  await lookUpEndpoints();
}

async function init() {
  $("langs").replaceChildren(...[["en", "EN"], ["fr", "FR"], ["ar", "عربي"]].filter(([code]) => LANGS.includes(code)).map(([code, label]) =>
    el("button", { type: "button", lang: code, dataset: { lang: code }, text: label, onclick: () => setLang(code) })));
  translatePage();
  onLangChange(renderAll);

  backend = await pickBackend();

  renderRecent();
  const recent = store.get("recent", []);
  if (recent.length && !backend.demo) $("urlInput").value = recent[0];

  $("connectForm").addEventListener("submit", connect);
  $("endpointsBtn").addEventListener("click", lookUpEndpoints);
  $("urlInput").addEventListener("input", () => { endpoints = []; renderEndpoints(); });
  $("disconnectBtn").addEventListener("click", async () => {
    try { await api("disconnect", {}); logActivity(t("Disconnected")); } catch (error) { report(error); }
  });
  $("lockBtn").addEventListener("click", toggleLock);
  $("demoBtn").addEventListener("click", async () => {
    const running = state.status?.demo.running;
    $("demoBtn").disabled = true;
    try {
      const demo = await api(running ? "demo/stop" : "demo/start", {});
      if (demo.running) {
        $("urlInput").value = demo.url;
        await lookUpEndpoints();
      }
    } catch (error) {
      $("connectError").textContent = error.message;
    } finally {
      $("demoBtn").disabled = false;
    }
  });

  $("treeRootBtn").addEventListener("click", () => {
    state.treeRoot = state.treeRoot === "i=85" ? "i=84" : "i=85";
    loadChildren(state.treeRoot, true);
  });
  $("treeReloadBtn").addEventListener("click", () => {
    const open = [...state.nodes].filter(([, item]) => item.open).map(([id]) => id);
    state.nodes.clear();
    loadChildren(state.treeRoot, true).then(() => Promise.all(open.filter((id) => id !== state.treeRoot && state.nodes.has(id)).map((id) => loadChildren(id, true))));
  });

  for (const tab of document.querySelectorAll(".tab")) tab.addEventListener("click", () => showTab(tab.dataset.tab));

  let filterTimer;
  $("filterInput").addEventListener("input", () => { clearTimeout(filterTimer); filterTimer = setTimeout(applyFilter, 120); });
  $("hidePropsInput").addEventListener("change", applyFilter);
  for (const head of document.querySelectorAll("#tagsGrid [data-sort]")) {
    head.addEventListener("click", () => {
      const key = head.dataset.sort;
      state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : 1 };
      applyFilter();
    });
  }
  $("selectAll").addEventListener("change", (e) => {
    for (const x of state.view) {
      if (e.target.checked) state.checked.add(x.nodeId); else state.checked.delete(x.nodeId);
    }
    syncSelectionButtons();
    renderTags();
  });
  let frame = 0;
  $("tagsBody").addEventListener("scroll", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(renderTags);
  });
  new ResizeObserver(() => renderTags()).observe($("tagsBody"));

  $("refreshBtn").addEventListener("click", refreshValues);
  $("exportBtn").addEventListener("click", (e) => {
    if (!backend.demo) return; // the service sends the file
    e.preventDefault();
    const link = el("a", { href: URL.createObjectURL(backend.exportCsv()), download: "tags.csv" });
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  });
  $("watchSelBtn").addEventListener("click", async () => {
    const byId = new Map(state.tags.map((x) => [x.nodeId, x]));
    const items = [...state.checked].map((id) => ({ nodeId: id, name: byId.has(id) ? shortPath(byId.get(id).path) : id }));
    await addWatch(items);
    state.checked.clear();
    syncSelectionButtons();
    renderTags();
    showTab("watch");
  });
  $("scanStopBtn").addEventListener("click", async () => {
    try { await api("scan/cancel", {}); } catch (error) { report(error); }
  });
  $("watchClearBtn").addEventListener("click", async () => {
    try { applyWatch(await api("watch/clear", {})); } catch (error) { report(error); }
  });
  $("activityClearBtn").addEventListener("click", () => $("activity").replaceChildren());
  document.addEventListener("click", (e) => {
    const opts = document.querySelector(".scanopts");
    if (opts.open && !opts.contains(e.target)) opts.open = false;
  });

  renderWatch();
  listen();
  if (backend.demo) await setUpDemo();
}

init();
