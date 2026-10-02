import React, { useState } from 'react';
import { Car, ShieldCheck, ArrowRight, UserPlus, LogIn, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DriverAuth = () => {
  const { drivers, loginDriver, switchRole, triggerToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [email, setEmail] = useState('rajesh.driver@ridesharex.org');
  const [password, setPassword] = useState('driver123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      triggerToast('Account Created', 'Driver account registered! Please complete vehicle verification.', 'success');
      loginDriver('drv-4'); // Sameer Kulkarni (unverified)
    } else {
      // Find matching driver or default to drv-1
      const found = drivers.find((d) => d.email.toLowerCase() === email.toLowerCase());
      if (found) {
        loginDriver(found.id);
      } else {
        loginDriver('drv-1');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-md">
          <Car className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          Car Owner / Driver Portal
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isSignUp ? 'Register as Car Owner' : 'Driver / Car Owner Login'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Share your planned journeys, recover fuel and toll expenses, and travel with verified co-passengers.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Toggle Login / Sign Up */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2.5 rounded-xl transition ${
              !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Driver Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2.5 rounded-xl transition ${
              isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            New Driver Registration
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Latur / Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="driver@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {isSignUp ? 'Register & Continue to Verification' : 'Sign In to Driver Dashboard'}
          </button>
        </form>

        {/* 1-Click Quick Login Demo Switcher */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            1-Click Demo Profiles (Test Verified & Unverified States):
          </div>

          <div className="space-y-2">
            <button
              onClick={() => loginDriver('drv-1')}
              className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-left flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-900">Rajesh Sharma</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded font-bold">
                  ✓ Verified (Honda City)
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            <button
              onClick={() => loginDriver('drv-3')}
              className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-bold text-slate-900">Vikram Patil</span>
                <span className="text-[10px] text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded font-bold">
                  ⏳ Verification Pending
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
            </button>

            <button
              onClick={() => loginDriver('drv-4')}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="font-bold text-slate-900">Sameer Kulkarni</span>
                <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-bold">
                  ✕ Not Verified
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
