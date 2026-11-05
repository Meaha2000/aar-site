import React, { useState, useEffect } from 'react';
import {
  Activity,
  Key,
  CreditCard,
  Receipt,
  Settings,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';
import { safeCopyToClipboard } from '../lib/utils';
import { OverviewTab } from '../components/dashboard/OverviewTab';
import { ApiKeysTab } from '../components/dashboard/ApiKeysTab';
import { BillingTab } from '../components/dashboard/BillingTab';
import { CouponsLedgerTab } from '../components/dashboard/CouponsLedgerTab';
import { SettingsTab } from '../components/dashboard/SettingsTab';

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
  const [billingLoading, setBillingLoading] = useState(null);
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
  }, [refreshUser]);

  // Load ledger or upgrade quotes on tab switch
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
    if (user?.tier === 'founder') {
      const ok = window.confirm(
        'WARNING: You are currently on the Lifetime Founder Grant (50,000 Normal + 10,000 Advanced requests/mo, ∞ Lifetime).\n\nIf you switch to another paid plan, you will permanently lose your Founder Grant and cannot revert back to it. Are you sure you want to proceed?'
      );
      if (!ok) return;
    }
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

  // Safe Copy helper (uses safeCopyToClipboard with fallback to avoid NotAllowedError)
  const copyToClipboard = async (text, id) => {
    await safeCopyToClipboard(text);
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
          <h1 className="font-sans font-bold text-2xl text-zinc-900 dark:text-zinc-100 flex flex-wrap items-center gap-2.5">
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
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
              {user?.rate_limits?.rps || 1} RPS
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
              {user?.rate_limits?.rpm || 30} RPM
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Console Layout: Left Sidebar Rail + Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Sidebar Rail */}
        <div className="lg:col-span-3 space-y-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 tabs-scrollbar">
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
                  className={`w-auto lg:w-full shrink-0 lg:shrink flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
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
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              setActiveTab={setActiveTab}
              normalRem={normalRem}
              normalMax={normalMax}
              normalPct={normalPct}
              advRem={advRem}
              advMax={advMax}
              advPct={advPct}
              paygBalance={paygBalance}
            />
          )}

          {activeTab === 'keys' && (
            <ApiKeysTab
              keysList={keysList}
              newKeyName={newKeyName}
              setNewKeyName={setNewKeyName}
              isCreateKeyModalOpen={isCreateKeyModalOpen}
              setIsCreateKeyModalOpen={setIsCreateKeyModalOpen}
              revealedNewKey={revealedNewKey}
              setRevealedNewKey={setRevealedNewKey}
              copiedKeyId={copiedKeyId}
              keyActionLoading={keyActionLoading}
              keyError={keyError}
              setKeyError={setKeyError}
              handleCreateKey={handleCreateKey}
              handleDeleteKey={handleDeleteKey}
              copyToClipboard={copyToClipboard}
            />
          )}

          {activeTab === 'billing' && (
            <BillingTab
              user={user}
              billingMessage={billingMessage}
              billingLoading={billingLoading}
              upgradeQuote={upgradeQuote}
              topupAmount={topupAmount}
              setTopupAmount={setTopupAmount}
              volumeNormal={volumeNormal}
              setVolumeNormal={setVolumeNormal}
              volumeAdvanced={volumeAdvanced}
              setVolumeAdvanced={setVolumeAdvanced}
              handleToggleAutoRenew={handleToggleAutoRenew}
              handleUpgrade={handleUpgrade}
              handleTopup={handleTopup}
              handleCustomVolumeCheckout={handleCustomVolumeCheckout}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsLedgerTab
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponLoading={couponLoading}
              couponFeedback={couponFeedback}
              handleRedeemCoupon={handleRedeemCoupon}
              ledgerEntries={ledgerEntries}
              ledgerLoading={ledgerLoading}
              loadLedger={loadLedger}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              user={user}
              settingsMessage={settingsMessage}
              profileName={profileName}
              setProfileName={setProfileName}
              profileCompany={profileCompany}
              setProfileCompany={setProfileCompany}
              profileUseCase={profileUseCase}
              setProfileUseCase={setProfileUseCase}
              settingsLoading={settingsLoading}
              handleSaveProfile={handleSaveProfile}
              copiedKeyId={copiedKeyId}
              copyToClipboard={copyToClipboard}
              passwordFeedback={passwordFeedback}
              oldPassword={oldPassword}
              setOldPassword={setOldPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordLoading={passwordLoading}
              handleChangePassword={handleChangePassword}
              logout={logout}
            />
          )}
        </div>
      </div>
    </div>
  );
}
