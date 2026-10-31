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
  buildAdvancedSearchPayload,
  runAdvancedSearch,
  buildAdvancedRecommendPayload,
  runAdvancedRecommend,
  fetchArcIndex,
  ApiError
} from "./api.js?v=16";
import { API_BASE, API_KEY, DEFAULT_LIMIT, isConfigured, endpoint }
  from "./config.js?v=16";

/* ---- DOM ------------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel);

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
  requiredIdsInput: $("[data-opt-required-ids]"),
  includeChips:   Array.from(document.querySelectorAll("[data-opt-include]")),
  resetBtns:      Array.from(document.querySelectorAll("[data-reset-advanced]")),
  // Lore Advanced Controls
  loreControls:      $("[data-lore-controls]"),
  toggleLoreBtn:     $("[data-toggle-lore-panel]"),
  lorePanel:         $("[data-lore-panel]"),
  loreSummary:       $("[data-lore-summary]"),
  resetLoreBtn:      $("[data-reset-lore]"),
  loreGranSelect:    $("[data-lore-granularity-select]"),
  loreSearchFilters: $("[data-lore-search-filters]"),
  loreRecFilters:    $("[data-lore-rec-filters]"),
  loreGranChips:     Array.from(document.querySelectorAll("[data-lore-granularity]")),
  advWorkId:         $("[data-adv-work-id]"),
  loreWorkChip:      $("[data-lore-work-chip]"),
  loreWorkAc:        $("[data-lore-work-ac]"),
  loadWorkArcsBtn:   $("[data-load-work-arcs]"),
  advArcName:        $("[data-adv-arc-name]"),
  advArcDatalist:    $("[data-adv-arc-datalist]"),
  advArcStatus:      $("[data-adv-arc-status]"),
  arcLockBadge:      $("[data-arc-lock-badge]"),
  advCharacter:      $("[data-adv-character]"),
  advConcept:        $("[data-adv-concept]"),
  advLocation:       $("[data-adv-location]"),
  advEpExact:        $("[data-adv-ep-exact]"),
  advEpMin:          $("[data-adv-ep-min]"),
  advEpMax:          $("[data-adv-ep-max]"),
  advPosIds:         $("[data-adv-pos-ids]"),
  advNegQueries:     $("[data-adv-neg-queries]"),
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
  advanced_search: {
    placeholder: "Describe a specific scene, battle, dialogue, episode event, or story arc…",
    buttonText: () => "Search Scenes & Arcs",
    modeText: () => "Advanced Scene Search",
  },
  advanced_recommend: {
    placeholder: "Describe a scene, episode, or story arc vibe to find resonant counterparts…",
    buttonText: () => "Recommend Scenes / Arcs",
    modeText: () => "Advanced Recommend",
  },
  lore_ask: {
    placeholder: "Ask a detailed lore question answered with exact episode & timestamp citations…",
    buttonText: () => "Ask Lore AI",
    modeText: () => "Lore Ask AI",
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
      "Add up to 100 seed works to blend distinct tropes and genres",
      "Results are ranked by shared narrative tags and semantic similarity"
    ]
  },
  advanced_search: {
    title: "How Advanced Scene, Episode & Arc Search Works (Anime Only · 7,538 Anime · 102,574 Episodes)",
    summary: "Currently active for <strong>Anime only</strong> across <strong>7,538 anime works</strong> and <strong>102,574 episodes</strong> (<strong>764,823 timestamped scenes</strong> and <strong>10,576 official story arcs</strong>). Pinpoint exact moments with start/end timestamps, episode breakdowns, or arc pre-filtering across all 10 external ID formats.",
    tips: [
      "Scene search with timestamp: <em>\"Whitebeard dies standing up declaring the One Piece is real\"</em> with Work ID <code>imdb:tt0388629</code> and Arc <code>Marineford</code>",
      "Story Arc filter requires passing a Work ID in any of the 10 supported formats (<code>mal:21</code>, <code>imdb:tt0388629</code>, <code>al:21</code>, <code>anidb:8550</code>, <code>ap:one-piece</code>)",
      "Switch Granularity between <strong>Scene (with Timestamp)</strong>, <strong>Full Episode</strong>, and <strong>Story Arc</strong>"
    ]
  },
  advanced_recommend: {
    title: "How Granular Scene, Episode & Arc Recommendation Works (Anime Only · 7,538 Anime · 102,574 Episodes)",
    summary: "Currently active for <strong>Anime only</strong> across <strong>7,538 anime works</strong> and <strong>102,574 episodes</strong>. Uses Rocchio vector steering across positive and negative seeds at the <strong>Scene</strong>, <strong>Episode</strong>, or <strong>Story Arc</strong> level while isolating same-franchise duplicates.",
    tips: [
      "Describe a target scene or pass exact seed IDs like <code>mal:21#ep=485&amp;scene=4</code> or <code>mal:11061#ep=131</code>",
      "Add Negative / Exclude prompts (e.g. <em>\"lighthearted school comedy\"</em>) to steer vectors away from unwanted tones",
      "Switch Granularity to <strong>Story Arc</strong> to find arcs across other anime structurally resonant with <code>Marineford</code> or <code>Chimera Ant</code>"
    ]
  },
  lore_ask: {
    title: "How Grounded Lore Ask AI Works (Anime Only · 7,538 Anime · 102,574 Episodes)",
    summary: "Currently active for <strong>Anime only</strong> across <strong>7,538 anime works</strong> and <strong>102,574 episodes</strong>. Retrieves exact timestamped scenes, characters, and dialogue quotes from the Lore Engine and synthesizes a live LLM answer cited by episode and second.",
    tips: [
      "Ask specific episode/event questions: <em>\"What happens when Kenshiro fights Raoh in episode 108?\"</em>",
      "Combine with Work ID, Story Arc, or Character filters below to scope the AI strictly to a single arc or character",
      "Unlike Search and Recommend modes, <strong>Lore Ask AI</strong> invokes a live LLM to reason over retrieved scenes"
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
  requiredIds: "",              // "" or string
  include: new Set(),           // "staff", "characters", "relations"
  isAdvancedOpen: false,
  isLoreOpen: false,
  loreGranularity: "scene",
  loreSelectedWork: null,       // { workId, title, mal_id, release_year }
  loreWorkAcDebounce: null,
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

function currentLoreOptions(question) {
  return {
    endpointMode: state.endpointMode,
    question: question || "",
    granularity: state.loreGranularity || "scene",
    limit: state.limit,
    useReranker: true,
    workId: els.advWorkId ? els.advWorkId.value.trim() : "",
    arcName: els.advArcName ? els.advArcName.value.trim() : "",
    character: els.advCharacter ? els.advCharacter.value.trim() : "",
    concept: els.advConcept ? els.advConcept.value.trim() : "",
    location: els.advLocation ? els.advLocation.value.trim() : "",
    episodeNumber: els.advEpExact && els.advEpExact.value !== "" ? els.advEpExact.value : null,
    minEpisode: els.advEpMin && els.advEpMin.value !== "" ? els.advEpMin.value : null,
    maxEpisode: els.advEpMax && els.advEpMax.value !== "" ? els.advEpMax.value : null,
    positiveIds: els.advPosIds && els.advPosIds.value.trim()
      ? els.advPosIds.value.split(",").map(s => s.trim()).filter(Boolean)
      : [],
    positiveQueries: question ? [question] : [],
    negativeQueries: els.advNegQueries && els.advNegQueries.value.trim()
      ? els.advNegQueries.value.split(",").map(s => s.trim()).filter(Boolean)
      : [],
  };
}

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
    required_ids: state.requiredIds,
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
  if (state.requiredIds) {
    parts.push(`IDs: ${state.requiredIds}`);
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

  const isLoreMode = state.endpointMode === "advanced_search" || state.endpointMode === "advanced_recommend" || state.endpointMode === "lore_ask";
  if (els.loreControls) {
    els.loreControls.hidden = !isLoreMode;
  }
  if (els.lorePanel) {
    els.lorePanel.hidden = !(isLoreMode && state.isLoreOpen);
  }
  if (els.loreSearchFilters) {
    els.loreSearchFilters.hidden = !(state.endpointMode === "advanced_search" || state.endpointMode === "lore_ask");
  }
  if (els.loreRecFilters) {
    els.loreRecFilters.hidden = state.endpointMode !== "advanced_recommend";
  }

  renderGuidance();
}

/** Render the request the demo would send — pre-flight preview. */
function renderPreview(question) {
  if (!els.preview) return;
  const baseUrl = "https://api.aarecords.tech";
  const method = state.httpMethod;

  if (state.endpointMode === "advanced_search" || state.endpointMode === "lore_ask" || state.endpointMode === "advanced_recommend") {
    const lopts = currentLoreOptions(question || "<your query>");
    const path = state.endpointMode === "advanced_recommend"
      ? "/advanced_recommend"
      : (state.endpointMode === "lore_ask" ? "/lore_ask" : "/advanced_search");
    const body = state.endpointMode === "advanced_recommend"
      ? buildAdvancedRecommendPayload(lopts)
      : buildAdvancedSearchPayload(lopts);
    const displayUrl = `${baseUrl}${path}`;
    const jsonStr = JSON.stringify(body, null, 2);
    const curlCmd = `curl -X POST "${displayUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: aar_free_access" \\
  -d '${JSON.stringify(body)}'`;

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
    return;
  }

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

    const targetScope = state.types.size ? Array.from(state.types).map(t => t.toLowerCase()).join(",") : null;
    if (effectiveMethod === "POST") {
      displayUrl = `${baseUrl}/recommend`;
      const bodyObj = { seed_work_ids: seeds, limit: state.limit };
      if (targetScope) bodyObj.target_scope = targetScope;
      if (state.requiredIds) bodyObj.required_ids = state.requiredIds.split(/[,+\s]+/).filter(Boolean);
      const bodyJson = JSON.stringify(bodyObj);
      curlCmd = `curl -X POST "${displayUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: aar_free_access" \\
  -d '${bodyJson}'`;
    } else {
      displayUrl = `${baseUrl}/recommend/${encodeURIComponent(seeds[0])}?limit=${state.limit}`;
      if (targetScope) displayUrl += `&target_scope=${encodeURIComponent(targetScope)}`;
      if (state.requiredIds) displayUrl += `&required_ids=${encodeURIComponent(state.requiredIds)}`;
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
  if (state.selectedSeeds.length >= 100) {
    statusNote("warn", "Maximum of 100 seed works supported by API.");
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
          ? `<img class="ac-item__thumb" src="${img}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.style.display='none';">`
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
  const hasAdvPosIds = state.endpointMode === "advanced_recommend" && els.advPosIds && els.advPosIds.value.trim();
  if (state.endpointMode !== "recommend" && !hasAdvPosIds && !q) {
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
      const targetScope = state.types.size ? Array.from(state.types).map(t => t.toLowerCase()).join(",") : null;
      const data = await recommend(seedIds, { limit: state.limit, targetScope, requiredIds: state.requiredIds, signal: ctrl.signal, method: state.httpMethod });
      renderRecommendationResults(data, seedIds.join(", "), state.selectedSeeds);
      return;
    }

    if (state.endpointMode === "advanced_search" || state.endpointMode === "lore_ask") {
      const lopts = currentLoreOptions(q);
      if ((lopts.arcName || lopts.arcId) && !lopts.workId) {
        statusNote("warn", "<strong>Work ID Required for Story Arc Filter.</strong> Please specify the Work ID (e.g. <code>mal:21</code>, <code>imdb:tt0388629</code>, or <code>al:21</code>) when filtering by an arc.");
        return;
      }
      const data = await runAdvancedSearch(lopts, { signal: ctrl.signal });
      renderLoreResults(data, lopts);
      return;
    }

    if (state.endpointMode === "advanced_recommend") {
      const lopts = currentLoreOptions(q);
      const data = await runAdvancedRecommend(lopts, { signal: ctrl.signal });
      renderLoreResults(data, lopts);
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
  if (els.requiredIdsInput) {
    els.requiredIdsInput.addEventListener("input", () => {
      state.requiredIds = els.requiredIdsInput.value.trim();
      updateActiveCount();
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
      state.requiredIds = "";
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
      if (els.requiredIdsInput) els.requiredIdsInput.value = "";

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
  initLoreControls();
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


function updateLoreSummaryPill() {
  if (!els.loreSummary) return;
  const granMap = {
    scene: "Scene (with Timestamp)",
    episode: "Full Episode",
    arc: "Story Arc"
  };
  const parts = [`Unit: ${granMap[state.loreGranularity] || "Scene"}`];
  const wid = els.advWorkId ? els.advWorkId.value.trim() : "";
  if (state.loreSelectedWork && state.loreSelectedWork.title) {
    parts.push(`Work: ${state.loreSelectedWork.title}`);
  } else if (wid) {
    parts.push(`Work: ${wid}`);
  } else {
    parts.push("All 7,538 Anime");
  }
  if (els.advArcName && els.advArcName.value.trim()) {
    parts.push(`Arc: ${els.advArcName.value.trim()}`);
  }
  if (els.advCharacter && els.advCharacter.value.trim()) {
    parts.push(`Char: ${els.advCharacter.value.trim()}`);
  }
  if (els.advEpExact && els.advEpExact.value !== "") {
    parts.push(`Ep ${els.advEpExact.value}`);
  } else if ((els.advEpMin && els.advEpMin.value !== "") || (els.advEpMax && els.advEpMax.value !== "")) {
    parts.push(`Ep ${els.advEpMin?.value || "1"}–${els.advEpMax?.value || "∞"}`);
  }
  els.loreSummary.textContent = parts.join(" · ");
}

function renderLoreResults(data, lopts) {
  statusNote("", "");
  if (!els.results) return;

  const hits = Array.isArray(data?.results) ? data.results : (Array.isArray(data?.sources) ? data.sources : []);
  const elapsed = data?.elapsed_ms ? `${Math.round(data.elapsed_ms)} ms` : "";
  const granLabel = (data?.granularity || lopts.granularity || "scene").toUpperCase();

  if (els.resultsHd) {
    els.resultsHd.hidden = false;
    els.resultsHd.innerHTML = `
      <div class="results-bar">
        <span><strong>${hits.length}</strong> ${escapeHtml(granLabel)} records retrieved</span>
        <span class="faint">${elapsed ? `· ${escapeHtml(elapsed)}` : ""} · Anime Lore Engine (7,538 Anime · 102,574 Episodes)</span>
      </div>`;
  }

  let answerHtml = "";
  if (data?.answer) {
    answerHtml = `
      <section class="answer-card" style="margin-bottom:var(--space-6);padding:var(--space-5);border:1px solid var(--rule-strong);border-left:3px solid var(--sakura-deep);background:var(--paper-deep)">
        <div class="micro" style="color:var(--sakura-deep);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem">Grounded Lore AI Synthesis · ${escapeHtml(data.model || "LLM")}</div>
        <div style="line-height:1.7;white-space:pre-wrap">${escapeHtml(data.answer)}</div>
      </section>`;
  }

  if (!hits.length && !answerHtml) {
    renderEmpty();
    return;
  }

  const rowsHtml = hits.map((item, idx) => {
    const title = escapeHtml(item.work_title || item.title_english || item.title || "Untitled Anime");
    const fmtEp = (n) => (n != null && n !== "") ? (Number.isInteger(Number(n)) ? String(Number(n)) : String(n)) : "";
    const epNum = item.episode_number != null ? `Episode ${fmtEp(item.episode_number)}` : "";
    const epTitle = item.episode_title ? escapeHtml(item.episode_title) : "";
    const sceneNum = item.scene_number != null ? `Scene ${item.scene_number}` : "";
    const ts = item.timestamp_range ? escapeHtml(item.timestamp_range) : "";
    const arcName = item.arc_name ? escapeHtml(item.arc_name) : "";
    const sagaName = item.saga_name ? escapeHtml(item.saga_name) : "";
    const arcRange = (item.arc_start_episode != null && item.arc_end_episode != null)
      ? `Ep ${fmtEp(item.arc_start_episode)}–${fmtEp(item.arc_end_episode)}`
      : ((item.start_episode != null && item.end_episode != null) ? `Ep ${fmtEp(item.start_episode)}–${fmtEp(item.end_episode)}` : "");

    const score = typeof item.score === "number" ? item.score.toFixed(3) : (typeof item.rerank_score === "number" ? item.rerank_score.toFixed(3) : "—");
    const rawSum = String(item.scene_summary || item.episode_summary || item.arc_summary || item.summary || "").replace(/\*\*(.+?)\*\*/g, "$1");
    const summary = escapeHtml(rawSum);
    const location = item.location ? escapeHtml(item.location) : "";
    const malBadge = item.mal_id ? `mal:${item.mal_id}` : (item.aar_id ? `aar:${item.aar_id}` : "");

    const chars = Array.isArray(item.characters) && item.characters.length
      ? item.characters.map(c => escapeHtml(typeof c === "object" && c !== null ? (c.name || c.character || "") : String(c))).filter(Boolean).join(", ")
      : "";
    const concepts = Array.isArray(item.concepts) && item.concepts.length
      ? item.concepts.map(c => {
          const txt = typeof c === "object" && c !== null ? (c.name || c.concept || "") : String(c);
          return txt ? `<span class="badge badge--quiet" style="font-size:.7rem;margin-right:.3rem">${escapeHtml(txt)}</span>` : "";
        }).join("")
      : "";
    const quotes = Array.isArray(item.quotes) && item.quotes.length
      ? item.quotes.map(q => {
          if (typeof q === "object" && q !== null) {
            const qText = escapeHtml(String(q.quote || q.text || "").replace(/\*\*(.+?)\*\*/g, "$1"));
            const qSpeaker = q.speaker ? `<strong style="font-style:normal;color:var(--ink)">${escapeHtml(String(q.speaker))}:</strong> ` : "";
            return qText ? `<blockquote style="margin:.35rem 0;padding-left:.65rem;border-left:2px solid var(--rule-strong);font-style:italic" class="faint">${qSpeaker}"${qText}"</blockquote>` : "";
          }
          return `<blockquote style="margin:.35rem 0;padding-left:.65rem;border-left:2px solid var(--rule-strong);font-style:italic" class="faint">"${escapeHtml(String(q))}"</blockquote>`;
        }).join("")
      : "";

    // Sub-scenes table when result is an Episode or Story Arc
    const subScenes = Array.isArray(item.scenes) && item.scenes.length
      ? `<div class="lore-meta-line" style="flex-direction:column;gap:.25rem;margin-top:.55rem">
           <strong style="text-transform:uppercase;letter-spacing:.05em;font-size:.68rem;color:var(--sakura-deep)">Key Timed Scenes in this ${item.arc_id && !item.episode_number ? "Arc" : "Episode"}:</strong>
           ${item.scenes.slice(0, 4).map(sc => `
             <div style="font-family:var(--serif);font-size:.82rem;color:var(--ink-soft)">
               <span class="mono" style="font-size:.72rem;color:var(--ink);font-weight:600">${sc.episode_number != null ? `Ep ${sc.episode_number} · ` : ""}Scene ${sc.scene_number ?? "?"} [${escapeHtml(sc.timestamp_range || "0:00")}]</span> — ${escapeHtml(sc.scene_summary || "")}
             </div>
           `).join("")}
         </div>`
      : "";

    return `
      <article class="index-row">
        <div class="index-row__main" style="padding:var(--space-4) 0">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap;margin-bottom:.45rem">
            <div>
              <span class="micro faint" style="margin-right:.5rem">#${idx + 1}</span>
              <strong style="font-size:1.05rem;color:var(--ink)">${title}</strong>
              ${arcName ? `<span class="badge" style="margin-left:.45rem;border-color:var(--sakura-deep);color:var(--sakura-deep)">Arc: ${arcName}${arcRange ? ` (${escapeHtml(arcRange)})` : ""}</span>` : (arcRange ? `<span class="badge badge--quiet" style="margin-left:.45rem">${escapeHtml(arcRange)}</span>` : "")}
              ${epNum ? `<span class="badge badge--sakura" style="margin-left:.35rem">${escapeHtml(epNum)}${epTitle ? `: ${epTitle}` : ""}</span>` : ""}
              ${sceneNum ? `<span class="badge badge--quiet" style="margin-left:.3rem">${escapeHtml(sceneNum)}</span>` : ""}
              ${ts ? `<span class="badge" style="margin-left:.3rem;font-family:var(--mono);font-weight:700">${ts}</span>` : ""}
            </div>
            <div class="micro faint" style="font-family:var(--mono)">
              ${malBadge ? `<span>${escapeHtml(malBadge)}</span> · ` : ""}<span>Score ${score}</span>
            </div>
          </div>

          <div class="lore-meta-line" style="margin-top:0;margin-bottom:.45rem;border-top:none;padding-top:0">
            ${arcName ? `<span><strong>Story Arc:</strong> ${arcName}${sagaName ? ` (${sagaName})` : ""}${arcRange ? ` [${escapeHtml(arcRange)}]` : ""}</span>` : `<span><strong>Story Arc:</strong> Standalone / Main Run</span>`}
            ${epNum ? `<span>· <strong>Episode:</strong> ${escapeHtml(epNum)}${epTitle ? ` — "${epTitle}"` : ""}</span>` : ""}
            ${sceneNum || ts ? `<span>· <strong>Scene &amp; Time:</strong> ${escapeHtml(sceneNum || "Scene")} (${ts || "Full"})</span>` : ""}
          </div>

          <div class="passage" style="margin-bottom:var(--space-2);border-left:2px solid var(--sakura-deep);padding:.55rem .85rem;background:var(--paper-deep)">
            <p style="margin:0;line-height:1.6">${summary}</p>
            ${quotes}
          </div>

          ${chars ? `<div class="micro" style="margin-top:.4rem"><strong style="color:var(--ink)">Characters:</strong> <span class="faint">${chars}</span></div>` : ""}
          ${location ? `<div class="micro" style="margin-top:.25rem"><strong style="color:var(--ink)">Location:</strong> <span class="faint">${location}</span></div>` : ""}
          ${concepts ? `<div style="margin-top:.4rem">${concepts}</div>` : ""}
          ${subScenes}
        </div>
      </article>`;
  }).join("");

  els.results.innerHTML = answerHtml + `<div class="ledger">${rowsHtml}</div>`;
}

async function autoLoadArcsForWork(wid, displayTitle) {
  if (!wid) return;
  try {
    if (els.advArcStatus) els.advArcStatus.textContent = "Loading story arcs…";
    const data = await fetchArcIndex(wid);
    const arcs = Array.isArray(data?.arcs) ? data.arcs : [];
    if (els.advArcDatalist) {
      els.advArcDatalist.innerHTML = arcs.map(a =>
        `<option value="${escapeHtml(a.arc_name)}">Ep ${a.start_episode}–${a.end_episode} (${escapeHtml(a.arc_id)})</option>`
      ).join("");
    }
    if (els.arcLockBadge) {
      els.arcLockBadge.textContent = arcs.length ? `${arcs.length} Arcs Ready` : "Work Linked";
    }
    if (els.advArcStatus) {
      els.advArcStatus.textContent = arcs.length
        ? `Loaded ${arcs.length} arcs for ${data.title || displayTitle || wid}. Click or type in Story Arc above.`
        : `No multi-episode arcs indexed for ${displayTitle || wid}.`;
    }
  } catch (e) {
    if (els.advArcStatus) els.advArcStatus.textContent = `Could not load arcs for "${wid}".`;
  }
}

function selectSingleLoreWork(work) {
  let workId = "";
  if (work.mal_id) {
    workId = `mal:${work.mal_id}`;
  } else if (work.work_id) {
    workId = String(work.work_id).trim();
  } else if (work.aar_id != null) {
    const cleanAar = String(work.aar_id).trim().replace(/^aar_/i, "");
    workId = `aar:${cleanAar}`;
  }
  const title = work.title || work.title_english || work.title_romaji || workId;
  state.loreSelectedWork = {
    workId,
    title,
    release_year: work.release_year || work.year || null
  };
  if (els.advWorkId) {
    els.advWorkId.value = workId;
    els.advWorkId.hidden = true;
  }
  if (els.loreWorkAc) {
    els.loreWorkAc.hidden = true;
  }
  if (els.loreWorkChip) {
    els.loreWorkChip.hidden = false;
    els.loreWorkChip.innerHTML = `
      <div style="min-width:0;overflow:hidden">
        <span class="lore-work-chip__title">${escapeHtml(title)}</span>
        <span class="lore-work-chip__id">${escapeHtml(workId)}</span>
      </div>
      <button type="button" class="lore-work-chip__clear" data-clear-lore-work title="Remove selected anime" aria-label="Remove selected anime">&times;</button>
    `;
    const clearBtn = els.loreWorkChip.querySelector("[data-clear-lore-work]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.loreSelectedWork = null;
        if (els.advWorkId) {
          els.advWorkId.value = "";
          els.advWorkId.hidden = false;
          els.advWorkId.focus();
        }
        els.loreWorkChip.hidden = true;
        if (els.advArcDatalist) els.advArcDatalist.innerHTML = "";
        if (els.advArcName) els.advArcName.value = "";
        if (els.arcLockBadge) els.arcLockBadge.textContent = "Requires Work ID";
        if (els.advArcStatus) els.advArcStatus.textContent = "Pre-filters retrieval to the exact episode range of the arc.";
        updateLoreSummaryPill();
        renderPreview(state.lastQuery);
      });
    }
  }
  updateLoreSummaryPill();
  renderPreview(state.lastQuery);
  autoLoadArcsForWork(workId, title);
}

function initLoreControls() {
  // Collapsible drawer toggle
  if (els.toggleLoreBtn && els.lorePanel) {
    els.toggleLoreBtn.addEventListener("click", () => {
      state.isLoreOpen = !state.isLoreOpen;
      els.toggleLoreBtn.setAttribute("aria-expanded", String(state.isLoreOpen));
      els.lorePanel.hidden = !state.isLoreOpen;
    });
  }

  // Reset lore filters button
  if (els.resetLoreBtn) {
    els.resetLoreBtn.addEventListener("click", () => {
      state.loreGranularity = "scene";
      state.loreSelectedWork = null;
      if (els.loreGranSelect) els.loreGranSelect.value = "scene";
      for (const b of els.loreGranChips) {
        const active = b.getAttribute("data-lore-granularity") === "scene";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      if (els.advWorkId) {
        els.advWorkId.value = "";
        els.advWorkId.hidden = false;
      }
      if (els.loreWorkChip) els.loreWorkChip.hidden = true;
      if (els.loreWorkAc) els.loreWorkAc.hidden = true;
      for (const inp of [els.advArcName, els.advCharacter, els.advConcept, els.advLocation, els.advEpExact, els.advEpMin, els.advEpMax, els.advPosIds, els.advNegQueries]) {
        if (inp) inp.value = "";
      }
      if (els.advArcDatalist) els.advArcDatalist.innerHTML = "";
      if (els.arcLockBadge) els.arcLockBadge.textContent = "Requires Work ID";
      updateLoreSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Dropdown select for granularity
  if (els.loreGranSelect) {
    els.loreGranSelect.addEventListener("change", () => {
      state.loreGranularity = els.loreGranSelect.value || "scene";
      for (const b of els.loreGranChips) {
        const active = b.getAttribute("data-lore-granularity") === state.loreGranularity;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      updateLoreSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  for (const btn of els.loreGranChips) {
    btn.addEventListener("click", () => {
      state.loreGranularity = btn.getAttribute("data-lore-granularity") || "scene";
      if (els.loreGranSelect) els.loreGranSelect.value = state.loreGranularity;
      for (const b of els.loreGranChips) {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      updateLoreSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  // Single-Work Autocomplete on advWorkId input
  if (els.advWorkId && els.loreWorkAc) {
    els.advWorkId.addEventListener("input", () => {
      const raw = els.advWorkId.value.trim();
      if (els.arcLockBadge) {
        els.arcLockBadge.textContent = raw ? "Work ID Linked" : "Requires Work ID";
      }
      updateLoreSummaryPill();
      renderPreview(state.lastQuery);

      if (state.loreWorkAcDebounce) clearTimeout(state.loreWorkAcDebounce);
      if (!raw || raw.length < 2 || /^(mal|al|anilist|imdb|tvdb|tmdb|kitsu|anidb|ap|aar|work)[_:]/i.test(raw)) {
        els.loreWorkAc.hidden = true;
        return;
      }
      state.loreWorkAcDebounce = setTimeout(async () => {
        try {
          const data = await searchAutocomplete(raw, { limit: 10 });
          const rawList = Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.suggestions)
              ? data.suggestions
              : Array.isArray(data) ? data : [];
          const items = rawList.filter(w => {
            const wid = String(w.work_id || "");
            if (wid.startsWith("work:") && !wid.startsWith("work:anime:")) return false;
            return true;
          }).slice(0, 8);
          if (!items.length) {
            els.loreWorkAc.hidden = true;
            return;
          }
          els.loreWorkAc.innerHTML = items.map((item, idx) => {
            const title = escapeHtml(item.title || "Untitled");
            const year = (item.release_year || item.year) ? escapeHtml(String(item.release_year || item.year)) : "";
            const badgeId = item.aar_id ? String(item.aar_id) : (item.work_id || "");
            return `
              <button type="button" class="ac-item" role="option" data-lore-ac-idx="${idx}">
                <div class="ac-item__body">
                  <div class="ac-item__title">${title}</div>
                  <div class="ac-item__meta">
                    <span class="ac-type">ANIME</span>
                    ${year ? `<span>${year}</span>` : ""}
                    <span class="mono">${escapeHtml(badgeId)}</span>
                  </div>
                </div>
              </button>`;
          }).join("");
          els.loreWorkAc.hidden = false;

          els.loreWorkAc.querySelectorAll("[data-lore-ac-idx]").forEach(row => {
            row.addEventListener("mousedown", (ev) => {
              ev.preventDefault();
              const idx = Number(row.getAttribute("data-lore-ac-idx"));
              if (items[idx]) selectSingleLoreWork(items[idx]);
            });
          });
        } catch (err) {
          els.loreWorkAc.hidden = true;
        }
      }, 160);
    });

    els.advWorkId.addEventListener("blur", () => {
      setTimeout(() => {
        if (els.loreWorkAc) els.loreWorkAc.hidden = true;
      }, 180);
    });
  }

  const filterInputs = [
    els.advArcName, els.advCharacter, els.advConcept,
    els.advLocation, els.advEpExact, els.advEpMin, els.advEpMax,
    els.advPosIds, els.advNegQueries
  ].filter(Boolean);

  for (const inp of filterInputs) {
    inp.addEventListener("input", () => {
      updateLoreSummaryPill();
      renderPreview(state.lastQuery);
    });
  }

  if (els.loadWorkArcsBtn && els.advWorkId) {
    els.loadWorkArcsBtn.addEventListener("click", async () => {
      const wid = els.advWorkId.value.trim();
      if (!wid) {
        if (els.advArcStatus) els.advArcStatus.textContent = "Search an anime title or enter a Work ID first to load its story arcs.";
        els.advWorkId.hidden = false;
        els.advWorkId.focus();
        return;
      }
      await autoLoadArcsForWork(wid);
    });
  }

  updateLoreSummaryPill();
}
