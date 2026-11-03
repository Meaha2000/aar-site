import React, { useState, useEffect, useRef } from 'react';
import { safeCopyToClipboard } from '../lib/utils';
import {
  Code2,
  Copy,
  Check,
  Globe2,
  Sparkles,
  Server,
  Layers,
  Film,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Database,
  GitBranch,
  Quote,
  Clock,
  Compass
} from 'lucide-react';

export function ApiDocs() {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedLang, setSelectedLang] = useState('curl'); // 'curl' | 'python' | 'js'
  const [activeSection, setActiveSection] = useState('overview');
  const mobileNavRef = useRef(null);

  const handleCopy = async (text, id) => {
    await safeCopyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navSections = [
    { id: 'overview', title: 'Overview & Base URLs' },
    { id: 'auth', title: 'Authentication' },
    { id: 'search', title: 'POST /search (Catalog Discovery)' },
    { id: 'recommend', title: 'POST /recommend (Multi-Seed Graph)' },
    { id: 'ask', title: 'POST /ask (Catalog Lore RAG)' },
    { id: 'advanced-search', title: 'POST /advanced-search (Scene Finder)' },
    { id: 'advanced-recommend', title: 'POST /advanced-recommend (Granular)' },
    { id: 'lore-ask', title: 'POST /lore-ask (Exact Timestamp RAG)' },
    { id: 'arcs', title: 'GET /lore/arc-index (Story Arcs)' },
    { id: 'autocomplete', title: 'GET /autocomplete & /resolve' },
    { id: 'health', title: 'GET /health & /stats' },
    { id: 'crosswalk', title: 'External ID Crosswalk' },
    { id: 'errors', title: 'Errors & Rate Limits' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const offset = 150;
      let current = navSections[0].id;
      for (const sec of navSections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            current = sec.id;
          }
        }
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        current = navSections[navSections.length - 1].id;
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileNavRef.current) return;
    const activeEl = mobileNavRef.current.querySelector(`[data-sec="${activeSection}"]`);
    if (activeEl) {
      const container = mobileNavRef.current;
      const targetLeft = activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  }, [activeSection]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 125;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const codeSnippets = {
    search: {
      curl: `curl -X POST https://api.aarecords.tech/search \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "question": "Children pilot a giant robot powered by their own life force where the pilot dies after every battle",
    "limit": 5,
    "mode": "hybrid",
    "scope": {
      "types": ["anime"]
    }
  }'`,
      python: `import requests

url = "https://api.aarecords.tech/search"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "question": "Children pilot a giant robot powered by their own life force where the pilot dies after every battle",
    "limit": 5,
    "mode": "hybrid",
    "scope": {"types": ["anime"]}
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/search', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: 'Children pilot a giant robot powered by their own life force where the pilot dies after every battle',
    limit: 5,
    mode: 'hybrid',
    scope: { types: ['anime'] }
  })
});
const data = await response.json();
console.log(data);`
    },

    recommend: {
      curl: `curl -X POST https://api.aarecords.tech/recommend \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "seed_work_ids": ["work:anime:mal_9253_al_9253"],
    "negative_work_ids": [],
    "target_scope": "anime",
    "limit": 5,
    "exclude_same_franchise": true
  }'`,
      python: `import requests

url = "https://api.aarecords.tech/recommend"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "seed_work_ids": ["work:anime:mal_9253_al_9253"],
    "negative_work_ids": [],
    "target_scope": "anime",
    "limit": 5,
    "exclude_same_franchise": True
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/recommend', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    seed_work_ids: ['work:anime:mal_9253_al_9253'],
    negative_work_ids: [],
    target_scope: 'anime',
    limit: 5,
    exclude_same_franchise: true
  })
});
const data = await response.json();
console.log(data);`
    },

    ask: {
      curl: `curl -X POST https://api.aarecords.tech/ask \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "question": "What is the true nature of the Akashic Records in anime lore?",
    "limit": 3
  }'`,
      python: `import requests

url = "https://api.aarecords.tech/ask"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "question": "What is the true nature of the Akashic Records in anime lore?",
    "limit": 3
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/ask', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: 'What is the true nature of the Akashic Records in anime lore?',
    limit: 3
  })
});
const data = await response.json();
console.log(data);`
    },

    advancedSearch: {
      curl: `curl -X POST https://api.aarecords.tech/advanced-search \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "query": "Children inside a giant robot cockpit learning the pilot will die after the battle",
    "granularity": "scene",
    "limit": 5,
    "use_reranker": true
  }'`,
      python: `import requests

url = "https://api.aarecords.tech/advanced-search"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "query": "Children inside a giant robot cockpit learning the pilot will die after the battle",
    "granularity": "scene",
    "limit": 5,
    "use_reranker": True
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/advanced-search', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Children inside a giant robot cockpit learning the pilot will die after the battle',
    granularity: 'scene',
    limit: 5,
    use_reranker: true
  })
});
const data = await response.json();
console.log(data);`
    },

    advancedRecommend: {
      curl: `curl -X POST https://api.aarecords.tech/advanced-recommend \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "granularity": "scene",
    "positive_queries": ["Mind game cat-and-mouse duel between detective and vigilante"],
    "limit": 5
  }'`,
      python: `import requests

url = "https://api.aarecords.tech/advanced-recommend"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "granularity": "scene",
    "positive_queries": ["Mind game cat-and-mouse duel between detective and vigilante"],
    "limit": 5
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/advanced-recommend', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    granularity: 'scene',
    positive_queries: ['Mind game cat-and-mouse duel between detective and vigilante'],
    limit: 5
  })
});
const data = await response.json();
console.log(data);`
    },

    loreAsk: {
      curl: `curl -X POST https://api.aarecords.tech/lore-ask \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "query": "Who is Twenty Faces and what is his philosophy in Rampo Kitan?",
    "granularity": "scene",
    "limit": 4
  }'`,
      python: `import requests

url = "https://api.aarecords.tech/lore-ask"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "query": "Who is Twenty Faces and what is his philosophy in Rampo Kitan?",
    "granularity": "scene",
    "limit": 4
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/lore-ask', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Who is Twenty Faces and what is his philosophy in Rampo Kitan?',
    granularity: 'scene',
    limit: 4
  })
});
const data = await response.json();
console.log(data);`
    },

    arcs: {
      curl: `curl -X GET "https://api.aarecords.tech/lore/arc-index?limit=5" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      python: `import requests

url = "https://api.aarecords.tech/lore/arc-index"
headers = {"X-API-Key": "YOUR_API_KEY"}
params = {"limit": 5}

response = requests.get(url, headers=headers, params=params)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/lore/arc-index?limit=5', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
const data = await response.json();
console.log(data);`
    },

    autocomplete: {
      curl: `curl -X GET "https://api.aarecords.tech/autocomplete?q=Steins" \\
  -H "X-API-Key: YOUR_API_KEY"`,
      python: `import requests

url = "https://api.aarecords.tech/autocomplete"
headers = {"X-API-Key": "YOUR_API_KEY"}
params = {"q": "Steins"}

response = requests.get(url, headers=headers, params=params)
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/autocomplete?q=Steins', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
const data = await response.json();
console.log(data);`
    },

    health: {
      curl: `curl -X GET "https://api.aarecords.tech/health"`,
      python: `import requests

response = requests.get("https://api.aarecords.tech/health")
print(response.json())`,
      js: `const response = await fetch('https://api.aarecords.tech/health');
const data = await response.json();
console.log(data);`
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono text-brand-600 dark:text-brand-400 mb-2">
          <Code2 className="w-4 h-4" />
          <span>DEVELOPER DOCUMENTATION & REST SPECIFICATION</span>
        </div>
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          AAR API Reference
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-3xl leading-relaxed">
          Comprehensive REST API specification for semantic work retrieval across 146,140 work metadata records and precision scene discovery across 7,535 indexed anime profiles, 102,264 episodes, 762,318+ scene timestamp citations, and 10,565 story arc index records.
        </p>

        {/* Global Language Selector */}
        <div className="flex items-center gap-2 mt-6">
          <span className="text-xs font-mono text-zinc-400 mr-2">Language:</span>
          {['curl', 'python', 'js'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                selectedLang === lang
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {lang === 'js' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL'}
            </button>
          ))}
        </div>

      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Quick Endpoint Jump Bar on Mobile (sticks under navbar and stops at article end before footer) */}
        <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-2.5 bg-[#FAF6F0]/95 dark:bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
          <div
            ref={mobileNavRef}
            className="flex items-center gap-2 overflow-x-auto tabs-scrollbar pb-1 flex-nowrap scroll-smooth touch-pan-x"
          >
            {navSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <a
                  key={sec.id}
                  data-sec={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => scrollToSection(e, sec.id)}
                  className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
                    isActive
                      ? 'bg-brand-600 text-white border-brand-500 font-semibold shadow-sm shadow-brand-500/25'
                      : 'bg-zinc-100 dark:bg-zinc-900/90 border-zinc-200/70 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {sec.title}
                </a>
              );
            })}
          </div>
        </div>

        {/* Navigation Sidebar on Desktop (sticks under navbar and stops at article end before footer) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-20 self-start">
          <div className="space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
              Endpoints & Guides
            </span>
            <div className="space-y-1">
              {navSections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => scrollToSection(e, sec.id)}
                    className={`block px-3 py-1.5 text-xs rounded-lg transition-all duration-200 truncate border-l-2 ${
                      isActive
                        ? 'bg-brand-500/15 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border-brand-500 font-semibold shadow-xs'
                        : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium'
                    }`}
                  >
                    {sec.title}
                  </a>
                );
              })}
            </div>

            {/* Developer Support Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-brand-500" />
                Developer Support
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Need high-concurrency enterprise keys, bulk export or custom database?
              </p>
              <a
                href="mailto:contact@aarecords.tech"
                className="text-brand-600 dark:text-brand-400 font-mono text-[11px] hover:underline block"
              >
                contact@aarecords.tech &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-12">
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-4 scroll-mt-32">
            <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-500" />
              <span>Base URLs & Architecture</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              All API requests must be transmitted over HTTPS. The service runs low-latency vector retrieval engines with deterministic entity metadata crosswalks.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <div className="text-[11px] font-mono text-emerald-500 font-semibold uppercase">
                  Production API Gateway
                </div>
                <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 font-bold select-all">
                  https://api.aarecords.tech
                </div>
                <div className="text-[11px] text-zinc-500">
                  High-availability global edge network with low-latency routing and SLA guarantees.
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Authentication */}
          <section id="auth" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
              <span>Authentication</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Authenticate requests using your API key. Pass it in the <code className="font-mono text-brand-600 dark:text-brand-400">X-API-Key</code> request header (recommended) or as a Bearer token in the <code className="font-mono text-brand-600 dark:text-brand-400">Authorization</code> header.
            </p>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 font-mono text-xs space-y-1">
              <div className="text-zinc-400">// Recommended header:</div>
              <div>X-API-Key: aar_live_xxxxxxxxxxxxxxxxxxxxxxxx</div>
              <div className="text-zinc-400 pt-2">// Or Bearer token:</div>
              <div>Authorization: Bearer aar_live_xxxxxxxxxxxxxxxxxxxxxxxx</div>
            </div>
          </section>

          {/* Section 3: POST /search */}
          <section id="search" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /search
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Performs dense vector and hybrid lexical matching across 146,140 canonical works (anime, manga, light novels, visual novels, manhwa, manhua). Returns ranked works with cross-database IDs and similarity scores.
            </p>

            {/* Code Snippet Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.search[selectedLang], 'code_search')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_search' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_search' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.search[selectedLang]}
              </pre>
            </div>

            {/* Schema Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">question</td>
                    <td className="p-3 text-zinc-400">string</td>
                    <td className="p-3 text-emerald-500">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Natural language query, plot premise, or descriptive trope (accepts alias <code>query</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">limit</td>
                    <td className="p-3 text-zinc-400">integer</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Number of records to return (default 8, max 50).</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">mode</td>
                    <td className="p-3 text-zinc-400">string</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans"><code>"hybrid"</code> (reciprocal rank fusion) or <code>"semantic"</code>.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">scope.types</td>
                    <td className="p-3 text-zinc-400">array[string]</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Filter by media types: <code>["anime", "manga", "visual_novel", "light_novel", "manhwa", "manhua"]</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: POST /recommend */}
          <section id="recommend" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /recommend
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Multi-seed work recommendation engine utilizing franchise relation graphs and vector centroids. Supports up to 100 positive seeds and 100 negative disliked seeds to dynamically steer recommendations away from unwanted tropes.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.recommend[selectedLang], 'code_recommend')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_recommend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_recommend' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.recommend[selectedLang]}
              </pre>
            </div>

            {/* Schema Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">seed_work_ids</td>
                    <td className="p-3 text-zinc-400">array[string]</td>
                    <td className="p-3 text-emerald-500">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Array of 1 to 100 canonical work IDs or raw integer IDs (e.g. <code>["9253"]</code> or <code>["work:anime:mal_9253_al_9253"]</code>).</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">negative_work_ids</td>
                    <td className="p-3 text-zinc-400">array[string]</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Optional array of disliked work IDs to subtract from the recommendation centroid.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">target_scope</td>
                    <td className="p-3 text-zinc-400">string</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Scope output to specific media: <code>"anime"</code>, <code>"manga"</code>, <code>"visual_novel"</code>, etc.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">exclude_same_franchise</td>
                    <td className="p-3 text-zinc-400">boolean</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Suppress sequels, prequels, and spin-offs (default true).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: POST /ask */}
          <section id="ask" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /ask
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Retrieval-Augmented Generation (RAG) synthesizing answers across canonical catalog works. Provides cited facts, character abilities, and thematic analyses.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.ask[selectedLang], 'code_ask')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_ask' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_ask' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.ask[selectedLang]}
              </pre>
            </div>
          </section>

          {/* Section 6: POST /advanced-search */}
          <section id="advanced-search" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /advanced-search
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Precision Scene Search across 762,318 second-exact anime scenes across 102,264 episodes and 7,535 series. Returns exact timestamps down to the second, dialogue excerpts, characters present, setting locations, and dramatic lore concepts.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.advancedSearch[selectedLang], 'code_adv_search')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_adv_search' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_adv_search' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.advancedSearch[selectedLang]}
              </pre>
            </div>

            {/* Schema Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">query</td>
                    <td className="p-3 text-zinc-400">string</td>
                    <td className="p-3 text-emerald-500">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Descriptive scene actions, visual framing, or spoken dialogue.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">granularity</td>
                    <td className="p-3 text-zinc-400">string</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans"><code>"scene"</code> (second-exact), <code>"episode"</code>, or <code>"arc"</code>.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">limit</td>
                    <td className="p-3 text-zinc-400">integer</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Max results to return (default 10, max 50).</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-brand-600 dark:text-brand-400 font-bold">use_reranker</td>
                    <td className="p-3 text-zinc-400">boolean</td>
                    <td className="p-3 text-zinc-500">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Applies cross-encoder neural reranking for pinpoint precision (default true).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7: POST /advanced-recommend */}
          <section id="advanced-recommend" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /advanced-recommend
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Granular Rocchio semantic recommendation operating at the Scene, Episode, or Story Arc level. Discovers similar dramatic climaxes and narrative developments across different anime.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.advancedRecommend[selectedLang], 'code_adv_rec')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_adv_rec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_adv_rec' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.advancedRecommend[selectedLang]}
              </pre>
            </div>
          </section>

          {/* Section 8: POST /lore-ask */}
          <section id="lore-ask" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                POST
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /lore-ask
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Deep Lore Question Answering with second-exact episode timestamp citations. Synthesizes explanations grounded in concrete on-screen actions and verified dialogue.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.loreAsk[selectedLang], 'code_lore_ask')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_lore_ask' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_lore_ask' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.loreAsk[selectedLang]}
              </pre>
            </div>
          </section>

          {/* Section 9: GET /lore/arc-index */}
          <section id="arcs" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-xs font-bold">
                GET
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /lore/arc-index
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Retrieves the comprehensive index of 10,565 structured story arcs. Also supports fetching all arcs for a specific anime via <code>GET /lore/arc-index/&#123;work_id&#125;</code>.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.arcs[selectedLang], 'code_arcs')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_arcs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_arcs' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.arcs[selectedLang]}
              </pre>
            </div>
          </section>

          {/* Section 10: Autocomplete & Resolve */}
          <section id="autocomplete" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-xs font-bold">
                GET
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /autocomplete & /resolve
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sub-10ms prefix autocomplete and cross-database ID resolution across MyAnimeList, AniList, TMDB, AniDB, and VNDB.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.autocomplete[selectedLang], 'code_auto')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_auto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_auto' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.autocomplete[selectedLang]}
              </pre>
            </div>
          </section>

          {/* Section 11: GET /health & /stats */}
          <section id="health" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-xs font-bold">
                GET
              </span>
              <h2 className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                /health & /stats
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              System health and real-time database telemetry.
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span>Request Example ({selectedLang})</span>
                <button
                  onClick={() => handleCopy(codeSnippets.health[selectedLang], 'code_health')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedId === 'code_health' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code_health' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                {codeSnippets.health[selectedLang]}
              </pre>
            </div>

            {/* Health Response Payload Preview */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300">
              <div className="text-zinc-500 mb-2">// Sample Live Telemetry Response:</div>
              <pre className="overflow-x-auto text-[11px] text-emerald-400">
{`{
  "status": "healthy",
  "version": "2.4.0",
  "uptime_seconds": 1284.5,
  "stats": {
    "total_works": 146140,
    "media_breakdown": {
      "manga": 69862,
      "anime": 37025,
      "visual_novel": 20002,
      "light_novel": 11717,
      "manhwa": 7070,
      "manhua": 464
    },
    "indexed_scenes": 762318,
    "indexed_episodes": 102264,
    "story_arcs": 10565
  }
}`}
              </pre>
            </div>
          </section>

          {/* Section 12: External ID Crosswalk */}
          <section id="crosswalk" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-brand-500" />
              <span>External ID Crosswalk</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every record in the catalog maintains cross-linked mappings to major anime and manga databases. You can query any endpoint using external database identifiers:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'MyAnimeList', key: 'mal_id', ex: 'mal:9253' },
                { name: 'AniList', key: 'anilist_id', ex: 'anilist:9253' },
                { name: 'TMDB', key: 'tmdb_id', ex: 'tmdb:tv/43818' },
                { name: 'AniDB', key: 'anidb_id', ex: 'anidb:9541' },
                { name: 'VNDB', key: 'vndb_id', ex: 'vndb:v1234' },
                { name: 'Anime-Planet', key: 'anime_planet_slug', ex: 'ap:steins-gate' }
              ].map((prov) => (
                <div key={prov.key} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{prov.name}</div>
                  <div className="text-brand-600 dark:text-brand-400 text-[11px]">{prov.key}</div>
                  <div className="text-zinc-400 text-[10px] mt-1">{prov.ex}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 13: Errors & Rate Limits */}
          <section id="errors" className="space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8">
            <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
              HTTP Status Codes & Rate Limits
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <tr>
                    <th className="p-3">Status Code</th>
                    <th className="p-3">Meaning</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <tr>
                    <td className="p-3 text-emerald-500 font-bold">200 OK</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Request processed successfully.</td>
                    <td className="p-3 text-zinc-400 font-sans">Parse JSON payload.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-amber-500 font-bold">400 Bad Request</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Missing required fields or invalid parameters.</td>
                    <td className="p-3 text-zinc-400 font-sans">Verify parameter names and schemas.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-red-500 font-bold">401 Unauthorized</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Invalid, revoked, or missing API key.</td>
                    <td className="p-3 text-zinc-400 font-sans">Check <code>X-API-Key</code> header.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-purple-500 font-bold">429 Rate Limit</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-300 font-sans">Rate limit or monthly quota exceeded.</td>
                    <td className="p-3 text-zinc-400 font-sans">Implement exponential backoff or upgrade tier.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
