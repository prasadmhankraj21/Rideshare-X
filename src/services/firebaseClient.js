import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig.js';
import {
  getRealUsers,
  saveRealUser,
  deleteRealUser,
  getRealRides,
  saveRealRide,
  deleteRealRide,
  getRealBookings,
  saveRealBooking,
  deleteRealBooking
} from './supabaseClient.js';

// Initialize Firebase App safely if configured
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('[Firebase] Initialization error:', err);
  }
}

export { auth, db, isFirebaseConfigured };

/**
 * Register Driver using Firebase Auth + Firestore
 */
export const firebaseSignUpDriver = async ({ email, password, fullName, phone, city }) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const cleanPhone = phone.trim();
  const cleanCity = city.trim();

  // If Firebase is configured, use Firebase Auth + Firestore
  if (isFirebaseConfigured() && auth && db) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, { displayName: cleanName });

      const driverProfile = {
        id: fbUser.uid,
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        city: cleanCity,
        role: 'driver',
        verificationStatus: 'verified',
        rating: 5.0,
        tripsCompleted: 0,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        vehicle: {
          make: 'Maruti Suzuki',
          model: 'Grand Vitara',
          year: 2024,
          plateNumber: 'MH-12-SG-1983',
          color: 'Pearl White',
          seatingCapacity: 5,
          fuelType: 'Hybrid',
          features: ['AC', 'Music', 'Fastag', 'Luggage Space']
        },
        cancellationDepositBalance: 500,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', fbUser.uid), driverProfile);
      saveRealUser(driverProfile); // sync locally as cache
      return { success: true, user: driverProfile };
    } catch (err) {
      console.error('[Firebase Driver Signup]', err);
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'A driver account with this email already exists. Please sign in.' };
      }
      if (err.code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      return { success: false, error: err.message };
    }
  }

  // Fallback to local store (preserves offline / pre-config functionality)
  const existing = getRealUsers().find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'A driver account with this email already exists.' };
  }

  const driverProfile = {
    id: 'drv-' + Date.now(),
    email: cleanEmail,
    name: cleanName,
    phone: cleanPhone,
    city: cleanCity,
    role: 'driver',
    verificationStatus: 'verified',
    rating: 5.0,
    tripsCompleted: 0,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    vehicle: {
      make: 'Maruti Suzuki',
      model: 'Grand Vitara',
      year: 2024,
      plateNumber: 'MH-12-SG-1983',
      color: 'Pearl White',
      seatingCapacity: 5,
      fuelType: 'Hybrid',
      features: ['AC', 'Music', 'Fastag', 'Luggage Space']
    },
    cancellationDepositBalance: 500,
    createdAt: new Date().toISOString()
  };

  saveRealUser(driverProfile);
  return { success: true, user: driverProfile };
};

/**
 * Register Passenger using Firebase Auth + Firestore
 */
export const firebaseSignUpPassenger = async ({ email, password, fullName, phone }) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const cleanPhone = phone.trim();

  if (isFirebaseConfigured() && auth && db) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, { displayName: cleanName });

      const passengerProfile = {
        id: fbUser.uid,
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        role: 'passenger',
        rating: 5.0,
        tripsCompleted: 0,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', fbUser.uid), passengerProfile);
      saveRealUser(passengerProfile);
      return { success: true, user: passengerProfile };
    } catch (err) {
      console.error('[Firebase Passenger Signup]', err);
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'A passenger account with this email already exists. Please sign in.' };
      }
      if (err.code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      return { success: false, error: err.message };
    }
  }

  const existing = getRealUsers().find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'A passenger account with this email already exists.' };
  }

  const passengerProfile = {
    id: 'psg-' + Date.now(),
    email: cleanEmail,
    name: cleanName,
    phone: cleanPhone,
    role: 'passenger',
    rating: 5.0,
    tripsCompleted: 0,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    createdAt: new Date().toISOString()
  };

  saveRealUser(passengerProfile);
  return { success: true, user: passengerProfile };
};

/**
 * Sign In User using Firebase Auth + Firestore
 */
export const firebaseSignInUser = async ({ email, password, expectedRole }) => {
  const cleanEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured() && auth && db) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      // Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profile = userDocSnap.data();
        if (expectedRole && profile.role !== expectedRole) {
          return {
            success: false,
            error: `This account is registered as a ${profile.role}. Please log in via the ${profile.role} portal.`
          };
        }
        saveRealUser(profile);
        return { success: true, user: profile };
      }

      // If document doesn't exist in Firestore, create basic profile
      const basicProfile = {
        id: fbUser.uid,
        email: cleanEmail,
        name: fbUser.displayName || cleanEmail.split('@')[0],
        role: expectedRole || 'passenger',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, basicProfile);
      saveRealUser(basicProfile);
      return { success: true, user: basicProfile };
    } catch (err) {
      // If Firebase sign in fails, check local fallback accounts
      console.warn('[Firebase Sign In fallback to local cache]:', err.message);
    }
  }

  // Fallback to local accounts so previous logins continue working seamlessly
  const localUsers = getRealUsers();
  const user = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    if (expectedRole && user.role !== expectedRole) {
      return {
        success: false,
        error: `This account is registered as a ${user.role}. Please switch to the ${user.role} login.`
      };
    }
    return { success: true, user };
  }

  return { success: false, error: 'Invalid email or password.' };
};

