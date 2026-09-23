import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { complaintService } from '@/services/complaintService';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardHeader } from '@/components/ui/DashboardHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '@/services/api';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [stats, setStats] = useState([
    { label: 'إجمالي الشكاوى', value: '0', color: 'bg-blue-500', icon: '📄', trend: 'جميع البلاغات' },
    { label: 'قيد المعالجة', value: '0', color: 'bg-amber-500', icon: '⏳', trend: 'تحت المتابعة' },
    { label: 'تم الحل بنجاح', value: '0', color: 'bg-green-500', icon: '✅', trend: 'خدمات مكتملة' },
    { label: 'المسودات', value: '0', color: 'bg-gray-400', icon: '📝', trend: 'غير مرسلة بعد' },
  ]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);

  const handleQuickTrack = () => {
    if (!trackingNumber.trim()) {
      toast.error('يرجى إدخال رقم البلاغ');
      return;
    }
    const num = trackingNumber.trim().replace('#', '');
    router.push(`/citizen/complaints/${num}`);
  };

  const handleTrackKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleQuickTrack();
    }
  };

  const handleDownloadGuide = async () => {
    const confirmMessage = 'سيتم الآن تحميل ملف دليل المواطن بصيغة PDF\n\nهل تريد المتابعة؟';
    const userConfirmed = window.confirm(confirmMessage);
    
    if (!userConfirmed) {
      toast('تم إلغاء عملية التحميل', { icon: 'ℹ️' });
      return;
    }

    toast.loading('جاري تحميل الدليل...', { id: 'downloading-guide' });
    
    try {
      const guideHTML = `
        <div dir="rtl" style="font-family: 'Arial', 'Tahoma', sans-serif; padding: 40px; width: 800px; background: white; direction: rtl; text-align: right;">
          <h1 style="text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0047AB;">دليل المواطن</h1>
          <h2 style="text-align: center; font-size: 18px; font-weight: normal; margin-bottom: 30px; color: #666;">البوابة البلدية الموحدة</h2>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #0047AB; margin-bottom: 15px;">كيفية تقديم البلاغات:</h2>
            <ol style="font-size: 14px; line-height: 2; color: #555; padding-right: 20px;">
              <li style="margin-bottom: 8px;">اختر نوع البلاغ (مياه، كهرباء، طرق، نظافة، بناء، أو أخرى)</li>
              <li style="margin-bottom: 8px;">حدد الموقع على الخريطة</li>
              <li style="margin-bottom: 8px;">اكتب وصفاً مفصلاً للمشكلة</li>
              <li style="margin-bottom: 8px;">أرفق صوراً توثيقية (اختياري)</li>
              <li style="margin-bottom: 8px;">راجع البيانات وأرسل البلاغ</li>
            </ol>
          </div>
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #0047AB; margin-bottom: 15px;">كيفية متابعة البلاغ:</h2>
            <ul style="font-size: 14px; line-height: 2; color: #555; padding-right: 20px;">
              <li style="margin-bottom: 8px;">استخدم رقم البلاغ لمتابعة الحالة</li>
              <li style="margin-bottom: 8px;">يمكنك تحميل إيصال المراجعة في أي وقت</li>
              <li style="margin-bottom: 8px;">ستتلقى تحديثات فورية عن حالة البلاغ</li>
            </ul>
          </div>
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #0047AB; margin-bottom: 15px;">معايير قبول البلاغات:</h2>
            <ul style="font-size: 14px; line-height: 2; color: #555; padding-right: 20px;">
              <li style="margin-bottom: 8px;">يجب أن تكون المشكلة حقيقية وموثقة</li>
              <li style="margin-bottom: 8px;">يجب تحديد الموقع بدقة</li>
              <li style="margin-bottom: 8px;">يجب تقديم وصف مفصل للمشكلة</li>
            </ul>
          </div>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 14px; font-weight: bold; color: #0047AB; margin-top: 30px;">للمزيد من المعلومات، يرجى التواصل مع مركز الخدمة: 1950</p>
          <p style="font-size: 11px; color: #888; text-align: center; margin-top: 40px;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SY')}</p>
        </div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.innerHTML = guideHTML;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `دليل_المواطن_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.dismiss('downloading-guide');
      toast.success('تم تحميل دليل المواطن بنجاح 📥');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss('downloading-guide');
      toast.error('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await complaintService.getStats('citizen');
        setStats([
          { label: 'إجمالي الشكاوى', value: statsData.total.toString(), color: 'bg-blue-500', icon: '📄', trend: 'جميع البلاغات' },
          { label: 'قيد المعالجة', value: statsData.processing.toString(), color: 'bg-amber-500', icon: '⏳', trend: 'تحت المتابعة' },
          { label: 'تم الحل بنجاح', value: statsData.resolved.toString(), color: 'bg-green-500', icon: '✅', trend: 'خدمات مكتملة' },
          { label: 'المسودات', value: '0', color: 'bg-gray-400', icon: '📝', trend: 'غير مرسلة بعد' },
        ]);

        const complaints = await complaintService.getAll();
        setRecentComplaints(complaints.slice(0, 5));

        try {
          const citizensResponse = await api.get('/stats/citizens-count');
          const count = citizensResponse.data?.count || 0;
          console.log('Total citizens fetched:', count);
          setActiveUsersCount(count);
        } catch (error: any) {
          console.error('Error fetching citizens count:', error);
          setActiveUsersCount(0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { 
      header: 'رقم التتبع', 
      accessor: (item: any) => <span className="font-mono text-xs font-black text-gray-400">#{item.id}</span> 
    },
    { 
      header: 'عنوان البلاغ', 
      accessor: (item: any) => (
        <div>
          <p className="font-black text-gray-800 text-sm group-hover:text-primary transition-colors">{item.title}</p>
          <span className="block text-[10px] text-gray-400 mt-1 uppercase">قطاع: {item.category}</span>
        </div>
      )
    },
    { 
      header: 'الحالة', 
      accessor: (item: any) => <StatusBadge type="status" value={item.status} /> 
    },
    { 
      header: 'التاريخ', 
      accessor: (item: any) => <span className="text-xs text-gray-400 font-bold">{new Date(item.created_at).toLocaleDateString('ar-SY')}</span> 
    },
    { 
      header: '', 
      accessor: (item: any) => (
        <Link href={`/citizen/complaints/${item.id}`}>
          <Button variant="ghost" size="sm">👁️</Button>
        </Link>
      ),
      className: "text-left"
    }
  ];

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          title={<>مرحباً بك، <span className="text-primary">{user?.name?.split(' ')[0] || 'أحمد'}</span> 👋</>}
          subtitle="أنت الآن في بوابة الخدمات البلدية الموحدة. كيف يمكننا مساعدتك اليوم؟"
          actions={[
            { label: 'تقديم بلاغ جديد', href: '/citizen/report', primary: true, icon: '✍️' },
            { label: 'متابعة بلاغاتي', href: '/citizen/my-complaints', icon: '🔍' }
          ]}
        />

        
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
           <Card className="md:col-span-2 !bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden group border-none shadow-2xl">
              <div className="absolute inset-0">
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm border border-primary/30">💡</div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">هل تعلم؟</h3>
                  </div>
                  <p className="text-gray-300 text-base lg:text-lg leading-relaxed max-w-2xl font-medium">يمكنك تتبع حالة بلاغك في أي وقت عبر الرقم المرجعي الذي يصلك في رسالة نصية فور تقديم الشكوى. نظامنا يعمل على مدار الساعة لضمان متابعة مستمرة.</p>
                </div>
                <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm border-2 border-primary/30 flex items-center justify-center text-xs font-black shadow-lg hover:scale-110 transition-transform">
                            {i}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">المستخدمون المسجلون</p>
                        <p className="text-lg font-black text-white">
                          {loading ? '...' : activeUsersCount > 0 ? activeUsersCount.toLocaleString('ar-SA') : 'غير متاح'}
                        </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full border border-primary/30 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">نظام نشط</span>
                   </div>
                </div>
              </div>
           </Card>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          <div className="lg:col-span-2">
            <Card 
              title="آخر البلاغات المقدمة" 
              headerAction={<Link href="/citizen/my-complaints" className="text-primary text-[10px] font-black uppercase tracking-widest">عرض السجل الكامل</Link>}
              noPadding
            >
              <DataTable 
                columns={columns} 
                data={recentComplaints} 
                isLoading={loading}
                emptyMessage="لا توجد بلاغات مقدمة حتى الآن"
              />
            </Card>
          </div>

          
          <div className="space-y-8">
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">🔍</div>
                  <h3 className="text-xl font-black text-gray-900">تتبع سريع</h3>
                </div>
                <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">أدخل رقم التتبع الخاص بشكواك لمعرفة حالتها فوراً.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="أدخل رقم البلاغ..." 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onKeyPress={handleTrackKeyPress}
                    className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-400"
                  />
                  <Button 
                    size="lg" 
                    className="!px-6 !rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform"
                    onClick={handleQuickTrack}
                  >
                    ←
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="!bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group border-none shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-125 transition-transform duration-700"></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm border border-primary/30">📖</div>
                  <h3 className="text-xl font-black text-white">هل تحتاج لإرشاد؟</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-8 font-medium">
                  تعرف على معايير قبول الشكاوى وكيفية متابعتها لضمان وصول صوتك للجهة المعنية بأسرع وقت.
                </p>
                <Button 
                  variant="outline" 
                  className="!bg-white !text-slate-900 border-none w-full hover:!scale-105 transition-transform shadow-lg !font-bold" 
                  size="lg"
                  onClick={handleDownloadGuide}
                >
                  تحميل دليل المواطن 📥
                </Button>
              </div>
            </Card>

            <Card className="!bg-gradient-to-br from-primary/5 to-blue-50/50 border-2 border-primary/20 hover:border-primary/30 transition-all shadow-sm hover:shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-primary/20">📢</div>
                <h3 className="text-xl font-black text-primary">تنبيهات هامة</h3>
              </div>
              <div className="space-y-5">
                 <div className="flex gap-4 p-4 bg-white/50 rounded-xl border border-primary/10 hover:border-primary/20 transition-all group/item">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse group-hover/item:scale-150 transition-transform"></div>
                    <p className="text-sm text-gray-700 font-bold leading-relaxed flex-1">سيتم إجراء صيانة دورية لشبكة المياه في منطقة المزة غداً من الساعة 10 صباحاً.</p>
                 </div>
                 <div className="flex gap-4 p-4 bg-white/50 rounded-xl border border-primary/10 hover:border-primary/20 transition-all group/item">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse group-hover/item:scale-150 transition-transform"></div>
                    <p className="text-sm text-gray-700 font-bold leading-relaxed flex-1">بإمكانك الآن تقديم شكاوى التعديات على الأرصفة عبر النظام الموحد.</p>
                 </div>
                 <div className="flex gap-4 p-4 bg-white/50 rounded-xl border border-primary/10 hover:border-primary/20 transition-all group/item">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0 animate-pulse group-hover/item:scale-150 transition-transform"></div>
                    <p className="text-sm text-gray-700 font-bold leading-relaxed flex-1">تم تحديث نظام التتبع الرقمي - يمكنك الآن متابعة بلاغاتك بشكل مباشر.</p>
                 </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
