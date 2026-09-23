import React, { forwardRef } from 'react';

interface SelectGroupedProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  groups: { [governorate: string]: { value: string | number; label: string }[] };
}

export const SelectGrouped = forwardRef<HTMLSelectElement, SelectGroupedProps>(
  ({ label, error, groups, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2.5 sm:space-y-3 w-full">
        <label className="block text-[12px] sm:text-[11px] font-cairo font-bold text-gray-700 sm:text-gray-600 uppercase tracking-[0.2em] sm:tracking-[0.25em] pr-2 mb-2.5 sm:mb-2 leading-tight">
          {label}
        </label>
        <div className="relative group">
          <select
            {...props}
            ref={ref}
            className={`w-full font-cairo px-6 sm:px-8 py-4.5 sm:py-5.5 rounded-[20px] sm:rounded-[24px] bg-gray-50/90 border-2 ${
              error ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-primary'
            } focus:bg-white focus:ring-4 sm:focus:ring-8 focus:ring-primary/10 outline-none transition-all duration-200 font-semibold sm:font-bold text-gray-900 text-base sm:text-lg appearance-none shadow-sm focus:shadow-md touch-manipulation cursor-pointer ${className}`}
            dir={props.dir || 'rtl'}
          >
            <option value="" disabled>{'اختر من القائمة...'}</option>
            {Object.keys(groups).sort().map((governorate) => (
              <optgroup key={governorate} label={`📍 ${governorate}`}>
                {groups[governorate]
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <div className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-lg sm:text-xl font-bold">
            ▼
          </div>
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

SelectGrouped.displayName = 'SelectGrouped';
