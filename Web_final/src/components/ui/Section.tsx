import React from 'react';

interface SectionProps {
  title: string;
  icon?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ 
  title, 
  icon, 
  badge, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4 sm:pb-6">
        <h3 className="text-xl sm:text-2xl font-cairo font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3 sm:gap-4 leading-tight">
          {icon && <span className="text-primary bg-primary/5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-inner text-lg sm:text-xl flex-shrink-0">{icon}</span>}
          <span>{title}</span>
        </h3>
        {badge && (
          <span className="text-[12px] sm:text-[11px] font-cairo font-bold text-gray-600 sm:text-gray-500 uppercase tracking-[0.25em] sm:tracking-[0.3em] bg-gray-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-100 whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

