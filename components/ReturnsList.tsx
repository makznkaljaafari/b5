

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const ReturnsList: React.FC = () => {
  const { sales, purchases, navigate, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const allReturns = useMemo(() => {
    const returnedSales = sales.filter(s => s.is_returned).map(s => ({ 
      id: s.id, 
      type: 'بيع', 
      person: s.customer_name, 
      qat: s.qat_type, 
      amount: s.total, 
      date: s.returned_at || s.date,
      quantity: s.quantity,
      original: s
    }));
    
    const returnedPurchases = purchases.filter(p => p.is_returned).map(p => ({ 
      id: p.id, 
      type: 'شراء', 
      person: p.supplier_name, 
      qat: p.qat_type, 
      amount: p.total, 
      date: p.returned_at || p.date,
      quantity: p.quantity,
      original: p
    }));

    const combined = [...returnedSales, ...returnedPurchases].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (!searchTerm.trim()) return combined;
    return combined.filter(item => 
      item.person.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.qat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, purchases, searchTerm]);

  return (
    <PageLayout title="سجل المرتجعات" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pb-44 max-w-7xl mx-auto w-full px-2">
        
        {/* Search Header */}
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="ابحث في المرتجعات (اسم أو صنف)..."
              className="w-full bg-[var(--color-background-secondary)] border-2 border-[var(--color-border-primary)] focus:border-[var(--color-accent-error)] rounded-2xl p-4 pr-12 font-bold text-sm outline-none shadow-lg transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
          </div>
          
          <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 ${theme === 'dark' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
            <span className="text-xl">🛡️</span>
            <p className={`text-[10px] font-black leading-tight text-center italic ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>
              سجل الرقابة: كافة المرتجعات أدناه تم خصمها من المديونيات وإعادة الكميات للمخزون آلياً.
            </p>
          </div>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
          {allReturns.map((item) => (
            <div 
              key={`${item.type}-${item.id}`} 
              className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl group relative overflow-hidden ${
                theme === 'dark' ? 'bg-[var(--color-background-secondary)] border-[var(--color-border-primary)]' : 'bg-white border-slate-100 shadow-xl'
              }`}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 opacity-50"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform ${
                    item.type === 'بيع' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {item.type === 'بيع' ? '💰' : '📦'}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[var(--color-text-primary)] leading-tight truncate max-w-[150px]">{item.person}</h3>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border mt-1 inline-block ${
                      item.type === 'بيع' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>مرتجع {item.type}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-black text-rose-500 tabular-nums">-{item.amount.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-left">YER</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--color-border-primary)]/50">
                <div className="flex justify-between items-center text-xs font-bold">
                   <span className="text-slate-400">الصنف المرتجع:</span>
                   <span className="text-[var(--color-text-primary)]">🌿 {item.qat} ({item.quantity})</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                   <span className="text-slate-400">تاريخ الإرجاع:</span>
                   <span className="text-slate-500 tabular-nums">
                    {new Date(item.date).toLocaleDateString('ar-YE', {day:'2-digit', month:'2-digit', year:'2-digit'})}
                   </span>
                </div>
              </div>

              <button 
                onClick={() => item.type === 'بيع' ? navigate('invoice-view', { sale: item.original }) : null}
                className={`w-full mt-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                عرض أصل العملية 📄
              </button>
            </div>
          ))}
        </div>

        {allReturns.length === 0 && (
          <div className="text-center py-40 opacity-20 flex flex-col items-center gap-8">
            <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-6xl animate-pulse">🔄</div>
            <p className="font-black text-2xl uppercase tracking-widest">سجل المرتجعات نظيف تماماً</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ReturnsList;
