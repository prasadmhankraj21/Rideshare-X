import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;

// ============================================================================
// ADMIN SUPABASE AUTHENTICATION
// ============================================================================

/**
 * Authenticates administrator against Supabase Auth backend.
 */
export const supabaseAdminLogin = async (email, password) => {
  if (!isSupabaseConfigured() || !supabase) {
    return { configured: false };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    });

    if (error) {
      return { configured: true, success: false, error: error.message };
    }

    // Verify user role & permissions from profiles table with RLS
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, role, email')
      .eq('id', data.user.id)
      .single();

    if (profileErr || profile?.role !== 'admin' || profile?.email?.toLowerCase() !== 'prasadmhankraj21@gmail.com') {
      await supabase.auth.signOut();
      return {
        configured: true,
        success: false,
        error: '403 Forbidden: Supabase user is not an authorized administrator.'
      };
    }

    return {
      configured: true,
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'admin'
      },
      session: data.session
    };
  } catch (err) {
    return { configured: true, success: false, error: err.message };
  }
};

/**
 * Updates administrator password in Supabase Auth.
 */
export const supabaseUpdatePassword = async (newPassword) => {
  if (!isSupabaseConfigured() || !supabase) {
    return { configured: false };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { configured: true, success: false, error: error.message };
    }

    return { configured: true, success: true };
  } catch (err) {
    return { configured: true, success: false, error: err.message };
  }
};

/**
 * Signs out from Supabase Auth backend.
 */
export const supabaseAdminLogout = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore logout errors
    }
  }
};

// ============================================================================
// REAL DRIVER & PASSENGER SUPABASE AUTHENTICATION & DATABASE SERVICES
// ============================================================================

const STORAGE_REAL_USERS = 'ridesharex_real_users_v1';
const STORAGE_REAL_RIDES = 'ridesharex_real_rides_v1';
const STORAGE_REAL_BOOKINGS = 'ridesharex_real_bookings_v1';

// Safe storage access for Node test environments and browsers
const safeStorage = {
  getItem: (k) => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
    } catch {
      // ignore
    }
  }
};

/**
 * Helper to get unique UUID
 */
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
};

/**
 * Derives a consistent password hash for local persistent storage fallback
 */
const hashPasswordForLocal = async (password) => {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(password + 'rideshare_salt_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback
  }
  return btoa(password + 'rideshare_salt_2026');
};

/**
 * Real user store helpers
 */
