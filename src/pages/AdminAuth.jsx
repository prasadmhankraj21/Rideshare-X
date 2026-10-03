import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, Mail, AlertTriangle, ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROVISIONING_MASTER_KEY, hasAdminPasswordSet } from '../services/adminAuthService';

export const AdminAuth = ({ restrictedNotice = false }) => {
  const { loginAdmin, setupAdminPassword, setActiveTab } = useApp();

  // One-time master setup is ONLY accessible if secret provisioning key is present in the URL query
  const queryParams = new URLSearchParams(window.location.search);
  const hasSecretKey = queryParams.get('key') === PROVISIONING_MASTER_KEY;
  const isSetupRequested = hasSecretKey && !hasAdminPasswordSet();

  const [email, setEmail] = useState('prasadmhankraj21@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await loginAdmin(email, password);
    if (!result?.success) {
      setErrorMessage(
        result?.error || 'Access Denied: Only the designated administrator account (prasadmhankraj21@gmail.com) with the correct password is authorized.'
      );
    }
    setIsSubmitting(false);
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setIsSubmitting(false);
      return;
    }

    const result = await setupAdminPassword(email, password, confirmPassword);
    if (!result?.success) {
      setErrorMessage(result?.error || 'Password setup failed.');
    } else {
      // Clear setup key from URL
      window.history.replaceState(null, '', window.location.pathname);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      {/* Return back button */}
      <button
        type="button"
        onClick={() => setActiveTab('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Public Website
      </button>

      {/* Restricted Access Alert if redirected from unauthenticated admin link */}
      {restrictedNotice && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-in fade-in duration-200 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-950 text-sm mb-0.5">403 Forbidden — Access Denied</span>
            You attempted to access the protected Administration Panel without an authenticated session. Access is strictly restricted to the designated administrator (<span className="font-bold text-rose-950">prasadmhankraj21@gmail.com</span>). Drivers, passengers, and other visitors are forbidden.
          </div>
        </div>
      )}

      {/* Portal Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-md">
          {isSetupRequested ? <KeyRound className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          {isSetupRequested ? 'Master Provisioning' : '🔒 Designated Admin Only'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isSetupRequested ? 'Set Admin Password' : 'Administrator Login'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isSetupRequested
            ? 'One-time initial password provisioning for prasadmhankraj21@gmail.com.'
            : 'Enter your credentials to access the Administration Panel.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSetupRequested ? (
          /* One-time master setup (Only accessible via secret master key) */
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Create Strong Master Password * (Min 8 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Master Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter strong password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <KeyRound className="w-4 h-4" />
              {isSubmitting ? 'Provisioning...' : 'Save Password & Enter Admin Panel'}
            </button>
          </form>
        ) : (
          /* Public Admin Login Page — Contains ONLY: Email field, Password field, Login button */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prasadmhankraj21@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Authenticating...' : 'Log In to Admin Panel'}
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Backend Authorization Active • Single Designated Admin
          </p>
        </div>
      </div>
    </div>
  );
};
