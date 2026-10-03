import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, UserPlus, LogIn, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PassengerAuth = () => {
  const { passengers, loginPassenger, registerPassenger, loginPassengerWithCredentials, triggerToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim() || !phone.trim()) {
          setAuthError('Please fill in your name and phone number.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setAuthError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const res = await registerPassenger({ email, password, name, phone });
        if (!res.success) {
          setAuthError(res.error || 'Failed to create passenger account.');
        }
      } else {
        const res = await loginPassengerWithCredentials(email, password);
        if (!res.success) {
          setAuthError(res.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (signUp) => {
    setIsSignUp(signUp);
    setAuthError('');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-3 shadow-md">
          <User className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          Co-Traveller / Passenger Portal
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isSignUp ? 'Create Passenger Account' : 'Passenger Sign In'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Find verified cost-sharing rides, book available seats, and enjoy transparent travel.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={`flex-1 py-2.5 rounded-xl transition ${
              !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Passenger Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={`flex-1 py-2.5 rounded-xl transition ${
              isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            New Passenger Sign Up
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Mehta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98112 33445"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="passenger@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading
              ? 'Authenticating...'
              : isSignUp
              ? 'Create Account & Browse Rides'
              : 'Sign In to Passenger Dashboard'}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            1-Click Demo Profiles:
          </div>

          <div className="space-y-2">
            <button
              onClick={() => loginPassenger('psg-1')}
              className="w-full p-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100 text-left flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="font-bold text-slate-900">Priya Mehta</span>
                <span className="text-[10px] text-teal-800 bg-teal-200 px-1.5 py-0.5 rounded font-bold">
                  Active Booking (Latur → Pune)
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
            </button>

            <button
              onClick={() => loginPassenger('psg-2')}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="font-bold text-slate-900">Rohan Verma</span>
                <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-bold">
                  On-board Active Ride (Pune → Mumbai)
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
