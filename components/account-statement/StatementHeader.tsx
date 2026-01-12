
import React, { memo } from 'react';

interface StatementHeaderProps {
  person: any;
  personType: 'عميل' | 'مورد';
  currentBalance: number;
  selectedCurrency: string;
  theme: 'light' | 'dark';
  onChangePerson: () => void;
}

export const StatementHeader: React.FC<StatementHeaderProps> = memo(({ 
  person, personType, currentBalance, selectedCurrency, theme, onChangePerson 
}) => {
  const isDark = theme === 'dark';
  const isNegative = currentBalance > 0; // حسب منطق النظام: مدين يعني لنا عنده (إيجابي في الرصيد الداخلي لكن أحمر كديون)

  return (
    <div className={`p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-2 mb-6 ${
      isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'
    }`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl ${
            personType === 'عميل' ? 'bg-indigo-500 text-white' : 'bg-orange-500 text-white'
          }`}>
            {personType === 'عميل' ? '👤' : '🚛'}
          </div>
          <div className="text-right">
            <h3 className="font-black text-3xl leading-tight">{person.name}</h3>
            <p className="text-sm font-bold text-slate-400 mt-1 tabular-nums">📱 {person.phone || 'رقم هاتف غير مضاف'}</p>
            <button 
              onClick={onChangePerson} 
              className="mt-2 text-[9px] px-3 py-1 rounded-full font-black bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all"
            >
              تغيير الحساب 🔄
            </button>
          </div>
        </div>

        <div className={`flex items-center gap-8 px-8 py-6 rounded-[2.5rem] border shadow-inner ${
          isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-100'
        }`}>
           <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 mb-1">الرصيد الجاري</p>
              <h2 className={`text-4xl font-black tabular-nums tracking-tighter ${
                isNegative ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {Math.abs(currentBalance).toLocaleString()}
              </h2>
              <small className="text-[9px] font-black opacity-30 uppercase">{selectedCurrency}</small>
           </div>
           <div className="w-px h-12 bg-slate-400/20"></div>
           <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 mb-1">حالة القيد</p>
              <p className={`text-sm font-black ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>
                 {currentBalance !== 0 ? (personType === 'عميل' ? (isNegative ? 'مدين (لنا)' : 'له مبالغ') : (isNegative ? 'علينا له' : 'سددنا له')) : 'مصفى'}
              </p>
              <span className="text-lg">{currentBalance !== 0 ? '⚖️' : '✅'}</span>
           </div>
        </div>
      </div>
    </div>
  );
});
