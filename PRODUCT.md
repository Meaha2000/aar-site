## Brand

**Personality:** intelligent, imaginative, refined, literary, quietly distinctive, technically
credible, approachable.

**Direction:** a contemporary literary *archive* meeting a carefully designed Japanese-inspired
identity — a sophisticated index of stories and forgotten memories, with modern developer-product
clarity.

**Explicitly not:** generic AI gradients, purple-to-blue SaaS aesthetics, heavy glassmorphism,
repetitive rounded cards, badge spam, vast empty heroes, stock anime imagery, cartoonish sakura
scatter, or noisy Japanese motifs.

## Voice

Precise, unhurried, and confident. Speaks like a good reference librarian who also ships code:
names the mechanism rather than the magic, never oversells, and treats the reader as competent.
Avoids hype vocabulary ("blazing", "revolutionary", "supercharge") and avoids anthropomorphising
the system.

## Platform

`web`

Mobile web is in scope and is still `web`. There is no native app surface and no plan for one here.

## Stack

**Static HTML + CSS + vanilla ES modules. No build step. No framework. No runtime dependency.**

Rationale, per the brief's own requirements (constraint: must deploy as a static site on GitHub
Pages; constraint: frontend must not need rebuilding to point at a live backend): a no-build static
site is the smallest artifact that satisfies both, and it keeps the trust boundary legible — every
byte shipped is auditable, and no secret can hide in a bundler config.

- **Publish target:** GitHub Pages, served from the `site/` directory (or `site/` promoted to the
  Pages root). `.nojekyll` included so `_`-prefixed paths are not eaten.
- **Optional component:** `worker/` — a Cloudflare Worker (its own `wrangler.toml`) that proxies
  `/search` and `/ask` to AAR and holds `AAR_API_KEY` as an encrypted server-side secret.
- **Fonts:** self-hosted WOFF2, served from the site. No third-party font CDN at runtime.

## Build path

`code-first`.

No image-generation tool and no image converter (`cwebp` / `sips` / `magick` / `ffmpeg`) are present
in this environment, so the comp-first path does not apply. Ambition is written into the direction
contract in `DESIGN.md` and audited at the finish pass. Vector brand assets are authored by hand.

## Evidence & proof assets

- Architecture, endpoint list, scope fields, and model names above are read from
  `aar/README.md`, `aar/API.md`, `aar/catalog/api/app.py`, and `aar/catalog/models.py`.
- There are **no published benchmark numbers** in this repository beyond the corpus counts and model
  identities. The benchmarks surface must therefore present **measured corpus facts and the
  retrieval pipeline's stages**, and must not invent latency or accuracy figures.
  Any illustrative figure is labelled as illustrative. (Craft floor: claims come from supplied truth.)

## Open questions (deliberately undecided)

- The owner's brief was truncated mid-sentence in section 3 at **"Sakura pink: the"**. The remainder
  of the palette, the typography rules, the layout system, the full page inventory, and the
  search-demo / security / Worker sections were not received. The palette is therefore completed in
  `DESIGN.md` from the three anchors that *were* given (parchment/cream, deep ink, sakura pink), and
  the page inventory is derived from the six stated user goals. Both are marked as derived, not quoted.
- RapidAPI listing URL was not supplied; the site references the listing by name and leaves the URL
  to a single configurable constant.