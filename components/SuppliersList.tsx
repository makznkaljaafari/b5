
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Supplier } from '../types';
import { financeService } from '../services/financeService';

const SuppliersList: React.FC = memo(() => {
  const { suppliers, purchases, vouchers, navigate, deleteSupplier, addNotification, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s: Supplier) => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.phone && s.phone.includes(searchTerm))
    );
  }, [suppliers, searchTerm]);

  const handleDelete = useCallback(async (supplier: Supplier) => {
    if (window.confirm(`هل أنت متأكد من حذف المورد "${supplier.name}"؟ سيتم حذف بياناته وسجله نهائياً.`)) {
      try {
        await deleteSupplier(supplier.id); // deleteSupplier now handles notifications and logging
      } catch (err: any) {
        // Error handling is now primarily in deleteSupplier, but this catch remains for unexpected issues
        addNotification("فشل الحذف ⚠️", err.message || "لا يمكن حذف المورد لوجود عمليات مرتبطة به.", "warning");
      }
    }
  }, [deleteSupplier, addNotification]);

  return (
    <PageLayout title="دليل الموردين" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pb-44 max-w-7xl mx-auto w-full px-2">
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="ابحث عن مورد..."
              className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] focus:border-[var(--color-accent-orange)] rounded-2xl p-4 pr-12 font-bold text-sm shadow-lg transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="البحث عن مورد بالاسم أو رقم الهاتف"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30 text-[var(--color-text-muted)]">🔍</span>
          </div>
          <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-xl border-2 border-[var(--color-border-default)] shadow-md">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-[var(--color-accent-orange)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض الموردين كشبكة"
              aria-pressed={viewMode === 'grid'}
            >🎴</button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--color-accent-orange)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض الموردين كقائمة"
              aria-pressed={viewMode === 'list'}
            >📜</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {filteredSuppliers.map((s) => {
              const balances = financeService.getSupplierBalances(s.id, purchases, vouchers);
              const totalDue = balances.find(b => b.currency === 'YER')?.amount || 0;
              return (
                <div 
                  key={s.id} 
                  onClick={() => navigate('account-statement', { personId: s.id, personType: 'مورد' })}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl group cursor-pointer active:scale-[0.98] ${
                    theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)] shadow-xl'
                  }`}
                  role="listitem"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[var(--color-status-warning-bg)] dark:bg-[var(--color-accent-orange)]/30 text-[var(--color-status-warning)] rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-3 transition-transform" aria-hidden="true">🚛</div>
                      <div>
                        <h3 className="font-black text-xl text-[var(--color-text-default)] leading-tight">{s.name}</h3>
                        <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1 tabular-nums">📱 {s.phone || 'بدون هاتف'}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`rounded-2xl p-4 mb-8 flex justify-around items-center border ${theme === 'dark' ? 'bg-[var(--color-background-input)] border-[var(--color-border-strong)]' : 'bg-[var(--color-background-tertiary)] border-[var(--color-border-default)]'}`}>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">الرصيد المستحق</p>
                      <p className={`text-2xl font-black tabular-nums ${totalDue > 0 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>
                        {totalDue.toLocaleString()} <small className="text-xs font-bold uppercase">YER</small>
                      </p>
                    </div>
                    <span className="text-2xl text-[var(--color-text-default)]" aria-hidden="true">⚖️</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => navigate('account-statement', { personId: s.id, personType: 'مورد' })} className="bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--color-status-success-bg)]/80 transition-all" aria-label={`عرض كشف حساب المورد ${s.name}`}>📑 كشف حساب</button>
                    <button onClick={() => navigate('add-voucher', { type: 'دفع', personId: s.id, personType: 'مورد' })} className="bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--color-status-warning-bg)]/80 transition-all" aria-label={`تسجيل سند دفع للمورد ${s.name}`}>📤 سداد مورد</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
            <div className={`overflow-hidden rounded-[2rem] shadow-2xl border-2 ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[500px]">
                        <thead>
                            <tr className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${theme === 'dark' ? 'bg-[var(--color-background-input)] text-[var(--color-text-muted)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border-default)]'}`}>
                                <th scope="col" className="p-4 text-center w-12">#</th>
                                <th scope="col" className="p-4 border-l">اسم المورد</th>
                                <th scope="col" className="p-4 text-center border-l w-32">الهاتف</th>
                                <th scope="col" className="p-4 text-center border-l w-32">الرصيد (YER)</th>
                                <th scope="col" className="p-4 text-center border-l w-48">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-default)]/50">
                            {filteredSuppliers.map((s, idx) => {
                                const balances = financeService.getSupplierBalances(s.id, purchases, vouchers);
                                const totalDue = balances.find(b => b.currency === 'YER')?.amount || 0;
                                return (
                                    <tr 
                                      key={s.id} 
                                      onClick={() => navigate('account-statement', { personId: s.id, personType: 'مورد' })}
                                      className="text-xs hover:bg-[var(--color-background-tertiary)]/50 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4 text-center font-black opacity-30 tabular-nums text-[var(--color-text-muted)]">{idx + 1}</td>
                                        <td className="p-4 font-black border-l text-[var(--color-text-default)]">{s.name}</td>
                                        <td className="p-4 text-center border-l tabular-nums font-bold text-[var(--color-text-muted)]">{s.phone}</td>
                                        <td className={`p-4 text-center border-l font-black tabular-nums ${totalDue > 0 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>{totalDue.toLocaleString()}</td>
                                        <td className="p-4 text-center border-l" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => navigate('account-statement', { personId: s.id, personType: 'مورد' })} className="p-2 hover:bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] rounded-lg transition-all" aria-label={`كشف حساب ${s.name}`}>📑</button>
                                                <button onClick={() => navigate('add-purchase', { supplierId: s.id })} className="p-2 hover:bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] rounded-lg transition-all" aria-label={`تسجيل شراء جديد من المورد ${s.name}`}>📦</button>
                                                <button onClick={() => handleDelete(s)} className="p-2 hover:bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-lg transition-all" aria-label={`حذف المورد ${s.name}`}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
      
      {/* زر ثابت وجامد في يمين أسفل الشاشة */}
      <button 
        onClick={() => navigate('add-supplier')} 
        aria-label="إضافة مورد جديد"
        className="fixed bottom-24 right-6 w-16 h-16 bg-[var(--color-accent-orange)] text-[var(--color-text-inverse)] rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.5)] flex items-center justify-center text-4xl border-4 border-white dark:border-[var(--color-background-input)] z-50 active:scale-95 transition-transform"
      >＋</button>
    </PageLayout>
  );
});

export default SuppliersList;
