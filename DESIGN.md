# DESIGN.md — Anime Akashic Records (AAR)

> Owns **durable visual decisions**. PRODUCT.md owns product truth.
> Written by the Impeccable `new-work` flow after `init`. Build path: **code-first**.
> The palette is *derived*: the owner's brief supplied three anchors (warm parchment/cream,
> deep ink, sakura pink) and was truncated mid-sentence at "Sakura pink: the". Everything past
> those anchors is this document's decision, made to serve the anchors — not a quotation.

## The world

**A working archive, kept by hand.** Not a temple, not a shrine, not neon Tokyo.

The reference object is a **research library's card catalogue fused with a lab notebook**: rag-paper
stock, letterpress ink, hairline rules, a single seal-red stamp, and the quiet of a reading room.
The system being described is a machine for *finding what you half-remember* — so the interface
behaves like a finding aid, not a billboard. Density is honest. Rules are drawn, not implied.
Labels are small, monospaced, and factual, the way a catalogue drawer label is factual.

Japanese identity enters through **typography and the seal**, never through decoration: a vertical
hairline, a kanji-scaled numeral set, one blossom used as a mark and a stamp — not scattered petals.
The page should read as *kept* rather than *generated*.

**Light source:** a reading room, mid-morning, paper on a desk. Light theme is the default and the
primary art direction, because parchment is the brand foundation and the subject is paper.
Dark theme is a genuine second printing on ink-dark stock — not an inverted afterthought.

### Direction contract (audited at the finish)

1. The hero is a **catalogue drawer being opened**, not a headline floating in space.
2. **Rules, rails, and margin notes** carry the structure. Cards are a last resort, used once where a
   card is literally the right container.
3. **One authored motion moment**: the hero's catalogue drawer slides and its index cards settle, on
   exponential ease-out, from an already-visible default. Everything else is quiet.
4. **Monospace is for data and identifiers only** (work IDs, scores, field names, code). Prose is set
   in the serif. This is a rule, not a preference.
5. The **search demo is the centrepiece**, presented as the actual instrument, with real result
   structure on screen — never a screenshot-shaped ornament.

## Palette

Three anchors from the brief, each expanded into a working ramp. These tokens are the only colours
used anywhere in the site.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F4EEE2` | Warm parchment. The canvas. |
| `--paper-deep` | `#EAE1D1` | Recessed wells: drawer interiors, code blocks, table stripes. |
| `--paper-raised` | `#FBF7EF` | Rare lift for the one true card. |
| `--ink` | `#1A1714` | Deep ink. Headings and body. |
| `--ink-soft` | `#4A4238` | Secondary prose. Tinted from ink, never grey. |
| `--ink-faint` | `#6B6051` | Tertiary / labels. ≥4.5:1 on `--paper`. |
| `--rule` | `#CFC4AE` | Hairlines, rails, table borders. |
| `--rule-strong` | `#A89A80` | Structural rules that must read at a glance. |
| `--sakura` | `#C86B85` | Sakura pink. The mark, the seal, active state. |
| `--sakura-deep` | `#8E4058` | Sakura at text weight on paper (≥4.5:1). |
| `--sakura-wash` | `#F0DCE1` | Sakura as a field: selection, highlight, active chip. |
| `--moss` | `#4F6B4A` | One true accent for "retrieved / ok". |
| `--amber` | `#8A6520` | Warning / degraded. |
| `--rust` | `#9C3B2E` | Error only. |

**Ink-dark printing** (dark theme) is a re-print on ink stock, not an inversion:

| Token | Value |
|---|---|
| `--paper` | `#141210` |
| `--paper-deep` | `#1C1916` |
| `--paper-raised` | `#232019` |
| `--ink` | `#F1EADC` |
| `--ink-soft` | `#C4B8A5` |
| `--ink-faint` | `#948877` |
| `--rule` | `#38322A` |
| `--rule-strong` | `#544B3E` |
| `--sakura` | `#E08CA4` |
| `--sakura-deep` | `#E8A2B5` |
| `--sakura-wash` | `#3A2530` |
| `--moss` | `#8FAF86` |
| `--amber` | `#D2A45A` |
| `--rust` | `#E08A7C` |

**Colour rules.** Sakura is an *accent*, never a large field, never a gradient partner. No purple.
No blue. There is no gradient in this system at all — depth comes from rules, paper tone, and shadow.

## Typography

