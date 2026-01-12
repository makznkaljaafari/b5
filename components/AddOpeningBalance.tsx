
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseSelect } from './ui/atoms/BaseSelect';
import { BaseButton } from './ui/atoms/BaseButton';
import { CurrencySwitcher } from './ui/molecules/CurrencySwitcher';

const AddOpeningBalance: React.FC = () => {
  const { addOpeningBalance, navigate, customers, suppliers, theme, addNotification } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    person_type: 'عميل' as 'عميل' | 'مورد',
    person_id: '',
    person_name: '',
    amount: '' as number | '',
    currency: 'YER' as 'YER' | 'SAR' | 'OMR',
    balance_type: 'مدين' as 'مدين' | 'دائن', // مدين (لنا), دائن (له)
    notes: 'رصيد افتتاحي سابق',
    date: new Date().toISOString()
  });

  useEffect(() => {
    const list = formData.person_type === 'عميل' ? customers : suppliers;
    const person = list.find(p => p.id === formData.person_id);
    if (person) setFormData(prev => ({ ...prev, person_name: person.name }));
  }, [formData.person_id, formData.person_type, customers, suppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.person_id || !formData.amount) {
      return addNotification("تنبيه ⚠️", "يرجى اختيار الحساب وإدخال المبلغ", "warning");
    }

    setIsSubmitting(true);
    try {
      await addOpeningBalance({ ...formData, amount: Number(formData.amount) });
      addNotification("تم ترحيل الرصيد ✅", "تم تحديث مديونية الحساب بنجاح.", "success");
      navigate('debts');
    } catch (err: any) {
      addNotification('خطأ ❌', err.message || 'فشل في حفظ الرصيد.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const personOptions = useMemo(() => [
    { value: '', label: `-- اختر ال${formData.person_type} --` },
    ...(formData.person_type === 'عميل' ? customers : suppliers).map(p => ({ value: p.id, label: p.name }))
  ], [formData.person_type, customers, suppliers]);

  return (
    <PageLayout title="ترحيل أرصدة سابقة" onBack={() => navigate('debts')}>
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-lg mx-auto px-2 pb-44 pt-4">
        <div className={`p-8 rounded-[3rem] shadow-2xl border-2 space-y-6 relative ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center text-4xl text-white border-8 border-[var(--color-background-page)]">⚖️</div>

          <div className="pt-6 space-y-4">
            <div className="bg-[var(--color-background-tertiary)] p-1 rounded-2xl flex gap-1 border border-[var(--color-border-default)] shadow-inner w-full">
                {['عميل', 'مورد'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setFormData({...formData, person_type: t as any, person_id: ''})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${
                      formData.person_type === t ? 'bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)]' : 'text-[var(--color-text-muted)] opacity-50'
                    }`}
                  >{t === 'عميل' ? 'حساب عميل' : 'حساب مورد'}</button>
                ))}
            </div>

            <BaseSelect 
              label="الحساب المستهدف" icon="👤" 
              options={personOptions}
              value={formData.person_id}
              onChange={e => setFormData({ ...formData, person_id: e.target.value })}
              required
            />

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">العملة</label>
               <CurrencySwitcher value={formData.currency} onChange={v => setFormData({...formData, currency: v})} />
            </div>

            <div className="bg-[var(--color-background-tertiary)] p-1 rounded-2xl flex gap-1 border border-[var(--color-border-default)] shadow-inner w-full">
                {['مدين', 'دائن'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setFormData({...formData, balance_type: t as any})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${
                      formData.balance_type === t ? (t === 'مدين' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white') : 'text-slate-400 opacity-50'
                    }`}
                  >{t === 'مدين' ? 'لنا عنده (مدين)' : 'له عندنا (دائن)'}</button>
                ))}
            </div>

            <div className="text-center py-6 border-y border-dashed border-[var(--color-border-default)]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">مبلغ الرصيد المرحل</p>
                <input 
                   type="number" 
                   className={`w-full bg-transparent text-center font-black text-6xl outline-none tabular-nums ${formData.balance_type === 'مدين' ? 'text-rose-500' : 'text-emerald-500'}`}
                   value={formData.amount}
                   placeholder="0"
                   onChange={e => setFormData({ ...formData, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                   required
                />
            </div>

            <BaseInput 
              label="البيان التوثيقي" icon="📝" 
              placeholder="مثلاً: رصيد مرحل من الدفتر القديم..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        <BaseButton 
            variant="primary" 
            size="xl" className="w-full bg-indigo-600 shadow-xl"
            onClick={handleSubmit} loading={isSubmitting}
        >
            تأكيد ترحيل الرصيد 💾
        </BaseButton>
        <p className="text-center text-[10px] font-bold text-slate-400 opacity-60">سيظهر هذا الرصيد كبداية للعمليات في كشف حساب الطرف.</p>
      </form>
    </PageLayout>
  );
};

export default AddOpeningBalance;