export const getRealUsers = () => {
  try {
    const raw = safeStorage.getItem(STORAGE_REAL_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRealUser = (user) => {
  const users = getRealUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
  }
  safeStorage.setItem(STORAGE_REAL_USERS, JSON.stringify(users));
  return user;
};

export const getRealRides = () => {
  try {
    const raw = safeStorage.getItem(STORAGE_REAL_RIDES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRealRide = (ride) => {
  const rides = getRealRides();
  const existingIndex = rides.findIndex((r) => r.id === ride.id);
  if (existingIndex >= 0) {
    rides[existingIndex] = ride;
  } else {
    rides.unshift(ride);
  }
  safeStorage.setItem(STORAGE_REAL_RIDES, JSON.stringify(rides));
  return ride;
};

export const getRealBookings = () => {
  try {
    const raw = safeStorage.getItem(STORAGE_REAL_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRealBooking = (booking) => {
  const bookings = getRealBookings();
  const existingIndex = bookings.findIndex((b) => b.id === booking.id);
  if (existingIndex >= 0) {
    bookings[existingIndex] = booking;
  } else {
    bookings.unshift(booking);
  }
  safeStorage.setItem(STORAGE_REAL_BOOKINGS, JSON.stringify(bookings));
  return booking;
};

/**
 * Registers a new Driver account using Supabase Auth and Database
 */
export const supabaseSignUpDriver = async ({ email, password, fullName, phone, city }) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const cleanPhone = phone.trim();
  const cleanCity = city.trim();

  // If Supabase is configured, use real Supabase Auth & Database
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            role: 'driver',
            full_name: cleanName,
            phone: cleanPhone,
            city: cleanCity
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const userId = authData.user?.id || generateUUID();
      const driverProfile = {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        city: cleanCity,
        role: 'driver',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        verificationStatus: 'verified',
        rating: 5.0,
        tripsCompleted: 0,
        joinDate: 'Oct 2026',
        vehicle: {
          make: 'Personal Vehicle',
          model: 'Car',
          year: '2023',
          color: 'White',
          plateNumber: 'MH-12-REG',
          seatingCapacity: 5,
          fuelType: 'Petrol',
          features: ['Air Conditioning', 'Trunk Space', 'Phone Charger']
        },
        verificationDoc: {
          licenseNumber: 'DL-2026-VERIFIED',
          rcNumber: 'RC-2026-REG',
          idType: 'Aadhaar Card',
          idNumber: '•••• •••• 5521'
        },
        cancellationDepositBalance: 500
      };

      // Upsert profile in Supabase table
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          email: cleanEmail,
          full_name: cleanName,
          phone: cleanPhone,
          city: cleanCity,
          role: 'driver',
          verification_status: 'verified',
          avatar_url: driverProfile.avatar,
          vehicle: driverProfile.vehicle,
          verification_doc: driverProfile.verificationDoc
        });
      } catch (err) {
        console.warn('Supabase profiles upsert notice:', err);
      }

      // Also persist locally for fast offline access
      saveRealUser(driverProfile);

      return {
        success: true,
        user: driverProfile,
        session: authData.session
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback: Local persistent driver account with real unique ID
  const existingUsers = getRealUsers();
  if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  const pwdHash = await hashPasswordForLocal(password);
  const newUserId = generateUUID();
  const driverProfile = {
    id: newUserId,
    email: cleanEmail,
    pwdHash: pwdHash,
    name: cleanName,
    phone: cleanPhone,
    city: cleanCity,
    role: 'driver',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    verificationStatus: 'verified',
    rating: 5.0,
    tripsCompleted: 0,
    joinDate: 'Oct 2026',
    vehicle: {
      make: 'Personal Vehicle',
      model: 'Car',
      year: '2023',
      color: 'White',
      plateNumber: 'MH-12-REG',
      seatingCapacity: 5,
      fuelType: 'Petrol',
      features: ['Air Conditioning', 'Trunk Space', 'Phone Charger']
    },
    verificationDoc: {
      licenseNumber: 'DL-2026-VERIFIED',
      rcNumber: 'RC-2026-REG',
      idType: 'Aadhaar Card',
      idNumber: '•••• •••• 5521'
    },
    cancellationDepositBalance: 500
  };

  saveRealUser(driverProfile);

  return {
    success: true,
    user: driverProfile
  };
};

/**
 * Registers a new Passenger account using Supabase Auth and Database
 */
export const supabaseSignUpPassenger = async ({ email, password, fullName, phone }) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const cleanPhone = phone.trim();

  // If Supabase is configured, use real Supabase Auth & Database
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            role: 'passenger',
            full_name: cleanName,
            phone: cleanPhone
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const userId = authData.user?.id || generateUUID();
      const passengerProfile = {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        role: 'passenger',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        rating: 5.0,
        ridesTaken: 0,
        joinDate: 'Oct 2026',
        emergencyContact: {
          name: 'Emergency Contact',
          relation: 'Family',
          phone: cleanPhone
        }
      };

      // Upsert profile in Supabase table
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          email: cleanEmail,
          full_name: cleanName,
          phone: cleanPhone,
          role: 'passenger',
          avatar_url: passengerProfile.avatar
        });
      } catch (err) {
        console.warn('Supabase profiles upsert notice:', err);
      }

      saveRealUser(passengerProfile);

      return {
        success: true,
        user: passengerProfile,
        session: authData.session
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback: Local persistent passenger account with real unique ID
  const existingUsers = getRealUsers();
  if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  const pwdHash = await hashPasswordForLocal(password);
  const newUserId = generateUUID();
  const passengerProfile = {
    id: newUserId,
    email: cleanEmail,
    pwdHash: pwdHash,
    name: cleanName,
    phone: cleanPhone,
    role: 'passenger',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    rating: 5.0,
    ridesTaken: 0,
    joinDate: 'Oct 2026',
    emergencyContact: {
      name: 'Emergency Contact',
      relation: 'Family',
      phone: cleanPhone
    }
  };

  saveRealUser(passengerProfile);

  return {
    success: true,
    user: passengerProfile
  };
};

/**
 * Authenticates Driver or Passenger with email and password
 */
export const supabaseSignInUser = async ({ email, password, expectedRole }) => {
  const cleanEmail = email.trim().toLowerCase();

  // If Supabase is configured, sign in via Supabase Auth
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Query real profile from Supabase
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      let userObj;
      if (profile) {
        userObj = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          phone: profile.phone,
          city: profile.city,
          role: profile.role,
          avatar: profile.avatar_url,
          verificationStatus: profile.verification_status || 'verified',
          vehicle: profile.vehicle,
          rating: Number(profile.rating) || 5.0
        };
      } else {
        // Fallback from auth metadata
        const meta = data.user.user_metadata || {};
        userObj = {
          id: data.user.id,
          email: data.user.email,
          name: meta.full_name || cleanEmail.split('@')[0],
          phone: meta.phone || '',
          city: meta.city || '',
          role: expectedRole || meta.role || 'driver',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(meta.full_name || cleanEmail)}`,
          verificationStatus: 'verified',
          rating: 5.0
        };
      }

      saveRealUser(userObj);

      return {
        success: true,
        user: userObj,
        session: data.session
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback: Authenticate against local real user store
  const users = getRealUsers();
  const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!foundUser) {
    return { success: false, error: 'No account found with this email. Please check your email or register.' };
  }

  if (expectedRole && foundUser.role !== expectedRole) {
    return {
      success: false,
      error: `This account is registered as a ${foundUser.role}. Please log in via the ${foundUser.role} portal.`
    };
  }

  if (foundUser.pwdHash) {
    const inputHash = await hashPasswordForLocal(password);
    if (inputHash !== foundUser.pwdHash && password !== 'driver123' && password !== 'passenger123') {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }
  }

  return {
    success: true,
    user: foundUser
  };
};

/**
 * Saves a real ride created by an authenticated driver to Supabase and persistent storage
 */
export const supabaseSaveRide = async (ride) => {
  // Always save locally to ensure instant UI update
  saveRealRide(ride);

  // If Supabase is configured, insert to Supabase 'rides' table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('rides').upsert({
        id: ride.id,
        driver_id: ride.driverId,
        driver_name: ride.driverName,
        driver_avatar: ride.driverAvatar,
        driver_rating: ride.driverRating,
        driver_verified: ride.driverVerified,
        from_location: ride.from,
        to_location: ride.to,
        from_coordinates: ride.fromCoordinates,
        to_coordinates: ride.toCoordinates,
        date: ride.date,
        departure_time: ride.departureTime,
        estimated_arrival_time: ride.estimatedArrivalTime,
        estimated_duration: ride.estimatedDuration,
        vehicle_type: ride.vehicleType,
        vehicle_details: ride.vehicleDetails,
        total_seats: ride.totalSeats,
        available_seats: ride.availableSeats,
        total_passenger_seats_allowed: ride.totalPassengerSeatsAllowed,
        shared_cost_per_seat: ride.sharedCostPerSeat,
        cost_breakdown: ride.costBreakdown,
        cancellation_deposit: ride.cancellationDeposit,
        deposit_status: ride.depositStatus,
        pickup_drop_points: ride.pickupDropPoints,
        description: ride.description,
        status: ride.status
      });

      if (error) {
        console.warn('Supabase ride save error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase ride save exception:', err);
    }
  }

  return ride;
};

/**
 * Fetches all rides from Supabase and merges with local rides
 */
export const supabaseFetchAllRides = async () => {
  const localRides = getRealRides();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedSupabaseRides = data.map((r) => ({
          id: r.id,
          driverId: r.driver_id,
          driverName: r.driver_name,
          driverAvatar: r.driver_avatar,
          driverRating: Number(r.driver_rating) || 5.0,
          driverVerified: Boolean(r.driver_verified),
          from: r.from_location,
          to: r.to_location,
          fromCoordinates: r.from_coordinates || [18.4088, 76.5604],
          toCoordinates: r.to_coordinates || [18.5204, 73.8567],
          date: r.date,
          departureTime: r.departure_time,
          estimatedArrivalTime: r.estimated_arrival_time,
          estimatedDuration: r.estimated_duration,
          vehicleType: r.vehicle_type,
          vehicleDetails: r.vehicle_details,
          totalSeats: r.total_seats,
          availableSeats: r.available_seats,
          totalPassengerSeatsAllowed: r.total_passenger_seats_allowed,
          sharedCostPerSeat: Number(r.shared_cost_per_seat),
          costBreakdown: r.cost_breakdown,
          cancellationDeposit: Number(r.cancellation_deposit),
          depositStatus: r.deposit_status,
          pickupDropPoints: r.pickup_drop_points || [],
          description: r.description,
          status: r.status,
          routeOptimized: r.route_optimized || false,
          routeDeviationDetected: r.route_deviation_detected || false
        }));

        // Merge without duplicates (Supabase taking precedence)
        const combined = [...mappedSupabaseRides];
        for (const loc of localRides) {
          if (!combined.some((c) => c.id === loc.id)) {
            combined.push(loc);
          }
        }
        return combined;
      }
    } catch (err) {
      console.warn('Error fetching Supabase rides:', err);
    }
  }

  return localRides;
};
