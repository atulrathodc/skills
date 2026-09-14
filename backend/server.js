// Backend for the animation playground.
//
//   GET /api/animations   -> JSON describing the animation skills in this repo
//   GET /*                -> static files from ../frontend
//
// Zero dependencies: run with `node backend/server.js` (or `npm start`).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(__dirname, '..', 'frontend');
const PORT = Number(process.env.PORT) || 3000;

// The animation types this repo ships, ordered design -> declarative -> imperative -> raster -> vector.
const ANIMATIONS = [
  { name: 'motion-design',      kind: 'design',   layer: 'Decision',    summary: 'Easing, durations, stagger, choreography and reduced-motion policy.' },
  { name: 'css-animation',      kind: 'css',      layer: 'Declarative', summary: 'Transitions, @keyframes, transforms, fill-mode, GPU compositing, FLIP, View Transitions.' },
  { name: 'web-animations-api', kind: 'js',       layer: 'Imperative',  summary: 'element.animate(), playback control, finished promise, getAnimations, Scroll/View timelines.' },
  { name: 'sprite-animation',   kind: 'canvas',   layer: 'Raster',      summary: 'Sprite sheets, drawImage source-rect stepping, fps-independent frame timing.' },
  { name: 'lottie-animation',   kind: 'vector',   layer: 'Vector',      summary: 'After Effects / Bodymovin JSON via lottie-web, plus Rive for interactive state machines.' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  if (url.pathname === '/api/animations') {
    return send(res, 200, MIME['.json'],
      JSON.stringify({ count: ANIMATIONS.length, animations: ANIMATIONS }));
  }

  if (url.pathname === '/health') {
    return send(res, 200, MIME['.json'], JSON.stringify({ ok: true }));
  }

  // Static: frontend only, no traversal above FRONTEND.
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\]|\.\.[/\\])+/, '') || 'index.html';
  const file = join(FRONTEND, rel);
  if (!file.startsWith(FRONTEND)) {
    return send(res, 403, MIME['.json'], JSON.stringify({ error: 'forbidden' }));
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    return res.end(body);
  } catch {
    return send(res, 404, MIME['.json'], JSON.stringify({ error: 'not found', path: url.pathname }));
  }
});

server.listen(PORT, () => {
  console.log(`animation playground → http://localhost:${PORT}/  (api: /api/animations)`);
});
