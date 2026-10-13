# Anime Akashic Records (AAR) API

> High-precision hybrid retrieval engine across 180,000+ works spanning Anime, Manga, Light Novels, and Visual Novels. Resolves vague memories, plots, tropes, aesthetics, and character relationships to canonical works paired with grounded excerpt passages.

## Overview
- **Service Name:** Anime Akashic Records (AAR)
- **Hosted Gateway:** RapidAPI
- **RapidAPI Host:** `anime-akashic-records-aar-api.p.rapidapi.com`
- **RapidAPI Listing:** https://rapidapi.com/meaha2000/api/anime-akashic-records-aar-api
- **Web Demo:** https://meaha2000.github.io/aar-site/search.html
- **Telegram Live Bot:** https://t.me/AnimeAkashicRecords_bot (@AnimeAkashicRecords_bot)
- **Contact & Support:** meaha2000@gmail.com | https://github.com/Meaha2000/aar-site

## Authentication
Every request to the RapidAPI gateway must supply the following headers:
- `X-RapidAPI-Key`: Your RapidAPI subscription key
- `X-RapidAPI-Host`: `anime-akashic-records-aar-api.p.rapidapi.com`
- `Content-Type`: `application/json`

---

## Endpoints

### 1. `GET /health`
Unauthenticated liveness check and corpus statistics.

#### Response (`200 OK`)
```json
{
  "status": "ok",
  "works": 183380,
  "chunks": 192821
}
```

---

### 2. `POST /search`
Hybrid retrieval across 4 mediums combining dense embeddings, BM25 lexical search, trigram matching, and neural reranking.

#### Request Body Schema
```json
{
  "question": "Time-travel visual novel with branching timelines",
  "limit": 8,
  "mode": "hybrid",
  "scope": {
    "types": ["VISUAL_NOVEL"],
    "statuses": ["finished"],
    "genres": ["Sci-Fi", "Mystery"],
    "min_year": 2000,
    "max_year": 2024
  }
}
```

#### Parameters
- `question` *(string, required)*: The search query or natural language description.
- `limit` *(integer, optional, default: 8, max: 50)*: Number of ranked works to return.
- `mode` *(string, optional, default: "hybrid")*:
  - `"hybrid"`: Lexical BM25 + dense embeddings + neural reranking.
  - `"semantic"`: Pure vector embedding similarity + neural reranking.
- `scope` *(object, optional)*: Hard filters applied to the corpus:
  - `types`: List of mediums (`["ANIME", "MANGA", "LIGHT_NOVEL", "VISUAL_NOVEL"]`).
  - `statuses`: Filter by status (`"finished"`, `"releasing"`, `"upcoming"`).
  - `genres`: List of genres (e.g. `["Action", "Sci-Fi", "Psychological"]`).
  - `tags`: List of thematic tags (e.g. `["Time Travel", "Cyberpunk"]`).
  - `studios`: List of production studios (e.g. `["ufotable", "Kyoto Animation"]`).
  - `min_year` / `max_year`: Year boundaries (integer).
  - `min_score`: Minimum score threshold (float).
  - `adult`: Boolean flag (default excludes explicit 18+ content).

#### Response Envelope (`200 OK`)
```json
{
  "total_documents": 1,
  "results": [
    {
      "title": "Steins;Gate",
      "type": "visual_novel",
      "year": 2009,
      "score": 0.9412,
      "status": "finished",
      "chunks": [
        {
          "section": "Synopsis",
          "text": "Rintaro Okabe is a self-proclaimed mad scientist who accidentally discovers a way to send messages to the past, triggering unforeseen consequences across timelines."
        }
      ]
    }
  ],
  "trace": {
    "total_time_ms": 342.5
  }
}
```

---

### 3. `POST /ask`
Dedicated conversational question answering and lore synthesis. Returns an AI-composed natural language answer grounded in corpus citations, alongside ranked supporting works.

#### Request Body Schema
```json
{
  "question": "Explain the mechanics of the Reading Steiner ability in Steins;Gate and who possesses it.",
  "limit": 8,
  "scope": {
    "types": ["VISUAL_NOVEL", "ANIME"]
  }
}
```

#### Response Envelope (`200 OK`)
```json
{
  "answer": "Reading Steiner is the ability possessed primarily by Rintaro Okabe in Steins;Gate. When a D-Mail or time leap alters the world line, Okabe retains his memories of previous timelines while everyone else's memories are rewritten to fit the new reality.",
  "results": [
    {
      "title": "Steins;Gate",
      "type": "visual_novel",
      "year": 2009,
      "score": 0.9540,
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

## Example cURL Command

```bash
curl -X POST "https://anime-akashic-records-aar-api.p.rapidapi.com/search" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Host: anime-akashic-records-aar-api.p.rapidapi.com" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -d '{
    "question": "Studio that animated a demon-slaying brother and sister",
    "limit": 5
  }'
```

---

## Interactive Telegram Bot
Users and agents can interact with the live model and catalogue directly on Telegram:
- Bot Username: `@AnimeAkashicRecords_bot`
- URL: https://t.me/AnimeAkashicRecords_bot
- Available Commands: `/search <query>`, `/ask <question>`, `/scope <filters>`, `/work <title>`, `/stats`
