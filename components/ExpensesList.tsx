
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Expense } from '../types';

const ExpensesList: React.FC = memo(() => {
  const { expenses, expenseTemplates, navigate, addExpense, theme, deleteExpense, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'templates'>('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [expenses, searchTerm]);

  const totalMonthlyExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => new Date(e.date).getMonth() === now.getMonth())
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const handleApplyTemplate = useCallback(async (template: any) => {
    try {
      await addExpense({
        title: template.title,
        category: template.category,
        amount: template.amount,
        currency: template.currency,
        date: new Date().toISOString()
      });
      addNotification("تم بنجاح ✅", `تم تسجيل المصروف: ${template.title}`, "success");
      setActiveTab('all');
    } catch (err: any) {
      addNotification("خطأ ⚠️", err.message || "تعذر تطبيق القالب. حدث خطأ غير متوقع.", "warning");
    }
  }, [addExpense, addNotification]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المصروف "${title}"؟`)) {
      try {
        await deleteExpense(id); // deleteExpense now handles notifications and logging
      } catch (err: any) {
        addNotification("خطأ ⚠️", err.message || "فشل حذف المصروف. حدث خطأ غير متوقع.", "warning");
      }
    }
  }, [deleteExpense, addNotification]);

  const fab = (
    <button 
      onClick={() => navigate('add-expense')} 
      aria-label="إضافة مصروف جديد"
      className="w-16 h-16 lg:w-20 lg:h-20 bg-[var(--color-accent-amber)] text-[var(--color-text-inverse)] rounded-[1.8rem] shadow-[0_15px_40px_rgba(245,158,11,0.4)] flex items-center justify-center text-4xl border-4 border-white dark:border-[var(--color-background-input)] active:scale-90 transition-all"
    >
      💸＋
    </button>
  );

  return (
    <PageLayout title="سجل المصروفات" onBack={() => navigate('dashboard')} floatingButton={fab}>
      <div className="space-y-6 pb-44 max-w-7xl mx-auto w-full px-2">
        
        <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-2 ${theme === 'dark' ? 'bg-[var(--color-accent-amber)]/10 border-[var(--color-accent-amber)]/20' : 'bg-[var(--color-status-warning-bg)] border-[var(--color-status-warning)]/20'}`}>
           <div className="flex justify-between items-center">
              <div>
                 <p className="text-[10px] font-black text-[var(--color-accent-amber)] uppercase tracking-widest mb-1">مصاريف الشهر الحالي</p>
                 <h2 className="text-3xl sm:text-4xl font-black tabular-nums tracking-tighter text-[var(--color-text-default)]">
                    {totalMonthlyExpenses.toLocaleString()} <small className="text-xs opacity-40 text-[var(--color-text-muted)]">YER</small>
                 </h2>
              </div>
              <button 
                onClick={() => setActiveTab('templates')}
                className="bg-[var(--color-accent-amber)] text-[var(--color-text-inverse)] px-4 py-3 rounded-2xl font-black text-[10px] shadow-lg flex items-center gap-2 active:scale-90 transition-all border-b-4 border-[var(--color-accent-amber)]/80"
              >
                <span>القوالب الذكية</span>
                <span className="text-base">🔁</span>
              </button>
           </div>
        </div>

        <div className="flex gap-2 p-1 bg-[var(--color-background-tertiary)] rounded-2xl shadow-inner border border-[var(--color-border-default)]" role="tablist">
           <button 
             onClick={() => setActiveTab('all')} 
             className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'all' ? 'bg-[var(--color-background-card)] dark:bg-[var(--color-background-input)] shadow-md text-[var(--color-accent-amber)]' : 'text-[var(--color-text-muted)]'}`}
           >📜 كافة القيود</button>
           <button 
             onClick={() => setActiveTab('templates')} 
             className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'templates' ? 'bg-[var(--color-background-card)] dark:bg-[var(--color-background-input)] shadow-md text-[var(--color-accent-amber)]' : 'text-[var(--color-text-muted)]'}`}
           >🔁 المصروفات المتكررة</button>
        </div>

        {activeTab === 'all' ? (
          <div className="space-y-4">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="ابحث في المصروفات..."
                  className="w-full bg-[var(--color-background-card)] border-2 border-[var(--color-border-default)] rounded-2xl p-4 pr-12 font-bold text-sm shadow-lg outline-none focus:border-[var(--color-accent-amber)] transition-all"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-xl text-[var(--color-text-muted)]">🔍</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExpenses.map((e) => (
                  <div key={e.id} className={`p-6 rounded-[2rem] border-2 transition-all hover:shadow-2xl ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)] shadow-xl'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[var(--color-status-warning-bg)] dark:bg-[var(--color-accent-amber)]/30 text-[var(--color-status-warning)] rounded-xl flex items-center justify-center text-2xl shadow-inner">💸</div>
                          <div>
                             <h4 className="font-black text-lg text-[var(--color-text-default)] leading-tight">{e.title}</h4>
                             <span className="text-[8px] font-black uppercase text-[var(--color-accent-amber)] bg-[var(--color-status-warning-bg)] px-2 py-0.5 rounded border border-[var(--color-accent-amber)]/20 mt-1 inline-block">{e.category}</span>
                          </div>
                       </div>
                       <div className="text-left">
                          <p className="text-xl font-black tabular-nums text-[var(--color-status-danger)]">{e.amount.toLocaleString()}</p>
                          <small className="text-[8px] font-black opacity-30 text-[var(--color-text-muted)]">YER</small>
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-default)]/50">
                       <span className="text-[10px] font-bold text-[var(--color-text-muted)]">📅 {new Date(e.date).toLocaleDateString('ar-YE')}</span>
                       <div className="flex gap-2">
                          <button onClick={() => navigate('add-expense', { expenseId: e.id })} className="w-8 h-8 bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] rounded-xl flex items-center justify-center shadow-sm">✏️</button>
                          {e.image_url && <button onClick={() => window.open(e.image_url, '_blank')} className="w-8 h-8 bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] rounded-xl flex items-center justify-center shadow-sm">🖼️</button>}
                          <button onClick={() => handleDelete(e.id, e.title)} className="w-8 h-8 bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-xl flex items-center justify-center shadow-sm">🗑️</button>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in zoom-in-95">
             {expenseTemplates.map(template => (
               <div key={template.id} className="p-6 rounded-[2.5rem] border-2 bg-gradient-to-br from-[var(--color-status-warning-bg)] to-[var(--color-background-card)] dark:from-[var(--color-background-card)] dark:to-[var(--color-background-input)] border-[var(--color-accent-amber)]/50 shadow-xl flex flex-col items-center text-center group transition-all hover:scale-105">
                  <div className="w-14 h-14 bg-[var(--color-accent-amber)] text-[var(--color-text-inverse)] rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-4 group-hover:rotate-12 transition-transform">🔁</div>
                  <h4 className="font-black text-sm text-[var(--color-text-default)] mb-1">{template.title}</h4>
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] mb-4">{template.frequency}</p>
                  <p className="text-xl font-black text-[var(--color-accent-amber)] mb-6 tabular-nums">{template.amount.toLocaleString()}</p>
                  <button onClick={() => handleApplyTemplate(template)} className="w-full bg-[var(--color-accent-amber)] text-[var(--color-text-inverse)] py-3 rounded-xl font-black text-[10px] shadow-lg active:scale-95 transition-all">تسجيل الآن ✅</button>
               </div>
             ))}
             {expenseTemplates.length === 0 && (
               <div className="col-span-full py-20 text-center opacity-20 text-[var(--color-text-muted)]">
                  <p className="font-black text-lg">لم يتم حفظ أي قوالب للمصروفات بعد</p>
               </div>
             )}
          </div>
        )}
      </div>
    </PageLayout>
  );
});

export default ExpensesList;
