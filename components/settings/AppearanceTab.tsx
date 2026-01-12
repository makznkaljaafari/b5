
import React from 'react';
import { Theme } from '../../types';

export const AppearanceTab = ({ theme, setTheme, setLocalFormData, setHasChanges }: any) => {
  const themes = [
    { id: 'light', label: 'نهاري', icon: '☀️' },
    { id: 'dark', label: 'ليلي', icon: '🌙' },
    { id: 'system', label: 'تلقائي', icon: '📱' }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => { 
            setTheme(t.id as Theme); 
            setLocalFormData((prev: any) => ({...prev, appearance_settings: {...prev.appearance_settings, theme: t.id}})); 
            setHasChanges(true); 
          }}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${theme === t.id ? 'bg-indigo-600 text-white border-transparent shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}
        >
          <span className="text-2xl">{t.icon}</span>
          <span className="font-black text-[9px]">{t.label}</span>
        </button>
      ))}
    </div>
  );
};