/**
 * Save Ride to Cloud Firestore (Real-Time Cloud Persistence)
 */
export const firebaseSaveRide = async (ride) => {
  const completeRide = {
    ...ride,
    id: ride.id || 'ride-' + Date.now(),
    status: ride.status || 'published',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'rides', completeRide.id), completeRide);
    } catch (err) {
      console.error('[Firebase Save Ride]', err);
    }
  }

  // Always keep local persistent copy in sync
  saveRealRide(completeRide);
  return completeRide;
};

/**
 * Fetch all rides from Cloud Firestore (including active, scheduled, in_progress, and completed)
 */
export const firebaseFetchAllRides = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const ridesCol = collection(db, 'rides');
      const snapshot = await getDocs(ridesCol);
      const remoteRides = [];
      snapshot.forEach((docSnap) => {
        remoteRides.push(docSnap.data());
      });

      if (remoteRides.length > 0) {
        // Update local cache
        remoteRides.forEach((r) => saveRealRide(r));
        return remoteRides;
      }
    } catch (err) {
      console.warn('[Firebase Fetch Rides Error]:', err);
    }
  }

  // Return locally cached real rides
  return getRealRides();
};

/**
 * Real-time listener for rides collection
 * Whenever ANY device publishes, updates, or completes a ride, callback is instantly invoked!
 */
export const subscribeToRealtimeRides = (callback) => {
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const ridesCol = collection(db, 'rides');

    const unsubscribe = onSnapshot(
      ridesCol,
      (snapshot) => {
        const liveRides = [];
        snapshot.forEach((docSnap) => {
          liveRides.push(docSnap.data());
        });
        liveRides.forEach((r) => saveRealRide(r));
        if (callback) callback(liveRides);
      },
      (err) => {
        console.warn('[Firebase Realtime Rides Error]:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase Subscribe Error]:', err);
    return () => {};
  }
};

/**
 * Delete Ride from Cloud Firestore & local cache
 */
export const firebaseDeleteRide = async (rideId) => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'rides', rideId));
    } catch (err) {
      console.warn('[Firebase Delete Ride]', err);
    }
  }
  deleteRealRide(rideId);
  return true;
};

/**
 * Delete Booking from Cloud Firestore & local cache
 */
export const firebaseDeleteBooking = async (bookingId) => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (err) {
      console.warn('[Firebase Delete Booking]', err);
    }
  }
  deleteRealBooking(bookingId);
  return true;
};

/**
 * Delete User (Driver or Passenger) from Cloud Firestore & local cache
 */
export const firebaseDeleteUser = async (userId) => {
  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.warn('[Firebase Delete User]', err);
    }
  }
  deleteRealUser(userId);
  return true;
};

/**
 * Save booking to Cloud Firestore
 */
export const firebaseSaveBooking = async (booking) => {
  const completeBooking = {
    ...booking,
    id: booking.id || 'book-' + Date.now(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'bookings', completeBooking.id), completeBooking);
    } catch (err) {
      console.error('[Firebase Save Booking]', err);
    }
  }

  saveRealBooking(completeBooking);
  return completeBooking;
};

/**
 * Fetch all bookings from Cloud Firestore
 */
export const firebaseFetchAllBookings = async () => {
  if (isFirebaseConfigured() && db) {
    try {
      const bookingsCol = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsCol);
      const remoteBookings = [];
      snapshot.forEach((docSnap) => {
        remoteBookings.push(docSnap.data());
      });

      if (remoteBookings.length > 0) {
        // Update local cache
        remoteBookings.forEach((b) => saveRealBooking(b));
        return remoteBookings;
      }
    } catch (err) {
      console.warn('[Firebase Fetch Bookings Error]:', err);
    }
  }

  // Fallback to locally cached real bookings
  return getRealBookings();
};

/**
 * Real-time listener for bookings collection
 */
export const subscribeToRealtimeBookings = (callback) => {
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const bookingsCol = collection(db, 'bookings');
    const unsubscribe = onSnapshot(
      bookingsCol,
      (snapshot) => {
        const liveBookings = [];
        snapshot.forEach((docSnap) => {
          liveBookings.push(docSnap.data());
        });
        liveBookings.forEach((b) => saveRealBooking(b));
        if (callback) callback(liveBookings);
      },
      (err) => {
        console.warn('[Firebase Realtime Bookings Error]:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase Bookings Subscribe Error]:', err);
    return () => {};
  }
};

/**
 * Migrates locally saved rides and users to Firebase Firestore upon initial connection
 */
export const syncLocalDataToFirebase = async () => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const localRides = getRealRides();
    for (const r of localRides) {
      if (['published', 'active', 'scheduled', 'in_progress'].includes(r.status)) {
        await setDoc(doc(db, 'rides', r.id), r, { merge: true });
      }
    }

    const localUsers = getRealUsers();
    for (const u of localUsers) {
      await setDoc(doc(db, 'users', u.id), u, { merge: true });
    }

    const localBookings = getRealBookings();
    for (const b of localBookings) {
      await setDoc(doc(db, 'bookings', b.id), b, { merge: true });
    }
  } catch (err) {
    console.warn('[Firebase Sync Local Data Warning]:', err);
  }
};
