import { supabase } from '../supabaseClient';
import { baseService, withRetry, cleanPayload } from './base';
import { authService } from '../authService';
import { Customer, Supplier, AppNotification, ActivityLog } from '../../types';
import { logger } from '../loggerService';

export const userService = {
  getUserId: authService.getUserId,
  // Fix: Pass signal to authService.ensureUserExists
  ensureUserExists: (userId: string, signal?: AbortSignal) => authService.ensureUserExists(userId, signal),
  // Fix: Pass signal to authService.getFullProfile
  getFullProfile: (userId: string, signal?: AbortSignal) => authService.getFullProfile(userId, signal),
  // Fix: Pass signal to authService.updateProfile
  updateProfile: (userId: string, updates: any, signal?: AbortSignal) => authService.updateProfile(userId, updates, signal),

  async getCustomers(f = false, signal?: AbortSignal) { return withRetry<Customer[]>(() => supabase.from('customers').select('*', { count: 'exact', head: false, signal }).order('name'), 'custs', f, 2, signal); },
  async getSuppliers(f = false, signal?: AbortSignal) { return withRetry<Supplier[]>(() => supabase.from('suppliers').select('*', { count: 'exact', head: false, signal }).order('name'), 'supps', f, 2, signal); },
  async getNotifications(f = false, signal?: AbortSignal) { return withRetry<AppNotification[]>(() => supabase.from('notifications').select('*', { count: 'exact', head: false, signal }).order('date', {ascending: false}).limit(50), 'notifs', f, 2, signal); },
  async getActivityLogs(signal?: AbortSignal) { return withRetry<ActivityLog[]>(() => supabase.from('activity_log').select('*', { count: 'exact', head: false, signal }).order('timestamp', { ascending: false }).limit(50), 'logs', true, 2, signal); },

  async saveCustomer(c: any, skipQueue = false, signal?: AbortSignal) { return baseService.safeUpsert('customers', c, 'saveCustomer', skipQueue, signal); },
  async saveSupplier(s: any, skipQueue = false, signal?: AbortSignal) { return baseService.safeUpsert('suppliers', s, 'saveSupplier', skipQueue, signal); },
  async saveNotification(n: any, skipQueue = false, signal?: AbortSignal) { return baseService.safeUpsert('notifications', n, 'saveNotification', skipQueue, signal); },

  async updateSettings(userId: string, settings: any, skipQueue = false, signal?: AbortSignal) {
    if (!navigator.onLine && !skipQueue) {
      return baseService.queueOffline(userId, 'updateSettings', settings);
    }
    const { data, error } = await supabase.from('user_settings').upsert({ user_id: userId, accounting_settings: settings }, { onConflict: 'user_id', signal }).select().single();
    if (error) throw error;
    return data;
  },

  async markAllNotificationsRead(signal?: AbortSignal) {
    const uid = await baseService.getUserId();
    if (!uid) return;
    try {
      // Pass signal to the update method's options object
      await supabase.from('notifications').update({ read: true }).eq('user_id', uid).eq('read', false, { signal }); 
    } catch (e: any) {
      if (e.name === 'AbortError') { logger.warn("Mark notifications read aborted."); }
      else { logger.error("Failed to mark notifications read", e); }
    }
  },

  async deleteAllNotificationsOlderThan(days: number, signal?: AbortSignal) {
    const uid = await baseService.getUserId();
    if (!uid) throw new Error("Unauthenticated");
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    try {
      // Pass signal to the delete method's options object
      const { error } = await supabase.from('notifications').delete().eq('user_id', uid).lt('date', cutoffDate, { signal });
      if (error) throw error;
    } catch (e: any) {
      if (e.name === 'AbortError') { logger.warn("Delete old notifications aborted."); }
      else { logger.error("Failed to delete old notifications", e); }
    }
  },

  async logActivity(userId: string, action: string, details: string, type: ActivityLog['type'], signal?: AbortSignal) {
    try {
      // Pass signal to the insert method's options object
      await supabase.from('activity_log').insert({ user_id: userId, action, details, type, timestamp: new Date().toISOString() }, { signal }); 
    } catch (e: any) { 
      if (e.name === 'AbortError') { logger.warn(`Log activity for ${action} aborted.`); }
      else { logger.error(`Error in logActivity:`, e); }
    }
  }
};