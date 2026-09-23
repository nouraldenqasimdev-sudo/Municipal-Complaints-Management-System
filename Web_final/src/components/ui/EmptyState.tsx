import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '📂', 
  title, 
  description 
}) => {
  return (
    <div className="text-center py-16 sm:py-24 lg:py-32 bg-white rounded-[30px] sm:rounded-[45px] lg:rounded-[60px] border border-gray-100 shadow-inner px-6 sm:px-8">
      <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8 opacity-10 grayscale">{icon}</div>
      <p className="text-gray-700 sm:text-gray-600 font-cairo font-black text-xl sm:text-2xl tracking-tighter uppercase mb-2 sm:mb-3 leading-tight">{title}</p>
      {description && (
        <p className="text-gray-600 sm:text-gray-500 text-sm sm:text-base font-cairo font-semibold uppercase tracking-wider sm:tracking-widest max-w-md mx-auto leading-relaxed">{description}</p>
      )}
    </div>
  );
};

