/* ============================================================================
   AAR — search & ask demo
   Interactive playground for /search and /ask endpoints supporting GET and POST.
   ========================================================================= */

import { search, ask, buildSearchParams, buildSearchPayload, ApiError } from "./api.js?v=2";
import { API_BASE, API_KEY, DEFAULT_LIMIT, RAPIDAPI_HOST, RAPIDAPI_URL, isConfigured, endpoint }
  from "./config.js?v=2";

/* ---- DOM ------------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel);

const els = {
  form:           $("[data-search-form]"),
  input:          $("[data-search-input]"),
  submit:         $("[data-search-submit]"),
  chips:          Array.from(document.querySelectorAll("[data-scope-type]")),
  modes:          Array.from(document.querySelectorAll("[data-mode]")),
  preview:        $("[data-request-preview]"),
  status:         $("[data-search-status]"),
  results:        $("[data-results]"),
  resultsHd:      $("[data-results-head]"),
  seal:           $("[data-seal]"),
  // Advanced options controls
  toggleAdv:      $("[data-toggle-advanced]"),
  panelAdv:       $("[data-advanced-panel]"),
  summaryAdv:     $("[data-advanced-summary]"),
  badgeMethod:    $("[data-badge-method]"),
  badgeBreakdown: $("[data-badge-breakdown]"),
  badgeMode:      $("[data-badge-mode]"),
  badgeNsfw:      $("[data-badge-nsfw]"),
  methodBtns:     Array.from(document.querySelectorAll("[data-opt-method]")),
  breakdownBtns:  Array.from(document.querySelectorAll("[data-opt-breakdown]")),
  retrievalBtns:  Array.from(document.querySelectorAll("[data-opt-mode]")),
  limitSlider:    $("[data-opt-limit]"),
  limitDisplay:   $("[data-limit-val]"),
  nsfwBtns:       Array.from(document.querySelectorAll("[data-opt-nsfw]")),
  minYearInput:   $("[data-opt-min-year]"),
  maxYearInput:   $("[data-opt-max-year]"),
  minScoreInput:  $("[data-opt-min-score]"),
  includeChips:   Array.from(document.querySelectorAll("[data-opt-include]")),
  resetBtns:      Array.from(document.querySelectorAll("[data-reset-advanced]")),
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
  types: new Set(),             // active hard-filter scope types (ANIME, MANGA, etc.)
  endpointMode: "search",       // "search" or "ask"
  httpMethod: "GET",            // "GET" (default) or "POST"
  queryBreakdown: true,         // true or false
  retrievalMode: "hybrid",      // "hybrid" or "semantic"
  limit: DEFAULT_LIMIT,         // 8
  nsfw: false,                  // false or true
  minYear: "",                  // "" or number
  maxYear: "",                  // "" or number
  minScore: "",                 // "" or number
  include: new Set(),           // "staff", "characters", "relations"
  isAdvancedOpen: false,
  inflight: null,               // AbortController
  lastQuery: "",
};

/* ---- Request shaping ------------------------------------------------------ */

function currentOptions(question) {
  return {
    question,
    method: state.httpMethod,
    limit: state.limit,
    work_types: Array.from(state.types),
    mode: state.retrievalMode,
    query_breakdown: state.queryBreakdown,
    nsfw: state.nsfw,
    min_year: state.minYear,
    max_year: state.maxYear,
    min_score: state.minScore,
    include: Array.from(state.include),
  };
}

function updateSummaryPill() {
  const parts = [
    state.httpMethod,
    state.queryBreakdown ? "Breakdown On" : "Breakdown Off",
    state.retrievalMode === "semantic" ? "Semantic" : "Hybrid",
    `Limit ${state.limit}`,
    state.nsfw ? "NSFW 18+" : "Safe",
  ];
  if (state.minYear || state.maxYear) {
    parts.push(`Year ${state.minYear || "—"}..${state.maxYear || "—"}`);
  }
  if (state.minScore) {
    parts.push(`Score ≥${state.minScore}`);
  }
  if (state.include.size > 0) {
    parts.push(`+${Array.from(state.include).join(",")}`);
  }
  if (els.summaryAdv) {
    els.summaryAdv.textContent = parts.join(" · ");
  }
}

function updateModeButtons() {
  for (const btn of els.modes) {
    const m = btn.getAttribute("data-mode");
    if (m === "search") {
      btn.textContent = `Search Mode (${state.httpMethod} /search)`;
    } else if (m === "ask") {
      btn.textContent = `Ask AI Mode (${state.httpMethod} /ask)`;
    }
  }
  if (els.submit) {
    els.submit.textContent = state.endpointMode === "ask"
      ? `Ask the AI (${state.httpMethod} /ask)`
      : `Search the catalogue (${state.httpMethod} /search)`;
  }
}

