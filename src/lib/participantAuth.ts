import { supabase } from "@/integrations/supabase/client";

export async function checkParticipantAuth() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { isAuthenticated: false, participant: null };
    }

    // Check if user has participant profile
    const { data: participant, error } = await supabase
      .from('participants')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !participant) {
      return { isAuthenticated: false, participant: null };
    }

    return { isAuthenticated: true, participant };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, participant: null };
  }
}

export async function signOutParticipant() {
  await supabase.auth.signOut();
}
