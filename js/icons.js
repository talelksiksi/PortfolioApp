/* Chunky 32px icons, drawn on a pixel grid so they stay crisp at 1x and 2x. */
(function () {
  const S = (body) =>
    `<svg viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;
  const K = "#1b1b1b";

  window.ICONS = {
    folder: S(`
      <path fill="${K}" d="M2 7h11l2 2h15v19H2z"/>
      <path fill="#f6d36b" d="M3 8h9l2 2h15v17H3z"/>
      <path fill="#e2b143" d="M3 13h26v14H3z"/>
      <path fill="#fbe7a2" d="M3 12h26v1H3z"/>`),
    folderOpen: S(`
      <path fill="${K}" d="M2 7h11l2 2h13v4h3l-4 15H2z"/>
      <path fill="#e2b143" d="M3 8h9l2 2h13v17H3z"/>
      <path fill="#f6d36b" d="M7 14h23l-3 13H3z"/>`),
    notepad: S(`
      <path fill="${K}" d="M6 3h17l4 4v22H6z"/>
      <path fill="#fff" d="M7 4h15v4h4v20H7z"/>
      <path fill="#cfd8dc" d="M22 4l4 4h-4z"/>
      <path fill="#3d6d78" d="M9 11h14v1H9zM9 14h14v1H9zM9 17h10v1H9zM9 20h14v1H9zM9 23h8v1H9z"/>`),
    mail: S(`
      <path fill="${K}" d="M2 7h28v19H2z"/>
      <path fill="#fff" d="M3 8h26v17H3z"/>
      <path fill="#3d6d78" d="M3 8h2l11 8 11-8h2v1L16 18 3 9z"/>
      <path fill="#e7a982" d="M23 19h5v5h-5z"/>`),
    terminal: S(`
      <path fill="${K}" d="M2 4h28v22H2z"/>
      <path fill="#c0c0c0" d="M3 5h26v3H3z"/>
      <path fill="#101814" d="M3 8h26v17H3z"/>
      <path fill="#58e08a" d="M6 11h2v2H6zM8 13h2v2H8zM6 15h2v2H6zM12 17h7v2h-7z"/>
      <path fill="${K}" d="M10 27h12v2H10z"/>`),
    trash: S(`
      <path fill="${K}" d="M7 7h18v2h-1l-2 20H10L8 9H7z"/>
      <path fill="#dfe6e9" d="M9 9h14l-2 19H11z"/>
      <path fill="#9aa5ab" d="M12 11h1v15h-1zM16 11h1v15h-1zM20 11h1v15h-1z"/>
      <path fill="${K}" d="M12 4h8v3h-8z"/><path fill="#9aa5ab" d="M13 5h6v2h-6z"/>`),
    trashFull: S(`
      <path fill="${K}" d="M7 9h18v2h-1l-2 18H10L8 11H7z"/>
      <path fill="#dfe6e9" d="M9 11h14l-2 17H11z"/>
      <path fill="#fff" d="M9 4h7v6H9z"/><path fill="${K}" d="M9 4h7v1H9zM9 4h1v6H9zM15 4h1v6h-1z"/>
      <path fill="#f6d36b" d="M16 2h7v8h-7z"/><path fill="${K}" d="M16 2h7v1h-7zM22 2h1v8h-1z"/>`),
    briefcase: S(`
      <path fill="${K}" d="M11 4h10v4h9v20H2V8h9z"/>
      <path fill="#fff0" d="M12 5h8v3h-8z"/>
      <path fill="#8b5a3c" d="M3 9h26v18H3z"/>
      <path fill="#a8714f" d="M3 9h26v7H3z"/>
      <path fill="#e7a982" d="M14 15h4v4h-4z"/><path fill="${K}" d="M14 15h4v1h-4z"/>`),
    display: S(`
      <path fill="${K}" d="M2 4h28v20H2z"/>
      <path fill="#3d6d78" d="M4 6h24v16H4z"/>
      <circle cx="16" cy="15" r="5" fill="#e7a982"/>
      <path fill="#2d5560" d="M4 15h24v7H4z"/>
      <path fill="${K}" d="M12 24h8v3h4v2H8v-2h4z"/>`),
    computer: S(`
      <path fill="${K}" d="M3 3h26v19H3z"/>
      <path fill="#c0c0c0" d="M4 4h24v17H4z"/>
      <path fill="#3d6d78" d="M6 6h20v13H6z"/>
      <path fill="#e7a982" d="M8 8h8v1H8zM8 10h12v1H8z"/>
      <path fill="${K}" d="M6 24h20v6H6z"/><path fill="#c0c0c0" d="M7 25h18v4H7z"/>
      <path fill="#58e08a" d="M22 26h2v1h-2z"/>`),
    help: S(`
      <path fill="${K}" d="M5 3h20v26H5z"/>
      <path fill="#f6d36b" d="M6 4h18v24H6z"/>
      <path fill="#3d6d78" d="M12 8h7v2h2v4h-2v2h-3v3h-3v-4h2v-2h2v-3h-3v2h-2V8zM13 21h3v3h-3z"/>`),
    flow: S(`
      <path fill="${K}" d="M2 4h11v9H2zM19 4h11v9H19zM10 19h12v9H10z"/>
      <path fill="#7fb3d5" d="M3 5h9v7H3z"/><path fill="#e7a982" d="M20 5h9v7h-9z"/>
      <path fill="#58e08a" d="M11 20h10v7H11z"/>
      <path fill="${K}" d="M12 8h8v1h-8zM7 13h1v4h8v2h-1v-1H7zM25 13h1v5h-8v-1h7z"/>`),
    tray: S(`
      <path fill="${K}" d="M2 3h28v26H2z"/>
      <path fill="#9aa5ab" d="M3 4h26v24H3z"/>
      <path fill="#5d6a70" d="M3 10h26v1H3zM3 17h26v1H3zM3 24h26v1H3z"/>
      <path fill="#e7a982" d="M5 6h6v4H5zM13 6h6v4h-6zM21 13h6v4h-6zM5 20h6v4H5z"/>
      <path fill="#3d6d78" d="M13 13h6v4h-6zM21 6h6v4h-6zM13 20h6v4h-6zM21 20h6v4h-6z"/>
      <path fill="#f6d36b" d="M5 13h6v4H5z"/>`),
    plug: S(`
      <path fill="${K}" d="M10 2h3v7h6V2h3v7h3v8l-6 5v8h-6v-8l-6-5V9h3z"/>
      <path fill="#c0c0c0" d="M8 10h16v6l-5 5h-6l-5-5z"/>
      <path fill="#3d6d78" d="M14 22h4v7h-4z"/>
      <path fill="#58e08a" d="M15 13h2v3h-2z"/>`),
    chart: S(`
      <path fill="${K}" d="M2 3h28v26H2z"/>
      <path fill="#fff" d="M3 4h26v24H3z"/>
      <path fill="#3d6d78" d="M6 18h4v8H6zM12 12h4v14h-4zM18 15h4v11h-4zM24 8h3v18h-3z"/>
      <path fill="#e7a982" d="M6 10l6-4 6 3 8-5v2l-8 5-6-3-6 4z"/>`),
    cup: S(`
      <path fill="${K}" d="M5 11h19v3h3l2 2v5l-2 2h-3.5l-1.5 3H9l-4-8z"/>
      <path fill="#fff" d="M6 12h17v9l-2 4H10l-4-8z"/>
      <path fill="#3d6d78" d="M6 12h17v3H6z"/>
      <path fill="#fff" d="M24 15h2l1 1v4l-1 1h-2z"/>
      <path fill="${K}" d="M4 27h23v2H4z"/>
      <path fill="#e7a982" d="M10 4h2v5h-2zM15 3h2v6h-2zM20 5h2v4h-2z"/>`),
    portal: S(`
      <path fill="${K}" d="M2 4h28v24H2z"/>
      <path fill="#fff" d="M3 9h26v18H3z"/>
      <path fill="#3d6d78" d="M3 5h26v4H3z"/>
      <path fill="#e7a982" d="M4 6h2v2H4zM7 6h2v2H7z"/>
      <path fill="#cfd8dc" d="M5 11h8v14H5z"/>
      <path fill="#3d6d78" d="M15 11h12v2H15zM15 15h12v1H15zM15 18h9v1h-9zM15 21h12v1H15z"/>`),
    tooth: S(`
      <path fill="${K}" d="M8 4h6l2 1 2-1h6l3 3v8l-2 4-1 9h-4l-2-7h-4l-2 7H8l-1-9-2-4V7z"/>
      <path fill="#fff" d="M9 5h5l2 2 2-2h5l3 3v6l-2 4-1 9h-2l-2-7h-6l-2 7h-2l-1-9-2-4V8z"/>
      <path fill="#cfe8f0" d="M9 8h3v3H9z"/>`),
    globe: S(`
      <circle cx="16" cy="16" r="13" fill="${K}"/><circle cx="16" cy="16" r="12" fill="#7fb3d5"/>
      <path fill="#58b06a" d="M8 9h6v3h3v4h-4l-2 4H8v-4L6 14v-3zM19 18h5v3l-2 4h-3z"/>`),
    shutdown: S(`
      <path fill="${K}" d="M14 3h4v13h-4z"/>
      <path fill="none" stroke="${K}" stroke-width="3" d="M9.5 8.5a10 10 0 1 0 13 0"/>`),
    info: S(`<circle cx="16" cy="16" r="13" fill="${K}"/><circle cx="16" cy="16" r="12" fill="#3d6d78"/>
      <path fill="#fff" d="M14 8h4v4h-4zM13 14h5v8h2v3h-7v-3h2v-5h-2z"/>`),
    warn: S(`<path fill="${K}" d="M16 2L31 29H1z"/><path fill="#f6d36b" d="M16 5l12.5 22.5h-25z"/>
      <path fill="${K}" d="M14.5 11h3v9h-3zM14.5 22h3v3h-3z"/>`),
    cv: S(`
      <path fill="${K}" d="M6 2h16l5 5v23H6z"/>
      <path fill="#fff" d="M7 3h14v5h5v21H7z"/>
      <path fill="#cfd8dc" d="M21 3l5 5h-5z"/>
      <path fill="#3d6d78" d="M9 6h8v9H9z"/>
      <path fill="#e7a982" d="M11 7h4v4h-4zM10 12h6v3h-6z"/>
      <path fill="#3d6d78" d="M19 10h5v1h-5zM19 13h5v1h-5zM9 18h15v1H9zM9 21h15v1H9zM9 24h11v1H9z"/>
      <path fill="#c0392b" d="M18 26h8v4h-8z"/><path fill="#fff" d="M19 27h1v2h-1zM21 27h1v2h-1zM23 27h2v1h-2z"/>`),
    medical: S(`
      <path fill="${K}" d="M5 5h22v22H5z"/><path fill="#fff" d="M6 6h20v20H6z"/>
      <path fill="#c0392b" d="M13 9h6v4h4v6h-4v4h-6v-4H9v-6h4z"/>
      <path fill="#e74c3c" d="M14 10h4v4h4v4h-4v4h-4v-4h-4v-4h4z"/>
      <path fill="#3d6d78" d="M6 6h20v2H6z"/>`),
    gauge: S(`
      <path fill="${K}" d="M3 6h26v22H3z"/><path fill="#fff" d="M4 7h24v20H4z"/>
      <path fill="#cfe8f0" d="M5 8h22v9H5z"/>
      <path fill="#3d6d78" d="M5 15l3-2 3 1 3-4 3 2 3-3 3 1 4-3v2l-4 3-3-1-3 3-3-2-3 4-3-1-3 2z"/>
      <path fill="#e7a982" d="M5 13l4 1 3-2 4 2 3-1 4 1 4-2v1l-4 2-4-1-3 1-4-2-3 2-4-1z"/>
      <path fill="${K}" d="M5 18h22v1H5z"/>
      <path fill="#58e08a" d="M6 21h3v3H6z"/><path fill="#f6d36b" d="M11 21h3v3h-3z"/><path fill="#c0392b" d="M16 21h3v3h-3z"/>
      <path fill="#3d6d78" d="M21 21h6v1h-6zM21 23h4v1h-4z"/>`),
    trophy: S(`
      <path fill="${K}" d="M8 3h16v3h5v6l-4 4h-2l-3 3v4h4v3h2v3H8v-3h2v-3h4v-4l-3-3H9l-4-4V6h3z"/>
      <path fill="#f6d36b" d="M9 4h14v9l-3 4h-8l-3-4zM6 7h2v5H7l-1-1zM24 7h2v4l-1 1h-1z"/>
      <path fill="#e2b143" d="M18 4h5v9l-3 4h-2z"/><path fill="#fbe7a2" d="M11 6h2v6h-2z"/>
      <path fill="#8b5a3c" d="M11 26h10v2H11z"/><path fill="#e2b143" d="M15 19h2v4h-2z"/>`),
    calendar: S(`
      <path fill="${K}" d="M3 5h26v24H3z"/>
      <path fill="#fff" d="M4 11h24v17H4z"/><path fill="#c0392b" d="M4 6h24v5H4z"/>
      <path fill="${K}" d="M8 3h2v5H8zM22 3h2v5h-2z"/>
      <path fill="#cfd8dc" d="M7 14h4v3H7zM14 14h4v3h-4zM21 14h4v3h-4zM7 20h4v3H7zM21 20h4v3h-4z"/>
      <path fill="#3d6d78" d="M14 20h4v3h-4z"/><path fill="#e7a982" d="M15 21h2v1h-2z"/>`),
    game: S(`
      <path fill="${K}" d="M2 2h28v28H2z"/><path fill="#c0c0c0" d="M3 3h26v26H3z"/>
      <path fill="#fff" d="M3 3h26v1H3zM3 3h1v26H3z"/><path fill="#808488" d="M3 16h26v1H3zM16 3h1v26h-1z"/>
      <path fill="#dfe3e6" d="M17 17h12v12H17z"/>
      <path fill="#1d4f9c" d="M7 7h3v6H7zM6 12h5v1H6z"/>
      <path fill="#c0392b" d="M21 6h1v8h-1zM22 6h4v3h-4z"/><path fill="${K}" d="M19 14h5v1h-5z"/>
      <path fill="#2e7d32" d="M7 20h5v1H7zM11 21h1v2h-1zM7 23h5v1H7zM7 24h1v2H7zM7 26h5v1H7z"/>
      <path fill="${K}" d="M22 20h2v2h2v2h-2v2h-2v-2h-2v-2h2z"/>`),
    quick: S(`
      <path fill="${K}" d="M5 2h18l4 4v24H5z"/><path fill="#fff" d="M6 3h16v4h4v22H6z"/>
      <path fill="#3d6d78" d="M8 6h11v3H8z"/><path fill="#cfd8dc" d="M8 11h16v1H8zM8 14h12v1H8zM8 17h16v1H8zM8 20h10v1H8z"/>
      <path fill="${K}" d="M19 14h7l-4 6h4l-9 10 3-8h-4z"/><path fill="#f6d36b" d="M20 15h4l-4 6h4l-6 7 2-6h-4z"/>`),
    speaker: '<svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true"><path fill="#1b1b1b" d="M2 5h3l4-3h1v12H9l-4-3H2z"/><path fill="none" stroke="#1b1b1b" d="M11.5 5.5c1 1.4 1 3.6 0 5M13 4c2 2.2 2 5.8 0 8"/></svg>',
    speakerOff: '<svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true"><path fill="#1b1b1b" d="M2 5h3l4-3h1v12H9l-4-3H2z"/><path fill="#c0392b" d="M11 5h1l1 1 1-1h1v1l-1 1 1 1v1h-1l-1-1-1 1h-1V8l1-1-1-1z"/></svg>',
    /** Language badge showing the code you switch TO. */
    lang: (code) => S(`
      <circle cx="13" cy="13" r="11" fill="${K}"/><circle cx="13" cy="13" r="10" fill="#7fb3d5"/>
      <path fill="#58b06a" d="M6 7h5v3h3v3h-3l-2 4H6v-4L4 11V8zM15 15h4v3l-2 3h-2z"/>
      <path fill="${K}" d="M12 15h19v14H12z"/>
      <path fill="${code === "FR" ? "#fff" : "#fff"}" d="M13 16h17v12H13z"/>
      ${code === "FR"
        ? `<path fill="#1f4fa3" d="M13 16h6v12h-6z"/><path fill="#d63a3a" d="M24 16h6v12h-6z"/>`
        : `<path fill="#1f3f8f" d="M13 16h17v12H13z"/><path fill="#fff" d="M13 21h17v2H13zM20 16h3v12h-3z"/><path fill="#c8102e" d="M13 21.5h17v1H13zM21 16h1v12h-1z"/>`}
      <text x="21.5" y="25.5" font-family="Verdana,sans-serif" font-size="8" font-weight="700" text-anchor="middle" fill="#111" stroke="#fff" stroke-width="2" paint-order="stroke">${code}</text>`),
  };
})();
