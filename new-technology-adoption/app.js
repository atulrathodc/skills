// Decision-console frontend for the new-technology-adoption skill.
// Loads the evidence checks from GET /api/checks, scores a candidate via
// POST /api/evaluate, and reports liveness with GET /api/health.
// Every failure path writes into the DOM — nothing is swallowed.

// Inline fallback so the console still works if /api/checks cannot be fetched.
// Must stay identical to the server's CHECKS list.
const FALLBACK_CHECKS = [
  { id: 'verifiedExists', label: 'Verified it exists with a real dated source' },
  { id: 'isCurrent',      label: 'Current release / actively maintained' },
  { id: 'healthy',        label: 'Healthy community: commits, backlog, bus factor' },
  { id: 'licenseOk',      label: 'License fits our use' },
  { id: 'noKnownCVEs',    label: 'No open critical CVEs/advisories' },
  { id: 'fitsStack',      label: 'Fits existing stack; overlap and exit cost acceptable' },
  { id: 'spikeRan',       label: 'Spike ran here end-to-end' },
  { id: 'measured',       label: 'Measured build size/perf vs incumbent' },
];

const els = {
  form: document.getElementById('console'),
  tech: document.getElementById('tech'),
  license: document.getElementById('license'),
  sourceUrl: document.getElementById('sourceUrl'),
  checks: document.getElementById('checks'),
  evaluate: document.getElementById('evaluate'),
  probe: document.getElementById('probe'),
  status: document.getElementById('status'),
  result: document.getElementById('result'),
};

// ---------- status line (role="status", aria-live="polite") ----------
function setStatus(message, tone) {
  els.status.textContent = message;
  if (tone) els.status.dataset.tone = tone;
  else delete els.status.dataset.tone;
}

// ---------- render the check list ----------
function renderChecks(checks) {
  els.checks.replaceChildren();
  for (const check of checks) {
    const li = document.createElement('li');
    li.className = 'check-row';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'control control--check';
    input.id = 'check-' + check.id;
    input.name = 'checks';
    input.value = check.id;

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = check.label;

    const idLine = document.createElement('span');
    idLine.className = 'check-id';
    idLine.textContent = check.id;
    label.append(idLine);

    li.append(input, label);
    els.checks.append(li);
  }
}

function readChecks() {
  const state = {};
  for (const input of els.checks.querySelectorAll('input[type="checkbox"]')) {
    state[input.value] = input.checked;
  }
  return state;
}

// ---------- result rendering ----------
function renderResult(payload) {
  const { tech, score, decision, rationale, passed = [], failed = [], sources = [] } = payload;

  const wrap = document.createElement('div');
  wrap.className = 'result';

  const scoreLine = document.createElement('div');
  scoreLine.className = 'score-line';

  const scoreEl = document.createElement('p');
  scoreEl.className = 'score';
  scoreEl.id = 'score';
  scoreEl.textContent = String(score);
  const denom = document.createElement('small');
  denom.textContent = ' / 100';
  scoreEl.append(denom);

  const badge = document.createElement('p');
  badge.className = 'verdict verdict--' + decision;
  badge.id = 'verdict';
  badge.textContent = decision;

  scoreLine.append(scoreEl, badge);

  const techLine = document.createElement('p');
  techLine.className = 'hint';
  techLine.textContent = 'Candidate: ' + tech;

  const rationaleEl = document.createElement('p');
  rationaleEl.className = 'rationale';
  rationaleEl.id = 'rationale';
  rationaleEl.textContent = rationale;

  const lists = document.createElement('div');
  lists.className = 'lists';
  lists.append(
    buildList('Passed', passed, 'No checks passed.'),
    buildList('Failed / unproven', failed, 'Every check passed.'),
  );

  const sourcesBlock = document.createElement('div');
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  sourcesBlock.append(sourcesHeading);
  if (sources.length === 0) {
    const none = document.createElement('p');
    none.className = 'empty';
    none.id = 'sources-empty';
    none.textContent = 'No source recorded — existence and currency are therefore unverified.';
    sourcesBlock.append(none);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'sources';
    ul.id = 'sources';
    for (const source of sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = source.url;
      a.textContent = source.url;
      a.rel = 'noreferrer noopener';
      a.target = '_blank';
      const asOf = document.createElement('span');
      asOf.className = 'asof';
      asOf.textContent = ' — checked ' + source.asOf;
      li.append(a, asOf);
      ul.append(li);
    }
    sourcesBlock.append(ul);
  }

  wrap.append(scoreLine, techLine, rationaleEl, lists, sourcesBlock);
  els.result.replaceChildren(wrap);
  els.result.hidden = false;

  setStatus('Decision for "' + tech + '": ' + decision + ' (score ' + score + '/100).', 'ok');
  window.__result = payload;
}

