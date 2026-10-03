import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { LandingPage } from './pages/LandingPage';
import { DriverAuth } from './pages/DriverAuth';
import { DriverDashboard } from './pages/DriverDashboard';
import { PassengerAuth } from './pages/PassengerAuth';
import { PassengerDashboard } from './pages/PassengerDashboard';
import { AdminAuth } from './pages/AdminAuth';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfileView } from './pages/ProfileView';
import { SearchRidesPage } from './pages/SearchRidesPage';
import { LiveTrackingMap } from './components/LiveTrackingMap';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { validateAdminToken } from './services/adminAuthService';
import {
  Car,
  User,
  ShieldCheck,
  Scale,
  HeartHandshake,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function AppContent() {
  const {
    currentRole,
    activeTab,
    setActiveTab,
    switchRole,
    currentUser,
    activeToast,
    triggerToast,
    rides,
    selectedRideId
  } = useApp();

  const activeTrackingRide =
    rides.find((r) => r.id === selectedRideId) ||
    rides.find((r) => r.status === 'in_progress') ||
    rides[0];

  // Instantly scroll to top when changing views
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // URL routing & security listener: Intercept manual unauthorized URL entries
  React.useEffect(() => {
    const handleUrlNavigation = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isAdminRoute =
        hash.includes('admin') ||
        search.includes('admin') ||
        hash === '#admin_dashboard' ||
        search.includes('tab=admin');

      if (isAdminRoute) {
        const validation = validateAdminToken();
        if (!validation.authorized || currentRole !== 'admin') {
          triggerToast(
            'Access Denied (403 Forbidden)',
            'Admin Panel is strictly restricted to the designated administrator account (prasadmhankraj21@gmail.com).',
            'error'
          );
          window.history.replaceState(null, '', window.location.pathname);
          setActiveTab('admin_auth');
        } else {
          setActiveTab('admin_dashboard');
        }
      }
    };

    handleUrlNavigation();
    window.addEventListener('hashchange', handleUrlNavigation);
    return () => window.removeEventListener('hashchange', handleUrlNavigation);
  }, [currentRole]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Container */}
      <NotificationToast
        toast={activeToast}
        onClose={() => triggerToast(null, null)}
      />

      {/* Global Navigation Header */}
      <Navbar />

      {/* Main Content Area based on Active Role & Tab */}
      <main className="flex-1">
        {/* Guest Public Views */}
        {activeTab === 'home' && <LandingPage />}
        {activeTab === 'how_it_works' && <LandingPage />}

        {/* Authentication Pages */}
        {activeTab === 'driver_auth' && <DriverAuth />}
        {activeTab === 'passenger_auth' && <PassengerAuth />}
        {activeTab === 'admin_auth' && <AdminAuth />}

        {/* Driver Area */}
        {(activeTab === 'driver_dashboard' ||
          activeTab === 'create_ride' ||
          activeTab === 'driver_rides' ||
          activeTab === 'driver_requests') && <DriverDashboard />}

        {/* Passenger Area */}
        {(activeTab === 'passenger_dashboard' ||
          activeTab === 'my_bookings') && <PassengerDashboard />}

        {/* Dedicated Search Rides View */}
        {activeTab === 'search_rides' && <SearchRidesPage />}

        {/* Admin Area (Strictly Protected Route: Requires cryptographically verified admin token) */}
        {(activeTab === 'admin_dashboard' ||
          activeTab === 'admin_verifications' ||
          activeTab === 'admin_users' ||
          activeTab === 'admin_rides' ||
          activeTab === 'admin_cancellations') && (
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        )}

        {/* Standalone Active Ride Live GPS Screen */}
        {activeTab === 'active_ride' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  Live GPS Ride Telemetry
                </h1>
                <p className="text-xs text-slate-500">
                  Shared intercity journey: {activeTrackingRide?.from} → {activeTrackingRide?.to}
                </p>
              </div>

              <button
                onClick={() => {
                  if (currentRole === 'driver') setActiveTab('driver_dashboard');
                  else if (currentRole === 'passenger') setActiveTab('passenger_dashboard');
                  else setActiveTab('home');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ← Return to Dashboard
              </button>
            </div>

            <LiveTrackingMap ride={activeTrackingRide} isDriverView={currentRole === 'driver'} />
          </div>
        )}

        {/* Profile View */}
        {activeTab === 'profile' && <ProfileView />}

        {/* Fallback to Home if activeTab is unknown */}
        {![
          'home',
          'how_it_works',
          'driver_auth',
          'passenger_auth',
          'admin_auth',
          'driver_dashboard',
          'create_ride',
          'driver_rides',
          'driver_requests',
          'passenger_dashboard',
          'my_bookings',
          'search_rides',
          'admin_dashboard',
          'admin_verifications',
          'admin_users',
          'admin_rides',
          'admin_cancellations',
          'active_ride',
          'profile'
        ].includes(activeTab) && <LandingPage />}
      </main>

      {/* Trust & Safety Platform Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-16 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Car className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-slate-900">
                  Rideshare<span className="text-emerald-600">_X</span>
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                A genuine peer-to-peer cost-sharing carpooling platform. Car owners sharing planned journeys to split fuel and highway toll expenses fairly.
              </p>
            </div>

            {/* Platform Areas */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Platform Access</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => switchRole('driver')} className="hover:text-emerald-700">
                    Driver / Car Owner Area
                  </button>
                </li>
                <li>
                  <button onClick={() => switchRole('passenger')} className="hover:text-emerald-700">
                    Passenger Search & Book
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('admin_auth')} className="hover:text-emerald-700">
                    Admin Portal (Staff Only)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('active_ride')} className="hover:text-emerald-700">
                    Live GPS Telemetry
                  </button>
                </li>
              </ul>
            </div>

            {/* Core Trust & Rules */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Cost-Sharing Rules</h5>
              <ul className="space-y-1.5 text-[11px] text-slate-500">
                <li>• No commercial taxi operations</li>
                <li>• Fuel & toll recovery only</li>
                <li>• Mandatory driver license verification</li>
                <li>• Refundable cancellation escrow</li>
              </ul>
            </div>

            {/* Emergency & Helpline */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Safety & Helpline</h5>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                  National Helpline: 112
                </div>
                <p className="text-slate-500">
                  24x7 Safety desk monitors active intercity route telemetry.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © 2026 Rideshare_X Platform. Pure Peer-to-Peer Cost Sharing. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Cancellation Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
}
