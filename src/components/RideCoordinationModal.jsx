import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Phone,
  MessageSquare,
  Send,
  Navigation,
  Share2,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Users,
  Car,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  LocateFixed
} from 'lucide-react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

// Common landmarks by city for quick 1-click pickup point selection
const CITY_LANDMARKS = {
  latur: [
    { name: 'Shivaji Chowk, Latur', coords: [18.4088, 76.5604] },
    { name: 'Central Bus Stand (MSRTC), Latur', coords: [18.4035, 76.5721] },
    { name: 'Latur Railway Station (Station Rd)', coords: [18.4112, 76.5815] },
    { name: 'Gandhi Market Chowk, Latur', coords: [18.4012, 76.5654] },
    { name: 'Dayanand College Corner, Latur', coords: [18.414, 76.57] },
    { name: 'Ambajogai Highway Toll, Latur', coords: [18.431, 76.552] }
  ],
  pune: [
    { name: 'Swargate Bus Stand, Pune', coords: [18.5018, 73.8636] },
    { name: 'Hadapsar Gadital, Pune', coords: [18.502, 73.927] },
    { name: 'Pune Railway Station, Pune', coords: [18.5284, 73.8744] },
    { name: 'Viman Nagar / Phoenix, Pune', coords: [18.5615, 73.9168] },
    { name: 'Wakad / Hinjawadi Bridge, Pune', coords: [18.5987, 73.7635] },
    { name: 'Katraj Chowk, Pune', coords: [18.4575, 73.8677] }
  ],
  mumbai: [
    { name: 'Dadar TT Circle, Mumbai', coords: [19.0178, 72.8478] },
    { name: 'Vashi Highway Toll Plaza, Navi Mumbai', coords: [19.0771, 72.9986] },
    { name: 'Thane Teen Hath Naka, Thane', coords: [19.186, 72.9754] },
    { name: 'Andheri East Station, Mumbai', coords: [19.1197, 72.8464] }
  ]
};

