
import React, { memo } from 'react';

const ReportBtn = memo(({ label, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-[var(--color-background-card)] p-6 lg:p-8 rounded-[2rem] border-2 border-[var(--color-border-default)] shadow-lg flex flex-col items-center gap-3 transition-all active:scale-95 hover:border-[var(--color-accent-indigo)]/50 group"
  >
     <span className="text-4xl group-hover:scale-110 transition-transform text-[var(--color-text-default)]">{icon}</span>
     <span className="text-xs font-black text-[var(--color-text-default)]">{label}</span>
  </button>
));

export const ReportsNavigation = ({ onNavigate, onSelectReport, onDailyClosing }: any) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      <ReportBtn label="كشف المبيعات" icon="💰" onClick={() => onSelectReport('sales')} />
      <ReportBtn label="كشف المشتريات" icon="📦" onClick={() => onSelectReport('purchases')} />
      <ReportBtn label="قائمة الدخل" icon="⚖️" onClick={() => onSelectReport('pl')} />
      <ReportBtn label="سجل المصروفات" icon="💸" onClick={() => onSelectReport('expenses')} />
      <ReportBtn label="ملخص الديون" icon="👥" onClick={() => onNavigate('debts')} />
      <ReportBtn label="إغلاق يومي" icon="📊" onClick={onDailyClosing} />
      <ReportBtn label="سجل التالف" icon="🥀" onClick={() => onNavigate('waste')} />
      <ReportBtn label="كشف السندات" icon="📥" onClick={() => onNavigate('vouchers')} />
    </div>
  );
};
