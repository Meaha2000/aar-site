/* ============================================================================
   AAR — API client
   Lightweight, dependency-free wrapper for the API endpoints.
   Supports both GET (query string) and POST (JSON body) contracts.
   ========================================================================= */

import {
  API_KEY,
  API_BASE,
  TUNNEL_BASE,
  FREE_PUBLIC_KEY,
  endpoint,
  isConfigured,
} from "./config.js?v=5";

/** Error carrying an HTTP status so callers can name the recovery. */
export class ApiError extends Error {
  constructor(message, { status = 0, body = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function headers(json) {
  const h = { Accept: "application/json" };
  if (json) h["Content-Type"] = "application/json";
  if (API_KEY) {
    h["x-api-key"] = API_KEY;
  }
  return h;
}

async function request(path, { method = "GET", body = null, signal = null } = {}) {
  if (!isConfigured()) {
    throw new ApiError("No backend configured.", { status: 0 });
  }

  const init = { method, headers: headers(Boolean(body)), signal };
  if (body !== null) init.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(endpoint(path), init);
  } catch (err) {
    if (err && err.name === "AbortError") throw err;
    throw new ApiError("The request could not reach the endpoint.", { status: 0 });
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const detail = (data && (data.detail || data.error || data.message)) || res.statusText;
    throw new ApiError(detail || "The endpoint returned an error.", { status: res.status, body: data });
  }

  return data;
}

/* ---- Serialization helpers ------------------------------------------------ */

export function buildSearchParams(opts) {
  const {
    question = "",
    limit,
    work_types,
    mode,
    query_breakdown,
    nsfw,
    min_year,
    max_year,
    min_score,
    include,
  } = opts;

  const p = new URLSearchParams();
  p.set("q", question);

  if (limit != null && limit !== "") {
    p.set("limit", String(limit));
  }
  if (mode) {
    p.set("mode", mode);
  }
  if (query_breakdown !== undefined && query_breakdown !== null) {
    p.set("query_breakdown", query_breakdown ? "true" : "false");
  }
  if (nsfw) {
    p.set("nsfw", "true");
  }
  if (work_types && work_types.length) {
    p.set("type", work_types.map((t) => t.toLowerCase()).join(","));
  }
  if (min_year != null && min_year !== "") {
    p.set("min_year", String(min_year));
  }
  if (max_year != null && max_year !== "") {
    p.set("max_year", String(max_year));
  }
  if (min_score != null && min_score !== "") {
    p.set("min_score", String(min_score));
  }
  if (include && include.length) {
    p.set("include", include.join(","));
  }

  return p;
}

export function buildSearchPayload(opts) {
  const {
    question = "",
    limit,
    work_types,
    mode,
    query_breakdown,
    nsfw,
    min_year,
    max_year,
    min_score,
    include,
  } = opts;

  const payload = { question };
  if (limit != null && limit !== "") payload.limit = Number(limit);
  if (mode) payload.mode = mode;
  if (query_breakdown !== undefined && query_breakdown !== null) {
    payload.query_breakdown = Boolean(query_breakdown);
  }
  if (nsfw != null) payload.nsfw = Boolean(nsfw);
  if (include && include.length) payload.include = include;

  const scope = {};
  if (work_types && work_types.length) {
    scope.types = work_types.map((t) => t.toLowerCase());
  }
  if (min_year != null && min_year !== "") scope.min_year = Number(min_year);
  if (max_year != null && max_year !== "") scope.max_year = Number(max_year);
  if (min_score != null && min_score !== "") scope.min_score = Number(min_score);

  if (Object.keys(scope).length > 0) payload.scope = scope;

  return payload;
}

/* ---- Endpoints ----------------------------------------------------------- */

/** GET /health — quota-free liveness check against production gateway. */
export async function health(signal) {
  const target = (typeof TUNNEL_BASE === "string" && TUNNEL_BASE.trim().length > 0)
    ? `${TUNNEL_BASE.replace(/\/+$/, "")}/health`
    : endpoint("/health");

  try {
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      return data || { status: "ok" };
    }
    throw new ApiError(`Health probe returned ${res.status}`, { status: res.status });
  } catch (err) {
    if (err && err.name === "AbortError") throw err;
    return request("/health", { signal });
  }
}

/**
 * /search — hybrid retrieval supporting GET and POST methods.
 */
export function search(opts, signal) {
  const method = (opts.method || "GET").toUpperCase();
  if (method === "GET") {
    const params = buildSearchParams(opts);
    return request(`/search?${params.toString()}`, { method: "GET", signal });
  }
  const payload = buildSearchPayload(opts);
  return request("/search", { method: "POST", body: payload, signal });
}

/**
 * /ask — conversational question answering with grounded AI synthesis.
 */
export function ask(opts, signal) {
  const method = (opts.method || "GET").toUpperCase();
  if (method === "GET") {
    const params = buildSearchParams(opts);
    return request(`/ask?${params.toString()}`, { method: "GET", signal });
  }
  const payload = buildSearchPayload(opts);
  return request("/ask", { method: "POST", body: payload, signal });
}

/**
 * /contributions — Submit community additions or metadata corrections.
 */
export async function submitContribution(payload, { signal = null } = {}) {
  try {
    return await request("/contributions", { method: "POST", body: payload, signal });
  } catch (err) {
    if (err && (err.status === 404 || err.status === 0) && TUNNEL_BASE) {
      const tunnelUrl = TUNNEL_BASE.replace(/\/+$/, "") + "/contributions";
      const res = await fetch(tunnelUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-API-Key": FREE_PUBLIC_KEY,
        },
        body: JSON.stringify(payload),
        signal,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new ApiError(data?.detail || "Failed to submit contribution", { status: res.status, body: data });
      }
      return data;
    }
    throw err;
  }
}

