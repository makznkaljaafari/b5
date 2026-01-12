
import React, { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialChartProps {
  data: any[];
  theme: 'light' | 'dark';
}

export const FinancialChart: React.FC<FinancialChartProps> = memo(({ data, theme }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className="w-full h-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 8, fontWeight: 700, fill: isDark ? '#64748b' : '#94a3b8' }} 
          />
          <YAxis hide={true} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#0f172a' : '#fff', 
              borderRadius: '0.75rem', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'right'
            }}
            itemStyle={{ fontWeight: 800, fontSize: '10px' }}
          />
          <Area 
            type="monotone" 
            dataKey="sales" 
            name="مبيعات" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSales)" 
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            name="مصاريف" 
            stroke="#f43f5e" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorExpenses)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
