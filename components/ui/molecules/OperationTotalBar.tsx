
import React, { memo } from 'react';
import { BaseButton } from '../atoms/BaseButton';

interface OperationTotalBarProps {
  total: number;
  currency: string;
  label: string;
  buttonText: string;
  onConfirm: () => void;
  isLoading: boolean;
  variant?: 'success' | 'primary' | 'danger';
  theme: 'light' | 'dark';
}

export const OperationTotalBar: React.FC<OperationTotalBarProps> = memo(({ 
  total, currency, label, buttonText, onConfirm, isLoading, variant = 'success', theme 
}) => {
  const isDark = theme === 'dark';
  
  const colors = {
    success: isDark ? 'text-emerald-400' : 'text-emerald-600',
    primary: isDark ? 'text-indigo-400' : 'text-indigo-600',
    danger: isDark ? 'text-rose-400' : 'text-rose-600'
  };

  return (
    <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
      <div className={`max-w-2xl mx-auto p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 border-2 ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'
      }`}>
        <div className="text-right pl-4">
          <p className="text-[8px] font-black uppercase opacity-60 text-slate-400">{label}</p>
          <h2 className={`text-2xl font-black tabular-nums ${colors[variant]}`}>
            {total.toLocaleString()} 
            <small className="text-xs opacity-50 mr-1 text-slate-400">{currency}</small>
          </h2>
        </div>
        <BaseButton 
          variant={variant} 
          size="lg" 
          onClick={onConfirm} 
          loading={isLoading}
          className="shadow-xl"
        >
          {buttonText}
        </BaseButton>
      </div>
    </div>
  );
});
