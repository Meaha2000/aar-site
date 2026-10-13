# Anime Akashic Records (AAR) API — Full Specification & Documentation

> High-precision semantic and hybrid discovery engine over 180,000+ canonical works spanning Anime, Manga, Light Novels, Visual Novels, Korean Manhwa, and Chinese Manhua. Designed to resolve vague memories, tropes, plot synopses, and aesthetic vibes into ranked canonical works paired with supporting excerpt passages.

---

## 1. Executive Summary & Recommended Positioning

### Recommended Positioning:
> **Find the work you can't remember. Discover the work you didn't know you wanted.**
>
> Anime Akashic Records (AAR) is a discovery and metadata API for applications that need to search across works using natural-language descriptions, story concepts, and atmosphere — not only exact titles.

### Core Architecture & Key Strengths:
- **Six Unified Formats:** Cross-media mapping unifying Anime, Manga, Light Novels, Visual Novels, Korean Manhwa, and Chinese Manhua.
- **Hybrid Retrieval Pipeline:** Blends dense semantic vector retrieval with lexical keyword search and neural reranking for high-precision discovery.
- **Evidence-Grounded Results:** Every retrieved candidate returns supporting text from indexed synopses helping explain why a work matches (evaluated in context).
- **Question Answering (`/ask`):** Dedicated endpoint for conversational agents that synthesizes grounded prose explanations with direct citations.
- **Managed Search Infrastructure:** Hosted on RapidAPI with global availability, instant API keys, managed rate limits, and ready-to-use client libraries.

### Intended Scope & Best Practices:
- **Core Purpose:** Semantic retrieval, vibe and trope discovery, natural language query resolution, and grounded AI answer synthesis across 180,000+ East Asian pop culture works.
- **Canonical Metadata Support:** Canonical metadata (`types`, `statuses`, release year, `genres`, `tags`, `studios`) is fully indexed, filterable, and returned in every payload to enable strict categorical scoping.
- **What AAR Is NOT:** AAR is not engineered as a real-time minute-by-minute episode airing tracker, schedule release countdown, or personal watch-list tracking manager. Use traditional encyclopedic APIs for live airing countdowns and watch-lists, and use AAR when you need intelligent discovery, semantic matching, and grounded reasoning.

---

## 2. Discovery Use Cases

Anime Akashic Records (AAR) is designed for more than identifying works by title. It supports natural-language discovery across anime, manga, light novels, visual novels, manhwa, and manhua.

### 2.1. Find a Work You Can't Remember
Describe a plot, scene, character, ability, or story detail without knowing the title. AAR searches for relevant works using semantic retrieval, keyword matching, and reranking.
- **Example:** `"An anime about a student who travels back in time to prevent a classmate's murder."`

### 2.2. Discover Works by Vibe
Describe the atmosphere, emotional tone, themes, or narrative experience you want to explore. You do not need to have seen the work before or remember a specific title.
- **Example:** `"Find fantasy stories with a quiet, melancholic atmosphere, slow journeys, and themes of memory and the passage of time."`

### 2.3. Search by Themes and Story Concepts
Find works involving specific narrative patterns, character dynamics, abilities, conflicts, or combinations of story elements.
- **Example:** `"Stories about an immortal protagonist who watches generations pass and struggles with the meaning of human relationships."`

### 2.4. Explore Connected Media
Discover related works across anime, manga, light novels, visual novels, manhwa, and manhua within AAR's indexed catalog. Availability and relationships depend on the indexed data.

### 2.5. Build AI-Powered Discovery Products
Developers can use AAR in AI chatbots, agents, community bots, recommendation interfaces, and discovery applications. Streaming platforms can use AAR's candidate results as an additional discovery layer and match them against their own available catalog.

### 2.6. Evidence-Grounded Results
AAR can return relevant work metadata and supporting text from indexed descriptions, helping applications explain why a result may match a query. Returned evidence should be evaluated in context; semantic relevance does not guarantee that every result is correct.

---

## 3. Commercial Target Audience & Product Positioning

Anime Akashic Records is **primarily an Anime API**, created to solve the discovery limitations of traditional databases.

### Target Personas & Value Propositions:
| Target Audience | Practical Value Proposition | Technical Note |
|---|---|---|
| **Streaming Platforms** | Add natural language search and vibe discovery to your existing catalog. | Use AAR for candidate generation; match candidate titles against your own licensed catalog. |
| **AI Chatbots & Agents** | Find works and answer questions grounded by synopsis text. | Synthesizes answers and returns cited excerpts to avoid unsupported claims. |
| **Anime Discovery Apps** | Help users discover titles matching their mood, aesthetic vibes, and tropes. | Replaces shallow tag checkboxes with rich conversational discovery. |
| **Community Bots & Creators** | Quickly find works fitting a specific discussion prompt, video theme, or debate. | Rapidly surfaces thematic titles across 180,000+ indexed works. |

