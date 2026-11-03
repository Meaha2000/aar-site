import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  Database,
  Layers,
  Calculator,
  ArrowRight,
  Cpu,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QUOTA_TYPES = [
  {
    id: 'normal',
    title: 'Normal Search Quota',
    badge: 'Catalog & Semantic Discovery',
    color: 'brand',
    paygPerOp: '$0.003',
    paygPer1k: '$3.00',
    opsPer10Usd: '3,333 ops',
    endpoints: ['POST /search', 'POST /ask (LLM Catalog Filter)', 'POST /recommend', 'GET /recommend/{id}'],
    description:
      'Covers hybrid semantic + lexical discovery across all 146,140 work metadata records (Anime, Manga, Manhwa, Manhua, Light Novels, Visual Novels), graph-based work recommendations, and LLM-verified plot matching. Utility endpoints (/resolve, /autocomplete) are included free of charge.'
  },
  {
    id: 'advanced',
    title: 'Advanced Lore & RAG Quota',
    badge: 'Scene / Episode / Arc Engine',
    color: 'amber',
    paygPerOp: '$0.005',
    paygPer1k: '$5.00',
    opsPer10Usd: '2,000 ops',
    endpoints: ['POST /advanced-search', 'POST /lore-ask (Deep Lore RAG)', 'POST /advanced-recommend', 'GET /lore/arc-index/{id}'],
    description:
      'Covers deep sub-episode search across 762,318+ scene timestamp citations in 7,535 indexed anime profiles (102,264 episodes & 10,565 narrative arcs), plus grounded LLM RAG synthesis with exact episode and timestamp citations.'
  }
];

