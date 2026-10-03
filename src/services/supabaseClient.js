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