### When to Choose AAR vs. Traditional APIs (MAL / AniList / Kitsu):
- **Choose Traditional APIs when:** You need user watch-list tracking (e.g. marking an episode watched), forum profiles, or minute-by-minute episode airing countdowns.
- **Choose AAR when:** You are building recommendation engines, AI chatbots, discovery search bars, or solving "what's that anime where..." and vibe-based discovery queries.

---

## 4. Gateway, Authentication & Base URLs

### Host & Endpoints
- **RapidAPI Gateway Host:** `anime-akashic-records-aar-api.p.rapidapi.com`
- **Base Request URL:** `https://anime-akashic-records-aar-api.p.rapidapi.com`
- **RapidAPI Listing:** https://rapidapi.com/meaha2000/api/anime-akashic-records-aar-api
- **Web Demo Playground:** https://meaha2000.github.io/aar-site/search.html
- **Official Telegram Bot:** https://t.me/AnimeAkashicRecords_bot (@AnimeAkashicRecords_bot)

### Mandatory HTTP Headers
Every request (except `GET /health`) must supply the following headers:
```http
X-RapidAPI-Key: YOUR_RAPIDAPI_KEY
X-RapidAPI-Host: anime-akashic-records-aar-api.p.rapidapi.com
Content-Type: application/json
Accept: application/json
```

---

## 5. Endpoints Reference

### 5.1. `GET /health`
Unauthenticated liveness probe and catalog metrics. Safe for container probes and uptime checkers.

#### Request:
```bash
curl -X GET "https://anime-akashic-records-aar-api.p.rapidapi.com/health"
```

#### Response (`200 OK`):
```json
{
  "status": "ok",
  "works": 183380,
  "chunks": 192821
}
```

---

### 5.2. `POST /search`
Advanced hybrid retrieval across the 6 supported mediums.

#### Request Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `question` | `string` | **Yes** | — | Natural language description, plot summary, character dynamic, or trope. |
| `limit` | `integer` | No | `8` | Number of ranked works to return (clamped between 1 and 50). |
| `mode` | `string` | No | `"hybrid"` | Retrieval mode: `"hybrid"` (semantic vectors + keyword search + rerank) or `"semantic"` (dense vector search + rerank). |
| `include` | `array[string]` | No | `["text"]` | Extra fields to include in chunks (e.g. `["text"]`). |
| `scope` | `object` | No | `{}` | Hard filters applied to the index before retrieval. |

#### Scope Filter Object Schema (`scope`)
| Scope Field | Type | Description & Allowed Values |
|---|---|---|
| `types` | `array[string]` | Filter mediums: `["ANIME", "MANGA", "LIGHT_NOVEL", "VISUAL_NOVEL", "MANHWA", "MANHUA"]`. |
| `statuses` | `array[string]` | Lifecycle status: `["finished", "releasing", "upcoming", "cancelled", "hiatus"]` (also accepts `"completed"`, `"airing"`, `"ongoing"`). |
| `genres` | `array[string]` | Genres: `["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"]`. |
| `tags` | `array[string]` | Thematic tags: `["Time Travel", "Cyberpunk", "Isekai", "Reincarnation", "Cultivation", "Martial Arts", "Dungeons", "Necromancy", "School", "Anti-Hero"]`. |
| `studios` | `array[string]` | Studio name or substring: `["ufotable", "MAPPA", "Kyoto Animation", "Shaft", "Madhouse", "Bones", "Wit Studio"]`. |
| `min_year` | `integer` | Minimum release year bound (e.g. `2010`). |
| `max_year` | `integer` | Maximum release year bound (e.g. `2024`). |
| `min_score` | `number` | Minimum review score threshold (float between 0.0 and 10.0). |
| `adult` | `boolean` | Explicit 18+ content flag (default `false` excludes adult titles). |

#### Request Example:
```json
{
  "question": "A hunter who can see hidden status windows and level up alone in modern dungeons",
  "limit": 8,
  "mode": "hybrid",
  "scope": {
    "types": ["MANHWA", "MANGA", "ANIME"],
    "statuses": ["finished", "releasing"],
    "genres": ["Action", "Fantasy"]
  }
}
```

#### Response Envelope (`200 OK`):
```json
{
  "total": 8,
  "results": [
    {
      "position": 1,
      "score": 0.942,
      "work_id": "c7a8b9e0-1234-5678-9abc-def012345678",
      "canonical_title": "Solo Leveling",
      "type": "MANHWA",
      "country_of_origin": "KR",
      "year": 2018,
      "status": "finished",
      "genres": ["Action", "Fantasy"],
      "tags": ["Dungeons", "Leveling", "Necromancy"],
      "excerpts": [
        "In a world where hunters must battle deadly monsters, Sung Jin-woo, notoriously known as the weakest hunter of all mankind, is fatally injured in a high-rank double dungeon..."
      ]
    }
  ]
}
```

