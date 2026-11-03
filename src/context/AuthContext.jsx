import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, getSessionToken, setSessionToken } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState(null);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const refreshUser = useCallback(async () => {
    const token = getSessionToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await authApi.getMe();
      const userData = data?.user || data;
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      console.warn('Auth check error:', err.status, err.message);
      if (err?.status === 401 || /invalid.*session|expired.*session|missing.*session|unauthorized/i.test(err?.message || '')) {
        setSessionToken('');
        setUser(null);
      }
      setLoading(false);
      return null;
    }
  }, []);

  const loginWithToken = async (token) => {
    setSessionToken(token);
    const data = await authApi.getMe();
    const userData = data?.user || data;
    setUser(userData);
    closeAuthModal();
    return userData;
  };

  const logout = () => {
    setSessionToken('');
    setUser(null);
    window.location.href = '/';
  };

  // On mount: check token or handle Google OAuth / Supabase OAuth callback
  useEffect(() => {
    async function initAuth() {
      // 1. Check for Direct Google OAuth 2.0 authorization code in query params (?code=...&state=google_direct_oauth)
      const search = window.location.search;
      if (search && search.includes('code=')) {
        const searchParams = new URLSearchParams(search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        if (code && (state === 'google_direct_oauth' || !state)) {
          // Immediately clean URL so code is not visible or re-used
          window.history.replaceState({}, document.title, window.location.pathname);
          try {
            setLoading(true);
            const redirectUri = `${window.location.origin}/dashboard`;
            const exchangeRes = await authApi.exchangeGoogleCode(code, redirectUri);
            if (exchangeRes?.session_token) {
              setSessionToken(exchangeRes.session_token);
              setUser(exchangeRes.user);
              if (exchangeRes.is_new_user || exchangeRes.needs_onboarding || !exchangeRes.user?.onboarded) {
                window.location.href = '/welcome';
                return;
              }
            }
          } catch (err) {
            console.error('Direct Google OAuth exchange error:', err);
            setAuthError(err.message || 'Failed to exchange Google OAuth authorization code');
          }
        }
      }

      // 2. Backward compatibility: Check for Supabase OAuth hash fragments e.g. #access_token=...
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        try {
          const params = new URLSearchParams(hash.replace(/^#/, ''));
          const accessToken = params.get('access_token');
          if (accessToken) {
            setLoading(true);
            const exchangeRes = await authApi.exchangeSupabaseToken(accessToken);
            if (exchangeRes?.session_token) {
              setSessionToken(exchangeRes.session_token);
              setUser(exchangeRes.user);
              // Clean URL hash without reload
              window.history.replaceState(null, '', window.location.pathname);
              if (exchangeRes.is_new_user || exchangeRes.needs_onboarding || !exchangeRes.user?.onboarded) {
                window.location.href = '/welcome';
                return;
              }
            }
          }
        } catch (err) {
          console.error('OAuth exchange error:', err);
          setAuthError(err.message || 'Failed to exchange Google OAuth token');
        }
      }

      await refreshUser();
    }

    initAuth();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authError,
        setAuthError,
        loginWithToken,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
