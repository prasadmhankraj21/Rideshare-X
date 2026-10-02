import React, { useState } from 'react';
import {
  Car,
  User,
  ShieldCheck,
  Search,
  Scale,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Navigation,
  Fuel,
  Users,
  AlertOctagon,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CostSharingExplainer } from '../components/CostSharingExplainer';

export const LandingPage = () => {
  const { switchRole, setActiveTab, rides, setSelectedRideId } = useApp();

  const [searchFrom, setSearchFrom] = useState('Latur');
  const [searchTo, setSearchTo] = useState('Pune');
  const [searchDate, setSearchDate] = useState('2026-10-05');
  const [searchSeats, setSearchSeats] = useState(1);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    switchRole('passenger');
    setActiveTab('search_rides');
  };

  // Preview scheduled rides
  const previewRides = rides.filter((r) => r.status === 'scheduled' || r.status === 'in_progress').slice(0, 3);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            100% Non-Commercial Peer-to-Peer Cost Sharing
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Share Your Journey.{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Reduce Your Travel Cost.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with verified everyday car owners traveling your way. Share empty seats, split actual fuel & highway toll expenses, and travel comfortably without taxi markups.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                switchRole('driver');
                setActiveTab('driver_auth');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition text-sm sm:text-base"
            >
              <Car className="w-5 h-5" />
              Continue as Driver / Car Owner
            </button>

            <button
              onClick={() => {
                switchRole('passenger');
                setActiveTab('passenger_auth');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2.5 transition text-sm sm:text-base"
            >
              <User className="w-5 h-5 text-emerald-400" />
              Continue as Passenger
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Car Owners
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Refundable Cancellation Escrow
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live GPS Route Tracking
            </span>
          </div>
        </div>

        {/* Quick Search Ride Widget */}
        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-4 sm:p-6 relative z-10">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            Find an Affordable Shared Ride
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  placeholder="Starting city"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Destination</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  placeholder="Destination city"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Travel Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                Search Rides
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Philosophy & Cost-Sharing Model Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CostSharingExplainer />
      </div>

      {/* Featured Available Rides Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Upcoming Cost-Sharing Rides</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Verified car owners traveling along intercity routes
            </p>
          </div>
          <button
            onClick={() => {
              switchRole('passenger');
              setActiveTab('search_rides');
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
          >
            Browse All Available Rides <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewRides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header: Driver Info & Verification Badge */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={ride.driverAvatar}
                      alt={ride.driverName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-slate-900">{ride.driverName}</span>
                        {ride.driverVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Driver" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">★ {ride.driverRating} rating</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {ride.vehicleType}
                  </span>
                </div>

                {/* Route Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>{ride.from}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>{ride.to}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {ride.departureTime}
                    </span>
                    <span>ETA: {ride.estimatedArrivalTime}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                    Pickup: {ride.pickupDropPoints[0]?.point || ride.from}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Shared Fuel/Toll
                  </span>
                  <div className="text-lg font-black text-emerald-700">
                    ₹{ride.sharedCostPerSeat}{' '}
                    <span className="text-xs font-normal text-slate-500">/ seat</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {ride.availableSeats} seats remaining
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedRideId(ride.id);
                    switchRole('passenger');
                    setActiveTab('search_rides');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  View & Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            Simplicity & Trust
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">How Rideshare_X Works</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Built from the ground up for safe, transparent cost sharing between everyday car owners and passengers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Car Owners / Drivers */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">For Drivers / Car Owners</h4>
                <p className="text-xs text-slate-500">Already driving somewhere? Cover your travel expenses.</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900">Get Verified:</strong> Submit your vehicle registration number, driving license, and sample ID for Admin verification.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900">Publish Your Trip:</strong> Enter your route, departure time, available seats, and reasonable cost-sharing amount.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-900">Refundable Cancellation Escrow:</strong> Place a ₹250 refundable deposit demonstrating your reliability to co-travellers.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-slate-900">Review & Accept:</strong> Accept or reject booking requests based on requested seats and pickup points.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                <div>
                  <strong className="text-slate-900">Start & Complete:</strong> Live GPS tracking activates when you start. Upon reaching destination, end trip and your cancellation deposit is refunded!
                </div>
              </li>
            </ol>
          </div>

          {/* For Passengers */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">For Passengers</h4>
                <p className="text-xs text-slate-500">Travel comfortably at a fraction of commercial taxi fares.</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900">Search Your Route:</strong> Enter origin, destination, and preferred travel date to view verified rides.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900">Select Available Seats:</strong> Choose the number of seats needed (e.g. 1 or 2 seats) up to the driver's limit.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-900">Send Booking Request:</strong> Driver receives your request with your pickup point and accepts.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-slate-900">Live GPS & Safety:</strong> Follow vehicle position in real-time once the ride starts with emergency SOS access.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                  5
                </span>
                <div>
                  <strong className="text-slate-900">Arrive & Rate:</strong> Pay the fair cost-sharing contribution and leave a rating for your co-traveller.
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Safety & Live Tracking Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" />
              Safety & Security First
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-3">
              Built with Real-Time Safety & Verification
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Every driver is vetted with mandatory Driving License & Vehicle RC registration checks. During journeys, our automated safety engine provides live GPS telemetry, route monitoring, and instantaneous SOS assistance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
                <div className="text-base font-bold text-white">Live Tracking</div>
                <p className="text-xs text-slate-400">
                  GPS location sharing active only during confirmed trips. Automatically terminates at destination.
                </p>
              </div>

              <div className="border-l-2 border-teal-500 pl-4 space-y-1">
                <div className="text-base font-bold text-white">Route Monitoring</div>
                <p className="text-xs text-slate-400">
                  Detects unexpected detours and alerts co-travellers with gentle, neutral safety check-ins.
                </p>
              </div>

              <div className="border-l-2 border-rose-500 pl-4 space-y-1">
                <div className="text-base font-bold text-white">Emergency SOS</div>
                <p className="text-xs text-slate-400">
                  One-tap broadcast to 112 Emergency Services and family members with live coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
