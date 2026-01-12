
import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useInventory } from './InventoryContext'; 
import { useBusiness } from './BusinessContext';   
import { useFinance } from './FinanceContext';     
import { useSystem } from './SystemContext';       
import { dataService } from '../services/dataService';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { logger } from '../services/loggerService';
import { supabase } from '../services/supabaseClient';
import { useBackup } from '../hooks/useBackup';

const DataContext = createContext<any>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNotifications, addNotification, isOnline } = useUI();
  const { user, setUser } = useAuth();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const inv = useInventory();
  const bus = useBusiness();
  const fin = useFinance();
  const sys = useSystem();

  const syncIntervalRef = useRef<any>(null);

  const loadAllData = useCallback(async (userId: string, isSilent = false, signal?: AbortSignal) => {
    if (!userId) return;
    if (!isSilent) setIsDataLoaded(false);
    setIsSyncing(true);
    
    try {
      await dataService.ensureUserExists(userId, signal);
      const profile = await dataService.getFullProfile(userId, signal);
      if (profile) setUser(profile);

      const [custs, supps, cats, sls, purchs, vchs, exps, wst, notifs, expTemplates] = await Promise.all([
        dataService.getCustomers(false, signal),
        dataService.getSuppliers(false, signal),
        dataService.getCategories(false, signal),
        dataService.getSales(false, signal),
        dataService.getPurchases(false, signal),
        dataService.getVouchers(false, signal),
        dataService.getExpenses(false, signal),
        dataService.getWaste(false, signal),
        dataService.getNotifications(false, signal),
        dataService.getExpenseTemplates(false, signal)
      ]);

      bus.setCustomers(custs);
      bus.setSuppliers(supps);
      inv.setCategories(cats);
      bus.setSales(sls);
      bus.setPurchases(purchs);
      fin.setVouchers(vchs);
      fin.setExpenses(exps);
      fin.setWasteRecords(wst);
      fin.setExpenseTemplates(expTemplates);
      setNotifications(notifs);

      setIsDataLoaded(true);
      sys.setConnectionError(null);

      if (isOnline) {
        await dataService.processOfflineQueue(signal);
        await dataService.updateOfflineQueueCount();
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Data loading aborted:", e.message);
      } else {
        logger.error("Global Data Sync Error:", e);
        if (!isSilent) addNotification("تنبيه 📡", "حدث خطأ أثناء مزامنة البيانات.", "warning");
      }
    } finally {
      setIsSyncing(false);
      dataService.updateOfflineQueueCount(); 
    }
  }, [setUser, setNotifications, addNotification, isOnline, inv, bus, fin, sys]);

  // Use the extracted backup hook
  const dataForBackup = useMemo(() => ({
    customers: bus.customers, suppliers: bus.suppliers, categories: inv.categories,
    sales: bus.sales, purchases: bus.purchases, vouchers: fin.vouchers,
    expenses: fin.expenses, waste: fin.wasteRecords, expenseTemplates: fin.expenseTemplates
  }), [bus, inv, fin]);

  const { lastBackupDate, isBackupLoading, runManualBackup } = useBackup(user, isDataLoaded, isOnline, dataForBackup);

  const restoreBackup = useCallback(async (backupData: any, signal?: AbortSignal) => {
    if (!user?.id) return;
    setIsSyncing(true);
    try {
      await dataService.restoreBackupData(user.id, backupData, signal);
      await loadAllData(user.id, false, signal);
      addNotification("استرجاع البيانات ✅", "تم استعادة النسخة الاحتياطية بنجاح.", "success");
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Backup restore aborted:", e.message);
      } else {
        addNotification("فشل الاسترجاع ❌", "حدث خطأ أثناء الاستعادة.", "warning");
      }
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, loadAllData, addNotification]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        loadAllData(session.user.id, true);
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = setInterval(() => loadAllData(session.user.id, true), 300000); 
      }
    });
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      subscription.unsubscribe();
    };
  }, [loadAllData]);

  const value = useMemo(() => ({
    ...inv, ...bus, ...fin, ...sys,
    isDataLoaded, isSyncing, loadAllData, lastBackupDate, restoreBackup, isBackupLoading, runManualBackup
  }), [inv, bus, fin, sys, isDataLoaded, isSyncing, loadAllData, lastBackupDate, restoreBackup, isBackupLoading, runManualBackup]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
