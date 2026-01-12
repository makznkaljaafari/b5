
import React, { useState, useEffect, memo } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PageLayout } from './ui/Layout';
import { DataTab } from './settings/DataTab';
import { AppearanceTab } from './settings/AppearanceTab';
import { AccountingTab } from './settings/AccountingTab';
import { GeneralTab } from './settings/GeneralTab';
import { FinanceTab } from './settings/FinanceTab';

type SettingsTab = 'general' | 'appearance' | 'accounting' | 'finance' | 'data';

const SettingsPage: React.FC = () => {
  const { navigate, theme, setTheme, addNotification, resolvedTheme } = useUI();
  const { user, updateUser } = useAuth();
  const { exchangeRates, updateExchangeRates, lastBackupDate, isBackupLoading, runManualBackup } = useData(); 

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [localFormData, setLocalFormData] = useState<any>(null);
  const [localRates, setLocalRates] = useState({ SAR_TO_YER: 430, OMR_TO_YER: 425 });

  useEffect(() => {
    if (user) {
      setLocalFormData({
        agency_name: user.agency_name || '',
        full_name: user.full_name || '',
        whatsapp_number: user.whatsapp_number || '',
        enable_voice_ai: user.enable_voice_ai ?? true,
        appearance_settings: {
          theme: user.appearance_settings?.theme || 'system', 
          accent_color: user.appearance_settings?.accent_color || '#4ade80'
        },
        accounting_settings: {
          allow_negative_stock: user.accounting_settings?.allow_negative_stock ?? false,
          show_debt_alerts: user.accounting_settings?.show_debt_alerts ?? true,
          backup_frequency: user.accounting_settings?.backup_frequency || 'daily'
        }
      });
    }
    if (exchangeRates) setLocalRates(exchangeRates);
  }, [user, exchangeRates]);

  if (!localFormData) return null;

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateUser(localFormData);
      if (activeTab === 'finance') await updateExchangeRates(localRates);
      addNotification('تم التحديث 💾', 'تم حفظ الإعدادات بنجاح.', 'success');
      setHasChanges(false);
    } catch (e: any) {
      addNotification('خطأ ⚠️', e.message || 'تعذر الحفظ.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'البروفايل', icon: '👤' },
    { id: 'appearance', label: 'المظهر', icon: '🎨' },
    { id: 'accounting', label: 'المحاسبة', icon: '📊' },
    { id: 'finance', label: 'المالية', icon: '💱' },
    { id: 'data', label: 'البيانات', icon: '💾' },
  ];

  return (
    <PageLayout title="إعدادات النظام" onBack={() => navigate('dashboard')}>
      <div className="max-w-3xl mx-auto w-full px-2 pb-48 space-y-6 page-enter">
        <div className={`p-1.5 rounded-[1.8rem] shadow-lg border overflow-x-auto no-scrollbar flex items-center gap-1 sticky top-2 z-30 ${resolvedTheme === 'dark' ? 'bg-slate-900/90 backdrop-blur-md border-white/5' : 'bg-white/90 backdrop-blur-md border-slate-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1 py-3 rounded-2xl font-black text-[9px] transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'general' && (
            <SettingsCard icon="🏢" title="معلومات الوكالة" theme={resolvedTheme}>
              <GeneralTab localFormData={localFormData} setLocalFormData={setLocalFormData} setHasChanges={setHasChanges} />
            </SettingsCard>
          )}

          {activeTab === 'appearance' && (
            <SettingsCard icon="🎨" title="المظهر" theme={resolvedTheme}>
              <AppearanceTab theme={theme} setTheme={setTheme} setLocalFormData={setLocalFormData} setHasChanges={setHasChanges} />
            </SettingsCard>
          )}

          {activeTab === 'accounting' && (
            <SettingsCard icon="⚖️" title="قواعد المحاسبة" theme={resolvedTheme}>
              <AccountingTab localFormData={localFormData} setLocalFormData={setLocalFormData} setHasChanges={setHasChanges} />
            </SettingsCard>
          )}

          {activeTab === 'finance' && (
            <SettingsCard icon="💱" title="أسعار الصرف" theme={resolvedTheme}>
              <FinanceTab localRates={localRates} setLocalRates={setLocalRates} setHasChanges={setHasChanges} />
            </SettingsCard>
          )}

          {activeTab === 'data' && (
            <SettingsCard icon="☁️" title="البيانات والنسخ الاحتياطي" theme={resolvedTheme}>
               <DataTab localFormData={localFormData} handleInputChange={setLocalFormData} lastBackupDate={lastBackupDate} isBackupLoading={isBackupLoading} runManualBackup={runManualBackup} />
            </SettingsCard>
          )}
        </div>

        {hasChanges && (
          <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
             <button onClick={handleSaveAll} disabled={isSaving} className={`w-full max-w-2xl mx-auto p-5 rounded-[2rem] font-black text-lg shadow-xl transition-all flex items-center justify-center gap-4 ${isSaving ? 'bg-slate-400' : 'bg-emerald-600 text-white active:scale-95'}`}>
               {isSaving ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : 'حفظ التعديلات ✅'}
             </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

const SettingsCard = memo(({ icon, title, children, theme }: any) => (
  <div className={`rounded-[2.2rem] border overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-white/5' : 'bg-white border-slate-200'}`}>
     <div className={`px-6 py-4 flex items-center gap-3 border-b ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'bg-slate-50 border-slate-200'}`}>
        <span className="text-xl">{icon}</span>
        <h3 className="font-black text-xs uppercase tracking-tighter opacity-80">{title}</h3>
     </div>
     <div className="p-4 space-y-4">{children}</div>
  </div>
));

export default SettingsPage;
