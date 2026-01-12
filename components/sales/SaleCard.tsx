
import React, { memo } from 'react';
import { Sale, Theme } from '../../types';
import { shareToWhatsApp, formatSaleInvoice } from '../../services/shareService';

interface SaleCardProps {
  sale: Sale;
  theme: Theme;
  agencyName: string;
  onNavigate: (page: any, params: any) => void;
  onReturn: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

export const SaleCard: React.FC<SaleCardProps> = memo(({ sale, theme, agencyName, onNavigate, onReturn, onDelete }) => {
  return (
    <div 
      className={`p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden cursor-pointer hover:shadow-2xl active:scale-[0.98] ${sale.is_returned ? 'opacity-60 grayscale' : ''} ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-[var(--color-border-default)]' : 'bg-[var(--color-background-card)] shadow-xl border-[var(--color-border-subtle)]'}`}
      onClick={() => onNavigate('invoice-view', { sale })}
    >
      {sale.is_returned && (
        <div className="absolute top-4 -left-8 bg-[var(--color-status-danger)] text-[var(--color-text-inverse)] py-1 px-10 -rotate-45 text-[8px] font-black uppercase tracking-widest z-10 shadow-sm">مرتجع</div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="font-black text-lg text-[var(--color-text-default)] truncate max-w-[180px]">{sale.customer_name}</h3>
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-widest leading-none">{sale.qat_type} • {sale.quantity} حبة</p>
        </div>
        <div className="text-left">
            <p className={`text-xl font-black tabular-nums leading-none ${sale.is_returned ? 'line-through text-[var(--color-status-danger)]' : 'text-[var(--color-status-success)]'}`}>{sale.total.toLocaleString()}</p>
            <small className="text-[8px] font-black opacity-30 text-[var(--color-text-muted)] block mt-1">{sale.currency}</small>
        </div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-default)]/50" onClick={e => e.stopPropagation()}>
        <button onClick={() => shareToWhatsApp(formatSaleInvoice(sale, agencyName))} className="w-9 h-9 bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] rounded-xl flex items-center justify-center shadow-sm hover:bg-[var(--color-status-success)] hover:text-[var(--color-text-inverse)] transition-all">💬</button>
        <button onClick={() => onReturn(sale)} className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all ${sale.is_returned ? 'bg-[var(--color-background-tertiary)] text-[var(--color-text-muted)] cursor-not-allowed' : 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'}`} disabled={sale.is_returned}>🔄</button>
        <button onClick={() => onDelete(sale)} className="w-9 h-9 bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-xl flex items-center justify-center shadow-sm hover:bg-[var(--color-status-danger)] hover:text-[var(--color-text-inverse)] transition-all">🗑️</button>
      </div>
    </div>
  );
});
