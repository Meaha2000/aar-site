/* ============================================================================
   AAR — site configuration
   ============================================================================
   THE ONE PLACE THE BACKEND IS WIRED. Nothing else in this site knows a URL.

   The catalogue is served as a hosted RapidAPI product. Every request goes to
   the RapidAPI gateway host below and carries two headers: X-RapidAPI-Key (the
   subscriber's key) and X-RapidAPI-Host (this host). The origin server stays
   private behind the gateway.

        export const API_KEY = "<your RapidAPI key>";

   Leave API_KEY empty to keep the demo in its honest unconfigured state: it
   will show the request it *would* send and never invent results.

   There is no build step, so changing this file changes the site. That is the
   entire point of the constraint: the frontend never needs rebuilding to point
   at a live backend.
   ========================================================================= */

/**
 * RapidAPI host for the AAR listing. This is the `X-RapidAPI-Host` value and
 * the host component of every request URL.
 */
export const RAPIDAPI_HOST = "anime-akashic-records-aar-api.p.rapidapi.com";

/** API origin — the Cloudflare Worker proxy that enforces 10 req/day per IP. */
export const API_BASE = "https://orange-cell-9386.meaha2000.workers.dev";

/** Direct Cloudflare tunnel fallback for community ingestion and unproxied routes. */
export const TUNNEL_BASE = "https://api.aarecords.tech";

/** Free public access key for community submissions. */
export const FREE_PUBLIC_KEY = "aar_free_access";

/** Your RapidAPI key, sent as the `X-RapidAPI-Key` header. */
export const API_KEY = "";

/** Default result count for the demo request. Server clamps to its own maximum. */
export const DEFAULT_LIMIT = 8;

/**
 * The public RapidAPI listing URL. The UI references the listing by name and
 * links here when it is set.
 */
export const RAPIDAPI_URL =
  "https://rapidapi.com/meaha2000/api/anime-akashic-records-aar-api";

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
