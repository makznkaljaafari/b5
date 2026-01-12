
import React from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { formatSaleInvoice, shareToWhatsApp } from '../services/shareService';

const VisualInvoice: React.FC = () => {
  const { navigationParams, navigate, user, theme } = useApp();
  const sale = navigationParams?.sale;

  if (!sale) { navigate('sales'); return null; }

  return (
    <PageLayout title="إيصال المبيعات" onBack={() => navigate('sales')}>
      <div className="flex flex-col items-center pt-6 space-y-8 page-enter no-scrollbar">
        
        <div className="receipt-paper w-full max-w-[85mm] p-8 lg:p-10 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-sm">
           {/* الزخرفة العلوية */}
           <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500"></div>
           
           <div className="text-center border-b-2 border-black/10 pb-6 mb-6">
              <h2 className="text-2xl font-black text-black mb-1">{user?.agency_name || 'وكالة الشويع للقات'}</h2>
              <p className="text-[10px] font-bold text-black/40 tracking-[0.2em] uppercase">Smart Accounting Receipt</p>
              <div className="flex justify-center items-center gap-4 mt-4 text-[10px] font-black text-black bg-slate-50 py-2 rounded-lg border border-black/5">
                 <span className="flex items-center gap-1">📅 {new Date(sale.date).toLocaleDateString('ar-YE')}</span>
                 <span className="w-1 h-1 rounded-full bg-black/20"></span>
                 <span className="flex items-center gap-1">🕒 {new Date(sale.date).toLocaleTimeString('ar-YE', {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
           </div>

           <div className="space-y-6 text-black">
              <div className="flex justify-between items-end font-black border-b border-dashed border-black/10 pb-4">
                 <div>
                    <p className="text-[8px] opacity-40 uppercase mb-0.5">العميل المحترم</p>
                    <span className="text-base">{sale.customer_name}</span>
                 </div>
                 <div className="text-left">
                    <p className="text-[8px] opacity-40 uppercase mb-0.5">رقم القيد</p>
                    <span className="text-sm tabular-nums">#{sale.id.slice(-6).toUpperCase()}</span>
                 </div>
              </div>

              <div className="py-2">
                 <table className="w-full text-right text-xs">
                    <thead>
                       <tr className="font-black text-[10px] opacity-50 uppercase border-b border-black/10">
                          <th className="pb-3 text-right">الصنف</th>
                          <th className="pb-3 text-center">كمية</th>
                          <th className="pb-3 text-left">الإجمالي</th>
                       </tr>
                    </thead>
                    <tbody className="font-black">
                       <tr>
                          <td className="py-4 text-sm">🌿 {sale.qat_type}</td>
                          <td className="py-4 text-center text-sm tabular-nums">{sale.quantity}</td>
                          <td className="py-4 text-left text-sm tabular-nums">{sale.total.toLocaleString()}</td>
                       </tr>
                    </tbody>
                 </table>
              </div>

              {sale.notes && (
                <div className="bg-slate-50 p-4 rounded-xl border border-black/5">
                   <p className="text-[8px] font-black opacity-30 uppercase mb-1">البيان / ملاحظات</p>
                   <p className="text-xs font-bold italic opacity-70 leading-relaxed">{sale.notes}</p>
                </div>
              )}

              <div className="pt-2 space-y-3">
                 <div className="flex justify-between items-center font-black text-2xl border-t-2 border-black pt-4">
                    <span className="text-sm">المبلغ الإجمالي:</span>
                    <span className="tabular-nums">{sale.total.toLocaleString()} <small className="text-xs font-bold opacity-60 mr-1">{sale.currency}</small></span>
                 </div>
                 <div className="flex justify-between text-[9px] font-black opacity-40 uppercase tracking-widest bg-slate-100 p-2 rounded-md">
                    <span>Transaction Type:</span>
                    <span className={sale.status === 'نقدي' ? 'text-emerald-700' : 'text-rose-700'}>{sale.status}</span>
                 </div>
              </div>
           </div>

           <div className="mt-12 text-center space-y-4 border-t border-dashed border-black/10 pt-8">
              <div className="flex flex-col items-center gap-3 opacity-80 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                 <div className="w-24 h-24 bg-black p-1.5 rounded-xl">
                    <div className="w-full h-full bg-white grid grid-cols-6 grid-rows-6 gap-0.5 p-1">
                       {Array.from({length:36}).map((_,i) => <div key={i} className={`${Math.random() > 0.45 ? 'bg-black' : 'bg-white'}`}></div>)}
                    </div>
                 </div>
                 <p className="text-[7px] font-black opacity-40 leading-none">SCAN FOR AUTHENTICITY</p>
              </div>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/30 mt-4">
                 Al-Shwaia Smart System V3.1
              </p>
           </div>
           
           {/* تأثير القص الورقي */}
           <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_0,transparent_4px,white_4px,white_100%)] bg-[length:12px_12px] rotate-180"></div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm no-print px-4">
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => shareToWhatsApp(formatSaleInvoice(sale, user?.agency_name || 'وكالة الشويع'))} 
                className="bg-[#25D366] text-white p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>واتساب</span><span>💬</span>
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-slate-900 text-white p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>طباعة</span><span>📄</span>
              </button>
           </div>
           <button 
              onClick={() => navigate('add-sale', { saleId: sale.id })} 
              className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
           >
              <span>تعديل بيانات الفاتورة</span><span>✏️</span>
           </button>
        </div>

        <button 
          onClick={() => navigate('dashboard')} 
          className="text-slate-400 font-black text-xs uppercase tracking-widest pb-10 no-print hover:text-indigo-500 transition-colors"
        >العودة للرئيسية →</button>
      </div>
    </PageLayout>
  );
};

export default VisualInvoice;