/** Backwards-compatible body preview */
export function previewSearchBody(opts) {
  return buildSearchPayload(opts);
}

export function previewAskBody(opts) {
  return buildSearchPayload(opts);
}

/**
 * Parses raw user input in "Recommend Me" mode and classifies it into:
 *  - { kind: 'url', workId: 'mal:5114', label: 'MAL → mal:5114' }
 *  - { kind: 'id',  workId: 'aar_30914', label: 'ID: aar_30914' }
 *  - { kind: 'query', query: 'frieren', workId: null, label: '' }
 */
export function parseRecommendInput(raw) {
  const input = String(raw || '').trim();
  if (!input) return { kind: 'empty', workId: null, label: '' };

  // 1. Source URL Extraction (MyAnimeList, AniList, VNDB)
  const malMatch = input.match(/(?:https?:\/\/)?(?:www\.)?myanimelist\.net\/(?:anime|manga)\/(\d+)/i);
  if (malMatch) {
    return { kind: 'url', workId: `mal:${malMatch[1]}`, label: `MAL → mal:${malMatch[1]}` };
  }

  const alMatch = input.match(/(?:https?:\/\/)?(?:www\.)?anilist\.co\/(?:anime|manga)\/(\d+)/i);
  if (alMatch) {
    return { kind: 'url', workId: `anilist:${alMatch[1]}`, label: `AniList → anilist:${alMatch[1]}` };
  }

  const vndbUrlMatch = input.match(/(?:https?:\/\/)?(?:www\.)?vndb\.org\/(v\d+)/i);
  if (vndbUrlMatch) {
    const vid = vndbUrlMatch[1].toLowerCase();
    return { kind: 'url', workId: `vndb:${vid}`, label: `VNDB → vndb:${vid}` };
  }

  // 2. Direct ID Formats:
  //    - aar_30914 or pure numeric 30914
  //    - work:anime:mal_1_al_1
  //    - mal:5114 | anilist:16498 | vndb:v17 | v17
  if (/^aar_\d+$/i.test(input)) {
    const id = input.toLowerCase();
    return { kind: 'id', workId: id, label: `ID: ${id}` };
  }
  if (/^\d+$/.test(input)) {
    const id = `aar_${input}`;
    return { kind: 'id', workId: id, label: `ID: ${id}` };
  }
  if (/^work:[a-z0-9_:.-]+$/i.test(input)) {
    const id = input.toLowerCase();
    return { kind: 'id', workId: id, label: `URI: ${id}` };
  }
  if (/^(mal|anilist|vndb):[a-z0-9_]+$/i.test(input)) {
    const id = input.toLowerCase();
    return { kind: 'id', workId: id, label: `ID: ${id}` };
  }
  if (/^v\d+$/i.test(input)) {
    const id = `vndb:${input.toLowerCase()}`;
    return { kind: 'id', workId: id, label: `ID: ${id}` };
  }

  // 3. Generic Title Search (Requires Lexical Autocomplete)
  return { kind: 'query', workId: null, query: input, label: '' };
}

/**
 * Local DB Autocomplete via Fast Lexical Search
 * GET /search?q={query}&mode=lexical&limit=6
 */
export function searchAutocomplete(query, { limit = 8, signal = null, type = null } = {}) {
  const enc = encodeURIComponent(String(query || '').trim());
  let url = `/autocomplete?q=${enc}&limit=${limit}`;
  if (type) url += `&type=${encodeURIComponent(type)}`;
  return request(url, { method: "GET", signal });
}

/**
 * Recommendations Endpoint
 * GET /recommend/{work_id}?limit={limit}
 * or POST /recommend with JSON body
 */
export function recommend(workIds, { limit = 8, signal = null, method = "GET", targetScope = null } = {}) {
  const isMulti = Array.isArray(workIds) && workIds.length > 1;
  const m = isMulti ? "POST" : (method || "GET").toUpperCase();
  if (m === "POST") {
    const seeds = Array.isArray(workIds) ? workIds : [workIds];
    const body = { seed_work_ids: seeds, limit };
    if (targetScope) body.target_scope = targetScope;
    return request("/recommend", {
      method: "POST",
      body,
      signal,
    });
  }
  const singleId = Array.isArray(workIds) ? workIds[0] : workIds;
  const enc = encodeURIComponent(String(singleId || '').trim());
  let url = `/recommend/${enc}?limit=${limit}`;
  if (targetScope) url += `&target_scope=${encodeURIComponent(targetScope)}`;
  return request(url, { method: "GET", signal });
}
