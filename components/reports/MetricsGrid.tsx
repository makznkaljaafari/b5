
import React from 'react';
import { StatCard } from '../ui/atoms/StatCard';

export const MetricsGrid = ({ metrics, currency, onSelectReport }: any) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
       <StatCard 
         title="إجمالي المبيعات" value={metrics.totalSales} currency={currency} 
         colorClass="text-emerald-500" icon="💰" onClick={() => onSelectReport('sales')}
       />
       <StatCard 
         title="إجمالي المشتريات" value={metrics.totalPurchases} currency={currency} 
         colorClass="text-orange-500" icon="📦" onClick={() => onSelectReport('purchases')}
       />
       <StatCard 
         title="إجمالي المصاريف" value={metrics.totalExpenses} currency={currency} 
         colorClass="text-rose-500" icon="💸" onClick={() => onSelectReport('expenses')}
       />
       <StatCard 
         title="صافي الربح التقديري" value={metrics.netProfit} currency={currency} 
         colorClass={metrics.netProfit >= 0 ? 'text-indigo-500' : 'text-rose-500'} icon="📈" onClick={() => onSelectReport('pl')}
       />
       <StatCard 
         title="قيمة المخزون" value={metrics.stockValue} currency={currency} 
         colorClass="text-cyan-500" icon="🌿"
       />
    </div>
  );
};
