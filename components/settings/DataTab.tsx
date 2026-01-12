
import React, { useRef } from 'react';
import { BaseButton } from '../ui/atoms/BaseButton';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { indexedDbService } from '../../services/indexedDbService';

export const DataTab = ({ localFormData, handleInputChange, lastBackupDate, isBackupLoading, runManualBackup }: any) => {
  const { isSyncing, restoreBackup } = useData();
  const { addNotification } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClearCache = async () => {
    if (window.confirm('⚠️ مسح التخزين المؤقت؟ سيتم إجبار التطبيق على إعادة تحميل البيانات من السيرفر.')) {
      await indexedDbService.clearCache();
      window.location.reload();
    }
  };

  const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            if (!json.metadata || !json.metadata.app) throw new Error("تنسيق ملف غير مدعوم.");
            await restoreBackup(json);
        } catch (err: any) {
            addNotification("خطأ في الاسترجاع ❌", err.message || "فشل القراءة.", "warning");
        }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">وتيرة النسخ الاحتياطي التلقائي</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ id: 'daily', label: 'يومياً', icon: '📅' }, { id: '12h', label: 'كل 12 ساعة', icon: '⏰' }].map(freq => (
            <button
              key={freq.id}
              onClick={() => handleInputChange((p: any) => ({...p, accounting_settings: {...p.accounting_settings, backup_frequency: freq.id}}))}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${localFormData.accounting_settings.backup_frequency === freq.id ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}
            >
              <span className="text-xl">{freq.icon}</span>
              <span className="font-black text-[10px]">{freq.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-500/20 bg-indigo-500/5 space-y-4">
        <p className="text-[10px] text-indigo-500 font-bold tabular-nums">
          {lastBackupDate ? `آخر نسخ: ${new Date(lastBackupDate).toLocaleString('ar-YE')}` : 'لم يتم النسخ بعد'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseButton variant="primary" icon="📥" onClick={runManualBackup} loading={isBackupLoading} className="w-full">تصدير نسخة</BaseButton>
          <BaseButton variant="secondary" icon="📂" onClick={() => fileInputRef.current?.click()} loading={isSyncing} className="w-full">استرجاع نسخة</BaseButton>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileRestore} />
        </div>
      </div>

      <button onClick={handleClearCache} className="w-full border-2 border-rose-500/20 text-rose-500 p-4 rounded-2xl font-black text-xs flex justify-between hover:bg-rose-500/10 transition-colors">
        <span>مسح ذاكرة الكاش 🗑️</span>
        <span className="opacity-50">إصلاح المشاكل البرمجية</span>
      </button>
    </div>
  );
};
