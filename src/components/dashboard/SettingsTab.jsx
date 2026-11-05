import React from 'react';
import { Info, Check, Copy, AlertCircle } from 'lucide-react';

export function SettingsTab({
  user,
  settingsMessage,
  profileName,
  setProfileName,
  profileCompany,
  setProfileCompany,
  profileUseCase,
  setProfileUseCase,
  settingsLoading,
  handleSaveProfile,
  copiedKeyId,
  copyToClipboard,
  passwordFeedback,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordLoading,
  handleChangePassword,
  logout,
}) {
  const normalizedAuthProvider = String(user?.auth_provider || '').toLowerCase();
  const displayAuthProvider = normalizedAuthProvider.includes('google')
    ? 'google'
    : normalizedAuthProvider === 'email_password' || normalizedAuthProvider === 'password'
    ? 'Email & Password'
    : 'Email OTP';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div>
          <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Developer Account Settings
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your identity, primary project credentials, and connected authentication
            provider.
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
              <label className="block text-xs font-mono text-zinc-500 mb-1">Verified Email</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-500 text-xs font-mono cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Auth Provider</label>
              <input
                type="text"
                disabled
                value={displayAuthProvider}
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
  );
}
