
import React, { memo } from 'react';
import { QatCategory, Theme } from '../../types';

interface CategoryCardProps {
  cat: QatCategory;
  theme: Theme;
  onNavigate: (page: any, params: any) => void;
  stats: { totalSold: number; salesCount: number };
}

export const CategoryCard: React.FC<CategoryCardProps> = memo(({ cat, theme, onNavigate, stats }) => {
  const isLow = cat.stock <= (cat.low_stock_threshold || 5);

  return (
    <div 
      className={`p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl group relative overflow-hidden ${
        isLow ? 'border-[var(--color-status-danger)]/30 bg-[var(--color-status-danger-bg)]/[0.02]' : theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)] shadow-xl'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform ${isLow ? 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]' : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]'}`}>🌿</div>
          <div>
            <h3 className="font-black text-xl text-[var(--color-text-default)]">{cat.name}</h3>
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-widest">السعر: {cat.price.toLocaleString()} {cat.currency}</p>
          </div>
        </div>
        <div className="text-left">
           <span className={`text-3xl font-black tabular-nums tracking-tighter ${isLow ? 'text-[var(--color-status-danger)] animate-pulse' : 'text-[var(--color-status-success)]'}`}>{cat.stock}</span>
           <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase">حبه متوفر</p>
        </div>
      </div>

      <div className={`rounded-2xl p-4 mb-6 flex justify-around items-center border ${theme === 'dark' ? 'bg-[var(--color-background-input)]/50 border-[var(--color-border-subtle)]' : 'bg-[var(--color-background-tertiary)] border-[var(--color-border-default)]'}`}>
         <div className="text-center">
            <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase mb-1">إجمالي المبيعات</p>
            <p className="font-black text-sm tabular-nums text-[var(--color-text-default)]">{stats.totalSold} حبه</p>
         </div>
         <div className="w-px h-8 bg-[var(--color-border-default)]"></div>
         <div className="text-center">
            <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase mb-1">عدد الفواتير</p>
            <p className="font-black text-sm tabular-nums text-[var(--color-text-default)]">{stats.salesCount}</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
         <button onClick={() => onNavigate('add-sale', { qatType: cat.name })} className="bg-[var(--color-accent-sky)] text-[var(--color-text-inverse)] py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[var(--color-accent-sky)]/80 transition-all shadow-md active:scale-95">💰 بيع سريع</button>
         <button onClick={() => onNavigate('add-category', { categoryId: cat.id })} className="bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[var(--color-background-tertiary)]/80 transition-all active:scale-95">📝 تعديل</button>
      </div>
    </div>
  );
});
