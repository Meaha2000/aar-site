// API client for Anime Akashic Records (AAR) — All paths configurable via .env (VITE_*)

const SESSION_STORAGE_KEY = import.meta.env.VITE_SESSION_STORAGE_KEY || 'aar_session_token';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname.includes('aarecords.tech') ? 'https://api.aarecords.tech' : '');
export const AUTH_BASE_PATH = import.meta.env.VITE_AUTH_BASE_PATH || '/auth';
export const LORE_BASE_PATH = import.meta.env.VITE_LORE_BASE_PATH || '/lore';

export const API_PATHS = {
  // Search & Catalog routes
  SEARCH: import.meta.env.VITE_API_SEARCH_PATH || '/search',
  RECOMMEND: import.meta.env.VITE_API_RECOMMEND_PATH || '/recommend',
  ASK: import.meta.env.VITE_API_ASK_PATH || '/ask',
  AUTOCOMPLETE: import.meta.env.VITE_API_AUTOCOMPLETE_PATH || '/autocomplete',
  RESOLVE: import.meta.env.VITE_API_RESOLVE_PATH || '/resolve',
  STATS: import.meta.env.VITE_API_STATS_PATH || '/stats',
  HEALTH: import.meta.env.VITE_API_HEALTH_PATH || '/health',

  // Lore & Scene Engine routes
  ADVANCED_SEARCH: import.meta.env.VITE_API_ADVANCED_SEARCH_PATH || '/advanced-search',
  ADVANCED_RECOMMEND: import.meta.env.VITE_API_ADVANCED_RECOMMEND_PATH || '/advanced-recommend',
  LORE_ASK: import.meta.env.VITE_API_LORE_ASK_PATH || '/lore-ask',
  LORE_ARC_INDEX: import.meta.env.VITE_API_LORE_ARC_INDEX_PATH || `${LORE_BASE_PATH}/arc-index`,
  LORE_STATS: import.meta.env.VITE_API_LORE_STATS_PATH || `${LORE_BASE_PATH}/stats`,

  // Auth & Billing routes
  AUTH_CHECK_EMAIL: import.meta.env.VITE_AUTH_CHECK_EMAIL_PATH || `${AUTH_BASE_PATH}/check-email`,
  AUTH_SEND_OTP: import.meta.env.VITE_AUTH_SEND_OTP_PATH || `${AUTH_BASE_PATH}/otp/send`,
  AUTH_VERIFY_OTP: import.meta.env.VITE_AUTH_VERIFY_OTP_PATH || `${AUTH_BASE_PATH}/otp/verify`,
  AUTH_COMPLETE_REGISTRATION: import.meta.env.VITE_AUTH_COMPLETE_REGISTRATION_PATH || `${AUTH_BASE_PATH}/complete-registration`,
  AUTH_REGISTER: import.meta.env.VITE_AUTH_REGISTER_PATH || `${AUTH_BASE_PATH}/register`,
  AUTH_PASSWORD_LOGIN: import.meta.env.VITE_AUTH_PASSWORD_LOGIN_PATH || `${AUTH_BASE_PATH}/login`,
  AUTH_PASSWORD_RESET: import.meta.env.VITE_AUTH_PASSWORD_RESET_PATH || `${AUTH_BASE_PATH}/password/reset-otp`,
  AUTH_CHANGE_PASSWORD: import.meta.env.VITE_AUTH_CHANGE_PASSWORD_PATH || `${AUTH_BASE_PATH}/change-password`,
  AUTH_CHECK_PASSWORD: import.meta.env.VITE_AUTH_CHECK_PASSWORD_PATH || `${AUTH_BASE_PATH}/check-password`,
  AUTH_SUPABASE_EXCHANGE: import.meta.env.VITE_AUTH_SUPABASE_EXCHANGE_PATH || `${AUTH_BASE_PATH}/supabase/exchange`,
  AUTH_GOOGLE_EXCHANGE: import.meta.env.VITE_AUTH_GOOGLE_EXCHANGE_PATH || `${AUTH_BASE_PATH}/google/exchange`,
  AUTH_ME: import.meta.env.VITE_AUTH_ME_PATH || `${AUTH_BASE_PATH}/me`,
  AUTH_LOGOUT: import.meta.env.VITE_AUTH_LOGOUT_PATH || `${AUTH_BASE_PATH}/logout`,
  AUTH_ONBOARDING: import.meta.env.VITE_AUTH_ONBOARDING_PATH || `${AUTH_BASE_PATH}/onboarding`,
  AUTH_PROFILE: import.meta.env.VITE_AUTH_PROFILE_PATH || `${AUTH_BASE_PATH}/profile`,
  AUTH_KEYS: import.meta.env.VITE_AUTH_KEYS_PATH || `${AUTH_BASE_PATH}/keys`,
  AUTH_ROTATE_KEY: import.meta.env.VITE_AUTH_ROTATE_KEY_PATH || `${AUTH_BASE_PATH}/rotate-key`,
  AUTH_REDEEM_COUPON: import.meta.env.VITE_AUTH_REDEEM_COUPON_PATH || `${AUTH_BASE_PATH}/coupon/redeem`,
  AUTH_UPGRADE_QUOTE: import.meta.env.VITE_AUTH_UPGRADE_QUOTE_PATH || `${AUTH_BASE_PATH}/upgrade-quote`,
  AUTH_UPGRADE: import.meta.env.VITE_AUTH_UPGRADE_PATH || `${AUTH_BASE_PATH}/upgrade`,
  AUTH_TOPUP: import.meta.env.VITE_AUTH_TOPUP_PATH || `${AUTH_BASE_PATH}/topup`,
  AUTH_ADMIN_BILLING: import.meta.env.VITE_ADMIN_BILLING_ENDPOINT || `${AUTH_BASE_PATH}/admin/billing`,
  AUTH_LEDGER: import.meta.env.VITE_AUTH_LEDGER_PATH || `${AUTH_BASE_PATH}/ledger`,
  AUTH_DELETE_ACCOUNT: import.meta.env.VITE_AUTH_DELETE_ACCOUNT_PATH || `${AUTH_BASE_PATH}/account/delete`,
  AUTH_CONTACT: import.meta.env.VITE_AUTH_CONTACT_PATH || `${AUTH_BASE_PATH}/contact`,
  AUTH_POLAR_CHECKOUT: `${AUTH_BASE_PATH}/polar/checkout`,
  AUTH_POLAR_AUTO_RENEW: `${AUTH_BASE_PATH}/polar/auto-renew`,
  AUTH_POLAR_CANCEL: `${AUTH_BASE_PATH}/polar/cancel`,
  AUTH_POLAR_CUSTOM_CHECKOUT: `${AUTH_BASE_PATH}/polar/custom-checkout`,
  AUTH_POLAR_REFUND: `${AUTH_BASE_PATH}/polar/refund`,
};

