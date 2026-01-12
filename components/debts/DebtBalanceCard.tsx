
import React from 'react';
import { Theme } from '../../types';

interface DebtBalanceCardProps {
  item: any;
  theme: Theme;
  onNavigate: (page: any, params: any) => void;
  onShare: (item: any) => void;
  currency: string;
}

export const DebtBalanceCard: React.FC<DebtBalanceCardProps> = ({ item, theme, onNavigate, onShare, currency }) => {
  return (
    <div className={`p-5 rounded-[2rem] border-2 transition-all group relative overflow-hidden ${
      item.status.level === 'critical' 
        ? 'border-[var(--color-status-danger)]/50 bg-[var(--color-status-danger-bg)]/[0.03]' 
        : theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)] shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-4">
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
              item.type === 'عميل' ? 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info)]' : 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]'
            }`}>
              {item.type === 'عميل' ? '👤' : '🚛'}
            </div>
            <div>
               <h4 className="font-black text-base text-[var(--color-text-default)] leading-tight">{item.name}</h4>
               <div className="flex items-center gap-2 mt-1">
                  <span className={`${item.status.color} text-[9px] font-black flex items-center gap-1`}>
                     <span>{item.status.icon}</span>
                     {item.status.label}
                  </span>
                  <span className="text-[9px] font-bold text-[var(--color-text-muted)] tabular-nums">{item.days} يوم</span>
               </div>
            </div>
         </div>
         <div className="text-left">
            <p className={`text-xl font-black tabular-nums tracking-tighter ${item.amount > 0 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>
               {Math.abs(item.amount).toLocaleString()}
            </p>
            <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase">{item.amount > 0 ? 'لنا' : 'علينا'}</p>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
         <button 
           onClick={() => onNavigate('account-statement', { personId: item.id, personType: item.type })}
           className="bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] py-2.5 rounded-xl font-black text-[10px] active:scale-95"
         >📑 كشف</button>
         
         <button 
           onClick={() => onShare(item)}
           className="bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success)]/20 py-2.5 rounded-xl font-black text-[10px] active:scale-95"
         >💬 تذكير</button>

         <button 
           onClick={() => onNavigate('add-voucher', { 
             type: item.amount > 0 ? (item.type === 'عميل' ? 'قبض' : 'دفع') : (item.type === 'عميل' ? 'دفع' : 'قبض'), 
             personId: item.id, personType: item.type, amount: Math.abs(item.amount), currency 
           })}
           className="bg-[var(--color-status-success)] text-[var(--color-text-inverse)] py-2.5 rounded-xl font-black text-[10px] shadow-lg active:scale-95"
         >✅ تصفية</button>
      </div>
    </div>
  );
};
