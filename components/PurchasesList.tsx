
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Purchase } from '../types';

const PurchasesList: React.FC = memo(() => {
  // Added addNotification to the destructuring
  const { purchases, navigate, theme, loadAllData, isSyncing, user, deletePurchase, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.qat_type.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [purchases, searchTerm]);

  const handleRefreshData = useCallback(() => {
    if (user?.id) {
      loadAllData(user.id, false);
    }
  }, [user?.id, loadAllData]);

  const handleDelete = useCallback(async (purchase: Purchase) => {
    if (window.confirm(`هل أنت متأكد من حذف فاتورة الشراء رقم ${purchase.id.slice(-6).toUpperCase()} من المورد ${purchase.supplier_name}؟`)) {
      try {
        await deletePurchase(purchase.id); // deletePurchase now handles notifications and logging
      } catch (err: any) {
        // Added addNotification from useApp
        addNotification("خطأ ⚠️", err.message || "فشل حذف فاتورة الشراء.", "warning");
      }
    }
  }, [deletePurchase, addNotification]);

  const fab = (
    <button 
      onClick={() => navigate('add-purchase')} 
      aria-label="إضافة فاتورة شراء جديدة"
      className="w-16 h-16 lg:w-20 lg:h-20 bg-[var(--color-accent-orange)] text-[var(--color-text-inverse)] rounded-[1.8rem] shadow-[0_15px_40px_rgba(249,115,22,0.4)] flex items-center justify-center text-4xl border-4 border-white dark:border-[var(--color-background-input)] active:scale-90 transition-all"
    >
      ＋
    </button>
  );

  return (
    <PageLayout 
      title="سجل المشتريات" 
      onBack={() => navigate('dashboard')}
      floatingButton={fab}
      headerExtra={
        <button 
          onClick={handleRefreshData}
          aria-label="تحديث سجل المشتريات"
          className={`w-10 h-10 rounded-xl bg-[var(--color-background-card)]/10 flex items-center justify-center text-lg transition-all ${isSyncing ? 'animate-spin' : 'active:scale-90'}`}
        >🔄</button>
      }
    >
      <div className="space-y-4 pb-44 max-w-7xl mx-auto w-full px-2">
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="ابحث في المشتريات..."
              className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] focus:border-[var(--color-accent-orange)] rounded-2xl p-4 pr-12 font-bold text-sm shadow-sm transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="البحث باسم المورد أو الصنف في سجل المشتريات"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30 text-[var(--color-text-muted)]">🔍</span>
          </div>
          <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-xl border-2 border-[var(--color-border-default)] shadow-md">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-[var(--color-accent-orange)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض المشتريات كشبكة"
              aria-pressed={viewMode === 'grid'}
            >🎴</button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--color-accent-orange)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض المشتريات كقائمة"
              aria-pressed={viewMode === 'list'}
            >📜</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPurchases.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => navigate('purchase-invoice-view', { purchase: p })}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden cursor-pointer hover:shadow-2xl active:scale-[0.98] ${p.is_returned ? 'opacity-50 grayscale' : ''} ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)] shadow-xl'}`}
                  role="listitem"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-black text-lg text-[var(--color-text-default)] truncate max-w-[180px]">{p.supplier_name}</h3>
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-widest">{p.qat_type} • {p.quantity} حبات</p>
                    </div>
                    <div className="text-left">
                        <p className={`text-xl font-black tabular-nums ${p.is_returned ? 'line-through text-[var(--color-status-danger)]' : 'text-[var(--color-accent-orange)]'}`}>{p.total.toLocaleString()}</p>
                        <small className="text-[8px] font-black opacity-30 text-[var(--color-text-muted)]">YER</small>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-default)]/50" onClick={e => e.stopPropagation()}>
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)]">📅 {new Date(p.date).toLocaleDateString('ar-YE')}</span>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('add-purchase', { purchaseId: p.id })} className="w-8 h-8 bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] rounded-xl flex items-center justify-center shadow-sm" aria-label={`تعديل فاتورة شراء المورد ${p.supplier_name}`}>✏️</button>
                        <button onClick={() => navigate('purchase-invoice-view', { purchase: p })} className="w-8 h-8 bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] rounded-xl flex items-center justify-center shadow-sm" aria-label={`عرض فاتورة شراء المورد ${p.supplier_name}`}>📄</button>
                        <button onClick={() => handleDelete(p)} className="w-8 h-8 bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-xl flex items-center justify-center shadow-sm" aria-label={`حذف فاتورة شراء المورد ${p.supplier_name}`}>🗑️</button>
                    </div>
                  </div>
                </div>
            ))}
            </div>
        ) : (
            <div className={`overflow-hidden rounded-[2rem] shadow-2xl border-2 ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[600px]">
                        <thead>
                            <tr className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${theme === 'dark' ? 'bg-[var(--color-background-input)] text-[var(--color-text-muted)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border-default)]'}`}>
                                <th scope="col" className="p-4 text-center w-12">#</th>
                                <th scope="col" className="p-4 border-l">المورد</th>
                                <th scope="col" className="p-4 text-center border-l w-24">الصنف</th>
                                <th scope="col" className="p-4 text-center border-l w-20">كمية</th>
                                <th scope="col" className="p-4 text-center border-l w-32">الإجمالي</th>
                                <th scope="col" className="p-4 text-center border-l w-40">تحكم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-default)]/50">
                            {filteredPurchases.map((p, idx) => (
                                <tr 
                                  key={p.id} 
                                  onClick={() => navigate('purchase-invoice-view', { purchase: p })}
                                  className={`text-xs hover:bg-[var(--color-background-tertiary)]/50 transition-colors cursor-pointer ${p.is_returned ? 'opacity-40 bg-[var(--color-status-danger-bg)]/5' : ''}`}
                                >
                                    <td className="p-4 text-center font-black opacity-30 tabular-nums text-[var(--color-text-muted)]">{(filteredPurchases.length - idx)}</td>
                                    <td className={`p-4 font-black border-l ${p.is_returned ? 'line-through text-[var(--color-status-danger)]' : 'text-[var(--color-text-default)]'}`}>{p.supplier_name}</td>
                                    <td className="p-4 text-center border-l font-bold text-[var(--color-text-default)]">{p.qat_type}</td>
                                    <td className="p-4 text-center border-l font-black tabular-nums text-[var(--color-text-default)]">{p.quantity} حبه</td>
                                    <td className={`p-4 text-center border-l font-black tabular-nums ${p.is_returned ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-accent-orange)]'}`}>{p.total.toLocaleString()}</td>
                                    <td className="p-4 text-center border-l" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button onClick={() => navigate('add-purchase', { purchaseId: p.id })} className="p-2 hover:bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] rounded-lg transition-all" aria-label={`تعديل فاتورة شراء المورد ${p.supplier_name}`}>✏️</button>
                                            <button onClick={() => navigate('purchase-invoice-view', { purchase: p })} className="p-2 hover:bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] rounded-lg transition-all" aria-label={`عرض فاتورة شراء المورد ${p.supplier_name}`}>📄</button>
                                            <button onClick={() => handleDelete(p)} className="p-2 hover:bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-lg transition-all" aria-label={`حذف فاتورة شراء المورد ${p.supplier_name}`}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </PageLayout>
  );
});

export default PurchasesList;
