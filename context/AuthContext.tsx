
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { dataService } from '../services/dataService';
import { logger } from '../services/loggerService';

interface AuthContextType {
  isLoggedIn: boolean;
  isCheckingSession: boolean;
  user: any;
  loginAction: (email: string, pass: string) => Promise<any>;
  registerAction: (userData: any) => Promise<any>;
  logoutAction: () => Promise<void>;
  resetPasswordAction: (email: string) => Promise<void>;
  updateUser: (updates: any, signal?: AbortSignal) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCheckingSession: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [user, setUser] = useState<any>(null);

  const loginAction = useCallback(async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw new Error(error.message);
    // Log successful login
    if (data.user?.id) {
      dataService.logActivity(data.user.id, "تسجيل دخول", `المستخدم ${data.user.email} سجل الدخول بنجاح.`, 'auth');
    }
    return data;
  }, []);

  const registerAction = useCallback(async (userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { data: { full_name: userData.fullName, agency_name: userData.agencyName } }
    });
    if (error) throw new Error(error.message);
    // Log successful registration
    if (data.user?.id) {
      dataService.logActivity(data.user.id, "تسجيل حساب جديد", `تم إنشاء حساب جديد باسم الوكالة ${userData.agencyName}.`, 'auth');
    }
    return data;
  }, []);

  const resetPasswordAction = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(error.message);
    // No user ID available here, so cannot log directly via dataService.
    // Supabase often logs these internally.
  }, []);

  const logoutAction = useCallback(async () => {
    const userId = await dataService.getUserId();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    if (userId) {
      dataService.logActivity(userId, "تسجيل خروج", `المستخدم قام بتسجيل الخروج.`, 'auth');
    }
  }, []);

  const updateUser = useCallback(async (updates: any, signal?: AbortSignal) => {
    const userId = await dataService.getUserId();
    if (!userId) return;

    try {
      // تحديث البروفايل الأساسي
      const profileFields = {
        full_name: updates.full_name,
        agency_name: updates.agency_name,
        whatsapp_number: updates.whatsapp_number,
        telegram_username: updates.telegram_username,
        enable_voice_ai: updates.enable_voice_ai,
      };
      await dataService.updateProfile(userId, profileFields, signal); // Pass signal

      // تحديث إعدادات المحاسبة في جدول user_settings (JSONB)
      if (updates.accounting_settings) {
        await dataService.updateSettings(userId, updates.accounting_settings, false, signal); // Pass signal
      }

      // جلب البيانات المحدثة بالكامل لضمان مزامنة الواجهة
      const freshProfile = await dataService.getFullProfile(userId, signal); // Pass signal
      setUser(freshProfile);

      // Log activity for settings update
      dataService.logActivity(userId, "تحديث الإعدادات", `تم تحديث معلومات البروفايل وإعدادات المستخدم.`, 'settings', signal); // Pass signal

    } catch (err: any) {
      if (err.name === 'AbortError') {
        logger.warn("User update aborted:", err.message);
        throw err; // Re-throw AbortError
      }
      logger.error("Failed to update user profile/settings:", err);
      throw err;
    }
  }, []);

  const value = useMemo(() => ({
    isLoggedIn,
    isCheckingSession,
    user,
    loginAction,
    registerAction,
    logoutAction,
    resetPasswordAction,
    updateUser,
    setUser,
    setIsLoggedIn,
    setIsCheckingSession
  }), [isLoggedIn, isCheckingSession, user, loginAction, registerAction, logoutAction, resetPasswordAction, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
