import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Clock,
  ArrowRight,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  FileText,
  Navigation,
  Car,
  X,
  ChevronRight,
  Filter,
  AlertOctagon,
  Sparkles,
  Minus,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiveTrackingMap } from '../components/LiveTrackingMap';
import { CancellationPolicyModal } from '../components/CancellationPolicyModal';
import { CostSharingExplainer } from '../components/CostSharingExplainer';
import { RideCoordinationModal } from '../components/RideCoordinationModal';

export const PassengerDashboard = () => {
  const {
    currentUser,
    rides,
    bookings,
    requestBooking,
    cancelPassengerBooking,
    selectedRideId,
    setSelectedRideId,
    triggerToast,
    refreshRides,
    refreshBookings
  } = useApp();

  const [activePassengerTab, setActivePassengerTab] = useState('browse'); // 'browse' | 'search' | 'my_bookings' | 'active_ride' | 'history'
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchSeatsCount, setSearchSeatsCount] = useState(1);
  const [onlyVerifiedDrivers, setOnlyVerifiedDrivers] = useState(false);

  // Connected Driver Ride Coordination & Pickup Hub Modal State
  const [coordinationModalOpen, setCoordinationModalOpen] = useState(false);
  const [selectedCoordinationBooking, setSelectedCoordinationBooking] = useState(null);

  const handleOpenCoordination = (bkg) => {
    setSelectedCoordinationBooking(bkg);
    setCoordinationModalOpen(true);
  };

  // Fetch latest real published rides & bookings on mount and whenever search parameters change
  React.useEffect(() => {
    if (refreshBookings) refreshBookings();
    if (refreshRides) {
      refreshRides({
        from: searchFrom,
        to: searchTo,
        date: searchDate,
        onlyVerified: onlyVerifiedDrivers
      });
    }
  }, [searchFrom, searchTo, searchDate, onlyVerifiedDrivers]);

  // Selected ride for details & booking modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeDetailRide, setActiveDetailRide] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [pickupNotes, setPickupNotes] = useState('');
  const [cancellationPolicyModalOpen, setCancellationPolicyModalOpen] = useState(false);

  const PUBLISHED_STATUSES = ['published', 'active', 'scheduled', 'in_progress'];

  // Filter rides for browse/search
  const filteredRides = rides.filter((r) => {
    if (!PUBLISHED_STATUSES.includes(r.status)) return false;

    const rideFrom = (r.from || r.from_location || '').toLowerCase();
    const rideTo = (r.to || r.to_location || '').toLowerCase();
    const pickupPoint = (r.pickupDropPoints?.[0]?.point || '').toLowerCase();
    const dropoffPoint = (r.pickupDropPoints?.[1]?.point || '').toLowerCase();

    const cleanFrom = searchFrom?.trim().toLowerCase();
    const cleanTo = searchTo?.trim().toLowerCase();
    const cleanDate = searchDate?.trim();

    if (cleanFrom && !rideFrom.includes(cleanFrom) && !pickupPoint.includes(cleanFrom)) {
      return false;
    }
    if (cleanTo && !rideTo.includes(cleanTo) && !dropoffPoint.includes(cleanTo)) {
      return false;
    }
    if (cleanDate) {
      const rideDateStr = String(r.date || '').trim();
      const matchesDate =
        rideDateStr === cleanDate ||
        rideDateStr.startsWith(cleanDate) ||
        rideDateStr === 'Today' ||
        rideDateStr.toLowerCase().includes(cleanDate.toLowerCase());
      if (!matchesDate) return false;
    }
    const isVerified = Boolean(r.driverVerified ?? r.driver_verified);
    if (onlyVerifiedDrivers && !isVerified) {
      return false;
    }
    return true;
  });

  // User's own bookings
  const myBookings = bookings.filter((b) => b.passengerId === currentUser?.id);
  const activeConfirmedBooking = myBookings.find((b) => b.status === 'confirmed');
  const activeRideForPassenger =
    (selectedRideId && rides.find((r) => r.id === selectedRideId)) ||
    (activeConfirmedBooking && rides.find((r) => r.id === activeConfirmedBooking.rideId)) ||
    rides.find((r) => r.status === 'in_progress') ||
    rides[0];

  // Auto-open Coordination & Boarding PIN modal when driver confirms booking
  const autoOpenedBookingIdRef = React.useRef(null);
  React.useEffect(() => {
    if (activeConfirmedBooking && activeConfirmedBooking.id !== autoOpenedBookingIdRef.current) {
      autoOpenedBookingIdRef.current = activeConfirmedBooking.id;
      setSelectedCoordinationBooking(activeConfirmedBooking);
      setCoordinationModalOpen(true);
      triggerToast(
        'Ride Confirmed! 🎉',
        `Driver confirmed your ride for ${activeConfirmedBooking.from} → ${activeConfirmedBooking.to}. Open Ride Hub to view Boarding PIN!`,
        'success'
      );
    }
  }, [activeConfirmedBooking?.id, activeConfirmedBooking?.status]);

  // Auto-notify passenger when driver starts the ride and switch to live tracking
  const rideStartedRef = React.useRef(false);
  React.useEffect(() => {
    if (activeRideForPassenger?.status === 'in_progress' && !rideStartedRef.current) {
      rideStartedRef.current = true;
      triggerToast(
        'Ride Started! 🚗💨',
        `Your ride ${activeRideForPassenger.from} → ${activeRideForPassenger.to} is now on the highway! Live GPS tracking is active.`,
        'info'
      );
      setSelectedRideId(activeRideForPassenger.id);
      setActivePassengerTab('active_ride');
    }
  }, [activeRideForPassenger?.status, activeRideForPassenger?.id]);

  const openRideDetails = (ride) => {
    setActiveDetailRide(ride);
    setSeatsToBook(1);
    setDetailModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!activeDetailRide) return;
    if (seatsToBook > activeDetailRide.availableSeats) {
      triggerToast('Seats Unavailable', `Only ${activeDetailRide.availableSeats} seat(s) available.`, 'error');
      return;
    }

    await requestBooking(
      activeDetailRide.id,
      seatsToBook,
      activeDetailRide.pickupDropPoints?.[0]?.point || activeDetailRide.from,
      pickupNotes
    );
    setDetailModalOpen(false);
    setActivePassengerTab('my_bookings');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Navigation Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser?.name}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                Co-Traveller / Passenger
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Member since {currentUser?.joinDate || '2025'} • ★ {currentUser?.rating || 4.9} ({currentUser?.tripsCompleted || 0} completed trips)
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">My Bookings</span>
            <span className="text-lg font-black text-teal-700">{myBookings.length}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Status</span>
            <span className="text-xs font-bold text-emerald-700">
              {activeConfirmedBooking ? 'Ride Confirmed' : 'Ready to Book'}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmed Booking Coordination Banner */}
      {activeConfirmedBooking && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] font-black uppercase tracking-wider border border-white/20">
                  Booking Confirmed by Driver!
                </span>
                {activeConfirmedBooking.boardingPin && (
                  <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-amber-200 font-bold border border-white/10">
                    Boarding PIN: {activeConfirmedBooking.boardingPin}
                  </span>
                )}
                {activeConfirmedBooking.boardingVerified && (
                  <span className="text-xs bg-emerald-500 px-2.5 py-0.5 rounded-full text-white font-bold">
                    Boarding Verified ✓
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1">
                {activeConfirmedBooking.from} → {activeConfirmedBooking.to}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                Driver confirmed your request! Open the Ride Hub to coordinate pickup on the map, view your Boarding PIN, or call/chat with driver.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => handleOpenCoordination(activeConfirmedBooking)}
              className="w-full md:w-auto px-5 py-3 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              Open Ride Hub & PIN
            </button>
          </div>
        </div>
      )}

      {/* Live Highway Journey In-Progress Banner */}
      {activeRideForPassenger?.status === 'in_progress' && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner animate-pulse">
              <Navigation className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-bold">
                  Live Highway Journey Active 🚗💨
                </span>
                <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-emerald-200 font-bold border border-white/10">
                  {activeRideForPassenger.from} → {activeRideForPassenger.to}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1">
                Your Ride is on the Route!
              </h3>
              <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                Driver has started the trip. Real-time GPS highway route tracking, speed monitoring, and milestone checkpoints are active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                setSelectedRideId(activeRideForPassenger.id);
                setActivePassengerTab('active_ride');
              }}
              className="w-full md:w-auto px-5 py-3 bg-white hover:bg-emerald-50 active:scale-95 text-blue-900 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Navigation className="w-4 h-4 text-teal-600" />
              View Live Route Map
            </button>
            {activeConfirmedBooking && (
              <button
                onClick={() => handleOpenCoordination(activeConfirmedBooking)}
                className="w-full md:w-auto px-4 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-2xl border border-white/20 flex items-center justify-center gap-1.5 transition"
              >
                Ride Hub & Chat
              </button>
            )}
          </div>
        </div>
      )}

      {/* Passenger Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActivePassengerTab('browse')}
          className={`px-4 py-2 rounded-xl transition ${
            activePassengerTab === 'browse' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Available Rides ({filteredRides.length})
        </button>

        <button
          onClick={() => setActivePassengerTab('search')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            activePassengerTab === 'search' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Search & Filters
        </button>

        <button
          onClick={() => setActivePassengerTab('my_bookings')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            activePassengerTab === 'my_bookings' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          My Bookings ({myBookings.length})
        </button>

        <button
          onClick={() => setActivePassengerTab('active_ride')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            activePassengerTab === 'active_ride' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Active Live Ride
        </button>

        <button
          onClick={() => setActivePassengerTab('history')}
          className={`px-4 py-2 rounded-xl transition ${
            activePassengerTab === 'history' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Booking History
        </button>
      </div>

      {/* SEARCH BAR WIDGET (Always visible or in Search tab) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Search Intercity Shared Rides
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={onlyVerifiedDrivers}
              onChange={(e) => setOnlyVerifiedDrivers(e.target.checked)}
              className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300"
            />
            <label htmlFor="verifiedOnly" className="text-xs text-slate-600 cursor-pointer">
              Verified Drivers Only
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">From</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Starting city (e.g. Latur)"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">To</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Destination (e.g. Pune)"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setSearchFrom('');
                setSearchTo('');
                setSearchDate('');
              }}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
            >
              Clear
            </button>
            <button
              onClick={() => setActivePassengerTab('browse')}
              className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Filter Rides ({filteredRides.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: BROWSE / SEARCH AVAILABLE RIDES */}
      {(activePassengerTab === 'browse' || activePassengerTab === 'search') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              Available Cost-Sharing Rides ({filteredRides.length})
            </h3>
            <span className="text-xs text-slate-500">
              Showing matching intercity carpools with verified car owners
            </span>
          </div>

          {filteredRides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Driver Info & Verification Badge */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={ride.driverAvatar}
                          alt={ride.driverName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-900">{ride.driverName}</span>
                            {ride.driverVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified Driver" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">★ {ride.driverRating} Rating</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {ride.vehicleType}
                      </span>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-base font-black text-slate-900">
                        <span>{ride.from}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span>{ride.to}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ride.departureTime}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">ETA: </span>
                          <span className="font-semibold text-slate-800">{ride.estimatedArrivalTime}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 space-y-1">
                        <div><strong>Vehicle:</strong> {ride.vehicleDetails}</div>
                        <div><strong>Pickup:</strong> {ride.pickupDropPoints?.[0]?.point || ride.from}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Seat Selection Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Shared Contribution
                      </span>
                      <div className="text-xl font-black text-emerald-700">
                        ₹{ride.sharedCostPerSeat}{' '}
                        <span className="text-xs font-normal text-slate-500">/ seat</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          ride.availableSeats > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {ride.availableSeats > 0 ? `${ride.availableSeats} available seat(s)` : 'Fully booked'}
                      </span>
                    </div>

                    <button
                      onClick={() => openRideDetails(ride)}
                      disabled={ride.availableSeats === 0}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">No rides match your filter. Try clearing filters or search another date.</p>
              <button
                onClick={() => {
                  setSearchFrom('');
                  setSearchTo('');
                  setSearchDate('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BOOKINGS */}
      {activePassengerTab === 'my_bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">My Ride Bookings</h3>
              <p className="text-xs text-slate-500">
                Track status of your seat reservations and upcoming carpool trips
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBookings.map((bkg) => {
              const ride = rides.find((r) => r.id === bkg.rideId);
              return (
                <div
                  key={bkg.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="font-bold text-base text-slate-900">
                        {bkg.from} → {bkg.to}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          bkg.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bkg.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : bkg.status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {bkg.status === 'confirmed'
                          ? 'Booking Confirmed ✓'
                          : bkg.status === 'pending'
                          ? 'Pending Driver Approval'
                          : bkg.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seats Reserved:</span>
                        <span className="font-bold text-slate-800">{bkg.seatsRequested} seat(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Shared Contribution:</span>
                        <span className="font-bold text-emerald-700">₹{bkg.totalSharedContribution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pickup Point:</span>
                        <span className="font-medium text-slate-800">{bkg.pickupPoint}</span>
                      </div>
                      {ride && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Driver:</span>
                          <span className="font-semibold text-slate-800">{ride.driverName} ({ride.vehicleDetails})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    {bkg.status === 'confirmed' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenCoordination(bkg)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Pickup Hub & Chat Driver
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRideId(bkg.rideId);
                            setActivePassengerTab('active_ride');
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Live Map
                        </button>
                      </div>
                    )}

                    {bkg.status === 'pending' && (
                      <button
                        onClick={() => cancelPassengerBooking(bkg.id, 'Personal reason', 'Passenger cancelled pending request')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 ml-auto"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE RIDE / LIVE GPS TRACKING */}
      {activePassengerTab === 'active_ride' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Active Ride Live Tracking</h3>
              <p className="text-xs text-slate-500">
                Follow your vehicle position in real-time with continuous route monitoring & safety SOS
              </p>
            </div>
          </div>
          <LiveTrackingMap ride={activeRideForPassenger} isDriverView={false} />
        </div>
      )}

      {/* TAB 4: BOOKING HISTORY */}
      {activePassengerTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Your Booking History</h3>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Contribution</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">Pune → Solapur</td>
                  <td className="py-3 px-4 text-slate-600">28 Sep 2026</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">2 seats</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹620</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      Completed ✓
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RIDE DETAILS & SEAT SELECTION MODAL */}
      {detailModalOpen && activeDetailRide && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Driver Info & Verification */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 mb-5">
              <img
                src={activeDetailRide.driverAvatar}
                alt={activeDetailRide.driverName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-bold text-slate-900">{activeDetailRide.driverName}</h3>
                  {activeDetailRide.driverVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Car Owner
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ★ {activeDetailRide.driverRating} Rating • Member since 2025
                </p>
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  {activeDetailRide.vehicleDetails}
                </p>
              </div>
            </div>

            {/* Route & Times */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 space-y-3">
              <div className="flex items-center justify-between text-base font-black text-slate-900">
                <span>{activeDetailRide.from}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>{activeDetailRide.to}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">DEPARTURE TIME</span>
                  <span className="font-semibold text-slate-800">{activeDetailRide.departureTime} ({activeDetailRide.date})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ESTIMATED ARRIVAL</span>
                  <span className="font-semibold text-slate-800">{activeDetailRide.estimatedArrivalTime}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                <strong>Pickup Point:</strong> {activeDetailRide.pickupDropPoints?.[0]?.point || activeDetailRide.from}
              </div>
            </div>

            {/* Cost-Sharing Explanation Clause */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl mb-5 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <IndianRupee className="w-3.5 h-3.5" />
                Cost-Sharing Breakdown (₹{activeDetailRide.sharedCostPerSeat} / seat)
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                This contribution covers your share of fuel & FASTag highway toll expenses. The car owner is already traveling on this route and earns no commercial profit.
              </p>
            </div>

            {/* Interactive Seat Selection: [-] 1 [+] */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-slate-900">Select Number of Seats</div>
                  <div className="text-[11px] text-slate-500">
                    Available: <strong className="text-emerald-700">{activeDetailRide.availableSeats} seats</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSeatsToBook((prev) => Math.max(1, prev - 1))}
                    disabled={seatsToBook <= 1}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 disabled:opacity-40 flex items-center justify-center font-bold text-slate-800 hover:bg-slate-100 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-black text-base text-slate-900 min-w-[20px] text-center">
                    {seatsToBook}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSeatsToBook((prev) => Math.min(activeDetailRide.availableSeats, prev + 1))}
                    disabled={seatsToBook >= activeDetailRide.availableSeats}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 disabled:opacity-40 flex items-center justify-center font-bold text-slate-800 hover:bg-slate-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-700">
                <span>Total Contribution ({seatsToBook} seat × ₹{activeDetailRide.sharedCostPerSeat}):</span>
                <span className="text-lg font-black text-emerald-700">
                  ₹{activeDetailRide.sharedCostPerSeat * seatsToBook}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Location Preference & Luggage Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Will carry 1 medium backpack, standing near highway gate."
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cancellation Policy Notice */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-6 text-[11px] text-blue-950 leading-relaxed flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cancellation Protection: </strong>
                "If the driver unexpectedly cancels the ride, eligible passenger payments/refunds will be processed immediately according to the cancellation policy."
              </div>
            </div>

            {/* Book Action */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-600/25 flex items-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Send Booking Request (₹{activeDetailRide.sharedCostPerSeat * seatsToBook})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Driver Ride Coordination & Pickup Hub Modal */}
      {selectedCoordinationBooking && (
        <RideCoordinationModal
          isOpen={coordinationModalOpen}
          onClose={() => setCoordinationModalOpen(false)}
          booking={bookings.find((b) => b.id === selectedCoordinationBooking?.id) || selectedCoordinationBooking}
          ride={rides.find((r) => r.id === selectedCoordinationBooking?.rideId)}
          isDriverView={false}
          onSwitchToLiveMap={() => {
            setSelectedRideId(selectedCoordinationBooking?.rideId);
            setActivePassengerTab('active_ride');
          }}
        />
      )}
    </div>
  );
};
