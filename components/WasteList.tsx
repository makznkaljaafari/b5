
import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const WasteList: React.FC = () => {
  const { wasteRecords, navigate, theme, deleteWaste, addNotification } = useApp(); // Added deleteWaste
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = wasteRecords.filter(w => 
    w.qat_type.includes(searchTerm) || w.reason.includes(searchTerm)
  );

  const totalLoss = filtered.reduce((sum, w) => sum + w.estimated_loss, 0);

  const handleDelete = useCallback(async (id: string, qatType: string) => {
    if (window.confirm(`هل أنت متأكد من حذف سجل التالف للصنف ${qatType}؟`)) {
      try {
        await deleteWaste(id); // deleteWaste now handles notifications and logging
      } catch (err: any) {
        addNotification("خطأ ⚠️", err.message || "فشل حذف سجل التالف.", "warning");
      }
    }
  }, [deleteWaste, addNotification]);

  return (
    <PageLayout title="التالف" onBack={() => navigate('dashboard')}>
      <div className="space-y-2 pb-44 max-w-7xl mx-auto w-full px-1">
        
        <div className="px-1">
          <input 
            type="text"
            placeholder="بحث..."
            className="w-full border rounded-lg p-1.5 text-[10px] outline-none dark:bg-slate-800 dark:border-slate-700"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={`overflow-hidden rounded-lg shadow-xs border mx-0.5 ${theme === 'dark' ? 'bg-[var(--color-background-secondary)] border-slate-700' : 'bg-white'}`}>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-rose-500 text-white text-[8px] font-black uppercase">
                  <th className="p-1 text-center w-12">تاريخ</th>
                  <th className="p-1 border-l border-white/20 w-20">صنف</th>
                  <th className="p-1 text-center border-l border-white/20 w-8">كم</th>
                  <th className="p-1 text-center border-l border-white/20 w-16">خسارة</th>
                  <th className="p-1 border-l border-white/20">السبب</th>
                  <th className="p-1 text-center w-12">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filtered.map((w) => (
                  <tr key={w.id} className="text-[9px] hover:bg-rose-50 transition-colors">
                    <td className="p-1 text-center opacity-60 tabular-nums">{new Date(w.date).toLocaleDateString('ar-YE', {month:'2-digit', day:'2-digit'})}</td>
                    <td className="p-1 border-l font-black">{w.qat_type}</td>
                    <td className="p-1 text-center border-l tabular-nums">{w.quantity}</td>
                    <td className="p-1 text-center border-l font-black tabular-nums">{w.estimated_loss.toLocaleString()}</td>
                    <td className="p-1 border-l opacity-70 truncate max-w-[100px]">{w.reason}</td>
                    <td className="p-1 text-center">
                       <button onClick={() => handleDelete(w.id, w.qat_type)} className="text-rose-500 hover:text-rose-700 active:scale-90 transition-all">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-rose-500 text-white flex justify-between items-center shadow-lg mx-0.5">
           <div>
              <p className="text-[7px] font-black uppercase opacity-80">إجمالي التالف</p>
              <p className="text-sm font-black">{totalLoss.toLocaleString()} <small className="text-[8px]">YER</small></p>
           </div>
           <button onClick={() => navigate('add-waste')} className="bg-white text-rose-500 px-3 py-1 rounded-md font-black text-[9px] shadow-xs active:scale-95 transition-transform">＋</button>
        </div>
      </div>
    </PageLayout>
  );
};

export default WasteList;
