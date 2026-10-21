function formatImageUrl(url) {
  if (!url) return "";
  let clean = String(url).trim();
  if (clean.startsWith("https://myanimelist.net/images/")) {
    clean = clean.replace("https://myanimelist.net/images/", "https://cdn.myanimelist.net/images/");
  } else if (clean.startsWith("http://myanimelist.net/images/")) {
    clean = clean.replace("http://myanimelist.net/images/", "https://cdn.myanimelist.net/images/");
  }
  return clean;
}

/* ============================================================================
   AAR — search, ask & recommend demo
   Interactive playground for /search, /ask, and /recommend endpoints.
   Architected in consultation with Gemini 4 Argon.
   ========================================================================= */

import {
  search,
  ask,
  recommend,
  searchAutocomplete,
  getCachedAutocomplete,
  parseRecommendInput,
  buildSearchParams,
  buildSearchPayload,
  ApiError
} from "./api.js?v=6";
import { API_BASE, API_KEY, DEFAULT_LIMIT, isConfigured, endpoint }
  from "./config.js?v=5";

/* ---- DOM ------------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel);

const els = {
  form:           $("[data-search-form]"),
  input:          $("[data-search-input]"),
  submit:         $("[data-search-submit]"),
  modePill:       $("[data-mode-pill]"),
  resolvedBadge:  $("[data-resolved-badge]"),
  acMenu:         $("[data-autocomplete-menu]"),
  seedChips:      $("[data-seed-chips]"),
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

const MODE_CONFIG = {
  search: {
    placeholder: "Describe a plot, trope, premise, or character…",
    buttonText: () => "Search the catalogue",
    modeText: () => "Search Mode",
  },
  ask: {
    placeholder: "Ask a question about any anime, story, or lore…",
    buttonText: () => "Ask the AI",
    modeText: () => "Ask AI Mode",
  },
  recommend: {
    placeholder: "Search title, enter ID (e.g. mal:5114), or paste URL…",
    buttonText: () => "Find Similar Works",
    modeText: () => "Recommend Me",
  },
};

const MODE_GUIDANCE = {
  search: {
    title: "How Natural Language Search Works",
    summary: "Describe stories you half-remember, themes, character dynamics, or plot premises in plain language. AAR matches across 144,000+ works using neural semantic vectors and returns supporting synopsis excerpts.",
    tips: [
      "Describe narrative memory: <em>\"A swordsman who cannot die and the woman who follows him\"</em>",
      "Describe tone or setting: <em>\"Quiet, melancholic fantasy with slow journeys\"</em>",
      "Unified index across Anime, Manga, Light Novels, Visual Novels, Korean Manhwa, and Chinese Manhua"
    ]
  },
  ask: {
    title: "How Grounded AI Q&A Works",
    summary: "Ask natural language questions about story lore, character dynamics, thematic comparisons, or requests for tailored recommendations. The AI synthesizes answers grounded directly in verified catalogue passages with citations.",
    tips: [
      "Ask for comparisons: <em>\"Compare themes of mortality in Frieren vs Kino's Journey\"</em>",
      "Ask about story lore: <em>\"Why is Steins;Gate's narrative considered a gold standard in time travel?\"</em>",
      "Answers include verified source citations from the 144k corpus"
    ]
  },
  recommend: {
    title: "How to Find Similar Recommendations",
    summary: "Type any title to see instant suggestions from the catalogue, or enter a canonical ID (e.g. <code>aar_30914</code>, <code>mal:5114</code>, <code>anilist:16498</code>) or a direct MyAnimeList link. You can add multiple seed works to blend recommendations.",
    tips: [
      "Start typing any title (e.g. <em>\"Frieren\"</em>, <em>\"Attack on Titan\"</em>, <em>\"Solo Leveling\"</em>) and select it",
      "Add up to 10 seed works to blend distinct tropes and genres",
      "Results are ranked by shared narrative tags and semantic similarity"
    ]
  }
};

/* ---- State ---------------------------------------------------------------- */

