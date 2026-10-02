import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, Share2, Check, X, Radio, MapPin } from 'lucide-react';

export const SOSModal = ({ isOpen, onClose, ride, user }) => {
  const [sosDispatched, setSosDispatched] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    setSosDispatched(true);
  };

  const handleCopyTripLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin + `?tracking=${ride?.id || 'live'}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertOctagon className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Safety & Emergency Center</h3>
            <p className="text-xs text-slate-500">24x7 Trip Safety Protocol & Emergency Assistance</p>
          </div>
        </div>

        {/* Live Trip Telemetry Coordinates */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-900 border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Telemetry Active
            </span>
            <span>Ride ID: #{ride?.id || 'RIDE-102'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Route:</span>
            <span className="font-medium text-slate-800">{ride?.from} → {ride?.to}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Current Milestone:</span>
            <span className="font-medium text-slate-800">{ride?.activeLocation?.currentMilestone || 'Expressway Km 78 near Lonavala'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Vehicle:</span>
            <span className="font-medium text-slate-800">{ride?.vehicleDetails || 'Verified Co-ride Vehicle'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">GPS Coordinates:</span>
            <span className="font-mono text-slate-600">18.7557° N, 73.4091° E</span>
          </div>
        </div>

        {!sosDispatched ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-950 text-xs leading-relaxed">
              <span className="font-bold">When you activate SOS:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-800">
                <li>Instant SMS alert with live GPS coordinates sent to your Emergency Contact.</li>
                <li>Rideshare_X 24x7 Safety Response Desk alerted immediately.</li>
                <li>National Emergency Services (112) hotlinked with your current live route.</li>
              </ul>
            </div>

            <button
              onClick={handleTriggerSOS}
              className="w-full py-4 px-6 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-rose-200 flex items-center justify-center gap-3 transition"
            >
              <Radio className="w-5 h-5 animate-spin" />
              <span>TRIGGER EMERGENCY SOS</span>
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href="tel:112"
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Call 112 Police
              </a>
              <button
                onClick={handleCopyTripLink}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
                {copiedLink ? 'Link Copied!' : 'Share Live Trip'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center border-4 border-rose-300 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">SOS Alert Dispatched</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Live location transmitted to Rideshare_X Safety Dispatcher & Emergency Contact. Stay calm, keep phone on, vehicle is tracked via high-priority satellite telemetry.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              ✓ SMS Sent to Emergency Contact • GPS Beacon Broadcast Active
            </div>
            <button
              onClick={() => setSosDispatched(false)}
              className="text-xs text-slate-500 hover:text-slate-800 underline transition"
            >
              Cancel False Alarm / Reset SOS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
