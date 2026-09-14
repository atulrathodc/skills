// Frontend for the animation playground.
// Demonstrates each animation type documented by the skills in this repo.

// ---------------------------------------------------------------- API + UI
const statusEl = document.getElementById('status');
const listEl = document.getElementById('skills');

function render(items) {
  listEl.replaceChildren();
  for (const [i, a] of items.entries()) {
    const li = document.createElement('li');
    li.style.animationDelay = `${Math.min(i, 8) * 40}ms`; // motion-design §5: capped stagger

    const badge = document.createElement('span');
    badge.className = 'kind';
    badge.textContent = a.kind;

    const name = document.createElement('code');
    name.textContent = a.name;

    const summary = document.createElement('p');
    summary.className = 'summary';
    summary.textContent = a.summary;

    li.append(badge, name, summary);
    listEl.append(li);
  }
  statusEl.textContent = `${items.length} animation skills loaded.`;
  window.__rendered = items.length;
}

fetch('/api/animations')
  // html5-apis §9: fetch only rejects on network errors, so check res.ok.
  .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
  .then((data) => { window.__api = data; render(data.animations); })
  .catch((err) => { statusEl.textContent = `Failed to load animations: ${err.message}`; });

// ------------------------------------------------- css-animation (@keyframes)
const popbox = document.getElementById('popbox');
const popKeyframes = document.createElement('style');
popKeyframes.textContent = '@keyframes pop { from { transform: scale(.6); } to { transform: scale(1); } }';
document.head.append(popKeyframes);

document.getElementById('pop').addEventListener('click', () => {
  popbox.style.animation = 'none';
  void popbox.offsetWidth; // force reflow so the keyframe animation restarts
  popbox.style.animation = 'pop var(--duration-slow) var(--ease-pop) forwards';
});

// ------------------------------------------- web-animations-api (WAAPI)
const wabox = document.getElementById('wabox');
document.getElementById('run').addEventListener('click', () => {
  // web-animations-api §7: cancel existing animations or they stack on every click.
  for (const a of wabox.getAnimations()) a.cancel();
  window.__wa = wabox.animate(
    [{ opacity: 0.2 }, { opacity: 1 }],
    { duration: 250, easing: 'ease-out', fill: 'forwards' }, // §3: fill forwards keeps the end state
  );
});

// ------------------------------------------------- sprite-animation (canvas)
const COLS = 4, FRAME_W = 16, FRAME_H = 16, MS_PER_FRAME = 120;
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];

// Build a 4-frame atlas offscreen, exactly like a real sprite sheet.
const sheet = document.createElement('canvas');
sheet.width = COLS * FRAME_W;
sheet.height = FRAME_H;
const sheetCtx = sheet.getContext('2d');
COLORS.forEach((color, i) => {
  sheetCtx.fillStyle = color;
  sheetCtx.fillRect(i * FRAME_W, 0, FRAME_W, FRAME_H);
});

const canvas = document.getElementById('sprite');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false; // §6: pixel-art crispness

// §1: frame i -> source rect (i % cols, floor(i / cols)).
const frameRect = (i) => ({
  sx: (i % COLS) * FRAME_W,
  sy: Math.floor(i / COLS) * FRAME_H,
  sw: FRAME_W,
  sh: FRAME_H,
});

function drawFrame(i) {
  const { sx, sy, sw, sh } = frameRect(i);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // §3: clear before drawing
  ctx.drawImage(sheet, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  window.__frame = i;
  window.__rect = { sx, sy, sw, sh };
}

// §4: advance by elapsed time, not one frame per rAF tick.
let frame = 0;
let accum = 0;
let last = performance.now();

function step(now) {
  const dt = Math.min(now - last, 250); // §5: clamp the tab-away spike
  last = now;
  accum += dt;
  while (accum >= MS_PER_FRAME) {
    frame = (frame + 1) % COLORS.length;
    accum -= MS_PER_FRAME;
  }
  drawFrame(frame);
  requestAnimationFrame(step);
}

drawFrame(0);
requestAnimationFrame(step);
