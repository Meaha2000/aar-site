import React from 'react';
import {
  Database,
  Film,
  GitBranch,
  Layers,
  Cpu,
  Globe2,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Zap,
  Server
} from 'lucide-react';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Page Title */}
      <div className="space-y-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-8">
        <span className="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
          Architecture & Methodology
        </span>
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Building the Definitive Semantic Corpus for Asian Entertainment
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
          How Anime Akashic Records indexes 146,140 canonical works and deep-indexes 7,535 anime series across 102,264 episodes and 762,318+ scene timestamp citations, delivering source-grounded vector intelligence.
        </p>
      </div>

      {/* 1. The Core Corpus Architecture */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
            1. Corpus Scope & Ingestion Scale
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Traditional anime databases index surface-level metadata (synopsis, airing dates, genres). AAR operates at a granular dialogue and scene timestamp level, indexing the actual spoken and translated narrative content across all major franchises.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100 tabular-nums">146,140</span>
            <span className="block text-xs text-zinc-500 mt-1 font-sans">Canonical Works</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100 tabular-nums">7,535</span>
            <span className="block text-xs text-zinc-500 mt-1 font-sans">Indexed Anime Series</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100 tabular-nums">102,264</span>
            <span className="block text-xs text-zinc-500 mt-1 font-sans">Episode Timestamp Indexes</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100 tabular-nums">762,318+</span>
            <span className="block text-xs text-zinc-500 mt-1 font-sans">Scene Timestamp Citations</span>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 col-span-2 sm:col-span-1">
            <span className="font-mono font-bold text-2xl text-zinc-900 dark:text-zinc-100 tabular-nums">10,565</span>
            <span className="block text-xs text-zinc-500 mt-1 font-sans">Verified Story Arcs</span>
          </div>
        </div>
      </section>

      {/* 2. Subtitle Processing & Keyframe Alignment */}
      <section className="space-y-4 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-10">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
            2. Dense Vector Pipeline & Temporal Alignment
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Narrative scene boundaries are extracted from official localizations and archival transcripts. Each scene event is cleaned, stripped of timing artifact jitter, parsed for speaker boundaries, and embedded into a unified semantic vector space.
        </p>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 space-y-3 font-sans text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Chunk Normalization:</strong> Slang, Japanese loanwords (e.g. <em>bankai</em>, <em>jutsu</em>, <em>domain expansion</em>), and localized names are cross-referenced against canonical entity dictionaries.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Dense + Lexical Hybrid Index:</strong> Queries leverage dense vector embeddings for conceptual understanding alongside exact lexical matching for character names and technical terms.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Timestamp Accuracy:</strong> Every match returns second-exact start and end timestamp metadata and canonical episode citations for analytical and discovery workflows.</span>
          </div>
        </div>
      </section>

      {/* 3. The 10 External ID Crosswalk */}
      <section className="space-y-4 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-10">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
            3. Entity Disambiguation & The 10 ID Crosswalk
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The anime ecosystem suffers from fragmentation across Japanese Romaji, localized English titles, alternate spellings, and differing episode breakdown schemas. AAR reconciles these differences into a single unified entity graph mapped to 10 major industry platforms:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono text-xs">
          {['AniList', 'MyAnimeList', 'Kitsu', 'AniDB', 'TheTVDB', 'IMDb', 'Wikidata', 'Bangumi', 'MangaUpdates', 'VNDB'].map((name) => (
            <div key={name} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-semibold text-zinc-800 dark:text-zinc-200">
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Infrastructure & SLA */}
      <section className="space-y-4 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-10">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
            4. Production Architecture & Speed
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          AAR is engineered for deterministic semantic precision and sub-second retrieval latency, powered by high-throughput vector indexing, hybrid ranking, and an enterprise-grade resilient microservice gateway.
        </p>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Service Level Agreement</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">99.98% Uptime SLA</span>
        </div>
      </section>

      {/* 5. Community & Developer Support */}
      <section className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-4">
        <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
          Connect with the Team
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Have questions about our vector embeddings, request high-volume enterprise ingestion, or want to contribute to our story arc annotations?
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="/contact"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Contact Support & Terms</span>
          </a>
        </div>
      </section>

    </div>
  );
}
