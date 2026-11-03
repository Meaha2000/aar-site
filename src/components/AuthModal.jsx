import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithToken, authError, setAuthError } = useAuth();

  // Steps: 'email' | 'password' | 'otp' | 'details' | 'reset_verify'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [infoMessage, setInfoMessage] = useState('');
  const [suggestedEmail, setSuggestedEmail] = useState(null);

  // Password & Registration States
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputRefs = useRef([]);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('email');
      setPassword('');
      setConfirmPassword('');
      setOtp(['', '', '', '', '', '']);
      setInfoMessage('');
      setSuggestedEmail(null);
      setAuthError(null);
      return;
    }
    if (step === 'otp' || step === 'reset_verify') {
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } else if (step === 'password') {
      setTimeout(() => passwordInputRef.current?.focus(), 50);
    }
  }, [isAuthModalOpen, step]);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '825158435247-ofhpnm1o7u3ch6tgnb0tjm3s1idm3h3l.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/dashboard`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });
    const oauthUrl = import.meta.env.VITE_GOOGLE_OAUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth';
    window.location.href = `${oauthUrl}?${params.toString()}`;
  };

  // Step 1: Enter Email -> Check if registered (Layer 1 Hard Gate + Layer 2 Typo Warning)
  const proceedWithEmail = async (targetEmail, ignoreSuggestion = false) => {
    const trimmedEmail = (targetEmail || email).trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    setInfoMessage('');

    try {
      const checkRes = await authApi.checkEmail(trimmedEmail);
      if (checkRes?.exists && checkRes?.has_password) {
        setSuggestedEmail(null);
        setPassword('');
        setStep('password');
        setLoading(false);
        return;
      }

      // Layer 2: Soft typo suggestion if domain passed DNS MX but looks like a common typo
      if (!ignoreSuggestion && checkRes?.suggested_email && checkRes.suggested_email.toLowerCase() !== trimmedEmail.toLowerCase()) {
        setSuggestedEmail(checkRes.suggested_email);
        setLoading(false);
        return;
      }

      setSuggestedEmail(null);
      // Not registered (or no password set yet) -> Send OTP automatically
      const res = await authApi.sendOtp(trimmedEmail);
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      setResendCooldown(60);
      setInfoMessage(res.message || `Verification code sent to ${trimmedEmail}`);
    } catch (err) {
      setAuthError(err.message || 'Unable to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailContinue = async (e) => {
    e?.preventDefault();
    await proceedWithEmail(email, false);
  };

  // Step 2A: Password Login for existing users
  const handlePasswordLogin = async (e) => {
    e?.preventDefault();
    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    setInfoMessage('');
    try {
      const res = await authApi.loginWithPassword(email.trim(), password);
      if (res?.session_token) {
        localStorage.setItem('aar_session_token', res.session_token);
        await loginWithToken(res.session_token);
        closeAuthModal();
        window.location.href = res.needs_onboarding || res.user?.onboarded === false ? '/welcome' : '/dashboard';
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Forgot Password -> Immediately send OTP and open reset screen
  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setAuthError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    setInfoMessage('');
    try {
      const res = await authApi.sendOtp(trimmedEmail);
      setOtp(['', '', '', '', '', '']);
      setPassword('');
      setConfirmPassword('');
      setStep('reset_verify');
      setResendCooldown(60);
      setInfoMessage(res.message || `Password reset code sent to ${trimmedEmail}`);
    } catch (err) {
      setAuthError(err.message || 'Failed to send password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP helper
  const handleResendOtp = async (forReset = false) => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setAuthError(null);
    setInfoMessage('');
    try {
      const res = await authApi.sendOtp(email.trim());
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      setInfoMessage(res.message || `New verification code sent to ${email.trim()}`);
      if (forReset) {
        setStep('reset_verify');
      } else {
        setStep('otp');
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = cleaned[cleaned.length - 1];
    setOtp(newOtp);
    if (index < 5 && cleaned.length > 0) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((digit) => digit !== '') && step === 'otp') {
      verifyCode(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (pasted.length === 6 && step === 'otp') {
        verifyCode(pasted);
      }
    }
  };

  const verifyCode = async (codeToVerify) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      setAuthError('Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.verifyOtp(email.trim(), code);
      if (res?.session_token) {
        localStorage.setItem('aar_session_token', res.session_token);
        const needsSetup = res.is_new_user || res.needs_onboarding || !res.user?.onboarded;
        if (needsSetup) {
          setPassword('');
          setConfirmPassword('');
          setStep('details');
          setInfoMessage('Email verified! Set your name and password to finish.');
        } else {
          await loginWithToken(res.session_token);
          closeAuthModal();
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password with OTP
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setAuthError('Please enter the 6-digit verification code.');
      return;
    }
    if (password.length < 8) {
      setAuthError('New password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.resetPasswordWithOtp({
        email: email.trim(),
        otp_code: code,
        new_password: password,
      });
      if (res?.session_token) {
        localStorage.setItem('aar_session_token', res.session_token);
        await loginWithToken(res.session_token);
        closeAuthModal();
        window.location.href = '/dashboard';
      } else {
        setInfoMessage('Password reset successfully! Please sign in.');
        setPassword('');
        setStep('password');
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '', percent: 0, criteria: {} };
    const criteria = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    let score = 0;
    if (criteria.length) score += 1;
    if (pwd.length >= 12) score += 1;
    if (criteria.upper && criteria.lower) score += 1;
    if (criteria.number) score += 1;
    if (criteria.special) score += 1;
    const capped = Math.min(4, Math.max(0, score));
    if (pwd.length < 8) {
      return { score: Math.min(1, capped), label: 'Too Short (Min 8 Chars)', color: 'bg-red-500', textColor: 'text-red-500', percent: 20, criteria };
    }
    if (capped <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500', percent: 25, criteria };
    if (capped === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500', percent: 50, criteria };
    if (capped === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-500', percent: 75, criteria };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500', percent: 100, criteria };
  };

  const pwdStrength = getPasswordStrength(password);
  const isPasswordMatch = password && confirmPassword && password === confirmPassword;

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (pwdStrength.score < 2) {
      setAuthError('Please choose a stronger password containing numbers or symbols.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      await authApi.completeRegistration({
        full_name: fullName.trim(),
        password: password,
        company_name: companyName.trim() || undefined,
      });
      const token = localStorage.getItem('aar_session_token');
      if (token) {
        await loginWithToken(token);
      }
      closeAuthModal();
      window.location.href = '/dashboard';
    } catch (err) {
      setAuthError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div onClick={closeAuthModal} className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF8F2] dark:bg-[#FDF8F2] border border-brand-500/20 shadow-sm flex items-center justify-center mb-3 overflow-hidden">
            <img src="/assets/img/logo.png" alt="AAR" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
            {step === 'email' && 'Sign In or Create Account'}
            {step === 'password' && 'Welcome Back'}
            {step === 'otp' && 'Verify Your Email'}
            {step === 'reset_verify' && 'Reset Your Password'}
            {step === 'details' && 'Complete Your Account'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
            {step === 'email' && 'Enter your email to sign in to your account or create a new developer account.'}
            {step === 'password' && `Enter the password for ${email}`}
            {(step === 'otp' || step === 'reset_verify') && `We sent a 6-digit verification code to ${email}`}
            {step === 'details' && `Setting up developer account for ${email}`}
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{authError}</span>
          </div>
        )}
        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}
        {suggestedEmail && step === 'email' && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold">Possible typo detected in email domain</p>
                <p className="text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                  Did you mean <span className="font-mono font-bold underline">{suggestedEmail}</span>?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setEmail(suggestedEmail);
                  setSuggestedEmail(null);
                  proceedWithEmail(suggestedEmail, true);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] transition-colors shadow-sm"
              >
                Use {suggestedEmail}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  const current = email;
                  setSuggestedEmail(null);
                  proceedWithEmail(current, true);
                }}
                className="px-3 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium text-[11px] transition-colors"
              >
                Continue with {email.trim()} anyway
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: UNIFIED EMAIL ENTRY */}
        {step === 'email' && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleAuth}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium text-xs flex items-center justify-center gap-2.5 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
              <span className="flex-shrink mx-3 text-[11px] font-mono uppercase text-zinc-400">or continue with email</span>
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
            </div>

            <form onSubmit={handleEmailContinue} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (suggestedEmail) setSuggestedEmail(null);
                    }}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2A: PASSWORD LOGIN (IF REGISTERED) */}
        {step === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => { setStep('email'); setPassword(''); setAuthError(null); setInfoMessage(''); }}
                className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-3.5 h-3.5" /></>}
            </button>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
              <button
                type="button"
                disabled={loading}
                onClick={handleForgotPassword}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium disabled:opacity-50"
              >
                Forgot password? Send recovery OTP
              </button>
            </div>
          </form>
        )}

        {/* STEP 2B: OTP VERIFICATION (IF NEW / UNREGISTERED) */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-12 text-center font-mono font-bold text-lg rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              ))}
            </div>
            <button
              onClick={() => verifyCode()}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Continue</span>}
            </button>
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setAuthError(null); setInfoMessage(''); }}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 underline"
              >
                Change email
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleResendOtp(false)}
                className="text-brand-600 dark:text-brand-400 font-medium disabled:opacity-40"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2C: FORGOT PASSWORD OTP + NEW PASSWORD */}
        {step === 'reset_verify' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 text-center">6-Digit Recovery Code</label>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-10 h-11 text-center font-mono font-bold text-base rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reset Password & Sign In</span>}
            </button>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => { setStep('password'); setOtp(['', '', '', '', '', '']); setPassword(''); setConfirmPassword(''); setAuthError(null); setInfoMessage(''); }}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back to sign in
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleResendOtp(true)}
                className="text-brand-600 dark:text-brand-400 font-medium disabled:opacity-40"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW ACCOUNT DETAILS (AFTER OTP VERIFICATION) */}
        {step === 'details' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Set Account Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars (letters, numbers & symbols)"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Password strength:</span>
                    <span className={`font-semibold ${pwdStrength.textColor}`}>{pwdStrength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} style={{ width: `${pwdStrength.percent}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 ${
                    confirmPassword
                      ? isPasswordMatch
                        ? 'border-emerald-500 focus:ring-emerald-500'
                        : 'border-red-500 focus:ring-red-500'
                      : 'border-zinc-200 dark:border-zinc-700 focus:ring-brand-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Company / Project Name <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Akashic Tracker"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !isPasswordMatch || pwdStrength.score < 2}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Complete Setup & Enter Console</span><ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
