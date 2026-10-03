import React from 'react';
import { AlertTriangle, RotateCcw, Home, RefreshCw, Copy, Check } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ridesharex_active_tab_v1');
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.reload();
  };

  handleFullCleanReset = () => {
    try {
      localStorage.removeItem('ridesharex_active_tab_v1');
      localStorage.removeItem('ridesharex_current_role_v1');
      localStorage.removeItem('ridesharex_current_user_id_v1');
      localStorage.removeItem('ridesharex_rides_v1');
      localStorage.removeItem('ridesharex_bookings_v1');
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.reload();
  };

  handleCopyError = () => {
    if (this.state.error) {
      navigator.clipboard?.writeText?.(String(this.state.error?.stack || this.state.error?.message || this.state.error));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Application Glitch Recovered</h2>
              <p className="text-xs text-slate-500 mt-1">
                A rendering glitch occurred. Click below to refresh and return to the main page.
              </p>
            </div>

            {/* Error Message Details */}
            {this.state.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs text-rose-900 font-mono overflow-x-auto max-h-32">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-rose-200 text-[10px] text-rose-600 font-sans font-bold">
                  <span>ERROR DETAILS:</span>
                  <button
                    onClick={this.handleCopyError}
                    className="flex items-center gap-1 hover:text-rose-800"
                  >
                    {this.state.copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {this.state.copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="break-all">{this.state.error?.message || String(this.state.error)}</div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset & Return to Home
              </button>

              <button
                onClick={this.handleFullCleanReset}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear Local Cache & Fresh Start
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

