
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseButton } from './ui/atoms/BaseButton';

const AddSupplier: React.FC = () => {
  const { addSupplier, navigate, addNotification, theme, suppliers } = useApp();
  const [formData, setFormData] = useState({ name: '', phone: '', region: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectFromContacts = async () => {
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (contacts?.length > 0) {
          setFormData(prev => ({
            ...prev,
            name: contacts[0].name?.[0] || prev.name,
            phone: (contacts[0].tel?.[0] || '').replace(/[\s\-\(\)]/g, '')
          }));
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName) {
      return addNotification("تنبيه ⚠️", "يرجى إدخال اسم المورد", "warning");
    }
    if (trimmedPhone.length > 0 && trimmedPhone.length < 7) { // Phone is not strictly required, but if entered, must be valid length
      return addNotification("تنبيه ⚠️", "رقم الهاتف يجب أن يكون 7 أرقام على الأقل أو فارغاً", "warning");
    }

    setIsSubmitting(true);
    try {
      await addSupplier(formData);
      addNotification("تم بنجاح ✅", "تمت إضافة مورد جديد", "success");
      navigate('suppliers');
    } catch (err: any) {
      // The addSupplier in BusinessContext now handles logging and re-throws,
      // so this catches potential Supabase unique constraint errors or network issues.
      addNotification("خطأ ❌", err.message || "تعذر حفظ البيانات. حدث خطأ غير متوقع.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="إضافة مورد جديد" onBack={() => navigate('suppliers')}>
      <div className="space-y-6 page-enter max-w-md mx-auto px-2 pb-44 pt-10">
        <div className={`rounded-[3rem] p-8 lg:p-10 shadow-2xl border-2 relative ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[var(--color-accent-orange)] rounded-3xl shadow-2xl flex items-center justify-center text-4xl text-[var(--color-text-inverse)] border-8 border-[var(--color-background-page)]">🚛</div>

          <div className="space-y-6 pt-4">
            <BaseInput 
              label="اسم المورد / المزارع" icon="🏷️" placeholder="مثلاً: مزارع همدان..." 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <div className="relative">
              <BaseInput 
                label="رقم التواصل" icon="📱" placeholder="7xxxxxxx" type="tel"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                // phone is not strictly required, but if entered, client-side check ensures minimum length
              />
              <button 
                type="button" // Important for preventing form submission
                onClick={handleSelectFromContacts}
                className="absolute left-4 bottom-3 text-xs font-black text-[var(--color-accent-orange)] bg-[var(--color-accent-orange)]/10 px-2 py-1 rounded-lg"
              >هاتف 📞</button>
            </div>

            <BaseInput 
              label="المنطقة" icon="📍" placeholder="مثلاً: خولان، رداع..." 
              value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}
            />
          </div>
        </div>

        <BaseButton 
          variant="primary" size="xl" className="w-full bg-[var(--color-accent-orange)]" 
          onClick={handleSubmit} loading={isSubmitting}
        >
          حفظ المورد 💾
        </BaseButton>
      </div>
    </PageLayout>
  );
};

export default AddSupplier;
