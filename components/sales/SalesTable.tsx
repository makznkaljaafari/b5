
import React, { memo } from 'react';
import { Sale, Theme } from '../../types';
import { shareToWhatsApp, formatSaleInvoice } from '../../services/shareService';

interface SalesTableProps {
  sales: Sale[];
  theme: Theme;
  agencyName: string;
  onNavigate: (page: any, params: any) => void;
  onReturn: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

export const SalesTable: React.FC<SalesTableProps> = memo(({ sales, theme, agencyName, onNavigate, onReturn, onDelete }) => {
  return (
    <div className={`overflow-hidden rounded-[2rem] shadow-2xl border-2 ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] border-[var(--color-border-default)]'}`}>
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[700px]">
                <thead>
                    <tr className={`text-[10px] font-black uppercase tracking-widest border-b-2 ${theme === 'dark' ? 'bg-[var(--color-background-input)] text-[var(--color-text-muted)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border-default)]'}`}>
                        <th className="p-4 text-center w-12">#</th>
                        <th className="p-4 border-l border-[var(--color-border-default)]/50">العميل</th>
                        <th className="p-4 text-center border-l border-[var(--color-border-default)]/50">الصنف</th>
                        <th className="p-4 text-center border-l border-[var(--color-border-default)]/50">كمية</th>
                        <th className="p-4 text-center border-l border-[var(--color-border-default)]/50">الإجمالي</th>
                        <th className="p-4 text-center border-l border-[var(--color-border-default)]/50">حالة</th>
                        <th className="p-4 text-center border-l border-[var(--color-border-default)]/50 w-48">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-default)]/50">
                    {sales.map((sale, idx) => (
                        <tr key={sale.id} className={`text-xs hover:bg-[var(--color-accent-sky)]/5 transition-colors cursor-pointer ${sale.is_returned ? 'opacity-50 bg-[var(--color-status-danger-bg)]/5' : ''}`} onClick={() => onNavigate('invoice-view', { sale })}>
                            <td className="p-4 text-center font-black tabular-nums opacity-30">{(sales.length - idx)}</td>
                            <td className={`p-4 font-black border-l border-[var(--color-border-default)]/30 ${sale.is_returned ? 'line-through text-[var(--color-status-danger)]' : ''}`}>{sale.customer_name}</td>
                            <td className="p-4 text-center border-l border-[var(--color-border-default)]/30 font-bold">{sale.qat_type}</td>
                            <td className="p-4 text-center border-l border-[var(--color-border-default)]/30 font-black tabular-nums">{sale.quantity} حبه</td>
                            <td className={`p-4 text-center border-l border-[var(--color-border-default)]/30 font-black tabular-nums ${sale.is_returned ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>{sale.total.toLocaleString()}</td>
                            <td className="p-4 text-center border-l border-[var(--color-border-default)]/30">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${sale.status === 'نقدي' ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]' : 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)]'}`}>{sale.status}</span>
                            </td>
                            <td className="p-4 text-center border-l border-[var(--color-border-default)]/30" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                    <button onClick={() => shareToWhatsApp(formatSaleInvoice(sale, agencyName))} className="p-2 text-[var(--color-status-success)] rounded-lg">💬</button>
                                    <button onClick={() => onReturn(sale)} className="p-2 text-[var(--color-status-danger)]">🔄</button>
                                    <button onClick={() => onDelete(sale)} className="p-2 text-[var(--color-status-danger)]">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
});
