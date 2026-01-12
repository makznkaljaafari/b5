

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useIsMounted } from '../hooks/useIsMounted'; // Import useIsMounted

const LoginPage: React.FC = () => {
  const { loginAction, registerAction, resetPasswordAction } = useAuth();
  const { theme, addNotification } = useUI();
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    agencyName: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState('');
  const isComponentMounted = useIsMounted(); // Initialize useIsMounted hook

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير، رزقكم الله من واسع فضله ☀️');
    else setGreeting('مساء الخير، أهلاً بك في نظامك الذكي ✨');
    
    // محاولة استعادة البريد المحفوظ إذا كان تذكرني مفعلاً سابقاً
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const emailToUse = formData.email.includes('@') ? formData.email : `${formData.email}@alshwaia.com`;

    try {
      if (isRegister) {
        await registerAction({
          agencyName: formData.agencyName,
          fullName: formData.fullName,
          email: emailToUse,
          password: formData.password
        });
      } else {
        await loginAction(emailToUse, formData.password);
        if (rememberMe) {
          localStorage.setItem('remembered_email', formData.email);
        } else {
          localStorage.removeItem('remembered_email');
        }
      }
    } catch (err: any) {
      if (!isComponentMounted()) return; // Check if component is still mounted before state updates
      const msg = err?.message || (typeof err === 'string' ? err : 'عذراً، تأكد من البيانات المدخلة أو جودة الاتصال');
      setError(msg);
    } finally {
      if (!isComponentMounted()) return; // Check if component is still mounted before state updates
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف أولاً لإرسال رابط الاستعادة');
      return;
    }
    
    const emailToUse = formData.email.includes('@') ? formData.email : `${formData.email}@alshwaia.com`;
    
    setIsLoading(true);
    try {
      await resetPasswordAction(emailToUse);
      if (!isComponentMounted()) return; // Check if component is still mounted before state updates
      addNotification("تم الإرسال 📧", "يرجى فحص بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور", "success");
      setError('');
    } catch (err: any) {
      if (!isComponentMounted()) return; // Check if component is still mounted before state updates
      setError(err.message || "تعذر إرسال رابط الاستعادة حالياً");
    } finally {
      if (!isComponentMounted()) return; // Check if component is still mounted before state updates
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-all duration-700 bg-[var(--color-background-primary)]">
      <div className={`absolute top-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full blur-[150px] animate-spin-slow ${theme === 'dark' ? 'bg-[var(--color-accent-emerald)]/5' : 'bg-[var(--color-accent-sky)]/10'}`}></div>
      
      <div className="w-full max-w-lg relative z-10 page-enter">
        <div className="text-center mb-12">
          <div className="relative inline-block animate-float">
             <div className={`absolute inset-0 rounded-full scale-150 animate-pulse-glow ${theme === 'dark' ? 'bg-[var(--color-accent-emerald)]/20' : 'bg-[var(--color-accent-sky)]/20'}`}></div>
             <div className={`w-24 h-24 sm:w-36 sm:h-36 rounded-[3rem] flex items-center justify-center text-5xl sm:text-8xl shadow-2xl mx-auto border-[8px] relative z-10 ${theme === 'dark' ? 'bg-gradient-to-br from-[var(--color-accent-emerald)] to-[var(--color-accent-emerald)]/80 border-[var(--color-background-tertiary)]' : 'bg-gradient-to-br from-[var(--color-accent-sky)] to-[var(--color-accent-info)] border-white'}`}>
               🌿
             </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-text-primary)] mt-8 tracking-tighter leading-none">الشويع للقات</h1>
          <p className={`font-bold text-sm mt-4 italic opacity-80 ${theme === 'dark' ? 'text-[var(--color-accent-emerald)]' : 'text-[var(--color-accent-info)]'}`}>
            {isRegister ? 'أنشئ حسابك السحابي الآمن' : greeting}
          </p>
        </div>

        <div className={`backdrop-blur-2xl p-6 sm:p-10 rounded-[3.5rem] shadow-2xl border ${theme === 'dark' ? 'bg-[var(--color-background-secondary)]/80 border-white/5' : 'bg-white/80 border-white'}`}>
          <div className={`p-1.5 rounded-2xl mb-6 relative flex ${theme === 'dark' ? 'bg-[var(--color-background-tertiary)]' : 'bg-slate-100'}`}> {/* Adjusted mb-10 to mb-6 */}
            <button 
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-4 rounded-xl font-black text-sm relative z-10 transition-all ${!isRegister ? 'bg-[var(--color-accent-sky)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-sky)]'}`}
            >
              دخول
            </button>
            <button 
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-4 rounded-xl font-black text-sm relative z-10 transition-all ${isRegister ? 'bg-[var(--color-accent-sky)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-sky)]'}`}
            >
              جديد
            </button>
          </div>

          <form onSubmit={handleAction} className="space-y-4 lg:space-y-6">
            {error && <div className={`p-5 rounded-2xl text-[11px] font-black text-center border italic animate-pulse ${theme === 'dark' ? 'bg-[var(--color-accent-rose)]/10 border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)]' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{error}</div>}

            <div className="space-y-3 lg:space-y-4">
              {isRegister && (
                <>
                  <div className="relative group">
                    <input 
                      type="text" 
                      className={`w-full rounded-2xl p-4 pr-12 sm:p-5 font-black outline-none focus:border-[var(--color-accent-sky)] border-2 transition-all shadow-inner ${theme === 'dark' ? 'bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] border-transparent' : 'bg-white text-slate-950 border-slate-200'}`}
                      placeholder="اسم الوكالة"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl text-[var(--color-text-primary)]">🏛️</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      className={`w-full rounded-2xl p-4 pr-12 sm:p-5 font-black outline-none focus:border-[var(--color-accent-sky)] border-2 transition-all shadow-inner ${theme === 'dark' ? 'bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] border-transparent' : 'bg-white text-slate-950 border-slate-200'}`}
                      placeholder="اسمك الكامل"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl text-[var(--color-text-primary)]">👤</span>
                  </div>
                </>
              )}
              <div className="relative group">
                <input 
                  type="text" 
                  className={`w-full rounded-2xl p-4 pr-12 sm:p-5 font-black outline-none focus:border-[var(--color-accent-sky)] border-2 transition-all shadow-inner ${theme === 'dark' ? 'bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] border-transparent' : 'bg-white text-slate-950 border-slate-200'}`}
                  placeholder="رقم الهاتف أو البريد"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl text-[var(--color-text-primary)]">📧</span>
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  className={`w-full rounded-2xl p-4 pr-12 sm:p-5 font-black outline-none focus:border-[var(--color-accent-sky)] border-2 transition-all shadow-inner ${theme === 'dark' ? 'bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] border-transparent' : 'bg-white text-slate-950 border-slate-200'}`}
                  placeholder="كلمة المرور"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl text-[var(--color-text-primary)]">🔑</span>
              </div>

              {!isRegister && (
                <div className="flex items-center justify-between px-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <div className={`w-5 h-5 border-2 rounded-md peer-checked:bg-[var(--color-accent-sky)] peer-checked:border-[var(--color-accent-sky)] transition-all ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'}`}></div>
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 left-1 font-bold text-[10px]">✓</span>
                    </div>
                    <span className={`text-xs font-black transition-colors ${theme === 'dark' ? 'text-slate-400 group-hover:text-[var(--color-accent-sky)]' : 'text-slate-500 group-hover:text-[var(--color-accent-sky)]'}`}>تذكرني</span>
                  </label>
                  
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-xs font-black text-[var(--color-accent-sky)] hover:text-[var(--color-accent-sky)]/80 hover:underline transition-all"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[var(--color-accent-sky)] hover:bg-[var(--color-accent-sky)]/80 text-white p-5 sm:p-6 rounded-2xl font-black text-lg sm:text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 border-b-4 border-[var(--color-accent-sky)]/80"
            >
              {isLoading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (isRegister ? 'إنشاء حساب سحابي' : 'تسجيل الدخول الآمن')}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-10 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.3em] opacity-40">نظام إدارة الوكالات الذكي v3.1</p>
      </div>
    </div>
  );
};

export default LoginPage;