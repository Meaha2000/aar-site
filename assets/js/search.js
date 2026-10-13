/* ============================================================================
   AAR — search & ask demo
   Interactive playground for POST /search and POST /ask endpoints.
   ========================================================================= */

import { search, ask, previewSearchBody, previewAskBody, ApiError } from "./api.js?v=2";
import { API_BASE, API_KEY, DEFAULT_LIMIT, RAPIDAPI_HOST, RAPIDAPI_URL, isConfigured, endpoint }
  from "./config.js?v=2";

/* ---- DOM ------------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel);

const els = {
  form:      $("[data-search-form]"),
  input:     $("[data-search-input]"),
  submit:    $("[data-search-submit]"),
  chips:     Array.from(document.querySelectorAll("[data-scope-type]")),
  modes:     Array.from(document.querySelectorAll("[data-mode]")),
  preview:   $("[data-request-preview]"),
  status:    $("[data-search-status]"),
  results:   $("[data-results]"),
  resultsHd: $("[data-results-head]"),
  seal:      $("[data-seal]"),
};

const EXAMPLES = [
  "Time-travel visual novel with branching timelines",
  "A swordsman who cannot die and the woman who follows him",
  "Weakest hunter reawakens in a dungeon with a solo leveling system",
  "Studio that animated a demon-slaying brother and sister",
  "Banished immortal cultivator returns 10,000 years later to rebuild his sect",
  "Cyberpunk dystopia where memory can be bought",
  "Something cozy but a little lonely, for a rainy evening",
];

/* ---- State ---------------------------------------------------------------- */

const state = {
  types: new Set(),   // active hard-filter scope types
  mode: "search",     // "search" or "ask"
  inflight: null,     // AbortController for current request
  lastQuery: "",
};

/* ---- Request shaping ------------------------------------------------------ */

function currentOptions(question) {
  return {
    question,
    limit: DEFAULT_LIMIT,
    work_types: Array.from(state.types),
  };
}

/** Render the request the demo would send — pre-flight preview. */
function renderPreview(question) {
  if (!els.preview) return;
  const q = question || "<your question>";
  const body = state.mode === "ask"
    ? previewAskBody(currentOptions(q))
    : previewSearchBody(currentOptions(q));
  const path = state.mode === "ask" ? "/ask" : "/search";
  const displayUrl = `https://${RAPIDAPI_HOST}${path}`;

  els.preview.innerHTML = `
    <div class="code">
      <div class="code__bar">
        <span class="micro">POST ${escapeHtml(displayUrl)}</span>
        <button class="btn btn--quiet" type="button" data-copy="[data-preview-body]">
          <span data-copy-label>Copy</span>
        </button>
      </div>
      <div class="code__body"><pre data-preview-body>${escapeHtml(JSON.stringify(body, null, 2))}</pre></div>
    </div>`;
}

/* ---- Rendering ------------------------------------------------------------ */

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function statusNote(kind, html) {
  if (!els.status) return;
  if (!html) { els.status.innerHTML = ""; els.status.hidden = true; return; }
  els.status.hidden = false;
  els.status.innerHTML = `<div class="note note--${kind}">${html}</div>`;
}

function renderEmpty() {
  if (els.resultsHd) els.resultsHd.hidden = true;
  if (els.results) els.results.innerHTML = "";
}

