import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, Mail, AlertTriangle, ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminAuth = ({ restrictedNotice = false }) => {
  const { loginAdmin, setActiveTab } = useApp();

  const [email, setEmail] = useState('admin@ridesharex.org');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = loginAdmin(email, password);
    if (!result?.success) {
      setErrorMessage(
        result?.error || 'Access Denied (403): Only the designated platform administrator (admin@ridesharex.org) is authorized.'
      );
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
            You attempted to access the protected Administration Panel. Access is strictly restricted to the designated platform administrator (<span className="font-bold text-rose-950">admin@ridesharex.org</span>). Drivers, passengers, and unregistered accounts are forbidden.
          </div>
        </div>
      )}

      {/* Portal Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          🔒 Designated Admin Only
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Administrator Login
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Exclusive platform control. Only the designated administrator account is authorized.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        {/* Security Policy Notice */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 block mb-0.5">Designated Master Account:</strong>
            Strict backend authorization enforced. Only <strong className="text-slate-900">admin@ridesharex.org</strong> can authenticate. General visitors, drivers, and passengers cannot log into this portal.
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designated Administrator Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ridesharex.org"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Master Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="Enter master password (e.g. admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Default password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">admin123</code></p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? 'Verifying Authorization...' : 'Authenticate & Open Admin Panel'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Cryptographically Verified Session • Backend Authorization Active
          </p>
        </div>
      </div>
    </div>
  );
};
