import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/layouts/MainLayout';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  leftSideContent: {
    heading: React.ReactNode;
    description: string;
    stats?: { value: string; label: string }[];
    features?: { icon: string; title: string; description: string }[];
    theme?: 'dark' | 'primary';
  };
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  leftSideContent 
}) => {
  const isDark = leftSideContent.theme === 'dark' || !leftSideContent.theme;

  return (
    <MainLayout>
      <div className={`min-h-[calc(100vh-96px)] flex items-stretch overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-primary'}`}>
        
        <div className={`hidden lg:flex ${isDark ? 'lg:w-[45%]' : 'lg:w-[40%]'} relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-white`}>
          
          <div className={`absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/${isDark ? 'cubes' : 'carbon-fibre'}.png')]`}></div>
          <div className={`absolute ${isDark ? 'top-0 right-0 w-[800px] h-[800px] bg-primary/15' : '-bottom-40 -left-40 w-[700px] h-[700px] bg-white/10'} rounded-full blur-[150px] ${isDark ? '-mr-[400px] -mt-[400px]' : ''} animate-pulse-slow`}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-4 mb-12 group animate-in fade-in slide-in-from-right duration-700">
              <div className="bg-white p-3 rounded-xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center font-black ${isDark ? 'text-slate-950' : 'text-primary'} text-xl shadow-sm`}>س</div>
              </div>
              <div className="text-right">
                <span className="text-lg font-cairo font-black tracking-tight block group-hover:text-primary transition-colors duration-300">العودة للرئيسية</span>
                <span className="text-xs font-cairo font-semibold opacity-70 uppercase tracking-wider block mt-1">Sovereign Portal</span>
              </div>
            </Link>
            
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right duration-700 delay-200">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-cairo font-black leading-[1.1] tracking-tightest text-white">
                {leftSideContent.heading}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/80 font-cairo font-semibold leading-relaxed max-w-lg">
                {leftSideContent.description}
              </p>
            </div>
          </div>

          <div className="relative z-10 animate-in fade-in slide-in-from-right duration-700 delay-300">
            {leftSideContent.stats && (
              <div className="grid grid-cols-2 gap-8">
                {leftSideContent.stats.map((s, i) => (
                  <div key={i} className="group cursor-default">
                    <div className="relative">
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-cairo font-black text-white mb-2 tracking-tightest group-hover:text-primary transition-colors duration-300 leading-none relative z-10">
                        {s.value}
                      </p>
                      <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 font-cairo font-semibold leading-relaxed group-hover:text-white/90 transition-colors duration-300">{s.label}</p>
                    <div className="w-10 h-1 bg-white/20 rounded-full group-hover:w-20 group-hover:bg-primary transition-all duration-500 mt-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/50 rounded-full translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {leftSideContent.features && (
              <div className="space-y-6">
                {leftSideContent.features.map((f, i) => (
                  <div key={i} className="flex gap-4 items-center group cursor-default">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg group-hover:bg-white group-hover:text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 border border-white/20 relative z-10">
                        {f.icon}
                      </div>
                      <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="font-cairo font-black text-base sm:text-lg group-hover:text-white transition-colors duration-200">{f.title}</p>
                      <p className="text-xs sm:text-sm text-white/70 font-cairo font-medium leading-relaxed group-hover:text-white/80 transition-colors duration-200">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          
          <div className="absolute bottom-8 left-8 opacity-5 pointer-events-none animate-pulse-slow">
             <span className="text-[120px] font-black tracking-tightest select-none leading-none">SY</span>
          </div>
        </div>

        
        <div className={`w-full ${isDark ? 'lg:w-[55%]' : 'lg:w-[60%]'} flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20 bg-white relative overflow-y-auto`}>
          
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,rgba(0,71,187,0.03)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_left,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
          
          <div className="w-full max-w-2xl relative z-10 py-8">
            <div className="mb-10 sm:mb-12 lg:mb-14 text-center lg:text-right space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cairo font-black text-slate-950 tracking-tightest leading-[1.1] relative">
                {title}
                <div className="absolute -bottom-2 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-700 font-cairo font-semibold leading-relaxed max-w-xl mx-auto lg:mx-0 lg:mr-0">
                {subtitle}
              </p>
            </div>
            <div className="animate-in fade-in slide-in-from-left duration-700 delay-200">
              {children}
            </div>
            
            
            <div className="mt-20 sm:mt-24 lg:mt-32 pt-12 sm:pt-14 lg:pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-10 opacity-50 sm:opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
               <div className="flex items-center gap-4 sm:gap-6 text-[12px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-ultra-wide text-center md:text-right">
                  <span className="text-2xl sm:text-3xl flex-shrink-0">🛡️</span>
                  <span className="leading-tight">End-to-End Encrypted National Service</span>
               </div>
               <div className="hidden md:block w-24 lg:w-32 h-px bg-slate-200"></div>
               <div className="text-[11px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-ultra-wide text-slate-500 sm:text-slate-400 text-center md:text-left">Government Standard Security Protocol 2.9</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