const PLANS = [
  {
    id: 'free_sandbox',
    name: 'Free Sandbox',
    price: 0,
    period: 'forever',
    tagline: 'Daily-refreshing sandbox for quick testing & integration prototyping.',
    highlight: false,
    quotas: {
      normal: '30 / day (~900/mo)',
      advanced: '5 / day (~150/mo)',
      normalNum: 900,
      advancedNum: 150
    },
    unitEconomics: {
      normalRate: '$0.00 / 1k',
      advancedRate: '$0.00 / 1k',
      planValue: '$3.45 / mo (Free)'
    },
    limits: {
      rps: '1 RPS',
      rpm: '20 RPM',
      llmRpm: '5 RPM'
    },
    features: [
      '30 Normal catalog + 5 Advanced scene/lore queries daily',
      'Metadata & timestamp citation search across 146k+ works',
      'Free ID Crosswalk & Autocomplete (/resolve, /autocomplete)',
      '1 RPS · 20 RPM throughput + PAYG wallet overflow support'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    period: 'per month',
    tagline: 'Built for indie anime apps, Discord bots, and community trackers.',
    highlight: false,
    quotas: {
      normal: '3,500 / month',
      advanced: '300 / month',
      normalNum: 3500,
      advancedNum: 300
    },
    unitEconomics: {
      normalRate: '$2.50 / 1k ($0.0025/op)',
      advancedRate: '$4.17 / 1k ($0.0042/op)',
      planValue: '$12.00 PAYG Value (+20% Bonus)'
    },
    limits: {
      rps: '5 RPS',
      rpm: '100 RPM',
      llmRpm: '15 RPM'
    },
    features: [
      '3,500 Normal + 300 Advanced Lore & RAG queries/mo',
      '5 RPS burst concurrency · 100 RPM · 15 LLM RAG RPM',
      'Free ID Crosswalk & Autocomplete (/resolve, /autocomplete)',
      'Automatic PAYG wallet fallback & mid-cycle tier upgrades'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    period: 'per month',
    tagline: 'Full-stack production tier for high-traffic discovery platforms & RAG apps.',
    highlight: true,
    badge: 'Most Popular',
    quotas: {
      normal: '10,000 / month',
      advanced: '1,200 / month',
      normalNum: 10000,
      advancedNum: 1200
    },
    unitEconomics: {
      normalRate: '$2.50 / 1k ($0.0025/op)',
      advancedRate: '$4.17 / 1k ($0.0042/op)',
      planValue: '$36.00 PAYG Value (+20% Bonus)'
    },
    limits: {
      rps: '15 RPS',
      rpm: '300 RPM',
      llmRpm: '40 RPM'
    },
    features: [
      '10,000 Normal + 1,200 Advanced Lore & RAG queries/mo',
      '15 RPS burst concurrency · 300 RPM · 40 LLM RAG RPM',
      'Free ID Crosswalk & Autocomplete (/resolve, /autocomplete)',
      'Priority routing & zero-downtime PAYG wallet overflow'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 59.99,
    period: 'per month',
    tagline: 'High-concurrency infrastructure for large media networks & AI agents.',
    highlight: false,
    quotas: {
      normal: '20,000 / month',
      advanced: '2,400 / month',
      normalNum: 20000,
      advancedNum: 2400
    },
    unitEconomics: {
      normalRate: '$2.50 / 1k ($0.0025/op)',
      advancedRate: '$4.17 / 1k ($0.0042/op)',
      planValue: '$72.00 PAYG Value (+20% Bonus)'
    },
    limits: {
      rps: '30 RPS',
      rpm: '600 RPM',
      llmRpm: '80 RPM'
    },
    features: [
      '20,000 Normal + 2,400 Advanced Lore & RAG queries/mo',
      '30 RPS burst concurrency · 600 RPM · 80 LLM RAG RPM',
      'Free ID Crosswalk & Autocomplete (/resolve, /autocomplete)',
      'Dedicated engineering support & SLA priority routing'
    ]
  }
];

export function Pricing() {
  const { user, openAuthModal } = useAuth();

  const [calcNormal, setCalcNormal] = useState(10000);
  const [calcAdvanced, setCalcAdvanced] = useState(1200);

  const purePaygCost = calcNormal * 0.003 + calcAdvanced * 0.005;

  const computePlanTotal = (plan) => {
    if (plan.id === 'free_sandbox') {
      const remN = Math.max(0, calcNormal - 900);
      const remA = Math.max(0, calcAdvanced - 150);
      return remN * 0.003 + remA * 0.005;
    }
    const remN = Math.max(0, calcNormal - plan.quotas.normalNum);
    const remA = Math.max(0, calcAdvanced - plan.quotas.advancedNum);
    return plan.price + remN * 0.003 + remA * 0.005;
  };

  const planComparisons = [
    {
      name: 'Pure Pay-As-You-Go (No Plan)',
      base: 0,
      total: purePaygCost,
      sub: 'No monthly commitment · credits never expire'
    },
    ...PLANS.filter((p) => p.id !== 'free_sandbox').map((p) => {
      const total = computePlanTotal(p);
      const overflow = Math.max(0, total - p.price);
      return {
        name: `${p.name} Plan ($${p.price}/mo)`,
        base: p.price,
        total,
        sub:
          overflow > 0
            ? `Includes base quota + $${overflow.toFixed(2)} PAYG overflow`
            : '100% covered inside monthly plan quota'
      };
    })
  ];

  const bestOption = planComparisons.reduce((min, cur) => (cur.total < min.total ? cur : min), planComparisons[0]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-300 text-xs font-semibold tracking-wide uppercase mb-4">
          <Coins className="w-3.5 h-3.5" />
          <span>Transparent Developer Pricing & Unit Economics</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
          Exact Per-Query Pricing & Quota Architecture
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Predictable monthly subscriptions with <span className="font-semibold text-brand-600 dark:text-brand-400">20% bonus quota value</span> over raw Pay-As-You-Go rates, plus non-expiring wallet credits that automatically cover any traffic spikes.
        </p>
      </div>

      {/* Section 1: Search & Operation Types Breakdown */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-500" />
              <span>1. Quota Categories & Pay-As-You-Go Rates</span>
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Every API request maps to either Normal Catalog Search or Advanced Lore RAG. Utility endpoints (`/resolve`, `/autocomplete`) are free.
            </p>
          </div>
          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
            Minimum Wallet Top-Up: <span className="font-bold text-brand-600 dark:text-brand-400">$5.00 USD</span> (Never Expires)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {QUOTA_TYPES.map((qt) => (
            <div
              key={qt.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                    {qt.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{qt.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                  {qt.description}
                </p>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 mb-5">
                  <div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Per 1 Call</div>
                    <div className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white font-mono">
                      {qt.paygPerOp}
                    </div>
                  </div>
                  <div className="border-x border-zinc-200 dark:border-zinc-800 px-2">
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Per 1,000 Calls</div>
                    <div className="text-base sm:text-lg font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                      {qt.paygPer1k}
                    </div>
                  </div>
                  <div className="pl-1">
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Per $10 Top-Up</div>
                    <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {qt.opsPer10Usd}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Included Endpoints:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {qt.endpoints.map((ep) => (
                    <span
                      key={ep}
                      className="text-xs font-mono px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
                    >
                      {ep}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Subscription Tier Cards */}
      <div className="mb-16">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-500" />
            <span>2. Monthly Subscription Plans & Included Quotas</span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            All plans consume included quotas first, then automatically fall back to your Pay-As-You-Go wallet if available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 flex flex-col justify-between relative transition-all ${
                plan.highlight
                  ? 'border-2 border-brand-500 bg-white dark:bg-zinc-900 shadow-xl shadow-brand-500/10'
                  : 'border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-600 text-white shadow">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                    ${plan.price}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">/{plan.period}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Quota Breakdown Box */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/90 border border-zinc-200/70 dark:border-zinc-800 mb-4 space-y-2 text-xs">
                  <div className="font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    Included Quotas
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Normal Search:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{plan.quotas.normal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Advanced Lore:</span>
                    <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{plan.quotas.advanced}</span>
                  </div>
                </div>

                {/* Unit Cost Breakdown */}
                <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/15 mb-4 space-y-1.5 text-xs">
                  <div className="font-semibold text-brand-700 dark:text-brand-300">
                    Effective Search Cost
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Normal Effective:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">{plan.unitEconomics.normalRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Advanced Effective:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">{plan.unitEconomics.advancedRate}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-brand-500/10">
                    <span className="text-zinc-500">Plan Value:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{plan.unitEconomics.planValue}</span>
                  </div>
                </div>

                {/* Rate Limits */}
                <div className="mb-4 text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Throughput Limits:</div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Burst RPS:</span>
                    <span>{plan.limits.rps}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Sustained RPM:</span>
                    <span>{plan.limits.rpm}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>LLM / RAG RPM:</span>
                    <span>{plan.limits.llmRpm}</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {user ? (
                <a
                  href="/dashboard"
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 ${
                    plan.highlight
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                      : 'bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white'
                  }`}
                >
                  <span>Manage in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => openAuthModal('signup')}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 ${
                    plan.highlight
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                      : 'bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white'
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Full Side-by-Side Comparison Matrix Table */}
      <div className="mb-16">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-500" />
            <span>3. Complete Plan & Unit-Cost Comparison Table</span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Exact side-by-side breakdown of quotas, per-operation unit prices, per-1,000 rates, and concurrency limits.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60">
                <th className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white">Metric / Feature</th>
                <th className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Free Sandbox</th>
                <th className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Starter ($9.99)</th>
                <th className="py-3.5 px-4 font-bold text-brand-600 dark:text-brand-400">Pro ($29.99)</th>
                <th className="py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300">Business ($59.99)</th>
                <th className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">PAYG Wallet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70 font-mono text-xs">
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">Billing Cycle</td>
                <td className="py-3 px-4">Daily Reset</td>
                <td className="py-3 px-4">Monthly (30d)</td>
                <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">Monthly (30d)</td>
                <td className="py-3 px-4">Monthly (30d)</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Never Expires</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">Normal Search Quota (`/search`, `/ask`, `/recommend`)</td>
                <td className="py-3 px-4">30 / day</td>
                <td className="py-3 px-4">3,500 / mo</td>
                <td className="py-3 px-4 font-bold">10,000 / mo</td>
                <td className="py-3 px-4">20,000 / mo</td>
                <td className="py-3 px-4">$0.003 / op ($3.00 / 1k)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">Advanced Lore Quota (`/advanced-search`, `/lore-ask`, `/lore/arc-index`)</td>
                <td className="py-3 px-4">5 / day</td>
                <td className="py-3 px-4">300 / mo</td>
                <td className="py-3 px-4 font-bold">1,200 / mo</td>
                <td className="py-3 px-4">2,400 / mo</td>
                <td className="py-3 px-4">$0.005 / op ($5.00 / 1k)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">ID Crosswalk & Autocomplete (`/resolve`, `/autocomplete`)</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Free</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Free</td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">Free</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Free</td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Free</td>
              </tr>
              <tr className="bg-zinc-50/60 dark:bg-zinc-950/40">
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">Equivalent PAYG Value of Plan Quotas (+20% Bonus)</td>
                <td className="py-3 px-4">$3.45 / mo</td>
                <td className="py-3 px-4">$12.00 / mo</td>
                <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">$36.00 / mo</td>
                <td className="py-3 px-4">$72.00 / mo</td>
                <td className="py-3 px-4">1:1 Direct</td>
              </tr>
              <tr className="bg-zinc-50/60 dark:bg-zinc-950/40">
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">Effective Unit Cost Inside Plan (Normal / Advanced per 1k)</td>
                <td className="py-3 px-4">$0.00</td>
                <td className="py-3 px-4">$2.50 / $4.17 per 1k</td>
                <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">$2.50 / $4.17 per 1k</td>
                <td className="py-3 px-4">$2.50 / $4.17 per 1k</td>
                <td className="py-3 px-4">$3.00 / $5.00 per 1k</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">Rate Limit (Requests / Sec & Min)</td>
                <td className="py-3 px-4">1 RPS · 20 RPM</td>
                <td className="py-3 px-4">5 RPS · 100 RPM</td>
                <td className="py-3 px-4 font-bold">15 RPS · 300 RPM</td>
                <td className="py-3 px-4">30 RPS · 600 RPM</td>
                <td className="py-3 px-4">Inherits Tier</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-white">LLM RAG Rate Limit (`/ask` & `/lore-ask`)</td>
                <td className="py-3 px-4">5 RPM</td>
                <td className="py-3 px-4">15 RPM</td>
                <td className="py-3 px-4 font-bold">40 RPM</td>
                <td className="py-3 px-4">80 RPM</td>
                <td className="py-3 px-4">Inherits Tier</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Interactive Cost & Plan Calculator */}
      <div className="mb-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-500" />
              <span>4. Interactive Monthly Volume & PAYG Calculator</span>
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Estimate your exact monthly bill across pure Pay-As-You-Go vs Subscription + PAYG overflow.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            Recommended Optimal Choice: <span className="font-mono font-bold">{bestOption.name} (${bestOption.total.toFixed(2)}/mo)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                <span className="text-zinc-800 dark:text-zinc-200">Monthly Normal Searches (`/search`, `/ask`, `/recommend`)</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{calcNormal.toLocaleString()} ops/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="40000"
                step="500"
                value={calcNormal}
                onChange={(e) => setCalcNormal(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono mt-1">
                <span>0</span>
                <span>3.5k</span>
                <span>10k</span>
                <span>20k</span>
                <span>40k</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                <span className="text-zinc-800 dark:text-zinc-200">Monthly Advanced Lore & RAG (`/advanced-search`, `/lore-ask`)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{calcAdvanced.toLocaleString()} ops/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="6000"
                step="100"
                value={calcAdvanced}
                onChange={(e) => setCalcAdvanced(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono mt-1">
                <span>0</span>
                <span>300</span>
                <span>1.2k</span>
                <span>2.4k</span>
                <span>6k</span>
              </div>
            </div>
          </div>

          {/* Results Breakdown */}
          <div className="lg:col-span-6 space-y-2.5">
            {planComparisons.map((item) => {
              const isBest = item.name === bestOption.name;
              return (
                <div
                  key={item.name}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isBest
                      ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">{item.name}</span>
                      {isBest && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Lowest Cost
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.sub}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white">
                      ${item.total.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-500">total / month</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 5: Billing Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-6">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
            Subscription-First Waterfall
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every API call automatically deducts from your included monthly (or daily sandbox) quota first. Only when your subscription bucket reaches 0 does the engine seamlessly fall back to your Pay-As-You-Go wallet balance ($0.003 Normal / $0.005 Advanced) with zero downtime.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
            Differential Mid-Cycle Upgrades
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Upgrading from Starter ($9.99) to Pro ($29.99) never charges you twice. You only pay the exact price difference ($20.00) and immediately receive the net additional quota (+6,500 Normal and +900 Advanced) added to your active balance.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
            Chronological Audit Ledger
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every credit top-up, subscription activation, coupon redemption, and PAYG deduction is recorded in your immutable Dashboard Credit & Audit Ledger with exact timestamps, dollar amounts, and User ID tracking.
          </p>
        </div>
      </div>

      {/* Custom Volume / Enterprise Contact CTA */}
      <div className="mt-14 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-zinc-900/5 to-amber-500/10 dark:from-brand-500/15 dark:via-zinc-900/80 dark:to-amber-500/10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-2.5">
            <span>Custom Volume & Dedicated Infrastructure</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Need a custom plan, higher RPS concurrency, or bulk dataset licensing?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            If your application requires 250,000+ monthly requests, custom rate-limit bursts, dedicated node isolation, or tailored enterprise billing, reach out to our team and we will configure a custom tier for your workload.
          </p>
        </div>
        <a
          href="/contact"
          className="shrink-0 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <span>Contact Us for Custom Plan</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default Pricing;
