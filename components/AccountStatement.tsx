
import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatCustomerStatement, formatSupplierStatement } from '../services/shareService';
import { financeService } from '../services/financeService';
import { AccountPicker } from './account-statement/AccountPicker';
import { StatementTable } from './account-statement/StatementTable';
import { StatementHeader } from './account-statement/StatementHeader';
import { useAccountStatement } from '../hooks/useAccountStatement';

const AccountStatement: React.FC = () => {
  const { navigationParams, navigate, sales, purchases, vouchers, customers, suppliers, resolvedTheme } = useApp();
  
  const [selectedPerson, setSelectedPerson] = useState<{id: string, type: 'عميل' | 'مورد'} | null>(
    navigationParams?.personId ? { id: navigationParams.personId, type: navigationParams.personType } : null
  );
  
  const [selectedCurrency, setSelectedCurrency] = useState<'YER' | 'SAR' | 'OMR'>('YER');
  const [showPicker, setShowPicker] = useState(!selectedPerson);

  const person = useMemo(() => {
    if (!selectedPerson) return null;
    return (selectedPerson.type === 'عميل' ? customers : suppliers).find((p: any) => p.id === selectedPerson.id);
  }, [selectedPerson, customers, suppliers]);

  const statementData = useAccountStatement({
    personId: selectedPerson?.id || '',
    personType: selectedPerson?.type || 'عميل',
    sales, purchases, vouchers, currency: selectedCurrency
  });

  const currentBalance = useMemo(() => {
    if (!person || !selectedPerson) return 0;
    const balances = selectedPerson.type === 'عميل' 
      ? financeService.getCustomerBalances(selectedPerson.id, sales, vouchers)
      : financeService.getSupplierBalances(selectedPerson.id, purchases, vouchers);
    return balances.find(b => b.currency === selectedCurrency)?.amount || 0;
  }, [person, selectedPerson, sales, purchases, vouchers, selectedCurrency]);

  const handleShare = () => {
    if (!person) return;
    const balances = [{ currency: selectedCurrency, amount: currentBalance }];
    const text = selectedPerson?.type === 'عميل' 
      ? formatCustomerStatement(person, sales, vouchers, balances)
      : formatSupplierStatement(person, purchases, vouchers, balances);
    shareToWhatsApp(text, person.phone);
  };

  if (showPicker || !person) {
    return (
      <PageLayout title="اختيار الحساب" onBack={() => selectedPerson ? setShowPicker(false) : navigate('dashboard')}>
        <AccountPicker customers={customers} suppliers={suppliers} theme={resolvedTheme} onSelect={(id, type) => { setSelectedPerson({id, type}); setShowPicker(false); }} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`كشف حساب: ${person.name}`} onBack={() => navigate('debts')}>
      <div className="space-y-6 page-enter pb-44 max-w-6xl mx-auto w-full px-2">
        
        <StatementHeader 
          person={person} 
          personType={selectedPerson.type} 
          currentBalance={currentBalance} 
          selectedCurrency={selectedCurrency} 
          theme={resolvedTheme} 
          onChangePerson={() => setShowPicker(true)} 
        />

        <div className={`p-8 rounded-[3rem] shadow-xl border-2 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl gap-1 w-fit mx-auto mb-8 border border-white/5">
            {(['YER', 'SAR', 'OMR'] as const).map(cur => (
              <button key={cur} onClick={() => setSelectedCurrency(cur)} className={`px-8 py-2.5 rounded-xl font-black text-xs transition-all ${selectedCurrency === cur ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 opacity-60 hover:opacity-100'}`}>{cur}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={handleShare} className="bg-emerald-500 text-white p-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">إرسال كشف الحساب للواتساب 💬</button>
            <button onClick={() => navigate('add-voucher', { type: selectedPerson?.type === 'عميل' ? 'قبض' : 'دفع', personId: person.id, personType: selectedPerson?.type, currency: selectedCurrency })} className={`p-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-white ${selectedPerson?.type === 'عميل' ? 'bg-indigo-600' : 'bg-orange-600'}`}>
              {selectedPerson?.type === 'عميل' ? 'سند قبض' : 'سند سداد'} 📥
            </button>
          </div>
        </div>

        <StatementTable data={statementData} theme={resolvedTheme} currentBalance={currentBalance} />
      </div>
    </PageLayout>
  );
};

export default AccountStatement;
