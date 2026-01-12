
import React from 'react';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  loading?: boolean;
}

export const BaseButton: React.FC<BaseButtonProps> = ({ 
  children, variant = 'primary', size = 'md', icon, loading, className, ...props 
}) => {
  const baseStyles = "relative flex items-center justify-center gap-2 font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-2xl";
  
  const variants = {
    primary: "bg-indigo-600 text-white shadow-lg hover:bg-indigo-700",
    secondary: "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300",
    danger: "bg-rose-500 text-white shadow-lg hover:bg-rose-600",
    success: "bg-emerald-500 text-white shadow-lg hover:bg-emerald-600",
    ghost: "bg-transparent border-2 border-slate-200 dark:border-white/10 text-slate-400"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[9px]",
    md: "px-5 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
    xl: "px-10 py-5 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
