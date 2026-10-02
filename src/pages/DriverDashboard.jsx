import React, { useState } from 'react';
import {
  Car,
  PlusCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  IndianRupee,
  Navigation,
  Check,
  X,
  Scale,
  Sparkles,
  Info,
  ChevronRight,
  Eye,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VerificationModal } from '../components/VerificationModal';
import { CancellationPolicyModal } from '../components/CancellationPolicyModal';
import { LiveTrackingMap } from '../components/LiveTrackingMap';
import { CostSharingExplainer } from '../components/CostSharingExplainer';

export const DriverDashboard = () => {
  const {
    currentUser,
    rides,
    bookings,
    createRide,
    acceptBooking,
    rejectBooking,
    cancelRide,
    activeTab,
    setActiveTab,
    selectedRideId,
    setSelectedRideId,
    triggerToast
  } = useApp();

  const [activeDriverTab, setActiveDriverTab] = useState('overview'); // 'overview' | 'create_ride' | 'my_rides' | 'requests' | 'active_ride' | 'history' | 'verification' | 'deposit'
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [cancellationPolicyModalOpen, setCancellationPolicyModalOpen] = useState(false);
  const [cancelRideModalOpen, setCancelRideModalOpen] = useState(false);
  const [selectedRideToCancel, setSelectedRideToCancel] = useState(null);
  const [cancelReasonCategory, setCancelReasonCategory] = useState('Vehicle problem');
  const [cancelExplanation, setCancelExplanation] = useState('');

  // Create Ride Form State
  const [rideForm, setRideForm] = useState({
    from: 'Latur',
    to: 'Pune',
    date: '2026-10-08',
    departureTime: '07:00 AM',
    estimatedArrivalTime: '01:30 PM',
    vehicleType: '5-Seater',
    totalSeats: 5,
    availableSeats: 2, // Available for passengers
    sharedCostPerSeat: 300,
    pickupPoint: 'Shivaji Chowk, Latur',
    dropoffPoint: 'Hadapsar Gadital, Pune',
    description: 'Travelling to Pune for official visit. 2 seats open to share fuel & toll costs.',
    cancellationDeposit: 250,
    agreedToDepositPolicy: false
  });

  // Filter rides for this driver
  const driverRides = rides.filter((r) => r.driverId === currentUser?.id);
  const scheduledRides = driverRides.filter((r) => r.status === 'scheduled');
  const inProgressRides = driverRides.filter((r) => r.status === 'in_progress');
  const completedRides = driverRides.filter((r) => r.status === 'completed');

  // Find active ride or fallback to any in-progress ride
  const currentActiveRide = inProgressRides[0] || scheduledRides[0] || rides.find((r) => r.status === 'in_progress');

  // Filter booking requests for this driver's rides
  const driverRideIds = driverRides.map((r) => r.id);
  const driverBookings = bookings.filter((b) => driverRideIds.includes(b.rideId));
  const pendingRequests = driverBookings.filter((b) => b.status === 'pending');
  const acceptedBookings = driverBookings.filter((b) => b.status === 'confirmed');
  const rejectedBookings = driverBookings.filter((b) => b.status === 'rejected');

  const isVerified = currentUser?.verificationStatus === 'verified';

  // Handle Create Ride click with verification check
  const handleOpenCreateRide = () => {
    if (!isVerified) {
      triggerToast('Verification Required', 'You must be a verified car owner to publish rides. Opening verification.', 'warning');
      setVerificationModalOpen(true);
      return;
    }
    setActiveDriverTab('create_ride');
  };

  const handlePublishRide = (e) => {
    e.preventDefault();
    if (!isVerified) {
      setVerificationModalOpen(true);
      return;
    }

    if (!rideForm.agreedToDepositPolicy) {
      triggerToast('Deposit Agreement Required', 'Please accept the refundable cancellation deposit policy.', 'error');
      return;
    }

    const newId = createRide({
      ...rideForm,
      fromCoordinates: [18.4088, 76.5604],
      toCoordinates: [18.5204, 73.8567],
      pickupDropPoints: [
        { type: 'pickup', point: rideForm.pickupPoint, time: rideForm.departureTime },
        { type: 'dropoff', point: rideForm.dropoffPoint, time: rideForm.estimatedArrivalTime }
      ]
    });

    setActiveDriverTab('my_rides');
  };

  const handleConfirmCancelRide = () => {
    if (!selectedRideToCancel) return;
    cancelRide(selectedRideToCancel.id, 'driver', cancelReasonCategory, cancelExplanation);
    setCancelRideModalOpen(false);
    setSelectedRideToCancel(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Driver Profile & Verification Badge */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser?.name}</h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Car Owner
                </span>
              ) : currentUser?.verificationStatus === 'pending' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Verification Pending Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Not Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Vehicle: {currentUser?.vehicle ? `${currentUser.vehicle.make} ${currentUser.vehicle.model} (${currentUser.vehicle.plateNumber})` : 'Vehicle Not Registered'}
              {' • '}★ {currentUser?.rating || 'New'} ({currentUser?.tripsCompleted || 0} completed rides)
            </p>
          </div>
        </div>

        {/* Quick Driver Stats */}
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-1">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Requests</span>
            <span className="text-lg font-black text-amber-600">{pendingRequests.length}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active / Scheduled</span>
            <span className="text-lg font-black text-emerald-600">{inProgressRides.length + scheduledRides.length}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cancellation Escrow</span>
            <span className="text-lg font-black text-slate-900">₹{currentUser?.cancellationDepositBalance || 250}</span>
          </div>

          <button
            onClick={handleOpenCreateRide}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 shrink-0 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create Ride
          </button>
        </div>
      </div>

      {/* Verification Notice Banner if not verified */}
      {!isVerified && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {currentUser?.verificationStatus === 'pending'
                  ? 'Your Vehicle & Driver Documents Are Under Review'
                  : 'Driver Verification Required Before Publishing Rides'}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 max-w-2xl leading-relaxed">
                {currentUser?.verificationStatus === 'pending'
                  ? 'Our admin team is reviewing your vehicle registration number and driver license. You will receive an instant notification once approved.'
                  : 'To protect co-passengers and maintain authentic peer-to-peer trust, car owners must verify their vehicle registration number (RC) and driving license before publishing rides.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVerificationModalOpen(true)}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0"
          >
            {currentUser?.verificationStatus === 'pending' ? 'View Submitted Docs' : 'Complete Verification Now'}
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveDriverTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            activeDriverTab === 'overview' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Overview & Quick Stats
        </button>

        <button
          onClick={handleOpenCreateRide}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            activeDriverTab === 'create_ride' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create Ride
        </button>

        <button
          onClick={() => setActiveDriverTab('my_rides')}
          className={`px-4 py-2 rounded-xl transition ${
            activeDriverTab === 'my_rides' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          My Rides ({driverRides.length})
        </button>

        <button
          onClick={() => setActiveDriverTab('requests')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            activeDriverTab === 'requests' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Booking Requests
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveDriverTab('active_ride')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            activeDriverTab === 'active_ride' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Active Live Ride
        </button>

        <button
          onClick={() => setActiveDriverTab('history')}
          className={`px-4 py-2 rounded-xl transition ${
            activeDriverTab === 'history' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Ride History
        </button>

        <button
          onClick={() => setActiveDriverTab('deposit')}
          className={`px-4 py-2 rounded-xl transition ${
            activeDriverTab === 'deposit' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Cancellation Deposit
        </button>

        <button
          onClick={() => setVerificationModalOpen(true)}
          className="px-4 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1 text-slate-700"
        >
          <FileText className="w-3.5 h-3.5" />
          Verification Docs
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeDriverTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Actions & Pending Requests Alert */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                    !
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      You Have {pendingRequests.length} Pending Booking Request(s)
                    </h3>
                    <p className="text-xs text-amber-800">
                      Co-travellers are waiting for your seat confirmation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDriverTab('requests')}
                  className="text-xs font-bold text-amber-900 underline"
                >
                  View All Requests
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.passengerAvatar}
                        alt={req.passengerName}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{req.passengerName}</div>
                        <div className="text-[11px] text-slate-600">
                          {req.seatsRequested} seat(s) • {req.from} → {req.to}
                        </div>
                        <div className="text-[10px] text-slate-500">Pickup: {req.pickupPoint}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => acceptBooking(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => rejectBooking(req.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Ride Widget (if active) */}
          {currentActiveRide?.status === 'in_progress' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Ride In Progress: {currentActiveRide.from} → {currentActiveRide.to}
                </h3>
                <button
                  onClick={() => setActiveDriverTab('active_ride')}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  Full GPS Screen <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <LiveTrackingMap ride={currentActiveRide} isDriverView={true} />
            </div>
          )}

          {/* Upcoming Scheduled Trips List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Your Scheduled Rides</h3>
            {scheduledRides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <span className="font-bold text-sm text-slate-900">
                          {ride.from} → {ride.to}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Scheduled ({ride.date})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                        <div>
                          <span className="text-slate-400 block text-[10px]">DEPARTURE</span>
                          <span className="font-semibold text-slate-800">{ride.departureTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">AVAILABLE SEATS</span>
                          <span className="font-semibold text-emerald-700">
                            {ride.availableSeats} of {ride.totalPassengerSeatsAllowed} seats open
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">SHARED COST</span>
                          <span className="font-semibold text-slate-800">₹{ride.sharedCostPerSeat} / seat</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">DEPOSIT STATUS</span>
                          <span className="font-semibold text-emerald-600">₹{ride.cancellationDeposit} Escrowed</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedRideToCancel(ride);
                          setCancelRideModalOpen(true);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Cancel Ride
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRideId(ride.id);
                            setActiveDriverTab('active_ride');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                        >
                          View Map
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRideId(ride.id);
                            setActiveDriverTab('active_ride');
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                        >
                          Start Ride
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-slate-500 space-y-3">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs">No scheduled rides currently. Share your planned journey!</p>
                <button
                  onClick={handleOpenCreateRide}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Create Your First Ride
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE RIDE FORM (Wizard) */}
      {activeDriverTab === 'create_ride' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              Publish a Cost-Sharing Ride
            </div>
            <h2 className="text-2xl font-black text-slate-900">Create Your Ride</h2>
            <p className="text-xs text-slate-500 mt-1">
              Share available seats for an upcoming trip you are already planning to take.
            </p>
          </div>

          <form onSubmit={handlePublishRide} className="space-y-6">
            {/* Route Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                1. Route & Timings
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Location *</label>
                  <input
                    type="text"
                    required
                    value={rideForm.from}
                    onChange={(e) => setRideForm({ ...rideForm, from: e.target.value })}
                    placeholder="e.g. Latur"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={rideForm.to}
                    onChange={(e) => setRideForm({ ...rideForm, to: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Travel *</label>
                  <input
                    type="date"
                    required
                    value={rideForm.date}
                    onChange={(e) => setRideForm({ ...rideForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Departure *</label>
                    <input
                      type="text"
                      required
                      value={rideForm.departureTime}
                      onChange={(e) => setRideForm({ ...rideForm, departureTime: e.target.value })}
                      placeholder="07:00 AM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Arrival *</label>
                    <input
                      type="text"
                      required
                      value={rideForm.estimatedArrivalTime}
                      onChange={(e) => setRideForm({ ...rideForm, estimatedArrivalTime: e.target.value })}
                      placeholder="01:30 PM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Point</label>
                  <input
                    type="text"
                    value={rideForm.pickupPoint}
                    onChange={(e) => setRideForm({ ...rideForm, pickupPoint: e.target.value })}
                    placeholder="e.g. Shivaji Chowk, Latur"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Drop-off Point</label>
                  <input
                    type="text"
                    value={rideForm.dropoffPoint}
                    onChange={(e) => setRideForm({ ...rideForm, dropoffPoint: e.target.value })}
                    placeholder="e.g. Swargate / Hadapsar, Pune"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle & Seats Selection */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                2. Vehicle & Available Seats
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Selection *</label>
                  <select
                    value={rideForm.vehicleType}
                    onChange={(e) => {
                      const v = e.target.value;
                      let tot = 5;
                      if (v === '4-Seater') tot = 4;
                      if (v === '7-Seater') tot = 7;
                      setRideForm({ ...rideForm, vehicleType: v, totalSeats: tot });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="4-Seater">4-Seater (Hatchback / Compact)</option>
                    <option value="5-Seater">5-Seater (Sedan / Compact SUV)</option>
                    <option value="7-Seater">7-Seater (MUV / Large SUV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Vehicle Seats</label>
                  <input
                    type="number"
                    disabled
                    value={rideForm.totalSeats}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Available Passenger Seats *
                  </label>
                  <select
                    value={rideForm.availableSeats}
                    onChange={(e) => setRideForm({ ...rideForm, availableSeats: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {Array.from({ length: rideForm.totalSeats - 1 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} Seat{num > 1 ? 's' : ''} for passengers
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Remaining seats kept for driver & personal luggage.
                  </span>
                </div>
              </div>
            </div>

            {/* Cost-Sharing Contribution */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                3. Cost-Sharing Contribution (Not Commercial Fare)
              </h4>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Shared Travel-Cost per Seat (₹) *
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3.5 top-2.5 font-bold text-emerald-800">₹</span>
                      <input
                        type="number"
                        required
                        min="50"
                        max="2000"
                        value={rideForm.sharedCostPerSeat}
                        onChange={(e) => setRideForm({ ...rideForm, sharedCostPerSeat: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-emerald-900">
                    <span className="font-semibold block">Cost Split Breakdown:</span>
                    <span className="text-[11px] text-emerald-800">
                      ~₹{Math.round(rideForm.sharedCostPerSeat * 0.6)} fuel + ~₹{Math.round(rideForm.sharedCostPerSeat * 0.4)} FASTag tolls.
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-900/80 leading-relaxed border-t border-emerald-200/60 pt-2 flex items-start gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peer-to-Peer Rule:</strong> You are sharing an existing journey. Commercial profit, arbitrary surge pricing, or unlicensed commercial taxi operations are strictly prohibited.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trip Notes & Preferences</label>
                <textarea
                  rows={2}
                  value={rideForm.description}
                  onChange={(e) => setRideForm({ ...rideForm, description: e.target.value })}
                  placeholder="e.g. AC on, non-smoking, trunk has room for 2 medium bags."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Refundable Cancellation Deposit Agreement */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                4. Refundable Driver Cancellation Deposit
              </h4>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Required Cancellation Deposit:
                  </span>
                  <span className="text-sm font-black text-emerald-700">₹{rideForm.cancellationDeposit} (Refundable)</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  To ensure reliability for co-travellers, car owners place a refundable deposit in platform escrow.
                </p>

                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>
                    <strong>100% Refundable:</strong> Released immediately back to you upon completing the journey.
                  </li>
                  <li>
                    <strong>Protected Emergencies:</strong> If you must cancel due to mechanical breakdown or verified emergency, Admin refunds the deposit upon review.
                  </li>
                  <li>
                    <strong>Sudden Unexcused Cancellation:</strong> Arbitrary cancellation without a valid reason may result in loss of the deposit to compensate passengers.
                  </li>
                </ul>

                <div className="pt-2 border-t border-slate-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="agreeDeposit"
                    required
                    checked={rideForm.agreedToDepositPolicy}
                    onChange={(e) => setRideForm({ ...rideForm, agreedToDepositPolicy: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <label htmlFor="agreeDeposit" className="text-xs text-slate-700 leading-snug cursor-pointer">
                    I understand and agree to the <strong>Cancellation Deposit Policy</strong> and confirm this is a personal cost-sharing journey.
                  </label>
                </div>
              </div>
            </div>

            {/* Publish Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveDriverTab('overview')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                Publish Cost-Sharing Ride
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MY RIDES */}
      {activeDriverTab === 'my_rides' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">My Published Rides</h3>
              <p className="text-xs text-slate-500">Scheduled, active, and completed cost-sharing journeys</p>
            </div>
            <button
              onClick={handleOpenCreateRide}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              New Ride
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driverRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <span className="font-bold text-base text-slate-900">
                      {ride.from} → {ride.to}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        ride.status === 'in_progress'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : ride.status === 'completed'
                          ? 'bg-slate-200 text-slate-700'
                          : ride.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ride.status === 'in_progress' ? '● LIVE TRACKING' : ride.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Date & Departure:</span>
                      <span className="font-semibold text-slate-800">
                        {ride.date} at {ride.departureTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Available Passenger Seats:</span>
                      <span className="font-semibold text-emerald-700">
                        {ride.availableSeats} of {ride.totalPassengerSeatsAllowed} seats remaining
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cost Contribution:</span>
                      <span className="font-semibold text-slate-800">₹{ride.sharedCostPerSeat} / seat</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cancellation Deposit:</span>
                      <span className="font-semibold text-emerald-600">
                        ₹{ride.cancellationDeposit} ({ride.depositStatus})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {ride.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        setSelectedRideToCancel(ride);
                        setCancelRideModalOpen(true);
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Cancel Ride
                    </button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => {
                        setSelectedRideId(ride.id);
                        setActiveDriverTab('active_ride');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      {ride.status === 'in_progress' ? 'Open Live GPS' : 'View Tracking Screen'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BOOKING REQUESTS */}
      {activeDriverTab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Passenger Booking Requests</h3>
            <p className="text-xs text-slate-500">
              Review requests from co-travellers wishing to share seats on your trips
            </p>
          </div>

          {/* Pending Requests Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Requests ({pendingRequests.length})
            </h4>

            {pendingRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.passengerAvatar}
                          alt={req.passengerName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-900">{req.passengerName}</div>
                          <div className="text-xs text-slate-500">{req.passengerPhone}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                        Pending Action
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Route:</span>
                        <span className="font-bold text-slate-800">{req.from} → {req.to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seats Requested:</span>
                        <span className="font-bold text-emerald-700">{req.seatsRequested} seat(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Contribution:</span>
                        <span className="font-bold text-slate-900">₹{req.totalSharedContribution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pickup Point:</span>
                        <span className="font-medium text-slate-800">{req.pickupPoint}</span>
                      </div>
                      {req.notes && (
                        <div className="pt-1 text-[11px] text-slate-500 italic">
                          "{req.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => acceptBooking(req.id)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
                      >
                        <Check className="w-4 h-4" />
                        Accept Booking
                      </button>
                      <button
                        onClick={() => rejectBooking(req.id)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center text-xs text-slate-400">
                No pending booking requests currently.
              </div>
            )}
          </div>

          {/* Confirmed / Accepted Bookings */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Confirmed Co-Travellers ({acceptedBookings.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedBookings.map((bkg) => (
                <div
                  key={bkg.id}
                  className="bg-white rounded-3xl p-4 border border-emerald-200 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={bkg.passengerAvatar}
                      alt={bkg.passengerName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{bkg.passengerName}</div>
                      <div className="text-[11px] text-slate-600">
                        {bkg.seatsRequested} seat • {bkg.from} → {bkg.to}
                      </div>
                      <div className="text-[10px] text-slate-500">Contact: {bkg.passengerPhone}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Confirmed ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVE RIDE / LIVE GPS TRACKING */}
      {activeDriverTab === 'active_ride' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Active Live Trip Navigation</h3>
              <p className="text-xs text-slate-500">
                Live GPS route telemetry, route deviation detection, and emergency protocol
              </p>
            </div>
          </div>
          <LiveTrackingMap ride={currentActiveRide} isDriverView={true} />
        </div>
      )}

      {/* TAB 6: RIDE HISTORY */}
      {activeDriverTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Completed Trip History</h3>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Cost Recovered</th>
                    <th className="py-3 px-4">Deposit Status</th>
                    <th className="py-3 px-4">Trip Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedRides.length > 0 ? (
                    completedRides.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{r.from} → {r.to}</td>
                        <td className="py-3 px-4 text-slate-600">{r.date}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">₹{r.sharedCostPerSeat * 2}</td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">₹{r.cancellationDeposit} (Refunded)</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Completed ✓
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No completed trips yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CANCELLATION DEPOSIT EXPLANATION & STATUS */}
      {activeDriverTab === 'deposit' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Refundable Cancellation Deposit</h3>
              <p className="text-xs text-slate-500">Protecting co-travellers against unexpected trip cancellations</p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-950 block">Your Current Escrow Balance</span>
              <span className="text-2xl font-black text-emerald-800">
                ₹{currentUser?.cancellationDepositBalance || 250}
              </span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-200 text-emerald-900 rounded-xl">
              100% Refundable
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-sm">How the Deposit Works:</h4>
            <p>
              When publishing a cost-sharing ride, the car owner commits a ₹250 refundable deposit.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <strong>Car Owner Cancellation Rule:</strong> "Sudden cancellation without an accepted valid reason may result in loss of the refundable cancellation deposit."
            </div>
            <p>
              If an unavoidable vehicle issue or emergency occurs, Admin reviews your submitted explanation and promptly refunds the deposit.
            </p>
          </div>

          <button
            onClick={() => setCancellationPolicyModalOpen(true)}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Review Full Cancellation & Refund Policy
          </button>
        </div>
      )}

      {/* Driver Verification Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        driver={currentUser}
      />

      {/* Cancellation Policy Modal */}
      <CancellationPolicyModal
        isOpen={cancellationPolicyModalOpen}
        onClose={() => setCancellationPolicyModalOpen(false)}
        role="driver"
        depositAmount={250}
      />

      {/* Cancel Ride Modal */}
      {cancelRideModalOpen && selectedRideToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Cost-Sharing Ride</h3>
                <p className="text-xs text-slate-500">
                  {selectedRideToCancel.from} → {selectedRideToCancel.to}
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 leading-relaxed">
              <strong>Notice:</strong> "Sudden cancellation without an accepted valid reason may result in loss of the refundable cancellation deposit." Your cancellation reason will be sent to Admin for deposit refund determination.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason Category *</label>
                <select
                  value={cancelReasonCategory}
                  onChange={(e) => setCancelReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Emergency">Medical / Family Emergency</option>
                  <option value="Vehicle problem">Vehicle breakdown / Mechanical problem</option>
                  <option value="Personal reason">Personal unexpected constraint</option>
                  <option value="Other">Other unavoidable reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Explanation *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why you need to cancel this trip..."
                  value={cancelExplanation}
                  onChange={(e) => setCancelExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCancelRideModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Keep Ride
              </button>
              <button
                onClick={handleConfirmCancelRide}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
