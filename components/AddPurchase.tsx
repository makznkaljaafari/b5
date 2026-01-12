
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatPurchaseInvoice } from '../services/shareService';
import ImageUploadInput from './ui/ImageUploadInput';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseSelect } from './ui/atoms/BaseSelect';
import { OperationTotalBar } from './ui/molecules/OperationTotalBar';
import { CurrencySwitcher } from './ui/molecules/CurrencySwitcher';

const AddPurchase: React.FC = () => {
  const { purchases, addPurchase, navigate, suppliers, categories, user, addNotification, navigationParams, resolvedTheme, formatValue } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editingPurchase = useMemo(() => 
    navigationParams?.purchaseId ? purchases.find(p => p.id === navigationParams.purchaseId) : null
  , [purchases, navigationParams?.purchaseId]);

  const [formData, setFormData] = useState({
    supplier_id: editingPurchase?.supplier_id || navigationParams?.supplierId || '',
    qat_type: editingPurchase?.qat_type || '',
    quantity: editingPurchase?.quantity || '' as number | '',
    unit_price: editingPurchase?.unit_price || '' as number | '',
    status: editingPurchase?.status || 'نقدي' as 'نقدي' | 'آجل',
    currency: editingPurchase?.currency || 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: editingPurchase?.notes || '',
    image_url: editingPurchase?.image_url,
    image_base64_data: undefined as string | undefined,
    image_mime_type: undefined as string | undefined,
    image_file_name: undefined as string | undefined,
  });

  useEffect(() => {
    if (!formData.qat_type && categories.length > 0) {
      setFormData(prev => ({ ...prev, qat_type: categories[0].name }));
    }
  }, [categories, formData.qat_type]);

  const totalAmount = useMemo(() => 
    formatValue((Number(formData.quantity) || 0) * (Number(formData.unit_price) || 0))
  , [formData.quantity, formData.unit_price, formatValue]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const supplier = suppliers.find(s => s.id === formData.supplier_id);
    if (!supplier) return addNotification("تنبيه ⚠️", "يرجى اختيار المورد أولاً", "warning");

    setIsSubmitting(true);
    try {
      const purchaseData = { ...formData, id: editingPurchase?.id, supplier_name: supplier.name, total: totalAmount, date: editingPurchase?.date || new Date().toISOString() };
      const addedPurchase = await addPurchase(purchaseData);
      const autoShare = user?.accounting_settings?.auto_share_whatsapp ?? true;
      if (autoShare) shareToWhatsApp(formatPurchaseInvoice(addedPurchase || (purchaseData as any), user?.agency_name || 'الوكالة'), supplier.phone);
      navigate('purchases');
    } catch (err: any) {
      addNotification("خطأ ❌", err.message || "تعذر حفظ المشتريات.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title={editingPurchase ? "تعديل شراء" : "فاتورة مشتريات"} onBack={() => navigate('purchases')}>
      <div className="space-y-6 page-enter pb-44 max-w-2xl mx-auto w-full px-2">
        <div className={`p-6 sm:p-8 rounded-[2.5rem] border-2 shadow-2xl space-y-6 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseSelect label="المورد / المزارع" icon="🚛" options={[{ value: '', label: '-- اختر المورد --' }, ...suppliers.map(s => ({ value: s.id, label: s.name }))]} value={formData.supplier_id} onChange={e => setFormData({ ...formData, supplier_id: e.target.value })} required />
            <BaseSelect label="نوع القات" icon="🌿" options={categories.map(cat => ({ value: cat.name, label: cat.name }))} value={formData.qat_type} onChange={e => setFormData({ ...formData, qat_type: e.target.value })} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">العملة</label>
                <CurrencySwitcher value={formData.currency} onChange={v => setFormData({...formData, currency: v})} activeColor="bg-orange-600" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">نوع القيد</label>
                <div className="bg-slate-50 dark:bg-white/5 p-1 rounded-2xl flex gap-1 border border-slate-100 dark:border-white/5 shadow-inner w-full">
                  {['نقدي', 'آجل'].map(s => (
                    <button key={s} type="button" onClick={() => setFormData({...formData, status: s as any})} className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${formData.status === s ? (s === 'آجل' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white shadow-md') : 'text-slate-400'}`}>{s}</button>
                  ))}
                </div>
             </div>
          </div>

          <BaseInput label="ملاحظات الشراء" icon="📝" placeholder="مثلاً: بضاعة درجة أولى..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
             <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الكمية (بالكيس)</p>
                <input type="number" step="0.1" className="w-full bg-transparent text-center font-black text-5xl outline-none tabular-nums" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value === '' ? '' : parseFloat(e.target.value)})} />
             </div>
             <div className="text-center space-y-2 border-r border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تكلفة الكيس</p>
                <input type="number" className="w-full bg-transparent text-center font-black text-5xl outline-none text-orange-500 tabular-nums" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value === '' ? '' : parseFloat(e.target.value)})} />
             </div>
          </div>
        </div>

        {user?.id && (
          <ImageUploadInput
            userId={user.id} recordType="purchases" recordId={editingPurchase?.id || 'new'}
            currentImageUrl={formData.image_url} onImageUploadSuccess={info => {
              if (typeof info === 'string') setFormData(p => ({...p, image_url: info}));
              else setFormData(p => ({...p, image_base64_data: info.base64, image_mime_type: info.mimeType, image_file_name: info.fileName}));
            }}
            onImageDelete={() => setFormData(p => ({ ...p, image_url: undefined, image_base64_data: undefined }))}
            currentImageBase64={formData.image_base64_data}
            currentImageMimeType={formData.image_mime_type}
          />
        )}

        <OperationTotalBar 
          total={totalAmount} 
          currency={formData.currency} 
          label="إجمالي تكلفة المشتريات" 
          buttonText={editingPurchase ? 'تحديث الشراء' : 'حفظ الشراء 📦'} 
          onConfirm={handleSubmit} 
          isLoading={isSubmitting} 
          variant={formData.status === 'آجل' ? 'danger' : 'primary'}
          theme={resolvedTheme}
        />
      </div>
    </PageLayout>
  );
};

export default AddPurchase;