const state = {
  types: new Set(),             // active hard-filter scope types (ANIME, MANGA, etc.)
  endpointMode: "search",       // "search", "ask", or "recommend"
  httpMethod: "GET",            // "GET" (default) or "POST"
  queryBreakdown: false,        // false by default for instant ~500ms hybrid search
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
  // Recommend & Autocomplete state
  selectedSeedWork: null,       // legacy single seed fallback
  selectedSeeds: [],            // [{ workId, title, type, release_year }]
  acItems: [],
  acHighlightIndex: -1,
  acDebounceTimer: null,
  acAbortController: null,
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
    const active = m === state.endpointMode;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
    if (MODE_CONFIG[m]) {
      btn.textContent = MODE_CONFIG[m].modeText();
    }
  }

  const cfg = MODE_CONFIG[state.endpointMode] || MODE_CONFIG.search;
  if (els.submit) {
    els.submit.textContent = cfg.buttonText();
  }
  if (els.input) {
    els.input.placeholder = cfg.placeholder;
  }
  if (els.form) {
    els.form.setAttribute("data-active-mode", state.endpointMode);
  }
  

  if (state.endpointMode !== "recommend") {
    closeAutocomplete();
    if (els.resolvedBadge) els.resolvedBadge.hidden = true;
    if (els.form) els.form.classList.remove("has-resolved-badge");
    if (els.seedChips) els.seedChips.hidden = true;
  } else {
    updateResolvedBadge();
    renderSeedChips();
  }

  renderGuidance();
}

/** Render the request the demo would send — pre-flight preview. */
function renderPreview(question) {
  if (!els.preview) return;
  const baseUrl = "https://api.aarecords.tech";
  const method = state.httpMethod;

  if (state.endpointMode === "recommend") {
    let seeds = state.selectedSeeds.map(s => s.workId);
    if (!seeds.length) {
      const parsed = parseRecommendInput(question);
      seeds = [parsed.workId || state.selectedSeedWork?.workId || (question ? question.trim() : "<work_id>")];
    }
    const isMulti = seeds.length > 1;
    const effectiveMethod = isMulti ? "POST" : method;

    let displayUrl = "";
    let curlCmd = "";

    if (effectiveMethod === "POST") {
      displayUrl = `${baseUrl}/recommend`;
      const bodyJson = JSON.stringify({ seed_work_ids: seeds, limit: state.limit });
      curlCmd = `curl -X POST "${displayUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: aar_free_access" \\
  -d '${bodyJson}'`;
    } else {
      displayUrl = `${baseUrl}/recommend/${encodeURIComponent(seeds[0])}?limit=${state.limit}`;
      curlCmd = `curl -X GET "${displayUrl}" \\
  -H "x-api-key: aar_free_access"`;
    }

    els.preview.innerHTML = `
      <div class="code">
        <div class="code__bar">
          <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            <span class="badge badge--method ${effectiveMethod === "GET" ? "badge--get" : "badge--post"}">${effectiveMethod}</span>
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
    return;
  }

  const q = question || "<your question>";
  const opts = currentOptions(q);
  const path = state.endpointMode === "ask" ? "/ask" : "/search";

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

const KNOWN_LABELS = [
  "Alternative Titles",
  "Characters & Cast",
  "Creators & Studios",
  "Tags & Themes",
  "Theme Songs",
  "Alternative Title",
  "Title",
  "Synopsis",
  "Genres",
  "Themes",
  "Tags",
  "Type",
  "Characters",
  "Creators",
  "Studios",
  "Staff",
  "Background",
  "Relations",
  "Score",
  "Status"
];

function cleanTagValue(val) {
  return String(val || "")
    .replace(/\[\s*"([^"]+)"\s*\]/g, "$1")
    .replace(/["\[\]]/g, "")
    .trim();
}

function parsePassageSections(rawText) {
  if (!rawText) return [];
  const escaped = KNOWN_LABELS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(?:^|\n|\b)(${escaped}):\s*`, "g");

  const matches = [];
  let m;
  while ((m = regex.exec(rawText)) !== null) {
    matches.push({ label: m[1], index: m.index, matchLen: m[0].length });
  }

  if (!matches.length) {
    return [{ label: null, content: rawText.trim() }];
  }

  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const start = cur.index + cur.matchLen;
    const end = (i + 1 < matches.length) ? matches[i + 1].index : rawText.length;
    let content = rawText.slice(start, end).trim();
    if (content) {
      sections.push({ label: cur.label, content });
    }
  }
  return sections;
}