/** Render the request the demo would send — pre-flight preview. */
function renderPreview(question) {
  if (!els.preview) return;
  const q = question || "<your question>";
  const opts = currentOptions(q);
  const baseUrl = "https://articles-exclusive-hope-yacht.trycloudflare.com";
  const path = state.endpointMode === "ask" ? "/ask" : "/search";
  const method = state.httpMethod;

  if (method === "GET") {
    const params = buildSearchParams(opts);
    const displayUrl = `${baseUrl}${path}?${params.toString()}`;
    const curlCmd = `curl -X GET "${displayUrl}" \
  -H "x-api-key: aar_free_access"`;

    els.preview.innerHTML = `
      <div class="code">
        <div class="code__bar">
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            <span class="badge badge--method badge--get">GET</span>
            <span class="micro" style="word-break:break-all">${escapeHtml(displayUrl)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:.4rem">
            <button class="btn btn--quiet" type="button" data-copy-text="${escapeHtml(displayUrl)}">
              <span>Copy URL</span>
            </button>
            <button class="btn btn--quiet" type="button" data-copy-text="${escapeHtml(curlCmd)}">
              <span>Copy cURL</span>
            </button>
          </div>
        </div>
        <div class="code__body"><pre data-preview-body><code class="language-bash">${escapeHtml(curlCmd)}</code></pre></div>
      </div>`;
  } else {
    const body = buildSearchPayload(opts);
    const displayUrl = `${baseUrl}${path}`;
    const jsonStr = JSON.stringify(body, null, 2);
    const curlCmd = `curl -X POST "${displayUrl}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: aar_free_access" \
  -d '${jsonStr}'`;

    els.preview.innerHTML = `
      <div class="code">
        <div class="code__bar">
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            <span class="badge badge--method badge--post">POST</span>
            <span class="micro">${escapeHtml(displayUrl)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:.4rem">
            <button class="btn btn--quiet" type="button" data-copy-text="${escapeHtml(jsonStr)}">
              <span>Copy JSON</span>
            </button>
            <button class="btn btn--quiet" type="button" data-copy-text="${escapeHtml(curlCmd)}">
              <span>Copy cURL</span>
            </button>
          </div>
        </div>
        <div class="code__body"><pre data-preview-body><code class="language-json">${escapeHtml(jsonStr)}</code></pre></div>
      </div>`;
  }
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
  const year = work.release_year != null ? escapeHtml(work.release_year) : (work.year != null ? escapeHtml(work.year) : "—");
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

  let relBlocks = "";
  if (Array.isArray(work.characters) && work.characters.length) {
    const chars = work.characters.slice(0, 8).map((c) => escapeHtml(c.name || c.canonical_name)).join(", ");
    relBlocks += `<div class="micro" style="margin-top:.6rem;padding-top:.4rem;border-top:1px solid var(--rule)"><strong style="color:var(--ink)">Characters:</strong> <span class="faint">${chars}</span></div>`;
  }
  if (Array.isArray(work.staff) && work.staff.length) {
    const staff = work.staff.slice(0, 6).map((s) => `${escapeHtml(s.name)} (${escapeHtml(s.role)})`).join(", ");
    relBlocks += `<div class="micro" style="margin-top:.3rem"><strong style="color:var(--ink)">Staff:</strong> <span class="faint">${staff}</span></div>`;
  }
  if (Array.isArray(work.relations) && work.relations.length) {
    const rels = work.relations.slice(0, 6).map((r) => `${escapeHtml(r.relation_type || "Related")}: ${escapeHtml(r.title || r.target_title || "Work")}`).join(", ");
    relBlocks += `<div class="micro" style="margin-top:.3rem"><strong style="color:var(--ink)">Relations:</strong> <span class="faint">${rels}</span></div>`;
  }

  return `<article class="index-row">
      <button class="index-row__head" type="button" aria-expanded="false"
              data-row-toggle aria-controls="row-${i}">
        <span class="index-row__pos">${String(i + 1).padStart(2, "0")}</span>
        <span class="index-row__title">${title}${alt ? ` <span class="en">${alt}</span>` : ""}</span>
        <span class="index-row__meta">
          <span class="index-row__type">${type}</span>
          <span class="index-row__year">${year}</span>
          <span class="index-row__score">${score}</span>
        </span>
      </button>
      <div class="index-row__body" id="row-${i}" hidden>${passages}${relBlocks}</div>
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
    const opts = currentOptions(q);
    const data = state.endpointMode === "ask"
      ? await ask(opts, ctrl.signal)
      : await search(opts, ctrl.signal);
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
    const msg = detail || "You have reached your rate limit for this demo. Please wait a moment before trying again.";
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

/* ---- Controls wiring ----------------------------------------------------- */

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
      state.endpointMode = mode;
      els.modes.forEach((b) => b.classList.toggle("is-active", b === btn));
      updateModeButtons();
      renderPreview(state.lastQuery);
      if (state.lastQuery) runQuery(state.lastQuery);
    });
  }
}

function initAdvanced() {
  // Drawer toggle
  if (els.toggleAdv && els.panelAdv) {
    els.toggleAdv.addEventListener("click", () => {
      state.isAdvancedOpen = !state.isAdvancedOpen;
      els.toggleAdv.setAttribute("aria-expanded", String(state.isAdvancedOpen));
      els.panelAdv.hidden = !state.isAdvancedOpen;
    });
  }

  // Method toggle (GET / POST)
  for (const btn of els.methodBtns) {
    btn.addEventListener("click", () => {
      state.httpMethod = btn.getAttribute("data-opt-method") || "GET";
      for (const b of els.methodBtns) {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeMethod) {
        els.badgeMethod.textContent = state.httpMethod;
        els.badgeMethod.className = `badge badge--method ${state.httpMethod === "GET" ? "badge--get" : "badge--post"}`;
      }
      updateModeButtons();
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Query Breakdown toggle (true / false)
  for (const btn of els.breakdownBtns) {
    btn.addEventListener("click", () => {
      state.queryBreakdown = btn.getAttribute("data-opt-breakdown") === "true";
      for (const b of els.breakdownBtns) {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeBreakdown) {
        els.badgeBreakdown.textContent = state.queryBreakdown ? "LLM On" : "Bypassed";
      }
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Retrieval mode toggle (hybrid / semantic)
  for (const btn of els.retrievalBtns) {
    btn.addEventListener("click", () => {
      state.retrievalMode = btn.getAttribute("data-opt-mode") || "hybrid";
      for (const b of els.retrievalBtns) {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeMode) {
        els.badgeMode.textContent = state.retrievalMode === "semantic" ? "Semantic" : "Hybrid";
      }
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Limit slider
  if (els.limitSlider) {
    els.limitSlider.addEventListener("input", () => {
      state.limit = parseInt(els.limitSlider.value, 10) || DEFAULT_LIMIT;
      if (els.limitDisplay) els.limitDisplay.textContent = String(state.limit);
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Adult / NSFW toggle
  for (const btn of els.nsfwBtns) {
    btn.addEventListener("click", () => {
      state.nsfw = btn.getAttribute("data-opt-nsfw") === "true";
      for (const b of els.nsfwBtns) {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeNsfw) {
        els.badgeNsfw.textContent = state.nsfw ? "Adult 18+" : "Safe";
      }
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Scope: Min Year, Max Year, Min Score
  if (els.minYearInput) {
    els.minYearInput.addEventListener("input", () => {
      state.minYear = els.minYearInput.value.trim();
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }
  if (els.maxYearInput) {
    els.maxYearInput.addEventListener("input", () => {
      state.maxYear = els.maxYearInput.value.trim();
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }
  if (els.minScoreInput) {
    els.minScoreInput.addEventListener("input", () => {
      state.minScore = els.minScoreInput.value.trim();
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Relational include chips
  for (const chip of els.includeChips) {
    chip.addEventListener("click", () => {
      const field = chip.getAttribute("data-opt-include");
      if (!field) return;
      if (state.include.has(field)) {
        state.include.delete(field);
        chip.classList.remove("is-active");
        chip.setAttribute("aria-pressed", "false");
      } else {
        state.include.add(field);
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
      }
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Reset to defaults
  for (const btn of els.resetBtns) {
    btn.addEventListener("click", () => {
      state.httpMethod = "GET";
      state.queryBreakdown = true;
      state.retrievalMode = "hybrid";
      state.limit = DEFAULT_LIMIT;
      state.nsfw = false;
      state.minYear = "";
      state.maxYear = "";
      state.minScore = "";
      state.include.clear();

      // Sync method chips
      for (const b of els.methodBtns) {
        const active = (b.getAttribute("data-opt-method") || "GET") === "GET";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeMethod) {
        els.badgeMethod.textContent = "GET";
        els.badgeMethod.className = "badge badge--method badge--get";
      }

      // Sync breakdown chips
      for (const b of els.breakdownBtns) {
        const active = b.getAttribute("data-opt-breakdown") === "true";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeBreakdown) els.badgeBreakdown.textContent = "LLM On";

      // Sync retrieval chips
      for (const b of els.retrievalBtns) {
        const active = (b.getAttribute("data-opt-mode") || "hybrid") === "hybrid";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeMode) els.badgeMode.textContent = "Hybrid";

      // Sync limit
      if (els.limitSlider) els.limitSlider.value = String(DEFAULT_LIMIT);
      if (els.limitDisplay) els.limitDisplay.textContent = String(DEFAULT_LIMIT);

      // Sync NSFW
      for (const b of els.nsfwBtns) {
        const active = b.getAttribute("data-opt-nsfw") === "false";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeNsfw) els.badgeNsfw.textContent = "Safe";

      // Sync scope inputs
      if (els.minYearInput) els.minYearInput.value = "";
      if (els.maxYearInput) els.maxYearInput.value = "";
      if (els.minScoreInput) els.minScoreInput.value = "";

      // Sync include chips
      for (const c of els.includeChips) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      }

      updateModeButtons();
      updateSummaryPill();
      renderPreview(state.lastQuery);
    });
  }
}

function init() {
  renderExamples();
  initChips();
  initModes();
  initAdvanced();
  updateModeButtons();
  updateSummaryPill();
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
