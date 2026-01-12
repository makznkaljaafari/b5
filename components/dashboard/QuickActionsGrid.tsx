
import React, { memo, useMemo } from 'react';
import { useUI } from '../../context/UIContext';

const ServiceButton = memo(({ s, onClick, theme }: any) => (
  <button 
    onClick={() => onClick(s.id)}
    className={`flex flex-col items-center justify-center gap-2 p-3 lg:p-4 rounded-2xl lg:rounded-3xl border transition-all active:scale-95 hover:shadow-lg ${
      theme === 'dark' ? 'bg-[var(--color-background-card)]/40 border-[var(--color-border-subtle)]' : 'bg-white border-slate-200 shadow-sm'
    }`}
  >
    <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-xl lg:text-3xl shadow-sm ${s.bg}`}>
      {s.icon}
    </div>
    <span className={`text-[9px] lg:text-xs font-black text-center leading-tight ${s.text}`}>{s.label}</span>
  </button>
));

export const QuickActionsGrid = memo(({ navigate, theme }: any) => {
  const mainServices = useMemo(() => [
    { id: 'sales', label: 'المبيعات', icon: '💰', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'purchases', label: 'المشتريات', icon: '📦', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
    { id: 'vouchers', label: 'السندات', icon: '📥', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'debts', label: 'الميزانية', icon: '⚖️', bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' },
    { id: 'customers', label: 'العملاء', icon: '👥', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    { id: 'suppliers', label: 'الموردين', icon: '🚛', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    { id: 'categories', label: 'المخزون', icon: '🌿', bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
    { id: 'reports', label: 'التقارير', icon: '📊', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    { id: 'expenses', label: 'المصاريف', icon: '💸', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
    { id: 'waste', label: 'التالف', icon: '🥀', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
    { id: 'returns', label: 'المرتجعات', icon: '🔄', bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'activity-log', label: 'الرقابة', icon: '🛡️', bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' },
  ], []);

  const handleAction = (id: string) => {
    navigate(id);
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 lg:gap-4">
      {mainServices.map((s) => (
        <ServiceButton key={s.id} s={s} onClick={handleAction} theme={theme} />
      ))}
    </div>
  );
});
