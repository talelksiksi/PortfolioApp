/* Extra programs: sound, Track Record, Book a Call and TraySweeper. */
(function () {
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const svg = (name) => h("span", { html: name.startsWith("<svg") ? name : (ICONS[name] || ICONS.computer), style: "display:contents" });

  // ---------------------------------------------------------------- Sound
  // Tiny synthesised sounds, no audio files. Browsers only allow audio after
  // the visitor has interacted with the page, so early calls fail silently.
  let actx = null;
  const Sound = {
    muted: store.get("muted") === "1",
    ctx() {
      try {
        if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        if (actx.state === "suspended") actx.resume();
      } catch { actx = null; }
      return actx;
    },
    tone(freq, at, dur, type = "triangle", vol = 0.12) {
      const c = Sound.ctx();
      if (!c || Sound.muted) return;
      const t0 = c.currentTime + at;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(c.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },
    /** Start-up chime: a rising major arpeggio over a soft pad. */
    chime() {
      [[523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.38]].forEach(([f, at]) => Sound.tone(f, at, 1.1, "triangle", 0.1));
      [261.63, 392].forEach((f) => Sound.tone(f, 0, 1.8, "sine", 0.06));
    },
    click() { Sound.tone(880, 0, 0.06, "square", 0.03); },
    win() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => Sound.tone(f, i * 0.09, 0.35, "square", 0.05)); },
    lose() { [220, 185, 147].forEach((f, i) => Sound.tone(f, i * 0.16, 0.3, "sawtooth", 0.06)); },
    setMuted(m) { Sound.muted = m; store.set("muted", m ? "1" : "0"); window.dispatchEvent(new Event("sound:change")); },
  };
  // Unlock audio on the first interaction.
  window.addEventListener("pointerdown", () => Sound.ctx(), { once: true, capture: true });
  window.Sound = Sound;

  // ---------------------------------------------------------------- Track record
  function openTrack() {
    return WM.open({
      id: "track", title: t("track"), icon: "trophy", width: 720, height: 580, reopen: openTrack,
      content: h("div", { class: "scroll sunken content pad" },
        h("div", { class: "kicker" }, SITE.studio),
        h("h1", {}, t("trackH1")),
        h("p", {}, t("trackP")),
        h("div", { class: "stat-grid" }, TRACK.stats.map((s) =>
          h("div", { class: "stat" }, h("b", {}, s.n), h("span", {}, L(s))))),
        h("h2", {}, t("trackWork")),
        h("div", { class: "work-list" }, TRACK.work.map((w) =>
          h("article", { class: "work" },
            h("div", { class: "kicker" }, L(w.sector)),
            h("h3", {}, L(w.title)),
            h("p", {}, L(w.text))))),
        h("div", { class: "actions" },
          h("button", { class: "btn primary cta", type: "button", onclick: () => Apps.openMail(t("trackCta")) }, svg("mail"), t("trackCta")),
          h("button", { class: "btn", type: "button", onclick: () => Apps.openCv() }, svg("cv"), "CV"))),
      onOpen: () => Apps.setHash("track"),
    });
  }

  // ---------------------------------------------------------------- Book a call
  function openBook() {
    const lang = Lang.get();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const days = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    while (days.length < 10) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
    }
    const dayLabel = (x) => x.toLocaleDateString(Lang.locale(), { weekday: "short", day: "numeric", month: "short" });
    const slots = ["09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00"];
    const chip = (name, value, label, i) => h("label", { class: "chip" },
      h("input", { type: "radio", name, value, checked: i === 0 && name === "type" }), h("span", {}, label));

    const form = h("form", { class: "book-form", novalidate: true },
      h("p", { style: "margin-top:0" }, t("bookIntro")),
      h("fieldset", {}, h("legend", {}, t("bookDay")),
        h("div", { class: "chips-pick" }, days.map((x, i) => chip("day", dayLabel(x), dayLabel(x), i)))),
      h("fieldset", {}, h("legend", {}, t("bookSlot")),
        h("div", { class: "chips-pick" }, slots.map((x, i) => chip("slot", x, x, i))),
        h("small", {}, t("bookTz", tz))),
      h("fieldset", {}, h("legend", {}, t("bookType")),
        h("div", { class: "chips-pick" }, [t("bookVideo"), t("bookPhone")].map((x, i) => chip("type", x, x, i)))),
      h("div", { class: "book-fields" },
        h("input", { class: "field-input", name: "name", placeholder: t("phName"), autocomplete: "name", "aria-label": t("phName") }),
        h("input", { class: "field-input", name: "email", type: "email", placeholder: "you@company.com", autocomplete: "email", "aria-label": "Email" }),
        h("input", { class: "field-input", name: "company", placeholder: t("mCompany").replace(":", "").trim(), autocomplete: "organization", "aria-label": t("mCompany") }),
        h("textarea", { class: "field-input", name: "topic", placeholder: t("bookTopic"), "aria-label": t("bookTopic") })),
    );
    const notice = h("div", { class: "notice sunken", hidden: true, role: "status" });
    const show = (icon, ...msg) => { notice.hidden = false; notice.replaceChildren(svg(icon), h("div", {}, ...msg)); notice.scrollIntoView({ block: "nearest" }); };
    const sendBtn = h("button", { class: "btn primary cta", type: "button" }, svg("calendar"), t("bookSend"));

    sendBtn.addEventListener("click", async () => {
      const f = Object.fromEntries(new FormData(form));
      const missing = [];
      if (!f.day) missing.push(t("bookNeedDay"));
      if (!f.slot) missing.push(t("bookNeedSlot"));
      if (!(f.name || "").trim()) missing.push(t("needName"));
      if (!/^\S+@\S+\.\S+$/.test(f.email || "")) missing.push(t("needEmail"));
      if (missing.length) return show("warn", t("needs", missing));
      sendBtn.disabled = true;
      show("info", t("sending"));
      const subject = t("bookSubject", f.day, f.slot);
      try {
        await Apps.submitForm({
          subject: `[Portfolio] ${subject}`, name: f.name, email: f.email, company: f.company,
          message: `${subject} (${tz})\n${t("bookType")}: ${f.type}\n\n${f.topic || ""}`,
          day: f.day, time_window: f.slot, time_zone: tz, call_type: f.type,
        });
        const [b, rest] = t("bookSent");
        show("info", h("b", {}, b), rest);
        Sound.win();
      } catch {
        const [a, btn, c] = t("sendFail");
        show("warn", a, h("button", { class: "btn", type: "button", onclick: () => Apps.sendVia({ subject, body: `${f.topic || ""}\n\n— ${f.name}\n${f.email}\n${f.day}, ${f.slot} (${tz})\n${f.type}` }) }, btn), c,
          h("a", { href: "mailto:" + SITE.email }, SITE.email), ".");
      } finally {
        sendBtn.disabled = false;
      }
    });

    return WM.open({
      id: "book", title: t("bookTitle"), icon: "calendar", width: 600, height: 600, reopen: openBook,
      content: h("div", { class: "win-body" },
        h("div", { class: "mail-toolbar" }, sendBtn),
        h("div", { class: "scroll sunken content pad" }, form, notice)),
      status: [t("mailTo", SITE.email), t("replies")],
      onOpen: () => Apps.setHash("book"),
    });
  }

  // ---------------------------------------------------------------- TraySweeper
  function openGame() {
    const W = 9, H = 9, MINES = 10;
    let cells, started, over, flags, revealed, timer, seconds, flagMode = false;
    const board = h("div", { class: "sweep-board", role: "grid", style: `--cols:${W}` });
    const counter = h("span", { class: "lcd" });
    const clock = h("span", { class: "lcd" });
    const face = h("button", { class: "btn face", type: "button", title: t("gameNew"), "aria-label": t("gameNew") });
    const flagBtn = h("button", { class: "btn", type: "button", "aria-pressed": "false" }, "⚑ ", t("gameFlagMode"));
    const msg = h("div", { class: "sweep-msg", role: "status" });

    const FACE = { ok: "🙂", wow: "😮", win: "😎", lose: "😵" };
    const pad3 = (n) => String(Math.max(-99, Math.min(999, n))).padStart(3, "0");

    function reset() {
      clearInterval(timer);
      cells = Array.from({ length: W * H }, (_, i) => ({ i, x: i % W, y: Math.floor(i / W), mine: false, n: 0, open: false, flag: false }));
      started = false; over = false; flags = 0; revealed = 0; seconds = 0;
      face.textContent = FACE.ok;
      msg.replaceChildren();
      render();
    }
    const around = (c) => {
      const out = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const x = c.x + dx, y = c.y + dy;
        if (x >= 0 && y >= 0 && x < W && y < H) out.push(cells[y * W + x]);
      }
      return out;
    };
    function place(safe) {
      const banned = new Set([safe.i, ...around(safe).map((c) => c.i)]);
      let n = 0;
      while (n < MINES) {
        const c = cells[Math.floor(Math.random() * cells.length)];
        if (c.mine || banned.has(c.i)) continue;
        c.mine = true; n++;
      }
      cells.forEach((c) => { c.n = around(c).filter((a) => a.mine).length; });
      started = true;
      timer = setInterval(() => { seconds++; clock.textContent = pad3(seconds); }, 1000);
    }
    function open(c) {
      if (over || c.flag || c.open) return;
      if (!started) place(c);
      if (c.mine) return lose(c);
      const stack = [c];
      while (stack.length) {
        const k = stack.pop();
        if (k.open || k.flag) continue;
        k.open = true; revealed++;
        if (k.n === 0) around(k).forEach((a) => { if (!a.open && !a.mine) stack.push(a); });
      }
      Sound.click();
      if (revealed === W * H - MINES) win();
      render();
    }
    function toggleFlag(c) {
      if (over || c.open) return;
      c.flag = !c.flag; flags += c.flag ? 1 : -1;
      Sound.click();
      render();
    }
    function lose(c) {
      over = true; clearInterval(timer);
      c.boom = true;
      cells.forEach((k) => { if (k.mine) k.open = true; });
      face.textContent = FACE.lose;
      msg.replaceChildren(h("p", {}, t("gameLose")));
      Sound.lose();
      render();
    }
    function win() {
      over = true; clearInterval(timer);
      cells.forEach((k) => { if (k.mine) k.flag = true; });
      flags = MINES;
      face.textContent = FACE.win;
      msg.replaceChildren(h("p", {}, h("b", {}, t("gameWin"))),
        h("button", { class: "btn primary cta", type: "button", onclick: () => Apps.openMail(t("gameCta")) }, svg("mail"), t("gameCta")));
      Sound.win();
    }
    function render() {
      counter.textContent = pad3(MINES - flags);
      clock.textContent = pad3(seconds);
      board.replaceChildren(...cells.map((c) => {
        const b = h("button", {
          class: "cell" + (c.open ? " open" : "") + (c.flag ? " flag" : "") + (c.open && c.mine ? " mine" : "") + (c.boom ? " boom" : "") + (c.open && c.n ? " n" + c.n : ""),
          type: "button", role: "gridcell", "aria-label": `${c.x + 1},${c.y + 1}`,
        }, c.open ? (c.mine ? "✖" : c.n || "") : c.flag ? "⚑" : "");
        let press = null, longFired = false;
        b.addEventListener("pointerdown", (e) => {
          if (e.button !== 0) return;
          if (!over && !c.open) face.textContent = FACE.wow;
          longFired = false;
          press = setTimeout(() => { longFired = true; toggleFlag(c); }, 420);
        });
        const clear = () => { clearTimeout(press); if (!over) face.textContent = FACE.ok; };
        b.addEventListener("pointerup", clear);
        b.addEventListener("pointerleave", clear);
        b.addEventListener("click", () => { if (longFired) return; flagMode ? toggleFlag(c) : open(c); });
        b.addEventListener("contextmenu", (e) => { e.preventDefault(); clearTimeout(press); if (!longFired) toggleFlag(c); });
        return b;
      }));
    }
    face.addEventListener("click", reset);
    flagBtn.addEventListener("click", () => {
      flagMode = !flagMode;
      flagBtn.setAttribute("aria-pressed", flagMode ? "true" : "false");
      flagBtn.classList.toggle("pressed", flagMode);
    });
    reset();

    return WM.open({
      id: "game", title: t("game"), icon: "game", width: 380, height: 560, reopen: openGame,
      onClose: () => { clearInterval(timer); },
      content: h("div", { class: "scroll content sweep" },
        h("p", { class: "sweep-intro" }, t("gameIntro")),
        h("div", { class: "sweep-head sunken" }, counter, face, clock),
        board,
        h("div", { class: "sweep-tools" }, flagBtn, h("small", {}, t("gameHint"))),
        msg),
      onOpen: () => Apps.setHash("game"),
    });
  }

  Object.assign(Apps, { openTrack, openBook, openGame });
})();
