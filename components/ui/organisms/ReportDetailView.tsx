
import React from 'react';
import { BaseButton } from '../atoms/BaseButton';

interface ReportDetailViewProps {
  data: {
    title: string;
    headers: string[];
    rows: any[][];
    specialColors?: boolean;
  };
  onBack: () => void;
  onPrint: () => void;
  theme: string;
}

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({ data, onBack, onPrint, theme }) => (
  <div className="page-enter space-y-6">
    <div className="flex justify-between items-center no-print px-2">
      <h2 className="font-black text-sm text-[var(--color-text-primary)] opacity-70">{data.title}</h2>
      <div className="flex gap-2">
        <BaseButton variant="primary" size="sm" icon="📄" onClick={onPrint}>PDF</BaseButton>
        <BaseButton variant="secondary" size="sm" onClick={onBack}>رجوع</BaseButton>
      </div>
    </div>

    <div className={`p-6 rounded-[2.5rem] shadow-2xl overflow-x-auto border-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
      <table className="w-full text-right border-collapse min-w-[500px]">
        <thead>
          <tr className={`${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'} text-[10px] font-black uppercase`}>
            <th className="p-4 border-b border-white/5 w-12 text-center">#</th>
            {data.headers.map((h, i) => (
              <th key={i} className="p-4 border-b border-white/5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-xs font-bold">
          {data.rows.map((row, i) => (
            <tr key={i} className={`hover:bg-indigo-500/5 transition-colors ${i % 2 === 0 ? '' : (theme === 'dark' ? 'bg-white/5' : 'bg-slate-50/50')}`}>
              <td className="p-4 border-b border-white/5 text-center tabular-nums opacity-40">{i+1}</td>
              {row.map((cell, j) => (
                <td key={j} className={`p-4 border-b border-white/5 ${
                  data.specialColors && cell.toString().startsWith('+') ? 'text-emerald-500 font-black' :
                  data.specialColors && cell.toString().startsWith('-') ? 'text-rose-500 font-black' : ''
                }`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
