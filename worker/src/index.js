/* ============================================================================
   AAR — Cloudflare Worker proxy
   ============================================================================
   The ONLY component in this project that holds a credential.

   The public site calls this Worker; the Worker calls the real AAR origin with
   the real key attached. The browser therefore never learns the origin host or
   the API key. This is the whole reason the Worker exists.

   Secrets (never committed; set with `wrangler secret put`):
     AAR_API_KEY    — required. The X-API-Key sent upstream.
     AAR_ORIGIN     — required. The real API origin, e.g. http://host:8080

   Routes proxied (everything else is refused):
     POST /search
     POST /ask
     GET  /health
   ========================================================================= */

const ALLOWED = new Set(["/search", "/ask", "/health"]);

/** Origins allowed to call this Worker from a browser. '*' by default. */
function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "*";
  const allow = env.AAR_ALLOWED_ORIGIN || origin;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(extra || {}) },
  });
}

async function proxy(request, env, url, cors) {
  const origin = (env.AAR_ORIGIN || "").replace(/\/+$/, "");
  if (!origin) {
    return json({ detail: "Worker is not configured: AAR_ORIGIN secret is missing." }, 500, cors);
  }
  if (!env.AAR_API_KEY) {
    return json({ detail: "Worker is not configured: AAR_API_KEY secret is missing." }, 500, cors);
  }

  const headers = new Headers();
  headers.set("X-API-Key", env.AAR_API_KEY);
  headers.set("Accept", "application/json");
  const ct = request.headers.get("Content-Type");
  if (ct) headers.set("Content-Type", ct);

  const init = { method: request.method, headers };
  if (request.method === "POST") init.body = await request.text();

  let upstream;
  try {
    upstream = await fetch(origin + url.pathname + url.search, init);
  } catch (err) {
    return json({ detail: "Upstream origin is unreachable from the Worker." }, 502, cors);
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...cors,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/") {
      return json({ service: "aar-proxy", routes: [...ALLOWED] }, 200, cors);
    }

    if (!ALLOWED.has(url.pathname)) {
      return json({ detail: "Not found. This proxy forwards only /search, /ask, and /health." }, 404, cors);
    }

    if (url.pathname === "/search" || url.pathname === "/ask") {
      if (request.method !== "POST") {
        return json({ detail: "Method not allowed; use POST." }, 405, cors);
      }
    } else if (request.method !== "GET") {
      return json({ detail: "Method not allowed; use GET." }, 405, cors);
    }

    return proxy(request, env, url, cors);
  },
};
