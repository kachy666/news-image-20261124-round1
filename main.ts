// news-image-20261124 round 1 entry (Node 22, standard library only).
// Draws a front page summing up Tuesday 24 November 2026 world news and
// writes it to /output/entry.png as a 1024x1024 PNG. Fully deterministic:
// no clock, no random, no network — two runs write byte-identical output.
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------- font --
// Classic 5x7 bitmap font. Each glyph is 7 rows of 5 pixels ('#' = on).
const FONT = {
  'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  'C': ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  'G': ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.###.'],
  'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'I': ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  'J': ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  'N': ['#...#', '##..#', '##..#', '#.#.#', '#..##', '#..##', '#...#'],
  'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'V': ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#..##', '#.#.#', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  ';': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.#...'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '"': ['.#.#.', '.#.#.', '.....', '.....', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '#.###', '#..##'],
  '&': ['.##..', '#..#.', '#..#.', '.#...', '#.#.#', '#..#.', '.##.#'],
  '+': ['.....', '..#..', '..#..', '.###.', '..#..', '..#..', '.....'],
  '=': ['.....', '.....', '.###.', '.....', '.###.', '.....', '.....'],
  '*': ['.....', '.#.#.', '.###.', '#####', '.###.', '.#.#.', '.....'],
  '$': ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'],
  '#': ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.'],
  '@': ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.###.'],
  '_': ['.....', '.....', '.....', '.....', '.....', '.....', '#####'],
};

// ------------------------------------------------------------- canvas --
const W = 1024;
const H = 1024;
const buf = new Uint8Array(W * H * 3);

function rgb(hex) {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}
function setPx(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
}
function fillRect(x, y, w, h, c) {
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w), y1 = Math.min(H, y + h);
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) setPx(xx, yy, c);
  }
}
function hline(x, y, w, c) { fillRect(x, y, w, 1, c); }
function vline(x, y, h, c) { fillRect(x, y, 1, h, c); }
function line(x0, y0, x1, y1, c, thick) {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  const t = thick || 1;
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + (dx * i) / steps);
    const y = Math.round(y0 + (dy * i) / steps);
    fillRect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
  }
}
function fillCircle(cx, cy, r, c) {
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y));
    for (let x = -w; x <= w; x++) setPx(cx + x, cy + y, c);
  }
}
function circleOutline(cx, cy, r, c, thick) {
  const t = thick || 1;
  for (let a = 0; a < 360; a += 1) {
    const rad = (a * Math.PI) / 180;
    const x = Math.round(cx + r * Math.cos(rad));
    const y = Math.round(cy + r * Math.sin(rad));
    fillRect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
  }
}
function fillPolygon(pts, c) {
  // Scanline fill for a simple polygon given as [[x,y],...].
  let minY = H, maxY = 0;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        const x = a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
        xs.push(x);
      }
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) setPx(x, y, c);
    }
  }
}
function arcOutline(cx, cy, r, a0, a1, c, thick) {
  const t = thick || 1;
  for (let a = a0; a <= a1; a += 1) {
    const rad = (a * Math.PI) / 180;
    const x = Math.round(cx + r * Math.cos(rad));
    const y = Math.round(cy + r * Math.sin(rad));
    fillRect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
  }
}

