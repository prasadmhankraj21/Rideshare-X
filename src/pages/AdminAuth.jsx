import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, Mail, AlertTriangle, ArrowLeft, KeyRound, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminAuth = ({ restrictedNotice = false }) => {
  const { loginAdmin, claimFirstAdmin, adminConfig, setActiveTab } = useApp();
  const isFirstTimeSetup = !adminConfig?.isClaimed;

  const [email, setEmail] = useState(isFirstTimeSetup ? 'admin@ridesharex.org' : '');
  const [password, setPassword] = useState(isFirstTimeSetup ? 'admin123' : '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (isFirstTimeSetup) {
      const result = claimFirstAdmin(email, password);
      if (!result?.success) {
        setErrorMessage(result?.error || 'Registration failed. Please try again.');
      }
    } else {
      const result = loginAdmin(email, password);
      if (!result?.success) {
        setErrorMessage(
          'Access Denied: Only the 1st registered platform administrator can log in. Other visitors are restricted.'
        );
      }
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
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Restricted Security Area</span>
            You attempted to access the Administration Panel. This section is strictly restricted to the registered platform administrator. Please enter your credentials to authenticate.
          </div>
        </div>
      )}

      {/* Portal Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-md">
          {isFirstTimeSetup ? <KeyRound className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          {isFirstTimeSetup ? '★ 1st-User Registration' : '🔒 Master Locked'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isFirstTimeSetup ? 'Claim Admin Access' : 'Administrator Login'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isFirstTimeSetup
            ? 'You are the 1st person here! Enter your email and master password to claim and lock administrative control to your account.'
            : 'Exclusive platform control. Only the 1st registered Platform Owner can authenticate.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        {/* State Notice Banner */}
        {isFirstTimeSetup ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">First-Time Platform Owner Setup:</strong>
              The 1st person who logs in here becomes the sole registered administrator. All future visitors will be blocked from logging into this panel.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Protected Admin Account: </strong>
              Locked exclusively to the 1st registered Platform Owner ({adminConfig.email || 'Owner'}).
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Administrator Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="admin@ridesharex.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Master Admin Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="Enter master password"
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
            {isFirstTimeSetup ? (
              <>
                <UserCheck className="w-4 h-4" />
                Claim & Lock Master Admin Access to Me
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Authenticate & Open Admin Panel
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Strict Platform Governance • 1st Person Exclusive Access
          </p>
        </div>
      </div>
    </div>
  );
};
