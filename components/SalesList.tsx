
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Sale } from '../types';
import { SaleCard } from './sales/SaleCard';
import { SalesTable } from './sales/SalesTable';

const SalesList: React.FC = memo(() => {
  const { sales, navigate, returnSale, user, theme, loadAllData, isSyncing, addNotification, deleteSale } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.qat_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  const handleReturn = useCallback(async (sale: Sale) => {
    if (sale.is_returned) return;
    if (window.confirm(`هل أنت متأكد من إرجاع فاتورة ${sale.customer_name}؟`)) {
      try {
        await returnSale(sale.id);
      } catch (err: any) {
        addNotification("خطأ ⚠️", err.message || "فشل إرجاع الفاتورة.", "warning");
      }
    }
  }, [returnSale, addNotification]);

  const handleDelete = useCallback(async (sale: Sale) => {
    if (window.confirm(`هل أنت متأكد من حذف فاتورة البيع رقم ${sale.id.slice(-6).toUpperCase()}؟`)) {
      try {
        await deleteSale(sale.id);
      } catch (err: any) {
        addNotification("خطأ ⚠️", "فشل حذف فاتورة البيع.", "warning");
      }
    }
  }, [deleteSale, addNotification]);

  const agencyName = user?.agency_name || 'الوكالة';

  return (
    <PageLayout 
      title="سجل المبيعات" 
      onBack={() => navigate('dashboard')}
      headerExtra={
        <button onClick={() => user?.id && loadAllData(user.id, false)} className={`w-10 h-10 rounded-xl bg-[var(--color-background-card)]/10 flex items-center justify-center text-lg ${isSyncing ? 'animate-spin' : ''}`}>🔄</button>
      }
      floatingButton={
        <button onClick={() => navigate('add-sale')} className="w-16 h-16 bg-[var(--color-accent-sky)] text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center text-4xl border-4 border-white dark:border-[var(--color-background-input)] active:scale-90 transition-all">💰＋</button>
      }
    >
      <div className="space-y-4 pb-44 max-w-7xl mx-auto w-full px-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input 
              type="text" placeholder="ابحث باسم العميل أو الصنف..."
              className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] rounded-2xl p-4 pr-12 font-bold text-sm shadow-sm focus:border-[var(--color-accent-sky)] outline-none transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
          </div>
          <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-xl border border-[var(--color-border-default)]">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-[var(--color-accent-sky)] text-white shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}>🎴</button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--color-accent-sky)] text-white shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}>📜</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSales.map((sale) => (
                <SaleCard 
                  key={sale.id} 
                  sale={sale} 
                  theme={theme} 
                  agencyName={agencyName} 
                  onNavigate={navigate} 
                  onReturn={handleReturn} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
        ) : (
            <SalesTable 
              sales={filteredSales} 
              theme={theme} 
              agencyName={agencyName} 
              onNavigate={navigate} 
              onReturn={handleReturn} 
              onDelete={handleDelete} 
            />
        )}
        
        {filteredSales.length === 0 && (
          <div className="text-center py-40 opacity-20">
            <span className="text-8xl">💰</span>
            <p className="font-black text-xl mt-4 text-[var(--color-text-muted)]">لا يوجد مبيعات مطابقة لبحثك</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
});

export default SalesList;
