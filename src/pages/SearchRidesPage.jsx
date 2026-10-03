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
  Filter,
  Sparkles,
  Minus,
  Plus,
  X,
  Car,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SearchRidesPage = () => {
  const {
    rides,
    requestBooking,
    currentUser,
    currentRole,
    switchRole,
    triggerToast,
    globalSearch,
    setGlobalSearch,
    setActiveTab,
    refreshRides
  } = useApp();

  // Fetch latest real published rides on mount
  React.useEffect(() => {
    if (refreshRides) {
      refreshRides();
    }
  }, []);

  // Search filter states (synced with globalSearch if present)
  const [searchFrom, setSearchFrom] = useState(globalSearch?.from || '');
  const [searchTo, setSearchTo] = useState(globalSearch?.to || '');
  const [searchDate, setSearchDate] = useState(globalSearch?.date || '');
  const [searchSeats, setSearchSeats] = useState(globalSearch?.seats || 1);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Sync if globalSearch updates externally
  React.useEffect(() => {
    if (globalSearch?.from !== undefined) setSearchFrom(globalSearch.from);
    if (globalSearch?.to !== undefined) setSearchTo(globalSearch.to);
    if (globalSearch?.date !== undefined) setSearchDate(globalSearch.date);
    if (globalSearch?.seats !== undefined) setSearchSeats(globalSearch.seats);
  }, [globalSearch]);

  // Booking modal states
  const [selectedRide, setSelectedRide] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [pickupNotes, setPickupNotes] = useState('');
  const [bookingPassengerName, setBookingPassengerName] = useState(
    currentUser?.role === 'passenger' ? currentUser.name : ''
  );

  const POPULAR_ORIGINS = ['Latur', 'Pune', 'Mumbai', 'Bengaluru'];
  const POPULAR_DESTINATIONS = ['Pune', 'Mumbai', 'Nashik', 'Mysuru', 'Solapur'];

  // Published/active status values supported in database
  const PUBLISHED_STATUSES = ['published', 'active', 'scheduled', 'in_progress'];

  // Filter rides based on search criteria
  const availableRides = rides.filter((r) => {
    // Show only real published/active rides
    if (!PUBLISHED_STATUSES.includes(r.status)) return false;

    const cleanFrom = searchFrom?.trim().toLowerCase();
    const cleanTo = searchTo?.trim().toLowerCase();
    const cleanDate = searchDate?.trim();

    if (cleanFrom && !r.from?.toLowerCase().includes(cleanFrom)) {
      return false;
    }
    if (cleanTo && !r.to?.toLowerCase().includes(cleanTo)) {
      return false;
    }
    if (cleanDate && r.date?.trim() !== cleanDate && r.date !== 'Today') {
      return false;
    }
    if (searchSeats && Number(r.availableSeats) < Number(searchSeats)) {
      return false;
    }
    if (onlyVerified && !r.driverVerified) {
      return false;
    }
    return true;
  });

  const handleOpenBooking = (ride) => {
    setSelectedRide(ride);
    setSeatsToBook(1);
  };

  const handleConfirmBooking = () => {
    if (!selectedRide) return;

    if (seatsToBook > selectedRide.availableSeats) {
      triggerToast('Seats Unavailable', `Only ${selectedRide.availableSeats} seat(s) available.`, 'error');
      return;
    }

    // Require passenger account
    if (currentRole !== 'passenger' || !currentUser) {
      triggerToast('Sign In Required', 'Please sign in or create a passenger account to book rides.', 'info');
      setActiveTab('passenger_auth');
      setSelectedRide(null);
      return;
    }

    requestBooking(
      selectedRide.id,
      seatsToBook,
      selectedRide.pickupDropPoints[0]?.point || selectedRide.from,
      pickupNotes || 'Travelling with luggage, will be at pickup 10 mins early.'
    );

    setSelectedRide(null);
  };

  const clearFilters = () => {
    setSearchFrom('');
    setSearchTo('');
    setSearchDate('');
    setSearchSeats(1);
    setOnlyVerified(false);
    if (setGlobalSearch) {
      setGlobalSearch({ from: '', to: '', date: '', seats: 1 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Search className="w-3.5 h-3.5 text-emerald-600" />
          Find Affordable Peer-to-Peer Carpool
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Search Available Shared Rides
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Connect with verified car owners traveling your route. Share available seats and split actual fuel & highway toll expenses with zero commercial taxi markups.
        </p>
      </div>

      {/* Main Search Filter Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Starting Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Leaving From</span>
              {searchFrom && (
                <button
                  type="button"
                  onClick={() => setSearchFrom('')}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Latur, Pune, Mumbai"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Going To</span>
              {searchTo && (
                <button
                  type="button"
                  onClick={() => setSearchTo('')}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Pune, Mumbai, Nashik"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date of Travel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Travel</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Seats Required */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Passengers / Seats</label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <select
                value={searchSeats}
                onChange={(e) => setSearchSeats(parseInt(e.target.value))}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={1}>1 Seat Needed</option>
                <option value={2}>2 Seats Needed</option>
                <option value={3}>3 Seats Needed</option>
                <option value={4}>4+ Seats Needed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Route Shortcuts & Filters Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Popular Routes:</span>
            <button
              type="button"
              onClick={() => {
                setSearchFrom('Latur');
                setSearchTo('Pune');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
            >
              Latur → Pune (₹300)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchFrom('Pune');
                setSearchTo('Mumbai');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
            >
              Pune → Mumbai (₹280)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchFrom('Mumbai');
                setSearchTo('Nashik');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
            >
              Mumbai → Nashik (₹320)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchFrom('Bengaluru');
                setSearchTo('Mysuru');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
            >
              Bengaluru → Mysuru (₹220)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-slate-700 text-xs font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Drivers Only
              </span>
            </label>

            {(searchFrom || searchTo || searchDate || onlyVerified) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Available Cost-Sharing Rides ({availableRides.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {searchFrom || searchTo
              ? `Showing rides matching "${searchFrom || 'Any'} → ${searchTo || 'Any'}"`
              : 'Showing all active intercity cost-sharing rides'}
          </p>
        </div>
      </div>

      {/* Ride Cards Grid */}
      {availableRides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRides.map((ride) => (
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
                          <ShieldCheck
                            className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                            title="Verified Driver"
                          />
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
                      <span>{ride.departureTime} ({ride.date})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">ETA: </span>
                      <span className="font-semibold text-slate-800">{ride.estimatedArrivalTime}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 space-y-1">
                    <div><strong>Vehicle:</strong> {ride.vehicleDetails}</div>
                    <div><strong>Pickup:</strong> {ride.pickupDropPoints[0]?.point || ride.from}</div>
                  </div>
                </div>
              </div>

              {/* Pricing & Seat Selection Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Shared Fuel/Toll
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
                    {ride.availableSeats > 0 ? `${ride.availableSeats} seat(s) available` : 'Fully booked'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBooking(ride)}
                  disabled={ride.availableSeats === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Book Ride
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3">
          <Search className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No matching rides found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No driver is currently scheduled for this exact route or date. Try resetting your search filters to browse all available intercity rides.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Show All Available Rides
          </button>
        </div>
      )}

      {/* RIDE BOOKING & SEAT SELECTION MODAL */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRide(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Driver Info & Verification */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 mb-5">
              <img
                src={selectedRide.driverAvatar}
                alt={selectedRide.driverName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-bold text-slate-900">{selectedRide.driverName}</h3>
                  {selectedRide.driverVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Car Owner
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ★ {selectedRide.driverRating} Rating • {selectedRide.vehicleDetails}
                </p>
              </div>
            </div>

            {/* Route & Times */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 space-y-3">
              <div className="flex items-center justify-between text-base font-black text-slate-900">
                <span>{selectedRide.from}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>{selectedRide.to}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">DEPARTURE TIME</span>
                  <span className="font-semibold text-slate-800">{selectedRide.departureTime} ({selectedRide.date})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ESTIMATED ARRIVAL</span>
                  <span className="font-semibold text-slate-800">{selectedRide.estimatedArrivalTime}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                <strong>Pickup Point:</strong> {selectedRide.pickupDropPoints[0]?.point || selectedRide.from}
              </div>
            </div>

            {/* Interactive Seat Selection: [-] 1 [+] */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-slate-900">Select Number of Seats</div>
                  <div className="text-[11px] text-slate-500">
                    Available: <strong className="text-emerald-700">{selectedRide.availableSeats} seats</strong>
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
                    onClick={() => setSeatsToBook((prev) => Math.min(selectedRide.availableSeats, prev + 1))}
                    disabled={seatsToBook >= selectedRide.availableSeats}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 disabled:opacity-40 flex items-center justify-center font-bold text-slate-800 hover:bg-slate-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-700">
                <span>Total Contribution ({seatsToBook} seat × ₹{selectedRide.sharedCostPerSeat}):</span>
                <span className="text-lg font-black text-emerald-700">
                  ₹{selectedRide.sharedCostPerSeat * seatsToBook}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Location & Luggage Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Will carry 1 medium bag, standing near highway gate."
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                onClick={() => setSelectedRide(null)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Send Booking Request (₹{selectedRide.sharedCostPerSeat * seatsToBook})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
