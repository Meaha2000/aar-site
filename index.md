# Anime Akashic Records (AAR) API — Full Specification & Documentation

> High-precision semantic and hybrid retrieval engine over 180,000+ canonical works spanning Anime, Manga, Light Novels, Visual Novels, Korean Manhwa, and Chinese Manhua. Designed to resolve vague memories, tropes, plot synopses, and aesthetic vibes into ranked canonical works paired with confirming excerpt passages.

---

## 1. Executive Summary & Capabilities

Anime Akashic Records (AAR) is built to solve the "tip-of-the-tongue" problem in East Asian pop culture media. Instead of relying on exact title keywords, users and AI agents can query in plain natural language describing characters, plot twists, studios, art styles, or atmospheric feelings.

### Key Strengths:
- **Six Unified Formats:** Cross-media mapping unifying Anime, Manga, Light Novels, Visual Novels, Korean Manhwa, and Chinese Manhua.
- **Hybrid Retrieval Pipeline:** Blends dense semantic vector retrieval with lexical keyword search and neural reranking for high-precision discovery.
- **Verbatim Passage Citations:** Every retrieved candidate returns the exact synopsis chunk or lore passage that satisfied the query, enabling hallucination-free LLM grounding.
- **Lore Synthesis (`/ask`):** Dedicated endpoint for conversational agents that synthesizes grounded prose explanations with direct citations.
- **Hosted on RapidAPI:** Zero-setup infrastructure, global low latency, managed rate limits, and instant API key issuance.

### Intended Scope & Best Practices:
- **Core Purpose:** Semantic retrieval, trope discovery, natural language query resolution, and grounded AI lore synthesis across 180,000+ East Asian pop culture works.
- **Canonical Metadata Support:** Canonical metadata (`types`, `statuses`, release year, `genres`, `tags`, `studios`) is fully indexed, filterable, and returned in every payload to enable strict categorical scoping.
- **What AAR Is NOT:** AAR is not engineered as a real-time minute-by-minute episode airing tracker, schedule release countdown, or personal watch-list tracking manager. Use traditional encyclopedic APIs for live airing countdowns, and use AAR when you need intelligent discovery, semantic matching, and lore reasoning.

---

## 2. Gateway, Authentication & Base URLs

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

## 3. Endpoints Reference

### 3.1. `GET /health`
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

### 3.2. `POST /search`
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
  "total_documents": 1,
  "results": [
    {
      "title": "Solo Leveling",
      "type": "manhwa",
      "year": 2018,
      "score": 0.9654,
      "status": "finished",
      "chunks": [
        {
          "section": "Synopsis",
          "text": "Known as the Weakest Hunter of All Mankind, Sung Jinwoo is fatally wounded in a hidden dual dungeon. Just as he accepts death, a mysterious quest window appears granting him the unique ability to level up infinitely."
        }
      ]
    }
  ],
  "trace": {
    "total_time_ms": 382.4
  }
}
```

---

### 3.3. `POST /ask`
Conversational question answering and lore synthesis for chatbots and agents. Returns an AI-composed factual answer grounded in corpus citations, accompanied by supporting ranked works.

#### Request Example:
```json
{
  "question": "Explain the mechanics of the Reading Steiner ability in Steins;Gate and who possesses it.",
  "limit": 5,
  "scope": {
    "types": ["VISUAL_NOVEL", "ANIME"]
  }
}
```

#### Response Envelope (`200 OK`):
```json
{
  "answer": "Reading Steiner is the signature ability possessed primarily by Rintaro Okabe in Steins;Gate. When a D-Mail or time leap alters the world line, Okabe retains his intact memories of previous timelines while the memories of everyone else are rewritten to fit the newly established reality.",
  "results": [
    {
      "title": "Steins;Gate",
      "type": "visual_novel",
      "year": 2009,
      "score": 0.9540,
      "status": "finished",
      "chunks": [
        {
          "section": "Lore / Mechanics",
          "text": "Reading Steiner allows the subject to perceive world line shifts and maintain intact continuity of personal consciousness across timeline divergences."
        }
      ]
    }
  ],
  "trace": {
    "total_time_ms": 780.2
  }
}
```

---

## 4. Code Integration Examples

### Python (using `requests`)
```python
import requests

url = "https://anime-akashic-records-aar-api.p.rapidapi.com/search"

headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Host": "anime-akashic-records-aar-api.p.rapidapi.com",
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY"
}

payload = {
    "question": "Cultivator reborn 10,000 years later to rebuild his sect",
    "limit": 6,
    "scope": {
        "types": ["MANHUA", "MANHWA"]
    }
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

for work in data.get("results", []):
    print(f"[{work['score']:.4f}] {work['title']} ({work['type']}, {work.get('year', 'N/A')})")
    for chunk in work.get("chunks", []):
        print(f"  Excerpt: {chunk['text']}\n")
```

### TypeScript / JavaScript (Node.js & Modern Browser)
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

async function searchAnimeRecords(payload: SearchPayload, apiKey: string) {
  const response = await fetch("https://anime-akashic-records-aar-api.p.rapidapi.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Host": "anime-akashic-records-aar-api.p.rapidapi.com",
      "X-RapidAPI-Key": apiKey
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

## 5. Status Codes & Error Envelopes

- **`200 OK`**: Request succeeded. Returns the JSON envelope.
- **`401 Unauthorized`**: Key rejected or missing header:
  ```json
  {"detail": "missing or invalid API key"}
  ```
- **`422 Unprocessable Entity`**: Payload validation failed (e.g., unknown scope filter, empty question string).
- **`429 Too Many Requests`**: Rate limit exceeded for your RapidAPI tier. Reset occurs per plan quota window.

---

## 6. Official Telegram Bot

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

## 7. Developer Support, Collaborations & Feedback

We welcome questions, developer integrations, collaboration ideas, bug reports, and feature proposals:
- **Official Contact Email:** `AnimeAkashicRecords@hotmail.com`
- **GitHub Repository:** https://github.com/Meaha2000/aar-site
- **RapidAPI Provider Portal:** https://rapidapi.com/meaha2000/api/anime-akashic-records-aar-api