---

### 5.3. `POST /ask`
Grounded conversational question-answering with citation synthesis for AI agents.

#### Request Parameters
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `question` | `string` | **Yes** | — | Question regarding an anime premise, comparison, or plot inquiry. |
| `scope` | `object` | No | `{}` | Optional hard scope filters restricting candidate retrieval. |

#### Request Example:
```json
{
  "question": "What is the premise of Parasyte and what makes its relationship dynamic unique?"
}
```

#### Response Envelope (`200 OK`):
```json
{
  "answer": "In Parasyte (Kiseijuu: Sei no Kakuritsu), seventeen-year-old Shinichi Izumi is partially infected by an alien parasite named Migi, which fails to take over his brain and instead matures in his right hand. The dynamic is unique because Shinichi and Migi retain separate intellects and moralities, forcing an uneasy symbiotic coexistence where Migi's cold survival logic clashes with Shinichi's human empathy as they defend against other hostile parasites.",
  "citations": [
    {
      "work_id": "parasyte-kiseijuu-2014",
      "canonical_title": "Parasyte -the maxim-",
      "type": "ANIME",
      "year": 2014,
      "status": "finished",
      "excerpt": "Seventeen-year-old Shinichi Izumi falls victim to one of these parasites, but it fails to take over his brain, ending up in his right hand instead."
    }
  ]
}
```

---

## 6. Client Code Snippets

### Python (`requests`)
```python
import os
import requests

url = "https://anime-akashic-records-aar-api.p.rapidapi.com/search"
headers = {
    "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY", "YOUR_RAPIDAPI_KEY"),
    "X-RapidAPI-Host": "anime-akashic-records-aar-api.p.rapidapi.com",
    "Content-Type": "application/json"
}
payload = {
    "question": "A girl traveling through desolate ruins with two small robotic companions",
    "limit": 5,
    "scope": {
        "types": ["ANIME", "MANGA"],
        "genres": ["Sci-Fi", "Adventure"]
    }
}

response = requests.post(url, json=payload, headers=headers, timeout=10)
response.raise_for_status()
data = response.json()

for item in data.get("results", []):
    print(f"#{item['position']} {item['canonical_title']} ({item['type']}, {item['year']})")
    for ex in item.get("excerpts", []):
        print(f"   Excerpt: {ex[:120]}...")
```

### TypeScript / JavaScript (Node.js Fetch)
```typescript
interface SearchPayload {
  question: string;
  limit?: number;
  scope?: {
    types?: string[];
    statuses?: string[];
    genres?: string[];
  };
}

async function searchAAR(payload: SearchPayload) {
  const response = await fetch("https://anime-akashic-records-aar-api.p.rapidapi.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "YOUR_RAPIDAPI_KEY",
      "X-RapidAPI-Host": "anime-akashic-records-aar-api.p.rapidapi.com"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
```

### cURL CLI
```bash
curl -X POST "https://anime-akashic-records-aar-api.p.rapidapi.com/search" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Host: anime-akashic-records-aar-api.p.rapidapi.com" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -d '{
    "question": "Time-travel visual novel with branching timelines",
    "limit": 5,
    "scope": { "types": ["VISUAL_NOVEL"] }
  }'
```

---

## 7. Status Codes & Error Envelopes

- **`200 OK`**: Request succeeded. Returns the JSON envelope.
- **`401 Unauthorized`**: Key rejected or missing header:
  ```json
  {"detail": "missing or invalid API key"}
  ```
- **`422 Unprocessable Entity`**: Payload validation failed (e.g., unknown scope filter, empty question string).
- **`429 Too Many Requests`**: Rate limit exceeded for your RapidAPI tier. Reset occurs per plan quota window.

---

## 8. Official Telegram Bot

A full-featured live client is available on Telegram for conversational testing and interactive lookups:
- **Bot Username:** `@AnimeAkashicRecords_bot`
- **Link:** https://t.me/AnimeAkashicRecords_bot
- **Commands:**
  - `/s <query>` or `/search <query>`: Ranked search across all 6 media formats.
  - `/a <question>` or `/ask <question>`: Grounded AI question answering.
  - `/scope <filters>`: Sets conversational filter parameters (e.g. `/scope type=manhwa,genre=Action`).
  - `/work <title>`: Direct canonical record and chunk inspector.
  - `/stats`: Live corpus statistics and index status.

---

## 9. Developer Support, Collaborations & Feedback

We welcome questions, developer integrations, collaboration ideas, bug reports, and feature proposals:
- **Official Contact Email:** `AnimeAkashicRecords@hotmail.com`
- **GitHub Repository:** https://github.com/Meaha2000/aar-site
- **RapidAPI Provider Portal:** https://rapidapi.com/meaha2000/api/anime-akashic-records-aar-api
