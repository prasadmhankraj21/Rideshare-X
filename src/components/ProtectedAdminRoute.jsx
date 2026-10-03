import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminAuth } from '../pages/AdminAuth';
import { validateAdminToken, DESIGNATED_ADMIN } from '../services/adminAuthService';

/**
 * Route protection wrapper for all Administrative pages.
 * Prevents unauthorized manual URL navigation, hash entries, or role tampering.
 */
export const ProtectedAdminRoute = ({ children }) => {
  const { currentRole, currentUser, triggerToast, setActiveTab } = useApp();
  const tokenValidation = validateAdminToken();

  const isAuthorized =
    tokenValidation.authorized &&
    currentRole === 'admin' &&
    currentUser?.email?.toLowerCase() === DESIGNATED_ADMIN.email.toLowerCase();

  useEffect(() => {
    if (!isAuthorized) {
      triggerToast(
        'Access Denied (403)',
        'Admin Panel is strictly restricted to the designated administrator account.',
        'error'
      );
      // Clean up URL hash or search params if unauthorized manual URL was typed
      if (window.location.hash.includes('admin') || window.location.search.includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return <AdminAuth restrictedNotice={true} />;
  }

  return children;
};
