
import React, { useMemo, useState, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatBudgetSummary, formatOverdueReminder } from '../services/shareService';
import { financeService } from '../services/financeService';
import { DebtBalanceCard } from './debts/DebtBalanceCard';

type TabType = 'all' | 'customer_debts' | 'supplier_debts' | 'critical';

const DebtsReport: React.FC = memo(() => {
  const { customers, suppliers, sales, purchases, vouchers, expenses, navigate, theme, addNotification } = useApp();
  const [activeCurrency, setActiveCurrency] = useState<'YER' | 'SAR' | 'OMR'>('YER');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const budgetSummary = useMemo(() => financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers, expenses), [customers, suppliers, sales, purchases, vouchers, expenses]);
  const currentSummary = useMemo(() => budgetSummary.find(s => s.currency === activeCurrency) || { net: 0, assets: 0, liabilities: 0 }, [budgetSummary, activeCurrency]);

  const filteredBalances = useMemo(() => {
    let list: any[] = [];
    const nonGeneralCustomers = customers.filter(c => c.name !== "الزبون العام نقدي");

    nonGeneralCustomers.forEach(c => {
      const bal = financeService.getCustomerBalances(c.id, sales, vouchers).find(b => b.currency === activeCurrency);
      if (bal && bal.amount !== 0) list.push({ id: c.id, name: c.name, type: 'عميل', amount: bal.amount, days: bal.daysSinceLastOp, status: bal.status, phone: c.phone });
    });
    
    suppliers.forEach(s => {
      const bal = financeService.getSupplierBalances(s.id, purchases, vouchers).find(b => b.currency === activeCurrency);
      if (bal && bal.amount !== 0) list.push({ id: s.id, name: s.name, type: 'مورد', amount: bal.amount, days: bal.daysSinceLastOp, status: bal.status, phone: s.phone });
    });

    const filtered = list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeTab === 'customer_debts') return filtered.filter(b => b.type === 'عميل' && b.amount > 0);
    if (activeTab === 'supplier_debts') return filtered.filter(b => b.type === 'مورد' && b.amount > 0);
    if (activeTab === 'critical') return filtered.filter(b => b.status.level === 'critical' && b.amount !== 0);
    return filtered;
  }, [customers, suppliers, sales, purchases, vouchers, activeCurrency, activeTab, searchTerm]);

  const handleShareSummary = useCallback(() => {
    shareToWhatsApp(formatBudgetSummary(budgetSummary));
  }, [budgetSummary]);

  const handleShareOverdue = useCallback((item: any) => {
    if (!item.phone) {
      addNotification("تنبيه ⚠️", "لا يوجد رقم هاتف مسجل لهذا الحساب.", "warning");
      return;
    }
    shareToWhatsApp(formatOverdueReminder(item.name, Math.abs(item.amount), activeCurrency, item.days), item.phone);
  }, [addNotification, activeCurrency]);

  const addOpeningBalanceFab = (
    <button
      onClick={() => navigate('add-opening-balance')}
      className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-600 text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center text-4xl border-4 border-white dark:border-slate-800 active:scale-90 transition-all"
      aria-label="إضافة رصيد افتتاحي"
    >
      ⚖️＋
    </button>
  );

  return (
    <PageLayout
      title="الميزانية والديون"
      onBack={() => navigate('dashboard')}
      floatingButton={addOpeningBalanceFab}
      headerExtra={
        <button
          onClick={handleShareSummary}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg active:scale-90 transition-all"
          aria-label="مشاركة ملخص الميزانية"
        >💬</button>
      }
    >
      <div className="space-y-6 pb-44 w-full max-w-7xl mx-auto px-2">
        <div className={`p-6 rounded-[2.5rem] shadow-xl border-2 mb-6 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">صافي الرصيد العام</p>
              <h2 className={`text-4xl sm:text-5xl font-black tabular-nums tracking-tighter ${currentSummary.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {currentSummary.net.toLocaleString()} <small className="text-sm opacity-50 text-slate-400">{activeCurrency}</small>
              </h2>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {(['YER', 'SAR', 'OMR'] as const).map(cur => (
                <button
                  key={cur}
                  onClick={() => setActiveCurrency(cur)}
                  className={`px-4 py-2 rounded-lg font-black text-[10px] transition-all ${activeCurrency === cur ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                >{cur}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">لنا عند العملاء</p>
              <p className="text-lg font-black text-sky-500 tabular-nums">{currentSummary.assets.toLocaleString()}</p>
            </div>
            <div className="text-center border-r border-slate-100 dark:border-white/5">
              <p className="text-[9px] font-black text-slate-400 uppercase">علينا للموردين</p>
              <p className="text-lg font-black text-rose-500 tabular-nums">{currentSummary.liabilities.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder="ابحث عن اسم الحساب..."
            className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] focus:border-indigo-500 rounded-2xl p-4 pr-12 font-bold text-sm shadow-lg transition-all outline-none"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {(['all', 'customer_debts', 'supplier_debts', 'critical'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-black text-xs transition-all border-2 whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white border-transparent' : 'bg-[var(--color-background-card)] text-[var(--color-text-muted)] border-[var(--color-border-default)]'}`}
            >
              {tab === 'all' ? 'الكل' : tab === 'customer_debts' ? 'عملاء' : tab === 'supplier_debts' ? 'موردين' : 'حسابات حرجة ⚠️'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBalances.length > 0 ? (
            filteredBalances.map(item => (
              <DebtBalanceCard
                key={item.id}
                item={item}
                theme={theme}
                onNavigate={navigate}
                onShare={handleShareOverdue}
                currency={activeCurrency}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-40 opacity-20">
              <span className="text-8xl">📊</span>
              <p className="font-black text-xl mt-4 text-[var(--color-text-muted)]">لا توجد أرصدة مطابقة.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
});

export default DebtsReport;