export const RideCoordinationModal = ({
  isOpen,
  onClose,
  booking,
  ride,
  isDriverView = false,
  onSwitchToLiveMap
}) => {
  const {
    currentUser,
    currentRole,
    sendBookingMessage,
    updateExactPickupSpot,
    verifyBoardingPin,
    startRide,
    triggerToast
  } = useApp();

  // Default to 'verify' for driver, 'pass_map' (PIN + Map together) for passenger
  const [activeTab, setActiveTab] = useState(isDriverView ? 'verify' : 'pass_map');

  useEffect(() => {
    setActiveTab(isDriverView ? 'verify' : 'pass_map');
  }, [isDriverView, isOpen]);

  const [pinInput, setPinInput] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [copiedPin, setCopiedPin] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Derive initial pickup coordinates
  const currentPickupSpot = booking?.exactPickupSpot || {
    address: booking?.pickupPoint || `${booking?.from || 'City'} Center`,
    coordinates: ride?.fromCoordinates || [18.4088, 76.5604],
    updatedBy: 'system',
    updatedAt: booking?.requestedAt || new Date().toISOString()
  };

  useEffect(() => {
    if (booking?.exactPickupSpot?.address) {
      setCustomAddress(booking.exactPickupSpot.address);
      if (booking.exactPickupSpot.coordinates) {
        setSelectedCoords(booking.exactPickupSpot.coordinates);
      }
    } else if (booking?.pickupPoint) {
      setCustomAddress(booking.pickupPoint);
    }
  }, [booking?.exactPickupSpot, booking?.pickupPoint]);

  // Scroll chat to bottom when new messages arrive or when opening chat tab
  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, booking?.chatMessages]);

  // Initialize or update Leaflet Map (active in 'pass_map' for passenger, 'map' for driver)
  useEffect(() => {
    const isMapActive = isDriverView ? activeTab === 'map' : activeTab === 'pass_map';
    if (!isOpen || !isMapActive || !mapContainerRef.current) return;

    const baseCoords =
      selectedCoords ||
      booking?.exactPickupSpot?.coordinates ||
      ride?.fromCoordinates ||
      [18.4088, 76.5604];

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: baseCoords,
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Custom emerald pickup pin icon with pulsing radar
      const customPinIcon = L.divIcon({
        className: 'custom-coordination-pin',
        html: `
          <div style="position: relative; width: 42px; height: 42px; transform: translate(-50%, -50%);">
            <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 38px; height: 38px; background: #059669; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); color: #ffffff;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      const marker = L.marker(baseCoords, {
        icon: customPinIcon,
        draggable: true
      }).addTo(map);

      marker.bindPopup(`<b>Exact Pickup Spot</b><br/>${currentPickupSpot.address || 'Click or drag to relocate'}`).openPopup();

      // Click anywhere on map to reposition pickup point
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedCoords([lat, lng]);
        setCustomAddress(`Location Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        marker.setPopupContent(`<b>Selected Pickup Spot</b><br/>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`).openPopup();
      });

      // Drag marker
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setSelectedCoords([pos.lat, pos.lng]);
        setCustomAddress(`Location Pin (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
        marker.setPopupContent(`<b>Selected Pickup Spot</b><br/>Lat: ${pos.lat.toFixed(4)}, Lng: ${pos.lng.toFixed(4)}`).openPopup();
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Force recalculation of container size after modal layout settles
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    } catch (err) {
      console.warn('[Leaflet Init Warning]:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen || !booking) return null;

  if (booking.status === 'completed' || ride?.status === 'completed') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Ride Completed! 🎉</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This trip for <strong>{booking.from} → {booking.to}</strong> has been safely completed.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Return to Normal Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Contact targets
  const otherPartyName = isDriverView ? booking.passengerName : (ride?.driverName || booking.driverName || 'Driver');
  const otherPartyPhone = isDriverView
    ? (booking.passengerPhone || '9123456780')
    : (booking.driverPhone || ride?.driverPhone || '9876543210');
  const cleanPhone = String(otherPartyPhone).replace(/[^0-9]/g, '');

  const whatsappMessage = encodeURIComponent(
    `Hello ${otherPartyName}! I am ${currentUser?.name || (isDriverView ? 'your driver' : 'your co-traveller')} for the ride ${booking.from} to ${booking.to}. Let's coordinate pickup!`
  );

  const handleCopyPin = () => {
    if (booking.boardingPin) {
      navigator.clipboard?.writeText?.(booking.boardingPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
      triggerToast('PIN Copied', `Boarding PIN ${booking.boardingPin} copied to clipboard.`, 'info');
    }
  };

  const handleVerifyPin = async () => {
    if (!pinInput || pinInput.length < 4) {
      triggerToast('PIN Required', 'Please enter the 4-digit PIN provided by passenger.', 'warning');
      return;
    }

    setVerifyingPin(true);
    const res = await verifyBoardingPin(booking.id, pinInput);
    setVerifyingPin(false);
    if (res.success) {
      setPinInput('');
    }
  };

  const handleStartTrip = async () => {
    if (!ride) return;
    await startRide(ride.id);
    onClose();
    if (onSwitchToLiveMap) {
      onSwitchToLiveMap();
    }
  };

  const handleViewLiveRoute = () => {
    onClose();
    if (onSwitchToLiveMap) {
      onSwitchToLiveMap();
    }
  };

  const handlePickLandmark = (landmark) => {
    setCustomAddress(landmark.name);
    setSelectedCoords(landmark.coords);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(landmark.coords, 15);
      markerRef.current.setLatLng(landmark.coords);
      markerRef.current.setPopupContent(`<b>${landmark.name}</b>`).openPopup();
    }
  };

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      triggerToast('GPS Unavailable', 'Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocatingGps(false);
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        setSelectedCoords(coords);
        setCustomAddress(`My Live Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView(coords, 16);
          markerRef.current.setLatLng(coords);
          markerRef.current.setPopupContent(`<b>Your Live GPS Location</b><br/>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`).openPopup();
        }
        triggerToast('GPS Located', 'Centered map on your current GPS location.', 'success');
      },
      (error) => {
        setLocatingGps(false);
        triggerToast('GPS Error', error.message || 'Failed to retrieve GPS location.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSavePickupSpot = async (e) => {
    e.preventDefault();
    if (!customAddress.trim()) {
      triggerToast('Address Required', 'Please enter or select a pickup landmark.', 'warning');
      return;
    }

    const coords = selectedCoords || currentPickupSpot.coordinates || [18.4088, 76.5604];
    await updateExactPickupSpot(booking.id, {
      address: customAddress.trim(),
      coordinates: coords
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    await sendBookingMessage(booking.id, text);
  };

  const handleQuickSend = async (presetText) => {
    await sendBookingMessage(booking.id, presetText);
  };

  // Find relevant landmarks for quick-pills based on ride route
  const fromLower = (booking.from || '').toLowerCase();
  const landmarksForCity =
    CITY_LANDMARKS[fromLower] ||
    (fromLower.includes('latur') ? CITY_LANDMARKS.latur : CITY_LANDMARKS.pune);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {booking.from} → {booking.to}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Confirmed & Connected
                </span>
                {booking.boardingVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    Boarded ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isDriverView ? 'Co-Traveller Verification & Coordination Hub' : 'Driver Coordination & Pickup Hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Boarding PIN Badge (Passenger Only - Hidden from Driver) */}
            {!isDriverView && booking.boardingPin && (
              <div
                onClick={handleCopyPin}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer transition text-xs"
                title="Click to copy Boarding PIN"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">PIN:</span>
                <span className="font-mono font-bold text-amber-300 tracking-wider">
                  {booking.boardingPin}
                </span>
                {copiedPin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Co-Traveller / Driver Mutual Recognition Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={
                isDriverView
                  ? booking.passengerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(booking.passengerName)}`
                  : ride?.driverAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ride?.driverName || 'Driver')}`
              }
              alt={otherPartyName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-400 block">
                  {isDriverView ? 'Co-Traveller' : 'Verified Car Owner'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">{otherPartyName}</h3>
              <p className="text-xs text-slate-500">
                {isDriverView ? (
                  <>
                    Requested <strong className="text-slate-700">{booking.seatsRequested} seat(s)</strong> • Fuel contribution:{' '}
                    <strong className="text-emerald-700">₹{booking.totalSharedContribution}</strong>
                  </>
                ) : (
                  <>
                    Vehicle: <strong className="text-slate-700">{ride?.vehicleDetails || 'Maruti Grand Vitara (White) • MH-12-SG-1983'}</strong>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Direct Contact Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4" />
              Call ({otherPartyPhone})
            </a>

            <a
              href={`https://wa.me/91${cleanPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Tab Controls: Verification vs Interactive Map vs Live Chat */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 shrink-0 overflow-x-auto">
          {isDriverView ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('verify')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'verify'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Verify Passenger PIN
                {booking.boardingVerified ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    ✓
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'map'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Pickup Map & Route
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 relative ${
                  activeTab === 'chat'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Passenger
                {booking.chatMessages && booking.chatMessages.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                    {booking.chatMessages.length}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('pass_map')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'pass_map'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Boarding PIN & Pickup Map
                {booking.boardingVerified ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-black border border-amber-300">
                    PIN: {booking.boardingPin}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition shrink-0 relative ${
                  activeTab === 'chat'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Driver
                {booking.chatMessages && booking.chatMessages.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                    {booking.chatMessages.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* DRIVER VIEW: TAB 1 - VERIFY PASSENGER PIN (Driver DOES NOT see the secret code) */}
          {isDriverView && activeTab === 'verify' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                    <KeyRound className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Verify Passenger Boarding PIN
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ask <strong>{booking.passengerName}</strong> for the 4-digit Boarding PIN shown on their phone screen. Enter it here to confirm boarding.
                    </p>
                  </div>
                </div>

                {!booking.boardingVerified ? (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <label className="text-xs font-bold text-slate-700 block">
                      Enter 4-Digit Boarding PIN from Passenger:
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 8429"
                        className="w-full sm:w-44 text-center text-2xl font-mono font-black tracking-widest px-4 py-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 rounded-2xl outline-none"
                      />

                      <button
                        type="button"
                        onClick={handleVerifyPin}
                        disabled={pinInput.length < 4 || verifyingPin}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {verifyingPin ? 'Verifying...' : 'Verify Passenger PIN'}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      💡 Passenger has the 4-digit PIN on their screen with the pickup map. Once passenger boards, ask them for the PIN.
                    </p>
                  </div>
                ) : (
                  /* BOARDING VERIFIED */
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-emerald-950">
                          Passenger Verified & Safely Boarded! ✅
                        </h4>
                        <p className="text-xs text-emerald-800">
                          {booking.passengerName} has boarded your vehicle. Both parties are matched.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-emerald-900 font-medium">
                        Ready to begin journey to <strong>{booking.to}</strong>. Real-time GPS navigation will turn ON.
                      </div>

                      <button
                        type="button"
                        onClick={handleStartTrip}
                        className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition"
                      >
                        <Navigation className="w-4 h-4" />
                        🚀 Start Ride / Begin Highway Journey
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DRIVER VIEW: TAB 2 - INTERACTIVE PICKUP MAP */}
          {isDriverView && activeTab === 'map' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    📍
                  </div>
                  <div>
                    <span className="font-bold">Passenger Pickup Location: </span>
                    Passenger spot and highway landmarks.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetGpsLocation}
                  disabled={locatingGps}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-xl shadow-xs flex items-center gap-1.5 transition shrink-0"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${locatingGps ? 'animate-spin' : ''}`} />
                  {locatingGps ? 'Locating...' : 'My Location'}
                </button>
              </div>

              {/* Map Canvas */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 h-[280px] sm:h-[320px]">
                <div ref={mapContainerRef} className="w-full h-full z-10" />
              </div>

              {/* Quick Landmark Chips */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                  Popular Landmarks in {booking.from}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {landmarksForCity.map((lm, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePickLandmark(lm)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition flex items-center gap-1.5 ${
                        customAddress === lm.name
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      {lm.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Address Input & Save Form */}
              <form onSubmit={handleSavePickupSpot} className="space-y-3 pt-2">
                <label className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                  Pickup Spot Address / Landmark:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="e.g. Shivaji Chowk Near Central Bank ATM, Latur"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm font-medium outline-none transition"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    Save Pickup Spot
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Current spot: <strong>{currentPickupSpot.address}</strong></span>
                  {currentPickupSpot.updatedBy && currentPickupSpot.updatedBy !== 'system' && (
                    <span className="text-emerald-700">Updated by {currentPickupSpot.updatedBy}</span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* PASSENGER VIEW: TAB 1 - BOARDING PIN AND INTERACTIVE MAP TOGETHER ON ONE SCREEN! */}
          {!isDriverView && activeTab === 'pass_map' && (
            <div className="space-y-6">
              {/* Section 1: Passenger Boarding Pass Card with 4-Digit PIN */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-200">
                    Passenger Boarding Pass
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                    {booking.from} → {booking.to}
                  </span>
                </div>

                <div className="text-center py-2 space-y-2">
                  <span className="text-xs text-emerald-100 font-semibold block">
                    Show or tell this 4-Digit PIN to Driver {otherPartyName} upon boarding:
                  </span>
                  <div className="inline-flex items-center gap-3 bg-slate-950/40 px-6 py-3 rounded-2xl border-2 border-white/30 backdrop-blur-md">
                    <KeyRound className="w-7 h-7 text-amber-300" />
                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-amber-300">
                      {booking.boardingPin || '8429'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPin}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition ml-1"
                      title="Copy Boarding PIN"
                    >
                      {copiedPin ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-200 max-w-md mx-auto">
                    Driver will enter this PIN to verify that you are the confirmed passenger before starting the ride.
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/20 space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-300" />
                    Verify Your Car & Driver:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-100">
                    <div>Driver: <strong className="text-white">{otherPartyName}</strong></div>
                    <div>Phone: <strong className="text-white">{otherPartyPhone}</strong></div>
                    <div>Car: <strong className="text-white">{ride?.vehicleDetails || 'Maruti Grand Vitara (White) • MH-12-SG-1983'}</strong></div>
                    <div>Pickup: <strong className="text-white">{booking.exactPickupSpot?.address || booking.pickupPoint}</strong></div>
                  </div>
                </div>
              </div>

              {/* Verification Status Card */}
              <div className={`p-4 rounded-2xl border-2 transition ${
                booking.boardingVerified
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                {booking.boardingVerified ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-950">
                          Boarding Verified by Driver! ✅
                        </h4>
                        <p className="text-[11px] text-emerald-800">
                          You and driver {otherPartyName} have mutually verified boarding.
                        </p>
                      </div>
                    </div>

                    {ride?.status === 'in_progress' ? (
                      <button
                        type="button"
                        onClick={handleViewLiveRoute}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition shrink-0"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        View Live Route Map
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-800 font-medium">
                        Driver will now start the trip. Live route map will open automatically.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold animate-pulse shrink-0 text-sm">
                      ⏳
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        Waiting for Driver to verify PIN...
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        When you reach the vehicle, tell driver {otherPartyName} your PIN <strong>{booking.boardingPin}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Interactive Pickup Spot & Route Map (Together with PIN!) */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                      📍
                    </div>
                    <div>
                      <span className="font-bold">Your Pickup Spot & Map: </span>
                      Click anywhere on the map to set your location or choose a landmark below.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={locatingGps}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-xl shadow-xs flex items-center gap-1.5 transition shrink-0"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${locatingGps ? 'animate-spin' : ''}`} />
                    {locatingGps ? 'Locating...' : 'Use My GPS'}
                  </button>
                </div>

                {/* Map Canvas */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 h-[280px] sm:h-[320px]">
                  <div ref={mapContainerRef} className="w-full h-full z-10" />
                </div>

                {/* Quick Landmark Chips */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                    Popular Pickup Landmarks in {booking.from}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {landmarksForCity.map((lm, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePickLandmark(lm)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition flex items-center gap-1.5 ${
                          customAddress === lm.name
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {lm.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Address Input & Save Form */}
                <form onSubmit={handleSavePickupSpot} className="space-y-3 pt-1">
                  <label className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                    Exact Pickup Instructions for Driver:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="e.g. Shivaji Chowk Near Central Bank ATM, Latur"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm font-medium outline-none transition"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      Save Pickup Spot
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Current spot: <strong>{currentPickupSpot.address}</strong></span>
                    {currentPickupSpot.updatedBy && currentPickupSpot.updatedBy !== 'system' && (
                      <span className="text-emerald-700">Updated by {currentPickupSpot.updatedBy}</span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE IN-APP CHAT & QUICK UPDATES */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[380px] sm:h-[420px]">
              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {(!booking.chatMessages || booking.chatMessages.length === 0) ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No messages yet. Send a quick message to coordinate your trip!
                  </div>
                ) : (
                  booking.chatMessages.map((msg) => {
                    const isSystem = msg.senderRole === 'system';
                    const isMe = msg.senderId === currentUser?.id || (msg.senderRole === currentRole);

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <span className="px-3 py-1 bg-slate-200/80 text-slate-700 rounded-full text-[11px] font-medium max-w-md text-center">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                          <span className="font-semibold text-slate-600">{msg.senderName}</span>
                          <span>•</span>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium shadow-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="pt-2 pb-1 overflow-x-auto flex items-center gap-1.5 text-xs">
                {[
                  'I am waiting at the pickup spot.',
                  'On my way, arriving in 5 mins.',
                  'Where are you standing exactly?',
                  'Car is White Maruti Grand Vitara.',
                  'Reached the location!'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickSend(preset)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap text-[11px] transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Message ${otherPartyName}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 rounded-xl text-xs sm:text-sm outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Security & Escrow Note */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Driver Refundable Deposit of <strong>₹{ride?.cancellationDeposit || 250}</strong> held in Escrow by Platform.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isDriverView ? (
              <>
                <span className="text-slate-400">Your Boarding PIN:</span>
                <span className="font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {booking.boardingPin || '8429'}
                </span>
              </>
            ) : (
              <span className="text-slate-400 font-medium">
                Passenger will tell you their 4-digit Boarding PIN upon arrival
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
