
import React, { memo } from 'react';

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  icon?: string;
  error?: string;
  as?: 'input' | 'textarea';
}

export const BaseInput: React.FC<BaseInputProps> = memo(({ 
  label, icon, error, as = 'input', className = '', ...props 
}) => {
  const InputTag = as as any;
  const baseClasses = `w-full bg-[var(--color-background-tertiary)] rounded-2xl p-4 font-bold text-sm outline-none border-2 transition-all ${
    error ? 'border-rose-500' : 'border-transparent focus:border-indigo-500'
  } ${icon ? 'pr-12' : ''} ${className}`;

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>}
      <div className="relative group">
        <InputTag className={baseClasses} {...props} />
        {icon && <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl">{icon}</span>}
      </div>
      {error && <p className="text-[9px] font-black text-rose-500 px-2 italic">{error}</p>}
    </div>
  );
});
