<div align="center">

  <img src="assets/img/logo.png" alt="Anime Akashic Records" width="100" height="100" style="border-radius:20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">

  # Anime Akashic Records (AAR)

  **The Universal Semantic Search & Neural Retrieval Engine for Anime, Manga, and Light Novels.**

  [![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-B83A50?style=flat-square&logo=github)](https://meaha2000.github.io/aar-site/)
  [![API Gateway](https://img.shields.io/badge/API%20Gateway-api.aarecords.tech-3D6B48?style=flat-square)](https://api.aarecords.tech)
  [![Swagger Docs](https://img.shields.io/badge/Docs-Swagger%20UI-387b97?style=flat-square)](https://api.aarecords.tech/docs)
  [![Indexed Works](https://img.shields.io/badge/Indexed%20Works-144K%2B-blueviolet?style=flat-square)](#)
  [![Telegram Bot](https://img.shields.io/badge/Telegram-@AnimeAkashicRecords__bot-2CA5E0?style=flat-square&logo=telegram)](https://t.me/AnimeAkashicRecords_bot)

</div>

---

## 🌟 Overview

**Anime Akashic Records (AAR)** is a deep semantic search and retrieval engine covering over **144,000+ works** (anime, manga, light novels, visual novels, manhwa, and manhua) and **444,000+ interconnected production entities** (characters, voice actors, directors, authors, composers).

Traditional databases require exact spelling or keyword matches. AAR understands natural language concepts, vague plot memories, thematic vibes, character dynamics, and obscure plot tropes:
- *"Anime where a high schooler finds a notebook that kills people"*
- *"Psychological space thriller with bebop jazz soundtrack"*
- *"Fantasy with an elf mage journeying after defeating the demon king"*

> **💡 Best Paired with Traditional APIs:** Use AniList or Jikan for user watchlists, airing schedules, and high-res media banners — and pair with **AAR** for deep semantic discovery, complex plot retrieval, and AI chatbot grounding.

---

## 🚀 Quick Links

| Resource | URL |
|---|---|
| 🌐 **Interactive Web Demo** | [https://meaha2000.github.io/aar-site/](https://meaha2000.github.io/aar-site/) |
| ⚡ **Production API Gateway** | [https://api.aarecords.tech](https://api.aarecords.tech) |
| 📖 **Swagger UI (OpenAPI)** | [https://api.aarecords.tech/docs](https://api.aarecords.tech/docs) |
| 📑 **ReDoc Documentation** | [https://api.aarecords.tech/redoc](https://api.aarecords.tech/redoc) |
| 🤖 **Telegram Bot** | [@AnimeAkashicRecords_bot](https://t.me/AnimeAkashicRecords_bot) |
| 🤖 **LLM Context File** | [`llms.txt`](https://meaha2000.github.io/aar-site/llms.txt) |

---

## ⚡ Free Public Community Tier

The complete retrieval engine is open for evaluation, AI agent tool calling, and developer integrations:

- **Base URL:** `https://api.aarecords.tech`
- **Public API Key:** `aar_free_access` (or `aar_free`)
- **Authentication:** Supported via header (`x-api-key: aar_free_access`), bearer token, or query parameter (`?api_key=aar_free_access`).
- **Rate Limits:** 30 requests/minute on `/search` (burst: 3 req/sec), 3 requests/minute on `/ask`.
- **Health Check:** `GET /health` is quota-free.

---

## 💻 Quickstart (cURL & Code)

### cURL

```bash
curl -X GET "https://api.aarecords.tech/search?q=Bounty+hunters+in+space+with+jazz&limit=5" \
  -H "x-api-key: aar_free_access"
```

### Python (`requests`)

```python
import requests

url = "https://api.aarecords.tech/search"
headers = {"x-api-key": "aar_free_access"}
params = {
    "q": "Time travel thriller with a microwave and dr pepper",
    "limit": 5,
    "mode": "hybrid"
}

response = requests.get(url, params=params, headers=headers)
data = response.json()

for item in data.get("results", []):
    print(f"• {item['title']} ({item['release_year']}) — Score: {item.get('score', 0):.2f}")
```

### Node.js (Fetch)

```javascript
const response = await fetch("https://api.aarecords.tech/search?q=Cyberpunk+dystopia+psychological+thriller&limit=5", {
  headers: { "x-api-key": "aar_free_access" }
});

const data = await response.json();
console.log(data.results);
```

---

## 📡 Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/search` | `GET`, `POST` | Hybrid retrieval blending Qdrant dense vector embeddings, FTS5 BM25, and neural reranking (~500ms). |
| `/ask` | `GET`, `POST` | Grounded conversational AI question answering deriving answers strictly from canonical catalog data. |
| `/recommend` | `GET`, `POST` | Work-to-work semantic similarity based on narrative DNA, thematic tone, and aesthetic pacing. |
| `/suggest` | `POST` | Community contribution endpoint to submit new titles, custom narrative descriptions, and metadata corrections. |
| `/health` | `GET` | Quota-free liveness probe and corpus statistics. |

---

## 🛠 Local Website Preview

This repository hosts the static frontend published to GitHub Pages. To preview locally:

```bash
# Serve statically with any HTTP server
python -m http.server 8000
```

Open `http://localhost:8000/` in your browser.

---

## 📬 Contact & Support

For enterprise SLAs, custom rate limits, partnership opportunities, or bug reports:
- **Email:** [contact@aarecords.tech](mailto:contact@aarecords.tech)
- **Telegram:** [@AnimeAkashicRecords_bot](https://t.me/AnimeAkashicRecords_bot)

---

<div align="center">
  <sub>© Anime Akashic Records. Made for fans, developers, and autonomous AI agents.</sub>
</div>
