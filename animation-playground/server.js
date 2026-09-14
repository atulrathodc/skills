// Minimal zero-dependency server for the animation playground.
// Serves the UI (index.html) and a JSON API describing the animation skills
// in this repo. Run with: node server.js   (or: npm start)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;

// The animation skills this repo ships, in the order a UI should teach them:
// design layer -> declarative -> imperative -> raster -> vector.
const ANIMATIONS = [
  { name: 'motion-design',       kind: 'design',       layer: 'Decision',  summary: 'Easing, durations, stagger, choreography and reduced-motion policy.' },
  { name: 'css-animation',       kind: 'css',          layer: 'Declarative', summary: 'Transitions, @keyframes, transforms, fill-mode, GPU compositing, FLIP, View Transitions.' },
  { name: 'web-animations-api',  kind: 'js',           layer: 'Imperative', summary: 'element.animate(), playback control, finished promise, getAnimations, Scroll/View timelines.' },
  { name: 'sprite-animation',    kind: 'canvas',       layer: 'Raster',    summary: 'Sprite sheets, drawImage source-rect stepping, fps-independent frame timing.' },
  { name: 'lottie-animation',    kind: 'vector',       layer: 'Vector',    summary: 'After Effects / Bodymovin JSON via lottie-web, plus Rive for interactive state machines.' },
];

const TYPES = {
  'text/html': 'text/html; charset=utf-8',
  'application/json': 'application/json; charset=utf-8',
};

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': TYPES[type], 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/animations') {
    return send(res, 200, 'application/json', JSON.stringify({ count: ANIMATIONS.length, animations: ANIMATIONS }));
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = await readFile(join(__dirname, 'index.html'), 'utf8');
      return send(res, 200, 'text/html', html);
    } catch (err) {
      return send(res, 500, 'application/json', JSON.stringify({ error: 'index.html missing', detail: String(err) }));
    }
  }

  // static: one flat directory, no path traversal
  const rel = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  try {
    const file = await readFile(join(__dirname, rel));
    const type = rel.endsWith('.css') ? 'text/css; charset=utf-8' : rel.endsWith('.json') ? 'application/json' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    return res.end(file);
  } catch {
    return send(res, 404, 'application/json', JSON.stringify({ error: 'not found', path: url.pathname }));
  }
});

server.listen(PORT, () => {
  console.log(`animation playground on http://localhost:${PORT}/ (api: /api/animations)`);
});
