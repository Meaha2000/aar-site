# Anime Akashic Records — official website

This folder is **self-contained**. It is the complete, standalone public website for Anime Akashic
Records (AAR). It does not read from, write to, or depend on any other folder in this workspace.

> **Independence note.** The backend project lives in a sibling folder (`../aar/`). This site talks to
> that backend **only over its public HTTP API**, through a configured endpoint URL. Nothing in this
> folder imports backend code, shares a Python environment, or references a relative backend path.
> Deleting the backend folder would not break any file here.

## What is here

| Path | What it is |
|---|---|
| `PRODUCT.md` | The product brief: what AAR is, who it is for, the six user goals. |
| `DESIGN.md` | The design foundation: the world, palette, typography, layout, motion, components, page inventory, refusals. |
| `assets/fonts/` | Self-hosted WOFF2 (Fraunces + IBM Plex Mono) and `fonts.css`. No CDN, no external requests. |
| `assets/css/` | `tokens.css` (colour/type/space/motion), `base.css` (reset, typography, browser surfaces), `components.css`, `site.css` (layout). |
| `assets/js/` | `config.js` (the one backend constant), `api.js` (contract client), `site.js` (chrome), `search.js` (the demo). Vanilla ES modules. |
| `assets/img/` | Original SVG art: `seal.svg`, `mark.svg` (lockup), `monogram.svg`, `favicon.svg`. |
| `index.html` | The landing page: hero drawer, what it does, API reference, get started, for agents. |
| `search.html` | The search demo — the centrepiece. Shows the request before sending; never fabricates results. |
| `worker/` | The Cloudflare Worker proxy (the **only** place an API key exists). Own `wrangler.toml`. |
| `.nojekyll` | Tells GitHub Pages not to run Jekyll. |

## Search demo behaviour

- **Before a query** it renders the exact JSON body and resolved endpoint it *would* send — no
  spinner, no placeholder results.
- **With no backend configured** it says so plainly and links the hosted listing; it never invents
  retrieval output.
- **On error** it names the problem and the recovery (401 → where the proxy sits; timeout → a Retry
  that actually retries).
- **Scope chips** are hard filters; the composed-answer toggle maps to the API's opt-in `answer`.

## How to run

No build step. Serve the folder over HTTP (opening `index.html` as `file://` will block ES modules):

```sh
# any static server, for example
python -m http.server 5173 --directory .
```

Then open `http://localhost:5173/`.

## How to point it at a backend

All backend wiring lives in one constant in `assets/js/config.js`. It is shipped pre-wired to the
live public Worker (`https://orange-cell-9386.meaha2000.workers.dev`), which is rate-limited per IP,
so the browser sends no key. The two shapes below are for pointing it somewhere else:

- **Direct** — set `API_BASE` to the API origin and `API_KEY` to a key. Only do this for local
  testing; a browser-visible key is a published key.
- **Proxied (recommended for production)** — leave `API_KEY` empty and set `API_BASE` to your
  deployed Worker URL. The Worker holds the real key as an encrypted server-side secret.

Changing the backend never requires a rebuild, because there is nothing to build.

## Deployment

- **Site:** static host / GitHub Pages. Publish the contents of this folder; ship `.nojekyll`.
- **Proxy:** deploy `worker/` with Wrangler, then set `AAR_API_KEY` as a secret:

```sh
cd worker
npx wrangler secret put AAR_API_KEY
npx wrangler deploy
```

## Security boundary

The site is public. Therefore:

- No API key, backend origin, or admin endpoint is ever committed into browser-served files.
- `worker/` is the single trusted component; the key lives only as a Cloudflare secret.
- `config.js` contains **no** credential at all — only a public, per-IP-rate-limited Worker URL and an empty `API_KEY`.

---

*Moved here from the workspace root to keep the website fully separate from the backend project.*
