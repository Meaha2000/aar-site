import React from 'react';
import { Info, Clock, Shield, CreditCard } from 'lucide-react';
import { formatDate, formatNumber } from '../../lib/utils';

export function BillingTab({
  user,
  billingMessage,
  billingLoading,
  upgradeQuote,
  topupAmount,
  setTopupAmount,
  volumeNormal,
  setVolumeNormal,
  volumeAdvanced,
  setVolumeAdvanced,
  handleToggleAutoRenew,
  handleUpgrade,
  handleTopup,
  handleCustomVolumeCheckout,
}) {
  const pendingCoupons = Array.isArray(user?.pending_coupons) ? user.pending_coupons : [];
  const getPlanCoupon = (planId) => {
    const matched = pendingCoupons.find(
      (c) => c.target_plan === planId || c.target_plan === 'all'
    );
    if (matched) return matched;
    if (
      user?.pending_coupon_code &&
      (user?.pending_coupon_plan === planId || user?.pending_coupon_plan === 'all')
    ) {
      return {
        code: user.pending_coupon_code,
        target_plan: user.pending_coupon_plan,
        discount_percent: user.pending_discount_percent,
        discounted_price: user.pending_discounted_price,
      };
    }
    return null;
  };

  const getDiscountedPrice = (basePrice, coupon) => {
    if (!coupon || !basePrice) return null;
    if (typeof coupon.discounted_price === 'number' && coupon.discounted_price > 0) {
      return Number(coupon.discounted_price).toFixed(2).replace(/\.00$/, '');
    }
    if (typeof coupon.discount_percent === 'number' && coupon.discount_percent > 0) {
      const p = basePrice * (1 - coupon.discount_percent / 100);
      return p.toFixed(2);
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {billingMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            billingMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          <Info className="w-4 h-4 shrink-0" />
          <span>{billingMessage.text}</span>
        </div>
      )}

      {/* Active Subscription Status & Controls Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Current Plan Details
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                  user?.tier !== 'free_sandbox' &&
                  user?.tier !== 'founder' &&
                  user?.auto_renew === false
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {user?.tier === 'founder'
                  ? '∞ Lifetime Active'
                  : user?.tier !== 'free_sandbox' && user?.auto_renew === false
                  ? 'Cancels at Period End'
                  : 'Active'}
              </span>
              {user?.tier === 'founder' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  ∞ Never Expires
                </span>
              ) : (
                typeof user?.days_remaining === 'number' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                    {user.days_remaining} {user.days_remaining === 1 ? 'day' : 'days'} remaining
                  </span>
                )
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{user?.tier_name || 'Free Sandbox'}</span>
                {user?.tier === 'founder' && (
                  <span
                    className="text-2xl leading-none text-purple-600 dark:text-purple-400 font-bold"
                    title="Lifetime Plan"
                  >
                    ∞
                  </span>
                )}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>
                  {user?.tier === 'founder'
                    ? 'Next Monthly Quota Refill:'
                    : user?.tier === 'free_sandbox'
                    ? 'Daily Quota Reset:'
                    : user?.auto_renew === false
                    ? 'Plan Expires On:'
                    : 'Next Renewal Date:'}{' '}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    {formatDate(user?.quota_reset_at)}
                  </strong>
                </span>
              </div>
              <div>
                <span>Plan Duration: </span>
                <strong className="text-brand-600 dark:text-brand-400">
                  {user?.tier === 'founder'
                    ? '∞ Lifetime (50k Normal + 10k Adv / mo)'
                    : typeof user?.days_remaining === 'number'
                    ? `${user.days_remaining} days`
                    : '—'}
                </strong>
              </div>
            </div>
            {user?.tier === 'founder' && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono pt-1">
                * Permanent Founder Grant: Refills 50,000 Normal + 10,000 Advanced requests every
                30 days forever. Switching to another paid plan permanently forfeits this grant.
              </p>
            )}
          </div>

          {/* Auto-Renew Toggle & Cancel Subscription Controls (for Paid Plans) */}
          {user?.tier && user.tier !== 'free_sandbox' && user.tier !== 'founder' && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80">
                <div className="text-left">
                  <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 block leading-tight">
                    Auto-Renew
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      user?.auto_renew
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {user?.auto_renew ? 'ON (Monthly)' : 'OFF'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAutoRenew(!user?.auto_renew)}
                  disabled={billingLoading === 'auto_renew' || billingLoading === 'cancel_sub'}
                  title={user?.auto_renew ? 'Turn Off Auto-Renew' : 'Turn On Auto-Renew'}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                    user?.auto_renew ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      user?.auto_renew ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instant Polar Checkout Banner */}
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between gap-3.5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block text-sm">
              Instant Self-Service Checkout via Polar
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              All subscriptions and Pay-As-You-Go wallet top-ups are processed securely via
              Polar.sh and activated automatically on your account (
              <code className="font-mono bg-brand-500/15 px-1 py-0.5 rounded text-brand-700 dark:text-brand-300">
                {user?.user_id}
              </code>
              ) upon payment.
            </p>
          </div>
        </div>
      </div>

      {/* Mid-Cycle Tier Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
              Subscription Tiers & Mid-Cycle Upgrades
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Differential billing applies: upgrading mid-cycle charges only the price difference
              and adds the net quota difference on top of current credits immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              id: 'free_sandbox',
              name: 'Free Sandbox',
              price: 0,
              normal: '30 / day (~900/mo)',
              adv: '5 / day (~150/mo)',
              rps: '1 RPS',
              rpm: '20 RPM · 5 LLM RPM',
              current: user?.tier === 'free_sandbox',
            },
            {
              id: 'starter',
              name: 'Starter',
              price: 9.99,
              normal: '3,500 / mo',
              adv: '300 / mo',
              rps: '5 RPS',
              rpm: '100 RPM · 15 LLM RPM',
              current: user?.tier === 'starter',
            },
            {
              id: 'pro',
              name: 'Pro',
              price: 29.99,
              normal: '10,000 / mo',
              adv: '1,200 / mo',
              rps: '15 RPS',
              rpm: '300 RPM · 40 LLM RPM',
              highlight: true,
              current: user?.tier === 'pro',
            },
            {
              id: 'business',
              name: 'Business',
              price: 59.99,
              normal: '20,000 / mo',
              adv: '2,400 / mo',
              rps: '30 RPS',
              rpm: '600 RPM · 80 LLM RPM',
              current: user?.tier === 'business',
            },
          ].map((plan) => {
            const matchedCoupon = getPlanCoupon(plan.id);
            const discountedPrice = getDiscountedPrice(plan.price, matchedCoupon);
            return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl flex flex-col justify-between transition-all ${
                plan.highlight
                  ? 'bg-white dark:bg-zinc-900 border-2 border-brand-500 shadow-glow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {plan.name}
                  </span>
                  {plan.current ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Current
                    </span>
                  ) : matchedCoupon ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {matchedCoupon.code} (-{matchedCoupon.discount_percent ? `${matchedCoupon.discount_percent}%` : `$${matchedCoupon.discount_usd}`})
                    </span>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-1.5 font-mono flex-wrap">
                  {discountedPrice !== null ? (
                    <>
                      <span className="text-sm line-through text-zinc-400 dark:text-zinc-500 tabular-nums">
                        ${plan.price}
                      </span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ${discountedPrice}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        1st mo
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        ${plan.price}
                      </span>
                      <span className="text-xs text-zinc-400">/mo</span>
                    </>
                  )}
                </div>

                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <li>• {plan.normal} Normal</li>
                  <li>• {plan.adv} Advanced</li>
                  <li>
                    • {plan.rps} & {plan.rpm}
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                {plan.current ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-semibold cursor-default"
                  >
                    Active Plan
                  </button>
                ) : plan.id !== 'free_sandbox' ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={billingLoading}
                    className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm block text-center cursor-pointer"
                  >
                    {billingLoading === plan.id
                      ? 'Redirecting...'
                      : discountedPrice !== null
                      ? `Subscribe ($${discountedPrice} 1st mo)`
                      : `Subscribe ($${plan.price}/mo)`}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-semibold cursor-not-allowed"
                  >
                    Included Default
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Pay-As-You-Go Top-Up Slider & Calculator */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div>
          <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
            Pay-As-You-Go Wallet Top-Up ($5 to $500)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Credits never expire. Normal: $0.003/req ($3.00/1k) | Advanced: $0.005/req ($5.00/1k) |
            ID Crosswalk & Autocomplete: Free.
          </p>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">$5</span>
            <span className="text-xl font-bold text-brand-600 dark:text-brand-400 tabular-nums">
              ${topupAmount} USD
            </span>
            <span className="text-zinc-400">$500</span>
          </div>
          <input
            type="range"
            min="5"
            max="500"
            step="5"
            value={topupAmount}
            onChange={(e) => setTopupAmount(Number(e.target.value))}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>

        {/* Live Calculator Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 font-mono text-xs">
          <div>
            <span className="text-zinc-500 block">Normal Queries Output ($0.003/req):</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatNumber(Math.floor(topupAmount / 0.003))} queries
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Or Advanced Queries ($0.005/req):</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatNumber(Math.floor(topupAmount / 0.005))} queries
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Instant wallet credit top-up of{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">${topupAmount} USD</strong> via
            Polar checkout. Credits are added immediately upon payment.
          </div>
          <button
            onClick={handleTopup}
            disabled={billingLoading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-mono text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            {billingLoading === 'payg' ? 'Redirecting...' : `Top Up $${topupAmount} USD`}
          </button>
        </div>
      </div>

      {/* Custom High-Volume Enterprise Slider */}
      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
              High-Volume Enterprise Calculator (Up to 500k Queries)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Volume discount tier: 20% discount applied automatically on high-volume commitments.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            20% Discount
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-500">
              Normal Queries: {formatNumber(volumeNormal)}
            </label>
            <input
              type="range"
              min="50000"
              max="500000"
              step="25000"
              value={volumeNormal}
              onChange={(e) => setVolumeNormal(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-500">
              Advanced Queries: {formatNumber(volumeAdvanced)}
            </label>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={volumeAdvanced}
              onChange={(e) => setVolumeAdvanced(Number(e.target.value))}
              className="w-full accent-sakura-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
          <span className="text-zinc-500">
            Estimated Commitment:{' '}
            <strong className="text-zinc-900 dark:text-zinc-100 tabular-nums">
              ${Math.round((volumeNormal * 0.003 + volumeAdvanced * 0.005) * 0.8)} USD/mo
            </strong>
          </span>
          <button
            type="button"
            onClick={handleCustomVolumeCheckout}
            disabled={billingLoading === 'custom_volume'}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-sans font-semibold text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>
              {billingLoading === 'custom_volume'
                ? 'Generating Custom Link...'
                : `Purchase Custom Pack ($${Math.round(
                    (volumeNormal * 0.003 + volumeAdvanced * 0.005) * 0.8
                  )} USD)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