Two families. Both self-hosted WOFF2, subset to the characters actually used, served from the site.
No third-party font CDN at runtime — a silent CDN request is a broken page on a locked-down network.

### Display + prose: a literary serif

**Fraunces** (variable, `opsz` 9–144, `wght` 300–700) for display and body.
Chosen for a paper-native, slightly inky serif voice that supports very high optical sizes for
display and small optical sizes for reading. It is not the default serif of the web, and its
`opsz` axis lets one file serve both a 5rem hero and 15px prose without a second download.
It is licensed under the SIL Open Font License.

- **Display:** `clamp(2.6rem, 7vw, 5.2rem)`, weight 600, `opsz` 120, tracking `-0.025em`, line-height 1.02.
  Never above 6rem. Tracking never below `-0.04em`.
- **Section heading:** `clamp(1.6rem, 3vw, 2.4rem)`, weight 600, `opsz` 60, tracking `-0.02em`.
- **Sub-heading:** 1.05rem, weight 600, `opsz` 24.
- **Body:** 1.0625rem / 1.62, weight 400, `opsz` 14, measure **65–75ch** (capped at `68ch`).
- **Lead:** 1.25rem / 1.5, weight 400, `opsz` 20, measure `58ch`.
- Balance headings (`text-wrap: balance`), pretty paragraphs (`text-wrap: pretty`).

### Data: a monospace with engineering restraint

**IBM Plex Mono** (400, 500, 600) for identifiers, field names, scores, code, table numerals.
Plex Mono has a true italic and a slightly condensed set that holds a dense results table.
Licensed under the SIL Open Font License.

- **Code / identifier:** 0.8125–0.875rem / 1.6, `font-variant-numeric: tabular-nums slashed-zero`.
- **Micro-label:** 0.6875rem / 1.4, weight 600, tracking `0.14em`, uppercase. Reserved for field
  names and drawer labels — **never** used as an eyebrow above a heading.

### Japanese

A native serif for Japanese strings only, falling back to the system Japanese face:
`"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif`. Japanese text is set at weight 400
and never letter-spaced, because tracking breaks kana.

### Vertical rhythm

A single `--baseline: 1.5rem` drives section spacing: `--space-1: .375rem`, `--space-2: .75rem`,
`--space-3: 1.125rem`, `--space-4: 1.5rem`, `--space-6: 2.25rem`, `--space-8: 3rem`,
`--space-12: 4.5rem`, `--space-16: 6rem`. **More space above a heading than below it, always.**

## Layout system

**A ruled page, not a grid of boxes.** The page is a catalogue leaf: a persistent left rail carrying
section marks and a running index, a wide reading column, and margin notes that hang outside it.

- **Shell:** `max-width: 78rem`, side padding `clamp(1.25rem, 4vw, 3rem)`.
- **The rail:** a 2px `--rule-strong` vertical hairline at the reading column's left edge, running the
  full height of each section, with section labels set in micro-label mono rotated 90° in the
  left gutter on wide screens (≥1200px) and demoted to inline labels below that.
- **The reading column:** `min(68ch, 100%)` for prose. Wide content (tables, the demo, code) breaks
  the column deliberately and spans to `min(76rem, 100%)`, aligned to the same left edge — never
  centred inside a narrower container.
- **Rules, not boxes.** Sections are separated by 1px `--rule` hairlines that span the shell. A card
  is used **once** in the entire site: the hero's catalogue drawer.
- **Tables** are the primary data structure: no zebra striping; a 1px bottom rule per row, a strong
  2px rule under the header, tabular numerals, field names in mono micro-label.
- **Asymmetry:** the rail is left-weighted on purpose. The right margin stays open to hold margin
  notes and, in the demo, the raw JSON trace panel.
- **Responsive:** below 900px the margin notes fold into `<details>` inside the flow; below 640px the
  rail's hairline is dropped and sections are separated by the strong rule only.

## Components

Named, singular, and few. Each has one job.

- **Catalogue drawer** (hero): the one card. A recessed `--paper-deep` well with a visible top edge,
  hairline inner rules, and index-card rows that physically list real example queries.
- **Index row:** the atom of the results list. `[position] [title] [type] [year] [score]` on one ruled
  line, expanding in place to the matched passages. No card, no avatar, no badge.
- **Passage:** a quoted excerpt with a 2px `--sakura` left rule at 2px (permitted: it is a quotation
  mark, not a card accent), the section name in micro-label mono, and the chunk id at the right edge.
