/* ============================================================================
   AAR — site configuration
   ============================================================================
   THE ONE PLACE THE BACKEND IS WIRED. Nothing else in this site knows a URL.

   Two supported shapes:

   1. PROXIED (recommended for production)
      Point API_BASE at your deployed Cloudflare Worker. The Worker holds the
      real AAR_API_KEY as an encrypted server-side secret; the browser never
      sees a key. Leave API_KEY empty.

        export const API_BASE = "https://aar-proxy.<you>.workers.dev";
        export const API_KEY  = "";

   2. DIRECT (local testing only)
      Point API_BASE straight at the AAR API origin and supply a key. This puts
      the key in a browser-served file: treat any key used here as published.

        export const API_BASE = "https://your-origin.example";
        export const API_KEY  = "<your key>";

   There is no build step, so changing this file changes the site. That is the
   entire point of the constraint: the frontend never needs rebuilding to point
   at a live backend.
   ========================================================================= */

/**
 * API origin. Points at the deployed public Worker. The listing is rate-limited
 * per IP, so no key is sent from the browser and the Worker holds any upstream
 * secret server-side.
 */
export const API_BASE = "https://orange-cell-9386.meaha2000.workers.dev";

/** API key, used ONLY in the direct (non-proxied) local-testing shape. */
export const API_KEY = "";

/** Default result count for the demo request. Server clamps to its own maximum. */
export const DEFAULT_LIMIT = 8;

/**
 * The public RapidAPI listing URL. Not supplied by the owner, so it is left as a
 * single configurable constant; the UI references the listing by name and links
 * here when it is set.
 */
export const RAPIDAPI_URL = "";

/** Source repository. */
export const REPO_URL = "https://github.com/";

/** True when a usable backend origin is configured. */
export function isConfigured() {
  return typeof API_BASE === "string" && API_BASE.trim().length > 0;
}

/** Absolute endpoint URL for a path like "/search". */
export function endpoint(path) {
  return API_BASE.replace(/\/+$/, "") + path;
}