function renderPassage(c) {
  const rawSection = (c.section || c.kind || c.field || "Passage").toString();
  const sectionCaption = rawSection.includes("+")
    ? "Matched Passage · Overview & Context"
    : `Matched Passage · ${rawSection}`;

  const text = (c.text || c.excerpt || "").toString();
  const sections = parsePassageSections(text);

  let formattedContent = "";
  if (sections.length === 1 && !sections[0].label) {
    formattedContent = `<p style="margin:0;line-height:1.6">${escapeHtml(sections[0].content)}</p>`;
  } else {
    formattedContent = sections.map(sec => {
      if (!sec.label) {
        return `<p style="margin:0 0 .5rem;line-height:1.6">${escapeHtml(sec.content)}</p>`;
      }
      if (sec.label === "Tags & Themes" || sec.label === "Genres" || sec.label === "Themes" || sec.label === "Tags") {
        const rawTags = sec.content.split(/[,\n]+/).map(cleanTagValue).filter(Boolean);
        const tagsHtml = rawTags.map(t =>
          `<span class="badge badge--quiet" style="font-size:.7rem;padding:.15rem .45rem;margin:.15rem .25rem .15rem 0;display:inline-block">${escapeHtml(t)}</span>`
        ).join("");
        return `<div style="margin-bottom:.55rem">
          <strong style="color:var(--ink);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em">${escapeHtml(sec.label)}:</strong>
          <div style="margin-top:.25rem">${tagsHtml}</div>
        </div>`;
      }
      return `<div style="margin-bottom:.55rem;line-height:1.55">
        <strong style="color:var(--ink);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em">${escapeHtml(sec.label)}:</strong>
        <span class="faint" style="font-size:.875rem">${escapeHtml(sec.content)}</span>
      </div>`;
    }).join("");
  }

  return `<div class="passage" style="margin-bottom:var(--space-3);border-left:3px solid var(--sakura-deep);padding:.6rem .9rem;background:var(--paper-deep);border-radius:0 6px 6px 0">
    <div class="micro" style="color:var(--sakura-deep);font-weight:600;margin-bottom:.4rem;letter-spacing:.04em">${escapeHtml(sectionCaption)}</div>
    ${formattedContent}
  </div>`;
}

