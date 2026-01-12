
import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx'; // Corrected path and added .tsx extension
import { ToastContainer } from './components/ui/Toast.tsx'; // Corrected path and added .tsx extension
import ErrorBoundary from './components/ErrorBoundary.tsx'; // Corrected path and added .tsx extension
import { FeedbackOverlay } from './components/ui/FeedbackOverlay.tsx'; // Corrected path and added .tsx extension
import { ToastProps } from './components/ui/Toast.tsx'; // Corrected path and added .tsx extension
import { PageRenderer } from './components/routing/PageRenderer.tsx'; // Corrected path and added .tsx extension

const Sidebar = lazy(() => import('./components/Sidebar.tsx')); // Corrected path and added .tsx extension
const BottomNav = lazy(() => import('./components/BottomNav.tsx')); // Corrected path and added .tsx extension
const VoiceAssistant = lazy(() => import('./components/VoiceAssistant.tsx')); // Corrected path and added .tsx extension

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-[var(--color-background-page)] h-screen">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const SplashScreen = () => (
  <div className="fixed inset-0 bg-[var(--color-background-page)] flex flex-col items-center justify-center z-[100] animate-in fade-in duration-700">
    <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-2xl relative z-10 border-4 border-white/10">🌿</div>
    <div className="mt-8 text-indigo-500 font-bold animate-pulse text-sm">جاري التحميل...</div>
  </div>
);

const AppContent = () => {
  const { currentPage, isLoggedIn, isCheckingSession, activeToasts, removeToast } = useApp();

  if (isCheckingSession) return <SplashScreen />;

  return (
    <div className="min-h-screen flex flex-row relative overflow-hidden w-full transition-colors duration-500 bg-[var(--color-background-page)]">
      <ToastContainer toasts={activeToasts as ToastProps[]} removeToast={removeToast} />
      <FeedbackOverlay />
      <Suspense fallback={<LoadingFallback />}>
        {isLoggedIn && <Sidebar />}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar relative">
          <PageRenderer currentPage={currentPage} isLoggedIn={isLoggedIn} />
          {isLoggedIn && <BottomNav />}
        </div>
        {isLoggedIn && <VoiceAssistant />}
      </Suspense>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </ErrorBoundary>
);

export default App;