/** One result → one index row, expanding in place to its matched passages. */
function renderRow(work, i) {
  const title = escapeHtml(work.title || work.canonical_title || "Untitled");
  const alt = work.title && work.canonical_title && work.title !== work.canonical_title
    ? escapeHtml(work.canonical_title) : "";
  const type = escapeHtml((work.type || work.work_type || "").toString());
  const year = work.year != null ? escapeHtml(work.year) : "—";
  const score = typeof work.score === "number" ? work.score.toFixed(4) : "—";

  const chunks = Array.isArray(work.chunks) ? work.chunks
               : Array.isArray(work.matched_chunks) ? work.matched_chunks
               : work.matched_chunk ? [work.matched_chunk] : [];
  const passages = chunks.length
    ? chunks.map((c) => {
        const section = escapeHtml(c.section || c.kind || c.field || "Passage");
        const text = escapeHtml(c.text || c.excerpt || "");
        return `<figure class="passage">
            <figcaption class="passage__meta">
              <span class="micro">${section}</span>
            </figcaption>
            <blockquote class="passage__text">${text}</blockquote>
          </figure>`;
      }).join("")
    : `<p class="faint" style="font-size:.875rem">No passage text was returned for this work.</p>`;

  return `<article class="index-row">
      <button class="index-row__head" type="button" aria-expanded="false"
              data-row-toggle aria-controls="row-${i}">
        <span class="index-row__pos">${String(i + 1).padStart(2, "0")}</span>
        <span class="index-row__title">${title}${alt ? ` <span class="en">${alt}</span>` : ""}</span>
        <span class="index-row__meta">
          <span class="index-row__type">${type}</span>
          <span>${year}</span>
          <span class="index-row__score">${score}</span>
        </span>
      </button>
      <div class="index-row__body" id="row-${i}" hidden>${passages}</div>
    </article>`;
}

function renderTrace(trace) {
  if (!trace) return "";
  const ms = typeof trace.total_time_ms === "number" ? trace.total_time_ms
           : typeof trace.ms === "number" ? trace.ms : null;
  if (ms == null) return "";
  return `<div class="trace" style="margin-top:var(--space-3)"><span class="field__name">Latency</span> <span class="mono">${ms.toFixed(1)}ms</span></div>`;
}

function renderResults(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  if (els.resultsHd) els.resultsHd.hidden = false;

  let answerBlock = "";
  if (data?.answer) {
    answerBlock = `
      <div class="answer-card" style="background:var(--paper-raised);border:1px solid var(--sakura);border-radius:8px;padding:var(--space-4);margin-bottom:var(--space-4);box-shadow:var(--card-shadow)">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem">
          <span class="badge badge--sakura">AI Grounded Synthesis</span>
        </div>
        <div style="font-family:var(--serif);font-size:1.0625rem;line-height:1.65;color:var(--ink)">
          ${escapeHtml(data.answer)}
        </div>
      </div>`;
  }

  if (!results.length && !data?.answer) {
    renderEmpty();
    statusNote("ok", "<strong>No works matched.</strong> The catalogue answered with zero rows. "+
      "Loosen the scope filters or rephrase the question.");
    return;
  }

  statusNote(null, "");
  els.results.innerHTML = answerBlock + results.map(renderRow).join("") + renderTrace(data.trace);
}

/* ---- Unconfigured state --------------------------------------------------- */

function renderUnconfigured() {
  const live = RAPIDAPI_URL
    ? ` or visit the official listing on <a href="${escapeHtml(RAPIDAPI_URL)}" rel="noopener" target="_blank">RapidAPI</a>`
    : "";
  statusNote("warn",
    `<strong>Service is currently unavailable.</strong> The search gateway is not configured for this demo${live}. `+
    `Please try again later.`);
  renderPreview(state.lastQuery || "");
  renderEmpty();
}

/* ---- Submit --------------------------------------------------------------- */

function setBusy(busy) {
  if (els.submit) {
    els.submit.disabled = busy;
    els.submit.setAttribute("aria-busy", busy ? "true" : "false");
  }
  if (els.seal) els.seal.classList.toggle("is-turning", busy);
}

async function runQuery(question) {
  const q = (question || "").trim();
  if (!q) { els.input && els.input.focus(); return; }

  state.lastQuery = q;
  if (!isConfigured()) { renderUnconfigured(); return; }

  if (state.inflight) state.inflight.abort();
  const ctrl = new AbortController();
  state.inflight = ctrl;
  const timeout = setTimeout(() => ctrl.abort(), 35000);

  setBusy(true);
  renderPreview(q);
  statusNote(null, "");

  try {
    const data = state.mode === "ask"
      ? await ask(currentOptions(q), ctrl.signal)
      : await search(currentOptions(q), ctrl.signal);
    renderResults(data);
  } catch (err) {
    if (err && err.name === "AbortError" && !ctrl.signal.aborted) {
      // aborted by a newer request; stay quiet
    } else if (err instanceof ApiError) {
      renderError(err, q);
    } else {
      statusNote("error", `<strong>The request failed.</strong> ${escapeHtml(err?.message || "Unknown error")}`);
    }
  } finally {
    clearTimeout(timeout);
    if (state.inflight === ctrl) state.inflight = null;
    setBusy(false);
  }
}

