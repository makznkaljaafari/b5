
import React, { memo } from 'react';

const InputGroup = memo(({ label, value, onChange }: any) => (
  <div className="space-y-1.5 p-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{label}</label>
    <input type="text" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-white/5 font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
));

export const GeneralTab = ({ localFormData, setLocalFormData, setHasChanges }: any) => {
  return (
    <div className="space-y-4">
      <InputGroup 
        label="اسم الوكالة" 
        value={localFormData.agency_name} 
        onChange={(v: string) => { setLocalFormData({...localFormData, agency_name: v}); setHasChanges(true); }} 
      />
      <InputGroup 
        label="اسم المدير" 
        value={localFormData.full_name} 
        onChange={(v: string) => { setLocalFormData({...localFormData, full_name: v}); setHasChanges(true); }} 
      />
      <InputGroup 
        label="رقم الواتساب" 
        value={localFormData.whatsapp_number || ''} 
        onChange={(v: string) => { setLocalFormData({...localFormData, whatsapp_number: v}); setHasChanges(true); }} 
      />
      
      <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">🎙️</div>
            <div>
              <p className="font-black text-xs">تفعيل المساعد الصوتي AI</p>
              <p className="text-[9px] text-slate-400 font-bold italic">يتيح لك القييد والجرد عبر الأوامر الصوتية</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { setLocalFormData({...localFormData, enable_voice_ai: !localFormData.enable_voice_ai}); setHasChanges(true); }} 
            className={`w-12 h-6 rounded-full relative transition-all ${localFormData.enable_voice_ai ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${localFormData.enable_voice_ai ? 'right-7' : 'right-1'}`}></div>
          </button>
        </label>
      </div>
    </div>
  );
};
