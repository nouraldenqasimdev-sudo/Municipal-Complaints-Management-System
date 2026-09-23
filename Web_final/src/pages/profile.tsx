import React from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';

export default function ProfilePage() {
  const { user } = useAuth();

  const handleUpdate = () => {
    toast.success('سيتم تفعيل تعديل البيانات قريباً');
  };

  return (
    <DashboardLayout role={user?.role || 'citizen'}>
      <DashboardHeader 
        title="الملف الشخصي والحساب الرسمي 👤"
        subtitle="إدارة بياناتك الشخصية الموثقة، وإعدادات الأمان والخصوصية الخاصة بك."
      />
        
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-10">
          <Card className="!p-0 border-none shadow-2xl relative overflow-hidden" noPadding>
            <div className="h-56 bg-gradient-to-br from-primary via-blue-600 to-blue-400 relative">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="px-12 pb-12 relative">
              <div className="relative -mt-24 mb-10">
                <div className="w-40 h-40 rounded-[45px] bg-white p-3 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] relative group">
                  <div className="w-full h-full rounded-[35px] bg-gray-50 flex items-center justify-center text-6xl relative overflow-hidden shadow-inner">
                    {user?.role === 'citizen' ? '👤' : '🏢'}
                    <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer backdrop-blur-sm">
                       <span className="text-white text-[10px] font-black uppercase tracking-widest">تحديث الصورة</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 border-[6px] border-white rounded-2xl shadow-xl animate-float"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pr-1">الاسم الكامل (المعتمد)</label>
                  <p className="text-xl font-black text-gray-900 border-b-2 border-gray-50 pb-4 tracking-tighter uppercase">{user?.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pr-1">الرقم الوطني السوري</label>
                  <p className="text-xl font-mono font-black text-gray-900 border-b-2 border-gray-50 pb-4 tracking-[0.2em]">{user?.national_id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pr-1">رقم الهاتف الموثق</label>
                  <p className="text-xl font-black text-gray-900 border-b-2 border-gray-50 pb-4" dir="ltr">{user?.phone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pr-1">المحافظة / النطاق الجغرافي</label>
                  <p className="text-xl font-black text-gray-900 border-b-2 border-gray-50 pb-4">
                    {user?.role === 'municipality' 
                      ? (user?.municipality?.governorate || 'غير محدد')
                      : (user?.governorate || 'غير محدد')
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        
        <div className="space-y-10">
          <Card className="!bg-gray-900 text-white border-none !p-12 relative overflow-hidden group shadow-2xl" noPadding>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="text-2xl font-black mb-10 tracking-tighter uppercase border-b border-white/5 pb-6">نشاط الحساب 📈</h3>
            <div className="space-y-10">
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-3">تاريخ الانضمام الرسمي</p>
                <p className="text-lg font-black tracking-tight">12 أيار، 2023</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-3">إجمالي التفاعلات الحكومية</p>
                <p className="text-5xl font-black text-primary tracking-tighter">42</p>
              </div>
              <div className="pt-10 mt-10 border-t border-white/5">
                 <p className="text-[11px] text-gray-500 font-bold leading-relaxed italic">
                   هذا الحساب موثق رسمياً بالرقم الوطني السوري وخاضع لكافة سياسات الاستخدام والأمان الحكومية المعمول بها.
                 </p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
