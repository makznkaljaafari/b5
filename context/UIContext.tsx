
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Page, Theme, AppNotification } from '../types';
import { dataService } from '../services/dataService';
import { ToastProps } from '../components/ui/Toast';
import { logger } from '../services/loggerService';

interface UIContextType {
  currentPage: Page;
  navigationParams: any;
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  activeToasts: ToastProps[];
  notifications: AppNotification[];
  isSidebarCollapsed: boolean;
  feedbackType: 'celebration' | 'debt' | null;
  isOnline: boolean;
  offlineQueueCount: number;
  installPrompt: any;
  isVoiceActive: boolean; // حالة المساعد الصوتي
  navigate: (p: Page, params?: any) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (title: string, message: string, type: AppNotification['type'], signal?: AbortSignal) => Promise<void>;
  removeToast: (id: string) => void;
  markNotificationsAsRead: (signal?: AbortSignal) => Promise<void>;
  deleteAllOldNotifications: (signal?: AbortSignal) => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  triggerFeedback: (type: 'celebration' | 'debt') => void;
  promptInstall: () => void;
  setIsVoiceActive: (active: boolean) => void; // وظيفة لتفعيل المساعد
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [activeToasts, setActiveToasts] = useState<ToastProps[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [feedbackType, setFeedbackType] = useState<'celebration' | 'debt' | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const navigate = useCallback((p: Page, params?: any) => {
    setCurrentPage(p);
    setNavigationParams(params || null);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark'; 
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      let target: 'light' | 'dark' = 'dark';
      if (theme === 'system') {
        target = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        target = theme;
      }
      
      setResolvedTheme(target);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(target);
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const promptInstall = useCallback(async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
    }
  }, [installPrompt]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', String(newState));
      return newState;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addNotification = useCallback(async (title: string, message: string, type: AppNotification['type'], signal?: AbortSignal) => {
    try {
      const saved = await dataService.saveNotification({ title, message, type, date: new Date().toISOString() }, false, signal);
      setNotifications(prev => [saved, ...prev]);
      const toastId = Math.random().toString(36).substr(2, 9);
      setActiveToasts(prev => [...prev, { id: toastId, title, message, type, onClose: () => removeToast(toastId) }]);
    } catch (e: any) { 
      if (e.name === 'AbortError') {
        logger.warn("Notification save aborted:", e.message);
      } else {
        logger.error("Failed to save notification:", e);
      }
    }
  }, [removeToast, setNotifications, setActiveToasts]);

  const markNotificationsAsRead = useCallback(async (signal?: AbortSignal) => {
    try {
      await dataService.markAllNotificationsRead(signal);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Mark notifications as read aborted:", e.message);
      } else {
        logger.error("Failed to mark notifications as read:", e);
        addNotification("خطأ ⚠️", "فشل تحديث حالة الإشعارات.", "warning");
      }
    }
  }, [setNotifications, addNotification]);

  const deleteAllOldNotifications = useCallback(async (signal?: AbortSignal) => {
    const daysAgo = 7;
    try {
      await dataService.deleteAllNotificationsOlderThan(daysAgo, signal);
      setNotifications(prev => prev.filter(n => (Date.now() - new Date(n.date).getTime()) / (1000 * 60 * 60 * 24) <= daysAgo));
      addNotification("تم ✅", "تم حذف التنبيهات القديمة بنجاح.", "success");
    } catch (e: any) {
      if (e.name === 'AbortError') {
        logger.warn("Delete old notifications aborted:", e.message);
      } else {
        logger.error("Failed to delete old notifications:", e);
        addNotification("خطأ ⚠️", "فشل حذف التنبيهات القديمة. حدث خطأ غير متوقع.", "warning");
      }
    }
  }, [addNotification, setNotifications]);

  const triggerFeedback = useCallback((type: 'celebration' | 'debt') => {
    setFeedbackType(type);
    setTimeout(() => setFeedbackType(null), 4000);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification("تم استعادة الاتصال ✅", "أنت متصل بالإنترنت الآن.", "info");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addNotification("قطع الاتصال ⛔", "أنت تعمل بالوضع المحلي حالياً. سيتم المزامنة لاحقاً.", "warning");
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    dataService.onOfflineQueueCountChange = (count) => {
      setOfflineQueueCount(count);
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [addNotification]);

  const value = useMemo(() => ({
    currentPage, navigationParams, theme, resolvedTheme, activeToasts, notifications, isSidebarCollapsed, feedbackType, isOnline, offlineQueueCount, installPrompt, isVoiceActive,
    navigate, setTheme, toggleTheme, toggleSidebar, addNotification, removeToast, markNotificationsAsRead, deleteAllOldNotifications, setNotifications, triggerFeedback, promptInstall, setIsVoiceActive
  }), [currentPage, navigationParams, theme, resolvedTheme, activeToasts, notifications, isSidebarCollapsed, feedbackType, isOnline, offlineQueueCount, installPrompt, isVoiceActive, navigate, setTheme, toggleTheme, toggleSidebar, addNotification, removeToast, markNotificationsAsRead, deleteAllOldNotifications, setNotifications, triggerFeedback, promptInstall, setIsVoiceActive]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
