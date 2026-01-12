
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { dataService } from '../services/dataService';
import { ActivityLog } from '../types';
import { useIsMounted } from '../hooks/useIsMounted';

const ActivitiesList: React.FC = () => {
  const { navigate, theme } = useApp();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const isComponentMounted = useIsMounted();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await dataService.getActivityLogs();
        if (isComponentMounted()) {
          setLogs(data);
        }
      } catch (e) {
        // Handle error if necessary
      } finally {
        if (isComponentMounted()) {
          setIsLoading(false);
        }
      }
    };
    fetchLogs();
  }, [isComponentMounted]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'sale': return '💰';
      case 'purchase': return '📦';
      case 'voucher': return '📥';
      case 'waste': return '🥀';
      case 'settings': return '⚙️';
      case 'auth': return '🔐';
      default: return '🛡️';
    }
  };

  return (
    <PageLayout title="سجل الرقابة الذكي" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pb-44 max-w-4xl mx-auto w-full px-2">
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder="ابحث في سجلات الأمان..."
            className="w-full bg-[var(--color-background-secondary)] border-2 border-[var(--color-border-primary)] focus:border-indigo-500 rounded-2xl p-4 pr-12 font-bold text-sm shadow-lg outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
        </div>

        <div className={`overflow-hidden rounded-[2rem] border-2 shadow-2xl ${theme === 'dark' ? 'bg-[var(--color-background-secondary)] border-[var(--color-border-primary)]' : 'bg-white border-slate-100'}`}>
          {isLoading ? (
            <div className="p-20 text-center space-y-4">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
               <p className="font-black text-slate-400">جاري فحص السجلات السحابية...</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-primary)]/50">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-slate-500/[0.03] transition-colors flex items-start gap-5">
                   <div className="w-14 h-14 bg-[var(--color-background-tertiary)] rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {getLogIcon(log.type)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="font-black text-[var(--color-text-primary)] text-sm md:text-base">{log.action}</h4>
                         <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                            {new Date(log.timestamp).toLocaleTimeString('ar-YE', {hour:'2-digit', minute:'2-digit'})} • {new Date(log.timestamp).toLocaleDateString('ar-YE')}
                         </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium break-words opacity-80">{log.details}</p>
                      <div className="mt-3 flex gap-2">
                         <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            log.type === 'sale' ? 'bg-emerald-100 text-emerald-700' :
                            log.type === 'purchase' ? 'bg-orange-100 text-orange-700' :
                            log.type === 'voucher' ? 'bg-indigo-100 text-indigo-700' :
                            log.type === 'waste' ? 'bg-rose-100 text-rose-700' :
                            log.type === 'auth' ? 'bg-purple-100 text-purple-700' :
                            log.type === 'settings' ? 'bg-cyan-100 text-cyan-700' :
                            'bg-slate-100 text-slate-700'
                         }`}>{log.type}</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && filteredLogs.length === 0 && (
            <div className="p-20 text-center opacity-20 flex flex-col items-center gap-6">
               <span className="text-8xl">🛡️</span>
               <p className="font-black text-xl">لا توجد سجلات مطابقة للبحث</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ActivitiesList;
