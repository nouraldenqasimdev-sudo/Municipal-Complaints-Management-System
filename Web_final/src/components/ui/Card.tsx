import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
  hoverable?: boolean;
  variant?: 'white' | 'glass' | 'dark';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  headerAction, 
  noPadding = false,
  hoverable = false,
  variant = 'white'
}) => {
  const variantStyles = {
    white: "bg-white border-slate-100 shadow-premium",
    glass: "bg-white/70 backdrop-blur-3xl border-white/40 shadow-premium-hover",
    dark: "bg-slate-950 border-white/5 shadow-2xl text-white"
  };

  const hoverStyles = hoverable 
    ? "hover:shadow-premium-hover hover:-translate-y-2 transition-all duration-700 cursor-default" 
    : "";

  return (
    <div className={`rounded-[30px] sm:rounded-[45px] lg:rounded-[60px] border relative overflow-hidden transition-all duration-500 ${variantStyles[variant]} ${hoverStyles} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className={`p-6 sm:p-8 lg:p-12 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 relative z-10 ${variant === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="space-y-2 sm:space-y-3 flex-1">
            {title && <h3 className={`font-cairo font-black text-xl sm:text-2xl lg:text-3xl tracking-tightest uppercase leading-tight ${variant === 'dark' ? 'text-white' : 'text-slate-950'}`}>{title}</h3>}
            {subtitle && <p className={`text-[13px] sm:text-[12px] font-cairo font-bold uppercase tracking-wider sm:tracking-ultra-wide ${variant === 'dark' ? 'text-slate-300 sm:text-slate-400' : 'text-slate-600 sm:text-slate-500'}`}>{subtitle}</p>}
          </div>
          {headerAction && <div className="relative z-20 w-full sm:w-auto">{headerAction}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-6 sm:p-8 lg:p-12'} relative z-10`}>
        {children}
      </div>
      
      
      {(variant === 'glass' || variant === 'dark') && (
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      )}
    </div>
  );
};
