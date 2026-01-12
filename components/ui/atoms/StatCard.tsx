
import React, { memo } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  currency: string;
  colorClass: string;
  icon: string;
  onClick?: () => void;
  subText?: string;
}

export const StatCard: React.FC<StatCardProps> = memo(({ title, value, currency, colorClass, icon, onClick, subText }) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-[2rem] border-2 bg-[var(--color-background-secondary)] border-[var(--color-border-primary)] shadow-sm hover:shadow-xl transition-all cursor-pointer active:scale-95 group`}
  >
    <div className="flex justify-between items-center mb-3">
      <span className="text-xl group-hover:rotate-12 transition-transform">{icon}</span>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <h3 className={`text-2xl font-black tabular-nums tracking-tighter ${colorClass}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      <span className="text-[9px] font-bold opacity-30">{currency}</span>
    </div>
    {subText && <p className="text-[8px] font-black text-indigo-500 mt-2">{subText}</p>}
  </div>
));
