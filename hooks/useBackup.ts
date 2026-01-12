
import { useState, useCallback, useEffect, useRef } from 'react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { logger } from '../services/loggerService';

export const useBackup = (user: any, isDataLoaded: boolean, isOnline: boolean, dataContext: any) => {
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const hasCheckedBackupThisSession = useRef(false);

  const runManualBackup = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id) return;
    setIsBackupLoading(true);
    try {
      const allData = await dataService.prepareBackupPackage(user.id, undefined, signal);
      if (signal?.aborted) {
        logger.warn("Manual backup aborted before export.");
        return false;
      }
      const nowISO = new Date().toISOString();
      const fileName = `alshwaia_manual_backup_${nowISO.replace(/:/g, '-')}`; 
      exportService.exportToJson(allData, fileName);
      setLastBackupDate(nowISO);
      localStorage.setItem(`last_daily_backup_${user.id}`, nowISO);
      return true;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Manual backup request aborted:", e.message);
        return false;
      }
      logger.error("Manual backup failed:", e);
      return false;
    } finally {
      setIsBackupLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isDataLoaded || !user?.id || !isOnline || hasCheckedBackupThisSession.current) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    const runAutoBackup = async () => {
      const lastBackupKey = `last_daily_backup_${user.id}`;
      const storedLastBackup = localStorage.getItem(lastBackupKey);
      const frequency = user?.accounting_settings?.backup_frequency || 'daily';
      const now = new Date();
      
      let shouldBackup = false;
      if (!storedLastBackup) {
        shouldBackup = true;
      } else {
        const lastDate = new Date(storedLastBackup);
        const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
        if (frequency === '12h' && hoursDiff >= 12) shouldBackup = true;
        else if (frequency === 'daily' && hoursDiff >= 24) shouldBackup = true;
      }

      if (shouldBackup) {
        hasCheckedBackupThisSession.current = true;
        try {
          const backupData = await dataService.prepareBackupPackage(user.id, {
            profile: user, ...dataContext
          }, signal); // Pass signal
          if (signal.aborted) {
            logger.warn("Auto-backup aborted before export due to signal.");
            return;
          }
          const success = exportService.exportToJson(backupData, `alshwaia_auto_backup_${frequency}`);
          if (success) {
            const nowISO = now.toISOString();
            localStorage.setItem(lastBackupKey, nowISO);
            setLastBackupDate(nowISO);
          }
        } catch (e: any) {
          if (e.name === 'AbortError') {
            logger.warn("Auto-backup request aborted:", e.message);
          } else {
            logger.error("Auto-backup failed:", e);
          }
        }
      } else {
        setLastBackupDate(storedLastBackup);
        hasCheckedBackupThisSession.current = true;
      }
    };

    const timeout = setTimeout(runAutoBackup, 5000);
    return () => {
      clearTimeout(timeout);
      if (!signal.aborted) {
        abortController.abort("Component unmounted during auto-backup check.");
      }
    };
  }, [isDataLoaded, user, isOnline, dataContext]);

  return { lastBackupDate, isBackupLoading, runManualBackup };
};
