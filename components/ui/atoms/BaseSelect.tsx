
import React, { memo } from 'react';

interface BaseSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: string;
  options: { value: string; label: string }[];
}

export const BaseSelect: React.FC<BaseSelectProps> = memo(({ 
  label, icon, options, className = '', ...props 
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>}
      <div className="relative group">
        <select 
          className={`w-full bg-[var(--color-background-tertiary)] rounded-2xl p-4 font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all appearance-none ${icon ? 'pr-12' : ''} ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {icon && <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl pointer-events-none">{icon}</span>}
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">▼</span>
      </div>
    </div>
  );
});
