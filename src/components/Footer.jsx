import React from 'react';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
          
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col gap-3.5 pr-0 md:pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FDF8F2] dark:bg-[#FDF8F2] border border-brand-500/20 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                <img src="/assets/img/logo.png" alt="AAR" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Anime Akashic Records
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The unified semantic search and lore intelligence layer for anime, manga, light novels, and visual novels. Built for developers and AI agents to resolve cross-platform entity metadata, discover works by plot or vibe, and retrieve timestamp-verified episode and scene citations through a single low-latency API.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Platform
            </h4>
            <a href="/search" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Interactive Search
            </a>
            <a href="/api" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              API Documentation
            </a>
            <a href="/pricing" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Pricing & Quotas
            </a>
            <a href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Developer Dashboard
            </a>
            <a href="/about" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              System Architecture
            </a>
          </div>

          {/* Resources */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Resources
            </h4>
            <a
              href="https://api.aarecords.tech/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1"
            >
              OpenAPI Spec <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://api.aarecords.tech/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1"
            >
              Live API Status <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://aarecords.tech/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1"
            >
              llms.txt Index <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Legal & Support */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Legal & Support
            </h4>
            <a href="/contact" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Contact & Support
            </a>
            <a href="/contact#terms" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Terms of Service
            </a>
            <a href="/contact#privacy" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/contact#refund" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Refund Policy
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} Anime Akashic Records (AAR). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:contact@aarecords.tech" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
              contact@aarecords.tech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
