import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_DRIVERS,
  INITIAL_PASSENGERS,
  INITIAL_ADMIN,
  INITIAL_RIDES,
  INITIAL_BOOKINGS,
  INITIAL_CANCELLATIONS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import {
  DESIGNATED_ADMIN,
  issueAdminToken,
  validateAdminToken,
  revokeAdminToken,
  authorizeAdminOperation,
  enforceSingleAdminRole
} from '../services/adminAuthService';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  DRIVERS: 'ridesharex_drivers_v1',
  PASSENGERS: 'ridesharex_passengers_v1',
  RIDES: 'ridesharex_rides_v1',
  BOOKINGS: 'ridesharex_bookings_v1',
  CANCELLATIONS: 'ridesharex_cancellations_v1',
  NOTIFICATIONS: 'ridesharex_notifications_v1',
  ROLE: 'ridesharex_current_role_v1',
  USER_ID: 'ridesharex_current_user_id_v1',
  ACTIVE_TAB: 'ridesharex_active_tab_v1'
};

export const AppProvider = ({ children }) => {
  // Load from localStorage or fallback to initial data - strictly sanitized to prevent privilege escalation
  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    const raw = saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    return enforceSingleAdminRole(raw, []).drivers;
  });

  const [passengers, setPassengers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSENGERS);
    const raw = saved ? JSON.parse(saved) : INITIAL_PASSENGERS;
    return enforceSingleAdminRole([], raw).passengers;
  });

  // Exactly one permanent designated admin account
  const [admin] = useState(DESIGNATED_ADMIN);

  const [rides, setRides] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RIDES);
    return saved ? JSON.parse(saved) : INITIAL_RIDES;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [cancellations, setCancellations] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANCELLATIONS);
    return saved ? JSON.parse(saved) : INITIAL_CANCELLATIONS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Admin authentication state (strictly verified via signed token)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return validateAdminToken().authorized;
  });

  // Global search parameters passed between homepage and search page
  const [globalSearch, setGlobalSearch] = useState({
    from: '',
    to: '',
    date: '',
    seats: 1
  });

  // Current session role: 'guest' | 'driver' | 'passenger' | 'admin'
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (saved === 'admin') {
      const validation = validateAdminToken();
      return validation.authorized ? 'admin' : 'guest';
    }
    return saved || 'guest';
  });

  // Current logged in user ID
  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID) || 'drv-1';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'home';
  });

  // Currently inspected ride (for details modal or active live tracking)
  const [selectedRideId, setSelectedRideId] = useState('ride-102');
  // Route deviation alert state
  const [routeDeviationTriggered, setRouteDeviationTriggered] = useState(false);
  // Route optimization applied state
  const [routeOptimizationApplied, setRouteOptimizationApplied] = useState(false);
  // Toast notification banner state
  const [activeToast, setActiveToast] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PASSENGERS, JSON.stringify(passengers));
  }, [passengers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RIDES, JSON.stringify(rides));
  }, [rides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANCELLATIONS, JSON.stringify(cancellations));
  }, [cancellations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // Derived current user object
  const currentUser = React.useMemo(() => {
    if (currentRole === 'driver') {
      return drivers.find(d => d.id === currentUserId) || drivers[0];
    }
    if (currentRole === 'passenger') {
      return passengers.find(p => p.id === currentUserId) || passengers[0];
    }
    if (currentRole === 'admin') {
      return admin;
    }
    return null;
  }, [currentRole, currentUserId, drivers, passengers, admin]);

  // Add toast notification helper
  const triggerToast = (title, message, type = 'info') => {
    setActiveToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setActiveToast(prev => (prev?.title === title ? null : prev));
    }, 4500);
  };

  // Switch role and set user
  const switchRole = (newRole, targetUserId = null) => {
    if (newRole === 'driver') {
      setCurrentRole('driver');
      const selectedDriver = targetUserId
        ? drivers.find(d => d.id === targetUserId)
        : drivers[0];
      setCurrentUserId(selectedDriver?.id || 'drv-1');
      setActiveTab('driver_dashboard');
    } else if (newRole === 'passenger') {
      setCurrentRole('passenger');
      const selectedPassenger = targetUserId
        ? passengers.find(p => p.id === targetUserId)
        : passengers[0];
      setCurrentUserId(selectedPassenger?.id || 'psg-1');
      setActiveTab('passenger_dashboard');
    } else if (newRole === 'admin') {
      const validation = validateAdminToken();
      if (validation.authorized) {
        setCurrentRole('admin');
        setCurrentUserId(DESIGNATED_ADMIN.id);
        setActiveTab('admin_dashboard');
      } else {
        // Strict guard: NEVER assign admin role without validated token!
        setCurrentRole('guest');
        setActiveTab('admin_auth');
        triggerToast('Admin Authorization Required (403)', 'Please log in with the designated administrator account.', 'warning');
      }
    } else {
      setCurrentRole('guest');
      setActiveTab('home');
    }
  };

  // Authenticate driver
  const loginDriver = (driverId) => {
    setCurrentRole('driver');
    setCurrentUserId(driverId);
    setActiveTab('driver_dashboard');
    triggerToast('Driver Login Successful', 'Welcome to your Driver Dashboard', 'success');
  };

  // Authenticate passenger
  const loginPassenger = (passengerId) => {
    setCurrentRole('passenger');
    setCurrentUserId(passengerId);
    setActiveTab('passenger_dashboard');
    triggerToast('Passenger Login Successful', 'Welcome to your Passenger Dashboard', 'success');
  };

  // Authenticate admin strictly against designated administrator account
  const loginAdmin = (inputEmail, inputPassword) => {
    const result = issueAdminToken(inputEmail, inputPassword);
    if (result.success) {
      setCurrentRole('admin');
      setCurrentUserId(DESIGNATED_ADMIN.id);
      setIsAdminAuthenticated(true);
      setActiveTab('admin_dashboard');
      triggerToast('Admin Authentication Verified', 'Welcome back, Platform Administrator.', 'success');
      return { success: true };
    } else {
      triggerToast('Access Denied (403)', result.error, 'error');
      return { success: false, error: result.error };
    }
  };

  // Update master admin credentials (protected by database authorization guard)
  const updateAdminCredentials = (newEmail, newPassword) => {
    const auth = authorizeAdminOperation('updateAdminCredentials');
    if (!auth.authorized) {
      triggerToast('403 Forbidden', auth.error, 'error');
      return { success: false, error: auth.error };
    }

    localStorage.setItem('ridesharex_master_admin_pwd', newPassword.trim());
    triggerToast('Master Password Updated', 'Designated administrator password has been updated.', 'success');
    return { success: true };
  };

  // Sign out
  const logout = () => {
    revokeAdminToken();
    setIsAdminAuthenticated(false);
    setCurrentRole('guest');
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    setActiveTab('home');
    triggerToast('Signed Out', 'You have been signed out safely.', 'info');
  };

  // Submit Driver Verification
  const submitDriverVerification = (driverId, verificationPayload) => {
    setDrivers(prev =>
      prev.map(drv => {
        if (drv.id === driverId) {
          return {
            ...drv,
            verificationStatus: 'pending',
            vehicle: verificationPayload.vehicle,
            verificationDoc: {
              ...verificationPayload.verificationDoc,
              submittedAt: new Date().toISOString()
            }
          };
        }
        return drv;
      })
    );

    // Notify Driver
    const newNotifDriver = {
      id: `notif-${Date.now()}-drv`,
      targetUserId: driverId,
      role: 'driver',
      title: 'Verification Request Submitted',
      message: 'Your vehicle and driver documents have been submitted to Admin for approval.',
      time: 'Just now',
      type: 'verification_pending',
      read: false
    };

    // Notify Admin
    const newNotifAdmin = {
      id: `notif-${Date.now()}-adm`,
      targetUserId: 'adm-1',
      role: 'admin',
      title: 'New Driver Verification Request',
      message: `${currentUser?.name || 'Driver'} submitted registration documents for review.`,
      time: 'Just now',
      type: 'verification_review',
      read: false
    };

    setNotifications(prev => [newNotifDriver, newNotifAdmin, ...prev]);
    triggerToast('Verification Submitted', 'Status updated to Pending. Admin will review.', 'success');
  };

  // Admin: Approve Driver (Guarded by Backend / Database Authorization)
  const approveDriverVerification = (driverId) => {
    const auth = authorizeAdminOperation('approveDriverVerification');
    if (!auth.authorized) {
      triggerToast('403 Forbidden', auth.error, 'error');
      return false;
    }

    setDrivers(prev =>
      prev.map(drv => {
        if (drv.id === driverId) {
          return {
            ...drv,
            verificationStatus: 'verified',
            verificationDoc: {
              ...drv.verificationDoc,
              verifiedAt: new Date().toISOString()
            }
          };
        }
        return drv;
      })
    );

    const targetDriver = drivers.find(d => d.id === driverId);
    const newNotif = {
      id: `notif-${Date.now()}`,
      targetUserId: driverId,
      role: 'driver',
      title: 'Driver Verification Approved! 🎉',
      message: `Your driver profile and vehicle documents are verified. You can now create and publish rides.`,
      time: 'Just now',
      type: 'verification_approved',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast('Driver Approved', `${targetDriver?.name || 'Driver'} is now Verified!`, 'success');
    return true;
  };

  // Admin: Reject Driver (Guarded by Backend / Database Authorization)
  const rejectDriverVerification = (driverId, reason) => {
    const auth = authorizeAdminOperation('rejectDriverVerification');
    if (!auth.authorized) {
      triggerToast('403 Forbidden', auth.error, 'error');
      return false;
    }

    setDrivers(prev =>
      prev.map(drv => {
        if (drv.id === driverId) {
          return {
            ...drv,
            verificationStatus: 'rejected',
            rejectionReason: reason || 'Documents could not be verified'
          };
        }
        return drv;
      })
    );

    const targetDriver = drivers.find(d => d.id === driverId);
    const newNotif = {
      id: `notif-${Date.now()}`,
      targetUserId: driverId,
      role: 'driver',
      title: 'Verification Requires Attention',
      message: `Verification was rejected: ${reason || 'Incomplete or unclear documentation'}. Please resubmit.`,
      time: 'Just now',
      type: 'verification_rejected',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast('Driver Rejected', `${targetDriver?.name || 'Driver'} status updated to Rejected.`, 'warning');
    return true;
  };

  // Admin: Request Re-verification (Guarded by Backend / Database Authorization)
  const requestReverification = (driverId, reason) => {
    const auth = authorizeAdminOperation('requestReverification');
    if (!auth.authorized) {
      triggerToast('403 Forbidden', auth.error, 'error');
      return false;
    }

    setDrivers(prev =>
      prev.map(drv => {
        if (drv.id === driverId) {
          return {
            ...drv,
            verificationStatus: 'not_verified',
            reverificationNote: reason || 'Please upload updated registration certificate'
          };
        }
        return drv;
      })
    );

    const newNotif = {
      id: `notif-${Date.now()}`,
      targetUserId: driverId,
      role: 'driver',
      title: 'Re-verification Requested',
      message: `Admin requested document updates: ${reason || 'Please re-verify your vehicle details.'}`,
      time: 'Just now',
      type: 'reverification',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast('Re-verification Sent', 'Driver has been notified to re-verify.', 'info');
    return true;
  };

  // Create Ride (Driver only)
  const createRide = (ridePayload) => {
    const newRideId = `ride-${Date.now()}`;
    const newRide = {
      id: newRideId,
      driverId: currentUser.id,
      driverName: currentUser.name,
      driverAvatar: currentUser.avatar,
      driverRating: currentUser.rating || 5.0,
      driverVerified: currentUser.verificationStatus === 'verified',
      from: ridePayload.from,
      to: ridePayload.to,
      fromCoordinates: ridePayload.fromCoordinates || [18.4088, 76.5604],
      toCoordinates: ridePayload.toCoordinates || [18.5204, 73.8567],
      date: ridePayload.date,
      departureTime: ridePayload.departureTime,
      estimatedArrivalTime: ridePayload.estimatedArrivalTime,
      estimatedDuration: ridePayload.estimatedDuration || '4h 30m',
      vehicleType: ridePayload.vehicleType || '5-Seater',
      vehicleDetails: `${currentUser.vehicle?.make || 'Car'} ${currentUser.vehicle?.model || ''} • ${currentUser.vehicle?.plateNumber || 'MH-12-PQ-9876'}`,
      totalSeats: parseInt(ridePayload.totalSeats || 5),
      availableSeats: parseInt(ridePayload.availableSeats || 2),
      totalPassengerSeatsAllowed: parseInt(ridePayload.availableSeats || 2),
      sharedCostPerSeat: parseFloat(ridePayload.sharedCostPerSeat || 300),
      costBreakdown: ridePayload.costBreakdown || {
        estimatedFuel: Math.round(parseFloat(ridePayload.sharedCostPerSeat || 300) * 0.6),
        highwayTolls: Math.round(parseFloat(ridePayload.sharedCostPerSeat || 300) * 0.4),
        note: 'Driver recovers fuel & toll cost only. No commercial profit.'
      },
      cancellationDeposit: parseFloat(ridePayload.cancellationDeposit || 250),
      depositStatus: 'escrowed',
      pickupDropPoints: ridePayload.pickupDropPoints || [
        { type: 'pickup', point: `${ridePayload.from} Highway Chowk`, time: ridePayload.departureTime },
        { type: 'dropoff', point: `${ridePayload.to} Main Terminal`, time: ridePayload.estimatedArrivalTime }
      ],
      description: ridePayload.description || 'Travelling on this route. Sharing seats to split fuel and highway tolls.',
      status: 'scheduled',
      routeOptimized: false,
      routeDeviationDetected: false,
      activeLocation: null
    };

    setRides(prev => [newRide, ...prev]);

    // Notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      targetUserId: currentUser.id,
      role: 'driver',
      title: 'Ride Published Successfully! 🚗',
      message: `Your ride from ${newRide.from} to ${newRide.to} with ${newRide.availableSeats} available seats is now live. Refundable deposit of ₹${newRide.cancellationDeposit} held in escrow.`,
      time: 'Just now',
      type: 'ride_published',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast('Ride Published', `Ride from ${newRide.from} to ${newRide.to} is now open for bookings!`, 'success');
    return newRideId;
  };

  // Passenger: Request Booking
  const requestBooking = (rideId, seatsRequested, pickupPoint, notes) => {
    const targetRide = rides.find(r => r.id === rideId);
    if (!targetRide) return;

    if (seatsRequested > targetRide.availableSeats) {
      triggerToast('Seat Unavailable', `Only ${targetRide.availableSeats} seat(s) available.`, 'error');
      return;
    }

    const bookingId = `bkg-${Date.now()}`;
    const totalCost = targetRide.sharedCostPerSeat * seatsRequested;

    const newBooking = {
      id: bookingId,
      rideId: rideId,
      passengerId: currentUser.id,
      passengerName: currentUser.name,
      passengerPhone: currentUser.phone,
      passengerAvatar: currentUser.avatar,
      seatsRequested: seatsRequested,
      from: targetRide.from,
      to: targetRide.to,
      pickupPoint: pickupPoint || targetRide.pickupDropPoints[0]?.point || targetRide.from,
      dropoffPoint: targetRide.pickupDropPoints[targetRide.pickupDropPoints.length - 1]?.point || targetRide.to,
      totalSharedContribution: totalCost,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      notes: notes || 'Looking forward to travelling together!'
    };

    setBookings(prev => [newBooking, ...prev]);

    // Notify Driver
    const notifDriver = {
      id: `notif-${Date.now()}-drv`,
      targetUserId: targetRide.driverId,
      role: 'driver',
      title: 'New Booking Request Received',
      message: `${currentUser.name} requested ${seatsRequested} seat(s) for ${targetRide.from} → ${targetRide.to}. Please Accept or Reject.`,
      time: 'Just now',
      type: 'booking_request',
      read: false
    };

    // Notify Passenger
    const notifPassenger = {
      id: `notif-${Date.now()}-psg`,
      targetUserId: currentUser.id,
      role: 'passenger',
      title: 'Booking Request Submitted',
      message: `Your request for ${seatsRequested} seat(s) on ${targetRide.from} → ${targetRide.to} has been sent to ${targetRide.driverName}.`,
      time: 'Just now',
      type: 'booking_submitted',
      read: false
    };

    setNotifications(prev => [notifDriver, notifPassenger, ...prev]);
    triggerToast('Booking Requested', `Sent request for ${seatsRequested} seat(s) to ${targetRide.driverName}.`, 'success');
    return bookingId;
  };

  // Driver: Accept Booking
  const acceptBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Update booking status
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
    );

    // Decrement available seats on the ride
    setRides(prev =>
      prev.map(r => {
        if (r.id === booking.rideId) {
          const newAvailable = Math.max(0, r.availableSeats - booking.seatsRequested);
          return { ...r, availableSeats: newAvailable };
        }
        return r;
      })
    );

    // Notify passenger
    const notifPassenger = {
      id: `notif-${Date.now()}`,
      targetUserId: booking.passengerId,
      role: 'passenger',
      title: 'Booking Confirmed! ✅',
      message: `Your booking for ${booking.seatsRequested} seat(s) on ${booking.from} → ${booking.to} has been accepted. Have a great journey!`,
      time: 'Just now',
      type: 'booking_confirmed',
      read: false
    };

    setNotifications(prev => [notifPassenger, ...prev]);
    triggerToast('Booking Accepted', `Confirmed booking for ${booking.passengerName}. Available seats updated.`, 'success');
  };

  // Driver: Reject Booking
  const rejectBooking = (bookingId, reason = 'Seat occupied by co-traveller') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'rejected', rejectReason: reason } : b))
    );

    const notifPassenger = {
      id: `notif-${Date.now()}`,
      targetUserId: booking.passengerId,
      role: 'passenger',
      title: 'Booking Request Declined',
      message: `Driver could not accommodate the request: ${reason}. You may search for other available rides.`,
      time: 'Just now',
      type: 'booking_rejected',
      read: false
    };

    setNotifications(prev => [notifPassenger, ...prev]);
    triggerToast('Booking Rejected', `Declined request from ${booking.passengerName}.`, 'warning');
  };

  // Driver: Start Ride
  const startRide = (rideId) => {
    setRides(prev =>
      prev.map(r => {
        if (r.id === rideId) {
          return {
            ...r,
            status: 'in_progress',
            activeLocation: {
              latitude: r.fromCoordinates ? r.fromCoordinates[0] : 18.5204,
              longitude: r.fromCoordinates ? r.fromCoordinates[1] : 73.8567,
              heading: 310,
              speedKmH: 65,
              currentMilestone: `Departed from ${r.from}. Cruising on highway.`,
              distanceCoveredKm: 5,
              totalDistanceKm: 180,
              etaMinutes: 160
            }
          };
        }
        return r;
      })
    );

    setSelectedRideId(rideId);

    // Notify all confirmed passengers of this ride
    const confirmedBookings = bookings.filter(b => b.rideId === rideId && b.status === 'confirmed');
    const newNotifs = confirmedBookings.map(b => ({
      id: `notif-${Date.now()}-${b.id}`,
      targetUserId: b.passengerId,
      role: 'passenger',
      title: 'Your Ride Has Started! 🚗',
      message: `Driver has started the trip. Live GPS tracking and safety features are now active.`,
      time: 'Just now',
      type: 'ride_started',
      read: false
    }));

    setNotifications(prev => [...newNotifs, ...prev]);
    triggerToast('Ride Started', 'GPS Live Tracking is now ON! Co-travellers can track route.', 'success');
  };

  // Driver: End Ride
  const endRide = (rideId) => {
    const targetRide = rides.find(r => r.id === rideId);

    setRides(prev =>
      prev.map(r => {
        if (r.id === rideId) {
          return {
            ...r,
            status: 'completed',
            depositStatus: 'refunded',
            activeLocation: null
          };
        }
        return r;
      })
    );

    // Update bookings for this ride to completed
    setBookings(prev =>
      prev.map(b => (b.rideId === rideId && b.status === 'confirmed' ? { ...b, status: 'completed' } : b))
    );

    // Notify driver about cancellation deposit refund
    const notifDriver = {
      id: `notif-${Date.now()}-drv`,
      targetUserId: targetRide?.driverId || currentUser.id,
      role: 'driver',
      title: 'Ride Completed & Deposit Refunded! 💰',
      message: `Destination reached safely. Your refundable cancellation deposit of ₹${targetRide?.cancellationDeposit || 250} has been released back to your account.`,
      time: 'Just now',
      type: 'ride_completed',
      read: false
    };

    // Notify passengers
    const confirmedBookings = bookings.filter(b => b.rideId === rideId && b.status === 'confirmed');
    const psgNotifs = confirmedBookings.map(b => ({
      id: `notif-${Date.now()}-${b.id}`,
      targetUserId: b.passengerId,
      role: 'passenger',
      title: 'Destination Reached! 🎉',
      message: `You have arrived at your destination. Thank you for carpooling with Rideshare_X!`,
      time: 'Just now',
      type: 'ride_completed',
      read: false
    }));

    setNotifications(prev => [notifDriver, ...psgNotifs, ...prev]);
    triggerToast('Ride Completed', 'Live tracking OFF. Driver deposit of ₹250 refunded.', 'success');
  };

  // Cancel Ride (Driver or Passenger cancellation flow)
  const cancelRide = (rideId, cancelledByRole, reasonCategory, explanation) => {
    const targetRide = rides.find(r => r.id === rideId);
    if (!targetRide) return;

    if (cancelledByRole === 'driver') {
      // Driver cancellation: ride cancelled, deposit goes to pending review for Admin
      setRides(prev =>
        prev.map(r => {
          if (r.id === rideId) {
            return {
              ...r,
              status: 'cancelled',
              depositStatus: 'pending_review'
            };
          }
          return r;
        })
      );

      // Cancel all bookings
      setBookings(prev =>
        prev.map(b => (b.rideId === rideId ? { ...b, status: 'cancelled_by_driver' } : b))
      );

      // Log into cancellations
      const newCancellation = {
        id: `cnl-${Date.now()}`,
        type: 'driver_cancellation',
        rideId: rideId,
        rideRoute: `${targetRide.from} → ${targetRide.to}`,
        driverId: targetRide.driverId,
        driverName: targetRide.driverName,
        cancellationReason: reasonCategory,
        reasonCategory: reasonCategory,
        explanationText: explanation || 'Driver cancelled the trip.',
        supportDocumentSample: 'Attached reason statement',
        depositAmount: targetRide.cancellationDeposit,
        depositStatus: 'pending_review',
        passengersAffected: targetRide.totalPassengerSeatsAllowed - targetRide.availableSeats,
        passengerRefundStatus: '100% Refund credited to passengers per policy',
        cancelledAt: new Date().toISOString(),
        adminResolution: null
      };

      setCancellations(prev => [newCancellation, ...prev]);

      // Notify Driver
      const notifDriver = {
        id: `notif-${Date.now()}-drv`,
        targetUserId: targetRide.driverId,
        role: 'driver',
        title: 'Ride Cancelled - Deposit In Review',
        message: `Your ride was cancelled. Reason: "${reasonCategory}". Your deposit of ₹${targetRide.cancellationDeposit} is under Admin review per cancellation policy.`,
        time: 'Just now',
        type: 'ride_cancelled',
        read: false
      };

      // Notify Admin
      const notifAdmin = {
        id: `notif-${Date.now()}-adm`,
        targetUserId: 'adm-1',
        role: 'admin',
        title: 'Driver Cancellation Dispute Pending',
        message: `${targetRide.driverName} cancelled ride ${targetRide.from} → ${targetRide.to}. Please review deposit refund eligibility.`,
        time: 'Just now',
        type: 'deposit_review',
        read: false
      };

      setNotifications(prev => [notifDriver, notifAdmin, ...prev]);
      triggerToast('Ride Cancelled', 'Deposit held for Admin review per cancellation policy.', 'warning');
    }
  };

  // Passenger: Cancel specific booking
  const cancelPassengerBooking = (bookingId, reasonCategory, explanation) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled_by_passenger', cancelReason: reasonCategory } : b))
    );

    // Release seat back to ride if ride is still scheduled
    setRides(prev =>
      prev.map(r => {
        if (r.id === booking.rideId && r.status === 'scheduled') {
          return { ...r, availableSeats: r.availableSeats + booking.seatsRequested };
        }
        return r;
      })
    );

    // Notify Driver
    const targetRide = rides.find(r => r.id === booking.rideId);
    const notifDriver = {
      id: `notif-${Date.now()}-drv`,
      targetUserId: targetRide?.driverId,
      role: 'driver',
      title: 'Passenger Cancelled Booking',
      message: `${booking.passengerName} cancelled their seat on ${booking.from} → ${booking.to}. Available seats updated.`,
      time: 'Just now',
      type: 'passenger_cancellation',
      read: false
    };

    setNotifications(prev => [notifDriver, ...prev]);
    triggerToast('Booking Cancelled', 'Your booking was cancelled per the cancellation policy.', 'info');
  };

  // Admin: Resolve Cancellation Deposit (Guarded by Backend / Database Authorization)
  const resolveCancellationDeposit = (cancellationId, decision, adminNotes) => {
    const auth = authorizeAdminOperation('resolveCancellationDeposit');
    if (!auth.authorized) {
      triggerToast('403 Forbidden', auth.error, 'error');
      return false;
    }

    setCancellations(prev =>
      prev.map(c => {
        if (c.id === cancellationId) {
          return {
            ...c,
            depositStatus: decision === 'refund' ? 'refunded' : 'forfeited',
            adminResolution: decision === 'refund'
              ? `Approved Refund: ${adminNotes || 'Valid verified emergency reason accepted'}`
              : `Deposit Forfeited: ${adminNotes || 'Unexcused late cancellation without valid proof'}`
          };
        }
        return c;
      })
    );

    const cnl = cancellations.find(c => c.id === cancellationId);
    if (cnl) {
      const notifDriver = {
        id: `notif-${Date.now()}`,
        targetUserId: cnl.driverId,
        role: 'driver',
        title: decision === 'refund' ? 'Deposit Refund Approved! 💳' : 'Deposit Forfeited ⚠️',
        message: decision === 'refund'
          ? `Admin reviewed your cancellation for ${cnl.rideRoute}. ₹${cnl.depositAmount} deposit has been refunded.`
          : `Admin reviewed your cancellation for ${cnl.rideRoute}. Deposit of ₹${cnl.depositAmount} was forfeited per policy. Reason: ${adminNotes || 'Unexcused cancellation'}.`,
        time: 'Just now',
        type: 'deposit_resolution',
        read: false
      };
      setNotifications(prev => [notifDriver, ...prev]);
    }

    triggerToast(
      'Dispute Resolved',
      `Cancellation deposit ${decision === 'refund' ? 'refunded to driver' : 'forfeited'}.`,
      decision === 'refund' ? 'success' : 'warning'
    );
    return true;
  };

  // Toggle Route Deviation Simulation
  const toggleRouteDeviation = (rideId) => {
    const newState = !routeDeviationTriggered;
    setRouteDeviationTriggered(newState);

    if (newState) {
      // Trigger safety notification
      const notif = {
        id: `notif-${Date.now()}`,
        targetUserId: currentUser?.id,
        role: currentRole,
        title: '⚠️ Route Deviation Detected',
        message: 'Vehicle is travelling along an unmapped path (Old Highway Detour). Please verify route with co-travellers.',
        time: 'Just now',
        type: 'safety_alert',
        read: false
      };
      setNotifications(prev => [notif, ...prev]);
      triggerToast('Route Deviation Detected', 'Safety check: Vehicle deviated from planned highway.', 'warning');
    } else {
      triggerToast('Route Re-aligned', 'Vehicle returned to planned highway trajectory.', 'success');
    }
  };

  // Toggle Route Optimization
  const toggleRouteOptimization = (rideId) => {
    const newState = !routeOptimizationApplied;
    setRouteOptimizationApplied(newState);

    if (newState) {
      triggerToast('Route Optimized', 'Applied Express Bypass: Saves 18 mins & avoids Talegaon bottleneck.', 'success');
    } else {
      triggerToast('Standard Route Restored', 'Reverted to standard route map.', 'info');
    }
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.clear();
    setDrivers(INITIAL_DRIVERS);
    setPassengers(INITIAL_PASSENGERS);
    setRides(INITIAL_RIDES);
    setBookings(INITIAL_BOOKINGS);
    setCancellations(INITIAL_CANCELLATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentRole('guest');
    setCurrentUserId('drv-1');
    setActiveTab('home');
    setRouteDeviationTriggered(false);
    setRouteOptimizationApplied(false);
    triggerToast('Demo Data Reset', 'All sample data, rides, and verifications reloaded.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        drivers,
        passengers,
        admin,
        rides,
        bookings,
        cancellations,
        notifications,
        isAdminAuthenticated,
        currentRole,
        currentUser,
        currentUserId,
        activeTab,
        selectedRideId,
        routeDeviationTriggered,
        routeOptimizationApplied,
        activeToast,
        setActiveTab,
        setSelectedRideId,
        switchRole,
        loginDriver,
        loginPassenger,
        loginAdmin,
        logout,
        submitDriverVerification,
        approveDriverVerification,
        rejectDriverVerification,
        requestReverification,
        createRide,
        requestBooking,
        acceptBooking,
        rejectBooking,
        startRide,
        endRide,
        cancelRide,
        cancelPassengerBooking,
        resolveCancellationDeposit,
        toggleRouteDeviation,
        toggleRouteOptimization,
        resetDemoData,
        triggerToast,
        setNotifications,
        adminConfig: {
          email: DESIGNATED_ADMIN.email,
          role: DESIGNATED_ADMIN.role,
          id: DESIGNATED_ADMIN.id
        },
        updateAdminCredentials,
        globalSearch,
        setGlobalSearch
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
