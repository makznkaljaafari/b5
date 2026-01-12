
import React, { useEffect, useState } from 'react';
import { useUI } from '../../context/UIContext';

export const FeedbackOverlay: React.FC = () => {
  const { feedbackType } = useUI();
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (feedbackType === 'celebration') {
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + 'vw',
        top: Math.random() * 100 + 'vh',
        color: ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 2 + 's',
        size: Math.random() * 10 + 5 + 'px'
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [feedbackType]);

  if (!feedbackType) return null;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
      {feedbackType === 'celebration' ? (
        <>
          <div className="text-center animate-bounce-soft">
            <h1 className="text-7xl mb-4">💰✅🚀</h1>
            <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-xl">عملية ناجحة! ممتاز</h2>
          </div>
          {particles.map(p => (
            <div 
              key={p.id}
              className="particle animate-firework"
              style={{
                left: p.left,
                top: p.top,
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                animationDelay: p.delay
              }}
            />
          ))}
        </>
      ) : (
        <div className="text-center animate-slide-up">
          <div className="text-9xl mb-4 opacity-50 grayscale">☁️⚠️</div>
          <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400">قيد آجل.. انتبه للديون!</h2>
        </div>
      )}
    </div>
  );
};
