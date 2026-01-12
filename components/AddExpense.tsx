
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import ImageUploadInput from './ui/ImageUploadInput';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseSelect } from './ui/atoms/BaseSelect';
import { BaseButton } from './ui/atoms/BaseButton';
import { CurrencySwitcher } from './ui/molecules/CurrencySwitcher';

const AddExpense: React.FC = () => {
  const { navigate, theme, navigationParams, user, addExpense, addExpenseTemplate, addNotification, expenseCategories, expenses } = useApp();
  
  const editingExpense = useMemo(() => 
    navigationParams?.expenseId ? expenses.find((e: any) => e.id === navigationParams.expenseId) : null
  , [expenses, navigationParams?.expenseId]);

  const [formData, setFormData] = useState({
    id: editingExpense?.id,
    title: editingExpense?.title || '',
    category: editingExpense?.category || (expenseCategories && expenseCategories[0]) || 'نثرية',
    amount: editingExpense?.amount || '' as number | '',
    currency: editingExpense?.currency || ('YER' as 'YER' | 'SAR' | 'OMR'),
    notes: editingExpense?.notes || '',
    image_url: editingExpense?.image_url,
    image_base64_data: undefined as string | undefined,
    image_mime_type: undefined as string | undefined,
    image_file_name: undefined as string | undefined,
  });
  
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return addNotification("تنبيه ⚠️", "يرجى إدخال بيان المصروف", "warning");
    
    const amountNum = Number(formData.amount) || 0;
    if (amountNum <= 0) return addNotification("تنبيه ⚠️", "المبلغ يجب أن يكون أكبر من صفر", "warning");

    setIsSubmitting(true);
    try {
      const expenseData = {
        ...formData,
        amount: amountNum,
        date: editingExpense?.date || new Date().toISOString(),
      };
      await addExpense(expenseData);

      if (saveAsTemplate) {
        await addExpenseTemplate({
          title: formData.title,
          category: formData.category,
          amount: amountNum,
          currency: formData.currency,
          frequency: 'شهرياً'
        });
      }
      addNotification("تم الحفظ ✅", "تم تسجيل المصروف بنجاح.", "success");
      navigate('expenses');
    } catch (err: any) {
      addNotification("خطأ ❌", err.message || "فشل حفظ المصروف. حدث خطأ غير متوقع.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = useMemo(() => 
    expenseCategories.map((cat: string) => ({ value: cat, label: cat }))
  , [expenseCategories]);

  return (
    <PageLayout title={editingExpense ? "تعديل مصروف" : "قيد مصروفات"} onBack={() => navigate('expenses')}>
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-lg mx-auto px-2 pb-44">
        <div className={`p-8 rounded-[3rem] shadow-2xl border-2 space-y-6 relative ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[var(--color-accent-rose)] rounded-3xl shadow-2xl flex items-center justify-center text-4xl text-[var(--color-text-inverse)] border-8 border-[var(--color-background-page)]">💸</div>

          <div className="pt-6 space-y-4">
            <BaseInput 
              label="بيان المصروف" icon="🏷️" 
              placeholder="مثلاً: إيجار المحل، فاتورة كهرباء..."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseSelect 
                label="الفئة" icon="📂" 
                options={categoryOptions}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest px-2">العملة</label>
                <CurrencySwitcher value={formData.currency} onChange={v => setFormData({...formData, currency: v})} activeColor="bg-[var(--color-accent-rose)]" />
              </div>
            </div>

            <div className="text-center py-6 border-y border-dashed border-[var(--color-border-default)]">
                <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-2">مبلغ المصروف</p>
                <input 
                  type="number" 
                  className="w-full bg-transparent text-center font-black text-6xl outline-none text-[var(--color-accent-rose)] tabular-nums"
                  value={formData.amount}
                  placeholder="0"
                  onChange={e => setFormData({ ...formData, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  required
                />
            </div>

            <BaseInput 
              label="ملاحظات إضافية" icon="📝" as="textarea" rows={2}
              placeholder="أي تفاصيل أخرى..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />

            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all ${saveAsTemplate ? 'bg-[var(--color-accent-amber)]/10 border-[var(--color-accent-amber)]/30' : 'bg-[var(--color-background-tertiary)] dark:bg-[var(--color-background-card)]/5 border-transparent'}`}>
               <div className="flex items-center gap-3">
                  <span className="text-xl text-[var(--color-text-default)]">🔁</span>
                  <div>
                    <p className="font-black text-xs text-[var(--color-text-default)]">حفظ كقالب متكرر</p>
                    <p className="text-[9px] text-[var(--color-text-muted)] font-bold">لتسهيل تسجيله مستقبلاً بضغطة زر</p>
                  </div>
               </div>
               <button 
                 type="button"
                 onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                 className={`w-12 h-6 rounded-full relative transition-all ${saveAsTemplate ? 'bg-[var(--color-accent-amber)]' : 'bg-[var(--color-border-strong)] dark:bg-[var(--color-border-strong)]'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${saveAsTemplate ? 'right-7' : 'right-1'}`}></div>
               </button>
            </div>
          </div>
        </div>

        {user?.id && (
          <ImageUploadInput
            userId={user.id} recordType="expenses" recordId={editingExpense?.id || 'new'}
            currentImageUrl={formData.image_url} 
            onImageUploadSuccess={info => {
              if (typeof info === 'string') setFormData(p => ({...p, image_url: info}));
              else setFormData(p => ({...p, image_base64_data: info.base64, image_mime_type: info.mimeType, image_file_name: info.fileName}));
            }}
            onImageDelete={() => setFormData(p => ({ ...p, image_url: undefined, image_base64_data: undefined }))}
            currentImageBase64={formData.image_base64_data}
            currentImageMimeType={formData.image_mime_type}
            label="صورة الفاتورة / الإيصال المرفق"
          />
        )}

        <BaseButton 
          variant="danger" size="xl" className="w-full shadow-[0_15px_40px_rgba(244,63,94,0.4)]"
          onClick={handleSubmit} loading={isSubmitting}
        >
          {editingExpense ? 'تعديل المصروف' : 'تأكيد صرف المبلغ ✅'}
        </BaseButton>
      </form>
    </PageLayout>
  );
};

export default AddExpense;
