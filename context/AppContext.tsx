
import React, { useEffect, useRef } from 'react';
import { UIProvider, useUI } from './UIContext';
import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider, useData } from './DataContext'; // Keep DataProvider for its own context
// NEW: Import all individual providers
import { InventoryProvider } from './InventoryContext';
import { BusinessProvider } from './BusinessContext';
import { FinanceProvider } from './FinanceContext';
import { SystemProvider } from './SystemContext';

import { supabase } from '../services/supabaseClient';

const SyncManager: React.FC = () => {
  const { setIsLoggedIn, setUser, setIsCheckingSession } = useAuth();
  const { loadAllData } = useData();
  const { navigate, currentPage, addNotification } = useUI();
  const authInitializedRef = useRef(false);

  useEffect(() => {
    let timeoutId: number;

    const checkSession = async () => {
      if (authInitializedRef.current) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          await loadAllData(session.user.id, true);
          
          if (currentPage === 'login') navigate('dashboard');
        } else {
          setIsLoggedIn(false);
        }
      } catch (err: any) {
        console.error("Auth Fail:", err);
        addNotification("خطأ في الاتصال ❌", err.message || "فشل التحقق من الجلسة. قد تكون هناك مشكلة في اتصال الشبكة أو إعدادات Supabase.", "warning");
        setIsLoggedIn(false); // Ensure login state is false
      } finally {
        setIsCheckingSession(false);
        authInitializedRef.current = true;
        clearTimeout(timeoutId); // Clear timeout here on success or explicit failure
      }
    };

    // Start a timeout to prevent infinite splash screen
    timeoutId = window.setTimeout(() => {
      if (authInitializedRef.current === false) { // If session check hasn't completed yet
        addNotification("فشل التحميل ⏳", "فشل تحميل البيانات الأولية. قد يكون الخادم مشغولاً أو اتصالك ضعيفاً. يرجى المحاولة مرة أخرى.", "warning");
        setIsCheckingSession(false);
        setIsLoggedIn(false); // Ensure they go to login
        navigate('login'); // Force navigate to login if stuck
      }
    }, 7000); // 7 seconds timeout

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        loadAllData(session.user.id, true);
        if (currentPage === 'login') navigate('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUser(null);
        navigate('login');
      }
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId); // Clear timeout on unmount
    };
  }, [loadAllData, navigate, setIsLoggedIn, setUser, setIsCheckingSession, currentPage, addNotification]); // add addNotification to deps

  return null;
};

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <UIProvider>
      <AuthProvider>
        {/* Explicitly nest all providers. DataProvider consumes the others. */}
        <InventoryProvider>
          <BusinessProvider>
            <FinanceProvider>
              <SystemProvider>
                <DataProvider> {/* DataProvider now safely consumes contexts from its parent providers */}
                  <SyncManager />
                  {children}
                </DataProvider>
              </SystemProvider>
            </FinanceProvider>
          </BusinessProvider>
        </InventoryProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export const useApp = () => {
  const ui = useUI();
  const auth = useAuth();
  const data = useData();
  return { ...ui, ...auth, ...data };
};