function renderRow(work, i) {
  const title = escapeHtml(work.title || "Untitled");
  const alt = work.title_english && work.title_english !== work.title ? escapeHtml(work.title_english) : "";
  const type = escapeHtml(work.type || work.medium || "—");
  const year = work.release_year ?? "—";
  const score = typeof work.score === "number" ? work.score.toFixed(2) : "—";

  const passages = Array.isArray(work.chunks) && work.chunks.length
    ? work.chunks.map(renderPassage).join("")
    : `<div class="faint micro">No passage details available.</div>`;

  let relBlocks = "";
  if (Array.isArray(work.characters) && work.characters.length) {
    const chars = work.characters.slice(0, 8).map((c) => escapeHtml(c.name || c)).join(", ");
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

/* ---- Recommendation Rendering -------------------------------------------- */

function renderRecommendationResults(data, requestedId, seedMeta) {
  if (els.resultsHd) els.resultsHd.hidden = true;
  statusNote(null, "");

  const recs = Array.isArray(data.recommendations) ? data.recommendations : [];
  const seedIds = Array.isArray(data.seed_work_ids) && data.seed_work_ids.length
    ? data.seed_work_ids.join(", ")
    : requestedId;

  let seedTitleHtml = "";
  if (Array.isArray(seedMeta) && seedMeta.length > 0) {
    seedTitleHtml = seedMeta.map(s => `<strong>${escapeHtml(s.title || s.workId)}</strong> <span class="rec-seed-banner__id">${escapeHtml(s.workId)}</span>`).join(" + ");
  } else if (seedMeta && seedMeta.title) {
    seedTitleHtml = `<strong>${escapeHtml(seedMeta.title)}</strong> <span class="rec-seed-banner__id">${escapeHtml(seedIds)}</span>`;
  } else {
    seedTitleHtml = `<span class="rec-seed-banner__id">${escapeHtml(seedIds)}</span>`;
  }

  const bannerHtml = `
    <div class="rec-seed-banner">
      <div class="rec-seed-banner__label">
        Recommendations based on: ${seedTitleHtml}
      </div>
      <div class="rec-seed-banner__meta" style="font-family:var(--mono);font-size:0.75rem;color:var(--ink-soft)">
        ${recs.length} works · ${data.latency_ms ? `${Math.round(data.latency_ms)}ms` : "local catalogue"}
      </div>
    </div>
  `;

  if (recs.length === 0) {
    els.results.innerHTML = `${bannerHtml}<div class="note note--ok">No recommendations found for this work in the catalogue.</div>`;
    return;
  }

  const cardsHtml = recs.map((rec) => {
    const title = escapeHtml(rec.title || "Untitled");
    const eng = rec.title_english && rec.title_english !== rec.title
      ? `<span class="en">${escapeHtml(rec.title_english)}</span>`
      : "";
    const matchPct = typeof rec.final_score === "number"
      ? `${Math.round(rec.final_score * 100)}% Match`
      : "";
    const cleanShared = Array.from(new Set((rec.shared_tags || []).map(cleanTagValue).filter(Boolean)));
    const cleanGenres = Array.from(new Set((rec.genres || []).map(cleanTagValue).filter(Boolean)));
    const seenLower = new Set(cleanShared.map(t => t.toLowerCase()));
    const remainingGenres = cleanGenres.filter(g => !seenLower.has(g.toLowerCase()));

    const pillsHtml = [
      ...cleanShared.slice(0, 5).map((t) => `<span class="rec-tag rec-tag--shared" title="Shared Narrative Tag">✦ ${escapeHtml(t)}</span>`),
      ...remainingGenres.slice(0, 4).map((g) => `<span class="rec-tag">${escapeHtml(g)}</span>`)
    ].join("");

    const cleanImg = formatImageUrl(rec.image_url);
    const imgTag = cleanImg
      ? `<img class="rec-card__thumb" src="${escapeHtml(cleanImg)}" alt="${title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.style.visibility='hidden';">`
      : `<div class="rec-card__thumb" aria-hidden="true" style="background:var(--paper-deep);border:1px solid var(--rule)"></div>`;

    return `
      <article class="rec-card">
        ${imgTag}
        <div class="rec-card__body">
          <div class="rec-card__header">
            <h3 class="rec-card__title">${title}${eng}</h3>
            ${matchPct ? `<span class="rec-match-badge" title="Similarity Score: ${rec.final_score}">${matchPct}</span>` : ""}
          </div>
          <div class="rec-card__meta">
            <span class="rec-card__type">${escapeHtml((rec.type || "work").toUpperCase())}</span>
            ${rec.release_year ? `<span>${escapeHtml(String(rec.release_year))}</span>` : ""}
            ${rec.score ? `<span>★ ${Number(rec.score).toFixed(2)}</span>` : ""}
            <code class="mono faint">${escapeHtml(rec.aar_id)}</code>
          </div>
          ${pillsHtml ? `<div class="rec-tags-row">${pillsHtml}</div>` : ""}
          <div style="display:flex;gap:.4rem;align-items:center;margin-top:.45rem;flex-wrap:wrap">
            <button class="btn btn--quiet" type="button" data-add-seed="${escapeHtml(rec.aar_id)}" data-seed-title="${escapeHtml(rec.title)}" style="font-size:.75rem;padding:.2rem .55rem">
              + Add as seed
            </button>
            <button class="btn btn--quiet" type="button" data-seed-work="${escapeHtml(rec.aar_id)}" data-seed-title="${escapeHtml(rec.title)}" style="font-size:.75rem;padding:.2rem .55rem">
              Find similar &rarr;
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  els.results.innerHTML = `${bannerHtml}<div class="rec-list">${cardsHtml}</div>`;
}

/* ---- Autocomplete & Input Resolvers --------------------------------------- */

function renderSeedChips() {
  if (!els.seedChips) return;
  if (state.endpointMode !== "recommend" || !state.selectedSeeds.length) {
    els.seedChips.hidden = true;
    els.seedChips.innerHTML = "";
    return;
  }
  els.seedChips.innerHTML = state.selectedSeeds.map((seed, idx) => `
    <span class="seed-chip" style="display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .55rem;background:var(--paper-raised);border:1px solid var(--sakura-line);border-radius:4px;font-size:.8125rem;color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,0.04)">
      <span class="seed-chip__title" style="font-weight:500;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${escapeHtml(seed.title)}">${escapeHtml(seed.title)}</span>
      <span class="seed-chip__badge mono" style="font-size:.7rem;color:var(--sakura-deep);background:var(--sakura-soft);padding:.1rem .3rem;border-radius:3px">${escapeHtml(seed.workId)}</span>
      <button type="button" class="seed-chip__remove" data-remove-seed="${idx}" aria-label="Remove ${escapeHtml(seed.title)}" style="background:transparent;border:none;color:var(--faint);cursor:pointer;padding:0 .15rem;font-size:1.05rem;line-height:1;display:flex;align-items:center">&times;</button>
    </span>
  `).join("");
  els.seedChips.hidden = false;
}

function addSeedWork(item) {
  if (!item || !item.workId) return;
  if (state.selectedSeeds.some(s => s.workId === item.workId)) return;
  if (state.selectedSeeds.length >= 10) {
    statusNote("warn", "Maximum of 10 seed works supported by API.");
    return;
  }
  state.selectedSeeds.push({
    workId: item.workId,
    title: item.title || item.workId,
    type: item.type || null,
    release_year: item.release_year || null,
  });
  renderSeedChips();
  if (els.input) {
    els.input.value = "";
    els.input.placeholder = "Add another work to blend recommendations…";
    els.input.focus();
  }
  updateResolvedBadge();
  renderPreview();
}

function removeSeedWork(index) {
  state.selectedSeeds.splice(index, 1);
  renderSeedChips();
  if (!state.selectedSeeds.length && els.input) {
    els.input.placeholder = MODE_CONFIG.recommend.placeholder;
  }
  updateResolvedBadge();
  renderPreview();
}

function updateResolvedBadge() {
  if (!els.resolvedBadge) return;
  if (state.endpointMode !== "recommend") {
    els.resolvedBadge.hidden = true;
    if (els.form) els.form.classList.remove("has-resolved-badge");
    return;
  }

  if (state.selectedSeeds.length > 0) {
    els.resolvedBadge.textContent = `✓ ${state.selectedSeeds.length} Seed(s)`;
    els.resolvedBadge.setAttribute("data-badge-kind", "id");
    els.resolvedBadge.hidden = false;
    if (els.form) els.form.classList.add("has-resolved-badge");
    return;
  }

  const val = els.input ? els.input.value.trim() : "";
  const parsed = parseRecommendInput(val);

  if (parsed.kind === "url" || parsed.kind === "id") {
    state.selectedSeedWork = { workId: parsed.workId, title: null };
    els.resolvedBadge.textContent = `✓ ${parsed.label}`;
    els.resolvedBadge.setAttribute("data-badge-kind", parsed.kind);
    els.resolvedBadge.hidden = false;
    if (els.form) els.form.classList.add("has-resolved-badge");
  } else if (state.selectedSeedWork && state.selectedSeedWork.title === val) {
    els.resolvedBadge.textContent = `✓ ID: ${state.selectedSeedWork.workId}`;
    els.resolvedBadge.setAttribute("data-badge-kind", "id");
    els.resolvedBadge.hidden = false;
    if (els.form) els.form.classList.add("has-resolved-badge");
  } else {
    state.selectedSeedWork = null;
    els.resolvedBadge.hidden = true;
    if (els.form) els.form.classList.remove("has-resolved-badge");
  }
}

function closeAutocomplete() {
  if (!els.acMenu) return;
  els.acMenu.hidden = true;
  els.acMenu.innerHTML = "";
  state.acItems = [];
  state.acHighlightIndex = -1;
  if (els.input) els.input.setAttribute("aria-expanded", "false");
}

function renderAutocomplete(results, query) {
  if (!els.acMenu || state.endpointMode !== "recommend") return;
  state.acItems = Array.isArray(results) ? results : [];
  state.acHighlightIndex = state.acItems.length > 0 ? 0 : -1;

  if (state.acItems.length === 0) {
    els.acMenu.innerHTML = `
      <div class="ac-dropdown__header">
        <span>No local catalogue matches for "${escapeHtml(query)}"</span>
      </div>`;
    els.acMenu.hidden = false;
    if (els.input) els.input.setAttribute("aria-expanded", "true");
    return;
  }

  const rowsHtml = state.acItems.map((item, idx) => {
    const title = escapeHtml(item.title || "Untitled");
    const eng = item.title_english && item.title_english !== item.title
      ? escapeHtml(item.title_english)
      : "";
    const type = escapeHtml(item.type || "work");
    const year = item.release_year ? `<span>${escapeHtml(String(item.release_year))}</span>` : "";
    const score = item.score ? `<span>★ ${Number(item.score).toFixed(2)}</span>` : "";
    const cleanAcImg = formatImageUrl(item.image_url);
    const img = cleanAcImg ? escapeHtml(cleanAcImg) : "";

    return `
      <button
        type="button"
        class="ac-item ${idx === 0 ? "is-highlighted" : ""}"
        role="option"
        aria-selected="${idx === 0 ? "true" : "false"}"
        data-ac-index="${idx}"
      >
        ${img
          ? `<img class="ac-item__thumb" src="${img}" alt="" loading="lazy" referrerpolicy="no-referrer">`
          : `<div class="ac-item__thumb" aria-hidden="true"></div>`
        }
        <div class="ac-item__body">
          <div class="ac-item__title">${title}</div>
          ${eng ? `<div class="ac-item__subtitle">${eng}</div>` : ""}
          <div class="ac-item__meta">
            <span class="ac-item__type">${type}</span>
            ${year}
            ${score}
            <span class="ac-item__id">${escapeHtml(item.aar_id)}</span>
          </div>
        </div>
      </button>
    `;
  }).join("");

  els.acMenu.innerHTML = `
    <div class="ac-dropdown__header">
      <span>Select seed work from catalogue</span>
      <span>↑↓ Navigate · Enter Select</span>
    </div>
    ${rowsHtml}
  `;
  els.acMenu.hidden = false;
  if (els.input) els.input.setAttribute("aria-expanded", "true");
}

function selectAutocompleteItem(index) {
  const item = state.acItems[index];
  if (!item) return;

  const seedObj = {
    workId: item.aar_id,
    title: item.title,
    title_english: item.title_english,
    type: item.type,
    release_year: item.release_year
  };

  addSeedWork(seedObj);
  closeAutocomplete();
  runQuery();
}

function syncAutocompleteHighlight() {
  if (!els.acMenu) return;
  els.acMenu.querySelectorAll(".ac-item").forEach((el, idx) => {
    const active = idx === state.acHighlightIndex;
    el.classList.toggle("is-highlighted", active);
    el.setAttribute("aria-selected", String(active));
    if (active) el.scrollIntoView({ block: "nearest" });
  });
}

/* ---- Unconfigured state --------------------------------------------------- */

function renderUnconfigured() {
  statusNote("warn",
    `<strong>Service is currently unavailable.</strong> The search gateway is not reachable. `+
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
  if (state.endpointMode !== "recommend" && !q) {
    els.input && els.input.focus();
    return;
  }
  if (state.endpointMode === "recommend" && !q && !state.selectedSeeds.length) {
    els.input && els.input.focus();
    return;
  }

  state.lastQuery = q;
  closeAutocomplete();
  if (!isConfigured()) { renderUnconfigured(); return; }

  if (state.inflight) state.inflight.abort();
  const ctrl = new AbortController();
  state.inflight = ctrl;
  const timeout = setTimeout(() => ctrl.abort(), 35000);

  setBusy(true);
  renderPreview(q);

  try {
    statusNote("info", `<span class="spinner" aria-hidden="true"></span> Processing request…`);

    if (state.endpointMode === "recommend") {
      let seedIds = state.selectedSeeds.map(s => s.workId);

      // If user typed something in input and hit submit without picking from dropdown:
      if (q && (!state.selectedSeeds.length || !state.selectedSeeds.some(s => s.title === q))) {
        const parsed = parseRecommendInput(q);
        if (parsed.kind === "url" || parsed.kind === "id") {
          addSeedWork({ workId: parsed.workId, title: parsed.label });
          seedIds = state.selectedSeeds.map(s => s.workId);
        } else if (parsed.kind === "query") {
          statusNote("info", `<span class="spinner" aria-hidden="true"></span> Resolving work in catalogue…`);
          const lookup = await searchAutocomplete(parsed.query, { limit: 1, signal: ctrl.signal });
          const topHit = Array.isArray(lookup?.results) && lookup.results[0];
          if (!topHit) {
            renderEmpty();
            statusNote("warn", `<strong>No matching work found.</strong> Could not find an anime or manga in the catalogue matching "${escapeHtml(parsed.query)}". Try an exact title or ID.`);
            return;
          }
          addSeedWork({
            workId: topHit.aar_id,
            title: topHit.title,
            type: topHit.type,
            release_year: topHit.release_year,
          });
          seedIds = state.selectedSeeds.map(s => s.workId);
        }
      }

      if (!seedIds.length) {
        renderEmpty();
        statusNote("warn", "Please enter a valid work ID, source link, or select a work from the catalogue.");
        return;
      }

      seedIds = Array.from(new Set(seedIds));

      statusNote("info", `<span class="spinner" aria-hidden="true"></span> Finding resonant works for ${seedIds.length} seed work(s)…`);
      const data = await recommend(seedIds, { limit: state.limit, signal: ctrl.signal, method: state.httpMethod });
      renderRecommendationResults(data, seedIds.join(", "), state.selectedSeeds);
      return;
    }

    const opts = currentOptions(q);
    const data = state.endpointMode === "ask"
      ? await ask(opts, ctrl.signal)
      : await search(opts, ctrl.signal);
    renderResults(data);
  } catch (err) {
    if ((err && err.name === "AbortError") || ctrl.signal.aborted) {
      return;
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
      `<strong>Authentication error (${err.status}).</strong> Access to the API service was denied. Please verify your API key or contact contact@aarecords.tech. ${retry}`);
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

function renderGuidance() {
  const host = document.querySelector("[data-query-guidance]");
  if (!host) return;
  const g = MODE_GUIDANCE[state.endpointMode] || MODE_GUIDANCE.search;
  host.innerHTML = `
    <div class="guidance-head">
      <svg class="guidance-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <span class="guidance-title">${escapeHtml(g.title)}</span>
    </div>
    <p class="guidance-text">${g.summary}</p>
    <ul class="guidance-tips">
      ${g.tips.map(t => `<li>${t}</li>`).join("")}
    </ul>
  `;
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
      updateModeButtons();
      renderPreview(state.lastQuery);
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
      state.queryBreakdown = false;
      state.retrievalMode = "hybrid";
      state.limit = DEFAULT_LIMIT;
      state.nsfw = false;
      state.minYear = "";
      state.maxYear = "";
      state.minScore = "";
      state.include.clear();

      for (const b of els.methodBtns) {
        const active = (b.getAttribute("data-opt-method") || "GET") === "GET";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeMethod) {
        els.badgeMethod.textContent = "GET";
        els.badgeMethod.className = "badge badge--method badge--get";
      }

      for (const b of els.breakdownBtns) {
        const active = b.getAttribute("data-opt-breakdown") === "true";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeBreakdown) els.badgeBreakdown.textContent = "LLM On";

      for (const b of els.retrievalBtns) {
        const active = (b.getAttribute("data-opt-mode") || "hybrid") === "hybrid";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeMode) els.badgeMode.textContent = "Hybrid";

      if (els.limitSlider) els.limitSlider.value = String(DEFAULT_LIMIT);
      if (els.limitDisplay) els.limitDisplay.textContent = String(DEFAULT_LIMIT);

      for (const b of els.nsfwBtns) {
        const active = b.getAttribute("data-opt-nsfw") === "false";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.badgeNsfw) els.badgeNsfw.textContent = "Safe";

      if (els.minYearInput) els.minYearInput.value = "";
      if (els.maxYearInput) els.maxYearInput.value = "";
      if (els.minScoreInput) els.minScoreInput.value = "";

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

function initAutocompleteListeners() {
  if (!els.input) return;

  els.input.addEventListener("input", () => {
    updateResolvedBadge();
    renderPreview(els.input.value);

    if (state.endpointMode !== "recommend") {
      closeAutocomplete();
      return;
    }

    if (state.acDebounceTimer) clearTimeout(state.acDebounceTimer);
    if (state.acAbortController) state.acAbortController.abort();

    const parsed = parseRecommendInput(els.input.value);
    if (parsed.kind !== "query" || parsed.query.length < 2) {
      closeAutocomplete();
      return;
    }

    // 0ms Instant Local Cache: if already typed before, render immediately without waiting
    const cached = getCachedAutocomplete(parsed.query, { limit: 8 });
    if (cached && cached.results) {
      renderAutocomplete(cached.results, parsed.query);
    }

    state.acDebounceTimer = setTimeout(async () => {
      state.acAbortController = new AbortController();
      try {
        const data = await searchAutocomplete(parsed.query, {
          signal: state.acAbortController.signal,
          limit: 8
        });
        renderAutocomplete(data.results || [], parsed.query);
      } catch (err) {
        if (err.name !== "AbortError") {
          // Keep existing menu if valid
        }
      }
    }, 120);
  });

  els.input.addEventListener("keydown", (e) => {
    if (state.endpointMode !== "recommend" || !els.acMenu || els.acMenu.hidden || state.acItems.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      state.acHighlightIndex = (state.acHighlightIndex + 1) % state.acItems.length;
      syncAutocompleteHighlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      state.acHighlightIndex = (state.acHighlightIndex - 1 + state.acItems.length) % state.acItems.length;
      syncAutocompleteHighlight();
    } else if (e.key === "Enter" && state.acHighlightIndex >= 0) {
      e.preventDefault();
      selectAutocompleteItem(state.acHighlightIndex);
    } else if (e.key === "Escape") {
      closeAutocomplete();
    }
  });

  if (els.acMenu) {
    els.acMenu.addEventListener("mousedown", (e) => {
      const btn = e.target.closest("[data-ac-index]");
      if (!btn) return;
      e.preventDefault();
      const idx = Number(btn.getAttribute("data-ac-index"));
      selectAutocompleteItem(idx);
    });
  }

  document.addEventListener("click", (e) => {
    if (els.form && !els.form.contains(e.target)) {
      closeAutocomplete();
    }
  });
}

function init() {
  initChips();
  initModes();
  initAdvanced();
  initAutocompleteListeners();
  updateModeButtons();
  updateSummaryPill();
  renderPreview(state.lastQuery);
  if (!isConfigured()) renderUnconfigured();

  const urlParams = new URLSearchParams(location.search);
  const modeFromUrl = urlParams.get("mode");
  if (modeFromUrl && MODE_CONFIG[modeFromUrl]) {
    setEndpointMode(modeFromUrl);
  }
  const fromUrl = urlParams.get("q");
  if (fromUrl && els.input) {
    els.input.value = fromUrl;
    renderPreview(fromUrl);
    if (isConfigured()) {
      runQuery(fromUrl);
    } else {
      statusNote("warn",
        `<strong>Service unavailable.</strong> Please try again later or explore the <a href="api.html">API Reference</a>.`);
    }
  }

  if (els.form) {
    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      runQuery(els.input ? els.input.value : "");
    });
  }

  document.addEventListener("click", (e) => {
    // Example query chip
    const ex = e.target.closest("[data-example]");
    if (ex) {
      const text = ex.textContent.trim();
      if (els.input) {
        els.input.value = text;
        els.input.focus();
      }
      updateResolvedBadge();
      renderPreview(text);
      return;
    }

    // Seed Chip Remove click
    const rmSeed = e.target.closest("[data-remove-seed]");
    if (rmSeed) {
      const idx = Number(rmSeed.getAttribute("data-remove-seed"));
      removeSeedWork(idx);
      return;
    }

    // Recommendation card "+ Add as seed" click
    const addSeedBtn = e.target.closest("[data-add-seed]");
    if (addSeedBtn) {
      const id = addSeedBtn.getAttribute("data-add-seed");
      const title = addSeedBtn.getAttribute("data-seed-title") || id;
      addSeedWork({ workId: id, title });
      runQuery();
      return;
    }

    // Recommendation card seed click ("Find similar to this")
    const seedBtn = e.target.closest("[data-seed-work]");
    if (seedBtn) {
      const id = seedBtn.getAttribute("data-seed-work");
      const title = seedBtn.getAttribute("data-seed-title") || id;
      state.selectedSeeds = [{ workId: id, title }];
      renderSeedChips();
      if (els.input) {
        els.input.value = "";
      }
      updateResolvedBadge();
      renderPreview(title);
      runQuery();
      return;
    }

    // Retry button
    const retry = e.target.closest("[data-retry]");
    if (retry) { runQuery(state.lastQuery); return; }

    // Result row accordion toggle
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
