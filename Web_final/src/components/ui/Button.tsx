import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-cairo font-black transition-all duration-300 transform active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none tracking-tightest uppercase touch-manipulation min-h-[44px] sm:min-h-auto focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_20px_40px_-10px_rgba(0,71,187,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,71,187,0.5)] hover:bg-primary-600 hover:-translate-y-1",
    secondary: "bg-slate-950 text-white shadow-[0_20px_40px_-10px_rgba(2,6,23,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(2,6,23,0.4)] hover:bg-black hover:-translate-y-1",
    outline: "bg-white/50 backdrop-blur-md text-slate-900 border-2 border-slate-100 hover:border-primary hover:text-primary hover:bg-white hover:shadow-xl hover:-translate-y-1",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-primary",
    danger: "bg-red-500 text-white shadow-[0_20px_40px_-10px_rgba(239,68,68,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(239,68,68,0.4)] hover:bg-red-600 hover:-translate-y-1",
    success: "bg-secondary text-white shadow-[0_20px_40px_-10px_rgba(0,135,90,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,135,90,0.4)] hover:bg-secondary-600 hover:-translate-y-1",
    white: "bg-white text-slate-950 shadow-2xl shadow-white/10 hover:bg-gray-50 hover:-translate-y-1",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-xs sm:px-5 sm:py-3 rounded-xl font-bold",
    md: "px-6 py-3.5 text-sm sm:px-8 sm:py-4 rounded-[18px] sm:rounded-[20px] font-black",
    lg: "px-8 py-4.5 text-base sm:px-10 sm:py-5.5 rounded-[20px] sm:rounded-[24px] font-black",
    xl: "px-10 py-5.5 text-lg sm:px-14 sm:py-7.5 sm:text-xl rounded-[24px] sm:rounded-[30px] font-black",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`group ${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"></div>
      ) : (
        <>
          {rightIcon && <span className="mr-2 sm:mr-3 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0">{rightIcon}</span>}
          <span className="relative z-10 whitespace-nowrap">{children}</span>
          {leftIcon && <span className="ml-2 sm:ml-3 transition-transform duration-300 group-hover:-translate-x-1 flex-shrink-0">{leftIcon}</span>}
        </>
      )}
    </button>
  );
};
