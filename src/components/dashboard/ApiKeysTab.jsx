import React from 'react';
import { Plus, Check, Copy, Trash2 } from 'lucide-react';
import { formatDate, formatDateTime, formatNumber } from '../../lib/utils';

export function ApiKeysTab({
  keysList,
  newKeyName,
  setNewKeyName,
  isCreateKeyModalOpen,
  setIsCreateKeyModalOpen,
  revealedNewKey,
  setRevealedNewKey,
  copiedKeyId,
  keyActionLoading,
  keyError,
  setKeyError,
  handleCreateKey,
  handleDeleteKey,
  copyToClipboard,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
            API Keys ({keysList.length}/10)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Generate up to 10 independent named keys with dedicated request metrics and isolated
            revocation.
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
            <span className="font-sans font-bold text-sm">
              Key Created: {revealedNewKey.name}
            </span>
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
              {copiedKeyId === 'new_key' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
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
          {keyError && <div className="text-xs text-red-500">{keyError}</div>}
          <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production RAG Service / Mobile App"
              required
              className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
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
            </div>
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
                  No active API keys found. Click &quot;Create New API Key&quot; to generate one.
                </td>
              </tr>
            ) : (
              keysList.map((k) => (
                <tr
                  key={k.key_id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
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
  );
}
