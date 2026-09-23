import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
              <div className="bg-primary w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <span className="text-white text-xl sm:text-2xl font-cairo font-black">س</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-cairo font-black text-slate-950 block leading-none tracking-tight">البوابة البلدية</span>
                <span className="text-[10px] sm:text-[11px] text-gray-500 font-cairo font-semibold uppercase tracking-wider block mt-0.5">SOVEREIGN PORTAL</span>
              </div>
            </Link>
          </div>
          
          
          <div className="hidden lg:flex items-center gap-8 xl:gap-12">
            {[
              { label: 'الرئيسية', path: '/' },
              { label: 'بوابة الشفافية', path: '/transparency' },
            ].map(link => (
              <Link 
                key={link.path}
                href={link.path} 
                className={`text-sm font-cairo font-semibold transition-colors duration-200 relative ${
                  router.pathname === link.path 
                    ? 'text-primary' 
                    : 'text-gray-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {router.pathname === link.path && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-primary rounded-full"></span>
                )}
              </Link>
            ))}
            {isAuthenticated && (
              <Link 
                href={user?.role === 'citizen' ? '/citizen' : `/${user?.role}`} 
                className="text-sm font-cairo font-semibold text-gray-600 hover:text-primary transition-colors duration-200"
              >
                لوحة التحكم
              </Link>
            )}
          </div>

          
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-9 h-9 flex flex-col justify-center items-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-all touch-manipulation"
            aria-label="القائمة"
          >
            <span className={`w-5 h-0.5 bg-slate-700 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-slate-700 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-slate-700 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>

          
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {!isAuthenticated ? (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-sm font-cairo font-semibold text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-slate-950 text-white px-6 py-2.5 xl:px-8 xl:py-3 rounded-lg font-cairo font-semibold text-sm hover:bg-primary transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  فتح حساب جديد
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4 xl:gap-6">
                <div className="flex items-center gap-3 group cursor-pointer touch-manipulation" onClick={() => router.push('/profile')}>
                   <div className="text-left hidden xl:block">
                     <p className="text-sm font-cairo font-semibold text-slate-950 leading-none">{user?.name}</p>
                     <p className="text-xs text-slate-500 font-cairo mt-0.5">
                       {user?.role === 'citizen' ? 'مواطن معتمد' : user?.role === 'admin' ? 'مدير نظام' : 'موظف حكومي'}
                     </p>
                   </div>
                   <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-lg bg-primary text-white flex items-center justify-center text-base xl:text-lg font-cairo font-bold shadow-md group-hover:shadow-lg transition-all duration-200">
                     {user?.name?.[0] || 'U'}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {[
                { label: 'الرئيسية', path: '/' },
                { label: 'بوابة الشفافية', path: '/transparency' },
              ].map(link => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-lg text-sm font-cairo font-semibold transition-all ${
                    router.pathname === link.path 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    href={user?.role === 'citizen' ? '/citizen' : `/${user?.role}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-4 rounded-lg text-sm font-cairo font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    لوحة التحكم
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-cairo font-semibold text-red-600 hover:bg-red-50 transition-all text-right"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-4 rounded-lg text-sm font-cairo font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-4 rounded-lg bg-slate-950 text-white text-sm font-cairo font-semibold hover:bg-primary transition-all text-center"
                  >
                    فتح حساب جديد
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
