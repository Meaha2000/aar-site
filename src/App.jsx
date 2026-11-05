import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { SakuraBackdrop } from './components/SakuraBackdrop';
import { Home } from './pages/Home';

const Search = lazy(() => import('./pages/Search').then((m) => ({ default: m.Search })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const ApiDocs = lazy(() => import('./pages/ApiDocs').then((m) => ({ default: m.ApiDocs })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const Pricing = lazy(() => import('./pages/Pricing').then((m) => ({ default: m.Pricing })));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          Loading module...
        </span>
      </div>
    </div>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('UI Render Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto my-20 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-4">
          <h2 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
            Page updated — reloading view
          </h2>
          <p className="text-xs font-mono text-zinc-500 break-all">
            {this.state.error?.message || 'Unexpected render state'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get('utm_source') || '';
      const utm_medium = params.get('utm_medium') || '';
      const utm_campaign = params.get('utm_campaign') || '';
      const ref = params.get('ref') || '';
      const referrer = document.referrer || '';
      const isInternalRef =
        referrer &&
        (referrer.includes('aarecords.tech') ||
          referrer.includes('yuidev.tech') ||
          referrer.includes('localhost'));
      const trackKey = `aar_tracked_${window.location.pathname}_${window.location.search}`;
      if (
        !sessionStorage.getItem(trackKey) &&
        (utm_source || utm_medium || utm_campaign || ref || (referrer && !isInternalRef))
      ) {
        sessionStorage.setItem(trackKey, '1');
        const apiBase =
          import.meta.env.VITE_API_BASE_URL !== undefined &&
          import.meta.env.VITE_API_BASE_URL !== ''
            ? import.meta.env.VITE_API_BASE_URL
            : 'https://api.aarecords.tech';
        fetch(`${apiBase.replace(/\/$/, '')}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utm_source: utm_source || null,
            utm_medium: utm_medium || null,
            utm_campaign: utm_campaign || null,
            ref: ref || null,
            referrer: referrer || null,
            path: window.location.pathname,
            query: window.location.search || null,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank' ||
        href.startsWith('#')
      ) {
        return;
      }

      if (href.startsWith('/')) {
        e.preventDefault();
        const prevPath = window.location.pathname;
        window.history.pushState(null, '', href);
        const nextPath = window.location.pathname;
        setCurrentPath(nextPath);
        const hasSearchQuery =
          nextPath.startsWith('/search') && window.location.search.includes('q=');
        if (nextPath !== prevPath && !hasSearchQuery) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  const renderRoute = () => {
    if (currentPath === '/' || currentPath === '') {
      return <Home />;
    }
    if (currentPath.startsWith('/search')) {
      return <Search />;
    }
    if (currentPath.startsWith('/dashboard')) {
      return <Dashboard />;
    }
    if (currentPath.startsWith('/welcome')) {
      return <Onboarding />;
    }
    if (currentPath.startsWith('/api')) {
      return <ApiDocs />;
    }
    if (currentPath.startsWith('/about')) {
      return <About />;
    }
    if (currentPath.startsWith('/pricing')) {
      return <Pricing />;
    }
    if (currentPath.startsWith('/contact')) {
      return <Contact />;
    }

    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center space-y-4">
        <h1 className="font-mono font-bold text-4xl text-brand-600">404</h1>
        <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
          Page Not Found
        </h2>
        <p className="text-xs text-zinc-500">
          The requested route <code className="font-mono text-zinc-400">{currentPath}</code> does
          not exist on this platform.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition-colors"
        >
          Return Home
        </a>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FAF6F0] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-brand-500 selection:text-white overflow-x-clip">
      <SakuraBackdrop />
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenMenu={() => setIsDrawerOpen(true)}
        currentPath={currentPath}
      />
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentPath={currentPath}
      />
      <AuthModal />
      <main className="relative z-10 flex-1">
        <AppErrorBoundary key={currentPath}>
          <Suspense fallback={<RouteLoadingFallback />}>{renderRoute()}</Suspense>
        </AppErrorBoundary>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
