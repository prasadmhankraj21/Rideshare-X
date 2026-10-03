import React, { useState, useEffect } from 'react';
import {
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Phone,
  Clock,
  Gauge,
  Radio,
  Share2,
  CheckCircle2,
  Flag,
  Car,
  Users,
  Compass,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SOSModal } from './SOSModal';

export const LiveTrackingMap = ({ ride, isDriverView = false }) => {
  const {
    startRide,
    endRide,
    toggleRouteDeviation,
    toggleRouteOptimization,
    routeDeviationTriggered,
    routeOptimizationApplied,
    bookings,
    currentUser
  } = useApp();

  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [carProgress, setCarProgress] = useState(48); // % along the route
  const [copiedLink, setCopiedLink] = useState(false);

  // Live simulation: slowly advance car progress when ride is in progress
  useEffect(() => {
    if (ride?.status !== 'in_progress') return;

    const interval = setInterval(() => {
      setCarProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 0.5;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [ride?.status]);

  if (!ride) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
        No active ride selected for live tracking.
      </div>
    );
  }

  const isRideActive = ride.status === 'in_progress';
  const isCompleted = ride.status === 'completed';
  const isScheduled = ride.status === 'scheduled';

  // Confirmed co-travellers on this ride
  const confirmedPassengers = bookings.filter(
    (b) => b.rideId === ride.id && (b.status === 'confirmed' || b.status === 'completed')
  );

  const handleShareTrip = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Coordinates calculation for SVG path rendering
  // Base planned route points
  const startX = 60;
  const startY = 220;
  const endX = 540;
  const endY = 80;

  // Car position along bezier curve
  const t = carProgress / 100;
  // Quadratic bezier curve point
  const ctrlX = routeDeviationTriggered ? 280 : 300;
  const ctrlY = routeDeviationTriggered ? 30 : (routeOptimizationApplied ? 100 : 150);

  const carX = Math.round((1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX);
  const carY = Math.round((1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY);

  const currentSpeed = isRideActive ? (routeDeviationTriggered ? 45 : 74) : 0;
  const etaMinutes = isRideActive
    ? Math.max(8, Math.round(52 * (1 - t) - (routeOptimizationApplied ? 18 : 0)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Route Deviation Safety Alert Banner */}
      {routeDeviationTriggered && isRideActive && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                Route Deviation Detected
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Safety Check
                </span>
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                The vehicle is taking an alternate bypass path. (This is a routine safety notification; the driver may be avoiding construction or traffic congestion. Please verify the route with co-travellers).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => toggleRouteDeviation(ride.id)}
              className="w-full sm:w-auto px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs rounded-xl transition"
            >
              Acknowledge / Re-align Route
            </button>
          </div>
        </div>
      )}

      {/* Main Map & Live HUD Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Map Header Status Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">
                  {ride.from} → {ride.to}
                </span>
                {isRideActive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    Live GPS Active
                  </span>
                )}
                {isScheduled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                    Scheduled ({ride.departureTime})
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold">
                    Trip Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ride.vehicleDetails} • Shared Cost: ₹{ride.sharedCostPerSeat}/seat
              </p>
            </div>
          </div>

          {/* Quick interactive map action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isRideActive && (
              <>
                <button
                  onClick={() => toggleRouteOptimization(ride.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    routeOptimizationApplied
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                  title="Toggle smart highway route optimization"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {routeOptimizationApplied ? 'Expressway Bypass (-18m)' : 'Optimize Route'}
                </button>

                <button
                  onClick={() => toggleRouteDeviation(ride.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    routeDeviationTriggered
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                  title="Simulate vehicle deviating from planned route"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Simulate Deviation
                </button>
              </>
            )}

            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/30 transition animate-pulse"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              SOS
            </button>
          </div>
        </div>

        {/* Live Vector Map Display */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-950 overflow-hidden select-none">
          {/* Map grid background pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px'
            }}
          />

          {/* Real styled SVG Map Canvas */}
          <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
            {/* Topography and highway paths */}
            <path
              d="M0,280 Q150,260 300,240 T600,220"
              stroke="#1e293b"
              strokeWidth="24"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M0,80 Q200,120 400,100 T600,60"
              stroke="#1e293b"
              strokeWidth="16"
              fill="none"
              opacity="0.3"
            />

            {/* Standard Planned Highway Route (Grey dashed outline) */}
            <path
              d={`M${startX},${startY} Q300,150 ${endX},${endY}`}
              stroke="#334155"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />

            {/* Active Trajectory Route Line */}
            <path
              d={`M${startX},${startY} Q${ctrlX},${ctrlY} ${endX},${endY}`}
              stroke={routeDeviationTriggered ? '#f59e0b' : routeOptimizationApplied ? '#10b981' : '#0ea5e9'}
              strokeWidth={routeDeviationTriggered ? '6' : '7'}
              strokeDasharray={routeDeviationTriggered ? '6 4' : 'none'}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-700"
            />

            {/* Completed Path Traveled Line (Emerald glow) */}
            {isRideActive && (
              <path
                d={`M${startX},${startY} Q${(startX + carX) / 2},${(startY + carY) / 2 + 10} ${carX},${carY}`}
                stroke="#10b981"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* Start Landmark Marker */}
            <g transform={`translate(${startX}, ${startY})`}>
              <circle r="14" fill="#0f172a" stroke="#10b981" strokeWidth="3" />
              <circle r="5" fill="#10b981" />
              <text x="18" y="5" fill="#94a3b8" fontSize="11" fontWeight="bold">
                {ride.from} (Start)
              </text>
            </g>

            {/* Waypoint Milestones along route */}
            <g transform="translate(230, 185)">
              <circle r="4" fill="#64748b" />
              <text x="-25" y="16" fill="#64748b" fontSize="9">
                Talegaon Toll
              </text>
            </g>

            <g transform="translate(380, 135)">
              <circle r="4" fill="#64748b" />
              <text x="-20" y="16" fill="#64748b" fontSize="9">
                Lonavala Ghat
              </text>
            </g>

            {/* Destination Landmark Marker */}
            <g transform={`translate(${endX}, ${endY})`}>
              <circle r="14" fill="#0f172a" stroke="#f43f5e" strokeWidth="3" />
              <circle r="5" fill="#f43f5e" />
              <text x="-90" y="5" fill="#f43f5e" fontSize="11" fontWeight="bold">
                {ride.to} (Destination)
              </text>
            </g>

            {/* Live Moving Car Marker with Pulsing GPS Ring */}
            {isRideActive && (
              <g
                transform={`translate(${carX}, ${carY})`}
                className="transition-transform duration-500 ease-out"
              >
                {/* Radar ripple rings */}
                <circle r="22" fill="#10b981" opacity="0.2" className="animate-ping" />
                <circle r="16" fill="#047857" opacity="0.6" />
                <circle r="12" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                {/* Car Icon Silhouette */}
                <path
                  d="M -6,-2 L -4,-6 L 4,-6 L 6,-2 L 7,2 L 6,5 L -6,5 L -7,2 Z"
                  fill="#ffffff"
                />
                <circle cx="-4" cy="4" r="1.5" fill="#10b981" />
                <circle cx="4" cy="4" r="1.5" fill="#10b981" />
                {/* Car Label */}
                <rect x="-35" y="-32" width="70" height="18" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                <text x="0" y="-20" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Driver's Car
                </text>
              </g>
            )}
          </svg>

          {/* Floating Telemetry Heads-Up-Display (HUD) */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 text-white text-xs shadow-xl space-y-2 pointer-events-none">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Vehicle Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT SPEED</span>
                <span className="font-mono text-base font-bold text-white">
                  {currentSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ESTIMATED ETA</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  {etaMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1">
              <span>Progress: {Math.round(carProgress)}%</span>
              <span>78 / 148 km</span>
            </div>
          </div>

          {/* Route Optimization Badge Floating */}
          {routeOptimizationApplied && (
            <div className="absolute top-4 right-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] px-3 py-1.5 rounded-xl font-medium shadow-lg backdrop-blur-sm flex items-center gap-2 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Expressway Fastag Bypass Active (-18 mins)
            </div>
          )}
        </div>

        {/* Action Bar & Trip Controls */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Driver & Vehicle Details */}
            <div className="flex items-center gap-3">
              <img
                src={ride.driverAvatar}
                alt={ride.driverName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">{ride.driverName}</span>
                  <span className="text-emerald-700 bg-emerald-100 p-0.5 rounded-full" title="Verified Driver">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono">{ride.vehicleDetails}</div>
                <div className="text-xs text-slate-500">Rating: ★ {ride.driverRating}</div>
              </div>
            </div>

            {/* Co-travellers in this vehicle */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Co-travellers ({confirmedPassengers.length} booked)
              </div>
              {confirmedPassengers.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {confirmedPassengers.map((psg) => (
                    <div
                      key={psg.id}
                      className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-xl text-xs"
                    >
                      <img
                        src={psg.passengerAvatar}
                        alt={psg.passengerName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-800">{psg.passengerName}</span>
                      <span className="text-[10px] text-slate-500">({psg.seatsRequested} seat)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400">No passengers booked yet.</div>
              )}
            </div>

            {/* Ride Controls: Start / End Ride Flow */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleShareTrip}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? 'Copied' : 'Share Trip'}
              </button>

              {/* Start Ride Button (for driver if scheduled) */}
              {isScheduled && isDriverView && (
                <button
                  onClick={() => startRide(ride.id)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <Navigation className="w-4 h-4" />
                  Start Ride (GPS ON)
                </button>
              )}

              {/* Passenger Scheduled Badge */}
              {isScheduled && !isDriverView && (
                <div className="px-4 py-2 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Departure: {ride.departureTime || 'Scheduled'}
                </div>
              )}

              {/* End Ride Button (for driver if active) */}
              {isRideActive && isDriverView && (
                <button
                  onClick={() => endRide(ride.id)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <Flag className="w-4 h-4 text-emerald-400" />
                  End Ride (Destination Reached)
                </button>
              )}

              {/* Passenger In-Transit Badge */}
              {isRideActive && !isDriverView && (
                <div className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  In Transit • Live GPS Active
                </div>
              )}

              {isCompleted && (
                <div className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Ride Completed & Deposit Refunded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Protocol Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900">Live GPS Encryption</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Location is shared strictly during active trips and immediately terminated upon completion.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900">Route Monitoring</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Automated safety system monitors deviations without falsely accusing the car owner.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900">112 SOS Dispatch</h5>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Instant one-tap emergency link to police control room & personal emergency contacts.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        ride={ride}
        user={currentUser}
      />
    </div>
  );
};
