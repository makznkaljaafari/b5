
import React from 'react';

interface StatementTableProps {
  data: any[];
  theme: string;
  currentBalance: number;
}

export const StatementTable: React.FC<StatementTableProps> = ({ data, theme, currentBalance }) => {
  const totals = data.reduce((acc, t) => ({
    debit: acc.debit + t.debit,
    credit: acc.credit + t.credit
  }), { debit: 0, credit: 0 });

  return (
    <div className={`overflow-hidden rounded-[3rem] shadow-2xl border-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-500/[0.03]">
         <h4 className="font-black text-xs uppercase tracking-widest opacity-60 italic">Journal Ledger</h4>
         <button onClick={() => window.print()} className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-white/5 active:scale-90 transition-all">📄</button>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-right border-collapse min-w-[750px]">
          <thead>
            <tr className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${theme === 'dark' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500'}`}>
              <th className="p-5 text-center w-16">#</th>
              <th className="p-5 border-l border-white/5">التاريخ</th>
              <th className="p-5 border-l border-white/5">نوع العملية والبيان</th>
              <th className="p-5 text-center border-l border-white/5 w-32">مدين (+)</th>
              <th className="p-5 text-center border-l border-white/5 w-32">دائن (-)</th>
              <th className="p-5 text-center border-l border-white/5 w-40">الرصيد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length > 0 ? data.map((t, idx) => (
              <tr key={t.id + idx} className="text-xs hover:bg-sky-500/[0.03] transition-colors group">
                <td className="p-5 text-center font-black tabular-nums opacity-30 group-hover:opacity-100">{idx + 1}</td>
                <td className="p-5 border-l border-white/5 tabular-nums font-bold text-slate-400">
                   {new Date(t.date).toLocaleDateString('ar-YE', {day:'2-digit', month:'2-digit', year:'2-digit'})}
                </td>
                <td className="p-5 border-l border-white/5">
                   <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm ${
                         t.type.includes('بيع') ? 'bg-emerald-50 text-emerald-600' : 
                         t.type.includes('شراء') ? 'bg-orange-50 text-orange-600' : 
                         'bg-indigo-50 text-indigo-600'
                      }`}>{t.type.includes('بيع') ? '💰' : t.type.includes('شراء') ? '📦' : '📥'}</span>
                      <div>
                         <p className="font-black">{t.type}</p>
                         <p className="text-[10px] font-bold text-slate-400 line-clamp-1 italic">{t.details}</p>
                      </div>
                   </div>
                </td>
                <td className="p-5 text-center border-l border-white/5 font-black tabular-nums text-rose-500">
                   {t.debit > 0 ? t.debit.toLocaleString() : '-'}
                </td>
                <td className="p-5 text-center border-l border-white/5 font-black tabular-nums text-emerald-500">
                   {t.credit > 0 ? t.credit.toLocaleString() : '-'}
                </td>
                <td className={`p-5 text-center border-l border-white/5 font-black tabular-nums ${t.balance > 0 ? 'text-rose-600 bg-rose-500/5' : 'text-emerald-600 bg-emerald-500/5'}`}>
                    {Math.abs(t.balance).toLocaleString()}
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan={6} className="p-20 text-center opacity-30 font-black text-lg">لا توجد عمليات مسجلة حالياً.</td>
              </tr>
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className={`text-sm font-black ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                <td colSpan={3} className="p-6 text-center border-t-4 border-indigo-500/30">إجمالي كشف الحساب الموحد</td>
                <td className="p-6 text-center text-rose-500 border-t-4 border-indigo-500/30 tabular-nums">{totals.debit.toLocaleString()}</td>
                <td className="p-6 text-center text-emerald-500 border-t-4 border-indigo-500/30 tabular-nums">{totals.credit.toLocaleString()}</td>
                <td className={`p-6 text-center border-t-4 border-indigo-500/30 tabular-nums ${currentBalance > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                   {Math.abs(currentBalance).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
