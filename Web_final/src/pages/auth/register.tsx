import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

const registerSchema = z.object({
  full_name: z.string().min(10, 'يرجى إدخال الاسم الثلاثي كما في الهوية الشخصية'),
  id_number: z.string().length(11, 'الرقم الوطني يجب أن يتكون من 11 رقم'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام'),
  governorate: z.string().min(1, 'يرجى اختيار المحافظة'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتتضمن أرقاماً'),
  confirm_password: z.string()
}).refine((data) => data.confirm_password === data.password, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirm_password"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const governorates = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'درعا', 'السويداء', 'القنيطرة'
];

export default function Register() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authService.register(data);
      toast.success('تم إنشاء الحساب بنجاح! يمكنك الآن الولوج للنظام الموحد.');
      router.push('/auth/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'فشل في إنشاء الحساب، يرجى التحقق من البيانات الرسمية';
      toast.error(message);
    }
  };

  return (
    <AuthSplitLayout
      title="فتح حساب مواطن معتمد"
      subtitle="يرجى ملء كافة البيانات الرسمية بدقة لضمان تفعيل هويتك الرقمية السيادية."
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                {...register('full_name')}
                label="الاسم الثلاثي الكامل (كما في الهوية)"
                placeholder="الاسم الثلاثي المعتمد..."
                error={errors.full_name?.message}
                rightLabel="مثال: محمد أحمد علي"
                className="!rounded-xl !py-5 !text-base"
              />
            </div>

            <Input
              {...register('id_number')}
              label="الرقم الوطني السوري (11 رقم)"
              placeholder="00000000000"
              error={errors.id_number?.message}
              className="!rounded-xl !py-5 font-mono !text-base"
              dir="ltr"
            />

            <Input
              {...register('phone')}
              label="رقم الهاتف الجوال الرسمي"
              placeholder="09xxxxxxxx"
              error={errors.phone?.message}
              className="!rounded-xl !py-5 font-mono !text-base"
              dir="ltr"
            />

            <div className="md:col-span-2">
              <Select
                {...register('governorate')}
                label="المحافظة أو النطاق الجغرافي"
                error={errors.governorate?.message}
                options={governorates.map(gov => ({ value: gov, label: gov }))}
                className="!rounded-xl !py-5 !text-base"
              />
            </div>

            <Input
              {...register('password')}
              type="password"
              label="كلمة المرور الجديدة"
              placeholder="••••••••"
              error={errors.password?.message}
              className="!rounded-xl !py-5 !text-base"
            />

            <Input
              {...register('confirm_password')}
              type="password"
              label="تأكيد كلمة المرور"
              placeholder="••••••••"
              error={errors.confirm_password?.message}
              className="!rounded-xl !py-5 !text-base"
            />
          </div>

          <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 group">
            <input type="checkbox" required className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer flex-shrink-0 transition-all duration-300 group-hover:border-primary" />
            <p className="text-sm text-slate-700 leading-relaxed font-cairo font-semibold group-hover:text-slate-900 transition-colors">
              أقر بصحة البيانات المدخلة وبأنها مطابقة لسجلات السجل المدني السوري، كما أوافق على كافة سياسات الخصوصية وشروط استخدام المنصة الحكومية الموحدة.
            </p>
          </div>

          <Button 
            type="submit"
            isLoading={isSubmitting} 
            fullWidth
            size="lg"
            className="!rounded-xl !py-5 !text-base sm:!text-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-bold relative overflow-hidden group"
            rightIcon={<span className="text-lg group-hover:rotate-12 transition-transform duration-300">✨</span>}
          >
            <span className="relative z-10">تفعيل حساب المواطن الآن</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Button>
        </form>

        <div className="pt-8 text-center border-t border-slate-200 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <p className="text-sm text-gray-600 font-cairo font-semibold mb-4">
            تملك حساباً سيادياً بالفعل؟
          </p>
          <Link href="/auth/login" className="block group">
            <Button variant="outline" fullWidth size="md" className="!rounded-xl !border-slate-300 hover:!border-primary hover:!bg-primary hover:!text-white hover:!shadow-lg hover:!shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
              <span className="relative z-10">تسجيل الدخول للنظام الموحد</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Button>
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
