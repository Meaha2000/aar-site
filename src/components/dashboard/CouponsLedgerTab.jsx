import React from 'react';
import { Gift, Info, RefreshCw } from 'lucide-react';
import { formatDateTime, formatCurrency, formatNumber } from '../../lib/utils';

export function CouponsLedgerTab({
  user,
  couponCode,
  setCouponCode,
  couponLoading,
  couponFeedback,
  handleRedeemCoupon,
  ledgerEntries,
  ledgerLoading,
  loadLedger,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Coupon Redemption Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
              Redeem Promotional Coupon Code
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your partner or promotional coupon code to credit your balance.
            </p>
          </div>
        </div>

        {couponFeedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              couponFeedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{couponFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleRedeemCoupon} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="ENTER COUPON CODE"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={couponLoading || !couponCode.trim()}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {couponLoading ? 'Redeeming...' : 'Apply Coupon'}
          </button>
        </form>

        {Array.isArray(user?.pending_coupons) && user.pending_coupons.length > 0 && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
              Active Pending Plan Discounts (Oldest Applied First)
            </span>
            <div className="flex flex-wrap gap-2">
              {user.pending_coupons.map((c, i) => (
                <span
                  key={`${c.code}-${i}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                >
                  <span>{c.code}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="uppercase">{c.target_plan}</span>
                  <span className="text-zinc-400">•</span>
                  <span>
                    {c.discount_percent ? `${c.discount_percent}% OFF` : `$${c.discounted_price}`} (1st mo)
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit & Usage Ledger Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
            Chronological Credit & Audit Ledger
          </h3>
          <button
            onClick={loadLedger}
            disabled={ledgerLoading}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ledgerLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 font-mono text-zinc-400 uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4 text-right">USD Amount</th>
                <th className="py-3 px-4 text-right">Normal Delta</th>
                <th className="py-3 px-4 text-right">Adv Delta</th>
                <th className="py-3 px-4">Note / Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-sans">
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    {ledgerLoading
                      ? 'Loading ledger...'
                      : 'No transaction records found in ledger yet.'}
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-zinc-500">
                      {formatDateTime(entry.created_at)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {entry.event_type}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {entry.amount_usd ? formatCurrency(entry.amount_usd) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                      {entry.normal_delta ? `+${formatNumber(entry.normal_delta)}` : '0'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-sakura-500 font-medium">
                      {entry.advanced_delta ? `+${formatNumber(entry.advanced_delta)}` : '0'}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 truncate max-w-xs">
                      {entry.note
                        ? entry.note.replace(/\s*\[polar_order:[^\]]+\]/g, '')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
