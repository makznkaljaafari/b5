
import React from 'react';

export const FinanceTab = ({ localRates, setLocalRates, setHasChanges }: any) => {
  return (
    <div className="p-4 space-y-6">
      <div className="p-6 rounded-[2.2rem] bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-500/20 shadow-inner group">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">🇸🇦 الريال السعودي / يمني</p>
          <span className="text-xl">💱</span>
        </div>
        <input 
          type="number" 
          className="w-full bg-transparent font-black text-5xl outline-none text-emerald-700 dark:text-emerald-400 tabular-nums transition-all focus:scale-105 origin-right" 
          value={localRates.SAR_TO_YER} 
          onChange={(e) => { setLocalRates({...localRates, SAR_TO_YER: parseFloat(e.target.value)}); setHasChanges(true); }} 
        />
      </div>

      <div className="p-6 rounded-[2.2rem] bg-sky-50 dark:bg-sky-900/10 border-2 border-sky-500/20 shadow-inner group">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">🇴🇲 الريال العماني / يمني</p>
          <span className="text-xl">💱</span>
        </div>
        <input 
          type="number" 
          className="w-full bg-transparent font-black text-5xl outline-none text-sky-700 dark:text-sky-400 tabular-nums transition-all focus:scale-105 origin-right" 
          value={localRates.OMR_TO_YER} 
          onChange={(e) => { setLocalRates({...localRates, OMR_TO_YER: parseFloat(e.target.value)}); setHasChanges(true); }} 
        />
      </div>

      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-bold text-slate-400 text-center italic">
        ملاحظة: يتم استخدام هذه الأسعار لتحويل المبالغ في كشوفات الحسابات والتقارير المجمعة.
      </div>
    </div>
  );
};
