import{j as e,a as N}from"./index-Cee2kraE.js";import{r as x,C as y,a6 as g,a7 as v,a4 as k,n as c,o,G as w}from"./vendor-icons-CTs3o23t.js";import"./vendor-react-CC545wQy.js";function C(){const[a,b]=x.useState(null),[s,z]=x.useState("curl"),[m,j]=x.useState("overview"),h=x.useRef(null),d=async(t,n)=>{await N(t),b(n),setTimeout(()=>b(null),2e3)},l=[{id:"overview",title:"Overview & Base URLs"},{id:"auth",title:"Authentication"},{id:"search",title:"POST /search (Catalog Discovery)"},{id:"recommend",title:"POST /recommend (Multi-Seed Graph)"},{id:"ask",title:"POST /ask (Catalog Lore RAG)"},{id:"advanced-search",title:"POST /advanced-search (Scene Finder)"},{id:"advanced-recommend",title:"POST /advanced-recommend (Granular)"},{id:"lore-ask",title:"POST /lore-ask (Exact Timestamp RAG)"},{id:"arcs",title:"GET /lore/arc-index (Story Arcs)"},{id:"autocomplete",title:"GET /autocomplete & /resolve"},{id:"health",title:"GET /health & /stats"},{id:"crosswalk",title:"External ID Crosswalk"},{id:"errors",title:"Errors & Rate Limits"}];x.useEffect(()=>{const t=()=>{let i=l[0].id;for(const p of l){const f=document.getElementById(p.id);f&&f.getBoundingClientRect().top<=150&&(i=p.id)}window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-80&&(i=l[l.length-1].id),j(i)};return window.addEventListener("scroll",t,{passive:!0}),t(),()=>window.removeEventListener("scroll",t)},[]),x.useEffect(()=>{if(!h.current)return;const t=h.current.querySelector(`[data-sec="${m}"]`);if(t){const n=h.current,i=t.offsetLeft-n.clientWidth/2+t.clientWidth/2;n.scrollTo({left:Math.max(0,i),behavior:"smooth"})}},[m]);const u=(t,n)=>{t.preventDefault(),j(n);const i=document.getElementById(n);if(i){const p=i.getBoundingClientRect().top+window.scrollY-125;window.scrollTo({top:Math.max(0,p),behavior:"smooth"}),window.history.replaceState(null,"",`#${n}`)}},r={search:{curl:`curl -X POST https://api.aarecords.tech/search \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "question": "Children pilot a giant robot powered by their own life force where the pilot dies after every battle",
    "limit": 5,
    "mode": "hybrid",
    "scope": {
      "types": ["anime"]
    }
  }'`,python:`import requests

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
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/search', {
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
console.log(data);`},recommend:{curl:`curl -X POST https://api.aarecords.tech/recommend \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "seed_work_ids": ["work:anime:mal_9253_al_9253"],
    "negative_work_ids": [],
    "target_scope": "anime",
    "limit": 5,
    "exclude_same_franchise": true
  }'`,python:`import requests

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
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/recommend', {
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
console.log(data);`},ask:{curl:`curl -X POST https://api.aarecords.tech/ask \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "question": "What is the true nature of the Akashic Records in anime lore?",
    "limit": 3
  }'`,python:`import requests

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
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/ask', {
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
console.log(data);`},advancedSearch:{curl:`curl -X POST https://api.aarecords.tech/advanced-search \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "query": "Children inside a giant robot cockpit learning the pilot will die after the battle",
    "granularity": "scene",
    "limit": 5,
    "use_reranker": true
  }'`,python:`import requests

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
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/advanced-search', {
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
console.log(data);`},advancedRecommend:{curl:`curl -X POST https://api.aarecords.tech/advanced-recommend \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "granularity": "scene",
    "positive_queries": ["Mind game cat-and-mouse duel between detective and vigilante"],
    "limit": 5
  }'`,python:`import requests

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
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/advanced-recommend', {
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
console.log(data);`},loreAsk:{curl:`curl -X POST https://api.aarecords.tech/lore-ask \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "query": "Who is Twenty Faces and what is his philosophy in Rampo Kitan?",
    "granularity": "scene",
    "limit": 4
  }'`,python:`import requests

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
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/lore-ask', {
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
console.log(data);`},arcs:{curl:`curl -X GET "https://api.aarecords.tech/lore/arc-index?limit=5" \\
  -H "X-API-Key: YOUR_API_KEY"`,python:`import requests

url = "https://api.aarecords.tech/lore/arc-index"
headers = {"X-API-Key": "YOUR_API_KEY"}
params = {"limit": 5}

response = requests.get(url, headers=headers, params=params)
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/lore/arc-index?limit=5', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
const data = await response.json();
console.log(data);`},autocomplete:{curl:`curl -X GET "https://api.aarecords.tech/autocomplete?q=Steins" \\
  -H "X-API-Key: YOUR_API_KEY"`,python:`import requests

url = "https://api.aarecords.tech/autocomplete"
headers = {"X-API-Key": "YOUR_API_KEY"}
params = {"q": "Steins"}

response = requests.get(url, headers=headers, params=params)
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/autocomplete?q=Steins', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
const data = await response.json();
console.log(data);`},health:{curl:'curl -X GET "https://api.aarecords.tech/health"',python:`import requests

response = requests.get("https://api.aarecords.tech/health")
print(response.json())`,js:`const response = await fetch('https://api.aarecords.tech/health');
const data = await response.json();
console.log(data);`}};return e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12",children:[e.jsxs("div",{className:"mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs font-mono text-brand-600 dark:text-brand-400 mb-2",children:[e.jsx(y,{className:"w-4 h-4"}),e.jsx("span",{children:"DEVELOPER DOCUMENTATION & REST SPECIFICATION"})]}),e.jsx("h1",{className:"font-sans font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100",children:"AAR API Reference"}),e.jsx("p",{className:"text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-3xl leading-relaxed",children:"Comprehensive REST API specification for semantic work retrieval across 146,140 work metadata records and precision scene discovery across 7,535 indexed anime profiles, 102,264 episodes, 762,318+ scene timestamp citations, and 10,565 story arc index records."}),e.jsxs("div",{className:"flex items-center gap-2 mt-6",children:[e.jsx("span",{className:"text-xs font-mono text-zinc-400 mr-2",children:"Language:"}),["curl","python","js"].map(t=>e.jsx("button",{onClick:()=>z(t),className:`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${s===t?"bg-brand-500 text-white font-semibold":"bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"}`,children:t==="js"?"JavaScript":t==="python"?"Python":"cURL"},t))]})]}),e.jsxs("div",{className:"relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start",children:[e.jsx("div",{className:"lg:hidden sticky top-16 z-30 -mx-4 px-4 py-2.5 bg-[#FAF6F0]/95 dark:bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm",children:e.jsx("div",{ref:h,className:"flex items-center gap-2 overflow-x-auto tabs-scrollbar pb-1 flex-nowrap scroll-smooth touch-pan-x",children:l.map(t=>{const n=m===t.id;return e.jsx("a",{"data-sec":t.id,href:`#${t.id}`,onClick:i=>u(i,t.id),className:`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${n?"bg-brand-600 text-white border-brand-500 font-semibold shadow-sm shadow-brand-500/25":"bg-zinc-100 dark:bg-zinc-900/90 border-zinc-200/70 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"}`,children:t.title},t.id)})})}),e.jsx("div",{className:"hidden lg:block lg:col-span-3 sticky top-20 self-start",children:e.jsxs("div",{className:"space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1",children:[e.jsx("span",{className:"text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold",children:"Endpoints & Guides"}),e.jsx("div",{className:"space-y-1",children:l.map(t=>{const n=m===t.id;return e.jsx("a",{href:`#${t.id}`,onClick:i=>u(i,t.id),className:`block px-3 py-1.5 text-xs rounded-lg transition-all duration-200 truncate border-l-2 ${n?"bg-brand-500/15 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border-brand-500 font-semibold shadow-xs":"border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium"}`,children:t.title},t.id)})}),e.jsxs("div",{className:"p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-2",children:[e.jsxs("span",{className:"font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5",children:[e.jsx(g,{className:"w-3.5 h-3.5 text-brand-500"}),"Developer Support"]}),e.jsx("p",{className:"text-zinc-500 text-[11px] leading-relaxed",children:"Need high-concurrency enterprise keys, bulk export or custom database?"}),e.jsx("a",{href:"mailto:contact@aarecords.tech",className:"text-brand-600 dark:text-brand-400 font-mono text-[11px] hover:underline block",children:"contact@aarecords.tech →"})]})]})}),e.jsxs("div",{className:"lg:col-span-9 space-y-12",children:[e.jsxs("section",{id:"overview",className:"space-y-4 scroll-mt-32",children:[e.jsxs("h2",{className:"font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2",children:[e.jsx(v,{className:"w-5 h-5 text-brand-500"}),e.jsx("span",{children:"Base URLs & Architecture"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"All API requests must be transmitted over HTTPS. The service runs low-latency vector retrieval engines with deterministic entity metadata crosswalks."}),e.jsx("div",{className:"grid grid-cols-1 gap-4",children:e.jsxs("div",{className:"p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5",children:[e.jsx("div",{className:"text-[11px] font-mono text-emerald-500 font-semibold uppercase",children:"Production API Gateway"}),e.jsx("div",{className:"font-mono text-xs text-zinc-900 dark:text-zinc-100 font-bold select-all",children:"https://api.aarecords.tech"}),e.jsx("div",{className:"text-[11px] text-zinc-500",children:"High-availability global edge network with low-latency routing and SLA guarantees."})]})})]}),e.jsxs("section",{id:"auth",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("h2",{className:"font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2",children:[e.jsx(k,{className:"w-5 h-5 text-brand-500"}),e.jsx("span",{children:"Authentication"})]}),e.jsxs("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:["Authenticate requests using your API key. Pass it in the ",e.jsx("code",{className:"font-mono text-brand-600 dark:text-brand-400",children:"X-API-Key"})," request header (recommended) or as a Bearer token in the ",e.jsx("code",{className:"font-mono text-brand-600 dark:text-brand-400",children:"Authorization"})," header."]}),e.jsxs("div",{className:"p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 font-mono text-xs space-y-1",children:[e.jsx("div",{className:"text-zinc-400",children:"// Recommended header:"}),e.jsx("div",{children:"X-API-Key: aar_live_xxxxxxxxxxxxxxxxxxxxxxxx"}),e.jsx("div",{className:"text-zinc-400 pt-2",children:"// Or Bearer token:"}),e.jsx("div",{children:"Authorization: Bearer aar_live_xxxxxxxxxxxxxxxxxxxxxxxx"})]})]}),e.jsxs("section",{id:"search",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold",children:"POST"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/search"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Performs dense vector and hybrid lexical matching across 146,140 canonical works (anime, manga, light novels, visual novels, manhwa, manhua). Returns ranked works with cross-database IDs and similarity scores."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.search[s],"code_search"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_search"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_search"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.search[s]})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden",children:[e.jsx("thead",{className:"bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-3",children:"Parameter"}),e.jsx("th",{className:"p-3",children:"Type"}),e.jsx("th",{className:"p-3",children:"Required"}),e.jsx("th",{className:"p-3",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-zinc-200 dark:divide-zinc-800",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"question"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"string"}),e.jsx("td",{className:"p-3 text-emerald-500",children:"true"}),e.jsxs("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:["Natural language query, plot premise, or descriptive trope (accepts alias ",e.jsx("code",{children:"query"}),")."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"limit"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"integer"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Number of records to return (default 8, max 50)."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"mode"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"string"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsxs("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:[e.jsx("code",{children:'"hybrid"'})," (reciprocal rank fusion) or ",e.jsx("code",{children:'"semantic"'}),"."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"scope.types"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"array[string]"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsxs("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:["Filter by media types: ",e.jsx("code",{children:'["anime", "manga", "visual_novel", "light_novel", "manhwa", "manhua"]'}),"."]})]})]})]})})]}),e.jsxs("section",{id:"recommend",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold",children:"POST"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/recommend"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Multi-seed work recommendation engine utilizing franchise relation graphs and vector centroids. Supports up to 100 positive seeds and 100 negative disliked seeds to dynamically steer recommendations away from unwanted tropes."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.recommend[s],"code_recommend"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_recommend"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_recommend"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.recommend[s]})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden",children:[e.jsx("thead",{className:"bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-3",children:"Parameter"}),e.jsx("th",{className:"p-3",children:"Type"}),e.jsx("th",{className:"p-3",children:"Required"}),e.jsx("th",{className:"p-3",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-zinc-200 dark:divide-zinc-800",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"seed_work_ids"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"array[string]"}),e.jsx("td",{className:"p-3 text-emerald-500",children:"true"}),e.jsxs("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:["Array of 1 to 100 canonical work IDs or raw integer IDs (e.g. ",e.jsx("code",{children:'["9253"]'})," or ",e.jsx("code",{children:'["work:anime:mal_9253_al_9253"]'}),")."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"negative_work_ids"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"array[string]"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Optional array of disliked work IDs to subtract from the recommendation centroid."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"target_scope"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"string"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsxs("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:["Scope output to specific media: ",e.jsx("code",{children:'"anime"'}),", ",e.jsx("code",{children:'"manga"'}),", ",e.jsx("code",{children:'"visual_novel"'}),", etc."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"exclude_same_franchise"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"boolean"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Suppress sequels, prequels, and spin-offs (default true)."})]})]})]})})]}),e.jsxs("section",{id:"ask",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold",children:"POST"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/ask"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Retrieval-Augmented Generation (RAG) synthesizing answers across canonical catalog works. Provides cited facts, character abilities, and thematic analyses."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.ask[s],"code_ask"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_ask"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_ask"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.ask[s]})]})]}),e.jsxs("section",{id:"advanced-search",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold",children:"POST"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/advanced-search"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Precision Scene Search across 762,318 second-exact anime scenes across 102,264 episodes and 7,535 series. Returns exact timestamps down to the second, dialogue excerpts, characters present, setting locations, and dramatic lore concepts."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.advancedSearch[s],"code_adv_search"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_adv_search"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_adv_search"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.advancedSearch[s]})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden",children:[e.jsx("thead",{className:"bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-3",children:"Parameter"}),e.jsx("th",{className:"p-3",children:"Type"}),e.jsx("th",{className:"p-3",children:"Required"}),e.jsx("th",{className:"p-3",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-zinc-200 dark:divide-zinc-800",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"query"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"string"}),e.jsx("td",{className:"p-3 text-emerald-500",children:"true"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Descriptive scene actions, visual framing, or spoken dialogue."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"granularity"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"string"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsxs("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:[e.jsx("code",{children:'"scene"'})," (second-exact), ",e.jsx("code",{children:'"episode"'}),", or ",e.jsx("code",{children:'"arc"'}),"."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"limit"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"integer"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Max results to return (default 10, max 50)."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-brand-600 dark:text-brand-400 font-bold",children:"use_reranker"}),e.jsx("td",{className:"p-3 text-zinc-400",children:"boolean"}),e.jsx("td",{className:"p-3 text-zinc-500",children:"false"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Applies cross-encoder neural reranking for pinpoint precision (default true)."})]})]})]})})]}),e.jsxs("section",{id:"advanced-recommend",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold",children:"POST"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/advanced-recommend"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Granular Rocchio semantic recommendation operating at the Scene, Episode, or Story Arc level. Discovers similar dramatic climaxes and narrative developments across different anime."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.advancedRecommend[s],"code_adv_rec"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_adv_rec"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_adv_rec"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.advancedRecommend[s]})]})]}),e.jsxs("section",{id:"lore-ask",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold",children:"POST"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/lore-ask"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Deep Lore Question Answering with second-exact episode timestamp citations. Synthesizes explanations grounded in concrete on-screen actions and verified dialogue."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.loreAsk[s],"code_lore_ask"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_lore_ask"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_lore_ask"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.loreAsk[s]})]})]}),e.jsxs("section",{id:"arcs",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-xs font-bold",children:"GET"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/lore/arc-index"})]}),e.jsxs("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:["Retrieves the comprehensive index of 10,565 structured story arcs. Also supports fetching all arcs for a specific anime via ",e.jsx("code",{children:"GET /lore/arc-index/{work_id}"}),"."]}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.arcs[s],"code_arcs"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_arcs"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_arcs"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.arcs[s]})]})]}),e.jsxs("section",{id:"autocomplete",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-xs font-bold",children:"GET"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/autocomplete & /resolve"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Sub-10ms prefix autocomplete and cross-database ID resolution across MyAnimeList, AniList, TMDB, AniDB, and VNDB."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.autocomplete[s],"code_auto"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_auto"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_auto"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.autocomplete[s]})]})]}),e.jsxs("section",{id:"health",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-xs font-bold",children:"GET"}),e.jsx("h2",{className:"font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100",children:"/health & /stats"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"System health and real-time database telemetry."}),e.jsxs("div",{className:"rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400",children:[e.jsxs("span",{children:["Request Example (",s,")"]}),e.jsxs("button",{onClick:()=>d(r.health[s],"code_health"),className:"flex items-center gap-1 hover:text-white transition-colors",children:[a==="code_health"?e.jsx(c,{className:"w-3.5 h-3.5 text-emerald-400"}):e.jsx(o,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:a==="code_health"?"Copied":"Copy"})]})]}),e.jsx("pre",{className:"p-4 font-mono text-xs text-zinc-200 overflow-x-auto",children:r.health[s]})]}),e.jsxs("div",{className:"p-4 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300",children:[e.jsx("div",{className:"text-zinc-500 mb-2",children:"// Sample Live Telemetry Response:"}),e.jsx("pre",{className:"overflow-x-auto text-[11px] text-emerald-400",children:`{
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
}`})]})]}),e.jsxs("section",{id:"crosswalk",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsxs("h2",{className:"font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2",children:[e.jsx(w,{className:"w-5 h-5 text-brand-500"}),e.jsx("span",{children:"External ID Crosswalk"})]}),e.jsx("p",{className:"text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed",children:"Every record in the catalog maintains cross-linked mappings to major anime and manga databases. You can query any endpoint using external database identifiers:"}),e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 gap-3",children:[{name:"MyAnimeList",key:"mal_id",ex:"mal:9253"},{name:"AniList",key:"anilist_id",ex:"anilist:9253"},{name:"TMDB",key:"tmdb_id",ex:"tmdb:tv/43818"},{name:"AniDB",key:"anidb_id",ex:"anidb:9541"},{name:"VNDB",key:"vndb_id",ex:"vndb:v1234"},{name:"Anime-Planet",key:"anime_planet_slug",ex:"ap:steins-gate"}].map(t=>e.jsxs("div",{className:"p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs",children:[e.jsx("div",{className:"font-bold text-zinc-900 dark:text-zinc-100",children:t.name}),e.jsx("div",{className:"text-brand-600 dark:text-brand-400 text-[11px]",children:t.key}),e.jsx("div",{className:"text-zinc-400 text-[10px] mt-1",children:t.ex})]},t.key))})]}),e.jsxs("section",{id:"errors",className:"space-y-4 scroll-mt-32 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-8",children:[e.jsx("h2",{className:"font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100",children:"HTTP Status Codes & Rate Limits"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden",children:[e.jsx("thead",{className:"bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-3",children:"Status Code"}),e.jsx("th",{className:"p-3",children:"Meaning"}),e.jsx("th",{className:"p-3",children:"Action"})]})}),e.jsxs("tbody",{className:"divide-y divide-zinc-200 dark:divide-zinc-800",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-emerald-500 font-bold",children:"200 OK"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Request processed successfully."}),e.jsx("td",{className:"p-3 text-zinc-400 font-sans",children:"Parse JSON payload."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-amber-500 font-bold",children:"400 Bad Request"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Missing required fields or invalid parameters."}),e.jsx("td",{className:"p-3 text-zinc-400 font-sans",children:"Verify parameter names and schemas."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-red-500 font-bold",children:"401 Unauthorized"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Invalid, revoked, or missing API key."}),e.jsxs("td",{className:"p-3 text-zinc-400 font-sans",children:["Check ",e.jsx("code",{children:"X-API-Key"})," header."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"p-3 text-purple-500 font-bold",children:"429 Rate Limit"}),e.jsx("td",{className:"p-3 text-zinc-600 dark:text-zinc-300 font-sans",children:"Rate limit or monthly quota exceeded."}),e.jsx("td",{className:"p-3 text-zinc-400 font-sans",children:"Implement exponential backoff or upgrade tier."})]})]})]})})]})]})]})]})}export{C as ApiDocs};
