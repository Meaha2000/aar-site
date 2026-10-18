# Anime Akashic Records auth.md — Agent Registration & Authentication Discovery

> Authentication, authorization, agent registration discovery, and operational policies for autonomous AI agents, tool-calling LLMs, and Model Context Protocol (MCP) clients accessing **Anime Akashic Records (AAR)**.

---

## 1. Agent Audience & Ecosystem

Anime Akashic Records provides low-latency semantic discovery, cross-media trope resolution, and grounded Q&A over 144,000+ canonical works (Anime, Manga, Light Novels, Visual Novels, Korean Manhwa, and Chinese Manhua).

This specification is addressed to:
- **Autonomous AI Agents & Multi-Agent Swarms** performing media discovery, user recommendations, or research.
- **Model Context Protocol (MCP) Clients** (Claude Desktop, Cursor, Zed, Windsurf, LangChain, LlamaIndex).
- **Conversational RAG Pipelines & Chatbots** requiring evidence-grounded canonical passages with exact citations.
- **Developers & Integrators** seeking deterministic, high-throughput API endpoints.

---

## 2. Authentication Methods & Credentials

AAR employs a unified API key architecture across all REST and MCP interfaces. Every valid API key grants access to both protocols under identical rate limits and permissions.

### Supported Credential Transport:
1. **HTTP Request Header (Recommended for REST & MCP HTTP POST):**
   ```http
   X-API-Key: <YOUR_API_KEY>
   ```
2. **RFC 6750 Bearer Authorization Header:**
   ```http
   Authorization: Bearer <YOUR_API_KEY>
   ```
3. **Query Parameter (For SSE Handshakes):**
   ```http
   GET https://mcp.aarecords.tech/sse?api_key=<YOUR_API_KEY>
   ```
   *(Supported specifically for MCP clients where custom header injection during the initial Server-Sent Events handshake is restricted).*

---

## 3. Agent Provisioning & Registration Tiers

AAR supports both instant anonymous agent evaluation and managed registration for persistent production workloads.

### Tier 1: Instant Public Evaluation (Zero-Friction Free Tier)
No pre-registration, payment, or interactive signup required. AI agents may initiate tool calls immediately using the canonical public free tier key:

- **Free Tier Key:** `aar_free_access`
- **Burst Limit:** `3 requests / second`
- **Sustained Quota:** `30 requests / minute`
- **Accessible Methods:** All public discovery and query endpoints (`/search`, `/ask`, `/health`, `/suggest`, `/contributions`).
- **MCP Access:** Full tool execution (`aar_search`, `aar_ask`, `aar_health`) via `https://mcp.aarecords.tech/sse`.
- **Administrative Restriction:** Administrative and key generation tools are strictly protected and hidden.

### Tier 2: Dedicated & Elevated Agent Registration
For agents requiring higher concurrency, dedicated SLA quotas, or automated agent lifecycle management:

- **Official Contact Email:** `contact@aarecords.tech`
- **Registration Process:** Send an automated or manual registration request including:
  1. Agent Name / Identifier
  2. Operating Organization or Developer Contact
  3. Estimated Concurrency & Target Endpoints
- **Provisioning Response:** Issued within 24 hours with dedicated high-concurrency API keys.

---

## 4. Operational Endpoints & Capabilities

### REST Gateway: `https://api.aarecords.tech`
- `POST /search` — High-speed hybrid semantic retrieval fusing BM25 lexical search and ScaNN dense vector embeddings (~500ms).
- `POST /ask` — Conversational answer synthesis with grounded contextual citations and cross-work entity links.
- `GET /health` — Real-time health, cluster status, and uptime verification.
- `POST /suggest` — Community and agent canonical tag/alias suggestions.
- `POST /contributions` — Community work metadata contributions.

### Model Context Protocol (MCP) Server: `https://mcp.aarecords.tech/sse`
- **Protocol Version:** MCP 2024-11-05
- **Transport:** Server-Sent Events (SSE) with HTTP POST message forwarding.
- **Available Tools:**
  - `aar_search`: Search 144,000+ canonical works by plot synopsis, natural language premise, or character trope.
  - `aar_ask`: Synthesize grounded factual answers with verifiable citations.
  - `aar_health`: Cluster and index operational status.

---

## 5. Machine-Readable Discovery References

- **RFC 9727 API Catalog:** `https://aarecords.tech/.well-known/api-catalog` (`application/linkset+json`)
- **OpenAPI 3.1 Specification:** `https://api.aarecords.tech/openapi.json` (also mirrored at `https://aarecords.tech/openapi.json`)
- **Interactive Documentation:** `https://api.aarecords.tech/docs` and `https://aarecords.tech/api.html`
- **MCP Server Card:** `https://aarecords.tech/.well-known/mcp/server-card.json`
- **LLM Context Manifest:** `https://aarecords.tech/llms.txt`
- **Content Signals:** `https://aarecords.tech/robots.txt` (`ai-train=no, search=yes, ai-input=no`)
- **Official Contact:** `contact@aarecords.tech`
