
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatVoucherReceipt } from '../services/shareService';

const VoucherDetails: React.FC = () => {
  const { vouchers, navigationParams, navigate, deleteVoucher, addNotification, theme } = useApp();
  const voucherId = navigationParams?.voucherId;

  const voucher = useMemo(() => {
    return vouchers.find(v => v.id === voucherId);
  }, [vouchers, voucherId]);

  if (!voucher) {
    return (
      <PageLayout title="خطأ" onBack={() => navigate('vouchers')}>
        <div className="flex flex-col items-center justify-center py-40 text-[var(--color-accent-rose)]">
          <span className="text-6xl mb-6">⚠️</span>
          <h2 className="text-xl font-black">السند غير موجود</h2>
          <button onClick={() => navigate('vouchers')} className="mt-8 bg-[var(--color-background-tertiary)] px-8 py-3 rounded-xl font-black text-[var(--color-text-secondary)]">العودة للقائمة</button>
        </div>
      </PageLayout>
    );
  }

  const handleShare = () => {
    const text = formatVoucherReceipt(voucher);
    shareToWhatsApp(text);
  };

  const handleDelete = async () => {
    if (window.confirm(`⚠️ حذف سند ${voucher.person_name}؟\nسيتم تعديل رصيد الطرف الآخر آلياً.`)) {
      try {
        await deleteVoucher(voucher.id); // deleteVoucher now handles notifications and logging
        navigate('vouchers');
      } catch (err: any) {
        addNotification("خطأ ⚠️", err.message || "فشل الحذف. حدث خطأ غير متوقع.", "warning");
      }
    }
  };

  return (
    <PageLayout title="تفاصيل السند" onBack={() => navigate('vouchers')}>
      <div className="flex flex-col items-center pt-2 space-y-4 page-enter pb-44 max-w-lg mx-auto px-2">
        
        <div className={`w-full rounded-[3rem] overflow-hidden shadow-2xl border-2 ${
          theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'
        }`}>
          <div className={`p-8 lg:p-12 text-center relative ${
            voucher.type === 'قبض' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            <div className="absolute top-4 right-6 text-white/20 font-black text-2xl lg:text-5xl select-none">#{voucher.id.slice(0, 4)}</div>
            <div className={`w-20 h-20 bg-white/20 backdrop-blur-lg rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-4 border border-white/30 shadow-2xl animate-float`}>
               {voucher.type === 'قبض' ? '📥' : '📤'}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase">سند {voucher.type} مالي</h2>
            <p className="text-[10px] font-black opacity-60 mt-2 uppercase tracking-[0.3em]">Verified Transaction</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center gap-1 pb-6 border-b border-dashed border-[var(--color-border-primary)]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الطرف المستلم / المسلم</p>
                <h3 className="text-2xl font-black text-[var(--color-text-primary)] text-center leading-tight">{voucher.person_name}</h3>
                <span className={`text-[9px] mt-2 px-4 py-1.5 rounded-full font-black ${theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{voucher.person_type}</span>
            </div>

            <div className="flex flex-col items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">القيمة الإجمالية</p>
                <h2 className={`text-5xl font-black tabular-nums tracking-tighter ${
                    voucher.type === 'قبض' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                    {voucher.amount.toLocaleString()} <small className="text-xl font-black opacity-30">{voucher.currency}</small>
                </h2>
            </div>

            <div className={`p-6 rounded-3xl border-2 shadow-inner transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
               <p className="text-[9px] font-black text-indigo-500 uppercase mb-2 text-center tracking-widest">البيان الموثق</p>
               <p className="text-base lg:text-xl font-bold leading-relaxed text-center italic opacity-80">
                 "{voucher.notes || 'تم توثيق السند مالياً كجزء من تسوية الحسابات.'}"
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center py-4 border-y border-dashed border-[var(--color-border-primary)]">
              <div>
                 <p className="text-[9px] font-black opacity-40 uppercase mb-1">التاريخ</p>
                 <p className="text-sm font-black tabular-nums">{new Date(voucher.date).toLocaleDateString('ar-YE')}</p>
              </div>
              <div className="border-r border-[var(--color-border-primary)]">
                 <p className="text-[9px] font-black opacity-40 uppercase mb-1">الوقت</p>
                 <p className="text-sm font-black tabular-nums">{new Date(voucher.date).toLocaleTimeString('ar-YE', {hour:'2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
            
            <div className="pt-4 space-y-3 no-print">
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleShare} className="bg-[#25D366] text-white p-5 rounded-2xl font-black text-sm active:scale-95 shadow-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                    <span>واتساب</span><span>💬</span>
                  </button>
                  <button onClick={() => navigate('add-voucher', { voucherId: voucher.id })} className="bg-amber-500 text-white p-5 rounded-2xl font-black text-sm active:scale-95 shadow-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                    <span>تعديل</span><span>✏️</span>
                  </button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => window.print()} className="bg-slate-800 text-white p-5 rounded-2xl font-black text-sm active:scale-95 shadow-lg">طباعة 📄</button>
                  <button onClick={handleDelete} className="bg-rose-50 text-rose-600 border-2 border-rose-100 p-5 rounded-2xl font-black text-sm active:scale-95 hover:bg-rose-600 hover:text-white transition-all">حذف 🗑️</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VoucherDetails;
