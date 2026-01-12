
import { supabase } from '../supabaseClient';
import { baseService, withRetry } from './base';
import { QatCategory, Waste } from '../../types';

export const inventoryService = {
  async getCategories(f = false, signal?: AbortSignal) { 
    return withRetry<QatCategory[]>(() => supabase.from('categories').select('*', { count: 'exact', head: false, signal }).order('name'), 'cats', f, 2, signal); 
  },

  async getWaste(f = false, signal?: AbortSignal) { 
    return withRetry<Waste[]>(() => supabase.from('waste').select('*', { count: 'exact', head: false, signal }).order('date', { ascending: false }), 'waste', f, 2, signal); 
  },

  async saveCategory(cat: any, skipQueue = false, signal?: AbortSignal) { 
    return baseService.safeUpsert('categories', cat, 'saveCategory', skipQueue, signal); 
  },

  async saveWaste(w: any, skipQueue = false, signal?: AbortSignal) { 
    return baseService.safeUpsert('waste', w, 'saveWaste', skipQueue, signal); 
  }
};
