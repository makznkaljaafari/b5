
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatVoucherReceipt } from '../services/shareService';
import { Voucher } from '../types';

const VouchersList: React.FC = memo(() => {
  const { vouchers, navigate, deleteVoucher, addNotification, theme } = useApp();
  const [filter, setFilter] = useState<'الكل' | 'قبض' | 'دفع'>('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchesFilter = filter === 'الكل' || v.type === filter;
      const matchesSearch = v.person_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [vouchers, filter, searchTerm]);

  const handleDelete = useCallback(async (v: Voucher) => {
    if (window.confirm(`⚠️ حذف سند "${v.person_name}"؟`)) {
      try {
        await deleteVoucher(v.id); // deleteVoucher now handles notifications and logging
      } catch (err: any) {
        addNotification("خطأ ⚠️", err.message || "فشل في عملية الحذف.", "warning");
      }
    }
  }, [deleteVoucher, addNotification]);

  const fab = (
    <div className="flex flex-col gap-3">
      <button 
        onClick={() => navigate('add-voucher', { type: 'دفع' })} 
        aria-label="إصدار سند دفع"
        className="w-16 h-16 bg-[var(--color-status-danger)] text-[var(--color-text-inverse)] rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex items-center justify-center text-3xl border-4 border-white dark:border-[var(--color-background-input)] active:scale-90 transition-all"
      >📤</button>
      <button 
        onClick={() => navigate('add-voucher', { type: 'قبض' })} 
        aria-label="إصدار سند قبض"
        className="w-16 h-16 bg-[var(--color-status-success)] text-[var(--color-text-inverse)] rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center justify-center text-3xl border-4 border-white dark:border-[var(--color-background-input)] active:scale-90 transition-all"
      >📥</button>
    </div>
  );

  return (
    <PageLayout title="السندات المالية" onBack={() => navigate('dashboard')} floatingButton={fab}>
      <div className="space-y-4 pb-44 max-w-7xl mx-auto w-full px-2">
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="ابحث باسم الطرف..."
              className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] focus:border-[var(--color-accent-indigo)] rounded-2xl p-4 pr-12 font-bold text-sm shadow-lg transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="البحث باسم الطرف في السندات المالية"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30 text-[var(--color-text-muted)]">🔍</span>
          </div>
          <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-xl border-2 border-[var(--color-border-default)] shadow-md">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض السندات كشبكة"
              aria-pressed={viewMode === 'grid'}
            >🎴</button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}
              aria-label="عرض السندات كقائمة"
              aria-pressed={viewMode === 'list'}
            >📜</button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2" role="group" aria-label="تصفية السندات حسب النوع">
          {(['الكل', 'قبض', 'دفع'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-black text-xs transition-all border-2 ${filter === f ? 'bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)] border-transparent' : 'bg-[var(--color-background-card)] text-[var(--color-text-muted)] border-[var(--color-border-default)]'}`}
              aria-label={f === 'الكل' ? 'عرض جميع السندات' : `عرض سندات ${f}`}
              aria-pressed={filter === f}
            >
              {f === 'الكل' ? 'جميع السندات' : `سندات ${f}`}
            </button>
          ))}
        </div>

        {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVouchers.map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => navigate('voucher-details', { voucherId: v.id })}
                  className={`p-6 rounded-[2rem] border-2 transition-all group cursor-pointer hover:shadow-2xl active:scale-[0.98] ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)] shadow-xl'}`}
                  role="listitem"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-black text-lg text-[var(--color-text-default)] truncate max-w-[150px]">{v.person_name}</h3>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border mt-1 inline-block ${v.type === 'قبض' ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[var(--color-status-success)]/20' : 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning)]/20'}`}>سند {v.type}</span>
                    </div>
                    <div className="text-left">
                        <p className={`text-xl font-black tabular-nums ${v.type === 'قبض' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-status-warning)]'}`}>
                            {v.amount.toLocaleString()}
                        </p>
                        <small className="text-[8px] font-black opacity-30 text-[var(--color-text-muted)]">{v.currency}</small>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-default)]/50" onClick={e => e.stopPropagation()}>
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)]">📅 {new Date(v.date).toLocaleDateString('ar-YE')}</span>
                    <div className="flex gap-2">
                        <button onClick={() => shareToWhatsApp(formatVoucherReceipt(v))} className="w-8 h-8 bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] rounded-xl flex items-center justify-center shadow-sm" aria-label={`مشاركة سند ${v.type} لـ ${v.person_name} عبر واتساب`}>💬</button>
                        <button onClick={() => navigate('voucher-details', { voucherId: v.id })} className="w-8 h-8 bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] rounded-xl flex items-center justify-center shadow-sm" aria-label={`عرض تفاصيل سند ${v.type} لـ ${v.person_name}`}>📄</button>
                    </div>
                  </div>
                </div>
            ))}
            </div>
        ) : (
            <div className={`overflow-hidden rounded-[2rem] shadow-2xl border-2 ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[500px]">
                        <thead>
                            <tr className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${theme === 'dark' ? 'bg-[var(--color-background-input)] text-[var(--color-text-muted)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border-default)]'}`}>
                                <th scope="col" className="p-4 text-center w-12">#</th>
                                <th scope="col" className="p-4 border-l">اسم الطرف</th>
                                <th scope="col" className="p-4 text-center border-l w-24">النوع</th>
                                <th scope="col" className="p-4 text-center border-l w-32">المبلغ</th>
                                <th scope="col" className="p-4 text-center border-l w-24">التاريخ</th>
                                <th scope="col" className="p-4 text-center border-l w-48">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-default)]/50">
                            {filteredVouchers.map((v, idx) => (
                                <tr 
                                  key={v.id} 
                                  onClick={() => navigate('voucher-details', { voucherId: v.id })}
                                  className="text-xs hover:bg-[var(--color-background-tertiary)]/50 transition-colors cursor-pointer group"
                                >
                                    <td className="p-4 text-center font-black tabular-nums text-[var(--color-text-muted)]">{(filteredVouchers.length - idx)}</td>
                                    <td className="p-4 font-black border-l text-[var(--color-text-default)]">{v.person_name}</td>
                                    <td className="p-4 text-center border-l">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${v.type === 'قبض' ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]' : 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]'}`}>سند {v.type}</span>
                                    </td>
                                    <td className={`p-4 text-center border-l font-black tabular-nums ${v.type === 'قبض' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-status-warning)]'}`}>{v.amount.toLocaleString()}</td>
                                    <td className="p-4 text-center border-l tabular-nums font-bold text-[var(--color-text-muted)]">{new Date(v.date).toLocaleDateString('ar-YE', {day:'2-digit', month:'2-digit'})}</td>
                                    <td className="p-4 text-center border-l" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => shareToWhatsApp(formatVoucherReceipt(v))} className="p-2 hover:bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] rounded-lg transition-all" aria-label={`مشاركة سند ${v.type} لـ ${v.person_name} عبر واتساب`}>💬</button>
                                            <button onClick={() => navigate('voucher-details', { voucherId: v.id })} className="p-2 hover:bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] rounded-lg transition-all" aria-label={`عرض سند ${v.type} لـ ${v.person_name}`}>📄</button>
                                            <button onClick={() => handleDelete(v)} className="p-2 hover:bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-lg transition-all" aria-label={`حذف سند ${v.type} لـ ${v.person_name}`}>🗑️</button>
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

export default VouchersList;
