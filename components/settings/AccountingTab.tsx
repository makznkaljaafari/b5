
import React from 'react';

const ToggleOption = ({ icon, label, value, onChange }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
    <div className="flex items-center gap-4">
       <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-sm">{icon}</div>
       <p className="font-black text-xs">{label}</p>
    </div>
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all ${value ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${value ? 'right-7' : 'right-1'}`}></div>
    </button>
  </div>
);

export const AccountingTab = ({ localFormData, setLocalFormData, setHasChanges }: any) => {
  return (
    <div className="p-4 space-y-4">
      <ToggleOption 
        icon="🚫" label="منع البيع بالسالب" 
        value={!localFormData.accounting_settings.allow_negative_stock} 
        onChange={(v: boolean) => { 
          setLocalFormData({...localFormData, accounting_settings: {...localFormData.accounting_settings, allow_negative_stock: !v}}); 
          setHasChanges(true); 
        }} 
      />
      <ToggleOption 
        icon="🔔" label="تنبيهات الديون" 
        value={localFormData.accounting_settings.show_debt_alerts} 
        onChange={(v: boolean) => { 
          setLocalFormData({...localFormData, accounting_settings: {...localFormData.accounting_settings, show_debt_alerts: v}}); 
          setHasChanges(true); 
        }} 
      />
    </div>
  );
};
