
import { logger } from "./loggerService";

// نظام قفل لمنع التصدير المكرر في نفس الوقت
let isExporting = false;

export const exportService = {
  /**
   * تصدير كائن JSON إلى ملف JSON مع حماية ضد التكرار
   */
  exportToJson(data: any, fileName: string) {
    if (isExporting) {
      logger.warn("هناك عملية تصدير قيد التنفيذ بالفعل.");
      return false;
    }

    if (!data) {
      logger.error("لا توجد بيانات للتصدير.");
      return false;
    }

    isExporting = true;
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      // إضافة طابع زمني لضمان عدم تكرار اسم الملف
      const timestamp = new Date().getTime();
      link.setAttribute('download', `${fileName}_${timestamp}.json`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الذاكرة
      setTimeout(() => {
        URL.revokeObjectURL(url);
        isExporting = false;
      }, 1000);
      
      return true;
    } catch (e) {
      logger.error("فشل تصدير الملف:", e);
      isExporting = false;
      return false;
    }
  },

  /**
   * تصدير CSV (للمبيعات أو التقارير)
   */
  exportToCSV(data: any[], fileName: string) {
    if (isExporting || !data?.length) return;
    
    isExporting = true;
    try {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(obj => 
        Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
      );

      const csvContent = "\uFEFF" + [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
        isExporting = false;
      }, 1000);
    } catch (e) {
      isExporting = false;
    }
  }
};
