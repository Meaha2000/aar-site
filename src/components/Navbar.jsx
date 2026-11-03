import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export function Navbar({ onOpenMenu, onOpenDrawer }) {
  const handleOpenMenu = onOpenDrawer || onOpenMenu;
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Header Left: Brand Logo + Identity */}
        <a
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1 -m-1 min-w-0"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-brand-600 to-sakura-500 p-[1px] shadow-sm shrink-0">
            <div className="w-full h-full bg-[#FDF8F2] dark:bg-[#FDF8F2] rounded-[11px] flex items-center justify-center overflow-hidden">
              <img
                src="/assets/img/logo.png"
                alt="AAR Logo"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="hidden font-mono font-bold text-xs text-brand-600 dark:text-brand-400">
                AAR
              </span>
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-bold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap truncate">
              Anime Akashic Records
            </span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 tracking-wide uppercase truncate">
              Semantic Discovery & Vector API
            </span>
          </div>
        </a>

        {/* Header Right: Theme Switcher + Menu Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in-75 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 animate-in fade-in zoom-in-75 duration-200" />
            )}
          </button>

          <button
            onClick={handleOpenMenu}
            aria-label="Open Navigation Menu"
            className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Menu className="w-5 h-5" />
            {isAuthenticated && user && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-zinc-950" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
