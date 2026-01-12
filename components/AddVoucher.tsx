
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatVoucherReceipt } from '../services/shareService';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseSelect } from './ui/atoms/BaseSelect';
import { BaseButton } from './ui/atoms/BaseButton';
import { CurrencySwitcher } from './ui/molecules/CurrencySwitcher';

const AddVoucher: React.FC = () => {
  const { addVoucher, navigate, navigationParams, customers, suppliers, vouchers, theme, user, addNotification } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editingVoucher = useMemo(() => 
    navigationParams?.voucherId ? vouchers.find(v => v.id === navigationParams.voucherId) : null
  , [vouchers, navigationParams?.voucherId]);

  const [formData, setFormData] = useState({
    id: editingVoucher?.id,
    type: editingVoucher?.type || (navigationParams?.type || 'قبض') as 'قبض' | 'دفع',
    person_id: editingVoucher?.person_id || navigationParams?.personId || '',
    person_name: editingVoucher?.person_name || '',
    person_type: editingVoucher?.person_type || (navigationParams?.personType || 'عميل') as 'عميل' | 'مورد',
    amount: editingVoucher?.amount || (navigationParams?.amount || '') as number | '',
    currency: editingVoucher?.currency || (navigationParams?.currency || 'YER') as 'YER' | 'SAR' | 'OMR',
    notes: editingVoucher?.notes || '',
    date: editingVoucher?.date || new Date().toISOString()
  });

  useEffect(() => {
    const list = formData.person_type === 'عميل' ? customers : suppliers;
    const person = list.find(p => p.id === formData.person_id);
    if (person) setFormData(prev => ({ ...prev, person_name: person.name }));
  }, [formData.person_id, formData.person_type, customers, suppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.person_id || !formData.amount) return addNotification("تنبيه ⚠️", "يرجى تعبئة كافة الحقول", "warning");

    setIsSubmitting(true);
    try {
      await addVoucher({ ...formData, amount: Number(formData.amount) });
      const autoShare = user?.accounting_settings?.auto_share_whatsapp ?? true;
      if (autoShare) shareToWhatsApp(formatVoucherReceipt(formData as any));
      navigate('vouchers');
    } catch (err: any) {
      addNotification('خطأ ❌', err.message || 'تعذر حفظ السند. حدث خطأ غير متوقع.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const personOptions = useMemo(() => [
    { value: '', label: `-- اختر ال${formData.person_type} --` },
    ...(formData.person_type === 'عميل' ? customers : suppliers).map(p => ({ value: p.id, label: p.name }))
  ], [formData.person_type, customers, suppliers]);

  return (
    <PageLayout title={editingVoucher ? "تعديل سند" : `سند ${formData.type}`} onBack={() => navigate('vouchers')}>
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-lg mx-auto px-2 pb-44">
        
        <div className={`p-8 rounded-[3rem] shadow-2xl border-2 space-y-6 relative ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-3xl shadow-2xl flex items-center justify-center text-4xl text-[var(--color-text-inverse)] border-8 border-[var(--color-background-page)] ${
            formData.type === 'قبض' ? 'bg-[var(--color-status-success)]' : 'bg-[var(--color-status-danger)]'
          }`}>
            {formData.type === 'قبض' ? '📥' : '📤'}
          </div>

          <div className="pt-6 space-y-4">
            <div className="bg-[var(--color-background-tertiary)] p-1 rounded-2xl flex gap-1 border border-[var(--color-border-default)] shadow-inner w-full">
                {['عميل', 'مورد'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setFormData({...formData, person_type: t as any, person_id: ''})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${
                      formData.person_type === t ? 'bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  >{t === 'عميل' ? 'حساب عميل' : 'حساب مورد'}</button>
                ))}
            </div>

            <BaseSelect 
              label="الطرف المستهدف" icon="👤" 
              options={personOptions}
              value={formData.person_id}
              onChange={e => setFormData({ ...formData, person_id: e.target.value })}
              required
            />

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest px-2">العملة</label>
               <CurrencySwitcher value={formData.currency} onChange={v => setFormData({...formData, currency: v})} />
            </div>

            <div className="bg-[var(--color-background-tertiary)] p-1 rounded-2xl flex gap-1 border border-[var(--color-border-default)] shadow-inner w-full">
                {['مدين', 'دائن'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setFormData({...formData, balance_type: t as any})}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${
                      formData.balance_type === t ? (t === 'مدين' ? 'bg-[var(--color-status-success)] text-[var(--color-text-inverse)]' : 'bg-[var(--color-status-danger)] text-[var(--color-text-inverse)]') : 'text-[var(--color-text-muted)]'
                    }`}
                  >{t === 'مدين' ? 'مدين (لنا عنده)' : 'دائن (له عندنا)'}</button>
                ))}
            </div>

            <div className="text-center py-6 border-t border-[var(--color-border-default)]/50">
                <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-2">مبلغ الرصيد المرحل</p>
                <input 
                   type="number" 
                   className={`w-full bg-transparent text-center font-black text-6xl outline-none tabular-nums ${formData.balance_type === 'مدين' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-status-danger)]'}`}
                   value={formData.amount}
                   placeholder="0"
                   onChange={e => setFormData({ ...formData, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                   required
                />
            </div>

            <BaseInput 
              label="البيان" icon="📝" as="textarea" rows={3}
              placeholder="اكتب تفاصيل السند..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        <BaseButton 
            variant={formData.type === 'قبض' ? 'success' : 'danger'} 
            size="xl" className="w-full"
            onClick={handleSubmit} loading={isSubmitting}
        >
            {editingVoucher ? 'حفظ التعديلات' : `تأكيد سند ال${formData.type} ✅`}
        </BaseButton>
      </form>
    </PageLayout>
  );
};

export default AddVoucher;
