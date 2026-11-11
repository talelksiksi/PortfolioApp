/* Boot, desktop icons, start menu, clock and deep links. */
(function () {
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const WALLS = ["teal", "sunset", "classic", "grid"];

  window.Desktop = {
    wallpaper: () => document.body.dataset.wallpaper || "teal",
    setWallpaper(w) {
      if (!WALLS.includes(w)) return false;
      if (w === "teal") delete document.body.dataset.wallpaper;
      else document.body.dataset.wallpaper = w;
      store.set("wallpaper", w);
      return true;
    },
    setCrt(on) {
      if (on) delete document.body.dataset.crt;
      else document.body.dataset.crt = "off";
      store.set("crt", on ? "on" : "off");
    },
  };
  if (store.get("wallpaper")) Desktop.setWallpaper(store.get("wallpaper"));
  if (store.get("crt") === "off") Desktop.setCrt(false);

  // ---------------------------------------------------------------- Desktop icons
  const DESKTOP = [
    { label: "My Projects", icon: "folder", open: Apps.openProjects },
    { label: "About_Me.txt", icon: "notepad", open: Apps.openNotepad },
    { label: "Hire_Us.hlp", icon: "briefcase", open: Apps.openServices },
    { label: "Contact.exe", icon: "mail", open: () => Apps.openMail() },
    { label: "Command Prompt", icon: "terminal", open: Apps.openTerminal },
    { label: "Recycle Bin", icon: "trashFull", open: Apps.openTrash },
  ];
  const iconList = document.getElementById("icons");
  DESKTOP.forEach((d) => iconList.append(h("li", {}, Apps.iconButton({ label: d.label, icon: d.icon, onOpen: d.open }))));

  document.getElementById("desktop").addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".icon")) document.querySelectorAll(".icon.selected").forEach((i) => i.classList.remove("selected"));
  });

  // Arrow keys move between desktop icons.
  iconList.addEventListener("keydown", (e) => {
    const all = [...iconList.querySelectorAll(".icon")];
    const i = all.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (step) { e.preventDefault(); all[(i + step + all.length) % all.length].focus(); }
  });

  // ---------------------------------------------------------------- Start menu
  const startBtn = document.getElementById("start-btn");
  const menu = document.getElementById("start-menu");
  const list = document.getElementById("start-list");
  const START = [
    ["Projects", "folder", Apps.openProjects],
    ...PROJECTS.slice(0, 3).map((p) => [p.name, p.icon, () => Apps.openProject(p.id)]),
    "-",
    ["About me", "notepad", Apps.openNotepad],
    ["Services", "briefcase", Apps.openServices],
    ["Contact", "mail", () => Apps.openMail()],
    ["Command Prompt", "terminal", Apps.openTerminal],
    ["Display settings", "display", Apps.openDisplay],
    ["Help", "help", Apps.openHelp],
    "-",
    ["Shut Down…", "shutdown", Apps.openShutdown],
  ];
  START.forEach((item) => {
    if (item === "-") return list.append(h("li", { class: "sep", role: "separator" }));
    const [label, icon, fn] = item;
    list.append(h("li", { role: "none" }, h("button", { type: "button", role: "menuitem", onclick: () => { toggleMenu(false); fn(); } },
      h("span", { html: ICONS[icon], style: "display:contents" }), label)));
  });
  function toggleMenu(force) {
    const show = force ?? menu.hidden;
    menu.hidden = !show;
    startBtn.setAttribute("aria-expanded", show ? "true" : "false");
    if (show) list.querySelector("button").focus();
  }
  startBtn.addEventListener("click", () => toggleMenu());
  document.addEventListener("pointerdown", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !startBtn.contains(e.target)) toggleMenu(false);
  });
  menu.addEventListener("keydown", (e) => {
    const items = [...list.querySelectorAll("button")];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!menu.hidden) { toggleMenu(false); startBtn.focus(); return; }
      const a = WM.active();
      if (a && a.el.classList.contains("dialog")) a.close();
    }
    if (e.key === "Meta" || (e.ctrlKey && e.key === "Escape")) toggleMenu();
  });

  // ---------------------------------------------------------------- Tray
  const mailBtn = document.getElementById("tray-mail");
  mailBtn.innerHTML = ICONS.mail;
  mailBtn.addEventListener("click", () => Apps.openMail());
  const clock = document.getElementById("clock");
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
  tick();
  setInterval(tick, 15000);

  // ---------------------------------------------------------------- Deep links
  function route() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return false;
    const [section, id] = hash.split("/");
    const map = {
      projects: Apps.openProjects, about: Apps.openNotepad, contact: () => Apps.openMail(),
      terminal: Apps.openTerminal, trash: Apps.openTrash, services: Apps.openServices,
      project: () => Apps.openProject(id),
    };
    if (!map[section]) return false;
    if (section === "project") Apps.openProjects();
    map[section]();
    return true;
  }
  window.addEventListener("hashchange", route);

  // ---------------------------------------------------------------- Boot
  const boot = document.getElementById("boot");
  const log = document.getElementById("boot-log");
  const splash = document.getElementById("splash");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const quick = Apps.sessionStorageSafe.get("booted") || reduced || /[?&]noboot/.test(location.search);
  let finished = false;

  const LINES = [
    ['<span class="w">CICTNA BIOS v4.51</span>  Copyright (C) 1995-' + new Date().getFullYear() + ", CICTNA RDC", 0],
    ["", 60],
    ["Main Processor : Industrial-grade Brain @ 2026 MHz", 120],
    ['Memory Test    : 640K OK <span class="mut">(should be enough for anybody)</span>', 160],
    ["", 60],
    ['Detecting PLC link ........... <span class="g">ACK</span>', 220],
    ['Detecting OPC UA server ...... <span class="g">opc.tcp:// OK</span>', 200],
    ['Detecting WebSocket .......... <span class="g">ws:// OK</span>', 200],
    ['Loading projects ............. <span class="g">' + PROJECTS.length + " found</span>", 200],
    ['Checking Recycle Bin ......... <span class="s">' + TRASH.length + " lessons learned</span>", 200],
    ["", 80],
    ["Starting CICTNA OS...", 260],
  ];

  function finish() {
    if (finished) return;
    finished = true;
    Apps.sessionStorageSafe.set("booted", "1");
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 400);
    if (!route()) setTimeout(Apps.openWelcome, quick ? 50 : 250);
  }

  if (quick) {
    boot.remove();
    finished = true;
    if (!route()) Apps.openWelcome();
  } else {
    let t = 0;
    LINES.forEach(([html, delay]) => {
      t += delay;
      setTimeout(() => { if (!finished) log.innerHTML += html + "\n"; }, t);
    });
    setTimeout(() => { if (!finished) splash.hidden = false; }, t + 300);
    setTimeout(finish, t + 1900);
    const skip = () => finish();
    boot.addEventListener("click", skip);
    document.addEventListener("keydown", skip, { once: true });
  }
})();
