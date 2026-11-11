/* Boot, desktop icons, start menu, tray, language switching and deep links. */
(function () {
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const WALLS = ["pixel", "teal", "sunset", "classic", "grid"];
  const desktop = document.getElementById("desktop");
  PixelWall.mount(desktop);

  window.Desktop = {
    wallpaper: () => document.body.dataset.wallpaper || "pixel",
    setWallpaper(w) {
      if (!WALLS.includes(w)) return false;
      document.body.dataset.wallpaper = w;
      PixelWall.show(w === "pixel");
      store.set("wallpaper", w);
      return true;
    },
    setCrt(on) {
      if (on) delete document.body.dataset.crt;
      else document.body.dataset.crt = "off";
      store.set("crt", on ? "on" : "off");
    },
  };
  Desktop.setWallpaper(WALLS.includes(store.get("wallpaper")) ? store.get("wallpaper") : "pixel");
  if (store.get("crt") === "off") Desktop.setCrt(false);

  // ---------------------------------------------------------------- Desktop icons
  const iconList = document.getElementById("icons");
  const other = () => (Lang.get() === "en" ? "FR" : "EN");

  function renderDesktop() {
    const items = [
      { label: t("myProjects"), icon: "folder", open: Apps.openProjects },
      { label: t("cv"), icon: "cv", open: Apps.openCv },
      { label: t("about"), icon: "notepad", open: Apps.openNotepad },
      { label: t("hire"), icon: "briefcase", open: Apps.openServices },
      { label: t("contact"), icon: "mail", open: () => Apps.openMail() },
      ...PROJECTS.map((p) => ({ label: p.file, icon: p.icon, open: () => Apps.openProject(p.id), title: p.name })),
      { label: t("terminal"), icon: "terminal", open: Apps.openTerminal },
      { label: t("langIcon"), icon: ICONS.lang(other()), open: () => Lang.toggle(), title: t("langTip") },
      { label: t("trash"), icon: "trashFull", open: Apps.openTrash },
    ];
    iconList.replaceChildren(...items.map((d) =>
      h("li", {}, Apps.iconButton({ label: d.label, icon: d.icon, onOpen: d.open, title: d.title }))));
  }

  desktop.addEventListener("pointerdown", (e) => {
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

  function renderStart() {
    startBtn.querySelector("span").textContent = t("start");
    const items = [
      [t("smProjects"), "folder", Apps.openProjects],
      ...PROJECTS.slice(0, 3).map((p) => [p.name, p.icon, () => Apps.openProject(p.id)]),
      "-",
      [t("smAbout"), "notepad", Apps.openNotepad],
      [t("smCv"), "cv", Apps.openCv],
      [t("smServices"), "briefcase", Apps.openServices],
      [t("smContact"), "mail", () => Apps.openMail()],
      [t("terminal"), "terminal", Apps.openTerminal],
      [t("smDisplay"), "display", Apps.openDisplay],
      [t("smLang"), ICONS.lang(other()), () => Lang.toggle()],
      [t("smHelp"), "help", Apps.openHelp],
      "-",
      [t("smShutdown"), "shutdown", Apps.openShutdown],
    ];
    list.replaceChildren(...items.map((item) => {
      if (item === "-") return h("li", { class: "sep", role: "separator" });
      const [label, icon, fn] = item;
      return h("li", { role: "none" }, h("button", { type: "button", role: "menuitem", onclick: () => { toggleMenu(false); fn(); } },
        h("span", { html: ICONS[icon] || icon, style: "display:contents" }), label));
    }));
  }
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
  const langBtn = document.getElementById("tray-lang");
  mailBtn.innerHTML = ICONS.mail;
  mailBtn.addEventListener("click", () => Apps.openMail());
  langBtn.addEventListener("click", () => Lang.toggle());
  const clock = document.getElementById("clock");
  const tick = () => { clock.textContent = new Date().toLocaleTimeString(Lang.get(), { hour: "2-digit", minute: "2-digit" }); };
  setInterval(tick, 15000);

  function renderShell() {
    renderDesktop();
    renderStart();
    langBtn.textContent = Lang.get().toUpperCase();
    langBtn.title = langBtn.ariaLabel = t("langTray");
    mailBtn.title = mailBtn.ariaLabel = t("contactTip");
    tick();
  }
  renderShell();

  window.addEventListener("lang:change", () => {
    renderShell();
    WM.relaunchAll();
  });

  // ---------------------------------------------------------------- Deep links
  function route() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return false;
    const [section, id] = hash.split("/");
    const map = {
      projects: Apps.openProjects, about: Apps.openNotepad, contact: () => Apps.openMail(),
      terminal: Apps.openTerminal, trash: Apps.openTrash, services: Apps.openServices,
      cv: () => (SITE.cv && SITE.cv[id] ? Apps.openCvViewer(id) : Apps.openCv()),
      project: () => Apps.openProject(id),
      en: () => Lang.set("en"), fr: () => Lang.set("fr"),
    };
    if (!map[section]) return false;
    map[section]();
    return section !== "en" && section !== "fr";
  }
  window.addEventListener("hashchange", route);

  // ---------------------------------------------------------------- Boot
  const boot = document.getElementById("boot");
  const log = document.getElementById("boot-log");
  const splash = document.getElementById("splash");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const quick = Apps.sessionStorageSafe.get("booted") || /[?&]noboot/.test(location.search);
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    Apps.sessionStorageSafe.set("booted", "1");
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 500);
    if (!route()) setTimeout(Apps.openWelcome, quick ? 50 : 350);
  }

  function typeInto(el, text, speed) {
    return new Promise((done) => {
      if (reduced) { el.textContent = text; return done(); }
      let i = 0;
      const step = () => {
        if (finished) return done();
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(step, speed); else done();
      };
      step();
    });
  }

  async function showSplash() {
    splash.hidden = false;
    document.getElementById("boot-skip").textContent = t("skip");
    const hello = document.getElementById("splash-hello");
    const sub = document.getElementById("splash-sub");
    const line = document.getElementById("splash-line");
    line.textContent = t("splashLine");
    await typeInto(hello, t("splashHello"), 90);
    await new Promise((r) => setTimeout(r, 250));
    await typeInto(sub, t("splashSub"), 32);
    splash.classList.add("ready");
    setTimeout(finish, 2200);
  }

  if (quick) {
    boot.remove();
    finished = true;
    if (!route()) Apps.openWelcome();
  } else {
    const B = t("boot");
    const ok = (s) => `<span class="g">${s}</span>`;
    const LINES = [
      ['<span class="w">CICTNA BIOS v4.51</span>  Copyright (C) 1995-' + new Date().getFullYear() + ", CICTNA RDC", 0],
      ["", 50],
      [B[0], 90],
      [B[1], 120],
      ["", 50],
      [B[2] + ok("ACK"), 160],
      [B[3] + ok("opc.tcp:// OK"), 150],
      [B[4] + ok("ws:// OK"), 150],
      [B[5] + ok(t("found", PROJECTS.length)), 150],
      [B[6] + `<span class="s">${t("lessons", TRASH.length)}</span>`, 150],
      ["", 60],
      [B[7], 220],
    ];
    document.getElementById("boot-skip").textContent = t("skip");
    let tm = 0;
    LINES.forEach(([html, delay]) => {
      tm += reduced ? 0 : delay;
      setTimeout(() => { if (!finished) log.innerHTML += html + "\n"; }, tm);
    });
    setTimeout(() => { if (!finished) showSplash(); }, tm + (reduced ? 0 : 350));
    boot.addEventListener("click", finish);
    document.addEventListener("keydown", finish, { once: true });
  }
})();
