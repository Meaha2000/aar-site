/* ============================================================================
   AAR — site configuration
   ============================================================================
   THE ONE PLACE THE BACKEND IS WIRED. Nothing else in this site knows a URL.

   The catalogue is served via our direct production gateway at https://api.aarecords.tech.
   Requests authenticate using standard x-api-key headers (or bearer tokens / query parameters).

        export const API_KEY = "";

   Leave API_KEY empty to keep the demo in its honest unconfigured state: it
   will show the request it *would* send and never invent results.

   There is no build step, so changing this file changes the site. That is the
   entire point of the constraint: the frontend never needs rebuilding to point
   at a live backend.
   ========================================================================= */



/** API origin — the Cloudflare Worker proxy that enforces 10 req/day per IP. */
export const API_BASE = "https://orange-cell-9386.meaha2000.workers.dev";

/** Direct Cloudflare tunnel fallback for community ingestion and unproxied routes. */
export const TUNNEL_BASE = "https://api.aarecords.tech";

/** Free public access key for community submissions. */
export const FREE_PUBLIC_KEY = "aar_free_access";

/** Optional API key for authenticated requests (`x-api-key`). */
export const API_KEY = "";

/** Default result count for the demo request. Server clamps to its own maximum. */
export const DEFAULT_LIMIT = 8;

/**
 * links here when it is set.
 */
export const GATEWAY_URL =
  "https://api.aarecords.tech";

/** Source repository. */
export const REPO_URL = "https://github.com/Meaha2000/aar-site";

/** True when a usable backend origin is configured. */
export function isConfigured() {
  return typeof API_BASE === "string" && API_BASE.trim().length > 0;
}

/** Absolute endpoint URL for a path like "/search". */
export function endpoint(path) {
  return API_BASE.replace(/\/+$/, "") + path;
}
