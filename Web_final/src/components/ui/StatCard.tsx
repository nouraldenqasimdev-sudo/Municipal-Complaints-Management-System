import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  color, 
  trend, 
  onClick,
  className = ''
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden h-full flex flex-col ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
    >
      
      <div className={`absolute -top-8 -right-8 w-32 h-32 ${color}/5 rounded-full blur-[60px] transition-transform duration-300 group-hover:scale-150`}></div>
      
      
      <div className="flex justify-between items-start mb-4 sm:mb-5 relative z-10">
        <div className={`${color} text-white w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] sm:text-xs font-cairo font-bold text-secondary bg-secondary/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-secondary/20 whitespace-nowrap">
            {trend}
          </span>
        )}
      </div>
      
      
      <div className="relative z-10 space-y-2 sm:space-y-3 flex-grow flex flex-col justify-end">
        <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-cairo font-black text-slate-950 tracking-tightest leading-none group-hover:text-primary transition-colors duration-300">{value}</p>
        <p className="text-xs sm:text-sm text-slate-600 font-cairo font-semibold leading-relaxed line-clamp-2 min-h-[2.5rem]">{label}</p>
      </div>
    </div>
  );
};
