import React, { useEffect } from 'react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children,
  maxWidth = 'max-w-2xl'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-label="إغلاق النافذة"
      ></div>
      <Card 
        className={`w-full ${maxWidth} !p-6 sm:!p-8 lg:!p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-none relative overflow-hidden animate-in zoom-in duration-300 z-10 my-auto max-h-[90vh] overflow-y-auto`}
        noPadding
      >
        <button 
          onClick={onClose} 
          className="absolute left-4 top-4 sm:left-8 sm:top-8 text-gray-400 hover:text-gray-900 active:text-gray-700 text-2xl sm:text-3xl font-black transition-colors duration-200 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
          aria-label="إغلاق"
        >
          ×
        </button>
        <div className="mb-8 sm:mb-10 lg:mb-12 relative z-10 pr-8 sm:pr-12">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-cairo font-black text-gray-900 tracking-tighter uppercase mb-2 leading-tight">{title}</h3>
          {subtitle && <p className="text-gray-600 sm:text-gray-500 text-[12px] sm:text-[11px] font-cairo font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em]">{subtitle}</p>}
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    </div>
  );
};

