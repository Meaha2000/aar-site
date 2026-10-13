/* ============================================================================
   AAR — API client
   Lightweight, dependency-free wrapper for the API endpoints.
   ========================================================================= */

import { API_KEY, RAPIDAPI_HOST, endpoint, isConfigured } from "./config.js?v=2";

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
    h["X-RapidAPI-Host"] = RAPIDAPI_HOST;
    h["X-RapidAPI-Key"] = API_KEY;
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
  if (text) { try { data = JSON.parse(text); } catch { data = null; } }

  if (!res.ok) {
    const detail = (data && (data.detail || data.error || data.message)) || res.statusText;
    throw new ApiError(detail || "The endpoint returned an error.", { status: res.status, body: data });
  }

  return data;
}

/* ---- Endpoints ----------------------------------------------------------- */

/** GET /health — unauthenticated liveness check. */
export function health(signal) {
  return request("/health", { signal });
}

/**
 * POST /search — full hybrid retrieval.
 * @param {{question:string, limit?:number, work_types?:string[],
 *          include?:string[], mode?:string, signal?:AbortSignal}} opts
 */
export function search(opts, signal) {
  const { question, limit, work_types, include, mode } = opts;
  const payload = { question };
  if (limit != null) payload.limit = limit;
  if (work_types && work_types.length) payload.scope = { types: work_types };
  if (include && include.length) payload.include = include;
  if (mode) payload.mode = mode;
  return request("/search", { method: "POST", body: payload, signal });
}

/** The exact request the demo would send, for the pre-flight preview. */
export function previewSearchBody(opts) {
  const { question, limit, work_types } = opts;
  const payload = { question };
  if (limit != null) payload.limit = limit;
  if (work_types && work_types.length) payload.scope = { types: work_types };
  return payload;
}
