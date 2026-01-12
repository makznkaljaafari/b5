
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseButton } from './ui/atoms/BaseButton';
import { CurrencySwitcher } from './ui/molecules/CurrencySwitcher';

const AddCategory: React.FC = () => {
  const { categories, addCategory, navigate, addNotification, theme, navigationParams } = useApp();
  
  const editingCategory = useMemo(() => 
    navigationParams?.categoryId ? categories.find((c: any) => c.id === navigationParams.categoryId) : null
  , [categories, navigationParams?.categoryId]);

  const [formData, setFormData] = useState({
    id: editingCategory?.id,
    name: editingCategory?.name || '',
    stock: editingCategory?.stock || '' as number | '',
    price: editingCategory?.price || '' as number | '',
    currency: editingCategory?.currency || ('YER' as 'YER' | 'SAR' | 'OMR'),
    low_stock_threshold: editingCategory?.low_stock_threshold || 5
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) return addNotification("تنبيه ⚠️", "يرجى إدخال اسم الصنف", "warning");

    const isDuplicate = !editingCategory && categories.some((cat: any) => cat.name.trim() === trimmedName);
    if (isDuplicate) return addNotification("الصنف موجود مسبقاً ⚠️", `صنف "${trimmedName}" مسجل بالفعل.`, "warning");

    setIsSubmitting(true);
    try {
      await addCategory({ 
        ...formData, 
        name: trimmedName,
        stock: Number(formData.stock) || 0,
        price: Number(formData.price) || 0,
      });
      addNotification("تم الحفظ بنجاح ✅", `تم تحديث صنف ${trimmedName} في المخزون.`, "success");
      navigate('categories');
    } catch (err: any) {
      addNotification("خطأ ❌", err.message || "فشل في حفظ الصنف", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title={editingCategory ? "تعديل صنف" : "صنف جديد"} onBack={() => navigate('categories')}>
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto px-2 pb-44">
        <div className={`p-8 rounded-[3rem] shadow-2xl border-2 space-y-6 relative ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[var(--color-accent-emerald)] rounded-3xl shadow-2xl flex items-center justify-center text-4xl text-[var(--color-text-inverse)] border-8 border-[var(--color-background-page)]">🌿</div>

          <div className="pt-6 space-y-4">
            <BaseInput 
              label="اسم صنف القات" icon="🌿" 
              placeholder="مثلاً: رداعي، شرعبي، بلدي..."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest px-2">عملة التقييم والبيع</label>
               <CurrencySwitcher value={formData.currency} onChange={v => setFormData({...formData, currency: v})} activeColor="bg-[var(--color-accent-emerald)]" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-default)]/50">
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">المخزون الحالي</p>
                  <input 
                     type="number" step="0.1"
                     className="w-full bg-transparent text-center font-black text-5xl outline-none text-[var(--color-text-default)] tabular-nums"
                     value={formData.stock}
                     placeholder="0"
                     onChange={e => setFormData({...formData, stock: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                  />
               </div>
               <div className="text-center space-y-2 border-r border-[var(--color-border-default)]/50">
                  <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">سعر الحبة</p>
                  <input 
                     type="number" 
                     className="w-full bg-transparent text-center font-black text-5xl outline-none text-[var(--color-accent-emerald)] tabular-nums"
                     value={formData.price}
                     placeholder="0"
                     onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                  />
               </div>
            </div>

            <BaseInput 
              label="تنبيه انخفاض المخزون (عند وصول الكمية إلى)" icon="🚨" type="number"
              value={formData.low_stock_threshold}
              onChange={e => setFormData({...formData, low_stock_threshold: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>

        <BaseButton 
          variant="success" size="xl" className="w-full shadow-2xl"
          onClick={handleSubmit} loading={isSubmitting}
        >
          {editingCategory ? 'حفظ التعديلات ✨' : 'إضافة الصنف للمخازن 💾'}
        </BaseButton>
      </form>
    </PageLayout>
  );
};

export default AddCategory;
