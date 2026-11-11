/* Window manager: windows, focus order, drag, resize, minimise, taskbar. */
(function () {
  /** Tiny element builder: h("div", {class: "x", onclick: fn}, child, "text"). */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else if (k === "class") el.className = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  window.h = h;

  const CTL = {
    min: '<svg viewBox="0 0 10 10"><path d="M1 7h6v2H1z"/></svg>',
    max: '<svg viewBox="0 0 10 10"><path fill-rule="evenodd" d="M0 0h10v10H0zM1 2v7h8V2z"/></svg>',
    restore: '<svg viewBox="0 0 10 10"><path fill-rule="evenodd" d="M2 0h8v7H8v3H0V3h2zM3 1v2h5v3h1V1zM1 4v5h6V4z"/></svg>',
    close: '<svg viewBox="0 0 10 10"><path d="M1 1h2l2 2 2-2h2v1L6 5l3 3v1H7L5 7 3 9H1V8l3-3-3-3z"/></svg>',
  };

  const layer = () => document.getElementById("windows");
  const desktop = () => document.getElementById("desktop");
  const tasks = () => document.getElementById("tasks");
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  const wins = new Map(); // id -> win
  let z = 10;
  let cascade = 0;
  let uid = 0;

  function active() {
    let top = null;
    for (const w of wins.values()) if (!w.minimized && (!top || w.z > top.z)) top = w;
    return top;
  }

  function refreshActive() {
    const a = active();
    for (const w of wins.values()) {
      const on = w === a;
      w.el.classList.toggle("active", on);
      w.task.classList.toggle("active", on);
      w.task.setAttribute("aria-pressed", on ? "true" : "false");
    }
    window.dispatchEvent(new CustomEvent("wm:change"));
  }

  function open(opts) {
    const id = opts.id || "win" + ++uid;
    const existing = wins.get(id);
    if (existing) {
      existing.restore();
      existing.focus();
      if (opts.onReopen) opts.onReopen(existing);
      return existing;
    }

    const area = desktop().getBoundingClientRect();
    const width = Math.min(opts.width || 560, area.width - 16);
    const height = Math.min(opts.height || 420, area.height - 16);
    let x = opts.x ?? Math.round((area.width - width) / 2 + (cascade % 6) * 26 - 60);
    let y = opts.y ?? Math.round((area.height - height) / 2.4 + (cascade % 6) * 26 - 50);
    cascade++;
    x = Math.max(4, Math.min(x, area.width - width - 4));
    y = Math.max(4, Math.min(y, area.height - height - 4));

    const iconSvg = ICONS[opts.icon] || ICONS.computer;
    const titleEl = h("span", { class: "title" }, opts.title);
    const maxBtn = h("button", { class: "ctl max btn", type: "button", "aria-label": "Maximise", html: CTL.max });
    const titlebar = h("div", { class: "titlebar" },
      h("span", { html: iconSvg, style: "display:contents" }),
      titleEl,
      opts.noMin ? null : h("button", { class: "ctl min btn", type: "button", "aria-label": "Minimise", html: CTL.min, onclick: () => win.minimize() }),
      opts.resizable === false ? null : maxBtn,
      h("button", { class: "ctl close btn", type: "button", "aria-label": "Close", html: CTL.close, onclick: () => win.close() }),
    );
    const body = h("div", { class: "win-body" });
    const el = h("section", {
      class: "window" + (opts.className ? " " + opts.className : ""),
      role: "dialog",
      "aria-label": opts.title,
      "data-id": id,
      style: `left:${x}px;top:${y}px;width:${width}px;height:${height}px`,
    }, titlebar, opts.menubar ? buildMenubar(opts.menubar) : null, body);
    if (opts.resizable !== false) el.append(h("div", { class: "resize", "aria-hidden": "true" }));

    const content = typeof opts.content === "function" ? opts.content() : opts.content;
    if (content) body.append(content);
    if (opts.status) {
      const sb = h("div", { class: "statusbar" }, ...[].concat(opts.status).map((s) => h("span", {}, s)));
      el.append(sb);
    }

    const task = h("button", { class: "task", type: "button", role: "listitem", title: opts.title },
      h("span", { html: iconSvg, style: "display:contents" }), h("span", {}, opts.title));

    const win = {
      id, el, body, task, z: 0, minimized: false, maximized: false,
      focus() {
        if (win.minimized) win.restore();
        win.z = ++z;
        el.style.zIndex = win.z;
        refreshActive();
      },
      minimize() {
        win.minimized = true;
        el.classList.add("minimized");
        refreshActive();
      },
      restore() {
        if (!win.minimized) return;
        win.minimized = false;
        el.classList.remove("minimized");
        win.focus();
      },
      toggleMax() {
        if (opts.resizable === false) return;
        win.maximized = !win.maximized;
        el.classList.toggle("maximized", win.maximized);
        maxBtn.innerHTML = win.maximized ? CTL.restore : CTL.max;
        maxBtn.setAttribute("aria-label", win.maximized ? "Restore" : "Maximise");
      },
      setTitle(t) {
        titleEl.textContent = t;
        task.lastChild.textContent = t;
        task.title = t;
      },
      close() {
        if (opts.onClose && opts.onClose(win) === false) return;
        wins.delete(id);
        task.remove();
        el.classList.add("closing");
        const done = () => el.remove();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) done();
        else setTimeout(done, 120);
        refreshActive();
        const next = active();
        if (next) next.el.focus({ preventScroll: true });
      },
    };

    task.addEventListener("click", () => {
      if (win.minimized) win.restore();
      else if (active() === win) win.minimize();
      else win.focus();
    });
    el.addEventListener("pointerdown", () => { if (active() !== win) win.focus(); }, true);
    el.tabIndex = -1;
    titlebar.addEventListener("dblclick", (e) => { if (!e.target.closest(".ctl")) win.toggleMax(); });
    maxBtn.addEventListener("click", () => win.toggleMax());

    makeDraggable(win, titlebar);
    const grip = el.querySelector(".resize");
    if (grip) makeResizable(win, grip, opts);

    wins.set(id, win);
    layer().append(el);
    tasks().append(task);
    if (opts.maximized && !isMobile()) win.toggleMax();
    win.focus();
    if (opts.onOpen) opts.onOpen(win);
    return win;
  }

  function buildMenubar(items) {
    return h("div", { class: "menubar" }, items.map(([label, fn]) =>
      h("button", { type: "button", onclick: fn }, label)));
  }

  function makeDraggable(win, handle) {
    let sx, sy, ox, oy, dragging = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest(".ctl") || win.maximized || isMobile()) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = win.el.offsetLeft; oy = win.el.offsetTop;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const area = desktop().getBoundingClientRect();
      const nx = Math.max(-win.el.offsetWidth + 80, Math.min(ox + e.clientX - sx, area.width - 80));
      const ny = Math.max(0, Math.min(oy + e.clientY - sy, area.height - 30));
      win.el.style.left = nx + "px";
      win.el.style.top = ny + "px";
    });
    const end = () => { dragging = false; };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  function makeResizable(win, grip, opts) {
    let sx, sy, ow, oh, on = false;
    grip.addEventListener("pointerdown", (e) => {
      on = true; sx = e.clientX; sy = e.clientY;
      ow = win.el.offsetWidth; oh = win.el.offsetHeight;
      grip.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    grip.addEventListener("pointermove", (e) => {
      if (!on) return;
      win.el.style.width = Math.max(opts.minWidth || 280, ow + e.clientX - sx) + "px";
      win.el.style.height = Math.max(opts.minHeight || 160, oh + e.clientY - sy) + "px";
    });
    grip.addEventListener("pointerup", () => { on = false; });
  }

  window.WM = {
    open,
    get: (id) => wins.get(id),
    active,
    all: () => [...wins.values()],
    closeAll: () => [...wins.values()].forEach((w) => w.close()),
  };
})();
