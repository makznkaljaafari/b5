
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatSaleInvoice } from '../services/shareService';
import ImageUploadInput from './ui/ImageUploadInput';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseSelect } from './ui/atoms/BaseSelect';
import { OperationTotalBar } from './ui/molecules/OperationTotalBar';
import { CurrencySwitcher } from './ui/molecules/CurrencySwitcher';

const AddSale: React.FC = () => {
  const { customers, categories, sales, addSale, navigate, navigationParams, addNotification, user, resolvedTheme, formatValue } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editingSale = useMemo(() => 
    navigationParams?.saleId ? sales.find(s => s.id === navigationParams.saleId) : null
  , [sales, navigationParams?.saleId]);

  const [formData, setFormData] = useState({
    customer_id: editingSale?.customer_id || navigationParams?.customerId || '',
    qat_type: editingSale?.qat_type || navigationParams?.qatType || '',
    quantity: editingSale?.quantity || '' as number | '',
    unit_price: editingSale?.unit_price || '' as number | '',
    status: editingSale?.status || 'نقدي' as 'نقدي' | 'آجل',
    currency: editingSale?.currency || 'YER' as 'YER' | 'SAR' | 'OMR',
    notes: editingSale?.notes || '',
    image_url: editingSale?.image_url,
    image_base64_data: undefined as string | undefined,
    image_mime_type: undefined as string | undefined,
    image_file_name: undefined as string | undefined,
  });

  const [autoShare] = useState(user?.accounting_settings?.auto_share_whatsapp ?? true);

  useEffect(() => {
    if (!formData.customer_id && !editingSale) {
      const generalCustomer = customers.find(c => c.name === "الزبون العام نقدي");
      if (generalCustomer) setFormData(prev => ({ ...prev, customer_id: generalCustomer.id }));
    }
    if (!formData.qat_type && categories.length > 0) {
      setFormData(prev => ({ ...prev, qat_type: categories[0].name }));
    }
  }, [customers, categories, editingSale]);

  const totalAmount = useMemo(() => 
    formatValue((Number(formData.quantity) || 0) * (Number(formData.unit_price) || 0))
  , [formData.quantity, formData.unit_price, formatValue]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const customer = customers.find(c => c.id === formData.customer_id);
    if (!customer) return addNotification("تنبيه ⚠️", "يرجى اختيار العميل أولاً", "warning");

    const quantityNum = formatValue(formData.quantity);
    const unitPriceNum = formatValue(formData.unit_price);
    if (quantityNum <= 0 || unitPriceNum <= 0) return addNotification("خطأ ❌", "يرجى إدخال كمية وسعر صحيحين", "warning");

    setIsSubmitting(true);
    try {
      const saleData = { ...formData, id: editingSale?.id, customer_name: customer.name, quantity: quantityNum, unit_price: unitPriceNum, total: totalAmount, date: editingSale?.date || new Date().toISOString() };
      const addedSale = await addSale(saleData);
      if (autoShare) shareToWhatsApp(formatSaleInvoice(addedSale || (saleData as any), user?.agency_name || 'وكالة الشويع'), customer.phone);
      navigate('sales');
    } catch (err: any) {
      addNotification("خطأ ❌", err.message || "تعذر حفظ البيانات.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerOptions = useMemo(() => 
    [{ value: '', label: '-- اختر العميل --' }, ...customers.map(c => ({ value: c.id, label: c.name }))]
  , [customers]);

  const qatOptions = useMemo(() => categories.map(cat => ({ value: cat.name, label: cat.name })), [categories]);

  return (
    <PageLayout title={editingSale ? "تعديل فاتورة" : "فاتورة بيع"} onBack={() => navigate('sales')}>
      <div className="space-y-6 page-enter pb-44 max-w-2xl mx-auto w-full px-2">
        <div className={`p-6 sm:p-8 rounded-[2.5rem] border-2 shadow-2xl space-y-6 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseSelect label="العميل" icon="👤" options={customerOptions} value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} required />
            <BaseSelect label="نوع القات" icon="🌿" options={qatOptions} value={formData.qat_type} onChange={e => setFormData({ ...formData, qat_type: e.target.value })} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">عملة الفاتورة</label>
                <CurrencySwitcher value={formData.currency} onChange={v => setFormData({...formData, currency: v})} />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">نوع القيد</label>
                <div className="bg-slate-50 dark:bg-white/5 p-1 rounded-2xl flex gap-1 border border-slate-100 dark:border-white/5 shadow-inner w-full">
                  {['نقدي', 'آجل'].map(s => (
                    <button key={s} type="button" onClick={() => setFormData({...formData, status: s as any})} className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${formData.status === s ? (s === 'آجل' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white shadow-md') : 'text-slate-400'}`}>{s}</button>
                  ))}
                </div>
             </div>
          </div>

          <BaseInput label="البيان / ملاحظات" icon="📝" placeholder="اكتب بيان الفاتورة..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
             <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الكمية (بالحبة)</p>
                <input type="number" step="0.1" className="w-full bg-transparent text-center font-black text-5xl outline-none tabular-nums" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value === '' ? '' : parseFloat(e.target.value)})} />
             </div>
             <div className="text-center space-y-2 border-r border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السعر للحبة</p>
                <input type="number" className="w-full bg-transparent text-center font-black text-5xl outline-none text-sky-500 tabular-nums" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value === '' ? '' : parseFloat(e.target.value)})} />
             </div>
          </div>
        </div>

        {user?.id && (
          <ImageUploadInput
            userId={user.id} recordType="sales" recordId={editingSale?.id || 'new'}
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
          label="إجمالي مبلغ الفاتورة" 
          buttonText={editingSale ? 'تحديث الفاتورة' : 'حفظ الفاتورة ✅'} 
          onConfirm={handleSubmit} 
          isLoading={isSubmitting} 
          variant={formData.status === 'آجل' ? 'danger' : 'success'}
          theme={resolvedTheme}
        />
      </div>
    </PageLayout>
  );
};

export default AddSale;
