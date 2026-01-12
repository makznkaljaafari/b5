
import React, { useState, useMemo } from 'react';
import { Customer, Supplier } from '../../types';

interface AccountPickerProps {
  customers: Customer[];
  suppliers: Supplier[];
  onSelect: (id: string, type: 'عميل' | 'مورد') => void;
  theme: 'light' | 'dark';
}

export const AccountPicker: React.FC<AccountPickerProps> = ({ customers, suppliers, onSelect, theme }) => {
  const [search, setSearch] = useState('');
  const isDark = theme === 'dark';

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return {
      customers: customers.filter(c => c.name.toLowerCase().includes(q) || c.phone?.includes(q)).slice(0, 8),
      suppliers: suppliers.filter(s => s.name.toLowerCase().includes(q) || s.phone?.includes(q)).slice(0, 8)
    };
  }, [search, customers, suppliers]);

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto page-enter pb-44">
      <div className="relative group">
        <input 
          type="text" placeholder="ابحث عن اسم العميل أو المورد..."
          className={`w-full p-6 pr-14 rounded-[2.5rem] border-2 font-black outline-none transition-all shadow-2xl ${
            isDark ? 'bg-slate-800 border-white/5 focus:border-sky-500' : 'bg-white border-slate-100 focus:border-indigo-500'
          }`}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-30">🔍</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
             دليل العملاء
          </h3>
          <div className="space-y-2">
            {filtered.customers.map(c => (
              <button key={c.id} onClick={() => onSelect(c.id, 'عميل')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95 text-right ${
                isDark ? 'bg-slate-800/50 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
              }`}>
                 <div className="flex items-center gap-3">
                   <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xl shadow-inner">👤</span>
                   <span className="font-black text-sm">{c.name}</span>
                </div>
                <span className="text-[8px] opacity-30 tabular-nums">{c.phone}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
             دليل الموردين
          </h3>
          <div className="space-y-2">
            {filtered.suppliers.map(s => (
              <button key={s.id} onClick={() => onSelect(s.id, 'مورد')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95 text-right ${
                isDark ? 'bg-slate-800/50 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-orange-200 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-3">
                   <span className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-xl shadow-inner">🚛</span>
                   <span className="font-black text-sm">{s.name}</span>
                </div>
                <span className="text-[8px] opacity-30 tabular-nums">{s.phone}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
