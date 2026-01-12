
import React, { memo } from 'react';

interface ForecastCardProps {
  text: string;
  isLoading?: boolean;
}

export const ForecastCard: React.FC<ForecastCardProps> = memo(({ text, isLoading }) => (
  <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl relative overflow-hidden flex items-center gap-4 mt-6 animate-in zoom-in-95" role="status">
    <div className={`w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl shrink-0 ${isLoading ? 'animate-pulse' : 'animate-float'}`}>
      {isLoading ? '⏳' : '🤖'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">توقعات المحاسب الذكي Gemini</p>
      <p className="text-xs md:text-sm font-black leading-relaxed italic opacity-95 line-clamp-3">
        "{text}"
      </p>
    </div>
    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
  </div>
));
