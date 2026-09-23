import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface DashboardHeaderProps {
  title: React.ReactNode;
  subtitle: string;
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    primary?: boolean;
    icon?: string;
  }>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle, actions }) => {
  const router = useRouter();
  const pathSegments = router.pathname.split('/').filter(p => p && p !== '[id]');

  const getBreadcrumbName = (segment: string) => {
    const map: Record<string, string> = {
      'citizen': 'المواطن',
      'municipality': 'البلدية',
      'admin': 'الإدارة',
      'report': 'تقديم بلاغ',
      'my-complaints': 'بلاغاتي',
      'complaints': 'البلاغات',
      'performance': 'الأداء',
      'users': 'المستخدمين',
      'audit-logs': 'سجل الأنشطة',
      'profile': 'الملف الشخصي'
    };
    return map[segment] || segment;
  };

  return (
    <div className="mb-12 space-y-6">
      
      <nav className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-[10px] font-cairo font-bold uppercase tracking-[0.2em] text-gray-500 sm:text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors duration-200">الرئيسية</Link>
        {pathSegments.map((segment, idx) => (
          <React.Fragment key={idx}>
            <span className="text-gray-300 mx-1">/</span>
            <span className={idx === pathSegments.length - 1 ? 'text-primary font-black' : 'hover:text-gray-600 transition-colors'}>
              {getBreadcrumbName(segment)}
            </span>
          </React.Fragment>
        ))}
      </nav>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 bg-white p-6 sm:p-8 lg:p-10 rounded-[30px] sm:rounded-[38px] lg:rounded-[45px] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-primary/5 rounded-full -mr-32 -mt-32 sm:-mr-40 sm:-mt-40 transition-all duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-cairo font-black text-gray-900 leading-tight tracking-tighter uppercase break-words">
            {title}
          </h1>
          <p className="text-gray-700 sm:text-gray-600 mt-2 sm:mt-3 font-cairo font-semibold text-base sm:text-lg italic leading-[1.8]">{subtitle}</p>
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto relative z-10">
            {actions.map((action, idx) => {
              const className = action.primary
                ? "flex-1 lg:flex-none bg-primary text-white px-6 py-3.5 sm:px-10 sm:py-5 rounded-[18px] sm:rounded-[22px] font-black shadow-xl sm:shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base min-h-[44px] touch-manipulation"
                : "flex-1 lg:flex-none bg-white text-gray-700 border-2 border-gray-100 px-6 py-3.5 sm:px-10 sm:py-5 rounded-[18px] sm:rounded-[22px] font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base min-h-[44px] touch-manipulation";

              if (action.href) {
                return (
                  <Link key={idx} href={action.href} className={className}>
                    <span className="truncate">{action.label}</span>
                    {action.icon && <span className={`${action.primary ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"} flex-shrink-0`}>{action.icon}</span>}
                  </Link>
                );
              }

              return (
                <button key={idx} onClick={action.onClick} className={className}>
                  <span className="truncate">{action.label}</span>
                  {action.icon && <span className={`${action.primary ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"} flex-shrink-0`}>{action.icon}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
