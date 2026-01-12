import { supabase } from '../supabaseClient';
import { logger } from '../loggerService';
import { indexedDbService } from '../indexedDbService';
import { authService } from '../authService';

// Custom AbortError class for explicit abortion signals
class CustomAbortError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'AbortError';
  }
}

export const CACHE_TTL = 30000; 
export const l1Cache: Record<string, { data: any, timestamp: number }> = {};

export const cleanPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;
  const cleaned = { ...payload };
  const keysToRemove = ['image_base66_data', 'image_mime_type', 'image_file_name', 'record_type_for_image', 'tempId', 'originalId', 'created_at', 'updated_at', '_offline'];
  keysToRemove.forEach(key => delete cleaned[key]);
  return cleaned;
};

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: (signal?: AbortSignal) => Promise<{ data: T | null, error: any }>, key: string, forceFresh = false, retries = 2, signal?: AbortSignal): Promise<T> {
  if (!forceFresh && l1Cache[key] && (Date.now() - l1Cache[key].timestamp < CACHE_TTL)) {
    return l1Cache[key].data as T;
  }
  
  let lastError: any = null;
  
  for (let i = 0; i <= retries; i++) {
    if (signal?.aborted) {
      logger.warn(`Request for ${key} was aborted by signal (during retry loop).`);
      // Fix: Use the custom AbortError class
      throw new CustomAbortError('Request aborted by signal.'); 
    }

    try {
      const { data, error } = await fn(signal); // Pass signal to the function
      if (signal?.aborted) { // Check signal again after fn() resolves, in case it was aborted while fn() was running
        logger.warn(`Request for ${key} was aborted by signal (after fetch).`);
        // We throw an AbortError here to break the retry loop and trigger cache fallback.
        // Fix: Use the custom AbortError class
        throw new CustomAbortError('Request aborted by signal.');
      }
      if (!error && data !== null) {
        l1Cache[key] = { data, timestamp: Date.now() };
        indexedDbService.saveData(key, data).catch(() => {});
        return data;
      }
      if (error) throw error;
    } catch (err: any) {
      lastError = err;
      if (err.name === 'AbortError') {
        logger.warn(`Request for ${key} was aborted (caught AbortError).`);
        // If an AbortError is caught, we stop retrying and proceed to cache fallback.
        break; 
      }
      const isTransient = err.name === 'TypeError' || err.message?.toLowerCase().includes('fetch') || err.status >= 500;
      
      if (isTransient && i < retries && navigator.onLine) {
        await wait(1000 * (i + 1));
        continue;
      }
      
      const isNetworkError = !navigator.onLine || err.message?.toLowerCase().includes('fetch');
      if (!isNetworkError) {
        logger.warn(`Cloud fetch error for ${key}:`, err);
      } else {
        logger.info(`Offline mode or network error for ${key}. Falling back to cache.`);
      }
      break;
    }
  }
  
  // Attempt to retrieve data from IndexedDB cache if network fetch failed or was aborted.
  const localData = await indexedDbService.getData(key);
  return (localData || []) as T;
}

export const baseService = {
  async getUserId() {
    return authService.getUserId();
  },

  async queueOffline(uid: string, action: string, payload: any) {
    const tempId = payload.id || crypto.randomUUID();
    await indexedDbService.addOperation({ 
      userId: uid, 
      action: action as any, 
      tempId, 
      payload: { ...payload, id: tempId, user_id: uid } 
    });
    return { ...payload, id: tempId, created_at: new Date().toISOString(), _offline: true };
  },

  async safeUpsert(table: string, payload: any, actionName: string, skipQueue = false, signal?: AbortSignal) {
    const uid = await this.getUserId();
    if (!uid) throw new Error("Unauthenticated");

    try {
      if (!navigator.onLine && !skipQueue) {
        return await this.queueOffline(uid, actionName, payload);
      }
      // Pass signal to the upsert method
      const { data, error } = await supabase.from(table).upsert({ ...cleanPayload(payload), user_id: uid }, { onConflict: 'id', signal }).select().single();
      if (error) throw error;
      return data;
    } catch (e: any) {
      // Fix: Ensure AbortError is handled correctly, using the custom class
      if (e.name === 'AbortError' || e instanceof CustomAbortError) { 
        logger.warn(`Upsert to ${table} aborted:`, e.message);
        throw e; // Re-throw AbortError
      }
      const isNetworkError = e.name === 'TypeError' || e.message?.toLowerCase().includes('fetch') || !navigator.onLine;
      
      if (isNetworkError && !skipQueue) {
        logger.info(`Request to ${table} failed due to network. Queuing offline...`);
        return await this.queueOffline(uid, actionName, payload);
      }
      
      logger.error(`SafeUpsert Error in ${table}:`, e);
      throw e;
    }
  }
};