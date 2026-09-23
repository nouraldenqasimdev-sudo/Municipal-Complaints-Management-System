import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

interface ResolvedReport {
  id: number;
  title: string;
  category: string;
  municipality?: string;
  updated_at?: string;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stat[]>([
    { label: 'بلاغ تمت معالجته بنجاح', value: 'جاري التحميل...', icon: '✅', color: 'bg-secondary', trend: 'جاري التحميل...' },
    { label: 'وقت الاستجابة القياسي', value: 'جاري التحميل...', icon: '⏱️', color: 'bg-primary', trend: 'جاري التحميل...' },
    { label: 'بلدية ومجلس مدينة متصل', value: 'جاري التحميل...', icon: '🏢', color: 'bg-indigo-600' },
  ]);
  const [loading, setLoading] = useState(true);
  const [resolvedReports, setResolvedReports] = useState<ResolvedReport[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('🚀 Starting to fetch homepage stats...');
        setLoading(true);
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
        console.log('📡 API Base URL:', apiBaseUrl);
        
        console.log('📥 Fetching data from API endpoints...');
        const [statsRes, muniRes, adminStatsRes, resolvedLatestRes] = await Promise.allSettled([
          api.get('/stats/reports-category').catch((err) => {
            console.error('❌ Error fetching stats:', err);
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
              console.error('Network error - API server may be down');
            }
            return { data: [] };
          }),
          api.get('/municipalities').catch((err) => {
            console.error('❌ Error fetching municipalities:', err);
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
              console.error('Network error - API server may be down');
            }
            return { data: [] };
          }),
          api.get('/stats/public/admin').catch((err) => {
            console.error('❌ Error fetching public admin stats:', err);
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
              console.error('Network error - API server may be down');
            }
            return { data: null };
          }),
          api.get('/public/reports/resolved-latest').catch((err) => {
            console.error('❌ Error fetching latest resolved reports:', err);
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
              console.error('Network error - API server may be down');
            }
            return { data: [] };
          })
        ]);
        
        console.log('✅ All API requests completed:', {
          stats: statsRes.status,
          municipalities: muniRes.status,
          adminStats: adminStatsRes.status,
          resolvedLatest: resolvedLatestRes.status
        });
        
        let totalReports = 0;
        if (statsRes.status === 'fulfilled') {
          try {
            const categoryStats = statsRes.value.data || [];
            totalReports = categoryStats.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);
          } catch (err) {
            console.error('Error processing stats:', err);
          }
        }
        
        let avgResponseTime = 'غير متاح';
        try {
          if (adminStatsRes.status === 'fulfilled' && adminStatsRes.value?.data) {
            const adminStats = adminStatsRes.value.data as any;
            avgResponseTime = adminStats.avg_resolution_time || 'غير متاح';
            console.log('⏱️ Average response time from backend:', avgResponseTime);
          } else {
            console.warn('⚠️ Public admin stats not available, keeping default response time label');
          }
        } catch (err) {
          console.error('❌ Error reading response time from backend stats:', err);
        }
        
        let municipalitiesCount = 0;
        if (muniRes.status === 'fulfilled') {
          try {
            municipalitiesCount = muniRes.value.data?.length || 0;
          } catch (err) {
            console.error('Error processing municipalities:', err);
          }
        }
        if (resolvedLatestRes.status === 'fulfilled') {
          try {
            const list = resolvedLatestRes.value.data || [];
            setResolvedReports(list);
          } catch (err) {
            console.error('Error processing latest resolved reports:', err);
          }
        }

        
        let responseTimeValue = avgResponseTime;
        let responseTimeTrend = 'بيانات حية';

        if (!isAuthenticated) {
          responseTimeValue = 'سجّل الدخول لمعرفة متوسط سرعة الاستجابة';
          responseTimeTrend = 'متاح بعد تسجيل الدخول';
        } else if (
          !avgResponseTime ||
          avgResponseTime === 'غير متاح' ||
          avgResponseTime === 'لا توجد بيانات'
        ) {
          responseTimeValue = 'غير متاح حالياً';
          responseTimeTrend = 'لا توجد بيانات كافية بعد';
        }

        setStats([
          { 
            label: 'بلاغ تمت معالجته بنجاح', 
            value: totalReports > 0 ? totalReports.toLocaleString('ar-SA') : '0', 
            icon: '✅', 
            color: 'bg-secondary', 
            trend: 'بيانات حية' 
          },
          { 
            label: 'متوسط سرعة الاستجابة الميدانية', 
            value: responseTimeValue, 
            icon: '⏱️', 
            color: 'bg-primary', 
            trend: responseTimeTrend 
          },
          { 
            label: 'بلدية ومجلس مدينة متصل', 
            value: municipalitiesCount.toString(), 
            icon: '🏢', 
            color: 'bg-indigo-600' 
          },
        ]);
      } catch (error) {
        console.error('Error fetching homepage stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const features = [
    {
      title: 'الأمان والسيادة الرقمية',
      description: [
        'حماية كاملة لبيانات المواطنين',
        'عبر بنية تحتية وطنية مشفرة',
        'بمعايير عالمية'
      ],
      icon: '🛡️',
      color: 'bg-purple-600',
      badge: 'حماية سيادية'
    },
    {
      title: 'الشفافية المطلقة',
      description: [
        'بوابة مفتوحة تتيح للجمهور',
        'مراقبة أداء المؤسسات الخدمية',
        'ونسب الإنجاز الحقيقية'
      ],
      icon: '📊',
      color: 'bg-amber-500',
      badge: 'بيانات مفتوحة'
    },
    {
      title: 'التوثيق الجغرافي الدقيق',
      description: [
        'ربط البلاغات الميدانية بإحداثيات GPS',
        'لضمان وصول فرق الصيانة',
        'للموقع الصحيح'
      ],
      icon: '📍',
      color: 'bg-secondary',
      badge: 'تتبع مكاني'
    },
    {
      title: 'بوابة البلاغات الذكية',
      description: [
        'نظام سيادي موحد لتصنيف بلاغاتك',
        'وتوجيهها آلياً للجهة التنفيذية المختصة',
        'بدقة عالية'
      ],
      icon: '🧠',
      color: 'bg-primary',
      badge: 'الذكاء الاصطناعي'
    }
  ];

  return (
    <MainLayout>
      
      <div className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-900 via-slate-950 to-primary-950 text-white">
        
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] bg-primary/25 rounded-full blur-[120px] sm:blur-[150px] -mr-[300px] -mt-[300px] sm:-mr-[400px] sm:-mt-[400px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] bg-secondary/15 rounded-full blur-[100px] sm:blur-[120px] -ml-[250px] -mb-[250px] sm:-ml-[300px] sm:-mb-[300px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="text-right max-w-3xl mx-auto lg:mx-0">
            <div className="space-y-5 sm:space-y-6 lg:space-y-7">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cairo font-black leading-[1.1] sm:leading-[1.05] tracking-tightest text-white animate-in fade-in slide-in-from-right duration-1000">
                مستقبل <br />
                <span className="text-primary-300 drop-shadow-[0_4px_20px_rgba(0,71,187,0.4)]">الخدمات</span> <br />
                الرقمية
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 font-cairo font-medium leading-relaxed max-w-2xl animate-in fade-in slide-in-from-right duration-1000 delay-200">
                المنصة الوطنية الموحدة لتعزيز المشاركة الشعبية وضمان جودة الخدمات العامة عبر أرقى معايير التحول الرقمي السيادي.
              </p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-white py-12 sm:py-16 lg:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 space-y-4">
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-2xl shadow-lg border border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                ✨
              </div>
              <div className="text-right">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-cairo font-black text-slate-950 mb-1">
                  حقائق ميدانية
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-cairo font-semibold">
                  أحدث البلاغات التي تم حلّها ميدانياً على مستوى الجمهورية
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse h-[170px]" />
              ))
            ) : resolvedReports.length > 0 ? (
              resolvedReports.map((r, i) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-2 text-xs font-cairo font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                      <span>تم الحل</span>
                    </span>
                    {r.municipality && (
                      <span className="text-[10px] text-slate-500 font-cairo font-semibold">
                        {r.municipality}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-cairo font-black text-slate-950 mb-2 line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-cairo mt-1">
                    أُنجزت المعالجة في{' '}
                    {r.updated_at
                      ? new Date(r.updated_at).toLocaleDateString('ar-SY')
                      : 'تاريخ غير متاح'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-500 font-cairo font-semibold">
                لا توجد بلاغات محلولة متاحة للعرض حالياً.
              </div>
            )}
          </div>
        </div>
      </div>

      
      <div className="bg-slate-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-cairo font-black text-slate-950 tracking-tightest leading-tight">
              لماذا المنصة الموحدة؟
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-cairo font-medium max-w-3xl mx-auto leading-relaxed">
              بنية تحتية رقمية متطورة تضع المواطن في قلب القرار الخدمي الحكومي.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${i * 150}ms` }}>
              <Card hoverable className="group !p-5 sm:!p-6 lg:!p-7 !rounded-xl sm:!rounded-2xl bg-white border border-slate-200 hover:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                
                <div className="mb-4 sm:mb-5 flex justify-center relative">
                  <div className={`${f.color} w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-lg sm:rounded-xl flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl text-white shadow-md group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 relative z-10`}>
                    {f.icon}
                  </div>
                  <div className={`absolute inset-0 ${f.color} opacity-0 group-hover:opacity-20 blur-xl rounded-full transition-opacity duration-300`}></div>
                </div>

                
                <div className="space-y-3 sm:space-y-4 flex-grow relative z-10">
                  
                  <div className="flex justify-center">
                    <span className="inline-block text-xs font-cairo font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                      {f.badge}
                    </span>
                  </div>

                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-cairo font-black text-slate-950 tracking-tightest leading-tight text-center group-hover:text-primary transition-colors duration-300">
                    {f.title}
                  </h3>

                  
                  <ul className="space-y-2.5 text-right">
                    {f.description.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 group/item">
                        <span className={`${f.color} w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300`}></span>
                        <span className="text-sm sm:text-base text-gray-700 font-cairo font-medium leading-relaxed flex-1 group-hover:text-slate-800 transition-colors">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                
                <div className={`mt-4 sm:mt-5 h-0.5 ${f.color} opacity-20 group-hover:opacity-60 group-hover:h-1 transition-all duration-300 rounded-full`}></div>
              </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-900 via-slate-950 to-primary-950 py-16 sm:py-20 lg:py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -ml-[300px] -mt-[300px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] -mr-[250px] -mb-[250px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="space-y-8 sm:space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm sm:text-base font-cairo font-bold text-white uppercase tracking-wider">
                منصة نشطة ومتاحة 24/7
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cairo font-black tracking-tightest leading-tight text-white">
              ابدأ الآن <br />
              <span className="text-primary-300">وساهم في تحسين</span> <br />
              خدمات مدينتك
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-cairo font-medium leading-relaxed max-w-3xl mx-auto">
              سجل حسابك الآن وابدأ في تقديم البلاغات وتتبع حالة معالجتها. صوتك مهم ومحسوب في تطوير الخدمات العامة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/register">
                <Button size="xl" className="!bg-white !text-slate-950 hover:!bg-primary hover:!text-white shadow-2xl hover:shadow-primary/50 transition-all duration-300 !font-black !px-10 !py-6 !rounded-2xl">
                  إنشاء حساب جديد 🚀
                </Button>
              </Link>
              <Link href="/transparency">
                <Button variant="outline" size="xl" className="!border-white/30 !text-white hover:!bg-white hover:!text-slate-950 transition-all duration-300 !font-bold !px-10 !py-6 !rounded-2xl backdrop-blur-sm">
                  استكشف الشفافية 📊
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="font-cairo font-semibold text-gray-300">تسجيل مجاني</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <span className="font-cairo font-semibold text-gray-300">آمن ومشفّر</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="font-cairo font-semibold text-gray-300">استجابة سريعة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </MainLayout>
  );
}
