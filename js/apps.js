/* The programs that run on CICTNA OS. */
(function () {
  const { owner, studio, email, github } = SITE;
  const byId = (id) => PROJECTS.find((p) => p.id === id);
  const svg = (name) => h("span", { html: name.startsWith("<svg") ? name : (ICONS[name] || ICONS.computer), style: "display:contents" });
  const isTouch = () => matchMedia("(hover: none)").matches;

  function setHash(hash) {
    const url = hash ? "#" + hash : location.pathname + location.search;
    history.replaceState(null, "", url);
  }

  /** A double-clickable icon (single tap on touch / keyboard Enter). */
  function iconButton({ label, icon, onOpen, dark, title }) {
    const b = h("button", { class: "icon" + (dark ? " dark" : ""), type: "button", title: title || label },
      svg(icon), h("span", {}, label.replace(/\./g, "\u200B.")));
    b.addEventListener("click", (e) => {
      document.querySelectorAll(".icon.selected").forEach((i) => i.classList.remove("selected"));
      b.classList.add("selected");
      // Mouse users double-click like a real desktop; touch and keyboard open on one activation.
      if (e.detail === 0 || e.pointerType === "touch" || isTouch()) onOpen();
    });
    b.addEventListener("dblclick", onOpen);
    return b;
  }

  // ---------------------------------------------------------------- Projects
  function openProjects() {
    const grid = h("ul", { class: "explorer-grid", role: "list" },
      PROJECTS.map((p) => h("li", {}, iconButton({ label: p.file, icon: p.icon, dark: true, onOpen: () => openProject(p.id) }))));
    return WM.open({
      id: "projects", title: "C:\\Projects", icon: "folderOpen", width: 620, height: 400, reopen: openProjects,
      menubar: [[t("file"), () => {}], [t("view"), () => {}], [t("help"), () => openHelp()]],
      content: h("div", { class: "win-body" },
        h("div", { class: "addr" }, t("address"), h("div", { class: "field sunken" }, svg("folderOpen"), "C:\\Projects")),
        h("div", { class: "scroll sunken" }, grid)),
      status: [t("objects", PROJECTS.length), t("openHint", isTouch())],
      onOpen: () => setHash("projects"),
    });
  }

  function openProject(id) {
    const p = byId(id);
    if (!p) return;
    const tabs = [
      [t("tabOverview"), () => [
        p.shot ? h("a", { class: "shot sunken", href: p.live || p.shot, target: "_blank", rel: "noopener" },
          h("img", { src: p.shot, alt: p.name, loading: "lazy", width: 1280, height: 800 })) : null,
        h("p", {}, L(p.summary)),
        h("div", { class: "ps" },
          h("div", { class: "sunken" }, h("h2", {}, t("problem")), h("p", {}, L(p.problem))),
          h("div", { class: "sunken" }, h("h2", {}, t("built")), h("p", {}, L(p.solution)))),
      ]],
      [t("tabHighlights"), () => [h("ul", {}, L(p.highlights).map((x) => h("li", {}, x)))]],
      [t("tabStack"), () => [h("ul", { class: "chips" }, p.stack.map((s) => h("li", {}, L(s))))]],
    ];
    if (p.demo === "telegram") tabs.push([t("tabTry"), telegramLab]);

    const panel = h("div", { class: "tab-panel content" });
    const tabBar = h("div", { class: "tabs", role: "tablist" });
    const select = (i) => {
      [...tabBar.children].forEach((tb, j) => tb.setAttribute("aria-selected", i === j ? "true" : "false"));
      panel.replaceChildren(...tabs[i][1]());
    };
    tabs.forEach(([label], i) => tabBar.append(h("button", { class: "tab", type: "button", role: "tab", onclick: () => select(i) }, label)));
    select(0);

    const actions = h("div", { class: "actions", style: "padding:0 8px 10px" },
      p.live ? h("a", { class: "btn primary cta", href: p.live, target: "_blank", rel: "noopener" }, svg("globe"), t("openLive")) : null,
      p.demo ? h("button", { class: "btn" + (p.live ? "" : " primary cta"), type: "button", onclick: () => select(tabs.length - 1) }, t("tryHere")) : null,
      h("button", { class: "btn", type: "button", onclick: () => openMail(t("enquiry", p.name)) }, svg("mail"), t("buildLike")),
    );

    return WM.open({
      id: "project-" + p.id, title: p.file, icon: p.icon, width: 680, height: 560, reopen: () => openProject(id),
      content: h("div", { class: "scroll" },
        h("div", { class: "project-hero" }, svg(p.icon),
          h("div", {}, h("div", { class: "kicker" }, L(p.category) + " · " + p.year), h("h1", {}, p.name))),
        tabBar, panel, actions),
      status: [L(p.category), p.live ? t("liveAvail") : t("onRequest")],
      onOpen: () => setHash("project/" + p.id),
    });
  }

  /** Tray store telegram encoder: XOR checksum over the body between "$" and "*CS". */
  function telegramLab() {
    const seq = h("input", { type: "number", min: 0, max: 9999, value: 5, "aria-label": t("seq") });
    const col = h("input", { type: "number", min: 0, max: 99, value: 1, "aria-label": t("col") });
    const lvl = h("input", { type: "number", min: 0, max: 99, value: 1, "aria-label": t("lvl") });
    const from = h("select", { "aria-label": t("from") }, h("option", { value: "F" }, t("front")), h("option", { value: "B" }, t("back")));
    const qty = h("input", { type: "number", min: 1, max: 12, value: 1, "aria-label": t("trays") });
    const out = h("div", { class: "wire", "aria-live": "polite" });
    const pad = (n, w) => String(Math.max(0, n | 0)).padStart(w, "0").slice(-w);
    const xor = (s) => [...s].reduce((a, c) => a ^ c.charCodeAt(0), 0).toString(16).toUpperCase().padStart(2, "0");
    const render = () => {
      const n = pad(seq.value, 4);
      const body = `MOV*${n}*CH=${pad(col.value, 2)}.${pad(lvl.value, 2)}*FROM=${from.value}*QTY=${Math.min(12, Math.max(1, qty.value | 0))}`;
      const ack = `ACK*${n}*OK`;
      out.replaceChildren(
        h("span", { class: "dim" }, t("toPlc") + "\n"), "$" + body + "*", h("span", { class: "cs" }, "CS=" + xor(body)), "#\n\n",
        h("span", { class: "dim" }, t("fromPlc") + "\n"), "$" + ack + "*", h("span", { class: "cs" }, "CS=" + xor(ack)), "#");
    };
    [seq, col, lvl, from, qty].forEach((i) => i.addEventListener("input", render));
    render();
    const [a, b, c] = t("labIntro");
    return [
      h("p", {}, a, h("code", {}, "$"), b, h("code", {}, "*CS"), c),
      h("div", { class: "lab" },
        h("div", { class: "row" },
          h("label", {}, t("seq"), seq), h("label", {}, t("col"), col), h("label", {}, t("lvl"), lvl), h("label", {}, t("from"), from)),
        h("div", { class: "row" }, h("label", {}, t("trays"), qty))),
      out,
    ];
  }

  // ---------------------------------------------------------------- Notepad
  const ABOUT = {
    en: () => `ABOUT_ME.TXT
============

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
`,
    fr: () => `A_PROPOS.TXT
============

Bonjour, je suis ${owner}. Je dirige ${studio}.

Je conçois du logiciel là où le web rencontre le terrain :
des contrôleurs qui dialoguent avec les automates, des
clients OPC UA qui tiennent sur de vrais réseaux, des
tableaux de bord qui bougent dès que l'atelier bouge, et
les applications web clients qui se posent par-dessus.

MES POINTS FORTS
- Intégration industrielle : protocoles à télégrammes,
  OPC UA (C#/.NET), WMS et automatisation d'entrepôt
- Temps réel : WebSockets, backends événementiels,
  séquencement sûr (aucun mouvement exécuté deux fois)
- Applications web : React, JavaScript natif quand c'est
  le bon outil, Node/Express, Blazor
- Des simulateurs pour tester la logique de conduite
  avant que le matériel n'existe

MA FAÇON DE TRAVAILLER
- Partir de votre processus, pas d'un framework
- Livrer tôt une démo qui fonctionne, à manipuler
- Des tests là où ils comptent, une doc qui répond à
  « comment je le lance ? »
- Des points d'avancement clairs ; pas de facture surprise

PROCHAINE ÉTAPE
Double-cliquez sur « Contact.exe » sur le bureau, ou
écrivez à ${email}. Dites-moi ce qui freine votre activité.

(Ce fichier est modifiable. Allez-y, personne ne regarde.)
`,
  };
  const aboutText = () => ABOUT[Lang.get()]();

  function openNotepad() {
    const ta = h("textarea", { spellcheck: "false", "aria-label": t("smAbout") });
    ta.value = aboutText();
    const status = h("span", {}, t("lnCol", 1, 1));
    const update = () => {
      const before = ta.value.slice(0, ta.selectionStart).split("\n");
      status.textContent = t("lnCol", before.length, before[before.length - 1].length + 1);
    };
    ["keyup", "click", "input"].forEach((e) => ta.addEventListener(e, update));
    let wrap = true;
    return WM.open({
      id: "notepad", title: t("notepadTitle"), icon: "notepad", width: 560, height: 480, reopen: openNotepad,
      menubar: [
        [t("file"), () => download(t("about"), ta.value)],
        [t("edit"), () => { ta.focus(); ta.select(); }],
        [t("format"), () => { wrap = !wrap; ta.wrap = wrap ? "soft" : "off"; }],
        [t("help"), () => openHelp()],
      ],
      content: h("div", { class: "win-body notepad sunken" }, ta),
      status: [t("notepadHint"), status],
      onOpen: () => setHash("about"),
    });
  }

  function download(name, text) {
    const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: "text/plain" })), download: name });
    document.body.append(a); a.click(); a.remove();
  }

  // ---------------------------------------------------------------- Mail
  /**
   * Let the visitor send an email their own way. A mailto: link only works when
   * the device has a mail program set up (often not the case on Windows), so we
   * also offer Gmail and Outlook.com in the browser, and copying our address.
   */
  function sendVia({ subject = "", body = "" } = {}) {
    const q = (k, v) => (v ? `${k}=${encodeURIComponent(v)}` : "");
    const join = (...p) => p.filter(Boolean).join("&");
    const mailto = `mailto:${email}?${join(q("subject", subject), q("body", body))}`;
    const gmail = `https://mail.google.com/mail/?${join("view=cm", "fs=1", q("to", email), q("su", subject), q("body", body))}`;
    const outlook = `https://outlook.live.com/mail/0/deeplink/compose?${join(q("to", email), q("subject", subject), q("body", body))}`;
    const openTab = (url) => window.open(url, "_blank", "noopener");
    const copy = async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(email); ok = true; } catch {}
      dialog({ id: "copied", title: t("viaTitle"), icon: ok ? "info" : "warn",
        text: [h("p", { style: "margin:0" }, ok ? t("viaCopied", email) : t("viaCopyFail"), ok ? null : h("b", { style: "user-select:all" }, email))] });
    };
    return dialog({
      id: "send-via", title: t("viaTitle"), icon: "mail", width: 470,
      text: [h("p", { style: "margin-top:0" }, t("viaText")), h("p", { class: "tip", style: "margin:0" }, t("viaHint"))],
      buttons: [
        [t("viaApp"), () => { location.href = mailto; }, true],
        ["Gmail", () => openTab(gmail)],
        ["Outlook.com", () => openTab(outlook)],
        [t("viaCopy"), copy],
      ],
    });
  }

  /** Deliver a form to our inbox through Web3Forms. Throws on any failure. */
  async function submitForm(fields) {
    if (!SITE.web3formsKey) throw new Error("no key");
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: SITE.web3formsKey,
        from_name: `${fields.name} via portfolio`,
        replyto: fields.email,
        language: Lang.get(),
        botcheck: "",
        ...fields,
      }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.success === false) throw new Error(out.message || res.status);
    return out;
  }

  function openMail(subject, keep) {
    const existing = WM.get("mail");
    if (existing) {
      if (subject) existing.el.querySelector("[name=subject]").value = subject;
      existing.focus();
      return existing;
    }
    const field = (name, attrs) => h("input", { class: "field-input", name, id: "m-" + name, ...attrs });
    const budgets = t("budgets");
    const defaultSubject = subject || t("defaultSubject");
    const form = h("form", { class: "mail-form", novalidate: true },
      h("label", { for: "m-name" }, t("mFrom")), field("name", { placeholder: t("phName"), autocomplete: "name", required: true }),
      h("label", { for: "m-email" }, t("mReply")), field("email", { type: "email", placeholder: "you@company.com", autocomplete: "email", required: true }),
      h("label", { for: "m-company" }, t("mCompany")), field("company", { placeholder: t("phCompany"), autocomplete: "organization" }),
      h("label", { for: "m-subject" }, t("mSubject")), field("subject", { value: defaultSubject, required: true }),
      h("label", {}, t("mBudget")),
      h("div", { class: "budget", role: "radiogroup", "aria-label": t("budgetLabel") },
        budgets.map((b, i) => h("label", {}, h("input", { type: "radio", name: "budget", value: b, "data-i": i, checked: i === budgets.length - 1 }), b))),
      h("textarea", { class: "field-input full", name: "message", placeholder: t("phMsg"), required: true, "aria-label": "Message" }),
      h("input", { class: "hp", name: "_honey", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
    );
    if (keep) { // values carried over from a language switch
      for (const k of ["name", "email", "company", "subject", "message"]) if (keep[k] != null) form.elements[k].value = keep[k];
      if (keep.budgetIndex != null) form.querySelector(`[data-i="${keep.budgetIndex}"]`).checked = true;
    }
    const notice = h("div", { class: "notice sunken", hidden: true, role: "status" });
    const sendBtn = h("button", { class: "btn primary cta", type: "button" }, svg("mail"), t("send"));
    const show = (icon, ...msg) => { notice.hidden = false; notice.replaceChildren(svg(icon), h("div", {}, ...msg)); };

    const mailtoFallback = (d) => {
      const sign = [d.name, d.company].filter((x) => x && x.trim()).join(", ");
      const body = [d.message, "", sign ? "— " + sign : "", d.email, `${t("budgetLabel")}: ${d.budget}`].filter((x, i) => i < 2 || x).join("\n");
      sendVia({ subject: d.subject, body: body.trim() });
    };

    async function send() {
      const d = Object.fromEntries(new FormData(form));
      if (d._honey) return; // bot
      const missing = [];
      if (!d.name.trim()) missing.push(t("needName"));
      if (!/^\S+@\S+\.\S+$/.test(d.email)) missing.push(t("needEmail"));
      if (!d.message.trim()) missing.push(t("needMsg"));
      if (missing.length) return show("warn", t("needs", missing));
      if (!SITE.web3formsKey) return mailtoFallback(d);

      sendBtn.disabled = true;
      show("info", t("sending"));
      try {
        await submitForm({
          subject: `[Portfolio] ${d.subject}`,
          name: d.name, email: d.email, company: d.company, budget: d.budget, message: d.message,
        });
        form.reset();
        const [b, rest] = t("sent");
        show("info", h("b", {}, b), rest);
      } catch {
        const [a, btn, c] = t("sendFail");
        show("warn", a,
          h("button", { class: "btn", type: "button", onclick: () => mailtoFallback(d) }, btn),
          c, h("a", { href: "mailto:" + email }, email), ".");
      } finally {
        sendBtn.disabled = false;
      }
    }
    sendBtn.addEventListener("click", send);
    form.addEventListener("submit", (e) => { e.preventDefault(); send(); });

    const snapshot = () => {
      const d = Object.fromEntries(new FormData(form));
      const sel = form.querySelector("[name=budget]:checked");
      // An untouched default subject is re-translated rather than carried over.
      if (d.subject === defaultSubject && !subject) delete d.subject;
      return { ...d, budgetIndex: sel ? sel.dataset.i : null };
    };

    const win = WM.open({
      id: "mail", title: t("mailTitle"), icon: "mail", width: 560, height: 540,
      reopen: () => openMail(null, snapshot()),
      content: h("div", { class: "win-body" },
        h("div", { class: "mail-toolbar" }, sendBtn,
          h("button", { class: "btn", type: "button", onclick: () => mailtoFallback(Object.fromEntries(new FormData(form))) }, t("useMailApp"))),
        h("div", { class: "scroll sunken content" }, form, notice)),
      status: [t("mailTo", email), t("replies")],
      onOpen: () => setHash("contact"),
    });
    if (!keep && !isTouch()) setTimeout(() => form.querySelector("[name=name]").focus(), 50);
    return win;
  }

  // ---------------------------------------------------------------- Terminal
  function openTerminal() {
    const fr = Lang.get() === "fr";
    const out = h("div", {});
    const input = h("input", { "aria-label": "Command", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
    const promptText = "C:\\CICTNA> ";
    const term = h("div", { class: "term", onclick: () => input.focus() }, out, h("div", { class: "prompt-row" }, h("span", {}, promptText), input));
    const hist = [];
    let hi = 0;

    const print = (text, cls) => { out.append(h("div", { class: "line " + (cls || "") }, text)); term.scrollTop = term.scrollHeight; };
    const printNode = (...nodes) => { out.append(h("div", { class: "line" }, ...nodes)); term.scrollTop = term.scrollHeight; };

    const HELP = fr
      ? `Commandes disponibles :
  whoami            qui fait tourner cette machine
  ls / dir          lister les projets
  open <projet>     ouvrir un projet       (ex. open opcua)
  cat about.txt     afficher la bio
  cv                ouvrir le CV
  skills            ce que nous construisons
  services          comment nous pouvons aider
  contact           ouvrir la messagerie
  lang en|fr        changer de langue
  neofetch          infos système
  theme <nom>       pixel | teal | sunset | classic | grid
  clear / cls       effacer l'écran
  exit              fermer le terminal`
      : `Available commands:
  whoami            who runs this machine
  ls / dir          list projects
  open <project>    open a project window   (e.g. open opcua)
  cat about.txt     print the bio
  cv                open the CV
  skills            what we build
  services          how we can help
  contact           open the mail client
  lang en|fr        switch language
  neofetch          system info
  theme <name>      pixel | teal | sunset | classic | grid
  clear / cls       clear the screen
  exit              close the terminal`;

    const cmds = {
      help: () => print(HELP, "mut"),
      aide: () => cmds.help(),
      whoami: () => print(`${owner} @ ${studio} — ${L(SITE.tagline)}`, "acc"),
      ls: () => PROJECTS.forEach((p) => print(`  ${p.file.padEnd(24)} ${L(p.category)}`)),
      dir: () => cmds.ls(),
      open: (arg) => {
        if (!arg) return print(fr ? "usage : open <projet>" : "usage: open <project>", "err");
        const q = arg.toLowerCase().replace(/[^a-z0-9]/g, "");
        const p = PROJECTS.find((x) => (x.id + x.name + x.file).toLowerCase().replace(/[^a-z0-9]/g, "").includes(q));
        if (!p) return print(fr ? `'${arg}' introuvable. Essayez 'ls'.` : `'${arg}' not found. Try 'ls'.`, "err");
        print((fr ? "Lancement de " : "Launching ") + p.file + "…", "ok");
        openProject(p.id);
      },
      cat: (arg) => {
        if (/about|propos/i.test(arg || "")) return aboutText().split("\n").forEach((l) => print(l));
        print(fr ? `cat : ${arg || ""} : fichier introuvable. Essayez 'cat about.txt'.` : `cat: ${arg || ""}: No such file. Try 'cat about.txt'.`, "err");
      },
      type: (arg) => cmds.cat(arg),
      cv: () => openCv(),
      skills: () => print(fr
        ? `  Industriel   Télégrammes automate · OPC UA (.NET) · WMS · magasins à plateaux
  Temps réel   WebSockets · Express · backends événementiels
  Web          React · JavaScript natif · Blazor · Vercel
  Qualité      xUnit · tests d'intégration · simulateurs`
        : `  Industrial   PLC telegrams · OPC UA (.NET) · WMS · tray stores
  Realtime     WebSockets · Express · event-driven backends
  Web          React · vanilla JS · Blazor · Vercel
  Quality      xUnit · integration tests · simulators`),
      services: () => SERVICES.forEach((s) => print(`  ▸ ${L(s.title)} : ${L(s.text)}`)),
      contact: () => { print((fr ? "Ouverture de " : "Opening ") + "Contact.exe…", "ok"); openMail(); },
      lang: (arg) => {
        const v = (arg || "").toLowerCase().slice(0, 2);
        if (v !== "en" && v !== "fr") return print("usage: lang en|fr", "err");
        Lang.set(v);
      },
      neofetch: () => print(
`   .-~~~-.      ${owner.toLowerCase().replace(" ", "")}@cictna
  /  ___  \\     ----------------------
 |  (   )  |    OS: CICTNA OS 95 (Industrial Edition)
 |~~~~~~~~~|    Host: ${location.host || "localhost"}
 |  ~~~~~  |    ${fr ? "Projets" : "Projects"}: ${PROJECTS.length}
  \\  ~~~  /     Shell: cictna-sh 1.0
   '-...-'      Uptime: ${Math.round(performance.now() / 1000)}s
                Lang: ${Lang.get().toUpperCase()}
                Contact: ${email}`, "acc"),
      theme: (arg) => {
        if (!Desktop.setWallpaper(arg)) return print("usage: theme pixel|teal|sunset|classic|grid", "err");
        print((fr ? "Fond d'écran : " : "Wallpaper set to ") + arg + ".", "ok");
      },
      clear: () => out.replaceChildren(),
      cls: () => cmds.clear(),
      exit: () => WM.get("terminal").close(),
      sudo: (arg) => /hire|engag/i.test(arg || "")
        ? (print(fr ? "[sudo] mot de passe pour client : ******** ✓" : "[sudo] password for client: ******** ✓", "ok"),
           print(fr ? "Autorisation accordée. Ouverture de Contact.exe…" : "Permission granted. Opening Contact.exe…", "ok"),
           openMail(t("letsWork")))
        : print(fr ? "Bien essayé. Vous vouliez dire 'sudo hire-me' ?" : "Nice try. Did you mean 'sudo hire-me'?", "err"),
      "hire-me": () => cmds.sudo("hire"),
      rm: () => print(fr ? "Accès refusé. Les expériences ratées vont dans la Corbeille." : "Access denied. Failed experiments belong in the Recycle Bin.", "err"),
      date: () => print(new Date().toLocaleString(Lang.get())),
      echo: (arg) => print(arg || ""),
      github: () => printNode("  ", h("a", { href: github, target: "_blank", rel: "noopener" }, github)),
    };

    function run(line) {
      printNode(h("span", { class: "ok" }, promptText), line);
      const [cmd, ...rest] = line.trim().split(/\s+/);
      if (!cmd) return;
      const fn = cmds[cmd.toLowerCase()];
      if (fn) fn(rest.join(" "));
      else print(fr ? `'${cmd}' n'est pas reconnu comme une commande. Tapez 'help'.` : `'${cmd}' is not recognized as a command. Type 'help'.`, "err");
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

    return WM.open({
      id: "terminal", title: t("terminal"), icon: "terminal", width: 620, height: 400, reopen: openTerminal,
      content: h("div", { class: "win-body sunken" }, term),
      onOpen: () => {
        print("CICTNA OS [Version 95.11.2026]", "mut");
        print("(c) " + new Date().getFullYear() + " " + studio + (fr ? ". Tapez 'help' pour commencer." : ". Type 'help' to get started."), "mut");
        print("");
        if (!isTouch()) setTimeout(() => input.focus(), 30);
        setHash("terminal");
      },
    });
  }

  // ---------------------------------------------------------------- Trash
  function openTrash() {
    return WM.open({
      id: "trash", title: t("trash"), icon: "trashFull", width: 560, height: 430, reopen: openTrash,
      menubar: [[t("file"), () => {}], [t("edit"), () => {}], [t("emptyTrash"), () =>
        dialog({ title: t("confirm"), icon: "warn", text: t("keepTrash"), buttons: [[t("fairEnough"), null, true]] })]],
      content: h("div", { class: "win-body" },
        h("div", { class: "scroll sunken content" },
          h("p", { class: "pad", style: "margin:0;padding-bottom:4px" }, t("trashIntro")),
          h("ul", { class: "trash-list" }, TRASH.map((x) => h("li", {}, svg("notepad"),
            h("div", {}, h("b", {}, x.file), h("div", {}, L(x.what)),
              h("div", { class: "lesson" }, h("strong", {}, t("lesson")), L(x.lesson)))))))),
      status: [t("objects", TRASH.length), t("lessonsCount", TRASH.length)],
      onOpen: () => setHash("trash"),
    });
  }

  // ---------------------------------------------------------------- Services
  function openServices() {
    return WM.open({
      id: "services", title: t("hire"), icon: "briefcase", width: 640, height: 540, reopen: openServices,
      content: h("div", { class: "scroll sunken content pad" },
        h("div", { class: "kicker" }, studio),
        h("h1", {}, t("svcH1")),
        h("p", {}, t("svcP")),
        h("div", { class: "svc-grid" }, SERVICES.map((s) => h("div", {}, h("h3", {}, L(s.title)), h("p", { style: "margin:0" }, L(s.text))))),
        h("h2", {}, t("svcH2")),
        h("ol", { class: "steps" }, t("steps").map(([b, rest]) => h("li", {}, h("b", {}, b), rest))),
        h("div", { class: "actions" },
          h("button", { class: "btn primary cta", type: "button", onclick: () => openMail(t("discovery")) }, svg("mail"), t("bookCall")),
          h("button", { class: "btn", type: "button", onclick: openProjects }, svg("folder"), t("seeWork")))),
      onOpen: () => setHash("services"),
    });
  }

  // ---------------------------------------------------------------- CV
  const cvLangs = () => ["en", "fr"].filter((l) => SITE.cv && SITE.cv[l]);
  const cvName = { en: "English", fr: "Français" };

  function openCv() {
    const langs = cvLangs();
    if (!langs.length) {
      return dialog({
        id: "cv-ask", title: t("cvTitle"), icon: "cv", text: [h("p", { style: "margin-top:0" }, t("cvMissing"))],
        buttons: [[t("smContact"), () => openMail("CV"), true], [t("close"), null]],
      });
    }
    // Current language first, so Enter picks the obvious one.
    const ordered = langs.sort((a) => (a === Lang.get() ? -1 : 1));
    return dialog({
      id: "cv-ask", title: t("cvTitle"), icon: "cv",
      text: [h("p", { style: "margin-top:0" }, t("cvQ"))],
      buttons: [...ordered.map((l, i) => [cvName[l], () => openCvViewer(l), i === 0]), [t("cancel"), null]],
    });
  }

  function openCvViewer(l) {
    const url = SITE.cv[l];
    // Phones and tablets show PDFs best in their own viewer.
    if (isTouch()) { window.open(url, "_blank", "noopener"); return; }
    const file = url.split("/").pop();
    return WM.open({
      id: "cv-" + l, title: t("cvWin", cvName[l]), icon: "cv", width: 760, height: 620, reopen: () => openCvViewer(l),
      content: h("div", { class: "win-body" },
        h("div", { class: "mail-toolbar" },
          h("a", { class: "btn", href: url, target: "_blank", rel: "noopener" }, svg("globe"), t("cvOpenTab")),
          h("a", { class: "btn", href: url, download: file }, t("cvDownload"))),
        h("iframe", { class: "pdf sunken", src: url + "#view=FitH", title: t("cvWin", cvName[l]) })),
      status: [file],
      onOpen: () => setHash("cv/" + l),
    });
  }

  // ---------------------------------------------------------------- Display
  function openDisplay() {
    const walls = [
      ["pixel", "linear-gradient(180deg,#afc9d2,#efdccb 58%,#3d6d78 60%,#24464e)"],
      ["teal", "linear-gradient(180deg,#2b5862,#3d6d78)"],
      ["sunset", "linear-gradient(180deg,#f1c09b,#e7a982 38%,#3d6d78 38.5%,#24464e)"],
      ["classic", "#008080"],
      ["grid", "linear-gradient(rgba(88,224,138,.3) 1px,transparent 1px) 0 0/8px 8px,linear-gradient(90deg,rgba(88,224,138,.3) 1px,transparent 1px) 0 0/8px 8px,#0d1a17"],
    ];
    const names = t("walls");
    const grid = h("div", { class: "wall-grid" });
    const paint = () => [...grid.children].forEach((b) => b.setAttribute("aria-pressed", b.dataset.w === Desktop.wallpaper() ? "true" : "false"));
    walls.forEach(([id, bg]) => grid.append(h("button", { class: "wall btn", type: "button", "data-w": id, onclick: () => { Desktop.setWallpaper(id); paint(); } },
      h("span", { style: "display:block;width:100%" }, h("i", { class: "sunken", style: `background:${bg}` }), names[id]))));
    paint();
    const crt = h("input", { type: "checkbox", id: "crt", checked: document.body.dataset.crt !== "off" });
    crt.addEventListener("change", () => Desktop.setCrt(crt.checked));
    return WM.open({
      id: "display", title: t("displayTitle"), icon: "display", width: 420, height: 470, resizable: false, reopen: openDisplay,
      content: h("div", { class: "pad content scroll" },
        h("p", {}, t("wallpaper")), grid,
        h("p", { style: "margin-top:14px" }, h("label", { for: "crt", style: "display:inline-flex;gap:6px;align-items:center" }, crt, t("crt")))),
    });
  }

  // ---------------------------------------------------------------- Dialogs
  function dialog({ title, icon = "info", text, buttons, id, width = 420 }) {
    let win;
    buttons = buttons || [[t("ok"), null, true]];
    const body = h("div", {},
      h("div", { class: "dialog-msg" }, svg(icon), h("div", { class: "content" }, text)),
      h("div", { class: "dialog-actions" }, buttons.map(([label, fn, primary]) =>
        h("button", { class: "btn" + (primary ? " primary" : ""), type: "button", onclick: () => { win.close(); fn && fn(); } }, label))));
    win = WM.open({ id, title, icon, width, height: 10, resizable: false, noMin: true, className: "dialog", content: body });
    win.el.style.height = "auto";
    const area = document.getElementById("desktop").getBoundingClientRect();
    win.el.style.top = Math.max(8, (area.height - win.el.offsetHeight) / 2.5) + "px";
    if (!isTouch()) win.el.querySelector(".dialog-actions .primary")?.focus();
    return win;
  }

  /** Welcome note: a corner balloon, so the app showcase stays visible. */
  function openWelcome() {
    document.getElementById("balloon")?.remove();
    const [a, b] = t("tipP");
    const quick = "quick.html" + (Lang.get() === "fr" ? "?lang=fr" : "");
    const close = () => { box.classList.add("hide"); setTimeout(() => box.remove(), 250); };
    const box = h("aside", { id: "balloon", class: "balloon", role: "status", "aria-label": t("welcomeTitle") },
      h("button", { class: "balloon-x", type: "button", "aria-label": t("close"), onclick: close }, "×"),
      h("div", { class: "balloon-head" }, svg("info"), h("b", {}, t("welcomeH"))),
      h("p", {}, t("balloonP", owner, studio, isTouch())),
      h("p", { class: "balloon-tip" }, h("b", {}, t("tipH")), a, h("code", {}, "sudo"), b),
      h("p", { class: "balloon-links" },
        h("button", { class: "btn", type: "button", onclick: () => { close(); openNotepad(); } }, t("whoAreYou")),
        h("a", { class: "btn", href: quick }, t("quickTipLink"))));
    document.body.append(box);
    return box;
  }

  function openHelp() {
    return dialog({
      id: "help", title: t("help"), icon: "help",
      text: t("helpLines").map(([b, rest], i, all) => h("p", { style: i === all.length - 1 ? "margin:0" : "" }, b ? h("b", {}, b) : null, rest)),
    });
  }

  function openShutdown() {
    return dialog({
      id: "shutdown", title: t("shutdownTitle"), icon: "shutdown",
      text: [h("p", { style: "margin-top:0" }, t("shutdownQ"))],
      buttons: [
        [t("startProject"), () => openMail(t("letsWork")), true],
        [t("restart"), () => { sessionStorageSafe.remove("booted"); location.hash = ""; location.reload(); }],
        [t("cancel"), null],
      ],
    });
  }

  const sessionStorageSafe = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
    remove: (k) => { try { sessionStorage.removeItem(k); } catch {} },
  };

  window.Apps = {
    iconButton, openProjects, openProject, openNotepad, openMail, openTerminal, openTrash, openCv, openCvViewer,
    openServices, openDisplay, openWelcome, submitForm, sendVia, openHelp, openShutdown, dialog, setHash, sessionStorageSafe, isTouch,
  };
})();
