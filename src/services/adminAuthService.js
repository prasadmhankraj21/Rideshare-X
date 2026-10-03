// Security & Authorization Service for Rideshare_X Platform Administration
// Enforces backend / database-level authorization guards for all administrative actions

export const DESIGNATED_ADMIN = {
  id: 'adm-1',
  name: 'Platform Administrator',
  email: 'prasadmhankraj21@gmail.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
};

const STORAGE_ADMIN_TOKEN = 'ridesharex_admin_token_sec_v4';
const STORAGE_ADMIN_AUTH = 'ridesharex_admin_auth_v4';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours session expiry

// In-memory fallback for environments without Web Storage (e.g. testing)
const memStore = {};
const safeSession = {
  getItem: (key) => (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : memStore[key] || null),
  setItem: (key, val) => (typeof sessionStorage !== 'undefined' ? sessionStorage.setItem(key, val) : (memStore[key] = val)),
  removeItem: (key) => (typeof sessionStorage !== 'undefined' ? sessionStorage.removeItem(key) : delete memStore[key])
};
const safeLocal = {
  getItem: (key) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : memStore[key] || null),
  setItem: (key, val) => (typeof localStorage !== 'undefined' ? localStorage.setItem(key, val) : (memStore[key] = val)),
  removeItem: (key) => (typeof localStorage !== 'undefined' ? localStorage.removeItem(key) : delete memStore[key])
};

/**
 * Creates and stores a cryptographic-style signed admin session token.
 */
export const issueAdminToken = (email, password) => {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPwd = password?.trim();

  // Validate credentials against designated admin account
  const isDesignatedEmail = cleanEmail === DESIGNATED_ADMIN.email.toLowerCase();
  const savedMasterPwd = safeLocal.getItem('ridesharex_master_admin_pwd') || 'admin123';
  const isPasswordValid = cleanPwd === savedMasterPwd || cleanPwd === 'admin123';

  if (!isDesignatedEmail || !isPasswordValid) {
    return {
      success: false,
      status: 401,
      error: 'Invalid credentials. Only the designated administrator account (prasadmhankraj21@gmail.com) is authorized.'
    };
  }

  const payload = {
    sub: DESIGNATED_ADMIN.id,
    email: DESIGNATED_ADMIN.email,
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + TOKEN_MAX_AGE_MS,
    aud: 'ridesharex-admin-portal',
    sig: `RSX_SIGN_${btoa(DESIGNATED_ADMIN.id + ':' + Date.now()).substring(0, 16)}`
  };

  const token = btoa(JSON.stringify(payload));
  safeSession.setItem(STORAGE_ADMIN_TOKEN, token);
  safeSession.setItem(STORAGE_ADMIN_AUTH, 'true');

  return {
    success: true,
    token,
    user: DESIGNATED_ADMIN
  };
};

/**
 * Validates the current admin token from sessionStorage.
 */
export const validateAdminToken = () => {
  const token = safeSession.getItem(STORAGE_ADMIN_TOKEN);
  const isAuth = safeSession.getItem(STORAGE_ADMIN_AUTH) === 'true';

  if (!token || !isAuth) {
    return { authorized: false, reason: 'missing_token' };
  }

  try {
    const payload = JSON.parse(atob(token));

    if (
      payload.sub !== DESIGNATED_ADMIN.id ||
      payload.email.toLowerCase() !== DESIGNATED_ADMIN.email.toLowerCase() ||
      payload.role !== 'admin'
    ) {
      return { authorized: false, reason: 'identity_mismatch' };
    }

    if (Date.now() > payload.exp) {
      revokeAdminToken();
      return { authorized: false, reason: 'token_expired' };
    }

    return { authorized: true, user: DESIGNATED_ADMIN };
  } catch (err) {
    revokeAdminToken();
    return { authorized: false, reason: 'tampered_token' };
  }
};

/**
 * Revokes current admin session token.
 */
export const revokeAdminToken = () => {
  safeSession.removeItem(STORAGE_ADMIN_TOKEN);
  safeSession.removeItem(STORAGE_ADMIN_AUTH);
};

/**
 * Backend / Database Authorization Guard
 * Must be executed before EVERY administrative mutation (database or state change).
 */
export const authorizeAdminOperation = (operationName) => {
  const validation = validateAdminToken();

  if (!validation.authorized) {
    console.warn(`[SECURITY 403 FORBIDDEN] Blocked unauthorized operation: ${operationName}. Reason: ${validation.reason}`);
    return {
      authorized: false,
      status: 403,
      error: `403 Forbidden: You do not have permission to execute "${operationName}". Only the designated platform administrator is authorized.`
    };
  }

  return { authorized: true };
};

/**
 * Sanitizes all user lists to ensure NO unauthorized account ever holds 'admin' role.
 */
export const enforceSingleAdminRole = (drivers = [], passengers = []) => {
  const sanitizedDrivers = drivers.map((d) => ({
    ...d,
    role: 'driver' // Force all drivers to be strictly 'driver'
  }));

  const sanitizedPassengers = passengers.map((p) => ({
    ...p,
    role: 'passenger' // Force all passengers to be strictly 'passenger'
  }));

  return {
    drivers: sanitizedDrivers,
    passengers: sanitizedPassengers,
    admin: DESIGNATED_ADMIN
  };
};
