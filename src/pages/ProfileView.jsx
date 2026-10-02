import React from 'react';
import {
  User,
  ShieldCheck,
  Car,
  Star,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Award,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView = () => {
  const { currentUser, currentRole, rides, bookings } = useApp();

  if (!currentUser) return null;

  const isDriver = currentRole === 'driver';

  // Driver trips
  const driverTrips = rides.filter((r) => r.driverId === currentUser.id);
  const completedDriverTrips = driverTrips.filter((r) => r.status === 'completed');

  // Passenger trips
  const passengerBookings = bookings.filter((b) => b.passengerId === currentUser.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center gap-6">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-slate-100"
        />

        <div className="text-center sm:text-left flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900">{currentUser.name}</h2>
            {isDriver && currentUser.verificationStatus === 'verified' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold w-fit mx-auto sm:mx-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Car Owner
              </span>
            )}
            {!isDriver && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold w-fit mx-auto sm:mx-0">
                Verified Co-Traveller
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentUser.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {currentUser.phone || '+91 98221 44321'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since {currentUser.joinDate || '2025'}
            </span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800">
              {currentUser.rating || 4.9} ({currentUser.tripsCompleted || 12} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Driver Vehicle Credentials (if driver) */}
      {isDriver && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Vehicle Details</h3>
              <p className="text-xs text-slate-500">Verified by platform administrators</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">MAKE & MODEL</span>
              <span className="font-bold text-slate-900">{currentUser.vehicle?.make} {currentUser.vehicle?.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">REGISTRATION NUMBER</span>
              <span className="font-mono font-bold text-slate-900">{currentUser.vehicle?.plateNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">TOTAL CAPACITY</span>
              <span className="font-bold text-slate-900">{currentUser.vehicle?.seatingCapacity}-Seater</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">FUEL & TRANSMISSION</span>
              <span className="font-bold text-slate-900">{currentUser.vehicle?.fuelType}</span>
            </div>
          </div>

          {currentUser.vehicle?.features && (
            <div className="flex flex-wrap gap-2 pt-2">
              {currentUser.vehicle.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-xl"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trust & Community Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Identity Verified</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Government ID and contact verified against fraud database.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">100% Cost Sharing</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Committed to genuine peer-to-peer fuel and toll cost splitting.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Punctual Co-traveller</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              99% on-time departure track record across journeys.
            </p>
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Placeholder */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Co-traveller Reviews & Feedback</h3>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Sunil K. (Co-traveller)</span>
              <span className="text-[10px] text-slate-400">2 weeks ago</span>
            </div>
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600">
              "Great experience! Car was spotless, departure was sharp on time, and fair split of toll charges."
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Meera P. (Co-traveller)</span>
              <span className="text-[10px] text-slate-400">Last month</span>
            </div>
            <div className="flex text-amber-400">
              {'★★★★★'}
            </div>
            <p className="text-xs text-slate-600">
              "Very smooth ride on the expressway. Felt extremely safe throughout the journey."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
