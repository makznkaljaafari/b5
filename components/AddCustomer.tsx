
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseButton } from './ui/atoms/BaseButton';

const AddCustomer: React.FC = () => {
  const { customers, addCustomer, navigate, navigationParams, addNotification, theme } = useApp();
  
  const editingCustomer = navigationParams?.customerId ? customers.find(c => c.id === navigationParams.customerId) : null;

  const [formData, setFormData] = useState({ 
    id: editingCustomer?.id,
    name: editingCustomer?.name || '', 
    phone: editingCustomer?.phone || '', 
    address: editingCustomer?.address || '' 
  });
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
    if (!formData.name.trim()) {
      return addNotification("تنبيه ⚠️", "يرجى إدخال اسم العميل", "warning");
    }
    if (formData.phone.trim() && formData.phone.trim().length < 7) {
      return addNotification("تنبيه ⚠️", "رقم الهاتف يجب أن يكون 7 أرقام على الأقل", "warning");
    }

    setIsSubmitting(true);
    try {
      await addCustomer(formData);
      addNotification("تم بنجاح ✅", editingCustomer ? "تم تحديث بيانات العميل" : "تمت إضافة عميل جديد", "success");
      navigate('customers');
    } catch (err: any) {
      // The addCustomer in BusinessContext now handles logging and re-throws,
      // so this catches potential Supabase unique constraint errors or network issues.
      addNotification("خطأ ❌", err.message || "تعذر حفظ البيانات. حدث خطأ غير متوقع.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title={editingCustomer ? "تعديل بيانات عميل" : "إضافة عميل جديد"} onBack={() => navigate('customers')}>
      <div className="space-y-6 page-enter max-w-md mx-auto px-2 pb-44 pt-10">
        <div className={`rounded-[3rem] p-8 lg:p-10 shadow-2xl border-2 relative ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[var(--color-accent-sky)] rounded-3xl shadow-2xl flex items-center justify-center text-4xl text-[var(--color-text-inverse)] border-8 border-[var(--color-background-page)]">👤</div>

          <div className="space-y-6 pt-4">
            <BaseInput 
              label="الاسم الكامل" icon="🏷️" placeholder="اسم العميل الرباعي..." 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <div className="relative">
              <BaseInput 
                label="رقم الجوال" icon="📱" placeholder="7xxxxxxx" type="tel"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <button 
                onClick={handleSelectFromContacts}
                className="absolute left-4 bottom-3 text-xs font-black text-[var(--color-accent-sky)] bg-[var(--color-accent-sky)]/10 px-2 py-1 rounded-lg"
              >هاتف 📞</button>
            </div>

            <BaseInput 
              label="العنوان" icon="📍" placeholder="المنطقة أو الحي..." 
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        <BaseButton 
          variant="primary" size="xl" className="w-full bg-[var(--color-accent-sky)]" 
          onClick={handleSubmit} loading={isSubmitting}
        >
          {editingCustomer ? 'حفظ التعديلات ✨' : 'حفظ العميل سحابياً 💾'}
        </BaseButton>
      </div>
    </PageLayout>
  );
};

export default AddCustomer;
