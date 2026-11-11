/*
 * Pixel-art wallpaper: the CICTNA sun setting over the sea, drawn at low
 * resolution and scaled up with crisp pixels. Sky and sea use ordered
 * dithering for that 16-colour look; waves, clouds and the sun's reflection
 * drift slowly.
 */
(function () {
  const SKY = ["#9fbec8", "#afc9d2", "#c0d5db", "#d6e2e5", "#e4e5df", "#efdccb", "#f3cfb2"];
  const SEA = ["#4f818b", "#3d6d78", "#34626c", "#2b525b", "#24464e", "#1d3a41"];
  const SUN = "#e7a982", GLOW = "#efcdb3", REFLECT = "#f1c09b";
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

  let canvas, ctx, base, W = 0, H = 0, px = 5, timer = null, frame = 0, scene = null;

  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const SKY_RGB = SKY.map(hex), SEA_RGB = SEA.map(hex), SUN_RGB = hex(SUN), GLOW_RGB = hex(GLOW);

  // Deterministic random so the scene looks the same on every visit.
  function rng(seed) {
    return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function layout() {
    const r = canvas.getBoundingClientRect();
    px = r.width < 720 ? 4 : 5;
    W = Math.max(40, Math.ceil(r.width / px));
    H = Math.max(40, Math.ceil(r.height / px));
    canvas.width = W;
    canvas.height = H;

    const horizon = Math.round(H * 0.6);
    const mobile = r.width < 720;
    const sunR = Math.round(Math.min(W * (mobile ? 0.34 : 0.17), H * 0.3));
    const sunX = Math.round(W * (mobile ? 0.5 : 0.66));
    const rand = rng(20240512);

    scene = {
      horizon, sunR, sunX,
      clouds: Array.from({ length: mobile ? 3 : 5 }, (_, i) => ({
        x: rand() * W, y: 4 + rand() * (horizon * 0.45), w: 10 + Math.round(rand() * 16), speed: 0.03 + rand() * 0.05, i,
      })),
      waves: Array.from({ length: Math.round(W * (H - horizon) / 260) }, () => ({
        x: rand() * W, y: horizon + 3 + Math.round(rand() * (H - horizon - 4)), w: 2 + Math.round(rand() * 5), speed: 0.02 + rand() * 0.04,
      })),
      birds: Array.from({ length: 3 }, () => ({ x: rand() * W, y: 6 + rand() * horizon * 0.35, speed: 0.12 + rand() * 0.1, flap: rand() * 6 })),
    };
    buildBase();
  }

  /** Static layer: dithered sky and sea, sun glow and the sun itself. */
  function buildBase() {
    const { horizon, sunR, sunX } = scene;
    base = ctx.createImageData(W, H);
    const d = base.data;
    for (let y = 0; y < H; y++) {
      const isSky = y < horizon;
      const pal = isSky ? SKY_RGB : SEA_RGB;
      const f = isSky ? y / horizon : (y - horizon) / Math.max(1, H - horizon);
      const pos = f * (pal.length - 1);
      const lo = Math.floor(pos), frac = pos - lo;
      for (let x = 0; x < W; x++) {
        let c = pal[Math.min(pal.length - 1, frac > BAYER[(y & 3) * 4 + (x & 3)] ? lo + 1 : lo)];
        if (isSky) {
          const dx = x - sunX, dy = y - horizon, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= sunR) c = SUN_RGB;
          else if (dist <= sunR * 1.25) {
            const g = 1 - (dist - sunR) / (sunR * 0.25);
            if (g * 0.8 > BAYER[(y & 3) * 4 + (x & 3)]) c = GLOW_RGB;
          }
        }
        const i = (y * W + x) * 4;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
    }
  }

  function draw() {
    if (!ctx || !scene) return;
    const { horizon, sunR, sunX, clouds, waves, birds } = scene;
    ctx.putImageData(base, 0, 0);
    const f = frame;

    // Clouds: two-tone pixel puffs drifting right.
    for (const c of clouds) {
      const x = Math.round((c.x + f * c.speed) % (W + c.w * 2)) - c.w;
      const y = Math.round(c.y);
      ctx.fillStyle = "#f4f7f7";
      ctx.fillRect(x, y, c.w, 2);
      ctx.fillRect(x + 2, y - 1, c.w - 5, 1);
      ctx.fillRect(x + Math.round(c.w * 0.3), y - 2, Math.round(c.w * 0.35), 1);
      ctx.fillStyle = "#c6d7dc";
      ctx.fillRect(x + 1, y + 2, c.w - 2, 1);
    }

    // Birds.
    ctx.fillStyle = "#2b525b";
    for (const b of birds) {
      const x = Math.round((b.x + f * b.speed) % (W + 10)) - 5;
      const y = Math.round(b.y + Math.sin((f + b.flap * 10) / 18) * 1.5);
      const up = Math.floor((f + b.flap * 10) / 6) % 2;
      ctx.fillRect(x, y + up, 1, 1); ctx.fillRect(x + 1, y + 1 - up, 1, 1);
      ctx.fillRect(x + 2, y + 1, 1, 1);
      ctx.fillRect(x + 3, y + 1 - up, 1, 1); ctx.fillRect(x + 4, y + up, 1, 1);
    }

    // Sun reflection: shrinking peach bars, shimmering, like the logo.
    ctx.fillStyle = REFLECT;
    const rows = Math.max(4, Math.round((H - horizon) / 6));
    for (let k = 0; k < rows; k++) {
      const y = horizon + 2 + k * Math.max(3, Math.round((H - horizon - 4) / rows));
      if (y >= H) break;
      const w = Math.max(2, Math.round(sunR * 2 * (0.8 - k * (0.68 / rows))));
      const wob = Math.round(Math.sin(f / 9 + k * 1.7) * 1.2);
      const x = sunX - Math.round(w / 2) + wob;
      ctx.fillRect(x, y, w, k < 2 ? 2 : 1);
      if (k % 2 === 1 && w > 8) { // a gap in the bar, like light breaking on water
        ctx.fillStyle = SEA[Math.min(SEA.length - 1, 1 + Math.floor(k / 3))];
        ctx.fillRect(x + Math.round(w * (0.3 + 0.1 * Math.sin(f / 13 + k))), y, 2, 1);
        ctx.fillStyle = REFLECT;
      }
    }

    // Whitecaps.
    ctx.fillStyle = "rgba(255,255,255,.38)";
    for (const wv of waves) {
      const x = Math.round((wv.x + f * wv.speed) % (W + 8)) - 4;
      ctx.fillRect(x, wv.y, wv.w, 1);
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
    }, 110);
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