// --------------------------------------------------------------- text --
function textWidth(s, scale) {
  let w = 0;
  for (const ch of s) w += 6 * scale;
  return w - scale;
}
function drawChar(ch, x, y, scale, c) {
  const g = FONT[ch] || FONT['?'];
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if (g[r][col] === '#') fillRect(x + col * scale, y + r * scale, scale, scale, c);
    }
  }
}
function drawText(s, x, y, scale, c, bold) {
  s = s.toUpperCase(); // font holds capitals only; decks render as all-caps
  let cx = x;
  for (const ch of s) {
    drawChar(ch, cx, y, scale, c);
    if (bold) drawChar(ch, cx + 1, y, scale, c);
    cx += 6 * scale;
  }
  return cx;
}
function drawTextCentered(s, cx, y, scale, c, bold) {
  drawText(s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, c, bold);
}
function wrapText(s, maxW, scale) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? cur + ' ' + w : w;
    if (textWidth(trial, scale) <= maxW || !cur) {
      cur = trial;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawBlock(s, x, y, maxW, scale, c, lineGap) {
  const lines = wrapText(s, maxW, scale);
  const lh = 7 * scale + (lineGap === undefined ? 4 : lineGap);
  for (let i = 0; i < lines.length; i++) drawText(lines[i], x, y + i * lh, scale, c, false);
  return y + lines.length * lh;
}

// ---------------------------------------------------------- PNG out ---
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  out.writeUInt32BE(crc, 8 + data.length);
  return out;
}
function encodePNG() {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    Buffer.from(buf.buffer, y * W * 3, W * 3).copy(raw, y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------- palette --
const PAPER = rgb(0xf6f1e7);
const INK = rgb(0x161616);
const RED = rgb(0xb01e24);
const NAVY = rgb(0x1d3557);
const GREEN = rgb(0x0b6e3f);
const GOLD = rgb(0x8a6d1b);
const GREY = rgb(0x5a564e);
const LIGHT = rgb(0xefe7d6);

// ------------------------------------------------------------- layout --
fillRect(0, 0, W, H, PAPER);

// Masthead
fillRect(28, 26, 968, 5, RED);
drawTextCentered('THE WORLD TODAY', 512, 40, 8, INK, true);
drawTextCentered('TUESDAY 24 NOVEMBER 2026', 512, 108, 3, RED, true);
drawText('THE DAY IN ONE PAGE', 28, 110, 2, GREY, false);
drawText('FREE', 949, 110, 2, GREY, false);
fillRect(28, 134, 968, 3, INK);
fillRect(28, 140, 968, 1, INK);

// ---- Lead story: Korea airspace scare (left column) ----
const LX = 28, LW = 612;
fillRect(LX, 156, 14, 14, RED);
drawText('KOREA - AIRSPACE SCARE', LX + 22, 156, 2, RED, true);
drawText('ISLAND TOLD TO', LX, 182, 4, INK, true);
drawText('TAKE COVER AS', LX, 216, 4, INK, true);
drawText('MYSTERY JET ENTERS', LX, 250, 4, INK, true);
drawText('KOREAN SKIES', LX, 284, 4, INK, true);
drawBlock(
  'Seoul orders Ulleung islanders to shelter at 07:52 after an unidentified aircraft enters its airspace. The alert is lifted minutes later.',
  LX, 326, LW, 2, INK, 4);

// Lead illustration: dawn sky, radar sweep, jet over the island (y 380..560)
const IX = 28, IY = 380, IW = 612, IH = 180;
// sky bands
fillRect(IX, IY, IW, 70, rgb(0x22304f));
fillRect(IX, IY + 70, IW, 44, rgb(0x4a6a92));
fillRect(IX, IY + 114, IW, 66, rgb(0x1f4d5c));
// dawn sun
fillCircle(IX + 500, IY + 52, 26, rgb(0xf2c14e));
fillCircle(IX + 500, IY + 52, 18, rgb(0xf7d774));
// sea waves
for (let i = 0; i < 5; i++) {
  const wy = IY + 128 + i * 11;
  for (let x = IX + 8 + (i % 2) * 20; x < IX + IW - 20; x += 46) {
    line(x, wy, x + 26, wy, rgb(0x9fc4d4), 2);
  }
}
// island (green headland, bottom left)
fillPolygon([[IX, IY + IH], [IX, IY + 148], [IX + 120, IY + 128], [IX + 210, IY + 142], [IX + 250, IY + IH]], rgb(0x2e5d3a));
fillPolygon([[IX + 120, IY + 128], [IX + 150, IY + 118], [IX + 180, IY + 128]], rgb(0x3a7048));
// lighthouse
fillRect(IX + 146, IY + 96, 8, 24, rgb(0xf6f1e7));
fillRect(IX + 144, IY + 92, 12, 5, RED);
fillCircle(IX + 150, IY + 90, 4, rgb(0xf2c14e));
// radar arcs from the island
arcOutline(IX + 150, IY + 122, 46, 200, 340, rgb(0x9fc4d4), 2);
arcOutline(IX + 150, IY + 122, 70, 200, 340, rgb(0x9fc4d4), 2);
arcOutline(IX + 150, IY + 122, 94, 200, 340, rgb(0x9fc4d4), 2);
line(IX + 150, IY + 122, IX + 150 + 88, IY + 122 - 30, rgb(0xf2c14e), 3);
// jet silhouette (upper right, flying left)
fillPolygon([
  [IX + 330, IY + 46], [IX + 420, IY + 30], [IX + 470, IY + 36],
  [IX + 420, IY + 44], [IX + 400, IY + 62], [IX + 380, IY + 46],
  [IX + 340, IY + 56], [IX + 330, IY + 46],
], rgb(0x141414));
// contrail
line(IX + 330, IY + 44, IX + 250, IY + 60, rgb(0xd8d2c2), 2);
line(IX + 330, IY + 48, IX + 262, IY + 62, rgb(0xd8d2c2), 1);
// warning triangle
fillPolygon([[IX + 560, IY + 128], [IX + 588, IY + 172], [IX + 532, IY + 172]], RED);
drawText('!', IX + 556, IY + 138, 4, rgb(0xffffff), true);
// caption
drawText('ULLEUNG ISLAND, 07:52 - RESIDENTS TOLD TO SHELTER', IX + 8, IY + IH - 16, 1, rgb(0xffffff), false);

// ---- Right column: Nvidia (top) ----
const RX = 664, RW = 332;
fillRect(RX, 156, 14, 14, NAVY);
drawText('BUSINESS', RX + 22, 156, 2, NAVY, true);
drawText('HUANG IS BACK', RX, 182, 3, INK, true);
drawBlock(
  'Nvidia reinstates Jensen Huang as chief, under two weeks after his shock exit. Shares soar.',
  RX, 212, RW, 2, INK, 4);
// chip + arrow panel
fillRect(RX, 284, RW, 68, rgb(0x0b3d2e));
fillRect(RX + 18, 300, 36, 36, rgb(0x1fae62));
fillRect(RX + 28, 310, 16, 16, rgb(0x0b3d2e));
for (let i = 0; i < 4; i++) {
  fillRect(RX + 22 + i * 9, 294, 3, 6, rgb(0x1fae62));
  fillRect(RX + 22 + i * 9, 336, 3, 6, rgb(0x1fae62));
}
// rising arrow
line(RX + 90, 336, RX + 150, 306, rgb(0x7be3a8), 4);
line(RX + 150, 306, RX + 210, 316, rgb(0x7be3a8), 4);
line(RX + 210, 316, RX + 262, 300, rgb(0x7be3a8), 4);
fillPolygon([[RX + 262, 300], [RX + 244, 296], [RX + 250, 312]], rgb(0x7be3a8));
drawText('NVDA +$33BN', RX + 90, 318, 2, rgb(0xffffff), true);
fillRect(RX, 360, RW, 1, GREY);

// ---- Right column: warship sunk (bottom) ----
fillRect(RX, 374, 14, 14, RED);
drawText('WAR AT SEA', RX + 22, 374, 2, RED, true);
drawText('WARSHIP SUNK', RX, 400, 3, INK, true);
drawText('OFF LIBYA', RX, 428, 3, INK, true);
drawBlock(
  "Ukraine's drones sink the Russian corvette Merkury. Zelenskyy confirms it.",
  RX, 458, RW, 2, INK, 4);
// ship panel
fillRect(RX, 516, RW, 44, rgb(0x16324f));
fillPolygon([[RX + 20, 548], [RX + 30, 532], [RX + 150, 532], [RX + 168, 548], [RX + 150, 552], [RX + 30, 552]], rgb(0x8a8f96));
fillRect(RX + 70, 518, 34, 14, rgb(0x8a8f96));
fillRect(RX + 110, 522, 8, 10, rgb(0x8a8f96));
fillPolygon([[RX + 196, 524], [RX + 208, 506], [RX + 220, 524], [RX + 232, 508], [RX + 244, 524], [RX + 232, 538], [RX + 208, 538]], rgb(0xf28c1e));
fillCircle(RX + 216, 522, 7, rgb(0xf7d774));
for (let i = 0; i < 3; i++) line(RX + 10 + i * 40, 554, RX + 34 + i * 40, 554, rgb(0x9fc4d4), 2);

fillRect(28, 572, 968, 3, INK);

// ---- Middle band: three columns ----
function middleCol(x, w, kicker, kcolor, head1, head2, deck, icon) {
  fillRect(x, 588, 14, 14, kcolor);
  drawText(kicker, x + 22, 588, 2, kcolor, true);
  drawText(head1, x, 614, 3, INK, true);
  drawText(head2, x, 642, 3, INK, true);
  drawBlock(deck, x, 676, w, 2, INK, 4);
  if (icon === 'plane') {
    fillRect(x, 736, w, 60, rgb(0xdbe7f2));
    fillPolygon([
      [x + 40, 766], [x + 150, 752], [x + 240, 760], [x + 150, 768],
      [x + 120, 782], [x + 100, 768], [x + 60, 774], [x + 40, 766],
    ], NAVY);
    arcOutline(x + 250, 766, 22, 270, 90, RED, 2);
    drawText('AWACS', x + 8, 748, 2, NAVY, true);
  } else if (icon === 'tanker') {
    fillRect(x, 736, w, 60, rgb(0xf2e3c8));
    fillPolygon([[x + 30, 782], [x + 40, 764], [x + 190, 764], [x + 210, 782], [x + 190, 786], [x + 40, 786]], rgb(0x5a3d1e));
    fillRect(x + 90, 750, 40, 14, rgb(0x5a3d1e));
    fillRect(x + 150, 754, 8, 10, rgb(0x5a3d1e));
    line(x + 20, 790, x + 220, 790, rgb(0x1f4d5c), 2);
    drawText('BLOCKADE', x + 8, 748, 2, rgb(0x5a3d1e), true);
  } else if (icon === 'chess') {
    fillRect(x, 736, w, 60, LIGHT);
    const bx = x + 8, by = 742, cell = 7;
    for (let r = 0; r < 8; r++) {
      for (let c2 = 0; c2 < 8; c2++) {
        if ((r + c2) % 2 === 0) fillRect(bx + c2 * cell, by + r * cell, cell, cell, INK);
      }
    }
    // board frame (drawn cell by cell below)
    for (let i = 0; i < 56; i++) { setPx(bx + i, by, INK); setPx(bx + i, by + 55, INK); setPx(bx, by + i, INK); setPx(bx + 55, by + i, INK); }
    fillCircle(bx + 17, by + 17, 6, rgb(0xffffff));
    fillCircle(bx + 38, by + 38, 6, rgb(0xb01e24));
    drawText('GAME 1 TODAY', x + 76, 748, 2, INK, true);
    drawText('15:00 CET', x + 76, 768, 2, RED, true);
  }
}
middleCol(28, 306, 'EUROPE', NAVY, 'NATO SENDS EYES', 'TO POLAND',
  'Early-warning jets head east after three Russian missiles land in Poland.',
  'plane');
middleCol(359, 306, 'GULF STANDOFF', RED, 'US READY TO', 'STRIKE IRAN',
  'Washington says attack plans are ready; Tehran vows to fight back.',
  'tanker');
middleCol(690, 306, 'SPORT', GREEN, 'CHESS CROWN ON', 'THE LINE',
  'Gukesh defends his title vs Sindarov in Geneva, the youngest match ever.',
  'chess');

fillRect(28, 808, 968, 3, INK);

// ---- The day in brief ----
fillRect(28, 824, 14, 14, RED);
drawText('THE DAY IN BRIEF', 50, 824, 2, RED, true);
const briefs = [
  ['INDONESIA FIRE: 24 DEAD', 'Candy-factory blaze in Cikande.'],
  ["GAZA 'POISONED FOR DECADES'", 'Oxfam warns of toxic contamination.'],
  ['TRUMP HALTS IOWA BLAST', 'Army pauses toxic lead-azide blast.'],
  ['DEMOCRATS: 258 SEATS', 'Biggest majority since 1992.'],
  ['ALCARAZ WINS ATP FINALS', 'Beats Zverev in Turin for title.'],
  ['INDIA v NZ: DRAW', 'First Test at Wellington ends level.'],
  ['UK TO HOST 2035 WORLD CUP', "Women's World Cup confirmed."],
  ['STATES SUE SPACEX', 'Oregon, Virginia target Grok.'],
];
for (let i = 0; i < briefs.length; i++) {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const bx = 28 + col * 492;
  const by = 852 + row * 34;
  fillRect(bx, by + 2, 8, 8, RED);
  drawText(briefs[i][0], bx + 14, by, 2, INK, true);
  drawText(briefs[i][1], bx + 14, by + 16, 2, GREY, false);
}

// ---- Footer ----
fillRect(28, 990, 968, 1, GREY);
drawTextCentered('TUESDAY 24 NOVEMBER 2026 - STORIES AS REPORTED 23-24 NOVEMBER 2026', 512, 998, 2, GREY, false);

// -------------------------------------------------------------- write --
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const png = encodePNG();
writeFileSync(join(outDir, 'entry.png'), png);
