import React from 'react';
import { Navbar } from '../components/common/Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          {children}
        </div>
      </main>
      
      <footer className="bg-slate-50 border-t border-slate-200 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-cairo font-black text-white text-lg shadow-sm">س</div>
              <span className="text-sm sm:text-base font-cairo font-black text-slate-950 tracking-tight">نظام البلاغات الوطني</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-cairo font-medium text-center sm:text-right">
              © {new Date().getFullYear()} وزارة الإدارة المحلية والبيئة - الجمهورية العربية السورية
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
