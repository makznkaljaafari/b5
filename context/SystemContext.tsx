
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { ActivityLog } from '../types';
import { dataService } from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';

const SystemContext = createContext<any>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, isOnline } = useUI();
  const { user } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    dataService.updateOfflineQueueCount();
  }, []);

  useEffect(() => {
    if (isOnline) {
      dataService.updateOfflineQueueCount();
    }
  }, [isOnline]);

  const value = useMemo(() => ({
    activityLogs, setActivityLogs,
    connectionError, setConnectionError,
  }), [activityLogs, connectionError]);

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within SystemProvider');
  return context;
};
