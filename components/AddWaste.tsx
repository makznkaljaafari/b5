
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseSelect } from './ui/atoms/BaseSelect';
import { BaseButton } from './ui/atoms/BaseButton';

const AddWaste: React.FC = () => {
  const { addWaste, navigate, categories, addNotification, theme } = useApp();
  const [formData, setFormData] = useState({
    qat_type: categories[0]?.name || '',
    quantity: '' as number | '',
    estimated_loss: '' as number | '',
    reason: 'يباس / تلف طبيعي'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.qat_type) return addNotification("تنبيه ⚠️", "يرجى اختيار الصنف التالف", "warning");
    const quantityNum = Number(formData.quantity) || 0;
    if (quantityNum <= 0) return addNotification("تنبيه ⚠️", "الكمية التالفة يجب أن تكون أكبر من صفر", "warning");

    setIsSubmitting(true);
    try {
      await addWaste({
        ...formData,
        quantity: quantityNum,
        estimated_loss: Number(formData.estimated_loss) || 0,
        date: new Date().toISOString()
      });
      addNotification("تم التسجيل 🥀", "تم خصم التالف من المخزون بنجاح.", "success");
      navigate('waste');
    } catch (err: any) {
      addNotification("خطأ ❌", err.message || "فشل تسجيل التالف", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const qatOptions = useMemo(() => 
    categories.map((c: any) => ({ value: c.name, label: c.name }))
  , [categories]);

  return (
    <PageLayout title="تسجيل تالف جديد" onBack={() => navigate('waste')}>
      <form onSubmit={handleSubmit} className="space-y-6 page-enter max-w-md mx-auto px-2 pb-44">
        <div className={`p-8 rounded-[3rem] shadow-2xl border-2 space-y-6 relative ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-rose-600 rounded-3xl shadow-2xl flex items-center justify-center text-4xl text-white border-8 border-[var(--color-background-primary)]">🥀</div>

          <div className="pt-6 space-y-6">
            <BaseSelect 
              label="الصنف المتأثر" icon="🌿" 
              options={qatOptions}
              value={formData.qat_type}
              onChange={e => setFormData({ ...formData, qat_type: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الكمية التالفة</p>
                  <input 
                     type="number" step="0.1"
                     className="w-full bg-transparent text-center font-black text-5xl outline-none text-rose-500 tabular-nums"
                     value={formData.quantity}
                     placeholder="0"
                     onChange={e => setFormData({...formData, quantity: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                  />
               </div>
               <div className="text-center space-y-2 border-r border-[var(--color-border-primary)]/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الخسارة المالية</p>
                  <input 
                     type="number" 
                     className="w-full bg-transparent text-center font-black text-5xl outline-none text-slate-400 tabular-nums"
                     value={formData.estimated_loss}
                     placeholder="0"
                     onChange={e => setFormData({...formData, estimated_loss: e.target.value === '' ? '' : parseFloat(e.target.value)})}
                  />
               </div>
            </div>

            <BaseInput 
              label="سبب التلف" icon="📝" as="textarea" rows={3}
              placeholder="اكتب تفاصيل سبب التلف (حرارة، نقل، تأخير...)"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              required
            />
          </div>
        </div>

        <BaseButton 
          variant="danger" size="xl" className="w-full shadow-2xl"
          onClick={handleSubmit} loading={isSubmitting}
        >
          خصم من المخزون وتسجيل الخسارة 🥀
        </BaseButton>
      </form>
    </PageLayout>
  );
};

export default AddWaste;
