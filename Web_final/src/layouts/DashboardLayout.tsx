import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'citizen' | 'municipality' | 'admin';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user?.role !== role) {
        router.push(user?.role === 'citizen' ? '/citizen' : `/${user?.role}`);
      }
    }
  }, [isAuthenticated, isLoading, user, role, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const menuItems = {
    citizen: [
      { name: 'الرئيسية الرقمية', path: '/citizen', icon: '🏠' },
      { name: 'بلاغ ميداني جديد', path: '/citizen/report', icon: '✍️' },
      { name: 'سجل البلاغات', path: '/citizen/my-complaints', icon: '📁' },
      { name: 'الملف الشخصي', path: '/profile', icon: '👤' },
    ],
    municipality: [
      { name: 'الشكاوى الواردة', path: '/municipality', icon: '📥' },
      { name: 'ملف الإنجاز', path: '/municipality/performance', icon: '📊' },
      { name: 'الملف الشخصي', path: '/profile', icon: '👤' },
    ],
    admin: [
      { name: 'إحصائيات النظام', path: '/admin', icon: '🌐' },
      { name: 'إدارة الشكاوى', path: '/admin/complaints', icon: '📋' },
      { name: 'الشكاوى المحلولة', path: '/admin/resolved-complaints', icon: '✅' },
      { name: 'إدارة الكوادر', path: '/admin/users', icon: '👥' },
      { name: 'سجل الأنشطة', path: '/admin/audit-logs', icon: '🛡️' },
      { name: 'الملف الشخصي', path: '/profile', icon: '👤' },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-white border-l border-gray-100 transition-all duration-500 hidden md:block relative z-40 shadow-xl`}>
          <div className="p-8 space-y-4">
            <div className="mb-12 px-6 py-3 bg-primary/5 rounded-[22px] border border-primary/10">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">لوحة التحكم الرئيسية</p>
            </div>
            {currentMenu.map((item) => {
              const isActive = router.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-5 p-5 rounded-[25px] transition-all duration-500 group relative ${
                    isActive 
                    ? 'bg-primary text-white shadow-[0_20px_40px_-10px_rgba(0,82,204,0.3)] scale-[1.05] z-10' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-500 group-hover:scale-125 ${isActive ? 'filter brightness-0 invert' : ''}`}>{item.icon}</span>
                  {isSidebarOpen && <span className="font-black text-[13px] uppercase tracking-tighter">{item.name}</span>}
                  {isActive && (
                    <div className="absolute left-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
            
            <div className="pt-12 mt-12 border-t border-gray-50">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-5 p-5 rounded-[25px] transition-all duration-500 text-red-500 hover:bg-red-50 group border border-transparent hover:border-red-100"
              >
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-500">🚪</span>
                {isSidebarOpen && <span className="font-black text-[13px] uppercase tracking-tighter">إنهاء الجلسة</span>}
              </button>
            </div>
          </div>

          
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="absolute -left-4 top-12 w-10 h-10 bg-white border border-gray-100 rounded-2xl shadow-2xl flex items-center justify-center text-xs hover:bg-primary hover:text-white transition-all z-50 transform hover:scale-110 active:scale-95"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </aside>
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8 md:p-12 lg:p-20 relative">
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
