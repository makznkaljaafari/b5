

import React from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const VisualPurchaseInvoice: React.FC = () => {
  const { navigationParams, navigate, user, theme } = useApp();
  const purchase = navigationParams?.purchase;

  if (!purchase) { navigate('purchases'); return null; }

  return (
    <PageLayout title="إيصال المشتريات" onBack={() => navigate('purchases')}>
      <div className="flex flex-col items-center pt-6 space-y-8 page-enter">
        
        <div className={`w-full max-w-[80mm] bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] p-6 shadow-2xl rounded-sm relative receipt-paper border-t-4 border-[var(--color-accent-orange)]`}>
           <div className="text-center border-b-2 border-[var(--color-border-primary)] pb-4 mb-4">
              <h2 className="text-xl font-black">{user?.agency_name || 'وكالة الشويع'}</h2>
              <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">إشعار شراء مخزني</p>
              <p className="text-[8px] mt-1">{new Date(purchase.date).toLocaleString('ar-YE')}</p>
           </div>

           <div className="space-y-3 text-sm">
              <div className="flex justify-between font-black border-b border-[var(--color-border-primary)] pb-2">
                 <span>المورد:</span>
                 <span>{purchase.supplier_name}</span>
              </div>

              <table className="w-full text-right text-xs">
                 <thead>
                    <tr className="border-b-2 border-[var(--color-text-primary)]">
                       <th className="py-2">الصنف المورد</th>
                       <th className="py-2 text-center">كمية</th>
                       <th className="py-2 text-left">التكلفة</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[var(--color-border-primary)]">
                    <tr className="font-bold">
                       <td className="py-3">{purchase.qat_type}</td>
                       <td className="py-3 text-center">{purchase.quantity}</td>
                       <td className="py-3 text-left">{purchase.unit_price.toLocaleString()}</td>
                    </tr>
                 </tbody>
              </table>

              <div className="border-t-2 border-[var(--color-text-primary)] pt-4 mt-4 space-y-2">
                 <div className="flex justify-between font-black text-lg">
                    <span>القيمة الإجمالية:</span>
                    <span>{purchase.total.toLocaleString()} {purchase.currency}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold">
                    <span>حالة القيد:</span>
                    <span className="text-orange-600">{purchase.status}</span>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-4 border-t border-dashed border-[var(--color-text-primary)] text-center">
              <p className="text-[8px] font-black leading-tight uppercase opacity-50">
                 تم تحديث المخزون آلياً<br/>شكراً لتعاملكم
              </p>
           </div>
           
           <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_0,transparent_4px,var(--color-background-secondary)_4px,var(--color-background-secondary)_100%)] bg-[length:12px_12px] rotate-180"></div>
        </div>

        <div className="flex gap-4 w-full max-w-sm no-print">
           <button 
             onClick={() => window.print()} 
             className="flex-1 bg-[var(--color-accent-orange)] text-white p-5 rounded-3xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-orange-700"
           >
              <span>طباعة المستند</span>
              <span className="text-xl">📄</span>
           </button>
        </div>

        <button 
          onClick={() => navigate('dashboard')} 
          className="text-[var(--color-text-secondary)] font-bold text-sm underline pb-10"
        >العودة للرئيسية</button>
      </div>
    </PageLayout>
  );
};

export default VisualPurchaseInvoice;
