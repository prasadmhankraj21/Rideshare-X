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
  enforceSingleAdminRole,
  hasAdminPasswordSet,
  setInitialAdminPassword,
  updateAdminPassword
} from '../services/adminAuthService';
import {
  isSupabaseConfigured,
  supabaseSignUpDriver,
  supabaseSignUpPassenger,
  supabaseSignInUser,
  supabaseSaveRide,
  supabaseSearchRides,
  supabaseFetchAllRides,
  getRealUsers,
  getRealRides,
  getRealBookings,
  saveRealBooking
} from '../services/supabaseClient';
import {
  isFirebaseConfigured,
  firebaseSignUpDriver,
  firebaseSignUpPassenger,
  firebaseSignInUser,
  firebaseSaveRide,
  firebaseFetchAllRides,
  firebaseSaveBooking,
  firebaseFetchAllBookings,
  subscribeToRealtimeRides,
  subscribeToRealtimeBookings,
  syncLocalDataToFirebase
} from '../services/firebaseClient';

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
  // Load drivers from localStorage, merged with registered real users, sanitized
  const [drivers, setDrivers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      const raw = saved ? JSON.parse(saved) : INITIAL_DRIVERS;
      const realDrivers = getRealUsers().filter(u => u.role === 'driver');
      const combined = [...realDrivers];
      for (const d of raw) {
        if (!combined.some(c => c.id === d.id)) {
          combined.push(d);
        }
      }
      return enforceSingleAdminRole(combined, []).drivers;
    } catch {
      return enforceSingleAdminRole(INITIAL_DRIVERS, []).drivers;
    }
  });

  // Load passengers from localStorage, merged with registered real users, sanitized
  const [passengers, setPassengers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PASSENGERS);
      const raw = saved ? JSON.parse(saved) : INITIAL_PASSENGERS;
      const realPassengers = getRealUsers().filter(u => u.role === 'passenger');
      const combined = [...realPassengers];
      for (const p of raw) {
        if (!combined.some(c => c.id === p.id)) {
          combined.push(p);
        }
      }
      return enforceSingleAdminRole([], combined).passengers;
    } catch {
      return enforceSingleAdminRole([], INITIAL_PASSENGERS).passengers;
    }
  });

  // Exactly one permanent designated admin account
  const [admin] = useState(DESIGNATED_ADMIN);

  // Real published rides from Supabase / persistent storage (strictly no fake/mock rides)
  const [rides, setRides] = useState(() => {
    const realRides = getRealRides().filter((r) =>
      ['published', 'active', 'scheduled', 'in_progress'].includes(r.status)
    );
    if (realRides && realRides.length > 0) {
      return realRides;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.RIDES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const nonDemo = parsed.filter(
          (r) =>
            !r.id.startsWith('ride-10') &&
            r.driverId !== 'drv-1' &&
            ['published', 'active', 'scheduled', 'in_progress'].includes(r.status)
        );
        if (nonDemo.length > 0) return nonDemo;
      } catch {}
    }
    return [];
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const real = getRealBookings();
      if (real && real.length > 0) {
        return real;
      }
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [cancellations, setCancellations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CANCELLATIONS);
      return saved ? JSON.parse(saved) : INITIAL_CANCELLATIONS;
    } catch {
      return INITIAL_CANCELLATIONS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
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

  // Current logged in user ID - strictly null when unauthenticated, NEVER default to demo account!
  const [currentUserId, setCurrentUserId] = useState(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return savedId && savedId !== 'null' ? savedId : null;
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
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // Refresh real rides from Firebase, Supabase & persistent storage (with optional search criteria)
  const refreshRides = async (filters = null) => {
    try {
      if (isFirebaseConfigured()) {
        const fbRides = await firebaseFetchAllRides();
        if (fbRides && fbRides.length > 0) {
          setRides(fbRides);
          return fbRides;
        }
      }
      if (filters && (filters.from || filters.to || filters.date || filters.seats)) {
        const searchRes = await supabaseSearchRides(filters);
        if (searchRes && searchRes.success && searchRes.rides) {
          setRides(searchRes.rides);
          return searchRes.rides;
        }
      }
      const remoteRides = await supabaseFetchAllRides();
      if (remoteRides) {
        setRides(remoteRides);
        return remoteRides;
      }
    } catch (e) {
      console.warn('Error refreshing rides:', e);
    }
    const local = getRealRides().filter((r) =>
      ['published', 'active', 'scheduled', 'in_progress'].includes(r.status)
    );
    setRides(local);
    return local;
  };

  // Refresh real bookings from Firebase & persistent storage
  const refreshBookings = async () => {
    try {
      if (isFirebaseConfigured()) {
        const fbBookings = await firebaseFetchAllBookings();
        if (fbBookings && fbBookings.length > 0) {
          setBookings(fbBookings);
          return fbBookings;
        }
      }
    } catch (e) {
      console.warn('Error refreshing bookings:', e);
    }
    const local = getRealBookings();
    if (local && local.length > 0) {
      setBookings(local);
      return local;
    }
    return bookings;
  };

  // Sync real published rides and bookings on mount
  useEffect(() => {
    refreshRides();
    refreshBookings();
  }, []);

  // Real-time Cloud Firestore synchronization across any phone, laptop, or browser
  useEffect(() => {
    if (isFirebaseConfigured()) {
      syncLocalDataToFirebase();
      const unsubRides = subscribeToRealtimeRides((liveRides) => {
        if (liveRides && liveRides.length > 0) {
          setRides(liveRides);
        }
      });
      const unsubBookings = subscribeToRealtimeBookings((liveBookings) => {
        if (liveBookings && liveBookings.length > 0) {
          setBookings(liveBookings);
        }
      });
      return () => {
        if (typeof unsubRides === 'function') unsubRides();
        if (typeof unsubBookings === 'function') unsubBookings();
      };
    }
  }, []);

  // Cross-tab synchronization so Driver publish in Tab A is immediately visible to Passenger in Tab B,
  // and Passenger booking in Tab B is immediately visible to Driver in Tab A!
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.RIDES || e.key === 'ridesharex_real_rides_v1') {
        refreshRides();
      }
      if (e.key === STORAGE_KEYS.BOOKINGS || e.key === 'ridesharex_real_bookings_v1') {
        refreshBookings();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Derived current user object - strictly isolated, NO demo fallback for logged in users!
  const currentUser = React.useMemo(() => {
    if (currentRole === 'driver') {
      if (!currentUserId) return null;
      return drivers.find(d => d.id === currentUserId) || null;
    }
    if (currentRole === 'passenger') {
      if (!currentUserId) return null;
      return passengers.find(p => p.id === currentUserId) || null;
    }
    if (currentRole === 'admin') {
      const validation = validateAdminToken();
      return validation.authorized ? admin : null;
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
      if (targetUserId) {
        setCurrentUserId(targetUserId);
      }
      setActiveTab('driver_dashboard');
    } else if (newRole === 'passenger') {
      setCurrentRole('passenger');
      if (targetUserId) {
        setCurrentUserId(targetUserId);
      }
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

  // Authenticate driver by ID (used for 1-click test profiles)
  const loginDriver = (driverId) => {
    setCurrentRole('driver');
    setCurrentUserId(driverId);
    setActiveTab('driver_dashboard');
    triggerToast('Driver Login Successful', 'Welcome to your Driver Dashboard', 'success');
  };

  // Authenticate passenger by ID (used for 1-click test profiles)
  const loginPassenger = (passengerId) => {
    setCurrentRole('passenger');
    setCurrentUserId(passengerId);
    setActiveTab('passenger_dashboard');
    triggerToast('Passenger Login Successful', 'Welcome to your Passenger Dashboard', 'success');
  };

  // Register Driver (Real Firebase / Supabase Auth + Database)
  const registerDriver = async ({ email, password, name, phone, city }) => {
    let res = null;
    if (isFirebaseConfigured()) {
      res = await firebaseSignUpDriver({ email, password, fullName: name, phone, city });
    } else {
      res = await supabaseSignUpDriver({ email, password, fullName: name, phone, city });
    }
    if (!res.success) {
      triggerToast('Registration Failed', res.error, 'error');
      return { success: false, error: res.error };
    }

    setDrivers(prev => [res.user, ...prev.filter(d => d.id !== res.user.id)]);
    setCurrentRole('driver');
    setCurrentUserId(res.user.id);
    setActiveTab('driver_dashboard');
    triggerToast('Account Created', `Welcome, ${res.user.name}! Your car owner profile is active.`, 'success');
    return { success: true, user: res.user };
  };

  // Login Driver with credentials (Real Firebase / Supabase Auth + Database)
  const loginDriverWithCredentials = async (email, password) => {
    let res = null;
    if (isFirebaseConfigured()) {
      res = await firebaseSignInUser({ email, password, expectedRole: 'driver' });
    } else {
      res = await supabaseSignInUser({ email, password, expectedRole: 'driver' });
    }
    if (!res.success) {
      triggerToast('Sign In Failed', res.error, 'error');
      return { success: false, error: res.error };
    }

    setDrivers(prev => [res.user, ...prev.filter(d => d.id !== res.user.id)]);
    setCurrentRole('driver');
    setCurrentUserId(res.user.id);
    setActiveTab('driver_dashboard');
    triggerToast('Driver Sign In Successful', `Welcome back, ${res.user.name}!`, 'success');
    return { success: true, user: res.user };
  };

  // Register Passenger (Real Firebase / Supabase Auth + Database)
  const registerPassenger = async ({ email, password, name, phone }) => {
    let res = null;
    if (isFirebaseConfigured()) {
      res = await firebaseSignUpPassenger({ email, password, fullName: name, phone });
    } else {
      res = await supabaseSignUpPassenger({ email, password, fullName: name, phone });
    }
    if (!res.success) {
      triggerToast('Registration Failed', res.error, 'error');
      return { success: false, error: res.error };
    }

    setPassengers(prev => [res.user, ...prev.filter(p => p.id !== res.user.id)]);
    setCurrentRole('passenger');
    setCurrentUserId(res.user.id);
    setActiveTab('passenger_dashboard');
    triggerToast('Account Created', `Welcome, ${res.user.name}! You can now book rides.`, 'success');
    return { success: true, user: res.user };
  };

  // Login Passenger with credentials (Real Firebase / Supabase Auth + Database)
  const loginPassengerWithCredentials = async (email, password) => {
    let res = null;
    if (isFirebaseConfigured()) {
      res = await firebaseSignInUser({ email, password, expectedRole: 'passenger' });
    } else {
      res = await supabaseSignInUser({ email, password, expectedRole: 'passenger' });
    }
    if (!res.success) {
      triggerToast('Sign In Failed', res.error, 'error');
      return { success: false, error: res.error };
    }

    setPassengers(prev => [res.user, ...prev.filter(p => p.id !== res.user.id)]);
    setCurrentRole('passenger');
    setCurrentUserId(res.user.id);
    setActiveTab('passenger_dashboard');
    triggerToast('Passenger Sign In Successful', `Welcome back, ${res.user.name}!`, 'success');
    return { success: true, user: res.user };
  };

  // Authenticate admin strictly against designated administrator account
  const loginAdmin = async (inputEmail, inputPassword) => {
    const result = await issueAdminToken(inputEmail, inputPassword);
    if (result.success) {
      setCurrentRole('admin');
      setCurrentUserId(DESIGNATED_ADMIN.id);
      setIsAdminAuthenticated(true);
      setActiveTab('admin_dashboard');
      triggerToast('Admin Authentication Verified', 'Welcome back, Platform Administrator.', 'success');
      return { success: true };
    } else {
      triggerToast('Access Denied (403)', result.error, 'error');
      return { success: false, error: result.error, setupRequired: result.setupRequired };
    }
  };

  // Set initial master admin password (PBKDF2 salted hash / Supabase)
  const setupAdminPassword = async (email, password, confirmPassword, provisioningKey = null) => {
    const result = await setInitialAdminPassword(email, password, confirmPassword, provisioningKey);
    if (result.success) {
      setCurrentRole('admin');
      setCurrentUserId(DESIGNATED_ADMIN.id);
      setIsAdminAuthenticated(true);
      setActiveTab('admin_dashboard');
      triggerToast('Admin Password Configured', 'Your strong admin password has been cryptographically saved.', 'success');
      return { success: true };
    } else {
      triggerToast('Setup Failed', result.error, 'error');
      return { success: false, error: result.error };
    }
  };

  // Update master admin credentials (protected by database authorization guard)
  const updateAdminCredentials = async (newEmail, newPassword) => {
    const result = await updateAdminPassword(newPassword.trim());
    if (!result.success) {
      triggerToast('Update Failed', result.error, 'error');
      return { success: false, error: result.error };
    }

    triggerToast('Master Password Updated', 'Designated administrator password has been updated securely.', 'success');
    return { success: true };
  };

  // Sign out
  const logout = () => {
    revokeAdminToken();
    setIsAdminAuthenticated(false);
    setCurrentRole('guest');
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
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
  const createRide = async (ridePayload) => {
    if (!currentUser) {
      triggerToast('Authentication Required', 'Please sign in to publish a ride.', 'error');
      return null;
    }

    const newRideId = `ride-${Date.now()}`;
    const newRide = {
      id: newRideId,
      driverId: currentUser.id,
      driverName: currentUser.name,
      driverAvatar: currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`,
      driverRating: currentUser.rating || 5.0,
      driverVerified: true,
      from: ridePayload.from?.trim(),
      to: ridePayload.to?.trim(),
      fromCoordinates: ridePayload.fromCoordinates || [18.4088, 76.5604],
      toCoordinates: ridePayload.toCoordinates || [18.5204, 73.8567],
      date: ridePayload.date?.trim(),
      departureTime: ridePayload.departureTime?.trim(),
      estimatedArrivalTime: ridePayload.estimatedArrivalTime?.trim(),
      estimatedDuration: ridePayload.estimatedDuration || '4h 30m',
      vehicleType: ridePayload.vehicleType || '5-Seater',
      vehicleDetails: currentUser.vehicle
        ? `${currentUser.vehicle.make || 'Car'} ${currentUser.vehicle.model || ''} • ${currentUser.vehicle.plateNumber || 'MH-12-REG'}`
        : `${ridePayload.vehicleType || 'Car'} • MH-12-REG`,
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
      status: 'published',
      routeOptimized: false,
      routeDeviationDetected: false,
      activeLocation: null
    };

    // Await database persistence (Firebase Firestore & Supabase)
    if (isFirebaseConfigured()) {
      await firebaseSaveRide(newRide);
    }
    const saveResult = await supabaseSaveRide(newRide);
    if (!saveResult.success && !isFirebaseConfigured()) {
      console.error('[Database Save Error]', saveResult.error);
      triggerToast('Database Error', saveResult.error || 'Failed to save ride to database.', 'error');
      return null;
    }

    setRides(prev => [newRide, ...prev.filter(r => r.id !== newRide.id)]);

    // Notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      targetUserId: currentUser.id,
      role: 'driver',
      title: 'Ride Published Successfully! 🚗',
      message: `Your ride from ${newRide.from} to ${newRide.to} with ${newRide.availableSeats} available seats is now live in Supabase. Refundable deposit of ₹${newRide.cancellationDeposit} held in escrow.`,
      time: 'Just now',
      type: 'ride_published',
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    triggerToast('Ride Published', `Ride from ${newRide.from} to ${newRide.to} is now live and searchable!`, 'success');
    return newRideId;
  };

  // Passenger: Request Booking
  const requestBooking = async (rideId, seatsRequested, pickupPoint, notes) => {
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
      driverId: targetRide.driverId,
      driverName: targetRide.driverName,
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

    // Save to Firebase Cloud Firestore and persistent local storage
    if (isFirebaseConfigured()) {
      await firebaseSaveBooking(newBooking);
    } else {
      saveRealBooking(newBooking);
    }

    setBookings(prev => [newBooking, ...prev.filter(b => b.id !== newBooking.id)]);

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
  const acceptBooking = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const targetRide = rides.find(r => r.id === booking.rideId);
    const boardingPin = booking.boardingPin || Math.floor(1000 + Math.random() * 9000).toString();

    const initialPickupSpot = booking.exactPickupSpot || {
      address: booking.pickupPoint || (targetRide?.pickupDropPoints?.[0]?.point || `${booking.from} Center`),
      coordinates: targetRide?.fromCoordinates || [18.4088, 76.5604],
      updatedBy: 'system',
      updatedAt: new Date().toISOString()
    };

    const initialMessages = (booking.chatMessages && booking.chatMessages.length > 0)
      ? booking.chatMessages
      : [
          {
            id: `msg-${Date.now()}-sys`,
            senderId: 'system',
            senderName: 'Rideshare_X',
            senderRole: 'system',
            text: `Booking confirmed! Boarding PIN: ${boardingPin}. You can now coordinate pickup location on the map and chat directly here.`,
            timestamp: new Date().toISOString()
          }
        ];

    const updatedBooking = {
      ...booking,
      status: 'confirmed',
      boardingPin,
      exactPickupSpot: initialPickupSpot,
      chatMessages: initialMessages,
      driverPhone: booking.driverPhone || currentUser?.phone || '+91 98765 43210',
      passengerPhone: booking.passengerPhone || '+91 91234 56780',
      updatedAt: new Date().toISOString()
    };

    // Update booking status
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? updatedBooking : b))
    );

    // Decrement available seats on the ride
    let updatedRide = null;
    setRides(prev =>
      prev.map(r => {
        if (r.id === booking.rideId) {
          const newAvailable = Math.max(0, r.availableSeats - booking.seatsRequested);
          updatedRide = { ...r, availableSeats: newAvailable, updatedAt: new Date().toISOString() };
          return updatedRide;
        }
        return r;
      })
    );

    if (isFirebaseConfigured()) {
      await firebaseSaveBooking(updatedBooking);
      if (updatedRide) {
        await firebaseSaveRide(updatedRide);
      }
    } else {
      saveRealBooking(updatedBooking);
      if (updatedRide) {
        saveRealRide(updatedRide);
      }
    }

    // Notify passenger
    const notifPassenger = {
      id: `notif-${Date.now()}`,
      targetUserId: booking.passengerId,
      role: 'passenger',
      title: 'Booking Confirmed! ✅',
      message: `Your booking for ${booking.seatsRequested} seat(s) on ${booking.from} → ${booking.to} has been accepted. Coordinate pickup & contact driver directly!`,
      time: 'Just now',
      type: 'booking_confirmed',
      read: false
    };

    setNotifications(prev => [notifPassenger, ...prev]);
    triggerToast('Booking Accepted', `Confirmed booking for ${booking.passengerName}. Available seats updated.`, 'success');
    return updatedBooking;
  };

  // Driver: Reject Booking
  const rejectBooking = async (bookingId, reason = 'Seat occupied by co-traveller') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updatedBooking = { ...booking, status: 'rejected', rejectReason: reason, updatedAt: new Date().toISOString() };

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? updatedBooking : b))
    );

    if (isFirebaseConfigured()) {
      await firebaseSaveBooking(updatedBooking);
    } else {
      saveRealBooking(updatedBooking);
    }

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

  // Update Booking Coordination (Location, Chat Messages, Boarding verification)
  const updateBookingCoordination = async (bookingId, updates) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    let updatedMessages = booking.chatMessages || [];
    if (updates.newMessage) {
      updatedMessages = [...updatedMessages, updates.newMessage];
    }

    const updatedBooking = {
      ...booking,
      exactPickupSpot: updates.exactPickupSpot || booking.exactPickupSpot,
      chatMessages: updatedMessages,
      boardingVerified: updates.boardingVerified !== undefined ? updates.boardingVerified : booking.boardingVerified,
      updatedAt: new Date().toISOString()
    };

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? updatedBooking : b))
    );

    if (isFirebaseConfigured()) {
      await firebaseSaveBooking(updatedBooking);
    } else {
      saveRealBooking(updatedBooking);
    }

    if (updates.toastMessage) {
      triggerToast(updates.toastTitle || 'Coordination Updated', updates.toastMessage, 'success');
    }

    return updatedBooking;
  };

  // Send a chat message between connected driver and passenger
  const sendBookingMessage = async (bookingId, text) => {
    if (!text || !text.trim()) return null;
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'guest',
      senderName: currentUser?.name || (currentRole === 'driver' ? 'Driver' : 'Passenger'),
      senderRole: currentRole,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    return await updateBookingCoordination(bookingId, {
      newMessage: newMsg,
      toastTitle: 'Message Sent',
      toastMessage: 'Your message has been delivered.'
    });
  };

  // Update exact pickup spot on map with custom landmark/coordinates
  const updateExactPickupSpot = async (bookingId, { address, coordinates }) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const updaterName = currentUser?.name || (currentRole === 'driver' ? 'Driver' : 'Passenger');
    const newMsg = {
      id: `msg-${Date.now()}-loc`,
      senderId: 'system',
      senderName: 'Location Update',
      senderRole: 'system',
      text: `📍 ${updaterName} updated pickup spot to: "${address}"`,
      timestamp: new Date().toISOString()
    };

    return await updateBookingCoordination(bookingId, {
      exactPickupSpot: {
        address,
        coordinates,
        updatedBy: updaterName,
        updatedAt: new Date().toISOString()
      },
      newMessage: newMsg,
      toastTitle: 'Pickup Spot Updated',
      toastMessage: `Exact pickup spot set to "${address}".`
    });
  };

  // Verify passenger boarding PIN
  const verifyBoardingPin = async (bookingId, inputPin) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    const cleanInput = String(inputPin || '').trim();
    const expectedPin = String(booking.boardingPin || '').trim();

    if (cleanInput !== expectedPin) {
      triggerToast('Invalid PIN', 'PIN does not match! Please check the 4-digit code on the passenger\'s screen.', 'error');
      return { success: false, error: 'Invalid PIN. Please check passenger\'s screen.' };
    }

    const updaterName = currentUser?.name || 'Driver';
    const newMsg = {
      id: `msg-${Date.now()}-verify`,
      senderId: 'system',
      senderName: 'Boarding System',
      senderRole: 'system',
      text: `✅ Boarding Verified! PIN ${cleanInput} verified by ${updaterName}. ${booking.passengerName} has safely boarded the vehicle.`,
      timestamp: new Date().toISOString()
    };

    const updated = await updateBookingCoordination(bookingId, {
      boardingVerified: true,
      newMessage: newMsg,
      toastTitle: 'Boarding Verified! ✅',
      toastMessage: `${booking.passengerName} verified. You can now start the ride.`
    });

    return { success: true, booking: updated };
  };

  // Driver: Start Ride
  const startRide = async (rideId) => {
    let updatedRide = null;
    setRides(prev =>
      prev.map(r => {
        if (r.id === rideId) {
          updatedRide = {
            ...r,
            status: 'in_progress',
            activeLocation: {
              latitude: r.fromCoordinates ? r.fromCoordinates[0] : 18.5204,
              longitude: r.fromCoordinates ? r.fromCoordinates[1] : 73.8567,
              heading: 310,
              speedKmH: 65,
              currentMilestone: `Departed from ${r.from}. Cruising on highway towards ${r.to}.`,
              distanceCoveredKm: 5,
              totalDistanceKm: 180,
              etaMinutes: 160
            },
            updatedAt: new Date().toISOString()
          };
          return updatedRide;
        }
        return r;
      })
    );

    if (updatedRide) {
      if (isFirebaseConfigured()) {
        await firebaseSaveRide(updatedRide);
      } else {
        saveRealRide(updatedRide);
      }
    }

    setSelectedRideId(rideId);

    // Notify all confirmed passengers of this ride
    const confirmedBookings = bookings.filter(b => b.rideId === rideId && (b.status === 'confirmed' || b.status === 'in_progress'));
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
    return updatedRide;
  };

  // Driver: End Ride
  const endRide = async (rideId) => {
    const targetRide = rides.find(r => r.id === rideId);
    let updatedRide = null;

    setRides(prev =>
      prev.map(r => {
        if (r.id === rideId) {
          updatedRide = {
            ...r,
            status: 'completed',
            depositStatus: 'refunded',
            activeLocation: null,
            updatedAt: new Date().toISOString()
          };
          return updatedRide;
        }
        return r;
      })
    );

    if (updatedRide) {
      if (isFirebaseConfigured()) {
        await firebaseSaveRide(updatedRide);
      } else {
        saveRealRide(updatedRide);
      }
    }

    // Update bookings for this ride to completed
    const updatedBookings = [];
    setBookings(prev =>
      prev.map(b => {
        if (b.rideId === rideId && (b.status === 'confirmed' || b.status === 'in_progress')) {
          const compBkg = { ...b, status: 'completed', updatedAt: new Date().toISOString() };
          updatedBookings.push(compBkg);
          return compBkg;
        }
        return b;
      })
    );

    for (const b of updatedBookings) {
      if (isFirebaseConfigured()) {
        await firebaseSaveBooking(b);
      } else {
        saveRealBooking(b);
      }
    }

    // Notify driver about cancellation deposit refund
    const notifDriver = {
      id: `notif-${Date.now()}-drv`,
      targetUserId: targetRide?.driverId || currentUser?.id,
      role: 'driver',
      title: 'Ride Completed & Deposit Refunded! 💰',
      message: `Destination reached safely. Your refundable cancellation deposit of ₹${targetRide?.cancellationDeposit || 250} has been released back to your account.`,
      time: 'Just now',
      type: 'ride_completed',
      read: false
    };

    // Notify passengers
    const confirmedBookings = bookings.filter(b => b.rideId === rideId && (b.status === 'confirmed' || b.status === 'completed'));
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
  const cancelPassengerBooking = async (bookingId, reasonCategory, explanation) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updatedBooking = { ...booking, status: 'cancelled_by_passenger', cancelReason: reasonCategory, updatedAt: new Date().toISOString() };

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? updatedBooking : b))
    );

    // Release seat back to ride if ride is still scheduled
    let updatedRide = null;
    setRides(prev =>
      prev.map(r => {
        if (r.id === booking.rideId && ['scheduled', 'published', 'active'].includes(r.status)) {
          updatedRide = { ...r, availableSeats: r.availableSeats + booking.seatsRequested, updatedAt: new Date().toISOString() };
          return updatedRide;
        }
        return r;
      })
    );

    if (isFirebaseConfigured()) {
      await firebaseSaveBooking(updatedBooking);
      if (updatedRide) {
        await firebaseSaveRide(updatedRide);
      }
    } else {
      saveRealBooking(updatedBooking);
      if (updatedRide) {
        saveRealRide(updatedRide);
      }
    }

    // Notify Driver
    const targetRide = rides.find(r => r.id === booking.rideId);
    const notifDriver = {
      id: `notif-${Date.now()}-drv`,
      targetUserId: targetRide?.driverId || booking.driverId,
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
    setCurrentUserId(null);
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
        registerDriver,
        loginDriverWithCredentials,
        registerPassenger,
        loginPassengerWithCredentials,
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
        hasAdminPasswordSet,
        setupAdminPassword,
        isSupabaseConfigured,
        globalSearch,
        setGlobalSearch,
        refreshRides,
        refreshBookings,
        updateBookingCoordination,
        sendBookingMessage,
        updateExactPickupSpot,
        verifyBoardingPin,
        searchRides: supabaseSearchRides
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
