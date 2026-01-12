import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// تسجيل الـ Service Worker مع معالجة ذكية للأخطاء والبيئات
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // نستخدم المسار المطلق من الجذر لضمان الوصول الصحيح في جميع المسارات
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('✅ PWA Service Worker Active');
        
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // تحديث تلقائي عند توفر نسخة جديدة
                window.location.reload();
              }
            };
          }
        };
      })
      .catch(err => {
        // إدارة صامتة لأخطاء النطاق في بيئات المعاينة (مثل AI Studio)
        const isOriginError = err.message?.toLowerCase().includes('origin') || err.message?.toLowerCase().includes('cross-origin');
        if (isOriginError) {
          console.warn('⚠️ SW: running in restricted origin mode.');
        } else {
          console.error('❌ SW: Registration failed', err);
        }
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Critical: Root element not found");

const htmlSpinner = document.getElementById('html-loading-spinner');
if (htmlSpinner) htmlSpinner.style.display = 'none';

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);