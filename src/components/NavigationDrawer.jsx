import React, { useEffect } from 'react';
import {
  X,
  Home,
  Search,
  LayoutDashboard,
  Code2,
  BookOpen,
  Mail,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export function NavigationDrawer({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  // Close on Escape key & lock scroll
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPath = window.location.pathname;

  const navLinks = [
    { label: 'Home', path: '/', icon: Home, desc: 'Overview, hero & core platform specs' },
    { label: 'Interactive Search', path: '/search', icon: Search, desc: 'Test scene search, story arcs & lore live' },
    { label: 'Developer Console', path: '/dashboard', icon: LayoutDashboard, desc: 'Keys, quotas, billing & audit ledger' },
    { label: 'Pricing & Quotas', path: '/pricing', icon: Sparkles, desc: 'Plans, PAYG & unit costs' },
    { label: 'API Documentation', path: '/api', icon: Code2, desc: 'Full reference, cURL, schemas & ID crosswalk' },
    { label: 'About & Methodology', path: '/about', icon: BookOpen, desc: 'Corpus architecture, pipeline & indexing' },
    { label: 'Contact & Legal Terms', path: '/contact', icon: Mail, desc: 'Support, terms of service, refund policy & legal governance' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Right Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm sm:max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between transition-transform duration-300 animate-in slide-in-from-right">
          
          {/* Top Header */}
          <div className="p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FDF8F2] dark:bg-[#FDF8F2] border border-brand-500/20 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                <img src="/assets/img/logo.png" alt="AAR" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Navigation
                </h3>
                <div className="flex items-center ga text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Operational
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              aria-label="Close Navigation Menu"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Route Items */}
          <div className="p-6 flex-1 overflow-y-auto space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`group flex items-start gap-3.5 p-3 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/20'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-semibold text-sm tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                      {item.desc}
                    </span>
                  </div>
                </a>
              );
            })}

            {/* External Links */}
            <div className="pt-4 mt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-3 font-semibold">
                Direct Specs & Community
              </span>
              <div className="mt-2 space-y-1">
                <a
                  href="/openapi.json"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <span>openapi.json (OpenAPI 3.1)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <span>llms.txt (LLM Context Standard)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                
              </div>
            </div>
          </div>

          {/* Bottom Footer Controls */}
          <div className="p-6 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3">
            
            {/* Theme Toggle row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Interface Appearance
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Auth status row */}
            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div className="flex flex-col truncate pr-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {(user?.full_name || (typeof user?.email === 'string' && user.email.includes('@') ? user.email.split('@')[0] : (user?.email || 'Developer')))}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate">
                    {user?.email || ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="flex items-center ga px-3 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  openAuthModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sign In / Create API Key</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
