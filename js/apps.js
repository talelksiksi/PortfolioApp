/* The programs that run on CICTNA OS. */
(function () {
  const { owner, studio, email, github } = SITE;
  const byId = (id) => PROJECTS.find((p) => p.id === id);
  const svg = (name) => h("span", { html: ICONS[name] || ICONS.computer, style: "display:contents" });

  function setHash(hash) {
    const url = hash ? "#" + hash : location.pathname + location.search;
    history.replaceState(null, "", url);
  }

  /** A double-clickable icon (single tap on touch / keyboard Enter). */
  function iconButton({ label, icon, onOpen, dark }) {
    const b = h("button", { class: "icon" + (dark ? " dark" : ""), type: "button", title: label },
      svg(icon), h("span", {}, label.replace(/\./g, "\u200B.")));
    b.addEventListener("click", (e) => {
      document.querySelectorAll(".icon.selected").forEach((i) => i.classList.remove("selected"));
      b.classList.add("selected");
      // Mouse users double-click like a real desktop; touch and keyboard open on one activation.
      if (e.detail === 0 || e.pointerType === "touch" || matchMedia("(hover: none)").matches) onOpen();
    });
    b.addEventListener("dblclick", onOpen);
    return b;
  }

  // ---------------------------------------------------------------- Projects
  function openProjects() {
    const grid = h("ul", { class: "explorer-grid", role: "list" },
      PROJECTS.map((p) => h("li", {}, iconButton({ label: p.file, icon: p.icon, dark: true, onOpen: () => openProject(p.id) }))));
    WM.open({
      id: "projects", title: "C:\\Projects", icon: "folderOpen", width: 620, height: 400,
      menubar: [["File", () => {}], ["View", () => {}], ["Help", () => openHelp()]],
      content: h("div", { class: "win-body" },
        h("div", { class: "addr" }, "Address", h("div", { class: "field sunken" }, svg("folderOpen"), "C:\\Projects")),
        h("div", { class: "scroll sunken" }, grid)),
      status: [`${PROJECTS.length} object(s)`, (matchMedia("(hover: none)").matches ? "Tap" : "Double-click") + " a project to open it"],
      onOpen: () => setHash("projects"),
    });
  }

  function openProject(id) {
    const p = byId(id);
    if (!p) return;
    const tabs = [
      ["Overview", () => [
        h("p", {}, p.summary),
        h("div", { class: "ps" },
          h("div", { class: "sunken" }, h("h2", {}, "The problem"), h("p", {}, p.problem)),
          h("div", { class: "sunken" }, h("h2", {}, "What we built"), h("p", {}, p.solution))),
      ]],
      ["Highlights", () => [h("ul", {}, p.highlights.map((x) => h("li", {}, x)))]],
      ["Tech stack", () => [h("ul", { class: "chips" }, p.stack.map((s) => h("li", {}, s)))]],
    ];
    if (p.demo === "telegram") tabs.push(["Try it", telegramLab]);

    const panel = h("div", { class: "tab-panel content" });
    const tabBar = h("div", { class: "tabs", role: "tablist" });
    const select = (i) => {
      [...tabBar.children].forEach((t, j) => t.setAttribute("aria-selected", i === j ? "true" : "false"));
      panel.replaceChildren(...tabs[i][1]());
    };
    tabs.forEach(([label], i) => tabBar.append(h("button", { class: "tab", type: "button", role: "tab", onclick: () => select(i) }, label)));
    select(0);

    const actions = h("div", { class: "actions", style: "padding:0 8px 10px" },
      p.live ? h("a", { class: "btn primary cta", href: p.live, target: "_blank", rel: "noopener" }, svg("globe"), "Open live demo") : null,
      p.demo ? h("button", { class: "btn" + (p.live ? "" : " primary cta"), type: "button", onclick: () => select(tabs.length - 1) }, "Try it here") : null,
      h("button", { class: "btn", type: "button", onclick: () => openMail(`Project enquiry: ${p.name}`) }, svg("mail"), "Build something like this"),
    );

    WM.open({
      id: "project-" + p.id, title: p.file, icon: p.icon, width: 680, height: 560,
      content: h("div", { class: "scroll" },
        h("div", { class: "project-hero" }, svg(p.icon),
          h("div", {}, h("div", { class: "kicker" }, p.category + " · " + p.year), h("h1", {}, p.name))),
        tabBar, panel, actions),
      status: [p.category, p.live ? "Live demo available" : "Source available on request"],
      onOpen: () => setHash("project/" + p.id),
    });
  }

  /** Tray store telegram encoder: XOR checksum over the body between "$" and "*CS". */
  function telegramLab() {
    const seq = h("input", { type: "number", min: 0, max: 9999, value: 5, "aria-label": "Sequence number" });
    const col = h("input", { type: "number", min: 0, max: 99, value: 1, "aria-label": "Column x" });
    const lvl = h("input", { type: "number", min: 0, max: 99, value: 1, "aria-label": "Level y" });
    const from = h("select", { "aria-label": "Push from face" }, h("option", { value: "F" }, "Front"), h("option", { value: "B" }, "Back"));
    const qty = h("input", { type: "number", min: 1, max: 12, value: 1, "aria-label": "Quantity" });
    const out = h("div", { class: "wire", "aria-live": "polite" });
    const pad = (n, w) => String(Math.max(0, n | 0)).padStart(w, "0").slice(-w);
    const xor = (s) => [...s].reduce((a, c) => a ^ c.charCodeAt(0), 0).toString(16).toUpperCase().padStart(2, "0");
    const render = () => {
      const n = pad(seq.value, 4);
      const body = `MOV*${n}*CH=${pad(col.value, 2)}.${pad(lvl.value, 2)}*FROM=${from.value}*QTY=${Math.min(12, Math.max(1, qty.value | 0))}`;
      const ack = `ACK*${n}*OK`;
      out.replaceChildren(
        h("span", { class: "dim" }, "controller → PLC\n"), "$" + body + "*", h("span", { class: "cs" }, "CS=" + xor(body)), "#\n\n",
        h("span", { class: "dim" }, "PLC → controller\n"), "$" + ack + "*", h("span", { class: "cs" }, "CS=" + xor(ack)), "#");
    };
    [seq, col, lvl, from, qty].forEach((i) => i.addEventListener("input", render));
    render();
    return [
      h("p", {}, "Build a MOV telegram the way the controller does. The checksum is the XOR of every byte between ", h("code", {}, "$"), " and ", h("code", {}, "*CS"), ". One move is in flight at a time; the next is only sent after the ACK."),
      h("div", { class: "lab" },
        h("div", { class: "row" },
          h("label", {}, "Sequence", seq), h("label", {}, "Column x", col), h("label", {}, "Level y", lvl), h("label", {}, "Push from", from)),
        h("div", { class: "row" }, h("label", {}, "Trays (1–12)", qty))),
      out,
    ];
  }

  // ---------------------------------------------------------------- Notepad
  const ABOUT = `ABOUT.TXT
==========

Hi, I'm ${owner}. I run ${studio}.

I build software where the web meets the factory floor:
controllers that talk to PLCs, OPC UA clients that survive
real networks, dashboards that update the moment the floor
does, and the client-facing web apps that sit on top.

WHAT I'M GOOD AT
- Industrial integration: PLC telegram protocols, OPC UA
  (C#/.NET), WMS and warehouse automation
- Real-time systems: WebSockets, event-driven backends,
  fault-safe sequencing (no move executes twice)
- Web apps: React, plain JS when it's the right tool,
  Node/Express, Blazor
- Simulators that let you test control logic before the
  hardware exists

HOW I WORK
- Start from your process, not from a framework
- Ship a working demo early, so you can click it
- Tests where they matter, docs that answer "how do I run it"
- Plain-English updates; no surprise invoices

NEXT STEP
Double-click "Contact.exe" on the desktop, or email
${email}. Tell me what's slowing your operation down.

(This file is editable. Go ahead, nobody's watching.)
`;

  function openNotepad() {
    const ta = h("textarea", { spellcheck: "false", "aria-label": "About me" });
    ta.value = ABOUT;
    const status = h("span", {}, "Ln 1, Col 1");
    const update = () => {
      const before = ta.value.slice(0, ta.selectionStart).split("\n");
      status.textContent = `Ln ${before.length}, Col ${before[before.length - 1].length + 1}`;
    };
    ["keyup", "click", "input"].forEach((e) => ta.addEventListener(e, update));
    let wrap = true;
    WM.open({
      id: "notepad", title: "About_Me.txt - Notepad", icon: "notepad", width: 560, height: 480,
      menubar: [
        ["File", () => download("About_Me.txt", ta.value)],
        ["Edit", () => { ta.focus(); ta.select(); }],
        ["Format", () => { wrap = !wrap; ta.wrap = wrap ? "soft" : "off"; }],
        ["Help", () => openHelp()],
      ],
      content: h("div", { class: "win-body notepad sunken" }, ta),
      status: ["File: save · Edit: select all · Format: word wrap", status],
      onOpen: () => setHash("about"),
    });
  }

  function download(name, text) {
    const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: "text/plain" })), download: name });
    document.body.append(a); a.click(); a.remove();
  }

  // ---------------------------------------------------------------- Mail
  function openMail(subject) {
    const existing = WM.get("mail");
    if (existing) {
      if (subject) existing.el.querySelector("[name=subject]").value = subject;
      existing.focus();
      return;
    }
    const field = (name, attrs) => h(attrs.tag || "input", { class: "field-input", name, id: "m-" + name, ...attrs, tag: null });
    const form = h("form", { class: "mail-form", novalidate: true },
      h("label", { for: "m-name" }, "From:"), field("name", { placeholder: "Your name", autocomplete: "name", required: true }),
      h("label", { for: "m-email" }, "Reply-to:"), field("email", { type: "email", placeholder: "you@company.com", autocomplete: "email", required: true }),
      h("label", { for: "m-company" }, "Company:"), field("company", { placeholder: "Optional", autocomplete: "organization" }),
      h("label", { for: "m-subject" }, "Subject:"), field("subject", { value: subject || "New project", required: true }),
      h("label", {}, "Budget:"),
      h("div", { class: "budget", role: "radiogroup", "aria-label": "Budget" },
        ["< €5k", "€5k–20k", "€20k–50k", "€50k+", "Not sure yet"].map((b, i) =>
          h("label", {}, h("input", { type: "radio", name: "budget", value: b, checked: i === 4 }), b))),
      h("textarea", { class: "field-input full", name: "message", placeholder: "What are you building, and what's in the way?", required: true, "aria-label": "Message" }),
      h("input", { class: "hp", name: "_honey", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
    );
    const notice = h("div", { class: "notice sunken", hidden: true, role: "status" });
    const sendBtn = h("button", { class: "btn primary cta", type: "button" }, svg("mail"), "Send");
    const show = (icon, ...msg) => { notice.hidden = false; notice.replaceChildren(svg(icon), h("div", {}, ...msg)); };

    const mailtoFallback = (d) => {
      const body = `${d.message}\n\n— ${d.name}${d.company ? ", " + d.company : ""}\n${d.email}\nBudget: ${d.budget}`;
      location.href = `mailto:${email}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
    };

    async function send() {
      const d = Object.fromEntries(new FormData(form));
      if (d._honey) return; // bot
      const missing = [];
      if (!d.name.trim()) missing.push("your name");
      if (!/^\S+@\S+\.\S+$/.test(d.email)) missing.push("a valid email");
      if (!d.message.trim()) missing.push("a message");
      if (missing.length) return show("warn", "Please add " + missing.join(", ") + ".");
      if (!SITE.contactEndpoint) { mailtoFallback(d); return show("info", "Your mail app should open with the message ready to send."); }

      sendBtn.disabled = true;
      show("info", "Sending…");
      try {
        const res = await fetch(SITE.contactEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...d, _subject: `[Portfolio] ${d.subject}`, _template: "table", _captcha: "false" }),
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        show("info", h("b", {}, "Message sent."), " Thanks — we reply within one business day.");
      } catch {
        show("warn", "Couldn't reach the mail server. ",
          h("button", { class: "btn", type: "button", onclick: () => mailtoFallback(d) }, "Send with my mail app"),
          " or write to ", h("a", { href: "mailto:" + email }, email), ".");
      } finally {
        sendBtn.disabled = false;
      }
    }
    sendBtn.addEventListener("click", send);
    form.addEventListener("submit", (e) => { e.preventDefault(); send(); });

    WM.open({
      id: "mail", title: "New Message - Contact.exe", icon: "mail", width: 560, height: 540,
      content: h("div", { class: "win-body" },
        h("div", { class: "mail-toolbar" }, sendBtn,
          h("a", { class: "btn", href: "mailto:" + email }, "Use my mail app")),
        h("div", { class: "scroll sunken content" }, form, notice)),
      status: ["To: " + email, "Replies within 1 business day"],
      onOpen: () => setHash("contact"),
    });
    setTimeout(() => form.querySelector("[name=name]").focus(), 50);
  }

  // ---------------------------------------------------------------- Terminal
  function openTerminal() {
    const out = h("div", {});
    const input = h("input", { "aria-label": "Command", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
    const promptText = "C:\\CICTNA> ";
    const term = h("div", { class: "term", onclick: () => input.focus() }, out, h("div", { class: "prompt-row" }, h("span", {}, promptText), input));
    const hist = [];
    let hi = 0;

    const print = (text, cls) => { out.append(h("div", { class: "line " + (cls || "") }, text)); term.scrollTop = term.scrollHeight; };
    const printNode = (...nodes) => { out.append(h("div", { class: "line" }, ...nodes)); term.scrollTop = term.scrollHeight; };

    const cmds = {
      help: () => print(
`Available commands:
  whoami            who runs this machine
  ls / dir          list projects
  open <project>    open a project window   (e.g. open opcua)
  cat about.txt     print the bio
  skills            what we build
  services          how we can help
  contact           open the mail client
  neofetch          system info
  theme <name>      teal | sunset | classic | grid
  clear / cls       clear the screen
  exit              close the terminal`, "mut"),
      whoami: () => print(`${owner} @ ${studio} — ${SITE.tagline}`, "acc"),
      ls: () => PROJECTS.forEach((p) => print(`  ${p.file.padEnd(24)} ${p.category}`)),
      dir: () => cmds.ls(),
      open: (arg) => {
        if (!arg) return print("usage: open <project>", "err");
        const q = arg.toLowerCase().replace(/[^a-z0-9]/g, "");
        const p = PROJECTS.find((x) => (x.id + x.name + x.file).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q));
        if (!p) return print(`'${arg}' not found. Try 'ls'.`, "err");
        print(`Launching ${p.file}…`, "ok");
        openProject(p.id);
      },
      cat: (arg) => {
        if (/about/i.test(arg || "")) return ABOUT.split("\n").forEach((l) => print(l));
        print(`cat: ${arg || ""}: No such file. Try 'cat about.txt'.`, "err");
      },
      type: (arg) => cmds.cat(arg),
      skills: () => print(
`  Industrial   PLC telegrams · OPC UA (.NET) · WMS · tray stores
  Realtime     WebSockets · Express · event-driven backends
  Web          React · vanilla JS · Blazor · Vercel
  Quality      xUnit · integration tests · simulators`),
      services: () => SERVICES.forEach((s) => print(`  ▸ ${s.title}: ${s.text}`)),
      contact: () => { print("Opening Contact.exe…", "ok"); openMail(); },
      neofetch: () => print(
`   .-~~~-.      ${owner.toLowerCase().replace(" ", "")}@cictna
  /  ___  \\     ----------------------
 |  (   )  |    OS: CICTNA OS 95 (Industrial Edition)
 |~~~~~~~~~|    Host: ${location.host || "localhost"}
 |  ~~~~~  |    Projects: ${PROJECTS.length}
  \\  ~~~  /     Shell: cictna-sh 1.0
   '-...-'      Uptime: ${Math.round(performance.now() / 1000)}s
                Contact: ${email}`, "acc"),
      theme: (arg) => {
        if (!Desktop.setWallpaper(arg)) return print("usage: theme teal|sunset|classic|grid", "err");
        print("Wallpaper set to " + arg + ".", "ok");
      },
      clear: () => out.replaceChildren(),
      cls: () => cmds.clear(),
      exit: () => WM.get("terminal").close(),
      sudo: (arg) => /hire/i.test(arg || "")
        ? (print("[sudo] password for client: ******** ✓", "ok"), print("Permission granted. Opening Contact.exe…", "ok"), openMail("Let's work together"))
        : print("Nice try. Did you mean 'sudo hire-me'?", "err"),
      "hire-me": () => cmds.sudo("hire"),
      rm: () => print("Access denied. Failed experiments belong in the Recycle Bin.", "err"),
      date: () => print(new Date().toString()),
      echo: (arg) => print(arg || ""),
      github: () => printNode("  ", h("a", { href: github, target: "_blank", rel: "noopener" }, github)),
    };

    function run(line) {
      printNode(h("span", { class: "ok" }, promptText), line);
      const [cmd, ...rest] = line.trim().split(/\s+/);
      if (!cmd) return;
      const fn = cmds[cmd.toLowerCase()];
      if (fn) fn(rest.join(" "));
      else print(`'${cmd}' is not recognized as a command. Type 'help'.`, "err");
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = input.value;
        input.value = "";
        if (v.trim()) { hist.push(v); hi = hist.length; }
        run(v);
      } else if (e.key === "ArrowUp" && hist.length) {
        hi = Math.max(0, hi - 1); input.value = hist[hi]; e.preventDefault();
      } else if (e.key === "ArrowDown") {
        hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ""; e.preventDefault();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const m = Object.keys(cmds).filter((c) => c.startsWith(input.value));
        if (m.length === 1) input.value = m[0] + " ";
      }
    });

    WM.open({
      id: "terminal", title: "Command Prompt", icon: "terminal", width: 620, height: 400,
      content: h("div", { class: "win-body sunken" }, term),
      onOpen: () => {
        print("CICTNA OS [Version 95.11.2026]", "mut");
        print("(c) " + new Date().getFullYear() + " " + studio + ". Type 'help' to get started.", "mut");
        print("");
        setTimeout(() => input.focus(), 30);
        setHash("terminal");
      },
    });
  }

  // ---------------------------------------------------------------- Trash
  function openTrash() {
    WM.open({
      id: "trash", title: "Recycle Bin", icon: "trashFull", width: 560, height: 430,
      menubar: [["File", () => {}], ["Edit", () => {}], ["Empty Recycle Bin", () =>
        dialog({ title: "Confirm", icon: "warn", text: "We keep these on purpose. Every bug here made the next project better.", buttons: [["Fair enough", null, true]] })]],
      content: h("div", { class: "win-body" },
        h("div", { class: "scroll sunken content" },
          h("p", { class: "pad", style: "margin:0;padding-bottom:4px" }, "Failed experiments, kept on purpose. Each one changed how we build."),
          h("ul", { class: "trash-list" }, TRASH.map((t) => h("li", {}, svg("notepad"),
            h("div", {}, h("b", {}, t.file), h("div", {}, t.what), h("div", { class: "lesson" }, t.lesson))))))),
      status: [`${TRASH.length} object(s)`, "Lessons learned: " + TRASH.length],
      onOpen: () => setHash("trash"),
    });
  }

  // ---------------------------------------------------------------- Services
  function openServices() {
    WM.open({
      id: "services", title: "Hire_Us.hlp", icon: "briefcase", width: 640, height: 540,
      content: h("div", { class: "scroll sunken content pad" },
        h("div", { class: "kicker" }, studio),
        h("h1", {}, "Software for operations that can't stop."),
        h("p", {}, "We build the layer between your machines and your people: controllers, integrations, dashboards and the portals your customers use. Small team, senior hands, working demos early."),
        h("div", { class: "svc-grid" }, SERVICES.map((s) => h("div", {}, h("h3", {}, s.title), h("p", { style: "margin:0" }, s.text)))),
        h("h2", {}, "How an engagement runs"),
        h("ol", { class: "steps" },
          h("li", {}, h("b", {}, "Discovery call (free, 30 min). "), "Your process, your systems, where it hurts."),
          h("li", {}, h("b", {}, "Clickable proof in week one. "), "A simulator or prototype you can poke, before big money moves."),
          h("li", {}, h("b", {}, "Build in short iterations. "), "Fixed scope per milestone, a demo at the end of each."),
          h("li", {}, h("b", {}, "Handover that sticks. "), "Tests, docs, and a runbook your team can actually use.")),
        h("div", { class: "actions" },
          h("button", { class: "btn primary cta", type: "button", onclick: () => openMail("Discovery call") }, svg("mail"), "Book a discovery call"),
          h("button", { class: "btn", type: "button", onclick: openProjects }, svg("folder"), "See the work"))),
      onOpen: () => setHash("services"),
    });
  }

  // ---------------------------------------------------------------- Display
  function openDisplay() {
    const walls = [
      ["teal", "Lagoon", "linear-gradient(180deg,#2b5862,#3d6d78)"],
      ["sunset", "Sunrise", "linear-gradient(180deg,#f1c09b,#e7a982 38%,#3d6d78 38.5%,#24464e)"],
      ["classic", "Classic", "#008080"],
      ["grid", "Control room", "linear-gradient(rgba(88,224,138,.3) 1px,transparent 1px) 0 0/8px 8px,linear-gradient(90deg,rgba(88,224,138,.3) 1px,transparent 1px) 0 0/8px 8px,#0d1a17"],
    ];
    const grid = h("div", { class: "wall-grid" });
    const paint = () => [...grid.children].forEach((b) => b.setAttribute("aria-pressed", b.dataset.w === Desktop.wallpaper() ? "true" : "false"));
    walls.forEach(([id, name, bg]) => grid.append(h("button", { class: "wall btn", type: "button", "data-w": id, onclick: () => { Desktop.setWallpaper(id); paint(); } },
      h("span", { style: "display:block;width:100%" }, h("i", { class: "sunken", style: `background:${bg}` }), name))));
    paint();
    const crt = h("input", { type: "checkbox", id: "crt", checked: document.body.dataset.crt !== "off" });
    crt.addEventListener("change", () => Desktop.setCrt(crt.checked));
    WM.open({
      id: "display", title: "Display Properties", icon: "display", width: 400, height: 380, resizable: false,
      content: h("div", { class: "pad content" },
        h("p", {}, "Wallpaper"), grid,
        h("p", { style: "margin-top:14px" }, h("label", { for: "crt", style: "display:inline-flex;gap:6px;align-items:center" }, crt, "CRT scanlines"))),
    });
  }

  // ---------------------------------------------------------------- Dialogs
  function dialog({ title, icon = "info", text, buttons = [["OK", null, true]], id, width = 420 }) {
    let win;
    const body = h("div", {},
      h("div", { class: "dialog-msg" }, svg(icon), h("div", { class: "content" }, text)),
      h("div", { class: "dialog-actions" }, buttons.map(([label, fn, primary]) =>
        h("button", { class: "btn" + (primary ? " primary" : ""), type: "button", onclick: () => { win.close(); fn && fn(); } }, label))));
    win = WM.open({ id, title, icon, width, height: 10, resizable: false, noMin: true, className: "dialog", content: body });
    win.el.style.height = "auto";
    const area = document.getElementById("desktop").getBoundingClientRect();
    win.el.style.top = Math.max(8, (area.height - win.el.offsetHeight) / 2.5) + "px";
    win.el.querySelector(".dialog-actions .primary")?.focus();
    return win;
  }

  function openWelcome() {
    dialog({
      id: "welcome", title: "Welcome", icon: "info", width: 460,
      text: [
        h("h2", { style: "margin-top:0" }, `Welcome to CICTNA OS`),
        h("p", {}, `This is the portfolio of ${owner} / ${studio}. It works like a 90s desktop: ${matchMedia("(hover: none)").matches ? "tap icons to open them" : "double-click icons, drag windows"}, poke around.`),
        h("div", { class: "tip" }, h("b", {}, "Did you know? "), "The Tray Store project has a working telegram encoder, and the Command Prompt knows a secret ", h("code", {}, "sudo"), " command."),
      ],
      buttons: [["Show me the work", openProjects, true], ["Who are you?", openNotepad], ["Close", null]],
    });
  }

  function openHelp() {
    dialog({
      id: "help", title: "Help", icon: "help",
      text: [
        h("p", {}, h("b", {}, "Double-click"), " an icon to open it (single tap on touch screens)."),
        h("p", {}, h("b", {}, "Drag"), " a title bar to move a window, the corner grip to resize, double-click a title bar to maximise."),
        h("p", { style: "margin:0" }, "Every window has its own link: copy the address bar to share a project directly."),
      ],
    });
  }

  function openShutdown() {
    dialog({
      id: "shutdown", title: "Shut Down CICTNA OS", icon: "shutdown",
      text: [h("p", { style: "margin-top:0" }, "Before you go: what would you like to do?")],
      buttons: [
        ["Start a project with us", () => openMail("Let's work together"), true],
        ["Restart", () => { sessionStorageSafe.remove("booted"); location.hash = ""; location.reload(); }],
        ["Cancel", null],
      ],
    });
  }

  const sessionStorageSafe = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
    remove: (k) => { try { sessionStorage.removeItem(k); } catch {} },
  };

  window.Apps = {
    iconButton, openProjects, openProject, openNotepad, openMail, openTerminal, openTrash,
    openServices, openDisplay, openWelcome, openHelp, openShutdown, dialog, setHash, sessionStorageSafe,
  };
})();
