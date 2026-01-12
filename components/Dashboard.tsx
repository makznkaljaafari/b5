
import React, { useMemo, useState, memo, useCallback } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PageLayout } from './ui/Layout';
import { financeService } from '../services/financeService';
import { InstallPWAButton } from './ui/InstallPWAButton';
import { StatCard } from './ui/atoms/StatCard';
import { FinancialChart } from './ui/molecules/FinancialChart';
import { QuickActionsGrid } from './dashboard/QuickActionsGrid';

const Dashboard: React.FC = memo(() => {
  const { navigate, theme, isSyncing, isOnline } = useUI();
  const { user } = useAuth();
  const { 
    sales, purchases, vouchers, customers, suppliers, expenses, 
    loadAllData 
  } = useData();
  
  const [activeCurrency, setActiveCurrency] = useState<'YER' | 'SAR' | 'OMR'>('YER');

  const currentSummary = useMemo(() => {
    const budgetSummary = financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers, expenses);
    return budgetSummary.find(s => s.currency === activeCurrency) || { cash: 0, assets: 0, liabilities: 0, net: 0 };
  }, [customers, suppliers, sales, purchases, vouchers, expenses, activeCurrency]);

  const weeklyTrend = useMemo(() => {
    return financeService.getWeeklyTrendData(sales, expenses, activeCurrency);
  }, [sales, expenses, activeCurrency]);

  const totalExpensesValue = useMemo(() => {
    return expenses.filter(e => e.currency === activeCurrency).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, activeCurrency]);

  const handleRefreshData = useCallback(() => {
    if (user?.id) loadAllData(user.id, false);
  }, [user?.id, loadAllData]);

  return (
    <PageLayout 
      title={user?.agency_name || 'وكالة الشويع'}
      headerExtra={
        <button 
          onClick={handleRefreshData} 
          className={`w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg active:scale-90 transition-all ${isSyncing ? 'animate-spin' : ''}`}
        >🔄</button>
      }
    >
      <InstallPWAButton />
      <div className="space-y-6 pb-44 w-full max-w-7xl mx-auto px-1 sm:px-2">
        
        <div className="space-y-4">
          <div className={`p-3 rounded-2xl flex items-center justify-between border ${theme === 'dark' ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">{isOnline ? 'متصل سحابياً' : 'وضع محلي'}</p>
             </div>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                 {(['YER', 'SAR', 'OMR'] as const).map(cur => (
                   <button 
                     key={cur} 
                     onClick={() => setActiveCurrency(cur)} 
                     className={`px-3 py-1.5 rounded-lg font-black text-[10px] transition-all ${activeCurrency === cur ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                   >{cur}</button>
                 ))}
              </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
             <StatCard title="النقد المتوفر" value={currentSummary.cash} currency={activeCurrency} colorClass="text-emerald-500" icon="💰" onClick={() => navigate('reports')} />
             <StatCard title="ديون لنا" value={currentSummary.assets} currency={activeCurrency} colorClass="text-sky-500" icon="📈" onClick={() => navigate('debts')} />
             <StatCard title="ديون علينا" value={currentSummary.liabilities} currency={activeCurrency} colorClass="text-red-500" icon="📉" onClick={() => navigate('debts')} />
             <StatCard title="المصاريف" value={totalExpensesValue} currency={activeCurrency} colorClass="text-rose-500" icon="💸" onClick={() => navigate('expenses')} />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3 px-1">
             <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">الخدمات الأساسية</h3>
             <button onClick={() => navigate('ai-advisor')} className="text-[10px] font-black text-indigo-500">المحاسبة بالذكاء 🤖</button>
          </div>
          <QuickActionsGrid navigate={navigate} theme={theme} />
        </div>

        <div className={`p-4 lg:p-6 rounded-[2rem] border shadow-sm relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
           <div className="flex justify-between items-start mb-2">
              <div>
                 <h3 className="font-black text-xs lg:text-sm">اتجاه السيولة الأسبوعي</h3>
                 <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-0.5">آخر 7 أيام ({activeCurrency})</p>
              </div>
              <div className="flex gap-2 text-[8px] font-black opacity-50 uppercase">
                 <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>مبيعات</div>
                 <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>مصاريف</div>
              </div>
           </div>
           <div className="h-40 lg:h-56">
              <FinancialChart data={weeklyTrend} theme={theme} />
           </div>
        </div>
      </div>
    </PageLayout>
  );
});

export default Dashboard;
