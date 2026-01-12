
import React from 'react';

interface ConfirmationDialogProps {
  pendingAction: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ pendingAction, onConfirm, onCancel }) => {
  if (!pendingAction) return null;

  return (
    <div className="absolute inset-x-2 bottom-28 z-[100] animate-in zoom-in-95" role="dialog" aria-modal="true">
       <div className={`p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border-4 border-[var(--color-accent-indigo)] bg-[var(--color-background-card)]`}>
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)] rounded-xl flex items-center justify-center text-2xl shadow-lg animate-pulse">⚡</div>
                <h4 className="font-black text-lg text-[var(--color-text-default)]">تأكيد العملية سحابياً</h4>
             </div>
             <div className="bg-[var(--color-background-tertiary)] p-6 rounded-2xl space-y-2 text-[var(--color-text-default)]">
                {Object.entries(pendingAction.args || {}).map(([k,v]: any) => (
                  <div key={k} className="flex justify-between text-xs font-black">
                     <span className="opacity-40 text-[var(--color-text-muted)]">{k}</span>
                     <span className="text-[var(--color-accent-indigo)]">{String(v)}</span>
                  </div>
                ))}
             </div>
             <div className="flex gap-2">
                <button onClick={onConfirm} className="flex-[2] bg-[var(--color-accent-indigo)] text-[var(--color-text-inverse)] py-4 rounded-xl font-black shadow-lg active:scale-95 transition-all">تأكيد القيد ✅</button>
                <button onClick={onCancel} className="flex-1 bg-[var(--color-background-tertiary)] text-[var(--color-text-default)] py-4 rounded-xl font-black">إلغاء</button>
             </div>
          </div>
       </div>
    </div>
  );
};
