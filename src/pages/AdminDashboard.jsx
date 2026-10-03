import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Car,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  IndianRupee,
  RotateCcw,
  Check,
  X,
  Search,
  ChevronRight,
  Eye,
  AlertOctagon,
  Scale,
  Lock,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminDashboard = () => {
  const {
    drivers,
    passengers,
    rides,
    bookings,
    cancellations,
    approveDriverVerification,
    rejectDriverVerification,
    requestReverification,
    resolveCancellationDeposit,
    triggerToast,
    logout,
    adminConfig,
    updateAdminCredentials
  } = useApp();

  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'verifications' | 'users' | 'rides' | 'bookings' | 'cancellations'
  const [selectedDriverForInspect, setSelectedDriverForInspect] = useState(null);
  const [selectedCnlForReview, setSelectedCnlForReview] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newMasterPassword, setNewMasterPassword] = useState('');

  // Dashboard Stats Calculations
  const totalDrivers = drivers.length;
  const totalPassengers = passengers.length;
  const activeRidesCount = rides.filter((r) => r.status === 'in_progress').length;
  const completedRidesCount = rides.filter((r) => r.status === 'completed').length;
  const cancelledRidesCount = rides.filter((r) => r.status === 'cancelled').length;
  const pendingVerifications = drivers.filter((d) => d.verificationStatus === 'pending');
  const pendingCancellationDisputes = cancellations.filter((c) => c.depositStatus === 'pending_review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Platform Governance & Escrow Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Admin Control Panel</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee driver approvals, inspect vehicle credentials, and arbitrate refundable cancellation deposits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingVerifications.length > 0 && (
            <button
              onClick={() => setAdminTab('verifications')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              {pendingVerifications.length} Verifications Pending
            </button>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            title="Lock Admin Session and Return to Public Website"
          >
            Lock Admin Session
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold text-slate-600">
        <button
          onClick={() => setAdminTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            adminTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Overview Stats
        </button>

        <button
          onClick={() => setAdminTab('verifications')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            adminTab === 'verifications' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Driver Verifications
          {pendingVerifications.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {pendingVerifications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-xl transition ${
            adminTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          User Management ({totalDrivers + totalPassengers})
        </button>

        <button
          onClick={() => setAdminTab('rides')}
          className={`px-4 py-2 rounded-xl transition ${
            adminTab === 'rides' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Ride Management ({rides.length})
        </button>

        <button
          onClick={() => setAdminTab('bookings')}
          className={`px-4 py-2 rounded-xl transition ${
            adminTab === 'bookings' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Booking Requests ({bookings.length})
        </button>

        <button
          onClick={() => setAdminTab('cancellations')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            adminTab === 'cancellations' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          Cancellation & Deposit Disputes
          {pendingCancellationDisputes.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {pendingCancellationDisputes.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRIC CARDS */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Master Admin Security Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/60 border border-indigo-700 text-indigo-400 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Designated Platform Administrator</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Backend Authorized
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Permanent Admin Account: <strong className="text-white">{adminConfig?.email || 'admin@ridesharex.org'}</strong> • Backend guards enforce 403 Forbidden for all non-designated users.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Update Master Password
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Registered Drivers
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">{totalDrivers}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {drivers.filter((d) => d.verificationStatus === 'verified').length} verified car owners
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Passengers
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">{totalPassengers}</div>
              <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
                {bookings.length} total bookings made
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Live Rides
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-1 flex items-center gap-2">
                {activeRidesCount}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                Real-time GPS tracking active
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Completed Trips
              </span>
              <div className="text-3xl font-black text-indigo-600 mt-1">{completedRidesCount}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                Deposits refunded smoothly
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Pending Driver Verifications
              </span>
              <div className="text-3xl font-black text-amber-800 mt-1">{pendingVerifications.length}</div>
              <p className="text-xs text-amber-700 mt-1">Car owners waiting for document approval</p>
              <button
                onClick={() => setAdminTab('verifications')}
                className="mt-3 text-xs font-bold text-amber-950 underline"
              >
                Inspect Submitted Documents →
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block">
                Disputed Cancellations
              </span>
              <div className="text-3xl font-black text-rose-800 mt-1">{pendingCancellationDisputes.length}</div>
              <p className="text-xs text-rose-700 mt-1">Review driver deposit refund eligibility</p>
              <button
                onClick={() => setAdminTab('cancellations')}
                className="mt-3 text-xs font-bold text-rose-950 underline"
              >
                Review Deposit Decisions →
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Cancellation Total
              </span>
              <div className="text-3xl font-black text-slate-800 mt-1">{cancelledRidesCount}</div>
              <p className="text-xs text-slate-500 mt-1">Total trips cancelled with logged reasons</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVER VERIFICATION */}
      {adminTab === 'verifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Driver & Vehicle Verification Requests</h3>
              <p className="text-xs text-slate-500">
                Mandatory check before car owners are permitted to publish cost-sharing rides
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((drv) => (
              <div
                key={drv.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${
                  drv.verificationStatus === 'pending'
                    ? 'border-amber-300 ring-2 ring-amber-200'
                    : drv.verificationStatus === 'verified'
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={drv.avatar}
                        alt={drv.name}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{drv.name}</div>
                        <div className="text-xs text-slate-500">{drv.phone} • {drv.email}</div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                        drv.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : drv.verificationStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : drv.verificationStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {drv.verificationStatus}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Car / Reg Number:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {drv.vehicle?.plateNumber || 'Not submitted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vehicle Type:</span>
                      <span className="font-semibold text-slate-800">
                        {drv.vehicle ? `${drv.vehicle.make} ${drv.vehicle.model} (${drv.vehicle.seatingCapacity}-Seater)` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver License:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {drv.verificationDoc?.licenseNumber || 'Not submitted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Identity ID:</span>
                      <span className="font-medium text-slate-800">
                        {drv.verificationDoc?.idType || 'Aadhaar'} ({drv.verificationDoc?.idNumber || '••••'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Approve / Reject / Re-verify */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {drv.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => approveDriverVerification(drv.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Approve Driver
                    </button>
                  )}

                  {drv.verificationStatus !== 'rejected' && (
                    <button
                      onClick={() => rejectDriverVerification(drv.id, 'Blurry documents / mismatch in RC')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  )}

                  <button
                    onClick={() => requestReverification(drv.id, 'Please upload clearer copy of Vehicle RC')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Re-Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">User Management</h3>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <img src={drv.avatar} className="w-7 h-7 rounded-xl object-cover" />
                      <span>{drv.name}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">Driver / Car Owner</td>
                    <td className="py-3 px-4 text-slate-600">{drv.phone}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {drv.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => triggerToast('Account Status', `${drv.name} account active.`, 'info')}
                        className="text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {passengers.map((psg) => (
                  <tr key={psg.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <img src={psg.avatar} className="w-7 h-7 rounded-xl object-cover" />
                      <span>{psg.name}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-teal-700">Co-Traveller</td>
                    <td className="py-3 px-4 text-slate-600">{psg.phone}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => triggerToast('Account Status', `${psg.name} account active.`, 'info')}
                        className="text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RIDE MANAGEMENT */}
      {adminTab === 'rides' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">All Published Rides</h3>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Departure</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Shared Cost</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rides.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.from} → {r.to}</td>
                    <td className="py-3 px-4 text-slate-700">{r.driverName}</td>
                    <td className="py-3 px-4 text-slate-600">{r.date} ({r.departureTime})</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {r.availableSeats} of {r.totalPassengerSeatsAllowed}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{r.sharedCostPerSeat}</td>
                    <td className="py-3 px-4 text-slate-600">₹{r.cancellationDeposit} ({r.depositStatus})</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'in_progress'
                            ? 'bg-emerald-500 text-slate-950'
                            : r.status === 'completed'
                            ? 'bg-slate-200 text-slate-800'
                            : r.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BOOKING MANAGEMENT */}
      {adminTab === 'bookings' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">All Booking Requests</h3>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Contribution</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <img src={b.passengerAvatar} className="w-6 h-6 rounded-lg object-cover" />
                      <span>{b.passengerName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{b.from} → {b.to}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{b.seatsRequested} seat(s)</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹{b.totalSharedContribution}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CANCELLATION & DEPOSIT DISPUTES */}
      {adminTab === 'cancellations' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Cancellation Management & Escrow Decisions</h3>
            <p className="text-xs text-slate-500">
              Review cancellation reasons and decide whether the driver's refundable cancellation deposit should be returned or forfeited per platform rules.
            </p>
          </div>

          <div className="space-y-4">
            {cancellations.map((cnl) => (
              <div
                key={cnl.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {cnl.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      Route: {cnl.rideRoute}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Cancelled By: {cnl.driverName || cnl.passengerName} • Reason Category: <strong>{cnl.cancellationReason}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Deposit Amount</span>
                    <span className="text-lg font-black text-slate-900">₹{cnl.depositAmount}</span>
                    <span
                      className={`text-[10px] font-bold block ${
                        cnl.depositStatus === 'refunded'
                          ? 'text-emerald-600'
                          : cnl.depositStatus === 'forfeited'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      Status: {cnl.depositStatus}
                    </span>
                  </div>
                </div>

                {/* Detailed Explanation Submitted */}
                <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 text-slate-700">
                  <div>
                    <strong>Driver's Stated Reason: </strong>
                    <span className="text-slate-800">"{cnl.explanationText}"</span>
                  </div>
                  {cnl.supportDocumentSample && (
                    <div className="text-indigo-700 font-medium">
                      📎 Document Attached: {cnl.supportDocumentSample}
                    </div>
                  )}
                  {cnl.adminResolution && (
                    <div className="pt-2 border-t border-slate-200 text-slate-800">
                      <strong>Admin Resolution: </strong> {cnl.adminResolution}
                    </div>
                  )}
                </div>

                {/* Admin Decision Action Buttons (if pending review) */}
                {cnl.depositStatus === 'pending_review' && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                    <button
                      onClick={() =>
                        resolveCancellationDeposit(
                          cnl.id,
                          'refund',
                          'Accepted verified mechanic receipt; unpreventable vehicle breakdown.'
                        )
                      }
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Approve Deposit Refund (₹{cnl.depositAmount})
                    </button>

                    <button
                      onClick={() =>
                        resolveCancellationDeposit(
                          cnl.id,
                          'forfeit',
                          'Arbitrary short-notice cancellation without emergency proof.'
                        )
                      }
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      Forfeit Deposit per Policy
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Master Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Update Master Password</h4>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Set a new secure master password for the designated administrator account (<strong className="text-slate-800">{adminConfig?.email || 'admin@ridesharex.org'}</strong>). Protected by backend authorization guard.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Master Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter new master password"
                value={newMasterPassword}
                onChange={(e) => setNewMasterPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewMasterPassword('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newMasterPassword.trim()}
                onClick={() => {
                  if (newMasterPassword.trim()) {
                    updateAdminCredentials(adminConfig?.email, newMasterPassword.trim());
                    setShowPasswordModal(false);
                    setNewMasterPassword('');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Save New Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
