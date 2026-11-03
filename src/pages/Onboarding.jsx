import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, Copy, ArrowRight, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';
import { safeCopyToClipboard } from '../lib/utils';

export function Onboarding() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [useCase, setUseCase] = useState(user?.use_case || 'ai_agent_rag');
  const [keyName, setKeyName] = useState('Production Key');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revealedKey, setRevealedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  // If already onboarded and not revealing a newly created key, redirect to dashboard
  useEffect(() => {
    if (user && user.onboarded && !revealedKey) {
      window.location.href = '/dashboard';
    }
  }, [user, revealedKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please provide your name or handle.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.onboarding({
        full_name: fullName.trim(),
        company_name: companyName.trim() || 'Independent Developer',
        use_case: useCase,
        first_key_name: keyName.trim() || 'Production Key',
      });

      const key = res?.first_api_key || res?.created_key?.raw_key || res?.api_key;
      if (key) {
        setRevealedKey(key);
        await refreshUser();
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message || 'Onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!revealedKey) return;
    await safeCopyToClipboard(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {revealedKey ? (
          /* Step 2: One-time Secret Key Reveal Screen */
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Key className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-sans font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                Your Production API Key is Ready
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
                Save this secret key securely in your environment variables. For security reasons, it will <span className="text-red-500 font-semibold">NEVER</span> be shown in plaintext again.
              </p>
            </div>

            {/* Secret Key Container */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-left">
              <code className="font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold break-all select-all">
                {revealedKey}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 text-left">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>We store only an HMAC-SHA256 cryptographic hash of this key.</span>
            </div>

            <button
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Launch Developer Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Step 1: Onboarding Questionnaire */
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Step 1 of 1 · Developer Setup
              </span>
              <h1 className="font-sans font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                Welcome to Anime Akashic Records
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Configure your developer profile and initialize your free sandbox credentials.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name / Developer Alias <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Company / App Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Project, App, or Organization Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. AniSearch Labs / Indie Dev"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Primary Use Case */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Primary Use Case
                </label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-sans"
                >
                  <option value="ai_agent_rag">AI Agent / LLM RAG Lore Retrieval</option>
                  <option value="consumer_anime_app">Consumer Anime / Recommendation App</option>
                  <option value="subscene_search">Subscene & Timestamp Scene Search</option>
                  <option value="academic_research">Academic / Cross-Media Data Research</option>
                  <option value="other">Other Commercial Application</option>
                </select>
              </div>

              {/* First Key Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  First API Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production Key"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Complete Onboarding & Generate Key</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
