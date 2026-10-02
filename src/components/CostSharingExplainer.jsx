import React from 'react';
import { Fuel, ShieldCheck, Scale, AlertCircle, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const CostSharingExplainer = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-900">
        <Scale className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold text-emerald-900">Pure Cost-Sharing Principle: </span>
          Rideshare_X drivers are everyday commuters sharing their personal journeys. The contribution covers exact fuel & toll expenses—no commercial profits or surge pricing.
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 my-8 shadow-xl border border-slate-700/60 overflow-hidden relative">
      {/* Background glow accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <HeartHandshake className="w-4 h-4" />
          The Cost-Sharing Philosophy
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Not a Taxi. A Genuine Shared Journey.
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mb-8 leading-relaxed">
          Rideshare_X is designed exclusively for car owners already traveling along a route who want to share empty seats with co-travellers heading in the same direction. It is <strong className="text-emerald-300 font-semibold">100% peer-to-peer travel cost recovery</strong>, eliminating empty seats, cutting road carbon emissions, and reducing travel costs for everyone.
        </p>

        {/* Comparison grid: Commercial Taxi vs Peer-to-Peer Cost Sharing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Commercial Taxi Box */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/70">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                Commercial Taxi / Cabs
              </span>
              <span className="text-xs text-slate-400">High Profit Model</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Driver drives for commercial profit and full-time fare income.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Surge pricing during rain, rush hour, and holiday peaks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>High costs: Latur → Pune often costs ₹1,800 – ₹2,500+.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Commercial permits and aggregator commissions inflate fares.</span>
              </li>
            </ul>
          </div>

          {/* Rideshare_X Cost Sharing Box */}
          <div className="bg-emerald-950/60 rounded-2xl p-6 border border-emerald-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-lg">
              Rideshare_X Model
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/30">
                Peer-to-Peer Cost Sharing
              </span>
              <span className="text-xs text-emerald-300 font-medium">Fair & Transparent</span>
            </div>
            <ul className="space-y-3 text-sm text-emerald-100">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Car owner is already traveling for their personal work/visit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Fair shared cost: Only splits actual fuel consumption and highway tolls.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Affordable: Latur → Pune is just <strong>₹300 per seat</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Driver provides a <strong>refundable cancellation deposit</strong> to protect passengers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Cost Breakdown Visual formula */}
        <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Transparent Cost Formula</div>
              <div className="text-xs text-slate-300">
                Total Travel Cost = (Estimated Fuel Consumed + Highway FASTag Tolls) ÷ Occupied Seats
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            Zero Commercial Markups
          </div>
        </div>
      </div>
    </section>
  );
};
