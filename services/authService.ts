import { supabase } from './supabaseClient';

export const authService = {
  async getUserId() {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  },

  // Fix: Added signal parameter
  async ensureUserExists(userId: string, signal?: AbortSignal) {
    const { data: profile } = await supabase.from('users').select('id', { signal }).eq('id', userId).maybeSingle();
    if (!profile) {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        await supabase.from('users').upsert({
          id: userId, 
          email: auth.user.email,
          full_name: auth.user.user_metadata?.full_name || 'مدير جديد',
          agency_name: auth.user.user_metadata?.agency_name || 'وكالة الشويع للقات'
        }, { signal }); // Pass signal
      }
    }
  },

  // Fix: Added signal parameter
  async getFullProfile(userId: string, signal?: AbortSignal) {
    const [u, s] = await Promise.all([
      supabase.from('users').select('*', { signal }).eq('id', userId).maybeSingle(), // Pass signal
      supabase.from('user_settings').select('*', { signal }).eq('user_id', userId).maybeSingle() // Pass signal
    ]);
    return { ...(u?.data || {}), ...(s?.data?.accounting_settings || {}) };
  },

  // Fix: Added signal parameter
  async updateProfile(userId: string, updates: any, signal?: AbortSignal) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single({ signal }); // Pass signal
    if (error) throw error;
    return data;
  }
};