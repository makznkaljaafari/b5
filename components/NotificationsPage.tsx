
import React, { useEffect, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';

const NotificationsPage: React.FC = memo(() => {
  const { notifications, markNotificationsAsRead, navigate, deleteAllOldNotifications } = useApp();

  useEffect(() => {
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  return (
    <PageLayout 
      title="التنبيهات" 
      onBack={() => navigate('dashboard')}
      headerExtra={
        <button
          onClick={deleteAllOldNotifications}
          className="w-10 h-10 rounded-xl bg-[var(--color-background-card)]/10 flex items-center justify-center text-lg transition-all active:scale-90 text-[var(--color-status-danger)]"
          aria-label="حذف التنبيهات القديمة"
        >
          🗑️
        </button>
      }
    >
      <div className="space-y-4 pt-4 page-enter pb-44 px-2 md:px-4" role="region" aria-label="قائمة التنبيهات">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 transition-all ${
                n.type === 'success' ? 'bg-[var(--color-status-success-bg)] dark:bg-[var(--color-status-success-bg)]/20 border-[var(--color-status-success)]/20 dark:border-[var(--color-status-success)]/30' :
                n.type === 'warning' ? 'bg-[var(--color-status-warning-bg)] dark:bg-[var(--color-status-warning-bg)]/20 border-[var(--color-status-warning)]/20 dark:border-[var(--color-status-warning)]/30' :
                n.type === 'ai_alert' ? 'bg-[var(--color-accent-indigo)]/10 dark:bg-[var(--color-accent-indigo)]/20 border-[var(--color-accent-indigo)]/20 dark:border-[var(--color-accent-indigo)]/30' :
                'bg-[var(--color-status-info-bg)] dark:bg-[var(--color-status-info-bg)]/20 border-[var(--color-status-info)]/20 dark:border-[var(--color-status-info)]/30'
              }`}
              role="status"
              aria-labelledby={`notification-title-${n.id}`}
              aria-describedby={`notification-message-${n.id}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 id={`notification-title-${n.id}`} className={`font-black text-lg ${
                  n.type === 'success' ? 'text-[var(--color-status-success)]' :
                  n.type === 'warning' ? 'text-[var(--color-status-warning)]' :
                  n.type === 'ai_alert' ? 'text-[var(--color-accent-indigo)]' :
                  'text-[var(--color-status-info)]'
                }`}>
                  {n.title}
                </h3>
                <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase" aria-label={`تاريخ التنبيه ${new Date(n.date).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}`}>
                  {new Date(n.date).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p id={`notification-message-${n.id}`} className={`font-bold leading-relaxed ${
                n.type === 'success' ? 'text-[var(--color-status-success)]/80 dark:text-[var(--color-status-success)]/90' :
                n.type === 'warning' ? 'text-[var(--color-status-warning)]/80 dark:text-[var(--color-status-warning)]/90' :
                n.type === 'ai_alert' ? 'text-[var(--color-accent-indigo)]/80 dark:text-[var(--color-accent-indigo)]/90' :
                'text-[var(--color-status-info)]/80 dark:text-[var(--color-status-info)]/90'
              }`}>
                {n.message}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-32 opacity-20 flex flex-col items-center gap-6" role="status">
            <span className="text-8xl text-[var(--color-text-muted)]" aria-hidden="true">📭</span>
            <p className="font-black text-2xl text-[var(--color-text-muted)]">لا توجد تنبيهات حالياً</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
});

export default NotificationsPage;
