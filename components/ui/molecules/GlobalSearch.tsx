
import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import { useApp } from '../../../context/AppContext';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = memo(({ isOpen, onClose }) => {
  const { customers, sales, navigate, theme } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedPages = [
      { id: 'reports', label: 'التقارير والتحليلات', icon: '📊', page: 'reports' },
      { id: 'debts', label: 'الميزانية والديون', icon: '⚖️', page: 'debts' },
      { id: 'settings', label: 'الإعدادات', icon: '⚙️', page: 'settings' },
      { id: 'returns', label: 'سجل المرتجعات', icon: '🔄', page: 'returns' },
    ].filter(p => p.label.toLowerCase().includes(q));

    const matchedCustomers = (customers || []).filter((c: any) => 
      c.name.toLowerCase().includes(q) || c.phone?.includes(q)
    ).slice(0, 5);

    const matchedSales = (sales || []).filter((s: any) => 
      s.customer_name.toLowerCase().includes(q) || s.total.toString().includes(q)
    ).slice(0, 5);

    return { matchedPages, matchedCustomers, matchedSales };
  }, [query, customers, sales]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 lg:p-10" onClick={onClose} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-in fade-in" />
      <div 
        className={`relative w-full max-w-2xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-top-10 ${
          theme === 'dark' ? 'bg-slate-900' : 'bg-white'
        }`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <span className="text-3xl">🔍</span>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="ابحث عن عميل أو فاتورة أو صفحة..."
            className="flex-1 bg-transparent border-none outline-none text-xl font-black text-[var(--color-text-primary)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar text-right">
          {results ? (
            <>
              {results.matchedPages.length > 0 ? (
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">الصفحات</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {results.matchedPages.map(p => (
                      <button key={p.id} onClick={() => { navigate(p.page as any); onClose(); }} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-600 hover:text-white transition-all">
                        <span className="text-xl">{p.icon}</span>
                        <span className="font-black text-xs">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {results.matchedCustomers.length > 0 ? (
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">العملاء</h4>
                  <div className="space-y-2">
                    {results.matchedCustomers.map((c: any) => (
                      <button key={c.id} onClick={() => { navigate('account-statement', { personId: c.id, personType: 'عميل' }); onClose(); }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-500 hover:text-white transition-all">
                        <div className="flex items-center gap-3">
                           <span>👤</span>
                           <span className="font-black text-sm">{c.name}</span>
                        </div>
                        <span className="text-[9px] opacity-40 font-bold tabular-nums">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {results.matchedSales.length > 0 ? (
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">فواتير البيع</h4>
                  <div className="space-y-2">
                    {results.matchedSales.map((s: any) => (
                      <button 
                        key={s.id} 
                        onClick={() => { navigate('invoice-view', { sale: s }); onClose(); }} 
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-sky-500 hover:text-white transition-all"
                      >
                        <div className="flex items-center gap-3">
                           <span>💰</span>
                           <span className="font-black text-sm">{s.customer_name}</span>
                        </div>
                        <span className="text-[9px] opacity-40 font-bold tabular-nums">{s.total.toLocaleString()} {s.currency}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="text-center py-20 opacity-20">
               <p className="font-black">ابدأ الكتابة للبحث سحابياً...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});