function buildList(heading, ids, emptyText) {
  const block = document.createElement('div');
  const h3 = document.createElement('h3');
  h3.textContent = heading + ' (' + ids.length + ')';
  block.append(h3);
  if (ids.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = emptyText;
    block.append(p);
    return block;
  }
  const ul = document.createElement('ul');
  for (const id of ids) {
    const li = document.createElement('li');
    li.textContent = id;
    ul.append(li);
  }
  block.append(ul);
  return block;
}

// ---------- network helpers ----------
async function readError(res) {
  try {
    const body = await res.json();
    if (body && typeof body.error === 'string') return body.error;
  } catch {
    /* fall through to the status line */
  }
  return 'HTTP ' + res.status + ' ' + res.statusText;
}

// ---------- actions ----------
async function onEvaluate(event) {
  event.preventDefault();
  const tech = els.tech.value.trim();
  if (tech === '') {
    setStatus('Enter the technology under evaluation before scoring.', 'error');
    els.tech.focus();
    return;
  }

  const payload = {
    tech,
    license: els.license.value,
    sourceUrl: els.sourceUrl.value.trim(),
    checks: readChecks(),
  };

  els.evaluate.disabled = true;
  setStatus('Evaluating "' + tech + '"…');
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setStatus('Evaluation failed: ' + (await readError(res)), 'error');
      els.result.hidden = true;
      return;
    }
    renderResult(await res.json());
  } catch (err) {
    setStatus('Evaluation failed: could not reach /api/evaluate (' + err.message + ').', 'error');
    els.result.hidden = true;
  } finally {
    els.evaluate.disabled = false;
  }
}

async function onProbe() {
  els.probe.disabled = true;
  setStatus('Running spike probe…');
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      setStatus('Spike probe failed: ' + (await readError(res)), 'error');
      return;
    }
    const health = await res.json();
    setStatus(
      'Spike probe: status ' + health.status +
      ', uptime ' + health.uptimeSeconds + ' s' +
      ', node ' + health.node + '.',
      'ok',
    );
    window.__health = health;
  } catch (err) {
    setStatus('Spike probe failed: could not reach /api/health (' + err.message + ').', 'error');
  } finally {
    els.probe.disabled = false;
  }
}

// ---------- wire up ----------
els.form.addEventListener('submit', onEvaluate);
els.probe.addEventListener('click', onProbe);

(async function loadChecks() {
  try {
    const res = await fetch('/api/checks');
    if (!res.ok) throw new Error(await readError(res));
    const data = await res.json();
    if (!data || !Array.isArray(data.checks) || data.checks.length === 0) {
      throw new Error('malformed /api/checks payload');
    }
    renderChecks(data.checks);
    setStatus(data.checks.length + ' evidence checks loaded from /api/checks.');
    window.__checks = data.checks;
  } catch (err) {
    renderChecks(FALLBACK_CHECKS);
    setStatus(
      'Could not load /api/checks (' + err.message + '); using the inlined check list. Scoring will still POST to /api/evaluate.',
      'error',
    );
    window.__checks = FALLBACK_CHECKS;
  }
})();