- **Scope chip:** a real control — toggles a hard filter. Mono micro-label, 1px rule box, square
  corners, `--sakura-wash` when active. Not a decorative pill.
- **Field line:** `name` in mono micro-label, value in serif. Used in the API reference and stats.
- **Seal:** the brand mark's blossom, used at 20px as a section stamp and once as the loading state.
- **Code block:** `--paper-deep`, 1px rule, no rounded corners, a copy control that is a real button
  with a labelled state (`Copy` → `Copied`).

## Motion

**One authored moment, then silence.**

- **The hero drawer:** on load, the drawer's front edge slides down 14px and fades from 0.0 to 1.0
  while its index-card rows settle upward with a 40ms stagger. Easing: `cubic-bezier(.16,1,.3,1)`
  (exponential ease-out), 620ms. It starts from an already-readable default — with
  `prefers-reduced-motion: reduce` it is simply present.
- **Everything else:** 120ms ease-out on hover/focus, opacity and a 1px translate only. No entrance
  animation on any other section. No parallax. No scroll-triggered reveals.
- **The seal:** rotates once (180°) with the same easing when a search is committed — the only
  decorative motion, and it carries meaning (work started).

## Browser surfaces

Theme these from the palette, because they ship with defaults that belong to no design system:

- **Selection:** `--sakura-wash` background, `--ink` text.
- **Caret:** `--sakura-deep`.
- **Focus ring:** 2px `--sakura-deep`, 2px offset, `:focus-visible` only.
- **Scrollbars:** thin, `--rule` thumb on `--paper-deep` track.
- **Underlines:** `text-decoration-thickness: 1px`, `text-underline-offset: .18em`.
- **Numerals:** tabular and slashed-zero in every table and metric.
- **`::placeholder`:** `--ink-faint`, never lighter than 4.5:1.
- **`accent-color`:** `--sakura-deep` for any native control (checkbox, radio, range).

## Surfaces (page inventory)

Derived from the six stated user goals plus the deliverable list. One page, sectioned as an archive
index, with the demo given its own leaf because it is the proof.

| # | Surface | Mode | Job |
|---|---|---|---|
| — | **Header** | Operate | Mark, running section index, theme toggle, GitHub + RapidAPI links. |
| 01 | **Hero — the drawer** | Persuade | Land "you shouldn't need to know a title to find it." The one card. |
| 02 | **The demo** (`search.html`) | Operate | Real query → real result structure. The centrepiece. |
| 03 | **What it does** | Persuade | Why fuzzy, described retrieval beats a title search — the benefits, plainly. |
| 04 | **API reference** | Read | Endpoints (`/search`, `/ask`, `/health`), auth, scope fields, envelope shape, copyable examples. |
| 05 | **Get started** | Operate | Four steps: key → request → parse → render. Includes the Worker path. |
| 06 | **For agents & chatbots** | Persuade | Why a specialised retriever beats general web search for this job. |
| — | **Footer** | Read | Mark, docs links, licence, provenance. |

The demo is a **separate page** so it can be linked to directly, loads without the marketing weight,
and can be embedded later without carrying the whole site.

## UX writing

- **Controls name their action.** "Search the catalogue", not "Go". "Copy endpoint", not an icon alone.
- **Errors name the problem and the recovery.** A missing endpoint says so and points to the config
  file; a 401 says the key was rejected and where the proxy sits; a timeout says the request was
  slow and offers a retry that actually retries.
- **Empty states are honest.** Before any query the demo shows *how the request will be shaped*, not
  a spinner and not fake results.
- **The demo is never dishonest.** With no backend configured it says exactly that, shows the exact
  request it *would* send, and offers the live API path. It never renders fabricated results that
  could be mistaken for real retrieval.
- **Numbers are labelled.** Every figure states whether it is measured from the repository or
  illustrative.

## Refusals (this world does not use them)

Gradient text · glass/blur as decoration · colored `border-left` above 1px on cards · hard offset
shadows · pill-shaped everything · nested cards · eyebrow/kicker labels above headings · section
numbers as ornament (they appear here only in the pipeline, where sequence carries meaning) ·
emoji as icons · stock or anime imagery · a hero that is mostly empty · a metric wall of big numbers
with small labels · monospace as a costume for "technical" rather than for code, data, and IDs.
