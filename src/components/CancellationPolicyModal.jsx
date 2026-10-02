import React from 'react';
import { ShieldCheck, AlertCircle, X, CheckCircle, FileText, IndianRupee } from 'lucide-react';

export const CancellationPolicyModal = ({ isOpen, onClose, role = 'driver', depositAmount = 250, onConfirm = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Cancellation & Refund Policy</h3>
            <p className="text-xs text-slate-500">Protecting both car owners and co-travellers fairly</p>
          </div>
        </div>

        {/* Deposit highlight box */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Refundable Cancellation Deposit
            </span>
            <span className="text-lg font-black text-emerald-700">₹{depositAmount}</span>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            The ₹{depositAmount} deposit is placed in platform escrow when the ride is published. <strong>It is 100% refunded to the car owner once the ride is completed.</strong>
          </p>
        </div>

        {/* Driver specific clause */}
        <div className="space-y-4 mb-6 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
            <div className="font-semibold flex items-center gap-1.5 mb-1 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Car Owner / Driver Commitment:</span>
            </div>
            <p>
              "Sudden cancellation without an accepted valid reason may result in loss of the refundable cancellation deposit."
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
            <div className="font-semibold flex items-center gap-1.5 mb-1 text-blue-900">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Passenger Protection Commitment:</span>
            </div>
            <p>
              "If the driver unexpectedly cancels the ride, eligible passenger payments/refunds will be processed immediately according to the cancellation policy."
            </p>
          </div>

          <h4 className="font-bold text-slate-900 text-sm pt-2">Accepted Valid Reasons for Deposit Refund:</h4>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Vehicle Breakdown / Problem:</strong> Unforeseen mechanical trouble or puncture before trip. (Garage bill / mechanic receipt can be submitted to Admin).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Medical / Personal Emergency:</strong> Immediate family health issue or emergency documented with Admin.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Severe Weather / Road Closure:</strong> Official highway advisory or landslide blockage.</span>
            </li>
          </ul>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
            Note: If a driver cancels arbitrarily without a valid reason, the deposit is forfeited and distributed as inconvenience credit to the affected co-travellers.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              I Understand & Agree
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
