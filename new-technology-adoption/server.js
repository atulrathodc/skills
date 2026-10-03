// Minimal zero-dependency server for the new-technology-adoption decision console.
// Serves the UI (index.html/styles.css/app.js) and a JSON API that scores an
// adoption candidate against the evidence checks in SKILL.md.
// Run with: node server.js   (or: npm start)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8090;

// The 8 evidence checks from SKILL.md, in the order a decision should gather them.
// Existence/currency first, then health+license, security, fit, decision, spike, measure.
const CHECKS = [
  { id: 'verifiedExists', label: 'Verified it exists with a real dated source' },
  { id: 'isCurrent',      label: 'Current release / actively maintained' },
  { id: 'healthy',        label: 'Healthy community: commits, backlog, bus factor' },
  { id: 'licenseOk',      label: 'License fits our use' },
  { id: 'noKnownCVEs',    label: 'No open critical CVEs/advisories' },
  { id: 'fitsStack',      label: 'Fits existing stack; overlap and exit cost acceptable' },
  { id: 'spikeRan',       label: 'Spike ran here end-to-end' },
  { id: 'measured',       label: 'Measured build size/perf vs incumbent' },
];

const TYPES = {
  'text/html': 'text/html; charset=utf-8',
  'application/json': 'application/json; charset=utf-8',
};

// Extension -> content type for the flat static directory.
const STATIC_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': TYPES[type] || type || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
}

function sendJson(res, status, payload) {
  return send(res, 200 && status, 'application/json', JSON.stringify(payload));
}

// score = passed/total, 0..100 -> adopt / trial / hold / reject (SKILL.md §5).
function decide(score) {
  if (score >= 85) return 'adopt';
  if (score >= 60) return 'trial';
  if (score >= 35) return 'hold';
  return 'reject';
}

function readBody(req, limit = 100_000) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > limit) { reject(new Error('payload too large')); req.destroy(); }
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function evaluate(input) {
  const checks = input && typeof input.checks === 'object' && input.checks !== null ? input.checks : {};
  const passed = CHECKS.filter((c) => checks[c.id] === true).map((c) => c.id);
  const failed = CHECKS.filter((c) => checks[c.id] !== true).map((c) => c.id);
  const total = CHECKS.length;
  const score = Math.round((passed.length / total) * 100);
  const decision = decide(score);

  const failedLabels = CHECKS.filter((c) => failed.includes(c.id)).map((c) => c.label);
  const rationale = failedLabels.length === 0
    ? `${input.tech}: all ${total} evidence checks pass, so ${decision} (score ${score}/100). Pin an exact version and re-check on the next major release or advisory.`
    : `${input.tech}: ${passed.length}/${total} checks pass (score ${score}/100) -> ${decision}. Still unproven: ${failedLabels.join('; ')}.`;

  const sourceUrl = typeof input.sourceUrl === 'string' ? input.sourceUrl.trim() : '';
  const sources = sourceUrl ? [{ url: sourceUrl, asOf: new Date().toISOString().slice(0, 10) }] : [];

  return {
    tech: input.tech,
    license: typeof input.license === 'string' ? input.license : 'unspecified',
    score,
    decision,
    rationale,
    passed,
    failed,
    sources,
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      node: process.version,
    });
  }

  if (url.pathname === '/api/checks') {
    return sendJson(res, 200, { checks: CHECKS });
  }

  if (url.pathname === '/api/evaluate') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'method not allowed', allow: 'POST' });
    }
    let raw;
    try {
      raw = await readBody(req);
    } catch (err) {
      return sendJson(res, 400, { error: 'invalid request body', detail: String(err) });
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return sendJson(res, 400, { error: 'invalid JSON body' });
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return sendJson(res, 400, { error: 'body must be a JSON object' });
    }
    if (typeof parsed.tech !== 'string' || parsed.tech.trim() === '') {
      return sendJson(res, 400, { error: 'field "tech" is required and must be a non-empty string' });
    }
    return sendJson(res, 200, evaluate({ ...parsed, tech: parsed.tech.trim() }));
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = await readFile(join(__dirname, 'index.html'), 'utf8');
      return send(res, 200, 'text/html', html);
    } catch (err) {
      return sendJson(res, 500, { error: 'index.html missing', detail: String(err) });
    }
  }

  // static: one flat directory, no path traversal
  const rel = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  try {
    const file = await readFile(join(__dirname, rel));
    const ext = rel.slice(rel.lastIndexOf('.'));
    res.writeHead(200, { 'Content-Type': STATIC_TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    return res.end(file);
  } catch {
    return sendJson(res, 404, { error: 'not found', path: url.pathname });
  }
});

server.listen(PORT, () => {
  console.log(`new-technology-adoption console on http://localhost:${PORT}/ (api: /api/checks, /api/health, /api/evaluate)`);
});
