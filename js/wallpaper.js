/*
 * Pixel-art wallpaper: the cictnardc.net hero scene redrawn as pixel art.
 * Pale sky warming to a peach horizon, a small sun with a wide glow, pine
 * forest on the left running down to the water, a low hill by the sun, a
 * light sea with white wave lines, and fog drifting across the shore.
 * Drawn at low resolution and scaled up with crisp pixels; ordered
 * dithering gives the gradients their 16-colour look.
 */
(function () {
  // Colours taken from the website's light theme.
  const C = {
    skyTop: "#d6e2e5", skyMid: "#e8eeee", horizon: "#f5e2d4",
    sun: "#f1c09b", glow: "#f6d6bd",
    hill: "#c2d0cd",
    sea: ["#b4cbcf", "#a8c2c6", "#9cb9be", "#8eafb5", "#80a4ab"],
    treeBack: "#6f8c81", treeFront: "#2c4d41", groundFront: "#2a4a3e",
    seaLine: "rgba(255,255,255,.6)", reflect: "rgba(241,192,155,.75)",
    fog: [255, 255, 255],
  };
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const SKY = [C.skyTop, C.skyTop, C.skyMid, C.skyMid, C.horizon, C.horizon].map(hex);
  const SEA = C.sea.map(hex);
  const SUN = hex(C.sun), GLOW = hex(C.glow), HILL = hex(C.hill);
  const TB = hex(C.treeBack), TF = hex(C.treeFront), GF = hex(C.groundFront);

  let canvas, ctx, base, W = 0, H = 0, px = 5, timer = null, frame = 0, scene = null;

  function rng(seed) {
    return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function layout() {
    const r = canvas.getBoundingClientRect();
    const mobile = r.width < 720;
    px = mobile ? 4 : 5;
    W = Math.max(40, Math.ceil(r.width / px));
    H = Math.max(40, Math.ceil(r.height / px));
    canvas.width = W;
    canvas.height = H;
    const rand = rng(1440260);
    const horizon = Math.round(H * (mobile ? 0.74 : 0.8));
    const sunX = Math.round(W * (mobile ? 0.74 : 0.77));
    const sunR = Math.max(4, Math.round(Math.min(W, H) * 0.04));

    // Forest: back row (lighter) and front row (dark), denser towards the left edge.
    const forestEnd = W * (mobile ? 0.62 : 0.58);
    const backTrees = [], frontTrees = [];
    for (let x = -4; x < forestEnd; x += 3 + Math.round(rand() * 4)) {
      const fade = 1 - Math.max(0, x / forestEnd);
      backTrees.push({ x, h: Math.round(H * (0.1 + rand() * 0.07) * (0.5 + 0.5 * fade) + 4) });
    }
    for (let x = -4; x < forestEnd * 0.86; x += 4 + Math.round(rand() * 5)) {
      const fade = 1 - Math.max(0, x / (forestEnd * 0.86));
      frontTrees.push({ x, h: Math.round(H * (0.14 + rand() * 0.09) * (0.45 + 0.55 * fade) + 5) });
    }

    scene = {
      mobile, horizon, sunX, sunR, forestEnd, backTrees, frontTrees,
      lines: Array.from({ length: Math.round(W * (H - horizon) / 170) }, () => ({
        x: rand() * W, y: horizon + 2 + Math.round(rand() * (H - horizon - 3)), w: 3 + Math.round(rand() * 9), speed: 0.015 + rand() * 0.03,
      })),
      birds: Array.from({ length: 3 }, () => ({ x: rand() * W, y: 6 + rand() * horizon * 0.4, speed: 0.1 + rand() * 0.08, flap: rand() * 6 })),
      fogs: [
        { y: horizon - Math.round(H * 0.07), h: Math.max(6, Math.round(H * 0.06)), w: W * 0.75, x: -W * 0.1, speed: 0.05 },
        { y: horizon - Math.round(H * 0.15), h: Math.max(5, Math.round(H * 0.05)), w: W * 0.6, x: W * 0.45, speed: -0.035 },
      ],
    };
    buildBase();
  }

  /** Ground heights of the two land masses, sloping into the water like the site's hero. */
  function backGround(x) {
    const { horizon, forestEnd } = scene;
    const t = x / (forestEnd * 1.12);
    if (t > 1) return Infinity;
    return Math.round(horizon - 4 - (1 - t) * 3 + Math.pow(Math.max(0, t - 0.75) / 0.25, 2) * 5);
  }
  function frontGround(x) {
    const { horizon, forestEnd } = scene;
    const end = forestEnd * 1.02;
    if (x > end) return Infinity;
    const t = x / end;
    // Flat shore, then a curve down to the bottom of the screen.
    return t < 0.78 ? Math.round(horizon - 1 + t * 3) : Math.round(horizon + 2 + Math.pow((t - 0.78) / 0.22, 2.2) * (H - horizon));
  }

  function put(d, x, y, c) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
  }

  /** A pixel pine: three jagged tiers on a short trunk. */
  function pine(d, cx, groundY, h, col) {
    const tiers = 3, tierH = Math.max(3, Math.round(h / 2.4));
    for (let k = 0; k < tiers; k++) {
      const top = groundY - h + Math.round(k * (h - tierH - 1) / (tiers - 1 || 1));
      for (let r = 0; r < tierH; r++) {
        const half = Math.round((r + 1) * (0.42 + k * 0.1));
        for (let dx = -half; dx <= half; dx++) put(d, cx + dx, top + r, col);
      }
    }
    for (let y = groundY - 2; y <= groundY; y++) put(d, cx, y, col);
  }

  function buildBase() {
    const { horizon, sunX, sunR } = scene;
    base = ctx.createImageData(W, H);
    const d = base.data;
    const glowR = sunR * 6;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let c;
        if (y < horizon) {
          const f = y / horizon, pos = f * (SKY.length - 1), lo = Math.floor(pos);
          c = SKY[Math.min(SKY.length - 1, pos - lo > bayer(x, y) ? lo + 1 : lo)];
          const dx = x - sunX, dy = (y - horizon) * 1.25, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= sunR) c = SUN;
          else if (dist < glowR) {
            const g = Math.pow(1 - (dist - sunR) / (glowR - sunR), 1.6);
            if (g > bayer(x, y)) c = GLOW;
          }
        } else {
          const f = (y - horizon) / Math.max(1, H - horizon), pos = f * (SEA.length - 1), lo = Math.floor(pos);
          c = SEA[Math.min(SEA.length - 1, pos - lo > bayer(x, y) ? lo + 1 : lo)];
        }
        put(d, x, y, c);
      }
    }

    // Hill to the right of the sun.
    const hillStart = sunX + sunR + 2;
    for (let x = hillStart; x < W; x++) {
      const t = (x - hillStart) / Math.max(1, W - hillStart);
      const hh = Math.round(Math.sin(Math.min(1, t * 1.6) * Math.PI / 2) * H * 0.035 + t * H * 0.01);
      for (let y = horizon - hh; y < horizon; y++) put(d, x, y, HILL);
    }

    // Back forest and its land.
    for (let x = 0; x < W; x++) {
      const g = backGround(x);
      if (g === Infinity) continue;
      for (let y = g; y < H; y++) put(d, x, y, TB);
    }
    scene.backTrees.forEach((t) => pine(d, t.x, backGround(Math.max(0, t.x)), t.h, TB));

    // Front forest and the dark shore running down to the bottom-left.
    for (let x = 0; x < W; x++) {
      const g = frontGround(x);
      if (g === Infinity) continue;
      for (let y = g; y < H; y++) put(d, x, y, (y - g) % 7 === 3 && (x + y) % 11 === 0 ? TF : GF);
    }
    scene.frontTrees.forEach((t) => pine(d, t.x, frontGround(Math.max(0, t.x)) + 1, t.h, TF));
  }

  function draw() {
    if (!ctx || !scene) return;
    const { horizon, sunX, sunR, lines, birds, fogs } = scene;
    ctx.putImageData(base, 0, 0);
    const f = frame;
    const onWater = (x, y) => y >= horizon && frontGround(x) > y && backGround(x) > y;

    // Sun reflection: short peach dashes, like the site's.
    ctx.fillStyle = C.reflect;
    [[0, 1.2], [3, 1.7], [6, 0.8], [9, 2]].forEach(([dy, wf], k) => {
      const y = horizon + 2 + dy;
      const w = Math.max(2, Math.round(sunR * 2 * wf));
      const x = sunX - Math.round(w / 2) + Math.round(Math.sin(f / 10 + k * 1.9));
      if (y < H) ctx.fillRect(x, y, w, 1);
    });

    // White wave lines drifting slowly; hidden where land covers the water.
    ctx.fillStyle = C.seaLine;
    for (const ln of lines) {
      const x = Math.round((ln.x + f * ln.speed) % (W + 12)) - 6;
      if (onWater(x, ln.y) && onWater(x + ln.w, ln.y)) ctx.fillRect(x, ln.y, ln.w, 1);
    }

    // Birds.
    ctx.fillStyle = "#4d6a63";
    for (const b of birds) {
      const x = Math.round((b.x + f * b.speed) % (W + 10)) - 5;
      const y = Math.round(b.y + Math.sin((f + b.flap * 10) / 18) * 1.5);
      const up = Math.floor((f + b.flap * 10) / 6) % 2;
      ctx.fillRect(x, y + up, 1, 1); ctx.fillRect(x + 1, y + 1 - up, 1, 1);
      ctx.fillRect(x + 2, y + 1, 1, 1);
      ctx.fillRect(x + 3, y + 1 - up, 1, 1); ctx.fillRect(x + 4, y + up, 1, 1);
    }

    // Fog: stacked translucent streaks forming soft ellipses, drifting across the shore.
    ctx.fillStyle = "rgba(255,255,255,.16)";
    for (const fg of fogs) {
      const span = W + fg.w;
      const cx = ((fg.x + f * fg.speed) % span + span) % span - fg.w * 0.5 + fg.w / 2;
      for (let y = fg.y; y < fg.y + fg.h; y++) {
        const ny = (y - fg.y) / fg.h * 2 - 1;
        const half = Math.round(fg.w / 2 * Math.sqrt(Math.max(0, 1 - ny * ny)));
        for (let k = 0; k < 3; k++) { // three nested passes thicken the middle
          const hw = Math.round(half * (1 - k * 0.3));
          if (hw > 0) ctx.fillRect(Math.round(cx - hw), y, hw * 2, 1);
        }
      }
    }
  }

  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function start() {
    stop();
    draw();
    if (reduced()) return;
    timer = setInterval(() => {
      if (document.hidden) return;
      frame++;
      draw();
    }, 120);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  let resizeT;
  window.PixelWall = {
    mount(parent) {
      canvas = document.createElement("canvas");
      canvas.id = "pixel-wall";
      canvas.setAttribute("aria-hidden", "true");
      parent.prepend(canvas);
      ctx = canvas.getContext("2d");
      layout();
      window.addEventListener("resize", () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(() => { if (canvas.isConnected && !canvas.hidden) { layout(); draw(); } }, 150);
      });
    },
    show(on) {
      if (!canvas) return;
      canvas.hidden = !on;
      if (on) { layout(); start(); } else stop();
    },
  };
})();
