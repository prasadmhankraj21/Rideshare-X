/**
 * Firebase Project Configuration for Rideshare_X
 * Real-time cross-device data sync & authentication
 */

export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyBhc24sp7C3It2dhpsPkV4W87XjzZN-X-A",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "rideshare-x.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "rideshare-x",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "rideshare-x.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "859622089683",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:859622089683:web:95c4fee71168243881c526",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-WF6M1KT45Z"
};

/**
 * Returns true if valid Firebase configuration values are present.
 */
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.startsWith("AIza")
  );
};
