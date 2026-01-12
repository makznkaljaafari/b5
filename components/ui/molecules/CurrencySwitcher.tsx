
import React, { memo } from 'react';

interface CurrencySwitcherProps {
  value: 'YER' | 'SAR' | 'OMR';
  onChange: (val: 'YER' | 'SAR' | 'OMR') => void;
  activeColor?: string;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = memo(({ value, onChange, activeColor = 'bg-indigo-600' }) => (
  <div className="bg-[var(--color-background-tertiary)] p-1 rounded-2xl flex gap-1 border border-[var(--color-border-primary)] shadow-inner w-full">
    {(['YER', 'SAR', 'OMR'] as const).map(cur => (
      <button
        key={cur}
        type="button"
        onClick={() => onChange(cur)}
        className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${
          value === cur ? `${activeColor} text-white shadow-lg` : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {cur === 'YER' ? 'ريال يمني' : cur === 'SAR' ? 'ريال سعودي' : 'ريال عماني'}
      </button>
    ))}
  </div>
));
