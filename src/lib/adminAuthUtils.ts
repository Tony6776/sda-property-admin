import { supabase } from "@/integrations/supabase/client";

export interface AdminProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

/**
 * Check if user is authenticated and has admin role
 */
export async function checkAdminAuth(): Promise<{ isAdmin: boolean; profile: AdminProfile | null }> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { isAdmin: false, profile: null };
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name, role, is_active')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return { isAdmin: false, profile: null };
    }

    // Check if user is admin and active
    const isAdmin = profile.role === 'admin' && profile.is_active === true;

    return { isAdmin, profile };
  } catch (error) {
    console.error('Error checking admin auth:', error);
    return { isAdmin: false, profile: null };
  }
}

/**
 * Get current admin session
 */
export async function getAdminSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign out admin user
 */
export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Listen to auth state changes
 */
export function onAdminAuthStateChange(callback: (isAdmin: boolean, profile: AdminProfile | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      callback(false, null);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      const { isAdmin, profile } = await checkAdminAuth();
      callback(isAdmin, profile);
    }
  });
}