function renderError(err, q) {
  const retry = `<button class="btn btn--link" type="button" data-retry>Retry this query</button>`;
  const detail = (err?.body && (err.body.message || err.body.error || err.body.detail)) || "";
  if (err.status === 401 || err.status === 403) {
    statusNote("error",
      `<strong>Authentication error (${err.status}).</strong> Access to the API service was denied. Please verify your credentials or subscription. ${retry}`);
  } else if (err.status === 429) {
    const msg = detail || "You have reached your daily limit of 10 requests per IP for this demo. Your quota will reset at 00:00 UTC.";
    statusNote("warn",
      `<strong>Rate limit exceeded (429).</strong> ${escapeHtml(msg)} ${retry}`);
  } else if (err.status === 0 && err.message && err.message.includes("reach")) {
    statusNote("error",
      `<strong>Service unreachable.</strong> Could not establish a connection to the search endpoint. ${retry}`);
  } else if (err.status === 0) {
    statusNote("warn", `<strong>The request timed out.</strong> The endpoint did not answer within 35 seconds. ${retry}`);
  } else {
    statusNote("error",
      `<strong>Service error (${err.status}).</strong> ${escapeHtml(detail || err.message)} ${retry}`);
  }
  if (els.results) els.results.innerHTML = "";
}

/* ---- Examples, chips, wiring --------------------------------------------- */

function renderExamples() {
  const host = document.querySelector("[data-examples]");
  if (!host) return;
  host.innerHTML = EXAMPLES.map(
    (ex) => `<button class="example" type="button" data-example>${escapeHtml(ex)}</button>`
  ).join("");
}

function initChips() {
  for (const chip of els.chips) {
    const type = (chip.getAttribute("data-scope-type") || "").toUpperCase();
    const sync = () => chip.setAttribute("aria-pressed", state.types.has(type) ? "true" : "false");
    sync();
    chip.addEventListener("click", () => {
      if (state.types.has(type)) state.types.delete(type); else state.types.add(type);
      sync();
      renderPreview(state.lastQuery);
    });
  }
}

function initModes() {
  for (const btn of els.modes) {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      if (!mode) return;
      state.mode = mode;
      els.modes.forEach((b) => b.classList.toggle("is-active", b === btn));
      if (els.submit) {
        els.submit.textContent = state.mode === "ask" ? "Ask the AI (/ask)" : "Search the catalogue (/search)";
      }
      renderPreview(state.lastQuery);
      if (state.lastQuery) runQuery(state.lastQuery);
    });
  }
}

function init() {
  renderExamples();
  initChips();
  initModes();
  renderPreview(state.lastQuery);
  if (!isConfigured()) renderUnconfigured();

  const fromUrl = new URLSearchParams(location.search).get("q");
  if (fromUrl && els.input) {
    els.input.value = fromUrl;
    renderPreview(fromUrl);
    if (isConfigured()) {
      runQuery(fromUrl);
    } else {
      statusNote("warn",
        `<strong>Service unavailable.</strong> Please try again later or access the API via RapidAPI.`);
    }
  }

  if (els.form) {
    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      runQuery(els.input ? els.input.value : "");
    });
  }

  document.addEventListener("click", (e) => {
    const ex = e.target.closest("[data-example]");
    if (ex) {
      if (els.input) { els.input.value = ex.textContent.trim(); els.input.focus(); }
      renderPreview(els.input.value);
      return;
    }
    const retry = e.target.closest("[data-retry]");
    if (retry) { runQuery(state.lastQuery); return; }
    const toggle = e.target.closest("[data-row-toggle]");
    if (toggle) {
      const body = document.getElementById(toggle.getAttribute("aria-controls"));
      if (body) {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", open ? "false" : "true");
        body.hidden = open;
      }
    }
  });

  if (els.input) els.input.addEventListener("input", () => renderPreview(els.input.value));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
