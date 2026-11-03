import React, { useState, useEffect } from 'react';
import {
  Activity,
  Key,
  CreditCard,
  Receipt,
  Settings,
  Plus,
  Trash2,
  Copy,
  Check,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Layers,
  Database,
  ArrowUpRight,
  Gift,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';
import { formatNumber, formatCurrency, formatDate, formatDateTime, maskApiKey } from '../lib/utils';

export function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, refreshUser, openAuthModal, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'keys' | 'billing' | 'coupons' | 'settings'

  // Keys State
  const [keysList, setKeysList] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [revealedNewKey, setRevealedNewKey] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [keyActionLoading, setKeyActionLoading] = useState(false);
  const [keyError, setKeyError] = useState(null);

  // Billing & Top-Up State
  const [topupAmount, setTopupAmount] = useState(10);
  const [volumeNormal, setVolumeNormal] = useState(100000);
  const [volumeAdvanced, setVolumeAdvanced] = useState(10000);
  const [billingLoading, setBillingLoading] = useState(null); // null or 'starter'|'pro'|'business'|'payg'|'admin'
  const [upgradeQuote, setUpgradeQuote] = useState(null);
  const [billingMessage, setBillingMessage] = useState(null);

  // Coupons & Ledger State
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Settings & Password State
  const [profileName, setProfileName] = useState('');
  const [profileCompany, setProfileCompany] = useState('');
  const [profileUseCase, setProfileUseCase] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Sync user data & handle Polar checkout return
  useEffect(() => {
    if (user) {
      setKeysList(user.keys || []);
      setProfileName(user.full_name || '');
      setProfileCompany(user.company_name || '');
      setProfileUseCase(user.use_case || '');
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    if (checkoutStatus === 'success') {
      setActiveTab('billing');
      setBillingLoading(null);
      setBillingMessage({
        type: 'success',
        text: 'Payment completed via Polar! Your subscription quota or wallet credits are now active.',
      });
      refreshUser();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutStatus === 'canceled' || checkoutStatus === 'cancel') {
      setActiveTab('billing');
      setBillingLoading(null);
      setBillingMessage({
        type: 'error',
        text: 'Checkout was canceled. No charges were made.',
      });
      window.history.replaceState({}, '', window.location.pathname);
    }

    const resetLoadingOnReturn = () => {
      setBillingLoading(null);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setBillingLoading(null);
      }
    };
    window.addEventListener('pageshow', resetLoadingOnReturn);
    window.addEventListener('focus', resetLoadingOnReturn);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('pageshow', resetLoadingOnReturn);
      window.removeEventListener('focus', resetLoadingOnReturn);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Load ledger on tab switch
  useEffect(() => {
    if (activeTab === 'coupons' && isAuthenticated) {
      loadLedger();
    }
    if (activeTab === 'billing' && isAuthenticated) {
      loadUpgradeQuote();
    }
  }, [activeTab, isAuthenticated]);

  const loadLedger = async () => {
    setLedgerLoading(true);
    try {
      const res = await authApi.getLedger();
      if (res?.ledger) {
        setLedgerEntries(res.ledger);
      }
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const loadUpgradeQuote = async () => {
    try {
      const res = await authApi.getUpgradeQuote();
      if (res?.upgrade_options) {
        setUpgradeQuote(res.upgrade_options);
      }
    } catch (err) {
      console.warn('Could not fetch upgrade quote directly, fallback to user.upgrade_options:', err);
      if (user?.upgrade_options) {
        setUpgradeQuote(user.upgrade_options);
      }
    }
  };

  // Create Key Handler
  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setKeyActionLoading(true);
    setKeyError(null);

    try {
      const res = await authApi.createKey(newKeyName.trim());
      if (res?.created_key?.raw_key) {
        setRevealedNewKey(res.created_key);
        setNewKeyName('');
        await refreshUser();
      }
    } catch (err) {
      setKeyError(err.message || 'Failed to create key.');
    } finally {
      setKeyActionLoading(false);
    }
  };

  // Revoke Key Handler
  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action is permanent and immediate.')) {
      return;
    }
    setKeyActionLoading(true);
    try {
      await authApi.deleteKey(keyId);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to revoke key.');
    } finally {
      setKeyActionLoading(false);
    }
  };

  // Polar Checkout Handler for Plans
  const handleUpgrade = async (targetTier) => {
    setBillingLoading(targetTier);
    setBillingMessage(null);
    try {
      const res = await authApi.createPolarCheckout(targetTier);
      if (res?.checkout_url) {
        setTimeout(() => setBillingLoading(null), 1500);
        window.location.href = res.checkout_url;
        return;
      }
      throw new Error('Could not generate Polar checkout session.');
    } catch (err) {
      setBillingMessage({
        type: 'error',
        text: err.message || 'Could not start checkout. Please try again or contact support.',
      });
      setBillingLoading(null);
    }
  };

  // Polar Auto-Renew Toggle Handler
  const handleToggleAutoRenew = async (nextState) => {
    setBillingLoading('auto_renew');
    setBillingMessage(null);
    try {
      const res = await authApi.togglePolarAutoRenew(nextState);
      await refreshUser();
      loadLedger();
      setBillingMessage({
        type: 'success',
        text: res.message || `Auto-Renew switched ${nextState ? 'ON' : 'OFF'}.`,
      });
    } catch (err) {
      setBillingMessage({
        type: 'error',
        text: err.message || 'Could not update Auto-Renew setting.',
      });
    } finally {
      setBillingLoading(null);
    }
  };

  // Polar Cancel Subscription Handler
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription renewal? Your current quotas and plan features will remain active until the end of your billing period, and you will not be charged again.')) {
      return;
    }
    setBillingLoading('cancel_sub');
    setBillingMessage(null);
    try {
      const res = await authApi.cancelPolarSubscription(false);
      await refreshUser();
      loadLedger();
      setBillingMessage({
        type: 'success',
        text: res.message || 'Subscription canceled. Your plan remains active until the end of the current cycle.',
      });
    } catch (err) {
      setBillingMessage({
        type: 'error',
        text: err.message || 'Could not cancel subscription.',
      });
    } finally {
      setBillingLoading(null);
    }
  };

  // Polar Custom Volume Checkout Handler
  const handleCustomVolumeCheckout = async () => {
    setBillingLoading('custom_volume');
    setBillingMessage(null);
    try {
      const res = await authApi.createPolarCustomCheckout(volumeNormal, volumeAdvanced);
      if (res?.checkout_url) {
        setTimeout(() => setBillingLoading(null), 1500);
        window.location.href = res.checkout_url;
        return;
      }
      throw new Error('Could not generate custom volume checkout link.');
    } catch (err) {
      setBillingMessage({
        type: 'error',
        text: err.message || 'Could not start custom checkout. Please try again.',
      });
      setBillingLoading(null);
    }
  };

  // Polar Checkout Handler for PAYG Top-Up
  const handleTopup = async () => {
    setBillingLoading('payg');
    setBillingMessage(null);
    try {
      const res = await authApi.createPolarCheckout('payg', topupAmount);
      if (res?.checkout_url) {
        setTimeout(() => setBillingLoading(null), 1500);
        window.location.href = res.checkout_url;
        return;
      }
      throw new Error('Could not generate Polar checkout session.');
    } catch (err) {
      setBillingMessage({
        type: 'error',
        text: err.message || 'Could not start top-up checkout. Please try again.',
      });
      setBillingLoading(null);
    }
  };

  // Admin Billing Gateway Handler
  const handleAdminBillingSubmit = async (e) => {
    e.preventDefault();
    if (!adminKeyInput.trim()) {
      setBillingMessage({ type: 'error', text: 'Admin API Key (aar_admin_...) is required.' });
      return;
    }
    const targetId = adminTargetUser.trim() || user?.user_id || user?.email || '';
    if (!targetId) {
      setBillingMessage({ type: 'error', text: 'Target User ID or Email is required.' });
      return;
    }
    setBillingLoading('admin');
    setBillingMessage(null);
    try {
      const payload = {
        target_user: targetId,
        amount_usd: Number(adminAmountUsd) || 0,
        target_tier: adminTargetTier || null,
        reason: adminReason.trim() || undefined,
      };
      const res = await authApi.adminBilling(payload, adminKeyInput.trim());
      await refreshUser();
      setBillingMessage({
        type: 'success',
        text: res.message || `Successfully credited $${payload.amount_usd} to ${targetId}. Recorded in Credit & Audit Ledger.`,
      });
      setAdminReason('');
    } catch (err) {
      setBillingMessage({
        type: 'error',
        text: err.message || 'Admin billing operation failed.',
      });
    } finally {
      setBillingLoading(null);
    }
  };

  // Coupon Redeem Handler
  const handleRedeemCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponFeedback(null);
    try {
      const res = await authApi.redeemCoupon(couponCode.trim());
      await refreshUser();
      setCouponFeedback({
        type: 'success',
        text: res.message || 'Coupon redeemed successfully! Quota and wallet updated.',
      });
      setCouponCode('');
      loadLedger();
    } catch (err) {
      setCouponFeedback({
        type: 'error',
        text: err.message || 'Invalid, expired, or already redeemed coupon code.',
      });
    } finally {
      setCouponLoading(false);
    }
  };

  // Profile Save Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage(null);
    try {
      await authApi.updateProfile({
        full_name: profileName.trim(),
        company_name: profileCompany.trim(),
        use_case: profileUseCase.trim(),
      });
      await refreshUser();
      setSettingsMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setSettingsMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    setPasswordFeedback(null);
    try {
      const res = await authApi.changePassword(oldPassword, newPassword);
      setPasswordFeedback({ type: 'success', text: res.message || 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordFeedback({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  // Unauthenticated fallback view
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="font-sans font-bold text-2xl text-zinc-900 dark:text-zinc-100">
          Developer Authentication Required
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
          Please sign in or create an account to access the AAR developer console, manage API keys, and monitor usage quotas.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-sm transition-all"
        >
          Sign In / Get Started
        </button>
      </div>
    );
  }

  // Quota calculations
  const normalMax = user?.normal_quota_max || 30;
  const normalRem = user?.normal_quota_remaining ?? 30;
  const normalPct = Math.min(100, Math.max(0, Math.round((normalRem / (normalMax || 1)) * 100)));

  const advMax = user?.advanced_quota_max || 5;
  const advRem = user?.advanced_quota_remaining ?? 5;
  const advPct = Math.min(100, Math.max(0, Math.round((advRem / (advMax || 1)) * 100)));

  const utilMax = user?.utility_quota_max || normalMax;
  const utilRem = user?.utility_quota_remaining ?? normalRem;
  const utilPct = Math.min(100, Math.max(0, Math.round((utilRem / (utilMax || 1)) * 100)));

  const paygBalance = user?.payg_balance_usd || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Console Top Breadcrumb / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <span>AAR Developer Console</span>
            <span>/</span>
            <span className="text-zinc-700 dark:text-zinc-300 capitalize">{activeTab}</span>
          </div>
          <h1 className="font-sans font-bold text-2xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <span>{user?.company_name || user?.full_name || 'Developer Workspace'}</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/25 uppercase">
              {user?.tier_name || 'Free Sandbox'}
            </span>
          </h1>
        </div>

        {/* Quick Rate Limit & Status Capsule */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono flex items-center gap-3 tabular-nums">
            <span className="text-zinc-500">Limits:</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{user?.rate_limits?.rps || 1} RPS</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{user?.rate_limits?.rpm || 30} RPM</span>
          </div>
        </div>
      </div>

      {/* 2-Column Console Layout: Left Sidebar Rail + Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* Left Sidebar Rail (240px equivalent) */}
        <div className="lg:col-span-3 space-y-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {[
              { id: 'overview', label: 'Overview', icon: Activity, badge: null },
              { id: 'keys', label: 'API Keys', icon: Key, badge: keysList.length },
              { id: 'billing', label: 'Plans & Billing', icon: CreditCard, badge: null },
              { id: 'coupons', label: 'Coupons & Ledger', icon: Receipt, badge: null },
              { id: 'settings', label: 'Settings', icon: Settings, badge: null },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== null && (
                    <span className="px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Help Widget in Sidebar */}
          <div className="hidden lg:block mt-8 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
              Developer Support
            </span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
              Need higher RPS limits or custom vector embeddings?
            </p>
            <a
              href="mailto:contact@aarecords.tech"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              <span>contact@aarecords.tech</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right Workspace Canvas */}
        <div className="lg:col-span-9">

          {/* ================================================================= */}
          {/* VIEW 1: OVERVIEW */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Top Banner: Active Tier & Quota Reset */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      Current Subscription
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                      user?.tier !== 'free_sandbox' && user?.auto_renew === false
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {user?.tier !== 'free_sandbox' && user?.auto_renew === false ? 'Cancels at Period End' : 'Active'}
                    </span>
                    {typeof user?.days_remaining === 'number' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {user.days_remaining} {user.days_remaining === 1 ? 'day' : 'days'} remaining
                      </span>
                    )}
                  </div>
                  <h2 className="font-sans font-bold text-2xl mt-1">
                    {user?.tier_name}
                  </h2>
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
                        Auto-Renew: <strong className={user?.auto_renew ? 'text-emerald-400' : 'text-amber-400'}>{user?.auto_renew ? 'ON' : 'OFF'}</strong>
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
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-2">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${normalPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between tabular-nums pt-1">
                    <span>Used this cycle: {formatNumber(user?.usage_totals?.normal_used || 0)}</span>
                    <span className="font-mono font-medium text-brand-600 dark:text-brand-400">{normalPct}% remaining</span>
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
                    {/* Progress Bar */}
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
                      Equivalent to <strong className="text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">{formatNumber(user?.payg_equivalent_normal_requests || 0)}</strong> Normal or <strong className="text-zinc-700 dark:text-zinc-300 font-mono tabular-nums">{formatNumber(user?.payg_equivalent_advanced_requests || 0)}</strong> Advanced queries.
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
                    Your monthly subscription pool quota is always consumed first. Your Pay-As-You-Go balance is preserved as a permanent safety buffer and is only drawn upon when monthly subscription quota reaches 0.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 2: API KEYS */}
          {/* ================================================================= */}
          {activeTab === 'keys' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    API Keys ({keysList.length}/10)
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Generate up to 10 independent named keys with dedicated request metrics and isolated revocation.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsCreateKeyModalOpen(true);
                    setRevealedNewKey(null);
                    setKeyError(null);
                  }}
                  disabled={keysList.length >= 10}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New API Key</span>
                </button>
              </div>

              {/* One-Time Secret Key Reveal Modal */}
              {revealedNewKey && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="font-sans font-bold text-sm">Key Created: {revealedNewKey.name}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    Your API key is ready to copy and use anytime:
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/30 flex items-center justify-between gap-3 font-mono text-xs text-brand-600 dark:text-brand-400 break-all">
                    <span>{revealedNewKey.raw_key}</span>
                    <button
                      onClick={() => copyToClipboard(revealedNewKey.raw_key, 'new_key')}
                      className="shrink-0 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
                    >
                      {copiedKeyId === 'new_key' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Create Key Inline Modal / Drawer */}
              {isCreateKeyModalOpen && !revealedNewKey && (
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="font-sans font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Create a Named API Key
                  </h3>
                  {keyError && (
                    <div className="text-xs text-red-500">{keyError}</div>
                  )}
                  <form onSubmit={handleCreateKey} className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production RAG Service / Mobile App"
                      required
                      className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={keyActionLoading}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                    >
                      {keyActionLoading ? 'Creating...' : 'Generate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreateKeyModalOpen(false)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}

              {/* Keys Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 font-mono text-zinc-400 uppercase text-[10px]">
                      <th className="py-3 px-4">Key Name</th>
                      <th className="py-3 px-4">API Key</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4">Last Used</th>
                      <th className="py-3 px-4 text-right">Requests</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-sans">
                    {keysList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400">
                          No active API keys found. Click "Create New API Key" to generate one.
                        </td>
                      </tr>
                    ) : (
                      keysList.map((k) => (
                        <tr key={k.key_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                            {k.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-300">
                            <div className="flex items-center gap-2">
                              <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-300">
                                {k.key_prefix}
                              </span>
                              {k.raw_key && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(k.raw_key, k.key_id)}
                                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-500/10 text-zinc-700 dark:text-zinc-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1 text-[11px] font-sans font-medium"
                                  title="Copy API Key"
                                >
                                  {copiedKeyId === k.key_id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      <span className="text-emerald-500">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-zinc-500 font-mono">
                            {formatDate(k.created_at)}
                          </td>
                          <td className="py-3 px-4 text-zinc-500 font-mono">
                            {formatDateTime(k.last_used_at)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                            {formatNumber(k.requests_count || 0)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteKey(k.key_id)}
                              disabled={keyActionLoading}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 3: PLANS & BILLING */}
          {/* ================================================================= */}
          {activeTab === 'billing' && (
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        user?.tier !== 'free_sandbox' && user?.auto_renew === false
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {user?.tier !== 'free_sandbox' && user?.auto_renew === false ? 'Cancels at Period End' : 'Active'}
                      </span>
                      {typeof user?.days_remaining === 'number' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                          {user.days_remaining} {user.days_remaining === 1 ? 'day' : 'days'} remaining
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {user?.tier_name || 'Free Sandbox'}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        <span>
                          {user?.tier === 'free_sandbox'
                            ? 'Daily Quota Reset:'
                            : user?.auto_renew === false
                            ? 'Plan Expires On:'
                            : 'Next Renewal Date:'}{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100">{formatDate(user?.quota_reset_at)}</strong>
                        </span>
                      </div>
                      <div>
                        <span>Time Left: </span>
                        <strong className="text-brand-600 dark:text-brand-400">
                          {typeof user?.days_remaining === 'number' ? `${user.days_remaining} days` : '—'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Auto-Renew Toggle & Cancel Subscription Controls (for Paid Plans) */}
                  {user?.tier && user.tier !== 'free_sandbox' && (
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                      {/* Auto-Renew ON/OFF Toggle */}
                      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80">
                        <div className="text-left">
                          <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 block leading-tight">
                            Auto-Renew
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${user?.auto_renew ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
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
                      All subscriptions and Pay-As-You-Go wallet top-ups are processed securely via Polar.sh and activated automatically on your account(<code className="font-mono bg-brand-500/15 px-1 py-0.5 rounded text-brand-700 dark:text-brand-300">{user?.user_id}</code>) upon payment.
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
                      Differential billing applies: upgrading mid-cycle charges only the price difference and adds the net quota difference on top of current credits immediately.
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
                    const quote = upgradeQuote?.[plan.id];
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
                            {plan.current && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1 font-mono">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                              ${plan.price}
                            </span>
                            <span className="text-xs text-zinc-400">/mo</span>
                          </div>

                          <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <li>• {plan.normal} Normal</li>
                            <li>• {plan.adv} Advanced</li>
                                                        <li>• {plan.rps} & {plan.rpm}</li>
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
                              {billingLoading === plan.id ? 'Redirecting...' : `Subscribe ($${plan.price}/mo)`}
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
                    Credits never expire. Normal: $0.003/req ($3.00/1k) | Advanced: $0.005/req ($5.00/1k) | ID Crosswalk & Autocomplete: Free.
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
                    Instant wallet credit top-up of <strong className="text-zinc-900 dark:text-zinc-100">${topupAmount} USD</strong> via Polar checkout. Credits are added immediately upon payment.
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
                    <label className="text-xs font-mono text-zinc-500">Normal Queries: {formatNumber(volumeNormal)}</label>
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
                    <label className="text-xs font-mono text-zinc-500">Advanced Queries: {formatNumber(volumeAdvanced)}</label>
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

                <div className="flex items-center justify-between pt-2 text-xs font-mono">
                  <span className="text-zinc-500">
                    Estimated Commitment: <strong className="text-zinc-900 dark:text-zinc-100 tabular-nums">${Math.round((volumeNormal * 0.003 + volumeAdvanced * 0.005) * 0.8)} USD/mo</strong>
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
                        : `Purchase Custom Pack ($${Math.round((volumeNormal * 0.003 + volumeAdvanced * 0.005) * 0.8)} USD)`}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 4: COUPONS & USAGE LEDGER */}
          {/* ================================================================= */}
          {activeTab === 'coupons' && (
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

                <form onSubmit={handleRedeemCoupon} className="flex gap-2">
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
                            {ledgerLoading ? 'Loading ledger...' : 'No transaction records found in ledger yet.'}
                          </td>
                        </tr>
                      ) : (
                        ledgerEntries.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
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
                              {entry.note ? entry.note.replace(/\s*\[polar_order:[^\]]+\]/g, '') : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 5: SETTINGS */}
          {/* ================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div>
                  <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    Developer Account Settings
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Manage your identity, primary project credentials, and connected authentication provider.
                  </p>
                </div>

                {settingsMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      settingsMessage.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                    }`}
                  >
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{settingsMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  {/* Account / Billing User ID (Read-Only with Copy) */}
                  <div className="p-3.5 rounded-xl border border-brand-500/25 bg-brand-500/5 dark:bg-brand-500/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold mb-0.5">
                        Account / Billing User ID
                      </label>
                      <div className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate select-all">
                        {user?.user_id || '—'}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Include this ID when contacting billing support or activating custom plan upgrades.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user?.user_id || '', 'settings_user_id')}
                      className="shrink-0 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-brand-500 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      {copiedKeyId === 'settings_user_id' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Verified Email & Provider (Read-Only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-500 mb-1">
                        Verified Email
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-500 text-xs font-mono cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-500 mb-1">
                        Auth Provider
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          user?.auth_provider === 'SUPABASE_GOOGLE' || user?.auth_provider === 'google'
                            ? 'Google'
                            : user?.auth_provider === 'email_password' || user?.auth_provider === 'password'
                            ? 'Email & Password'
                            : 'Email OTP'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Display Name / Handle
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  {/* Company / Project Name */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Company or App Name
                    </label>
                    <input
                      type="text"
                      value={profileCompany}
                      onChange={(e) => setProfileCompany(e.target.value)}
                      placeholder="e.g. Acme Labs"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  {/* Use Case */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Primary Use Case
                    </label>
                    <input
                      type="text"
                      value={profileUseCase}
                      onChange={(e) => setProfileUseCase(e.target.value)}
                      placeholder="e.g. AI Agent RAG, Timestamp Search"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                  >
                    {settingsLoading ? 'Saving Changes...' : 'Save Profile Settings'}
                  </button>
                </form>

                {/* Change Password Section */}
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div>
                    <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Security & Password
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Change or set your account password for email and password authentication.
                    </p>
                  </div>

                  {passwordFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        passwordFeedback.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}
                    >
                      {passwordFeedback.type === 'success' ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{passwordFeedback.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Leave blank if setting for the first time"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading || !newPassword}
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Sign Out Section */}
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                      Sign Out
                    </span>
                    <span className="text-xs text-zinc-500">
                      Terminates your current session and clears your local session tokens.
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
