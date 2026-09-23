import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  icon?: string;
  multiline?: boolean;
  rows?: number;
  rightLabel?: string;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, icon, multiline, rows = 4, rightLabel, className = '', ...props }, ref) => {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className="space-y-3 w-full">
        <label className="block text-[12px] sm:text-[11px] font-cairo font-bold text-gray-700 sm:text-gray-600 uppercase tracking-[0.2em] sm:tracking-[0.25em] pr-2 flex justify-between items-center mb-2.5 sm:mb-2 leading-tight">
          <span>{label}</span>
          {rightLabel && <span className="text-primary/70 sm:text-primary/60 lowercase font-semibold tracking-normal italic text-[11px] sm:text-xs hidden sm:inline">{rightLabel}</span>}
        </label>
        <div className="relative group">
          {icon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl opacity-60 group-focus-within:opacity-100 transition-opacity z-10 pointer-events-none">
              {icon}
            </span>
          )}
          <InputComponent
            {...(props as any)}
            ref={ref as any}
            rows={multiline ? rows : undefined}
            className={`w-full font-cairo ${icon ? 'pr-14 sm:pr-16' : 'px-6 sm:px-8'} ${multiline ? 'py-5 sm:py-6' : 'py-4.5 sm:py-5.5'} rounded-[20px] sm:rounded-[24px] bg-gray-50/90 border-2 ${
              error ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-primary'
            } focus:bg-white focus:ring-4 sm:focus:ring-8 focus:ring-primary/10 outline-none transition-all duration-200 font-semibold sm:font-bold text-gray-900 text-base sm:text-lg shadow-sm focus:shadow-md touch-manipulation placeholder:text-gray-400 ${className}`}
            dir={props.dir || 'rtl'}
          />
        </div>
        {error && (
          <p className="text-red-600 text-[12px] sm:text-[11px] font-bold mt-2.5 pr-2 uppercase tracking-wide sm:tracking-wider animate-in fade-in slide-in-from-top-1 flex items-center gap-2 font-cairo">
            <span className="text-red-500 text-base">⚠</span>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

