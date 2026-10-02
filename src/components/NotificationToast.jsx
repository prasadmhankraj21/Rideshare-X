import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white/95 shadow-emerald-100',
    warning: 'border-amber-200 bg-white/95 shadow-amber-100',
    error: 'border-rose-200 bg-white/95 shadow-rose-100',
    info: 'border-blue-200 bg-white/95 shadow-blue-100'
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 ${
          borders[toast.type || 'info']
        }`}
      >
        {icons[toast.type || 'info']}
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg hover:bg-slate-100"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
