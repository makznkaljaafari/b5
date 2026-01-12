
import { useMemo } from 'react';
import { Sale, Purchase, Voucher } from '../types';

interface UseStatementProps {
  personId: string;
  personType: 'عميل' | 'مورد';
  sales: Sale[];
  purchases: Purchase[];
  vouchers: Voucher[];
  currency: string;
}

export const useAccountStatement = ({ personId, personType, sales, purchases, vouchers, currency }: UseStatementProps) => {
  return useMemo(() => {
    if (!personId) return [];
    let transactions: any[] = [];

    if (personType === 'عميل') {
      const customerSales = sales.filter(s => s.customer_id === personId && s.currency === currency && !s.is_returned);
      customerSales.forEach(s => {
        transactions.push({ 
          id: s.id, date: s.date, type: 'بيع', details: `${s.qat_type} (${s.quantity})`, 
          debit: s.status === 'آجل' ? s.total : 0, credit: s.status === 'نقدي' ? s.total : 0, original: s 
        });
      });
      const customerVouchers = vouchers.filter(v => v.person_id === personId && v.person_type === 'عميل' && v.currency === currency);
      customerVouchers.forEach(v => {
        transactions.push({ 
          id: v.id, date: v.date, type: `سند ${v.type}`, details: v.notes || 'سند مالي', 
          debit: v.type === 'دفع' ? v.amount : 0, credit: v.type === 'قبض' ? v.amount : 0, original: v 
        });
      });
    } else {
      const supplierPurchases = purchases.filter(p => p.supplier_id === personId && p.currency === currency && !p.is_returned);
      supplierPurchases.forEach(p => {
        transactions.push({ 
          id: p.id, date: p.date, type: 'شراء', details: `${p.qat_type} (${p.quantity})`, 
          debit: p.status === 'نقدي' ? p.total : 0, credit: p.status === 'آجل' ? p.total : 0, original: p 
        });
      });
      const supplierVouchers = vouchers.filter(v => v.person_id === personId && v.person_type === 'مورد' && v.currency === currency);
      supplierVouchers.forEach(v => {
        transactions.push({ 
          id: v.id, date: v.date, type: `سند ${v.type}`, details: v.notes || 'سداد حساب', 
          debit: v.type === 'دفع' ? v.amount : 0, credit: v.type === 'قبض' ? v.amount : 0, original: v 
        });
      });
    }

    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    return transactions.map(t => {
      if (personType === 'عميل') runningBalance += (t.debit - t.credit);
      else runningBalance += (t.credit - t.debit);
      return { ...t, balance: runningBalance };
    });
  }, [personId, personType, sales, purchases, vouchers, currency]);
};
