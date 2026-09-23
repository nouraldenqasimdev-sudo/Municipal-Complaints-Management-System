import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

const loginSchema = z.object({
  phone: z.string().min(10, 'يرجى إدخال رقم هاتف صالح (10 أرقام على الأقل)'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await authService.login(data.phone, data.password, selectedRole);
      login(response.token, response.user, rememberMe);
      toast.success('تم تسجيل الدخول بنجاح! مرحباً بك في البوابة الوطنية.');
      if (selectedRole === 'citizen') router.push('/citizen');
      else if (selectedRole === 'municipality') router.push('/municipality');
      else if (selectedRole === 'admin') router.push('/admin');
    } catch (error: any) {
      const message = error.response?.data?.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات الرسمية';
      toast.error(message);
    }
  };

  return (
    <AuthSplitLayout
      title="بوابة الولوج الموحدة"
      subtitle="يرجى اختيار نوع الحساب والتحقق من بيانات الدخول السيادية الخاصة بك."
      leftSideContent={{
        heading: <>السيادة <br/> <span className="text-primary">الرقمية</span> <br/> للوطن</>,
        description: "نظام سيادي موحد يربط المواطن بمؤسسات الدولة عبر بنية تحتية رقمية آمنة، مشفرة، وشفافة بالكامل.",
        stats: [
          { value: '1.2M+', label: 'بلاغ معالج رقمياً' },
          { value: '150+', label: 'بلدية ومجلس مدينة' }
        ],
        theme: 'dark'
      }}
    >
      <div className="w-full max-w-xl mx-auto space-y-6 sm:space-y-8">
        
        <div className="grid grid-cols-3 gap-3 p-2 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'citizen', label: 'مواطن', icon: '👤', color: 'from-blue-500 to-blue-600' },
            { id: 'municipality', label: 'موظف', icon: '🏢', color: 'from-slate-500 to-slate-600' },
            { id: 'admin', label: 'مدير', icon: '🛡️', color: 'from-purple-500 to-purple-600' },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id as UserRole)}
              type="button"
              className={`flex flex-col items-center justify-center py-4 sm:py-5 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                selectedRole === role.id 
                  ? 'bg-white text-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/70 hover:shadow-md'
              }`}
            >
              {selectedRole === role.id && (
                <>
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary to-primary-600 rounded-l-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                </>
              )}
              <div className={`relative z-10 text-2xl sm:text-3xl mb-2 transition-all duration-300 ${selectedRole === role.id ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
                {role.icon}
              </div>
              <span className={`relative z-10 text-xs sm:text-sm font-cairo font-bold transition-colors duration-300 ${selectedRole === role.id ? 'text-primary' : ''}`}>{role.label}</span>
              {selectedRole === role.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative group">
            <Input
              {...register('phone')}
              label="رقم الهاتف الجوال (الرسمي)"
              placeholder="09xxxxxxxx"
              icon="📱"
              error={errors.phone?.message}
              className="!rounded-xl !py-5 !text-base transition-all duration-300 group-focus-within:ring-2 group-focus-within:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <Input
                {...register('password')}
                type="password"
                label="كلمة المرور السرية"
                placeholder="••••••••"
                icon="🔒"
                error={errors.password?.message}
                className="!rounded-xl !py-5 !text-base transition-all duration-300 group-focus-within:ring-2 group-focus-within:ring-primary/20"
              />
            </div>
            <div className="flex justify-end pr-2">
              <Link href="/auth/forgot-password" className="text-xs sm:text-sm text-primary hover:text-primary-600 font-cairo font-semibold transition-all duration-300">
                هل نسيت كلمة السر؟
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-300">
            <label className="flex items-center gap-3 cursor-pointer group/toggle">
              <div className="relative flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className={`w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${
                  rememberMe 
                    ? 'bg-gradient-to-r from-primary to-primary-600' 
                    : 'bg-gray-200'
                }`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg ${
                  rememberMe 
                    ? 'translate-x-6 shadow-primary/30' 
                    : ''
                }`}></div>
              </div>
              <span className="text-xs sm:text-sm font-cairo font-semibold text-gray-600 group-hover/toggle:text-slate-950 transition-colors">
                تذكر بيانات الدخول الموحدة
              </span>
            </label>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            fullWidth
            size="lg"
            className="!rounded-xl !py-5 !text-base sm:!text-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-bold relative overflow-hidden group"
            rightIcon={<span className="text-lg group-hover:translate-x-[-2px] transition-transform duration-300">←</span>}
          >
            <span className="relative z-10">دخول بصفتي {selectedRole === 'citizen' ? 'مواطن' : selectedRole === 'municipality' ? 'موظف' : 'مدير نظام'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Button>
        </form>

        {selectedRole === 'citizen' && (
          <div className="pt-8 text-center border-t border-slate-200 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <p className="text-sm text-gray-600 font-cairo font-semibold mb-4">
              لا تملك حساباً سيادياً معتمداً؟
            </p>
            <Link href="/auth/register" className="block group">
               <Button variant="outline" fullWidth size="md" className="!rounded-xl !border-slate-300 hover:!border-primary hover:!bg-primary hover:!text-white hover:!shadow-lg hover:!shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                 <span className="relative z-10">فتح حساب مواطن جديد ✨</span>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
               </Button>
            </Link>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
}