export function getSessionToken() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setSessionToken(token) {
  try {
    if (token) {
      localStorage.setItem(SESSION_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    if (token.startsWith('aar_live_') || token.startsWith('aar_admin_') || token === 'aar_free_access') {
      headers['X-API-Key'] = token;
    }
    headers['X-Session-Token'] = token;
  }

  const resolvedUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(resolvedUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || 'Authentication required');
    error.status = 401;
    error.data = errorData;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: 'Failed to parse JSON response' };
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (typeof data?.detail === 'string') {
      errorMsg = data.detail;
    } else if (Array.isArray(data?.detail)) {
      errorMsg = data.detail.map((e) => {
        const field = (e.loc && e.loc.length > 0 ? String(e.loc[e.loc.length - 1]) : 'field').replace(/_/g, ' ');
        const fieldCap = field.charAt(0).toUpperCase() + field.slice(1);
        const msg = String(e.msg || 'Invalid value').replace(/^String should have at least (\d+) characters$/i, 'must be at least $1 characters long.');
        return `${fieldCap}: ${msg}`;
      }).join(' · ');
    } else if (typeof data?.detail === 'object' && data?.detail !== null) {
      errorMsg = data.detail.message || data.detail.error || JSON.stringify(data.detail);
    } else if (typeof data?.error?.message === 'string') {
      errorMsg = data.error.message;
    } else if (typeof data?.error === 'string') {
      errorMsg = data.error;
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Auth API Methods
export const authApi = {
  sendOtp: (email, purpose = 'login') => apiRequest(API_PATHS.AUTH_SEND_OTP, {
    method: 'POST',
    body: JSON.stringify({ email, purpose }),
  }),

  verifyOtp: (email, code) => apiRequest(API_PATHS.AUTH_VERIFY_OTP, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  }),

  registerWithPassword: (emailOrData, password, full_name = '') => apiRequest(API_PATHS.AUTH_REGISTER, {
    method: 'POST',
    body: JSON.stringify(
      typeof emailOrData === 'object' && emailOrData !== null
        ? emailOrData
        : { email: emailOrData, password, full_name }
    ),
  }),

  loginWithPassword: (email, password) => apiRequest(API_PATHS.AUTH_PASSWORD_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  passwordLogin: (email, password) => apiRequest(API_PATHS.AUTH_PASSWORD_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  checkEmail: (email) => apiRequest(API_PATHS.AUTH_CHECK_EMAIL, {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  changePassword: (old_password, new_password, otp_code = undefined) => apiRequest(API_PATHS.AUTH_CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(
      typeof old_password === 'object' && old_password !== null
        ? old_password
        : { old_password: old_password || null, new_password, otp_code }
    ),
  }),

  exchangeSupabaseToken: (access_token) => apiRequest(API_PATHS.AUTH_SUPABASE_EXCHANGE, {
    method: 'POST',
    body: JSON.stringify({ access_token }),
  }),

  exchangeGoogleCode: (code, redirect_uri) => apiRequest(API_PATHS.AUTH_GOOGLE_EXCHANGE, {
    method: 'POST',
    body: JSON.stringify({ code, redirect_uri }),
  }),

  getMe: () => apiRequest(API_PATHS.AUTH_ME),

  logout: () => apiRequest(API_PATHS.AUTH_LOGOUT, {
    method: 'POST',
  }),

  onboarding: (data) => apiRequest(API_PATHS.AUTH_ONBOARDING, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  submitOnboarding: (data) => apiRequest(API_PATHS.AUTH_ONBOARDING, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  resetPasswordWithOtp: (emailOrData, code, newPassword) => apiRequest(API_PATHS.AUTH_PASSWORD_RESET, {
    method: 'POST',
    body: JSON.stringify(
      typeof emailOrData === 'object' && emailOrData !== null
        ? emailOrData
        : { email: emailOrData, code, new_password: newPassword }
    ),
  }),

  deleteAccount: (dataOrCode) => apiRequest(API_PATHS.AUTH_DELETE_ACCOUNT, {
    method: 'POST',
    body: JSON.stringify(
      typeof dataOrCode === 'object' && dataOrCode !== null
        ? dataOrCode
        : { code: dataOrCode }
    ),
  }),

  completeRegistration: (data) => apiRequest(API_PATHS.AUTH_COMPLETE_REGISTRATION, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  checkPassword: (password) => apiRequest(API_PATHS.AUTH_CHECK_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),

  updateProfile: (data) => apiRequest(API_PATHS.AUTH_PROFILE, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  listKeys: () => apiRequest(API_PATHS.AUTH_KEYS),

  createKey: (name) => apiRequest(API_PATHS.AUTH_KEYS, {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),

  deleteKey: (keyId) => apiRequest(`${API_PATHS.AUTH_KEYS}/${encodeURIComponent(keyId)}`, {
    method: 'DELETE',
  }),

  rotateKey: () => apiRequest(API_PATHS.AUTH_ROTATE_KEY, {
    method: 'POST',
  }),

  getUpgradeQuote: () => apiRequest(API_PATHS.AUTH_UPGRADE_QUOTE),

  createPolarCheckout: (plan_id, amount_usd = null) => apiRequest(API_PATHS.AUTH_POLAR_CHECKOUT, {
    method: 'POST',
    body: JSON.stringify({ plan_id, ...(amount_usd !== null ? { amount_usd: Number(amount_usd) } : {}) }),
  }),

  togglePolarAutoRenew: (enabled) => apiRequest(API_PATHS.AUTH_POLAR_AUTO_RENEW, {
    method: 'POST',
    body: JSON.stringify({ enabled: Boolean(enabled) }),
  }),

  cancelPolarSubscription: (immediate = false) => apiRequest(API_PATHS.AUTH_POLAR_CANCEL, {
    method: 'POST',
    body: JSON.stringify({ immediate: Boolean(immediate) }),
  }),

  createPolarCustomCheckout: (normal_queries, advanced_queries = 0) => apiRequest(API_PATHS.AUTH_POLAR_CUSTOM_CHECKOUT, {
    method: 'POST',
    body: JSON.stringify({ normal_queries: Number(normal_queries), advanced_queries: Number(advanced_queries) }),
  }),

  requestPolarRefund: (reason = 'Customer requested refund within 14-day window') => apiRequest(API_PATHS.AUTH_POLAR_REFUND, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),

  upgradeTier: (target_tier, adminKey = '') => apiRequest(API_PATHS.AUTH_UPGRADE, {
    method: 'POST',
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
    body: JSON.stringify({ target_tier, admin_key: adminKey || undefined }),
  }),

  redeemCoupon: (code) => apiRequest(API_PATHS.AUTH_REDEEM_COUPON, {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),

  topup: (amount_usd, adminKey = '') => apiRequest(API_PATHS.AUTH_TOPUP, {
    method: 'POST',
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
    body: JSON.stringify({ amount_usd: Number(amount_usd), admin_key: adminKey || undefined }),
  }),

  topupBalance: (amount_usd, tier = null, adminKey = '') => apiRequest(API_PATHS.AUTH_TOPUP, {
    method: 'POST',
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
    body: JSON.stringify({ amount_usd: Number(amount_usd), tier, admin_key: adminKey || undefined }),
  }),

  adminBilling: (payload, adminKey) => apiRequest(API_PATHS.AUTH_ADMIN_BILLING, {
    method: 'POST',
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
    body: JSON.stringify({ ...payload, admin_key: adminKey }),
  }),

  getLedger: (limit = 50) => apiRequest(`${API_PATHS.AUTH_LEDGER}?limit=${limit}`),

  sendContactMessage: (data) => apiRequest(API_PATHS.AUTH_CONTACT, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  submitContact: (data) => apiRequest(API_PATHS.AUTH_CONTACT, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Search & Retrieval API Methods
export const searchApi = {
  search: (query, limit = 8, mode = 'hybrid', mediaType = null, adultFilter = true, queryBreakdown = false) => {
    const scope = {};
    if (mediaType && mediaType !== 'all') scope.types = [mediaType];
    if (adultFilter) scope.adult = false;
    const body = typeof query === 'object' && query !== null ? query : {
      question: query,
      limit,
      mode: mode === 'dense' ? 'semantic' : 'hybrid',
      ...(queryBreakdown ? { query_breakdown: true } : {}),
      ...(Object.keys(scope).length > 0 ? { scope } : {}),
    };
    return apiRequest(API_PATHS.SEARCH, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  catalogSearch: (payload) => apiRequest(API_PATHS.SEARCH, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  recommend: (seedIds, limit = 6, negativeIds = [], mediaType = null, adultFilter = true) => {
    if (typeof seedIds === 'object' && !Array.isArray(seedIds) && seedIds !== null) {
      return apiRequest(API_PATHS.RECOMMEND, {
        method: 'POST',
        body: JSON.stringify(seedIds),
      });
    }
    const seeds = Array.isArray(seedIds) ? seedIds.map(String) : [String(seedIds)];
    const negs = Array.isArray(negativeIds) ? negativeIds.map(String) : (negativeIds ? [String(negativeIds)] : []);
    const body = {
      seed_work_ids: seeds,
      limit,
    };
    if (negs.length > 0) body.negative_work_ids = negs;
    if (mediaType && mediaType !== 'all') body.target_scope = mediaType;
    if (adultFilter) body.scope = { ...(body.scope || {}), adult: false };
    return apiRequest(API_PATHS.RECOMMEND, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  catalogRecommend: (payload) => apiRequest(API_PATHS.RECOMMEND, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  ask: (question, limit = 3, mediaType = null, adultFilter = true) => {
    const scope = {};
    if (mediaType && mediaType !== 'all') scope.types = [mediaType];
    if (adultFilter) scope.adult = false;
    const body = typeof question === 'object' && question !== null ? question : {
      question,
      limit,
      ...(queryBreakdown ? { query_breakdown: true } : {}),
      ...(Object.keys(scope).length > 0 ? { scope } : {}),
    };
    return apiRequest(API_PATHS.ASK, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  catalogAsk: (payload) => apiRequest(API_PATHS.ASK, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  advancedSearch: (query, limit = 10, granularity = 'scene', extra = {}) => {
    const body = typeof query === 'object' && query !== null ? query : {
      query,
      limit,
      granularity,
      ...(extra || {}),
    };
    return apiRequest(API_PATHS.ADVANCED_SEARCH, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  loreSearch: (payload) => apiRequest(API_PATHS.ADVANCED_SEARCH, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  advancedRecommend: (options, limit = 6, granularity = 'scene') => {
    let body = {};
    if (typeof options === 'string') {
      body = {
        positive_queries: [options],
        limit,
        granularity,
      };
    } else if (typeof options === 'object' && options !== null) {
      body = {
        granularity: options.granularity || granularity || 'scene',
        limit: options.limit || limit || 6,
      };
      if (options.positive_ids) body.positive_ids = options.positive_ids;
      if (options.negative_ids) body.negative_ids = options.negative_ids;
      if (options.positive_queries) body.positive_queries = options.positive_queries;
      if (options.negative_queries) body.negative_queries = options.negative_queries;
      if (options.exclude_same_work !== undefined) body.exclude_same_work = options.exclude_same_work;
      if (options.exclude_same_franchise !== undefined) body.exclude_same_franchise = options.exclude_same_franchise;
    }
    return apiRequest(API_PATHS.ADVANCED_RECOMMEND, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  loreRecommend: (payload) => apiRequest(API_PATHS.ADVANCED_RECOMMEND, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  loreAsk: (query, limit = 5, granularity = 'scene', extra = {}) => {
    const body = typeof query === 'object' && query !== null ? query : {
      query,
      limit,
      granularity,
      ...(extra || {}),
    };
    return apiRequest(API_PATHS.LORE_ASK, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getArcs: (limit = 20) => apiRequest(`${API_PATHS.LORE_ARC_INDEX}?limit=${limit}`),
  getWorkArcs: (workId) => apiRequest(`${API_PATHS.LORE_ARC_INDEX}/${encodeURIComponent(workId)}`),

  resolveId: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') qs.set(k, String(v).trim());
    });
    return apiRequest(`${API_PATHS.RESOLVE}?${qs.toString()}`);
  },

  autocomplete: (q, type = '', limit = 8) => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (type) params.set('type', type);
    return apiRequest(`${API_PATHS.AUTOCOMPLETE}?${params.toString()}`);
  },

  getStats: () => apiRequest(API_PATHS.STATS),
  getLoreStats: () => apiRequest(API_PATHS.LORE_STATS),
  health: () => apiRequest(API_PATHS.HEALTH),
};
