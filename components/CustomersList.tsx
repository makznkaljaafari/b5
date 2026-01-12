
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Customer } from '../types';
import { financeService } from '../services/financeService';

const CustomersList: React.FC = memo(() => {
  const { customers, sales, vouchers, navigate, deleteCustomer, addNotification, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c: Customer) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone && c.phone.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  const handleDelete = useCallback(async (customer: Customer) => {
    if (customer.name === "الزبون العام نقدي") {
      return addNotification("حساب نظامي 🚫", "لا يمكن حذف الزبون العام، فهو ضروري لعمليات البيع النقدي.", "warning");
    }
    
    if (window.confirm(`⚠️ تحذير: هل أنت متأكد من حذف العميل "${customer.name}"؟\nسيتم حذف كافة بياناته وسجلاته نهائياً من السحابة.`)) {
      try {
        await deleteCustomer(customer.id); // deleteCustomer now handles notifications and logging
      } catch (err: any) {
        // Error handling is now primarily in deleteCustomer, but this catch remains for unexpected issues
        addNotification("عذراً ⚠️", err.message || "لا يمكن حذف العميل لوجود عمليات مالية مرتبطة به.", "warning");
      }
    }
  }, [deleteCustomer, addNotification]);

  const fab = (
    <button 
      onClick={() => navigate('add-customer')} 
      className="w-16 h-16 lg:w-20 lg:h-20 bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)] rounded-[1.8rem] shadow-[0_15px_40px_rgba(79,70,229,0.4)] flex items-center justify-center text-4xl border-4 border-white dark:border-[var(--color-background-input)] active:scale-90 transition-all"
      aria-label="إضافة عميل جديد"
    >
      👤＋
    </button>
  );

  return (
    <PageLayout title="دليل العملاء" onBack={() => navigate('dashboard')} floatingButton={fab}>
      <div className="space-y-6 pb-44 max-w-7xl mx-auto w-full px-2">
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="ابحث عن عميل..."
              className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] focus:border-[var(--color-accent-sky)] rounded-2xl p-4 pr-12 font-bold text-sm shadow-lg transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="البحث عن عميل بالاسم أو رقم الهاتف"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30 text-[var(--color-text-muted)]">🔍</span>
          </div>
          <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-xl border-2 border-[var(--color-border-default)] shadow-md">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-[var(--color-accent-sky)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض العملاء كشبكة"
              aria-pressed={viewMode === 'grid'}
            >🎴</button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--color-accent-sky)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض العملاء كقائمة"
              aria-pressed={viewMode === 'list'}
            >📜</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {filteredCustomers.map((c) => {
              const debts = financeService.getCustomerBalances(c.id, sales, vouchers);
              const totalDebt = debts.find(d => d.currency === 'YER')?.amount || 0;
              const isGeneral = c.name === "الزبون العام نقدي";
              return (
                <div 
                  key={c.id} 
                  className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl group cursor-pointer ${
                    isGeneral ? 'border-[var(--color-accent-indigo)]/30 bg-[var(--color-accent-indigo)]/[0.02]' : theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)] shadow-xl'
                  }`}
                  onClick={() => navigate('account-statement', { personId: c.id, personType: 'عميل' })}
                  role="listitem"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-3 transition-transform ${isGeneral ? 'bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)]' : 'bg-[var(--color-status-info-bg)] dark:bg-[var(--color-accent-indigo)]/30'}`} aria-hidden="true">{isGeneral ? '⭐' : '👤'}</div>
                      <div>
                        <h3 className="font-black text-lg text-[var(--color-text-default)] leading-tight">{c.name}</h3>
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 tabular-nums">📱 {isGeneral ? 'نظامي' : c.phone || 'بدون هاتف'}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-xl font-black tabular-nums tracking-tighter ${totalDebt > 0 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>
                        {totalDebt.toLocaleString()}
                      </p>
                      <small className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest block text-left">YER</small>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                     <button onClick={() => navigate('account-statement', { personId: c.id, personType: 'عميل' })} className="bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--color-status-success-bg)]/80 transition-all" aria-label={`عرض كشف حساب العميل ${c.name}`}>📑 كشف حساب</button>
                     <button onClick={() => navigate('add-sale', { customerId: c.id })} className="bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--color-status-info-bg)]/80 transition-all" aria-label={`تسجيل عملية بيع جديدة للعميل ${c.name}`}>💰 بيع جديد</button>
                     <button onClick={() => navigate('add-voucher', { type: 'قبض', personId: c.id, personType: 'عميل' })} className="bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--color-background-tertiary)]/80 transition-all" aria-label={`تسجيل سند قبض من العميل ${c.name}`}>📥 قبض مبلغ</button>
                     {!isGeneral && <button onClick={() => handleDelete(c)} className="bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--color-status-danger-bg)]/80 transition-all" aria-label={`حذف العميل ${c.name}`}>🗑️ حذف العميل</button>}
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
                                <th scope="col" className="p-4 border-l">اسم العميل</th>
                                <th scope="col" className="p-4 text-center border-l w-32">الهاتف</th>
                                <th scope="col" className="p-4 text-center border-l w-32">الرصيد (YER)</th>
                                <th scope="col" className="p-4 text-center border-l w-48">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-default)]/50">
                            {filteredCustomers.map((c, idx) => {
                                const debts = financeService.getCustomerBalances(c.id, sales, vouchers);
                                const totalDebt = debts.find(d => d.currency === 'YER')?.amount || 0;
                                const isGeneral = c.name === "الزبون العام نقدي";
                                return (
                                    <tr 
                                      key={c.id} 
                                      className={`text-xs hover:bg-[var(--color-background-tertiary)]/50 transition-colors cursor-pointer ${isGeneral ? 'bg-[var(--color-accent-indigo)]/10' : ''}`}
                                      onClick={() => navigate('account-statement', { personId: c.id, personType: 'عميل' })}
                                    >
                                        <td className="p-4 text-center font-black tabular-nums text-[var(--color-text-muted)]">{idx + 1}</td>
                                        <td className="p-4 font-black border-l text-[var(--color-text-default)]">{isGeneral ? '⭐ ' : ''}{c.name}</td>
                                        <td className="p-4 text-center border-l tabular-nums font-bold text-[var(--color-text-muted)]">{isGeneral ? '-' : c.phone}</td>
                                        <td className={`p-4 text-center border-l font-black tabular-nums ${totalDebt > 0 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>{totalDebt.toLocaleString()}</td>
                                        <td className="p-4 text-center border-l" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => navigate('account-statement', { personId: c.id, personType: 'عميل' })} className="p-2 hover:bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] rounded-lg transition-all" aria-label={`كشف حساب ${c.name}`}>📑</button>
                                                <button onClick={() => navigate('add-sale', { customerId: c.id })} className="p-2 hover:bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] rounded-lg transition-all" aria-label={`تسجيل بيع جديد للعميل ${c.name}`}>💰</button>
                                                {!isGeneral && <button onClick={() => handleDelete(c)} className="p-2 hover:bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-lg transition-all" aria-label={`حذف العميل ${c.name}`}>🗑️</button>}
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
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-40 opacity-20 flex flex-col items-center gap-8 text-[var(--color-text-muted)]">
            <span className="text-[10rem]">👥</span>
            <p className="font-black text-3xl">لا يوجد عملاء بهذا الاسم</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
});

export default CustomersList;
