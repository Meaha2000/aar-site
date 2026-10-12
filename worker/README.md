# AAR proxy — Cloudflare Worker

A single-purpose proxy. It exists so the public site never holds an API key and never learns the
backend's real address.

```
browser  ──►  this Worker  ──►  AAR origin
              (holds the key)     (never exposed)
```

## What it forwards

| Route | Method | Upstream key used |
|---|---|---|
| `/search` | POST | `AAR_API_KEY` |
| `/ask` | POST | `AAR_API_KEY` |
| `/health` | GET | `AAR_API_KEY` |

Any other path returns `404`. The browser cannot use this Worker to reach any other part of the
origin.

## Configure

Secrets live encrypted on Cloudflare, never in this repository:

```sh
npx wrangler secret put AAR_API_KEY        # required — upstream X-API-Key
npx wrangler secret put AAR_ORIGIN         # required — e.g. http://host:8080
npx wrangler secret put AAR_ALLOWED_ORIGIN # optional — CORS allowlist (default: echo Origin)
```

`AAR_ORIGIN` is a secret on purpose: keeping it out of the bundle means even the deployed code does
not disclose where the backend lives.

## Develop and deploy

```sh
npx wrangler dev      # local preview against your configured origin
npx wrangler deploy   # publish
```

After deploy, copy the Worker URL into `API_BASE` in `../assets/js/config.js` and leave `API_KEY`
empty in that file. The site will then talk only to this Worker.

## Security notes

- The key is attached **server-side**, per request. It is never sent to the browser.
- `Cache-Control: no-store` on every proxied response, so a shared cache cannot leak a result.
- Only three routes are reachable; everything else is refused before any upstream call is made.
