# Anime Akashic Records

> **💡 Pro-Tip:** BEST PAIRED WITH TRADITIONAL ANIME APIS for exact metadata and images (Use AniList/Jikan for schedules & watchlists, and AAR for semantic search & recommendations).
 â€” official website

This folder is **self-contained**. It is the complete, standalone public website for Anime Akashic
Records (AAR). It does not read from, write to, or depend on any other folder in this workspace.

> **Independence note.** The backend project lives in a sibling folder (`../aar/`). This site talks to
> that backend **only over its public HTTP API**. Nothing in this folder imports backend code, shares
> a Python environment, or references a relative backend path. Deleting the backend folder would not
> break any file here.

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
| `search.html` | The search demo â€” the centrepiece. Shows the request before sending; never fabricates results. |
| `.nojekyll` | Tells GitHub Pages not to run Jekyll. |

## Search demo behaviour

- **Before a query** it renders the exact JSON body and resolved endpoint it *would* send â€” no
  spinner, no placeholder results.
- **With no backend configured** it says so plainly and links the hosted listing; it never invents
  retrieval output.
- **On error** it names the problem and the recovery (401 — check the API key; timeout — a Retry
  that actually retries).
- **Scope chips** are hard filters over the four media types.

## How to run

No build step. Serve the folder over HTTP (opening `index.html` as `file://` will block ES modules):

```sh
# any static server, for example
python -m http.server 5173 --directory .
```

Then open `http://localhost:5173/`.

## How to point it at a backend

All backend wiring lives in one file, `assets/js/config.js`. The catalogue is served via the production gateway (`https://api.aarecords.tech`):

- `API_BASE` — the API gateway base URL.
- `API_KEY` — optional API key for authenticated requests. Leave it empty to keep the demo
  in its honest unconfigured state.

Changing the key never requires a rebuild, because there is nothing to build.

## Deployment

Static host / GitHub Pages. Publish the contents of this folder; ship `.nojekyll`. There is no server
component in this repository.

## Security boundary

The site is public. Therefore `config.js` ships with an **empty** `API_KEY`; each visitor supplies
their own API key, and the origin server stays private behind the gateway.

---

*Moved here from the workspace root to keep the website fully separate from the backend project.*