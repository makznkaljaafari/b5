
import { supabase } from '../supabaseClient';
import { baseService, withRetry } from './base';
import { Sale, Purchase } from '../../types';

export const salesService = {
  async getSales(f = false, signal?: AbortSignal) { 
    return withRetry<Sale[]>(() => supabase.from('sales').select('*', { count: 'exact', head: false, signal }).order('date', { ascending: false }).limit(200), 'sales', f, 2, signal); 
  },
  
  async getPurchases(f = false, signal?: AbortSignal) { 
    return withRetry<Purchase[]>(() => supabase.from('purchases').select('*', { count: 'exact', head: false, signal }).order('date', { ascending: false }).limit(200), 'purchs', f, 2, signal); 
  },

  async saveSale(sale: any, skipQueue = false, signal?: AbortSignal) { 
    return baseService.safeUpsert('sales', sale, 'saveSale', skipQueue, signal); 
  },

  async savePurchase(purchase: any, skipQueue = false, signal?: AbortSignal) { 
    return baseService.safeUpsert('purchases', purchase, 'savePurchase', skipQueue, signal); 
  },

  async returnSale(id: string, skipQueue = false, signal?: AbortSignal) {
    const uid = await baseService.getUserId();
    if (!uid) throw new Error("Unauthenticated");
    if (!navigator.onLine && !skipQueue) {
      return baseService.queueOffline(uid, 'returnSale', { id });
    }
    const { error } = await supabase.rpc('return_sale', { sale_uuid: id, user_uuid: uid }, { signal }); // Pass signal
    if (error) throw error;
    return true;
  },

  async returnPurchase(id: string, skipQueue = false, signal?: AbortSignal) {
    const uid = await baseService.getUserId();
    if (!uid) throw new Error("Unauthenticated");
    if (!navigator.onLine && !skipQueue) {
      return baseService.queueOffline(uid, 'returnPurchase', { id });
    }
    const { error } = await supabase.rpc('return_purchase', { purchase_uuid: id, user_uuid: uid }, { signal }); // Pass signal
    if (error) throw error;
    return true;
  }
};
