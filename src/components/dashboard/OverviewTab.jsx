import React from 'react';
import { Clock, ChevronRight, Info } from 'lucide-react';
import { formatNumber, formatCurrency, formatDate } from '../../lib/utils';

export function OverviewTab({
  user,
  setActiveTab,
  normalRem,
  normalMax,
  normalPct,
  advRem,
  advMax,
  advPct,
  paygBalance,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Active Tier & Quota Reset */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Current Subscription
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                user?.tier !== 'free_sandbox' && user?.auto_renew === false
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {user?.tier !== 'free_sandbox' && user?.auto_renew === false
                ? 'Cancels at Period End'
                : 'Active'}
            </span>
            {typeof user?.days_remaining === 'number' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {user.days_remaining} {user.days_remaining === 1 ? 'day' : 'days'} remaining
              </span>
            )}
          </div>
          <h2 className="font-sans font-bold text-2xl mt-1">{user?.tier_name}</h2>
          <div className="text-xs text-zinc-400 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>
                {user?.tier === 'free_sandbox'
                  ? `Daily Reset: ${formatDate(user?.quota_reset_at)}`
                  : user?.auto_renew === false
                  ? `Expires On: ${formatDate(user?.quota_reset_at)}`
                  : `Next Renewal: ${formatDate(user?.quota_reset_at)}`}
              </span>
            </span>
            {user?.tier !== 'free_sandbox' && (
              <span className="text-[11px] text-zinc-300">
                Auto-Renew:{' '}
                <strong className={user?.auto_renew ? 'text-emerald-400' : 'text-amber-400'}>
                  {user?.auto_renew ? 'ON' : 'OFF'}
                </strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('billing')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>{user?.tier === 'free_sandbox' ? 'Upgrade Tier' : 'Manage Subscription'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2 Quota Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meter 1: Normal Pool */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Normal Pool
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              /search, /recommend, /ask
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between tabular-nums">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {formatNumber(normalRem)}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                / {formatNumber(normalMax)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-2">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${normalPct}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between tabular-nums pt-1">
            <span>Used this cycle: {formatNumber(user?.usage_totals?.normal_used || 0)}</span>
            <span className="font-mono font-medium text-brand-600 dark:text-brand-400">
              {normalPct}% remaining
            </span>
          </div>
        </div>

        {/* Meter 2: Advanced Pool */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Advanced Pool
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              /advanced_*, /lore_ask
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between tabular-nums">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {formatNumber(advRem)}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                / {formatNumber(advMax)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-2">
              <div
                className="h-full bg-sakura-500 rounded-full transition-all duration-500"
                style={{ width: `${advPct}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between tabular-nums pt-1">
            <span>Used this cycle: {formatNumber(user?.usage_totals?.advanced_used || 0)}</span>
            <span className="font-mono font-medium text-sakura-500">{advPct}% remaining</span>
          </div>
        </div>
      </div>

      {/* Pay-As-You-Go Wallet Card with Waterfall Priority */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Pay-As-You-Go Wallet Balance
            </span>
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
              {formatCurrency(paygBalance)}
            </div>
            <span className="text-xs text-zinc-500 mt-1 block">
              Equivalent to{' '}
              <strong className="text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                {formatNumber(user?.payg_equivalent_normal_requests || 0)}
              </strong>{' '}
              Normal or{' '}
              <strong className="text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">
                {formatNumber(user?.payg_equivalent_advanced_requests || 0)}
              </strong>{' '}
              Advanced queries.
            </span>
          </div>

          <button
            onClick={() => setActiveTab('billing')}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors shadow-sm self-start md:self-auto"
          >
            Top-Up Wallet
          </button>
        </div>

        {/* Waterfall Priority Explanation */}
        <div className="mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-400">
          <Info className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
          <div>
            <strong className="text-zinc-900 dark:text-zinc-200 block mb-0.5 font-sans">
              Waterfall Deduction Priority Guarantee
            </strong>
            Your monthly subscription pool quota is always consumed first. Your Pay-As-You-Go
            balance is preserved as a permanent safety buffer and is only drawn upon when monthly
            subscription quota reaches 0.
          </div>
        </div>
      </div>
    </div>
  );
}
