/* ============================================================================
   AAR — search demo (the centrepiece)
   ============================================================================
   Behaviour, in order of the honesty rules in DESIGN.md:

   · Before any query, the page shows HOW THE REQUEST WILL BE SHAPED — the exact
     JSON body and the resolved endpoint — not a spinner and not fake results.
   · With no backend configured it says exactly that, shows the request it would
     send, and offers the live API path. It NEVER renders fabricated results.
   · Errors name the problem and the recovery (401 → where the proxy sits;
     timeout → a retry that actually retries).
   ========================================================================= */

import { search, previewSearchBody, ApiError } from "./api.js?v=2";
import { API_BASE, API_KEY, DEFAULT_LIMIT, RAPIDAPI_URL, isConfigured, endpoint }
  from "./config.js?v=2";

/* ---- DOM ------------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel);

const els = {
  form:      $("[data-search-form]"),
  input:     $("[data-search-input]"),
  submit:    $("[data-search-submit]"),
  chips:     Array.from(document.querySelectorAll("[data-scope-type]")),
  preview:   $("[data-request-preview]"),
  status:    $("[data-search-status]"),
  results:   $("[data-results]"),
  resultsHd: $("[data-results-head]"),
  seal:      $("[data-seal]"),
};

const EXAMPLES = [
  "Time-travel visual novel with branching timelines",
  "A swordsman who cannot die and the woman who follows him",
  "Studio that animated a demon-slaying brother and sister",
  "Cyberpunk dystopia where memory can be bought",
  "A quiet story about grief, set in a seaside town",
  "Something cozy but a little lonely, for a rainy evening",
];

/* ---- State ---------------------------------------------------------------- */

const state = {
  types: new Set(),   // active hard-filter scope types
  inflight: null,     // AbortController for the current request
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

/** Render the request the demo would send — the honest empty state. */
function renderPreview(question) {
  if (!els.preview) return;
  const body = previewSearchBody(currentOptions(question || "<your question>"));
  const url = isConfigured() ? endpoint("/search") : "<API_BASE>/search";
  els.preview.innerHTML = `
    <div class="code">
      <div class="code__bar">
        <span class="micro">POST ${escapeHtml(url)}</span>
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
  // The live API returns `title` / `type` / `chunks[]`; the documented shape
  // uses `canonical_title` / `work_type` / `matched_chunk`. Accept both.
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
        const section = escapeHtml(c.section || c.kind || c.field || "passage");
        const text = escapeHtml(c.text || c.excerpt || "");
        return `<figure class="passage">
            <figcaption class="passage__meta">
              <span class="micro">${section}</span>
            </figcaption>
            <blockquote class="passage__text">${text}</blockquote>
          </figure>`;
      }).join("")
    : `<p class="faint" style="font-size:.875rem">No passage text was returned for this work. `+
      `Re-run with <code>include: ["text"]</code> to request excerpts.</p>`;

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
  const bits = [];
  // Live trace uses fused_count / total_time_ms; the documented shape uses fused / ms.
  const fused = typeof trace.fused_count === "number" ? trace.fused_count
              : typeof trace.fused === "number" ? trace.fused : null;
  const ms = typeof trace.total_time_ms === "number" ? trace.total_time_ms
           : typeof trace.ms === "number" ? trace.ms : null;
  if (fused != null) bits.push(`<span class="field__name">fused</span> <span class="mono">${fused}</span>`);
  if (ms != null) bits.push(`<span class="field__name">ms</span> <span class="mono">${ms.toFixed(1)}</span>`);
  // Reranking is reported as a step, never by its backend or model name.
  const reranked = (trace.reranker_backend && trace.reranker_backend !== "none") ||
                   (trace.rerank && typeof trace.rerank === "object");
  if (reranked) {
    const r = typeof trace.rerank === "object" && trace.rerank ? trace.rerank : {};
    bits.push(`<span class="field__name">reranked</span> <span class="mono">yes`+
      `${typeof r.scored === "number" ? ` · ${r.scored}` : ""}${typeof r.ms === "number" ? ` · ${r.ms.toFixed(1)}ms` : ""}</span>`);
  }
  if (!bits.length) return "";
  return `<div class="trace" style="margin-top:var(--space-3)">${bits.join("")}</div>`;
}

function renderResults(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  if (els.resultsHd) els.resultsHd.hidden = false;

  if (!results.length) {
    renderEmpty();
    statusNote("ok", "<strong>No works matched.</strong> The catalogue answered with zero rows. "+
      "Loosen the scope filters or rephrase the question.");
    return;
  }

  statusNote(null, "");
  els.results.innerHTML = results.map(renderRow).join("") + renderTrace(data.trace);
}

/* ---- Unconfigured state (honest, per DESIGN.md) --------------------------- */

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
  const timeout = setTimeout(() => ctrl.abort(), 30000);

  setBusy(true);
  renderPreview(q);
  statusNote(null, "");

  try {
    const data = await search(currentOptions(q), ctrl.signal);
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
  const detail = (err?.body && (err.body.message || err.body.error)) || "";
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
    statusNote("warn", `<strong>The request timed out.</strong> The endpoint did not answer within 30 seconds. ${retry}`);
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

function init() {
  renderExamples();
  initChips();
  renderPreview(state.lastQuery);
  if (!isConfigured()) renderUnconfigured();

  // A link from the index page can arrive as search.html?q=… — put the
  // question in the field and run it, so the example actually launches.
  const fromUrl = new URLSearchParams(location.search).get("q");
  if (fromUrl && els.input) {
    els.input.value = fromUrl;
    renderPreview(fromUrl);
    if (isConfigured()) {
      runQuery(fromUrl);
    } else {
      statusNote("warn",
        `<strong>No backend is configured.</strong> This example would send ` +
        `<code>${escapeHtml(fromUrl)}</code> once <code>API_BASE</code> is set.`);
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


