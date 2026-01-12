
import { supabase } from './supabaseClient';
import { logger } from './loggerService';
import { indexedDbService } from './indexedDbService';
import { baseService, cleanPayload } from './api/base';
import { salesService } from './api/sales';
import { inventoryService } from './api/inventory';
import { userService } from './api/user';
import { financeApiService } from './api/finance';
import { syncService } from './syncService'; // Fix: Import syncService
import { ActivityLog } from '../types'; // Import ActivityLog type

export const dataService = {
  onOfflineQueueCountChange: (count: number) => {},
  
  async updateOfflineQueueCount() {
    const count = await indexedDbService.getQueueCount();
    this.onOfflineQueueCountChange(count);
  },

  // Auth & Profile
  getUserId: userService.getUserId,
  ensureUserExists: userService.ensureUserExists,
  getFullProfile: userService.getFullProfile,
  updateProfile: userService.updateProfile,
  updateSettings: userService.updateSettings,

  // Global Sync logic remains central
  async processOfflineQueue(signal?: AbortSignal) {
    const uid = await this.getUserId();
    if (!uid) return;
    
    const actions = {
      saveSale: (payload: any, skip?: boolean) => this.saveSale(payload, skip, signal),
      savePurchase: (payload: any, skip?: boolean) => this.savePurchase(payload, skip, signal),
      saveCustomer: (payload: any, skip?: boolean) => this.saveCustomer(payload, skip, signal),
      saveSupplier: (payload: any, skip?: boolean) => this.saveSupplier(payload, skip, signal),
      saveVoucher: (payload: any, skip?: boolean) => this.saveVoucher(payload, skip, signal),
      saveExpense: (payload: any, skip?: boolean) => this.saveExpense(payload, skip, signal),
      saveCategory: (payload: any, skip?: boolean) => this.saveCategory(payload, skip, signal),
      // Fix: Made 'skip' optional for deleteRecord in actions object
      deleteRecord: (table: string, id: string, imageUrl?: string, recordTypeForImage?: string, skip?: boolean) => this.deleteRecord(table, id, imageUrl, recordTypeForImage, skip, signal),
      returnSale: (id: string, skip?: boolean) => this.returnSale(id, skip, signal),
      returnPurchase: (id: string, skip?: boolean) => this.returnPurchase(id, skip, signal),
      updateSettings: (userId: string, settings: any, skip?: boolean) => this.updateSettings(userId, settings, skip, signal),
      saveWaste: (payload: any, skip?: boolean) => this.saveWaste(payload, skip, signal),
      saveOpeningBalance: (payload: any, skip?: boolean) => this.saveOpeningBalance(payload, skip, signal),
      saveExpenseTemplate: (payload: any, skip?: boolean) => this.saveExpenseTemplate(payload, skip, signal),
      saveNotification: (payload: any, skip?: boolean) => this.saveNotification(payload, skip, signal),
      markAllNotificationsRead: () => this.markAllNotificationsRead(signal),
    };

    await syncService.processQueue(uid, actions, signal);
    this.updateOfflineQueueCount();
  },

  // Inventory
  getCategories: (f?: boolean, signal?: AbortSignal) => inventoryService.getCategories(f, signal),
  getWaste: (f?: boolean, signal?: AbortSignal) => inventoryService.getWaste(f, signal),
  saveCategory: (cat: any, skip?: boolean, signal?: AbortSignal) => inventoryService.saveCategory(cat, skip, signal),
  saveWaste: (w: any, skip?: boolean, signal?: AbortSignal) => inventoryService.saveWaste(w, skip, signal),

  // Sales & Business
  getSales: (f?: boolean, signal?: AbortSignal) => salesService.getSales(f, signal),
  getPurchases: (f?: boolean, signal?: AbortSignal) => salesService.getPurchases(f, signal),
  saveSale: (sale: any, skip?: boolean, signal?: AbortSignal) => salesService.saveSale(sale, skip, signal),
  savePurchase: (purchase: any, skip?: boolean, signal?: AbortSignal) => salesService.savePurchase(purchase, skip, signal),
  returnSale: (id: string, skip?: boolean, signal?: AbortSignal) => salesService.returnSale(id, skip, signal),
  returnPurchase: (id: string, skip?: boolean, signal?: AbortSignal) => salesService.returnPurchase(id, skip, signal),

  // CRM
  getCustomers: (f?: boolean, signal?: AbortSignal) => userService.getCustomers(f, signal),
  getSuppliers: (f?: boolean, signal?: AbortSignal) => userService.getSuppliers(f, signal),
  saveCustomer: (c: any, skip?: boolean, signal?: AbortSignal) => userService.saveCustomer(c, skip, signal),
  saveSupplier: (s: any, skip?: boolean, signal?: AbortSignal) => userService.saveSupplier(s, skip, signal),

  // Finance
  getVouchers: (f?: boolean, signal?: AbortSignal) => financeApiService.getVouchers(f, signal),
  getExpenses: (f?: boolean, signal?: AbortSignal) => financeApiService.getExpenses(f, signal),
  getExpenseTemplates: (f?: boolean, signal?: AbortSignal) => financeApiService.getExpenseTemplates(f, signal),
  saveVoucher: (v: any, skip?: boolean, signal?: AbortSignal) => financeApiService.saveVoucher(v, skip, signal),
  saveExpense: (e: any, skip?: boolean, signal?: AbortSignal) => financeApiService.saveExpense(e, skip, signal),
  saveExpenseTemplate: (t: any, skip?: boolean, signal?: AbortSignal) => financeApiService.saveExpenseTemplate(t, skip, signal),
  saveOpeningBalance: (b: any, skip?: boolean, signal?: AbortSignal) => financeApiService.saveOpeningBalance(b, skip, signal),

  // Notifications & Logging
  getNotifications: (f?: boolean, signal?: AbortSignal) => userService.getNotifications(f, signal),
  getActivityLogs: (signal?: AbortSignal) => userService.getActivityLogs(signal),
  saveNotification: (n: any, skip?: boolean, signal?: AbortSignal) => userService.saveNotification(n, skip, signal),
  markAllNotificationsRead: (signal?: AbortSignal) => userService.markAllNotificationsRead(signal),
  deleteAllNotificationsOlderThan: (days: number, signal?: AbortSignal) => userService.deleteAllNotificationsOlderThan(days, signal),
  // Fix: Corrected type for 'type' parameter
  logActivity: (userId: string, action: string, details: string, type: ActivityLog['type'], signal?: AbortSignal) => userService.logActivity(userId, action, details, type, signal),

  // Core Utilities
  async deleteRecord(table: string, id: string, imageUrl?: string, recordTypeForImage?: string, skipQueue = false, signal?: AbortSignal) {
    const uid = await this.getUserId();
    if (!uid) throw new Error("Unauthenticated");

    if (!navigator.onLine && !skipQueue) {
      await indexedDbService.addOperation({ userId: uid!, action: 'deleteRecord', tableName: table, originalId: id, payload: { id, imageUrl, record_type_for_image: recordTypeForImage } });
      this.updateOfflineQueueCount();
      return true;
    }
    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', uid, { signal }); // Pass signal
    if (error) throw error;
    return true;
  },

  base64ToBytes(base64: string): Uint8Array {
    const binary_string = window.atob(base64.split(',')[1] || base64);
    const len = binary_string.length;
    // Declare 'bytes' here
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binary_string.charCodeAt(i); }
    return bytes;
  },

  async prepareBackupPackage(userId: string, currentData?: any, signal?: AbortSignal): Promise<any> {
    if (!userId) throw new Error("User ID required for backup");
    const backup = {
      timestamp: new Date().toISOString(),
      metadata: { app: "Al-Shwaia Smart System", version: "3.1.0" },
      userProfile: currentData?.profile || await this.getFullProfile(userId, signal),
      customers: currentData?.customers || await this.getCustomers(true, signal),
      suppliers: currentData?.suppliers || await this.getSuppliers(true, signal),
      categories: currentData?.categories || await this.getCategories(true, signal),
      sales: currentData?.sales || await this.getSales(true, signal),
      purchases: currentData?.purchases || await this.getPurchases(true, signal),
      vouchers: currentData?.vouchers || await this.getVouchers(true, signal),
      expenses: currentData?.expenses || await this.getExpenses(true, signal),
      waste: currentData?.waste || await this.getWaste(true, signal),
      notifications: currentData?.notifications || await this.getNotifications(true, signal),
      expenseTemplates: currentData?.expenseTemplates || await this.getExpenseTemplates(true, signal),
    };
    return backup;
  },

  async restoreBackupData(userId: string, backup: any, signal?: AbortSignal): Promise<void> {
    if (!userId) throw new Error("User ID required for restoration");
    
    const collections = [
      { key: 'customers', table: 'customers' },
      { key: 'suppliers', table: 'suppliers' },
      { key: 'categories', table: 'categories' },
      { key: 'sales', table: 'sales' },
      { key: 'purchases', table: 'purchases' },
      { key: 'vouchers', table: 'vouchers' },
      { key: 'expenses', table: 'expenses' },
      { key: 'waste', table: 'waste' },
      { key: 'expenseTemplates', table: 'expense_templates' }
    ];

    for (const collection of collections) {
      const data = backup[collection.key];
      if (Array.isArray(data) && data.length > 0) {
        logger.info(`Restoring ${data.length} records for ${collection.table}...`);
        
        const cleanedData = data.map(item => ({
          ...cleanPayload(item),
          user_id: userId
        }));

        const chunkSize = 50;
        for (let i = 0; i < cleanedData.length; i += chunkSize) {
          const chunk = cleanedData.slice(i, i + chunkSize);
          const { error } = await supabase.from(collection.table).upsert(chunk, { signal }); // Pass signal
          if (error) {
            logger.error(`Error restoring chunk for ${collection.table}:`, error);
          }
        }
      }
    }
  }
};
