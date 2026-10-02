import React, { useState } from 'react';
import {
  Car,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  ChevronDown,
  RotateCcw,
  Sparkles,
  MapPin,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const {
    currentRole,
    currentUser,
    switchRole,
    logout,
    activeTab,
    setActiveTab,
    notifications,
    setNotifications,
    resetDemoData,
    drivers,
    passengers
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter unread notifications for current user/role
  const userNotifs = notifications.filter(
    (n) => n.targetUserId === currentUser?.id || n.role === currentRole
  );
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.targetUserId === currentUser?.id || n.role === currentRole ? { ...n, read: true } : n
      )
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Cost-Sharing Disclaimer Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              <strong className="text-white">Peer-to-Peer Carpooling:</strong> Car owners sharing personal journeys to recover fuel & toll costs. Not a commercial taxi service.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={resetDemoData}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition text-[10px]"
              title="Reset sample data, rides, and verifications"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => {
            if (currentRole === 'driver') setActiveTab('driver_dashboard');
            else if (currentRole === 'passenger') setActiveTab('passenger_dashboard');
            else if (currentRole === 'admin') setActiveTab('admin_dashboard');
            else setActiveTab('home');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">
                Rideshare<span className="text-emerald-600">_X</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Cost-Sharing
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-none">Share Journey • Split Cost</p>
          </div>
        </div>

        {/* Global Perspective Switcher (Driver / Passenger / Admin / Guest) */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => switchRole('guest')}
            className={`px-3 py-1.5 rounded-xl transition ${
              currentRole === 'guest'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public Home
          </button>
          <button
            onClick={() => switchRole('driver')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              currentRole === 'driver'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Driver Area
          </button>
          <button
            onClick={() => switchRole('passenger')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              currentRole === 'passenger'
                ? 'bg-teal-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Passenger Area
          </button>
          <button
            onClick={() => switchRole('admin')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              currentRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Panel
          </button>
        </div>

        {/* Navigation Links based on role */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
          {currentRole === 'guest' && (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'home' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900'}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('search_rides')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'search_rides' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900'}`}
              >
                Find a Ride
              </button>
              <button
                onClick={() => setActiveTab('how_it_works')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'how_it_works' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900'}`}
              >
                How It Works
              </button>
              <button
                onClick={() => setActiveTab('driver_auth')}
                className="px-3.5 py-2 text-emerald-700 font-bold hover:bg-emerald-50 rounded-xl transition"
              >
                Driver Login
              </button>
              <button
                onClick={() => setActiveTab('passenger_auth')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition"
              >
                Passenger Login
              </button>
            </>
          )}

          {currentRole === 'driver' && (
            <>
              <button
                onClick={() => setActiveTab('driver_dashboard')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'driver_dashboard' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('create_ride')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'create_ride' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900'}`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                Create Ride
              </button>
              <button
                onClick={() => setActiveTab('driver_rides')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'driver_rides' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900'}`}
              >
                My Rides
              </button>
              <button
                onClick={() => setActiveTab('driver_requests')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'driver_requests' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Booking Requests
              </button>
              <button
                onClick={() => setActiveTab('active_ride')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1 transition ${activeTab === 'active_ride' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900'}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active Ride
              </button>
            </>
          )}

          {currentRole === 'passenger' && (
            <>
              <button
                onClick={() => setActiveTab('passenger_dashboard')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'passenger_dashboard' ? 'text-teal-700 bg-teal-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('search_rides')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${activeTab === 'search_rides' ? 'text-teal-700 bg-teal-50 font-bold' : 'hover:text-slate-900'}`}
              >
                <Search className="w-3.5 h-3.5" />
                Search Rides
              </button>
              <button
                onClick={() => setActiveTab('my_bookings')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'my_bookings' ? 'text-teal-700 bg-teal-50 font-bold' : 'hover:text-slate-900'}`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab('active_ride')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1 transition ${activeTab === 'active_ride' ? 'text-teal-700 bg-teal-50 font-bold' : 'hover:text-slate-900'}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active Ride
              </button>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'admin_dashboard' ? 'text-indigo-700 bg-indigo-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('admin_verifications')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'admin_verifications' ? 'text-indigo-700 bg-indigo-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Verifications
              </button>
              <button
                onClick={() => setActiveTab('admin_users')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'admin_users' ? 'text-indigo-700 bg-indigo-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('admin_rides')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'admin_rides' ? 'text-indigo-700 bg-indigo-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Rides
              </button>
              <button
                onClick={() => setActiveTab('admin_cancellations')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'admin_cancellations' ? 'text-indigo-700 bg-indigo-50 font-bold' : 'hover:text-slate-900'}`}
              >
                Cancellations
              </button>
            </>
          )}
        </nav>

        {/* Right side items: Notifications, Profile, Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative transition"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {userNotifs.length > 0 ? (
                    userNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs transition ${
                          n.read
                            ? 'bg-slate-50 border-slate-100 text-slate-600'
                            : 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-xl object-cover border border-slate-300"
                />
                <span className="hidden sm:inline-block max-w-[120px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in duration-150">
                  <div className="p-2 border-b border-slate-100 mb-2">
                    <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {currentRole}
                      </span>
                      {currentRole === 'driver' && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            currentUser.verificationStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : currentUser.verificationStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {currentUser.verificationStatus === 'verified'
                            ? 'Verified Car Owner'
                            : currentUser.verificationStatus === 'pending'
                            ? 'Verification Pending'
                            : 'Not Verified'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      View Profile
                    </button>

                    {/* Switch Driver quick select */}
                    {currentRole === 'driver' && (
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
                          Switch Driver Account:
                        </div>
                        {drivers.map((drv) => (
                          <button
                            key={drv.id}
                            onClick={() => {
                              switchRole('driver', drv.id);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                              drv.id === currentUser.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{drv.name}</span>
                            <span className="text-[10px] capitalize opacity-70">
                              {drv.verificationStatus === 'verified' ? '✓ Verified' : drv.verificationStatus}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('driver_auth')}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
              >
                Driver Area
              </button>
              <button
                onClick={() => setActiveTab('passenger_auth')}
                className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pb-3 border-b border-slate-100">
            <button
              onClick={() => {
                switchRole('guest');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-xl bg-slate-100 text-slate-800 text-center"
            >
              Public Home
            </button>
            <button
              onClick={() => {
                switchRole('driver');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800 text-center font-bold"
            >
              Driver Area
            </button>
            <button
              onClick={() => {
                switchRole('passenger');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-xl bg-teal-100 text-teal-800 text-center font-bold"
            >
              Passenger Area
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-xl bg-indigo-100 text-indigo-800 text-center font-bold"
            >
              Admin Panel
            </button>
          </div>

          <div className="space-y-1 text-sm font-semibold text-slate-700">
            {currentRole === 'driver' && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('driver_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('create_ride');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Create Ride
                </button>
                <button
                  onClick={() => {
                    setActiveTab('driver_rides');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  My Rides
                </button>
                <button
                  onClick={() => {
                    setActiveTab('driver_requests');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Booking Requests
                </button>
                <button
                  onClick={() => {
                    setActiveTab('active_ride');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Active Ride
                </button>
              </>
            )}

            {currentRole === 'passenger' && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('passenger_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('search_rides');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Search Rides
                </button>
                <button
                  onClick={() => {
                    setActiveTab('my_bookings');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => {
                    setActiveTab('active_ride');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Active Ride
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('admin_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setActiveTab('admin_verifications');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Driver Verifications
                </button>
                <button
                  onClick={() => {
                    setActiveTab('admin_cancellations');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl hover:bg-slate-100"
                >
                  Review Cancellations
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
