
import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { useIsMounted } from '../hooks/useIsMounted'; // Import useIsMounted

const BarcodeScanner: React.FC = () => {
  const { navigate, customers, addNotification, theme } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);
  const isComponentMounted = useIsMounted(); // Initialize useIsMounted hook

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (isComponentMounted()) { // Check if component is still mounted before state update
          setCameraError(true);
          addNotification("خطأ الكاميرا ❌", "لا يمكن الوصول للكاميرا. تأكد من إعطاء الصلاحيات.", "warning");
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [addNotification, isComponentMounted]); // Add isComponentMounted to dependencies

  // محاكاة متقدمة للتعرف على الباركود
  useEffect(() => {
    if (isScanning && !cameraError) {
      const timer = setTimeout(() => {
        if (!isComponentMounted()) return; // Check if component is still mounted
        
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        if (randomCustomer) {
          setFlash(true);
          // تأثير الهزاز إذا مدعوم
          if ('vibrate' in navigator) navigator.vibrate(200);
          
          setTimeout(() => {
            if (!isComponentMounted()) return; // Check again before nested state updates
            addNotification("تم التعرف البصري ✅", `العميل: ${randomCustomer.name}`, "success");
            navigate('add-sale', { customerId: randomCustomer.id });
          }, 500);
        } else {
          setIsScanning(false);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isScanning, customers, navigate, addNotification, cameraError, isComponentMounted]); // Add isComponentMounted to dependencies

  return (
    <PageLayout title="الماسح الضوئي الذكي" onBack={() => navigate('dashboard')}>
      <div className="flex flex-col items-center justify-center min-h-[70vh] page-enter max-w-lg mx-auto p-4">
        
        <div className={`relative w-full aspect-square rounded-[4rem] overflow-hidden border-8 transition-all duration-300 ${flash ? 'border-[var(--color-accent-emerald)] scale-105' : 'border-[var(--color-border-primary)] shadow-2xl'}`}>
          {cameraError ? (
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[var(--color-background-card)] text-[var(--color-text-default)]`}>
              <span className="text-6xl mb-4" aria-hidden="true">📷</span>
              <p className="font-black text-xl mb-4">الكاميرا معطلة أو غير مسموح بها</p>
              <button 
                onClick={() => window.location.reload()} 
                aria-label="إعادة محاولة تشغيل الكاميرا"
                className="bg-[var(--color-accent-emerald)] px-8 py-4 rounded-2xl font-black text-white"
              >إعادة المحاولة</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.2] brightness-110" aria-label="عرض الكاميرا للمسح الضوئي"/>
              
              {/* واجهة الماسح */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                 <div className="absolute top-12 left-12 w-20 h-20 border-t-8 border-l-8 border-[var(--color-accent-emerald)] rounded-tl-3xl opacity-50"></div>
                 <div className="absolute top-12 right-12 w-20 h-20 border-t-8 border-r-8 border-[var(--color-accent-emerald)] rounded-tr-3xl opacity-50"></div>
                 <div className="absolute bottom-12 left-12 w-20 h-20 border-b-8 border-l-8 border-[var(--color-accent-emerald)] rounded-bl-3xl opacity-50"></div>
                 <div className="absolute bottom-12 right-12 w-20 h-20 border-b-8 border-r-8 border-[var(--color-accent-emerald)] rounded-br-3xl opacity-50"></div>
                 
                 {/* شعاع الليزر المتحرك */}
                 <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[85%] h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-emerald)] to-transparent shadow-[0_0_25px_rgba(52,211,153,1)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/10 rounded-[2.5rem] bg-white/5 backdrop-blur-[1px]"></div>
                 </div>
              </div>
              
              {flash && <div className="absolute inset-0 bg-white animate-pulse" aria-hidden="true"></div>}
            </>
          )}
        </div>

        <div className="mt-12 text-center space-y-6 w-full">
           <div className="flex items-center justify-center gap-4">
              <div className="voice-wave" aria-hidden="true">
                 <div className="voice-bar bg-[var(--color-accent-emerald)]"></div>
                 <div className="voice-bar bg-[var(--color-accent-emerald)]" style={{animationDelay: '0.2s'}}></div>
                 <div className="voice-bar bg-[var(--color-accent-emerald)]" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-[var(--color-text-muted)] font-black tracking-[0.2em] uppercase text-xs">جاري المسح الضوئي...</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('add-sale')} 
                aria-label="إدخال بيانات البيع يدوياً"
                className={`flex-1 p-6 rounded-3xl font-black shadow-lg transition-transform active:scale-95 bg-slate-100 dark:bg-[var(--color-background-input)] border-2 border-[var(--color-border-primary)] text-[var(--color-text-default)]`}
              >إدخال يدوي</button>
              <button 
                onClick={() => navigate('add-customer')} 
                aria-label="إضافة عميل جديد"
                className="flex-1 bg-[var(--color-accent-emerald)] text-white p-6 rounded-3xl font-black shadow-lg transition-transform active:scale-95"
              >عميل جديد 👤</button>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 15%; opacity: 0; }
          20%, 80% { opacity: 1; }
          50% { top: 85%; }
        }
        .voice-wave {
          display: flex;
          align-items: center;
          height: 20px;
          gap: 2px;
        }
        .voice-bar {
          width: 3px;
          height: 100%;
          border-radius: 2px;
          animation: waveform 0.8s ease-in-out infinite alternate;
        }
        @keyframes waveform {
          0% { height: 10%; opacity: 0.3; }
          50% { height: 100%; opacity: 1; }
          100% { height: 10%; opacity: 0.3; }
        }
      `}</style>
    </PageLayout>
  );
};

export default BarcodeScanner;
