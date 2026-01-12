
import React, { useMemo, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatDailyClosingReport } from '../services/shareService';
import { ForecastCard } from './ui/molecules/ForecastCard';
import { ReportDetailView } from './ui/organisms/ReportDetailView';
import { useReportsData } from '../hooks/useReportsData';
import { MetricsGrid } from './reports/MetricsGrid';
import { ReportsNavigation } from './reports/ReportsNavigation';

type ReportType = 'sales' | 'purchases' | 'expenses' | 'debts' | 'pl' | null;

const Reports: React.FC = () => {
  const { 
    navigate, theme, user, sales, expenses, categories, purchases, vouchers, addNotification 
  } = useApp();
  
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [reportCurrency, setReportCurrency] = useState<'YER' | 'SAR'>('YER');

  const { metrics, forecast, isForecastLoading } = useReportsData({
    sales, purchases, expenses, categories, currency: reportCurrency, addNotification
  });

  const reportData = useMemo(() => {
    if (!selectedReport) return null;
    
    switch (selectedReport) {
      case 'sales':
        return {
          title: `سجل المبيعات التفصيلي (${reportCurrency})`,
          headers: ['التاريخ', 'العميل', 'الصنف', 'الكمية', 'الإجمالي'],
          rows: sales.filter((s: any) => !s.is_returned && s.currency === reportCurrency).map((s: any) => [
            new Date(s.date).toLocaleDateString('ar-YE'), s.customer_name, s.qat_type, s.quantity, s.total.toLocaleString()
          ])
        };
      case 'purchases':
        return {
          title: `سجل المشتريات (${reportCurrency})`,
          headers: ['التاريخ', 'المورد', 'الصنف', 'الكمية', 'التكلفة'],
          rows: purchases.filter((p: any) => !p.is_returned && p.currency === reportCurrency).map((p: any) => [
            new Date(p.date).toLocaleDateString('ar-YE'), p.supplier_name, p.qat_type, p.quantity, p.total.toLocaleString()
          ])
        };
      case 'pl':
        return {
          title: `قائمة الأرباح والخسائر - ${reportCurrency}`,
          headers: ['البند المالي', 'القيمة التقديرية'],
          rows: [
            ['(+) إجمالي المبيعات النشطة', `+${metrics.totalSales.toLocaleString()}`],
            ['(-) تكلفة المشتريات', `-${metrics.totalPurchases.toLocaleString()}`],
            ['(-) المصاريف التشغيلية', `-${metrics.totalExpenses.toLocaleString()}`],
            ['(=) صافي الربح التقديري', metrics.netProfit.toLocaleString()]
          ],
          specialColors: true
        };
      default: return null;
    }
  }, [selectedReport, sales, purchases, expenses, metrics, reportCurrency]);

  const handleDailyClosingReport = useCallback(() => {
    if (window.confirm("هل أنت متأكد من مشاركة التقرير اليومي؟")) {
      shareToWhatsApp(formatDailyClosingReport({
        sales, expenses, purchases, vouchers, agencyName: user?.agency_name || "وكالة الشويع"
      }));
    }
  }, [sales, expenses, purchases, vouchers, user?.agency_name]);

  if (selectedReport && reportData) {
    return (
      <ReportDetailView 
        data={reportData} 
        onBack={() => setSelectedReport(null)} 
        onPrint={() => window.print()} 
        theme={theme}
      />
    );
  }

  return (
    <PageLayout title="التقارير والتحليلات" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pb-44 max-w-7xl mx-auto w-full px-2">
        
        <MetricsGrid metrics={metrics} currency={reportCurrency} onSelectReport={setSelectedReport} />

        <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-2xl gap-1 w-fit mx-auto border border-[var(--color-border-default)] shadow-inner">
            {(['YER', 'SAR'] as const).map(cur => (
              <button 
                key={cur} onClick={() => setReportCurrency(cur)} 
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${reportCurrency === cur ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 opacity-60'}`}
              >{cur}</button>
            ))}
        </div>

        <ForecastCard text={forecast} isLoading={isForecastLoading} />

        <ReportsNavigation 
            onNavigate={navigate} 
            onSelectReport={setSelectedReport} 
            onDailyClosing={handleDailyClosingReport} 
        />
      </div>
    </PageLayout>
  );
};

export default Reports;
