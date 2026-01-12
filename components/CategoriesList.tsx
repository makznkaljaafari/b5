
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { QatCategory } from '../types';
import { CategoryCard } from './inventory/CategoryCard';

const CategoriesList: React.FC = memo(() => {
  const { categories, navigate, theme, sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const getCategoryStats = useCallback((catName: string) => {
    const catSales = sales.filter(s => s.qat_type === catName && !s.is_returned);
    const totalSold = catSales.reduce((sum, s) => sum + s.quantity, 0);
    return { totalSold, salesCount: catSales.length };
  }, [sales]);

  return (
    <PageLayout title="إدارة المخزون" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pb-44 max-w-7xl mx-auto w-full px-2">
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="ابحث عن صنف..."
              className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] focus:border-[var(--color-accent-emerald)] rounded-2xl p-4 pr-12 font-bold text-sm shadow-lg transition-all outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
          </div>
          <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-xl border-2 border-[var(--color-border-default)] shadow-md">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'grid' ? 'bg-[var(--color-accent-emerald)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}>🎴</button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--color-accent-emerald)] text-[var(--color-text-inverse)] shadow-md' : 'opacity-40 text-[var(--color-text-muted)]'}`}>📜</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <CategoryCard 
                key={cat.id} 
                cat={cat} 
                theme={theme} 
                onNavigate={navigate} 
                stats={getCategoryStats(cat.name)} 
              />
            ))}
          </div>
        ) : (
            <div className={`overflow-hidden rounded-[2rem] shadow-2xl border-2 ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-right border-collapse min-w-[500px]">
                        <thead>
                            <tr className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${theme === 'dark' ? 'bg-[var(--color-background-input)] text-[var(--color-text-muted)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border-default)]'}`}>
                                <th className="p-4 text-center w-12">#</th>
                                <th className="p-4 border-l">الصنف</th>
                                <th className="p-4 text-center border-l w-32">الرصيد الحالي</th>
                                <th className="p-4 text-center border-l w-32">سعر البيع</th>
                                <th className="p-4 text-center border-l w-48">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-default)]/50">
                            {filteredCategories.map((cat, idx) => (
                                <tr key={cat.id} className="text-xs hover:bg-[var(--color-background-tertiary)]/50 transition-colors">
                                    <td className="p-4 text-center font-black opacity-30 tabular-nums">{(filteredCategories.length - idx)}</td>
                                    <td className="p-4 font-black border-l text-[var(--color-text-default)]">🌿 {cat.name}</td>
                                    <td className={`p-4 text-center border-l font-black tabular-nums ${cat.stock < 5 ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>{cat.stock} حبه</td>
                                    <td className="p-4 text-center border-l font-bold tabular-nums text-[var(--color-text-muted)]">{cat.price.toLocaleString()} {cat.currency}</td>
                                    <td className="p-4 text-center border-l">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => navigate('add-sale', { qatType: cat.name })} className="p-2 hover:bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] rounded-lg transition-all">💰</button>
                                            <button onClick={() => navigate('add-category', { categoryId: cat.id })} className="p-2 hover:bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] rounded-lg transition-all">📝</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
      
      <button 
        onClick={() => navigate('add-category')} 
        className="fixed bottom-24 right-6 w-16 h-16 bg-[var(--color-accent-emerald)] text-[var(--color-text-inverse)] rounded-[1.5rem] shadow-2xl flex items-center justify-center text-4xl border-4 border-white dark:border-[var(--color-background-input)] active:scale-90 transition-all z-40"
      >＋</button>
    </PageLayout>
  );
});

export default CategoriesList;
